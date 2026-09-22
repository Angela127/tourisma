import {
  getGoogleCreds,
  getGoogleAccessToken,
  fetchWithRetry,
  parseBody,
  sendJson,
} from './_shared';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method Not Allowed' });
  }

  try {
    const body = await parseBody(req);
    const userPrompt = body.prompt || body.message;
    const history = body.history || [];

    if (!userPrompt || typeof userPrompt !== 'string') {
      return sendJson(res, 400, { error: 'Prompt is required' });
    }

    const creds = getGoogleCreds();
    let accessToken = await getGoogleAccessToken();

    const systemInstruction = `You are Compass, the official Tourisma Decision Engine AI Copilot, an advanced spatial and strategic tourism intelligence platform for Malaysia.
Your role is to empower tourism policymakers, urban planners, state authorities, and tourism investment boards to make data-driven decisions.

CRITICAL DOMAIN RESTRICTIONS & GUARDRAILS:
1. You ONLY answer questions directly related to the Tourisma system, Malaysia tourism, spatial intelligence, destination analytics, tourism infrastructure (such as healthcare access, accommodation capacity, transport corridors, protected ecological reserves, heritage assets), and tourism planning or policy in Malaysia.
2. If an inquiry, prompt, or question is NOT directly related to the Tourisma system or Malaysian tourism planning (for example: money laundering, financial crime, general programming, trivia, general definitions, unrelated finance/crypto, health diagnoses, entertainment, etc.):
   - DO NOT answer the question.
   - DO NOT provide general definitions, explanations, historical context, or informational summaries for the unrelated topic under ANY circumstances.
   - Politely and concisely decline to answer. State clearly: "As Compass, the Tourisma Decision Engine Copilot, my expertise is strictly restricted to Malaysia tourism intelligence, destination analytics, and spatial planning. I cannot assist with topics outside this domain."
   - Suggest relevant Malaysian tourism topics they can explore instead (e.g., destination diagnosis, regional healthcare access, accommodation density, or ecological buffer analysis).

When analyzing any valid destination, state, sector, or national tourism inquiry, you MUST synthesize your answer using the official Tourisma 4-step Decision Framework:

### 1. Tourism Diagnosis ("What is happening?")
- Clear executive summary of the current operating situation, visitor demand velocity, and infrastructure dynamics.

### 2. Key Pressure Areas ("Where is the problem?")
- Pinpoint specific spatial hotspots, infrastructure bottlenecks (e.g. healthcare catchment deficits, bed occupancy stress, lodging concentration, ecological buffer encroachment).

### 3. Evidence ("Why does Tourisma say this?")
- Cite concrete Tourisma spatial metrics, official MOH healthcare statistics (e.g. 5km primary care access rates, bed occupancy rate BOR), accommodation capacity limits, or protected park buffer data.

### 4. Planning Focus ("What should planners investigate?")
- Direct actionable recommendations for state planners, infrastructure intervention priorities, or policy mitigations.

Format your responses with clear markdown, bold key figures, and concise bullet points. Be professional, analytical, and authoritative.`;

    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    // Add previous conversational context if provided
    if (Array.isArray(history) && history.length > 0) {
      for (const msg of history.slice(-6)) {
        if (msg.role === 'user' || msg.role === 'model') {
          contents.push({
            role: msg.role,
            parts: [{ text: msg.text }],
          });
        }
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: userPrompt }],
    });

    const vertexUrl = `https://us-central1-aiplatform.googleapis.com/v1/projects/${creds.project_id}/locations/us-central1/publishers/google/models/gemini-2.5-flash:generateContent`;

    const requestPayload = {
      system_instruction: {
        parts: [{ text: systemInstruction }],
      },
      contents,
      generation_config: {
        temperature: 0.35,
        max_output_tokens: 1800,
        top_p: 0.9,
      },
    };

    let vertexRes = await fetchWithRetry(vertexUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    });

    // If token expired, refresh and retry once
    if (vertexRes.status === 401) {
      console.warn('[Decision Engine] Received 401, refreshing token and retrying...');
      accessToken = await getGoogleAccessToken(true);
      vertexRes = await fetchWithRetry(vertexUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });
    }

    if (!vertexRes.ok) {
      const errBody = await vertexRes.text();
      let cleanMsg = `Vertex AI error (${vertexRes.status}): ${errBody}`;
      try {
        const errJson = JSON.parse(errBody);
        if (errJson.error?.message) {
          cleanMsg = errJson.error.message;
        }
      } catch {}
      return sendJson(res, vertexRes.status, {
        error: cleanMsg,
      });
    }

    const data = (await vertexRes.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const candidateText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'No response generated by Tourisma Decision Engine.';

    return sendJson(res, 200, {
      response: candidateText,
      model: 'gemini-2.5-flash',
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Decision Engine API error:', errorMsg);
    return sendJson(res, 500, { error: errorMsg });
  }
}
