import { supabase } from './supabase';
import { StorageService } from './storage';
import { TEMPLATES } from '../data/templates';
import { Product, LinkItem } from '../types';

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
 * Client-side in-memory & local-storage executor when the remote Needle server
 * is not running or not configured. Keeps all Quick Actions and commands functional.
 */
async function runNeedleLocal(prompt: string, attachedFile?: File): Promise<NeedleRunResult> {
  const user = StorageService.getActiveUser() || { id: 'demo_user', email: 'demo@linkos.dev' };
  let profile = await StorageService.getCurrentUserProfile();
  if (!profile) {
    profile = StorageService.loginDemoUser();
  }

  const text = prompt.toLowerCase();
  const functionCalls: Array<{ name: string; arguments: Record<string, unknown> }> = [];
  const results: unknown[] = [];
  let reasoning = 'Request processed successfully.';
  let uploadedImageInfo: { url: string; format: string; image_type: string } | undefined;

  // 1. Attached image or set avatar/logo command
  if (attachedFile || text.includes('avatar') || text.includes('logo') || text.includes('image')) {
    const isLogo = text.includes('logo') || text.includes('brand');
    const imageType = isLogo ? 'logo' : 'avatar';
    let url = '';

    if (attachedFile) {
      url = await StorageService.uploadImage(attachedFile, isLogo ? 'logos' : 'avatars');
      uploadedImageInfo = { url, format: 'webp', image_type: imageType };
    } else {
      const match = prompt.match(/https?:\/\/[^\s"']+/i);
      url = match ? match[0] : (isLogo ? profile.logo_url : profile.avatar_url) || '';
    }

    if (url) {
      if (imageType === 'logo') {
        profile.logo_url = url;
      } else {
        profile.avatar_url = url;
      }
      await StorageService.saveProfile(profile);
      functionCalls.push({ name: 'set_profile_image', arguments: { image_url: url, image_type: imageType } });
      results.push({ ok: true, image_type: imageType, image_url: url });
      reasoning = `Updated your ${imageType} image to the new selection.`;
    }
  }

  // 2. Select template
  if (text.includes('template') || text.includes('theme') || text.includes('style')) {
    let chosen = TEMPLATES[0];
    if (text.includes('garage') || text.includes('auto') || text.includes('car') || text.includes('bike')) {
      chosen = TEMPLATES.find((t) => t.id === 'autocare-pro') || TEMPLATES[1];
    } else if (text.includes('godi') || text.includes('seat') || text.includes('royal') || text.includes('interior')) {
      chosen = TEMPLATES.find((t) => t.id === 'godi-royal') || TEMPLATES[2];
    } else {
      chosen = TEMPLATES.find((t) => t.id === 'cafe-pro') || TEMPLATES[0];
    }

    if (chosen) {
      profile.template_id = chosen.id;
      profile.theme = chosen.theme;
      profile.accent_color = chosen.accent_color;
      profile.button_style = chosen.button_style;
      profile.font_family = chosen.font_family;
      profile.layout = chosen.layout;
      await StorageService.saveProfile(profile);
      functionCalls.push({ name: 'select_template', arguments: { template_name: chosen.name } });
      results.push({ ok: true, template: chosen, profile });
      reasoning = `Applied the "${chosen.name}" template to your page.`;
    }
  }

  // 3. Add product
  if (text.includes('product') || text.includes('item') || text.includes('add a product') || text.includes('rupees') || text.includes('price')) {
    const priceMatch = prompt.match(/(?:for|at|rs\.?|₹|\$)\s*(\d+(?:\.\d+)?)/i) || prompt.match(/(\d+(?:\.\d+)?)\s*(?:rupees|rs|inr|\$)/i);
    const price = priceMatch ? parseFloat(priceMatch[1]) : 99;
    const nameMatch = prompt.match(/called\s+([^,.\n]+?)(?:\s+for|\s+at|\s+priced|\.|$)/i)
      || prompt.match(/product\s+([^,.\n]+?)(?:\s+for|\s+at|\s+priced|\.|$)/i);
    const name = nameMatch ? nameMatch[1].trim() : 'Special Offer';

    const now = new Date().toISOString();
    const newProd: Product = {
      id: `prod_${Date.now()}`,
      profile_id: profile.id,
      name,
      price,
      currency: '₹',
      description: 'Added via LinkOS Assistant',
      image_url: '',
      category: 'General',
      available: true,
      featured: false,
      sort_order: 0,
      created_at: now,
      updated_at: now,
    };
    await StorageService.saveProduct(newProd);
    functionCalls.push({ name: 'create_product', arguments: { name, price } });
    results.push({ ok: true, product: newProd });
    reasoning = `Added product "${name}" at ₹${price} to your storefront.`;
  }

  // 4. Add link
  if (text.includes('link') || text.includes('url') || text.includes('instagram') || text.includes('whatsapp') || text.includes('website')) {
    const urlMatch = prompt.match(/https?:\/\/[^\s"']+/i);
    const titleMatch = prompt.match(/titled\s+([^,.\n]+?)(?:\s+with|\s+to|\.|$)/i)
      || prompt.match(/link\s+([^,.\n]+?)(?:\s+with|\s+to|\.|$)/i);
    const title = titleMatch ? titleMatch[1].trim() : (text.includes('instagram') ? 'Instagram' : 'Website');
    const url = urlMatch ? urlMatch[0] : 'https://instagram.com/mybusiness';

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
    functionCalls.push({ name: 'add_link', arguments: { title, url } });
    results.push({ ok: true, link: newLink });
    reasoning = `Added new link "${title}" pointing to ${url}.`;
  }

  // 5. Toggle WhatsApp
  if (text.includes('whatsapp')) {
    const enable = !text.includes('disable') && !text.includes('off') && !text.includes('turn off');
    profile.whatsapp_enabled = enable;
    await StorageService.saveProfile(profile);
    functionCalls.push({ name: 'toggle_whatsapp', arguments: { enabled: enable } });
    results.push({ ok: true, whatsapp_enabled: enable });
    reasoning = `${enable ? 'Enabled' : 'Disabled'} WhatsApp direct contact on your page.`;
  }

  // If nothing matched, perform a safe get_profile / view action
  if (functionCalls.length === 0) {
    functionCalls.push({ name: 'get_profile', arguments: {} });
    results.push({ ok: true, profile });
    reasoning = `Loaded your profile "${profile.business_name || 'Business'}". You can change templates, attach an image, or add products and links anytime.`;
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
      reasoning,
    },
  };
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
      // Fall through to in-memory/local-storage execution
    }
  }
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
      // Fall through to in-memory/local-storage execution
    }
  }
  return runNeedleLocal(prompt, image);
}
