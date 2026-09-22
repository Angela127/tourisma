import dns from 'node:dns';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Force Node.js to prefer IPv4. Prevents 'socket disconnected' / 'wsasend' errors on networks with unstable IPv6 routes to Google APIs
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {}

export interface GoogleCreds {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  [key: string]: any;
}

let lastCredsKey = '';
let cachedCreds: GoogleCreds | null = null;
let cachedAccessToken: string | null = null;
let tokenExpiresAt = 0;

export function getGoogleCreds(): GoogleCreds {
  let rawContent = '';

  // 1. Check GOOGLE_CREDENTIALS environment variable (JSON string or base64 encoded)
  const envCreds =
    process.env.GOOGLE_CREDENTIALS ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON ||
    process.env.GCP_SERVICE_ACCOUNT_KEY;

  if (envCreds) {
    rawContent = envCreds.trim();
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const p = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    if (fs.existsSync(p)) {
      rawContent = fs.readFileSync(p, 'utf8');
    }
  } else {
    const defaultPath = path.resolve(process.cwd(), 'credentials', 'google.json');
    if (fs.existsSync(defaultPath)) {
      rawContent = fs.readFileSync(defaultPath, 'utf8');
    }
  }

  if (!rawContent) {
    throw new Error(
      'Google credentials not found. In Vercel, add an Environment Variable named GOOGLE_CREDENTIALS with the content of your google.json file.'
    );
  }

  // Invalidate cached token if credentials have been updated
  if (rawContent !== lastCredsKey || !cachedCreds) {
    let parsed: any;
    try {
      if (rawContent.startsWith('{')) {
        parsed = JSON.parse(rawContent);
      } else {
        const decoded = Buffer.from(rawContent, 'base64').toString('utf8');
        parsed = JSON.parse(decoded);
      }
      if (parsed && parsed.private_key) {
        parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
      }
      cachedCreds = parsed;
      lastCredsKey = rawContent;
      cachedAccessToken = null;
      tokenExpiresAt = 0;
    } catch (err: any) {
      throw new Error(`Failed to parse Google credentials: ${err.message}`);
    }
  }

  return cachedCreds!;
}

export async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
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

export async function getGoogleAccessToken(forceRefresh = false): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (!forceRefresh && cachedAccessToken && now < tokenExpiresAt - 120) {
    return cachedAccessToken;
  }

  const creds = getGoogleCreds();

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

export async function parseBody(req: any): Promise<any> {
  if (req.body) {
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
    return req.body;
  }

  return new Promise((resolve) => {
    let bodyRaw = '';
    req.on('data', (chunk: any) => (bodyRaw += chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(bodyRaw || '{}'));
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

export function sendJson(res: any, statusCode: number, data: any) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    res.status(statusCode).json(data);
  } else {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  }
}

export function readCacheFile(subPath: string): Record<string, any> {
  try {
    const localPath = path.resolve(process.cwd(), subPath);
    if (fs.existsSync(localPath)) {
      return JSON.parse(fs.readFileSync(localPath, 'utf8'));
    }
  } catch {}
  try {
    const tmpPath = path.resolve('/tmp', path.basename(subPath));
    if (fs.existsSync(tmpPath)) {
      return JSON.parse(fs.readFileSync(tmpPath, 'utf8'));
    }
  } catch {}
  return {};
}

export function writeCacheFile(subPath: string, data: Record<string, any>): void {
  // Try local first
  try {
    const localPath = path.resolve(process.cwd(), subPath);
    const dir = path.dirname(localPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(localPath, JSON.stringify(data, null, 2), 'utf8');
    return;
  } catch {}

  // Fallback to /tmp in serverless environment
  try {
    const tmpPath = path.resolve('/tmp', path.basename(subPath));
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
  } catch {}
}

export function aggregateEvidence(
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
