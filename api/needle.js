/**
 * Vercel serverless function: turns a natural-language request into a list of
 * LinkOS page actions using the Vercel AI Gateway. The gateway key stays
 * server-side; the browser only ever talks to this endpoint.
 */
import { planActions } from './needle-core.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ detail: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) {
    res.status(503).json({ detail: 'AI Gateway is not configured' });
    return;
  }

  const { prompt, history } = req.body || {};
  if (!prompt || typeof prompt !== 'string' || prompt.length > 4000) {
    res.status(400).json({ detail: 'A prompt of at most 4000 characters is required' });
    return;
  }

  try {
    const plan = await planActions(prompt, history, apiKey);
    res.status(200).json(plan);
  } catch {
    res.status(502).json({ detail: 'AI Gateway request failed' });
  }
}
