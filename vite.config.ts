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

      // ----------------------------------------------------------------------
      // Visitor-Perceived Infrastructure Quality via Google Places + Gemini
      // ----------------------------------------------------------------------
      server.middlewares.use('/api/places/visitor-quality', async (req, res) => {
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
            const query = (body.query || body.name || '').trim();
            let placeId = (body.placeId || '').trim();
            const stateName = (body.stateName || '').trim();

            if (!query && !placeId) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Either query or placeId is required' }));
              return;
            }

            const cacheFile = path.resolve(process.cwd(), '.cache', 'places_visitor_quality.json');
            let cacheMap: Record<string, any> = {};
            try {
              if (fs.existsSync(cacheFile)) {
                cacheMap = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
              }
            } catch {}

            const cacheKey = (placeId || query).toLowerCase();
            if (cacheMap[cacheKey]) {
              res.statusCode = 200;
              res.end(JSON.stringify({ ...cacheMap[cacheKey], fromCache: true }));
              return;
            }

            const credsPath = path.resolve(process.cwd(), 'credentials', 'google.json');
            const creds: GoogleCreds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
            let accessToken = await getGoogleAccessToken(credsPath);

            // Step 1: Text Search to get place_id if not supplied
            if (!placeId) {
              const searchText = `${query} ${stateName} Malaysia`.trim();
              const searchRes = await fetchWithRetry('https://places.googleapis.com/v1/places:searchText', {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                  'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location',
                  'X-Goog-User-Project': creds.project_id,
                },
                body: JSON.stringify({
                  textQuery: searchText,
                  languageCode: 'en',
                }),
              });

              if (!searchRes.ok) {
                const errText = await searchRes.text();
                throw new Error(`Google Places Text Search failed (${searchRes.status}): ${errText}`);
              }

              const searchData = (await searchRes.json()) as { places?: Array<{ id: string }> };
              if (!searchData.places || searchData.places.length === 0) {
                res.statusCode = 404;
                res.end(
                  JSON.stringify({
                    error: `No Google Place found for "${query}"`,
                    place: null,
                  })
                );
                return;
              }
              placeId = searchData.places[0].id;
            }

            // Step 2: Fetch Place Details with Reviews
            const detailRes = await fetchWithRetry(`https://places.googleapis.com/v1/places/${placeId}`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,rating,userRatingCount,reviews',
                'X-Goog-User-Project': creds.project_id,
              },
            });

            if (!detailRes.ok) {
              const errText = await detailRes.text();
              throw new Error(`Google Places Details failed (${detailRes.status}): ${errText}`);
            }

            const detailData = (await detailRes.json()) as {
              id: string;
              displayName?: { text?: string };
              formattedAddress?: string;
              location?: { latitude?: number; longitude?: number };
              rating?: number;
              userRatingCount?: number;
              reviews?: Array<{
                authorAttribution?: { displayName?: string; photoUri?: string; uri?: string };
                rating?: number;
                relativePublishTimeDescription?: string;
                text?: { text?: string };
              }>;
            };

            const placeName = detailData.displayName?.text || query;
            const address = detailData.formattedAddress || '';
            const rating = detailData.rating || 0;
            const userRatingCount = detailData.userRatingCount || 0;
            const rawReviews = detailData.reviews || [];

            // Step 3: Format reviews with explicit reviewId audit trail
            const formattedReviews = rawReviews.map((r, idx) => ({
              reviewId: `rev_${idx + 1}`,
              author: r.authorAttribution?.displayName || 'Google Reviewer',
              authorPhotoUri: r.authorAttribution?.photoUri || '',
              authorUri: r.authorAttribution?.uri || '',
              rating: r.rating || 5,
              date: r.relativePublishTimeDescription || '',
              originalText: r.text?.text || '',
            }));

            // If no reviews exist, return empty dimension structure
            if (formattedReviews.length === 0) {
              const emptyPayload = {
                place: { id: placeId, name: placeName, address, rating, userRatingCount },
                dimensions: aggregateEvidence([], { evidence: [], aiInsight: 'No text reviews currently returned for this destination.' }).dimensions,
                totalMentions: 0,
                aiInsight: 'No text reviews currently returned by Google Places API for this destination.',
                reviews: [],
                cachedAt: new Date().toISOString(),
              };
              res.statusCode = 200;
              res.end(JSON.stringify(emptyPayload));
              return;
            }

            // Step 4: Classify reviews into the 6 infrastructure dimensions using Gemini 2.5 Flash
            const systemInstruction = `You are an expert infrastructure auditor for Tourisma, evaluating visitor-perceived infrastructure quality at destinations in Malaysia.
Your task is to analyze visitor reviews and identify all statements discussing physical infrastructure conditions across EXACTLY these 6 dimensions:
1. accessibility: road condition, traffic ingress, congestion on approach road, parking ingress, public transit, steepness, walking steps/paths
2. parking: parking availability, congestion, ease of finding parking, parking fees
3. facilities: restrooms/toilets, directional signage, seating, shade, lighting, incline lifts/trams/cable cars, cleanliness of restrooms
4. cleanliness: rubbish, litter, grounds maintenance, environmental hygiene
5. crowding: queues, waiting times, overcrowding at bottleneck locations
6. services: restaurants, food stalls, souvenir shops, ticketing counters, visitor info desk

CRITICAL AUDIT REQUIREMENTS:
1. "exactQuote": You MUST extract an EXACT, VERBATIM substring copied directly from the review's originalText. DO NOT rewrite, paraphrase, or hallucinate words.
2. "sentiment": Must be strictly "positive", "negative", or "mixed".
3. "reviewId": Must be the exact reviewId (e.g. "rev_1") where that quote appears.
4. "aiInsight": Provide a 2-3 sentence executive synthesis explaining the key physical infrastructure strengths and bottlenecks observed across the reviews.
5. If a review discusses multiple dimensions, output a separate evidence item for each dimension. If a dimension is not discussed, do not generate an item for it.

Respond strictly in valid JSON conforming to this schema:
{
  "evidence": [
    {
      "reviewId": "rev_1",
      "dimension": "accessibility" | "parking" | "facilities" | "cleanliness" | "crowding" | "services",
      "sentiment": "positive" | "negative" | "mixed",
      "exactQuote": "verbatim substring sentence from originalText"
    }
  ],
  "aiInsight": "2-3 sentence analytical summary for tourism authorities"
}`;

            const vertexUrl = `https://us-central1-aiplatform.googleapis.com/v1/projects/${creds.project_id}/locations/us-central1/publishers/google/models/gemini-2.5-flash:generateContent`;

            const requestPayload = {
              system_instruction: { parts: [{ text: systemInstruction }] },
              contents: [{ role: 'user', parts: [{ text: JSON.stringify(formattedReviews, null, 2) }] }],
              generation_config: {
                temperature: 0.1,
                response_mime_type: 'application/json',
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

            if (vertexRes.status === 401) {
              console.warn('[Places API] Received 401, refreshing token and retrying...');
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
              throw new Error(`Vertex AI error (${vertexRes.status}): ${errBody}`);
            }

            const geminiData = (await vertexRes.json()) as {
              candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
            };
            const geminiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
            let parsedGemini: { evidence?: Array<any>; aiInsight?: string } = {};
            try {
              parsedGemini = JSON.parse(geminiText);
            } catch (pErr) {
              console.error('[Places API] Failed to parse Gemini response:', geminiText);
            }

            // Step 5: Aggregate mentions into defensible metrics & fraction headlines
            const aggregated = aggregateEvidence(formattedReviews, parsedGemini);

            const payload = {
              place: {
                id: placeId,
                name: placeName,
                address,
                rating,
                userRatingCount,
              },
              dimensions: aggregated.dimensions,
              totalMentions: aggregated.totalMentions,
              aiInsight: aggregated.aiInsight,
              reviews: formattedReviews,
              cachedAt: new Date().toISOString(),
            };

            // Cache payload
            try {
              cacheMap[cacheKey] = payload;
              if (placeId) cacheMap[placeId.toLowerCase()] = payload;
              const dir = path.dirname(cacheFile);
              if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
              fs.writeFileSync(cacheFile, JSON.stringify(cacheMap, null, 2), 'utf8');
            } catch (cErr) {
              console.warn('[Places API] Failed to write cache:', cErr);
            }

            res.statusCode = 200;
            res.end(JSON.stringify(payload));
          } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            console.error('Visitor Quality API error:', errorMsg);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: errorMsg }));
          }
        });
      });

      // ----------------------------------------------------------------------
      // Tourism Pressure Scenario Insight via Gemini 2.5 Flash
      // ----------------------------------------------------------------------
      server.middlewares.use('/api/pressure/simulate-insight', async (req, res) => {
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
            const state = (body.state || 'Whole Malaysia').trim();
            const currentVisitors = Number(body.currentVisitors || 23161166);
            const scenarioVisitors = Number(body.scenarioVisitors || 27793399);
            const demandChangePct = Number(body.demandChangePct ?? 20);
            const currentRooms = Number(body.currentRooms || 34323);
            const scenarioRooms = Number(body.scenarioRooms || 34323);
            const currentVtr = Number(body.currentVisitorRoomRatio || 674.8);
            const scenarioVtr = Number(body.scenarioVisitorRoomRatio || 809.8);
            const aorPct = Number(body.aorPct || 75.6);
            const roadAccessRate = Number(body.roadAccessRate || 27.0);
            const ptAccessRate = Number(body.ptAccessRate || 29.2);
            const environmentalExposureRate = Number(body.environmentalExposureRate || 39.6);
            const demandCapacityGapPp = Number(body.demandCapacityGapPp ?? (demandChangePct - (Number(body.capacityChangePct) || 0)));
            const capacityChangePct = Number(body.capacityChangePct || 0);
            const scenarioSource = (body.scenarioSource || 'User-defined').trim();

            const cacheKey = `${state.toLowerCase()}_d${demandChangePct}_c${capacityChangePct}_${scenarioSource.toLowerCase()}`.replace(/[^a-z0-9_]/g, '_');
            const cacheFile = path.resolve(process.cwd(), 'data', 'cache', 'pressure_insights_cache.json');
            let cacheMap: Record<string, any> = {};

            try {
              if (fs.existsSync(cacheFile)) {
                cacheMap = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
                if (cacheMap[cacheKey]) {
                  res.statusCode = 200;
                  res.end(JSON.stringify({ ...cacheMap[cacheKey], cached: true }));
                  return;
                }
              }
            } catch (cErr) {
              console.warn('[Pressure API] Cache read error:', cErr);
            }

            // Structured fallback generator
            const generateFallback = () => {
              const curVisM = (currentVisitors / 1e6).toFixed(2);
              const scenVisM = (scenarioVisitors / 1e6).toFixed(2);
              const signD = demandChangePct >= 0 ? '+' : '';
              const signC = capacityChangePct >= 0 ? '+' : '';
              const signG = demandCapacityGapPp >= 0 ? '+' : '';

              const whatChanges = `Demand changes from ${curVisM}M to ${scenVisM}M (${signD}${demandChangePct.toFixed(1)}%) with room capacity changing by ${signC}${capacityChangePct.toFixed(1)}%, resulting in a Demand–Capacity Gap of ${signG}${demandCapacityGapPp.toFixed(1)} pp.`;
              const whatBecomesMorePressured = capacityChangePct === 0
                ? `With accommodation capacity unchanged, the visitor-to-room ratio increases from ${currentVtr.toFixed(1)} to ${scenarioVtr.toFixed(1)} (${signD}${demandChangePct.toFixed(1)}%). In ${state}, where current observed AOR is ${aorPct.toFixed(1)}% and road accessibility stands at ${roadAccessRate.toFixed(1)}% (PT access: ${ptAccessRate.toFixed(1)}%), peak throughput amplifies corridor strain, alongside potential proximity pressures on the ${environmentalExposureRate.toFixed(1)}% of assets near ecological reserves.`
                : `Under the combined adjustments, the visitor-to-room ratio shifts from ${currentVtr.toFixed(1)} to ${scenarioVtr.toFixed(1)}. With observed AOR at ${aorPct.toFixed(1)}%, the ${signG}${demandCapacityGapPp.toFixed(1)} pp gap indicates relative ${demandCapacityGapPp > 0 ? 'demand surplus over capacity expansion' : 'capacity buffer headroom'}. Existing connectivity constraints (${roadAccessRate.toFixed(1)}% road, ${ptAccessRate.toFixed(1)}% PT access) and ${environmentalExposureRate.toFixed(1)}% environmental proximity require coordinated monitoring.`;

              const whatShouldPlannersInvestigate = [
                `Assess accommodation pipeline and seasonal distribution against the scenario visitor-to-room ratio of ${scenarioVtr.toFixed(1)} (observed AOR: ${aorPct.toFixed(1)}%).`,
                `Monitor primary transit corridors and last-mile accessibility where road connectivity is currently ${roadAccessRate.toFixed(1)}% and PT access is ${ptAccessRate.toFixed(1)}%.`,
                `Safeguard environmental buffers around the ${environmentalExposureRate.toFixed(1)}% of tourism assets situated near protected reserves during high-demand windows.`
              ];

              return {
                whatChanges,
                whatBecomesMorePressured,
                whatShouldPlannersInvestigate,
                source: scenarioSource,
                generatedAt: new Date().toISOString()
              };
            };

            const credsPath = path.resolve(process.cwd(), 'credentials', 'google.json');
            let insight = generateFallback();

            if (fs.existsSync(credsPath)) {
              try {
                const creds: GoogleCreds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
                let accessToken = await getGoogleAccessToken(credsPath);

                const systemInstruction = `You are an expert tourism systems planning analyst working with the Tourisma Spatial Intelligence Platform.
Your role is to interpret which existing constraints become more pronounced under the selected scenario.

CRITICAL GUARDRAILS & METHODOLOGICAL RULES:
1. Identify the most notable changes shown by the supplied data.
2. Do NOT invent causal relationships, arbitrary thresholds, infrastructure failures, or ungrounded statistics.
3. Distinguish observed indicators (current AOR, current accessibility, environmental proximity) from scenario calculations (scenario visitors, scenario VTR, demand-capacity gap).
4. Recommend areas for investigation or monitoring rather than claiming that a destination will fail.
5. Provide your output strictly in JSON format matching this exact schema:
{
  "whatChanges": "A concise 1-2 sentence statement summarizing the demand and capacity shift and resulting demand-capacity gap in pp.",
  "whatBecomesMorePressured": "A factual 2-3 sentence interpretation of which existing physical constraints (VTR, observed AOR, road access, PT access, or reserve proximity) experience amplified strain under this scenario.",
  "whatShouldPlannersInvestigate": [
    "Investigation recommendation 1 focused on accommodation and capacity.",
    "Investigation recommendation 2 focused on transport or accessibility corridors.",
    "Investigation recommendation 3 focused on environmental or spatial monitoring."
  ]
}`;

                const dataPayload = {
                  state,
                  currentVisitors,
                  scenarioVisitors,
                  demandChangePct,
                  currentRooms,
                  scenarioRooms,
                  currentVisitorRoomRatio: currentVtr,
                  scenarioVisitorRoomRatio: scenarioVtr,
                  aorPct,
                  roadAccessRate,
                  ptAccessRate,
                  environmentalExposureRate,
                  demandCapacityGapPp,
                  capacityChangePct,
                  scenarioSource
                };

                const vertexUrl = `https://us-central1-aiplatform.googleapis.com/v1/projects/${creds.project_id}/locations/us-central1/publishers/google/models/gemini-2.5-flash:generateContent`;

                const requestPayload = {
                  system_instruction: { parts: [{ text: systemInstruction }] },
                  contents: [
                    {
                      role: 'user',
                      parts: [
                        {
                          text: `Interpret the following scenario data according to the 3-layer structure:\n${JSON.stringify(dataPayload, null, 2)}`
                        }
                      ]
                    }
                  ],
                  generation_config: {
                    temperature: 0.2,
                    max_output_tokens: 4096,
                    response_mime_type: 'application/json'
                  }
                };

                let vertexRes = await fetchWithRetry(vertexUrl, {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(requestPayload)
                });

                if (vertexRes.status === 401) {
                  console.warn('[Pressure API] Received 401, refreshing token and retrying...');
                  accessToken = await getGoogleAccessToken(credsPath, true);
                  vertexRes = await fetchWithRetry(vertexUrl, {
                    method: 'POST',
                    headers: {
                      Authorization: `Bearer ${accessToken}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestPayload)
                  });
                }

                if (vertexRes.ok) {
                  const vertexJson = await vertexRes.json();
                  const rawText = vertexJson.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (rawText) {
                    let parsed: any = null;
                    try {
                      let cleaned = rawText.trim();
                      if (cleaned.startsWith('```')) {
                        cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
                      }
                      parsed = JSON.parse(cleaned);
                    } catch (_parseErr) {
                      const firstB = rawText.indexOf('{');
                      const lastB = rawText.lastIndexOf('}');
                      if (firstB !== -1 && lastB !== -1 && lastB > firstB) {
                        try {
                          const sub = rawText.substring(firstB, lastB + 1);
                          parsed = JSON.parse(sub);
                        } catch (_subErr) {
                          console.warn('[Pressure API] Failed to parse sanitized AI response text');
                        }
                      }
                    }

                    if (parsed && parsed.whatChanges && parsed.whatBecomesMorePressured && Array.isArray(parsed.whatShouldPlannersInvestigate)) {
                      insight = {
                        whatChanges: parsed.whatChanges,
                        whatBecomesMorePressured: parsed.whatBecomesMorePressured,
                        whatShouldPlannersInvestigate: parsed.whatShouldPlannersInvestigate,
                        source: scenarioSource,
                        generatedAt: new Date().toISOString()
                      };
                    }
                  }
                }
              } catch (aiErr) {
                console.warn('[Pressure API] Gemini interpretation fallback invoked:', aiErr);
              }
            }

            // Cache result
            try {
              cacheMap[cacheKey] = insight;
              const dir = path.dirname(cacheFile);
              if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
              fs.writeFileSync(cacheFile, JSON.stringify(cacheMap, null, 2), 'utf8');
            } catch (cErr) {
              console.warn('[Pressure API] Failed to write cache:', cErr);
            }

            res.statusCode = 200;
            res.end(JSON.stringify(insight));
          } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            console.error('Pressure API error:', errorMsg);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: errorMsg }));
          }
        });
      });
    },
  };
}

// --------------------------------------------------------------------------
// Aggregation Helper for Visitor Perceived Infrastructure Quality
// --------------------------------------------------------------------------
function aggregateEvidence(
  _reviews: Array<any>,
  geminiOutput: { evidence?: Array<any>; aiInsight?: string }
) {
  const dims = ['accessibility', 'parking', 'facilities', 'cleanliness', 'crowding', 'services'] as const;
  const dimNames: Record<string, string> = {
    accessibility: 'Accessibility',
    parking: 'Parking',
    facilities: 'Facilities',
    cleanliness: 'Cleanliness',
    crowding: 'Crowding',
    services: 'Services',
  };

  const aggregated: Record<string, any> = {};
  for (const d of dims) {
    aggregated[d] = {
      dimension: d,
      name: dimNames[d],
      mentions: 0,
      positive: 0,
      mixed: 0,
      negative: 0,
      positivePct: 0,
      mixedPct: 0,
      negativePct: 0,
      evidenceTier: 'unobserved',
      evidenceLabel: 'Unobserved',
      headline: 'Unobserved in available reviews',
      subtext: 'No visitor mentions in sample',
      evidence: [],
    };
  }

  const evidenceList = geminiOutput.evidence || [];
  for (const item of evidenceList) {
    const d = item.dimension?.toLowerCase();
    if (aggregated[d]) {
      const s = item.sentiment?.toLowerCase();
      if (s === 'positive') aggregated[d].positive++;
      else if (s === 'negative') aggregated[d].negative++;
      else if (s === 'mixed') aggregated[d].mixed++;
      aggregated[d].mentions++;
      aggregated[d].evidence.push(item);
    }
  }

  let totalMentions = 0;

  for (const d of dims) {
    const item = aggregated[d];
    totalMentions += item.mentions;
    const m = item.mentions;
    if (m > 0) {
      item.positivePct = Math.round((item.positive / m) * 100);
      item.mixedPct = Math.round((item.mixed / m) * 100);
      item.negativePct = Math.round((item.negative / m) * 100);

      if (m <= 4) {
        item.evidenceTier = 'limited';
        item.evidenceLabel = 'Limited Evidence';
        item.headline = `Limited evidence — ${m} review${m > 1 ? 's' : ''} mention ${item.name.toLowerCase()}`;
        item.subtext = 'Insufficient volume for percentage share';
      } else if (m <= 14) {
        item.evidenceTier = 'moderate';
        item.evidenceLabel = 'Moderate Evidence';
      } else {
        item.evidenceTier = 'strong';
        item.evidenceLabel = 'Strong Evidence';
      }

      if (m >= 5) {
        if (item.negative >= item.positive && item.negative >= item.mixed) {
          item.headline = `${item.negative} of ${m} ${item.name.toLowerCase()} mentions were negative`;
          item.subtext = `${item.negativePct}% negative`;
        } else if (item.positive >= item.negative && item.positive >= item.mixed) {
          item.headline = `${item.positive} of ${m} ${item.name.toLowerCase()} mentions were positive`;
          item.subtext = `${item.positivePct}% positive`;
        } else {
          item.headline = `${item.mixed} of ${m} ${item.name.toLowerCase()} mentions were mixed`;
          item.subtext = `${item.mixedPct}% mixed`;
        }
      }
    }
  }

  return {
    dimensions: aggregated,
    totalMentions,
    aiInsight: geminiOutput.aiInsight || 'Analysis based on available visitor reviews.',
  };
}

export default defineConfig({
  plugins: [decisionEnginePlugin()],
});
