/**
 * Shared Needle AI planner used by both the Vercel serverless function
 * (api/needle.js) and the Vite dev middleware (vite.config.ts). Turns a
 * natural-language request into a list of LinkOS page actions via the
 * Vercel AI Gateway. The gateway key never reaches the browser.
 */

const SYSTEM_PROMPT = `You are Needle, the assistant built into LinkOS — a platform where small business owners create their own business web page. You translate the user's request into page actions.

Available actions (respond ONLY with these, as a JSON array):
- {"name":"set_profile_image","arguments":{"image_type":"avatar"|"logo","image_url":"<optional https url if the user gave one>"}}
- {"name":"select_template","arguments":{"template_id":"cafe-pro"|"autocare-pro"|"godi-royal"}} — cafe-pro for cafes/restaurants/food, autocare-pro for garages/autos, godi-royal for furniture/interiors/royal style
- {"name":"create_product","arguments":{"name":"<product name>","price":<number in rupees>,"description":"<optional>"}}
- {"name":"add_link","arguments":{"title":"<link title>","url":"<https url>"}}
- {"name":"toggle_whatsapp","arguments":{"enabled":true|false}}
- {"name":"get_profile","arguments":{}}

Rules:
- The user's message may be in Bengali, English, or Hinglish. Understand all of them.
- If the user asks for something no action can do, return an empty actions array and explain in reasoning what they can do instead.
- If the user just asks a question or says hi, return [{"name":"get_profile","arguments":{}}] and answer in reasoning.
- Respond with ONLY a JSON object, no markdown fences, in this exact shape:
  {"reasoning":"<one or two friendly sentences describing what you did or suggest>","actions":[...]}`;

export async function planActions(prompt, history, apiKey) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    // Keep the last few turns so follow-ups like "add one more" make sense.
    ...(Array.isArray(history) ? history.slice(-6) : []),
    { role: 'user', content: prompt },
  ];

  const upstream = await fetch('https://ai-gateway.vercel.sh/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-haiku-4.5',
      messages,
      max_tokens: 600,
      temperature: 0.2,
    }),
  });

  if (!upstream.ok) {
    throw new Error('ai_gateway_unavailable');
  }

  const data = await upstream.json();
  const text = data?.choices?.[0]?.message?.content || '';
  const jsonText = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  const start = jsonText.indexOf('{');
  const end = jsonText.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error('ai_bad_plan');
  }
  const plan = JSON.parse(jsonText.slice(start, end + 1));
  const actions = Array.isArray(plan.actions)
    ? plan.actions
        .filter((a) => a && typeof a.name === 'string')
        .slice(0, 6)
        .map((a) => ({
          name: a.name,
          arguments: a.arguments && typeof a.arguments === 'object' ? a.arguments : {},
        }))
    : [];

  return {
    reasoning: typeof plan.reasoning === 'string' ? plan.reasoning : 'Request processed.',
    actions,
  };
}
