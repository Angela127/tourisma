import { defineConfig, type Plugin } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import dns from 'node:dns';

// Force Node.js to prefer IPv4. Prevents 'socket disconnected' / 'wsasend' errors on networks with unstable IPv6 routes to Google APIs
dns.setDefaultResultOrder('ipv4first');

interface GoogleCreds {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
}

let cachedAccessToken: string | null = null;
let tokenExpiresAt: number = 0;

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 28000);
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timer);
      return res;
    } catch (err: unknown) {
      lastError = err;
      console.warn(`[Decision Engine] Network attempt ${attempt}/${maxRetries} failed: ${(err as Error).message}`);
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
      }
    }
  }
  throw lastError;
}

async function getGoogleAccessToken(credsPath: string, forceRefresh = false): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (!forceRefresh && cachedAccessToken && now < tokenExpiresAt - 120) {
    return cachedAccessToken;
  }

  if (!fs.existsSync(credsPath)) {
    throw new Error(`Google credentials file not found at ${credsPath}`);
  }

  const creds: GoogleCreds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));

  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: creds.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const b64 = (obj: unknown) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const unsignedToken = `${b64(header)}.${b64(payload)}`;

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(unsignedToken);
  const signature = sign.sign(creds.private_key, 'base64url');

  const jwt = `${unsignedToken}.${signature}`;

  const tokenRes = await fetchWithRetry('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }).toString(),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    cachedAccessToken = null;
    throw new Error(`Failed to obtain Google access token: ${errText}`);
  }

  const json = (await tokenRes.json()) as { access_token: string; expires_in?: number };
  if (!json.access_token) {
    cachedAccessToken = null;
    throw new Error('Google OAuth token response missing access_token');
  }

  cachedAccessToken = json.access_token;
  tokenExpiresAt = now + (json.expires_in || 3600);
  return cachedAccessToken;
}

function decisionEnginePlugin(): Plugin {
  return {
    name: 'tourisma-decision-engine-plugin',
    configureServer(server) {
      server.middlewares.use('/api/decision-engine', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let bodyRaw = '';
        req.on('data', (chunk) => (bodyRaw += chunk));
        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json');

          try {
            const body = JSON.parse(bodyRaw || '{}');
            const userPrompt = body.prompt || body.message;
            const history = body.history || [];

            if (!userPrompt || typeof userPrompt !== 'string') {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Prompt is required' }));
              return;
            }

            const credsPath = path.resolve(process.cwd(), 'credentials', 'google.json');
            const creds: GoogleCreds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
            let accessToken = await getGoogleAccessToken(credsPath);

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
              accessToken = await getGoogleAccessToken(credsPath, true);
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
              res.statusCode = vertexRes.status;
              res.end(JSON.stringify({ error: `Vertex AI error (${vertexRes.status}): ${errBody}` }));
              return;
            }

            const data = (await vertexRes.json()) as {
              candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
            };
            const candidateText =
              data.candidates?.[0]?.content?.parts?.[0]?.text ||
              'No response generated by Tourisma Decision Engine.';

            res.statusCode = 200;
            res.end(
              JSON.stringify({
                response: candidateText,
                model: 'gemini-2.5-flash',
                timestamp: new Date().toISOString(),
              })
            );
          } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            console.error('Decision Engine API error:', errorMsg);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: errorMsg }));
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [decisionEnginePlugin()],
});
