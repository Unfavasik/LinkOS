import { supabase } from './supabase';
import { StorageService } from './storage';
import { TEMPLATES } from '../data/templates';
import { Product, LinkItem, Profile } from '../types';
import { fetchNeedleHistory } from './needleChat';

export interface NeedleAction {
  name: string;
  arguments: Record<string, unknown>;
}

export interface NeedleRunResult {
  user_id: string;
  uploaded_image?: { url: string; format: string; image_type: string };
  result: {
    type?: string;
    success?: boolean;
    error?: string | null;
    function_calls?: Array<{ name: string; arguments: Record<string, unknown> }>;
    reasoning?: string;
    confidence?: number;
    results?: unknown[];
    [key: string]: unknown;
  };
}

const needleApiUrl = (import.meta.env.VITE_NEEDLE_API_URL || '').replace(/\/$/, '');

async function accessToken(): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) return null;
    return data.session?.access_token || null;
  } catch {
    return null;
  }
}

async function parseResponse(response: Response, fallback: string): Promise<NeedleRunResult> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof body.detail === 'string' ? body.detail : fallback);
  }
  return body as NeedleRunResult;
}

/**
 * Execute one planned action against the signed-in user's data. Every write
 * goes through StorageService, which records to Supabase.
 */
async function executeAction(
  action: NeedleAction,
  profile: Profile,
  attachedFile: File | undefined,
  uploadedImageInfo: { url: string; format: string; image_type: string } | undefined,
): Promise<{ call: { name: string; arguments: Record<string, unknown> }; result: unknown; reasoning?: string; uploaded?: typeof uploadedImageInfo }> {
  const args = action.arguments || {};

  switch (action.name) {
    case 'set_profile_image': {
      const isLogo = args.image_type === 'logo';
      const imageType = isLogo ? 'logo' : 'avatar';
      let url = typeof args.image_url === 'string' ? args.image_url : '';

      if (attachedFile && !url) {
        url = await StorageService.uploadImage(attachedFile, isLogo ? 'logos' : 'avatars');
        uploadedImageInfo = { url, format: 'webp', image_type: imageType };
      }
      if (!url) url = (isLogo ? profile.logo_url : profile.avatar_url) || '';
      if (!url) {
        return { call: { name: 'set_profile_image', arguments: args }, result: { ok: false, error: 'no image available' } };
      }

      if (imageType === 'logo') {
        profile.logo_url = url;
      } else {
        profile.avatar_url = url;
      }
      await StorageService.saveProfile(profile);
      return {
        call: { name: 'set_profile_image', arguments: { image_url: url, image_type: imageType } },
        result: { ok: true, image_type: imageType, image_url: url },
        reasoning: `Updated your ${imageType} image.`,
        uploaded: uploadedImageInfo,
      };
    }

    case 'select_template': {
      const chosen =
        TEMPLATES.find((t) => t.id === args.template_id) ||
        TEMPLATES.find((t) => t.id === String(args.template_id || '').replace(/-/g, '_')) ||
        TEMPLATES[0];
      profile.template_id = chosen.id;
      profile.theme = chosen.theme;
      profile.accent_color = chosen.accent_color;
      profile.button_style = chosen.button_style;
      profile.font_family = chosen.font_family;
      profile.layout = chosen.layout;
      await StorageService.saveProfile(profile);
      return {
        call: { name: 'select_template', arguments: { template_name: chosen.name } },
        result: { ok: true, template: chosen.id },
        reasoning: `Applied the "${chosen.name}" template to your page.`,
      };
    }

    case 'create_product': {
      const name = typeof args.name === 'string' && args.name.trim() ? args.name.trim() : 'Special Offer';
      const price = typeof args.price === 'number' && args.price > 0 ? args.price : 99;
      const now = new Date().toISOString();
      const newProd: Product = {
        id: `prod_${Date.now()}`,
        profile_id: profile.id,
        name,
        price,
        currency: '₹',
        description: typeof args.description === 'string' ? args.description : 'Added via LinkOS Assistant',
        image_url: '',
        category: 'General',
        available: true,
        featured: false,
        sort_order: 0,
        created_at: now,
        updated_at: now,
      };
      await StorageService.saveProduct(newProd);
      return {
        call: { name: 'create_product', arguments: { name, price } },
        result: { ok: true, product: newProd },
        reasoning: `Added product "${name}" at ₹${price} to your storefront.`,
      };
    }

    case 'add_link': {
      const title = typeof args.title === 'string' && args.title.trim() ? args.title.trim() : 'Website';
      const url = typeof args.url === 'string' && /^https?:\/\//i.test(args.url) ? args.url : 'https://instagram.com/mybusiness';
      const newLink: LinkItem = {
        id: `link_${Date.now()}`,
        profile_id: profile.id,
        title,
        url,
        icon: 'link',
        is_active: true,
        sort_order: 0,
        created_at: new Date().toISOString(),
      };
      await StorageService.saveLink(newLink);
      return {
        call: { name: 'add_link', arguments: { title, url } },
        result: { ok: true, link: newLink },
        reasoning: `Added new link "${title}" pointing to ${url}.`,
      };
    }

    case 'toggle_whatsapp': {
      const enable = args.enabled !== false;
      profile.whatsapp_enabled = enable;
      await StorageService.saveProfile(profile);
      return {
        call: { name: 'toggle_whatsapp', arguments: { enabled: enable } },
        result: { ok: true, whatsapp_enabled: enable },
        reasoning: `${enable ? 'Enabled' : 'Disabled'} WhatsApp direct contact on your page.`,
      };
    }

    case 'get_profile':
    default: {
      return {
        call: { name: action.name === 'get_profile' ? 'get_profile' : action.name, arguments: args },
        result: { ok: true, profile },
      };
    }
  }
}

/** Strips filler words like "called"/"named" that leak into captured names. */
function stripNameFillers(raw: string): string {
  return raw.replace(/^(?:called|named|titled)\s+/i, '').trim();
}

/**
 * Client-side keyword executor when the AI planner is unreachable. Keeps all
 * Quick Actions and commands functional offline.
 */
function keywordActions(prompt: string): NeedleAction[] {
  const text = prompt.toLowerCase();
  const actions: NeedleAction[] = [];

  if (text.includes('avatar') || text.includes('logo') || text.includes('image')) {
    actions.push({ name: 'set_profile_image', arguments: { image_type: text.includes('logo') || text.includes('brand') ? 'logo' : 'avatar' } });
  }
  if (text.includes('template') || text.includes('theme') || text.includes('style')) {
    const templateId =
      text.includes('garage') || text.includes('auto') || text.includes('car') || text.includes('bike')
        ? 'autocare-pro'
        : text.includes('godi') || text.includes('seat') || text.includes('royal') || text.includes('interior')
          ? 'godi-royal'
          : 'cafe-pro';
    actions.push({ name: 'select_template', arguments: { template_id: templateId } });
  }
  if (text.includes('product') || text.includes('item') || text.includes('rupees') || text.includes('price')) {
    const priceMatch = prompt.match(/(?:for|at|rs\.?|₹|\$)\s*(\d+(?:\.\d+)?)/i) || prompt.match(/(\d+(?:\.\d+)?)\s*(?:rupees|rs|inr|\$)/i);
    const nameMatch = prompt.match(/called\s+([^,.\n]+?)(?:\s+for|\s+at|\s+priced|\.|$)/i) || prompt.match(/product\s+([^,.\n]+?)(?:\s+for|\s+at|\s+priced|\.|$)/i);
    actions.push({
      name: 'create_product',
      arguments: {
        name: nameMatch ? stripNameFillers(nameMatch[1]) : 'Special Offer',
        price: priceMatch ? parseFloat(priceMatch[1]) : 99,
      },
    });
  }
  if (text.includes('link') || text.includes('url') || text.includes('instagram') || text.includes('website')) {
    const urlMatch = prompt.match(/https?:\/\/[^\s"']+/i);
    const titleMatch =
      prompt.match(/titled\s+([^,.\n]+?)(?:\s+with|\s+to|\.|$)/i) ||
      prompt.match(/called\s+([^,.\n]+?)(?:\s+with|\s+to|\.|$)/i) ||
      prompt.match(/link\s+([^,.\n]+?)(?:\s+with|\s+to|\.|$)/i);
    actions.push({
      name: 'add_link',
      arguments: {
        title: titleMatch ? stripNameFillers(titleMatch[1]) : text.includes('instagram') ? 'Instagram' : 'Website',
        url: urlMatch ? urlMatch[0] : 'https://instagram.com/mybusiness',
      },
    });
  }
  if (text.includes('whatsapp')) {
    actions.push({ name: 'toggle_whatsapp', arguments: { enabled: !text.includes('disable') && !text.includes('off') } });
  }

  return actions;
}

async function runNeedleLocal(prompt: string, attachedFile?: File): Promise<NeedleRunResult> {
  const user = StorageService.getActiveUser() || { id: 'demo_user', email: 'demo@linkos.dev' };
  let profile = await StorageService.getCurrentUserProfile();
  if (!profile) {
    profile = StorageService.loginDemoUser();
  }

  const actions = keywordActions(prompt);
  const functionCalls: Array<{ name: string; arguments: Record<string, unknown> }> = [];
  const results: unknown[] = [];
  const reasoningParts: string[] = [];
  let uploadedImageInfo: { url: string; format: string; image_type: string } | undefined;

  for (const action of actions) {
    const out = await executeAction(action, profile, attachedFile, uploadedImageInfo);
    functionCalls.push(out.call);
    results.push(out.result);
    if (out.reasoning) reasoningParts.push(out.reasoning);
    if (out.uploaded) uploadedImageInfo = out.uploaded;
  }

  if (functionCalls.length === 0) {
    const out = await executeAction({ name: 'get_profile', arguments: {} }, profile, attachedFile, uploadedImageInfo);
    functionCalls.push(out.call);
    results.push(out.result);
    reasoningParts.push(
      `Loaded your profile "${profile.business_name || 'Business'}". You can change templates, attach an image, or add products and links anytime.`,
    );
  }

  return {
    user_id: user.id,
    ...(uploadedImageInfo ? { uploaded_image: uploadedImageInfo } : {}),
    result: {
      type: 'call',
      success: true,
      confidence: 0.98,
      function_calls: functionCalls,
      results,
      reasoning: reasoningParts.join(' '),
    },
  };
}

/** Ask the server-side AI planner for an action plan, then execute it locally. */
async function runNeedleAI(prompt: string, attachedFile?: File): Promise<NeedleRunResult | null> {
  try {
    // Recent turns give the model context for follow-ups like "add one more".
    const user = StorageService.getActiveUser();
    const history = user
      ? (await fetchNeedleHistory(user.id, 6))
          .filter((t) => t.prompt)
          .map((t) => ({
            role: t.role === 'assistant' ? 'assistant' : 'user',
            content: t.role === 'assistant' ? String(t.response?.reasoning || t.prompt || '') : String(t.prompt),
          }))
      : [];

    const response = await fetch(`/api/needle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, history }),
    });
    if (!response.ok) return null;
    const plan = (await response.json()) as { reasoning?: string; actions?: NeedleAction[] };
    if (!Array.isArray(plan.actions)) return null;

    const execUser = StorageService.getActiveUser() || { id: 'demo_user', email: 'demo@linkos.dev' };
    let profile = await StorageService.getCurrentUserProfile();
    if (!profile) {
      profile = StorageService.loginDemoUser();
    }

    const functionCalls: Array<{ name: string; arguments: Record<string, unknown> }> = [];
    const results: unknown[] = [];
    let uploadedImageInfo: { url: string; format: string; image_type: string } | undefined;

    for (const action of plan.actions) {
      const out = await executeAction(action, profile, attachedFile, uploadedImageInfo);
      functionCalls.push(out.call);
      results.push(out.result);
      if (out.uploaded) uploadedImageInfo = out.uploaded;
    }

    return {
      user_id: execUser.id,
      ...(uploadedImageInfo ? { uploaded_image: uploadedImageInfo } : {}),
      result: {
        type: 'call',
        success: true,
        confidence: 0.95,
        function_calls: functionCalls,
        results,
        reasoning: plan.reasoning || 'Request processed.',
      },
    };
  } catch {
    return null;
  }
}

export async function runNeedle(prompt: string): Promise<NeedleRunResult> {
  if (needleApiUrl) {
    try {
      const token = await accessToken();
      if (token) {
        const response = await fetch(`${needleApiUrl}/v1/needle/run`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
        });
        if (response.ok) {
          return await parseResponse(response, 'Needle request failed.');
        }
      }
    } catch {
      // Fall through to the AI planner / local execution
    }
  }
  const aiResult = await runNeedleAI(prompt);
  if (aiResult) return aiResult;
  return runNeedleLocal(prompt);
}

export async function runNeedleWithImage(prompt: string, image: File): Promise<NeedleRunResult> {
  if (needleApiUrl) {
    try {
      const token = await accessToken();
      if (token) {
        const form = new FormData();
        form.append('prompt', prompt);
        form.append('image', image, image.name);
        const response = await fetch(`${needleApiUrl}/v1/needle/run-with-image`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });
        if (response.ok) {
          return await parseResponse(response, 'Needle image request failed.');
        }
      }
    } catch {
      // Fall through to the AI planner / local execution
    }
  }
  const aiResult = await runNeedleAI(prompt, image);
  if (aiResult) return aiResult;
  return runNeedleLocal(prompt, image);
}
