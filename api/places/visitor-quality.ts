import {
  getGoogleCreds,
  getGoogleAccessToken,
  fetchWithRetry,
  parseBody,
  sendJson,
  readCacheFile,
  writeCacheFile,
  aggregateEvidence,
} from '../_shared';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method Not Allowed' });
  }

  try {
    const body = await parseBody(req);
    const query = (body.query || body.name || '').trim();
    let placeId = (body.placeId || '').trim();
    const stateName = (body.stateName || '').trim();

    if (!query && !placeId) {
      return sendJson(res, 400, { error: 'Either query or placeId is required' });
    }

    const cacheRelPath = '.cache/places_visitor_quality.json';
    const cacheMap = readCacheFile(cacheRelPath);
    const cacheKey = (placeId || query).toLowerCase();

    if (cacheMap[cacheKey]) {
      return sendJson(res, 200, { ...cacheMap[cacheKey], fromCache: true });
    }

    const creds = getGoogleCreds();
    let accessToken = await getGoogleAccessToken();

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
        let clean = `Google Places Text Search failed (${searchRes.status}): ${errText}`;
        try {
          const j = JSON.parse(errText);
          if (j.error?.message) clean = j.error.message;
        } catch {}
        throw new Error(clean);
      }

      const searchData = (await searchRes.json()) as { places?: Array<{ id: string }> };
      if (!searchData.places || searchData.places.length === 0) {
        return sendJson(res, 404, {
          error: `No Google Place found for "${query}"`,
          place: null,
        });
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
      let clean = `Google Places Details failed (${detailRes.status}): ${errText}`;
      try {
        const j = JSON.parse(errText);
        if (j.error?.message) clean = j.error.message;
      } catch {}
      throw new Error(clean);
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
      return sendJson(res, 200, emptyPayload);
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
    cacheMap[cacheKey] = payload;
    if (placeId) cacheMap[placeId.toLowerCase()] = payload;
    writeCacheFile(cacheRelPath, cacheMap);

    return sendJson(res, 200, payload);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Visitor Quality API error:', errorMsg);
    return sendJson(res, 500, { error: errorMsg });
  }
}
