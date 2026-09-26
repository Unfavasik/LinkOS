import { Profile, Product, LinkItem, AnalyticsEvent, AnalyticsSummary, Customer, Order, EventType, QueueEntry, QueueEntryStatus } from '../types';
import { DEMO_PROFILE, DEMO_PRODUCTS, DEMO_LINKS, DEMO_ANALYTICS_EVENTS, DEMO_CUSTOMERS, DEMO_ORDERS } from '../data/demoData';
import { supabase, isSupabaseConfigured, supabaseUrl, supabaseAnonKey } from './supabase';
import { ensureWebp } from './imageConvert';
import { toUserProfilesRow, applyUserProfilesRow, type UserProfileRow } from './userProfiles';
import { clearAdminCache } from './adminCache';

const STORAGE_KEYS = {
  PROFILES: 'linkos_profiles_v1',
  PRODUCTS: 'linkos_products_v1',
  LINKS: 'linkos_links_v1',
  EVENTS: 'linkos_events_v1',
  CUSTOMERS: 'linkos_customers_v1',
  ORDERS: 'linkos_orders_v1',
  ACTIVE_USER: 'linkos_active_user_v1',
  QUEUE: 'linkos_queue_v1',
  USERS: 'linkos_users_v1',
};

// Seed initial demo data if empty
function initializeLocalStorage() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.PROFILES)) {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify([DEMO_PROFILE]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEMO_PRODUCTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LINKS)) {
    localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(DEMO_LINKS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(DEMO_ANALYTICS_EVENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(DEMO_CUSTOMERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEMO_ORDERS));
  }
  // NOTE: ACTIVE_USER is intentionally never seeded — visitors start logged
  // out and only a real login/signup sets the active user.
}

initializeLocalStorage();

export interface ActiveUser {
  id: string;
  email: string;
  business_name?: string;
  username?: string;
  plan?: string;
}

/* XHR upload so callers get real byte progress — supabase-js's fetch-based
   upload cannot report progress events. Mirrors storage.upload() headers. */
async function uploadWithProgress(
  bucket: string,
  path: string,
  body: Blob,
  onProgress?: (pct: number) => void,
  contentType?: string,
): Promise<void> {
  if (!supabase) throw new Error('storage not configured');
  const token = (await supabase.auth.getSession()).data.session?.access_token ?? supabaseAnonKey;
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${supabaseUrl}/storage/v1/object/${bucket}/${path}`);
    xhr.setRequestHeader('apikey', supabaseAnonKey);
    xhr.setRequestHeader('authorization', `Bearer ${token}`);
    xhr.setRequestHeader('x-upsert', 'true');
    xhr.setRequestHeader('cache-control', '3600');
    if (contentType) xhr.setRequestHeader('content-type', contentType);
    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
    }
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`)));
    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.send(body);
  });
}

export const StorageService = {
  // --- AUTH / USER ---
  getActiveUser(): ActiveUser | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setActiveUser(user: ActiveUser | null) {
    const previous = this.getActiveUser();
    const identityChanged =
      (previous?.id ?? null) !== (user?.id ?? null) ||
      (previous?.email?.toLowerCase() ?? null) !== (user?.email?.toLowerCase() ?? null);
    if (!user) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
    } else {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(user));
    }
    // A different account must never inherit the previous account's cached
    // admin verification.
    if (identityChanged) clearAdminCache();
  },

  setUserPlan(plan: string) {
    const user = this.getActiveUser();
    if (user) this.setActiveUser({ ...user, plan });
  },

  loginDemoUser(): Profile {
    const user: ActiveUser = {
      id: 'user_anant_1',
      email: 'hello@urbanbrewcafe.in',
      business_name: 'Urban Brew Café',
      username: 'anant',
    };
    this.setActiveUser(user);
    return DEMO_PROFILE;
  },

  loginUser(identifier: string, _password?: string): { user: ActiveUser; profile: Profile; isAdmin: boolean } {
    const cleanId = identifier.trim().toLowerCase();

    // 1. Demo User
    if (cleanId === 'anant' || cleanId === 'hello@urbanbrewcafe.in' || cleanId === 'demo' || cleanId === 'cafe') {
      const profile = this.loginDemoUser();
      const user = this.getActiveUser()!;
      return { user, profile, isAdmin: false };
    }

    // 2. Existing Local Profile match by email or username or phone
    const profilesStr = localStorage.getItem(STORAGE_KEYS.PROFILES);
    const profiles: Profile[] = profilesStr ? JSON.parse(profilesStr) : [DEMO_PROFILE];
    const existingProfile = profiles.find(
      (p) =>
        (p.email && p.email.toLowerCase() === cleanId) ||
        (p.username && p.username.toLowerCase() === cleanId) ||
        (p.phone && p.phone.replace(/\D/g, '') === cleanId.replace(/\D/g, ''))
    );

    if (existingProfile) {
      const user: ActiveUser = {
        id: existingProfile.user_id,
        email: existingProfile.email || cleanId,
        business_name: existingProfile.business_name,
        username: existingProfile.username,
        plan: existingProfile.plan,
      };
      this.setActiveUser(user);
      return { user, profile: existingProfile, isAdmin: false };
    }

    // 4. Create new user & profile
    const usernameSlug = cleanId.includes('@')
      ? cleanId.split('@')[0].replace(/[^a-z0-9]/g, '')
      : cleanId.replace(/[^a-z0-9]/g, '');
    const cleanUsername = usernameSlug || `user${Math.floor(1000 + Math.random() * 9000)}`;
    const businessName = cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1);

    const user: ActiveUser = {
      id: `user_${Date.now()}`,
      email: cleanId.includes('@') ? cleanId : `${cleanUsername}@linkos.local`,
      business_name: businessName,
      username: cleanUsername,
      plan: 'free',
    };
    this.setActiveUser(user);

    const newProfile: Profile = {
      id: `profile_${user.id}`,
      user_id: user.id,
      business_name: businessName,
      username: cleanUsername,
      category: 'General Business',
      description: `Welcome to ${businessName}.`,
      logo_url: '/images/cafe/logo.webp',
      avatar_url: '/images/default-avatar.png',
      phone: !cleanId.includes('@') ? cleanId : '',
      whatsapp: !cleanId.includes('@') ? cleanId : '',
      email: user.email,
      website: '',
      address: '',
      city: 'Local City',
      state: 'State',
      country: 'India',
      theme: 'neutral',
      accent_color: '#2563EB',
      button_style: 'rounded',
      font_family: 'inter',
      plan: 'free',
      verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.saveProfileLocal(newProfile);
    return { user, profile: newProfile, isAdmin: false };
  },

  logout() {
    this.setActiveUser(null);
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut().catch(() => {});
    }
  },

  // --- PROFILES ---
  async getProfileByUsername(username: string): Promise<Profile | null> {
    const cleanUsername = username.toLowerCase().trim();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('public_profiles')
          .select('*')
          .ilike('username', cleanUsername)
          .maybeSingle();

        if (!error && data) return data as Profile;
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local store:', err);
      }
      // Never render a locally cached public profile in production when the
      // database is configured; the database is the source of truth.
      return null;
    }

    try {
      const profilesStr = localStorage.getItem(STORAGE_KEYS.PROFILES);
      const profiles: Profile[] = profilesStr ? JSON.parse(profilesStr) : [DEMO_PROFILE];
      const found = profiles.find((p) => p.username.toLowerCase() === cleanUsername);
      return found || null;
    } catch {
      return cleanUsername === 'anant' ? DEMO_PROFILE : null;
    }
  },

  async getCurrentUserProfile(): Promise<Profile | null> {
    const user = this.getActiveUser();
    if (!user) return null;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!error && data) {
          const remote = data as Profile;
          // The remote row may be missing fields the user already filled in
          // (e.g. saved locally before Supabase was reachable). Fill empty
          // fields from the local copy so Edit Profile shows everything we have.
          const local = this.findLocalProfile(user);
          const merged: Profile = { ...remote };
          if (local) {
            for (const [key, localVal] of Object.entries(local)) {
              const remoteVal = (remote as unknown as Record<string, unknown>)[key];
              const isEmpty =
                remoteVal === undefined || remoteVal === null || remoteVal === '';
              const hasLocal =
                localVal !== undefined && localVal !== null && localVal !== '';
              if (isEmpty && hasLocal) {
                (merged as unknown as Record<string, unknown>)[key] = localVal;
              }
            }
          }
          // Signup record is the source of truth for identity fields.
          if (!merged.email && user.email) merged.email = user.email;
          if (!merged.business_name && user.business_name) merged.business_name = user.business_name;
          // Overlay the user_profiles row (avatar, role, location, social links).
          const userRow = await this.getUserUserProfile(user.id);
          if (userRow) return applyUserProfilesRow(merged, userRow);
          return merged;
        }
      } catch (err) {
        console.warn('Supabase getProfile failed, using local store:', err);
      }
    }

    try {
      const profilesStr = localStorage.getItem(STORAGE_KEYS.PROFILES);
      const profiles: Profile[] = profilesStr ? JSON.parse(profilesStr) : [DEMO_PROFILE];
      const match = profiles.find((p) => p.user_id === user.id || (user.username && p.username === user.username));
      if (match) return match;

      const isDemoUser = user.id === 'user_anant_1' || user.username === 'anant';
      if (isDemoUser) return DEMO_PROFILE;

      // Auto-initialize profile for authenticated user so they aren't booted out
      const defaultProfile: Profile = {
        id: `profile_${user.id}`,
        user_id: user.id,
        business_name: user.business_name || (user.email ? user.email.split('@')[0] : 'My Business'),
        username: user.username || (user.email ? user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') : `user_${Date.now()}`),
        category: 'General Business',
        description: `Welcome to ${user.business_name || 'our business'}.`,
        logo_url: '/images/cafe/logo.webp',
        avatar_url: '/images/default-avatar.png',
        phone: '',
        whatsapp: '',
        email: user.email || '',
        website: '',
        address: '',
        city: 'Local City',
        state: 'State',
        country: 'India',
        theme: 'neutral',
        accent_color: '#2563EB',
        button_style: 'rounded',
        font_family: 'inter',
        plan: 'free',
        verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      profiles.push(defaultProfile);
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
      return defaultProfile;
    } catch {
      return user.username === 'anant' ? DEMO_PROFILE : null;
    }
  },

  findLocalProfile(user: ActiveUser): Profile | null {
    try {
      const profilesStr = localStorage.getItem(STORAGE_KEYS.PROFILES);
      const profiles: Profile[] = profilesStr ? JSON.parse(profilesStr) : [];
      return profiles.find((p) => p.user_id === user.id || p.username === user.username) || null;
    } catch {
      return null;
    }
  },

  async checkUsernameAvailability(username: string, currentProfileId?: string): Promise<boolean> {
    const clean = username.toLowerCase().trim();
    if (!clean || clean.length < 2) return false;

    // Reserved system routes
    const reserved = ['dashboard', 'login', 'signup', 'onboarding', 'api', 'admin', 'auth', 'settings'];
    if (reserved.includes(clean)) return false;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.rpc('is_linkos_username_available', {
          p_username: clean,
          p_current_profile_id: currentProfileId ?? null,
        });
        if (!error && typeof data === 'boolean') return data;
      } catch {
        // Fallback to local
      }
    }

    const profilesStr = localStorage.getItem(STORAGE_KEYS.PROFILES);
    const profiles: Profile[] = profilesStr ? JSON.parse(profilesStr) : [DEMO_PROFILE];
    const existing = profiles.find(
      (p) => p.username.toLowerCase() === clean && p.id !== currentProfileId
    );
    return !existing;
  },

  async saveProfile(profile: Profile): Promise<Profile> {
  profile.updated_at = new Date().toISOString();
  
  if (isSupabaseConfigured && supabase) {
  try {
  const { data, error } = await supabase
  .from('profiles')
  .upsert(profile)
  .select()
  .single();
  if (!error && data) {
  this.saveProfileLocal(data as Profile);
  // Mirror the user-facing fields into public.user_profiles.
  await this.saveUserProfile(data as Profile);
  return data as Profile;
  }
  } catch (err) {
  console.warn('Supabase saveProfile error, saving locally:', err);
  }
  }
  
  this.saveProfileLocal(profile);
  if (isSupabaseConfigured && supabase) {
  // Local save succeeded but the profiles table failed — still sync user_profiles.
  await this.saveUserProfile(profile);
  }
  return profile;
  },

  // Best-effort sync into public.user_profiles. Failures never block the save.
  async saveUserProfile(profile: Profile): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const row = toUserProfilesRow(profile);
      const { error } = await supabase
        .from('user_profiles')
        .upsert(row, { onConflict: 'user_id' });
      if (error) console.warn('[v0] user_profiles upsert failed:', error.message);
    } catch (err) {
      console.warn('[v0] user_profiles sync error:', err);
    }
  },

  /**
   * Persist account details collected at sign-up into Supabase. Best-effort:
   * failures never block the flow (the same data also lives in auth user
   * metadata). Creates the public.user_profiles row only when missing, so a
   * later re-login never overwrites profile edits the user already made.
   */
  async syncSignupDetails(details: {
    userId: string;
    email: string;
    displayName?: string;
  }): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const existing = await supabase
        .from('user_profiles')
        .select('user_id, display_name')
        .eq('user_id', details.userId)
        .maybeSingle();
      if (existing.error) {
        console.warn('[v0] user_profiles signup lookup failed:', existing.error.message);
        return;
      }
      if (existing.data) {
        if (!existing.data.display_name && details.displayName) {
          const { error } = await supabase
            .from('user_profiles')
            .update({ display_name: details.displayName })
            .eq('user_id', details.userId);
          if (error) console.warn('[v0] user_profiles display_name update failed:', error.message);
        }
        return;
      }
      const { error } = await supabase.from('user_profiles').insert({
        user_id: details.userId,
        email: details.email,
        display_name: details.displayName || null,
        role: 'user',
      });
      if (error) console.warn('[v0] user_profiles signup insert failed:', error.message);
    } catch (err) {
      console.warn('[v0] user_profiles signup sync error:', err);
    }
  },

  /**
   * Persist the onboarding preferences (step 2 of sign-up) onto the auth
   * user's metadata. Runs after the account exists, so the session can update
   * its own metadata. Best-effort: failures never block the flow.
   */
  async saveSignupPreferences(prefs: {
    persona?: string;
    interests?: string[];
    heardFrom?: string;
  }): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    const data: Record<string, unknown> = {};
    if (prefs.persona) data.persona = prefs.persona;
    if (prefs.interests?.length) data.interests = prefs.interests;
    if (prefs.heardFrom) data.heard_from = prefs.heardFrom;
    if (!Object.keys(data).length) return;
    try {
      const { error } = await supabase.auth.updateUser({ data });
      if (error) console.warn('[v0] signup preferences save failed:', error.message);
    } catch (err) {
      console.warn('[v0] signup preferences save error:', err);
    }
  },

  // Best-effort read from public.user_profiles, merged over the base profile.
  async getUserUserProfile(userId: string): Promise<UserProfileRow | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (!error && data) return data as UserProfileRow;
    } catch (err) {
      console.warn('[v0] user_profiles read error:', err);
    }
    return null;
  },

  saveProfileLocal(profile: Profile) {
    const profilesStr = localStorage.getItem(STORAGE_KEYS.PROFILES);
    let profiles: Profile[] = profilesStr ? JSON.parse(profilesStr) : [DEMO_PROFILE];
    const index = profiles.findIndex((p) => p.id === profile.id || p.username === profile.username);
    if (index >= 0) {
      profiles[index] = profile;
    } else {
      profiles.push(profile);
    }
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));

    // Update active user username if matched
    const active = this.getActiveUser();
    if (active && active.id === profile.user_id) {
      this.setActiveUser({
        ...active,
        business_name: profile.business_name,
        username: profile.username,
      });
    }
  },

  // --- PRODUCTS ---
  async getProducts(profileId: string): Promise<Product[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('profile_id', profileId)
          .order('sort_order', { ascending: true });
        if (!error && data) return data as Product[];
      } catch (err) {
        console.warn('Supabase getProducts error:', err);
      }
    }

    const productsStr = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    const products: Product[] = productsStr ? JSON.parse(productsStr) : DEMO_PRODUCTS;
    return products
      .filter((p) => p.profile_id === profileId)
      .sort((a, b) => a.sort_order - b.sort_order);
  },

  async saveProduct(product: Product): Promise<Product> {
    product.updated_at = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .upsert(product)
          .select()
          .single();
        if (!error && data) {
          this.saveProductLocal(data as Product);
          return data as Product;
        }
      } catch (err) {
        console.warn('Supabase saveProduct error, using local:', err);
      }
    }

    this.saveProductLocal(product);
    return product;
  },

  saveProductLocal(product: Product) {
    const productsStr = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    let products: Product[] = productsStr ? JSON.parse(productsStr) : DEMO_PRODUCTS;
    const index = products.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  async deleteProduct(productId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('products').delete().eq('id', productId);
      } catch {
        // Continue to local
      }
    }

    const productsStr = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    let products: Product[] = productsStr ? JSON.parse(productsStr) : DEMO_PRODUCTS;
    products = products.filter((p) => p.id !== productId);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  // --- LINKS ---
  async getLinks(profileId: string): Promise<LinkItem[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('links')
          .select('*')
          .eq('profile_id', profileId)
          .order('sort_order', { ascending: true });
        if (!error && data) return data as LinkItem[];
      } catch {
        // Fallback
      }
    }

    const linksStr = localStorage.getItem(STORAGE_KEYS.LINKS);
    const links: LinkItem[] = linksStr ? JSON.parse(linksStr) : DEMO_LINKS;
    return links
      .filter((l) => l.profile_id === profileId)
      .sort((a, b) => a.sort_order - b.sort_order);
  },

  async saveLink(link: LinkItem): Promise<LinkItem> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('links')
          .upsert(link)
          .select()
          .single();
        if (!error && data) {
          this.saveLinkLocal(data as LinkItem);
          return data as LinkItem;
        }
      } catch {
        // Local
      }
    }

    this.saveLinkLocal(link);
    return link;
  },

  saveLinkLocal(link: LinkItem) {
    const linksStr = localStorage.getItem(STORAGE_KEYS.LINKS);
    let links: LinkItem[] = linksStr ? JSON.parse(linksStr) : DEMO_LINKS;
    const index = links.findIndex((l) => l.id === link.id);
    if (index >= 0) {
      links[index] = link;
    } else {
      links.push(link);
    }
    localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(links));
  },

  async deleteLink(linkId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('links').delete().eq('id', linkId);
      } catch {}
    }

    const linksStr = localStorage.getItem(STORAGE_KEYS.LINKS);
    let links: LinkItem[] = linksStr ? JSON.parse(linksStr) : DEMO_LINKS;
    links = links.filter((l) => l.id !== linkId);
    localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(links));
  },

  // --- ANALYTICS TRACKING ---
  async recordAnalyticsEvent(profileId: string, event_type: EventType, metadata: Record<string, any> = {}): Promise<void> {
    const event: AnalyticsEvent = {
      id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      profile_id: profileId,
      event_type,
      metadata,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('analytics_events').insert(event);
      } catch (err) {
        console.warn('Supabase analytics insert error:', err);
      }
    }

    try {
      const eventsStr = localStorage.getItem(STORAGE_KEYS.EVENTS);
      const events: AnalyticsEvent[] = eventsStr ? JSON.parse(eventsStr) : DEMO_ANALYTICS_EVENTS;
      events.push(event);
      // Keep recent 1000 events in local storage to prevent size explosion
      if (events.length > 1000) {
        events.splice(0, events.length - 1000);
      }
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    } catch {
      // ignore
    }
  },

  async getAnalytics(profileId: string): Promise<{
    events: AnalyticsEvent[];
    totalViews: number;
    whatsappClicks: number;
    callClicks: number;
    directionsClicks: number;
    productClicks: number;
    linkClicks: number;
    qrVisits: number;
  }> {
    let events: AnalyticsEvent[] = [];

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('analytics_events')
          .select('*')
          .eq('profile_id', profileId)
          .order('created_at', { ascending: false });
        if (!error && data) {
          events = data as AnalyticsEvent[];
        }
      } catch {}
    }

    if (events.length === 0) {
      const eventsStr = localStorage.getItem(STORAGE_KEYS.EVENTS);
      const allEvents: AnalyticsEvent[] = eventsStr ? JSON.parse(eventsStr) : DEMO_ANALYTICS_EVENTS;
      events = allEvents.filter((e) => e.profile_id === profileId);
    }

    let totalViews = 0;
    let whatsappClicks = 0;
    let callClicks = 0;
    let directionsClicks = 0;
    let productClicks = 0;
    let linkClicks = 0;
    let qrVisits = 0;

    events.forEach((ev) => {
      switch (ev.event_type) {
        case 'page_view':
          totalViews++;
          break;
        case 'whatsapp_click':
          whatsappClicks++;
          break;
        case 'call_click':
          callClicks++;
          break;
        case 'directions_click':
          directionsClicks++;
          break;
        case 'product_click':
          productClicks++;
          break;
        case 'link_click':
          linkClicks++;
          break;
        case 'qr_visit':
          qrVisits++;
          break;
      }
    });

    // If demo profile 'profile_anant_1', add baseline metrics so dashboard shows the realistic figures
    if (profileId === 'profile_anant_1') {
      totalViews = Math.max(totalViews, 12482);
      whatsappClicks = Math.max(whatsappClicks, 382);
      productClicks = Math.max(productClicks, 194);
      callClicks = Math.max(callClicks, 91);
      directionsClicks = Math.max(directionsClicks, 64);
      qrVisits = Math.max(qrVisits, 47);
    }

    return {
      events,
      totalViews,
      whatsappClicks,
      callClicks,
      directionsClicks,
      productClicks,
      linkClicks,
      qrVisits,
    };
  },

  async getAnalyticsSummary(profileId: string): Promise<AnalyticsSummary> {
    const data = await this.getAnalytics(profileId);
    return {
      total_views: data.totalViews,
      unique_visitors: Math.round(data.totalViews * 0.78),
      whatsapp_clicks: data.whatsappClicks,
      call_clicks: data.callClicks,
      direction_clicks: data.directionsClicks,
      product_clicks: data.productClicks,
      link_clicks: data.linkClicks,
      qr_visits: data.qrVisits,
    };
  },

  async getRecentEvents(profileId: string, limit: number = 10): Promise<AnalyticsEvent[]> {
    const data = await this.getAnalytics(profileId);
    return (data.events || []).slice(0, limit);
  },

  // --- CUSTOMERS & ORDERS ---
  async getCustomers(profileId: string): Promise<Customer[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('profile_id', profileId)
          .order('created_at', { ascending: false });
        if (!error && data) return data as Customer[];
      } catch {}
    }

    const str = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    const customers: Customer[] = str ? JSON.parse(str) : DEMO_CUSTOMERS;
    return customers.filter((c) => c.profile_id === profileId);
  },

  async saveCustomer(customer: Customer): Promise<Customer> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('customers')
          .upsert(customer)
          .select()
          .single();
        if (!error && data) {
          this.saveCustomerLocal(data as Customer);
          return data as Customer;
        }
      } catch {}
    }

    this.saveCustomerLocal(customer);
    return customer;
  },

  saveCustomerLocal(customer: Customer) {
    const str = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    let customers: Customer[] = str ? JSON.parse(str) : DEMO_CUSTOMERS;
    const idx = customers.findIndex((c) => c.id === customer.id);
    if (idx >= 0) {
      customers[idx] = customer;
    } else {
      customers.unshift(customer);
    }
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  },

  async getOrders(profileId: string): Promise<Order[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('profile_id', profileId)
          .order('created_at', { ascending: false });
        if (!error && data) return data as Order[];
      } catch {}
    }

    const str = localStorage.getItem(STORAGE_KEYS.ORDERS);
    const orders: Order[] = str ? JSON.parse(str) : DEMO_ORDERS;
    return orders.filter((o) => o.profile_id === profileId);
  },

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('orders').update({ status }).eq('id', orderId);
      } catch {}
    }

    const str = localStorage.getItem(STORAGE_KEYS.ORDERS);
    let orders: Order[] = str ? JSON.parse(str) : DEMO_ORDERS;
    orders = orders.map((o) => (o.id === orderId ? { ...o, status } : o));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },

  async createOrder(order: Order): Promise<Order> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('orders').insert(order);
        if (!error) {
          this.saveOrderLocal(order);
          return order;
        }
      } catch {}
    }

    this.saveOrderLocal(order);
    return order;
  },

  saveOrderLocal(order: Order) {
    const str = localStorage.getItem(STORAGE_KEYS.ORDERS);
    const orders: Order[] = str ? JSON.parse(str) : DEMO_ORDERS;
    orders.unshift(order);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },

  resetToDemo() {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify([DEMO_PROFILE]));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEMO_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(DEMO_LINKS));
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(DEMO_ANALYTICS_EVENTS));
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(DEMO_CUSTOMERS));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEMO_ORDERS));
    this.loginDemoUser();
  },

  // --- LIVE QUEUE / TOKENS ---
  getQueueEntries(profileId: string): QueueEntry[] {
    const str = localStorage.getItem(STORAGE_KEYS.QUEUE);
    const all: QueueEntry[] = str ? JSON.parse(str) : [];
    const today = new Date().toDateString();
    return all
      .filter((e) => e.profile_id === profileId && new Date(e.created_at).toDateString() === today)
      .sort((a, b) => a.token - b.token);
  },

  joinQueue(profileId: string, data: { customer_name: string; customer_phone: string; service_name: string; service_minutes: number }): QueueEntry {
    const str = localStorage.getItem(STORAGE_KEYS.QUEUE);
    const all: QueueEntry[] = str ? JSON.parse(str) : [];
    const today = new Date().toDateString();
    const todaysForProfile = all.filter(
      (e) => e.profile_id === profileId && new Date(e.created_at).toDateString() === today
    );
    const now = new Date().toISOString();
    const entry: QueueEntry = {
      id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      profile_id: profileId,
      token: todaysForProfile.reduce((max, e) => Math.max(max, e.token), 0) + 1,
      customer_name: data.customer_name.trim(),
      customer_phone: data.customer_phone.trim(),
      service_name: data.service_name,
      service_minutes: data.service_minutes,
      status: 'waiting',
      created_at: now,
      updated_at: now,
    };
    all.push(entry);
    localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(all));
    localStorage.setItem(`linkos_my_ticket_${profileId}`, entry.id);
    return entry;
  },

  updateQueueEntry(profileId: string, entryId: string, status: QueueEntryStatus): QueueEntry | undefined {
    const str = localStorage.getItem(STORAGE_KEYS.QUEUE);
    const all: QueueEntry[] = str ? JSON.parse(str) : [];
    const entry = all.find((e) => e.id === entryId);
    if (entry) {
      entry.status = status;
      entry.updated_at = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(all));
      if (status === 'done') localStorage.removeItem(`linkos_my_ticket_${profileId}`);
    }
    return entry;
  },

  serveNextInQueue(profileId: string): QueueEntry | undefined {
    const entries = this.getQueueEntries(profileId);
    const serving = entries.find((e) => e.status === 'serving');
    if (serving) this.updateQueueEntry(profileId, serving.id, 'done');
    const next = entries.find((e) => e.status === 'waiting');
    if (!next) return undefined;
    return this.updateQueueEntry(profileId, next.id, 'serving');
  },

  getMyTicketId(profileId: string): string | null {
    return localStorage.getItem(`linkos_my_ticket_${profileId}`);
  },

  clearMyTicket(profileId: string) {
    localStorage.removeItem(`linkos_my_ticket_${profileId}`);
  },

  // --- FILE UPLOAD ---
  async uploadImage(file: File, bucket: 'logos' | 'products' | 'avatars' = 'products', onProgress?: (pct: number) => void): Promise<string> {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Unsupported image format. Please upload JPG, PNG, WEBP, or SVG.');
    }

    // Validate size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('Image size exceeds 5MB. Please choose a smaller image.');
    }

    // Every stored image becomes WebP (SVG stays vector). Avatars arrive
    // pre-cropped; covers/gallery/products are converted here with their
    // aspect ratio preserved.
    const stored = await ensureWebp(file);
    onProgress?.(15);

    if (isSupabaseConfigured && supabase) {
      try {
        const targetBucket = bucket === 'avatars' ? 'logos' : bucket;
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData.user) throw new Error('Sign in before uploading media.');
        const fileExt = stored.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `${authData.user.id}/${fileName}`;

        await uploadWithProgress(targetBucket, filePath, stored, onProgress ? (p) => onProgress(15 + Math.round(p * 0.8)) : undefined);
        const { data } = supabase.storage.from(targetBucket).getPublicUrl(filePath);
        if (data?.publicUrl) {
          onProgress?.(100);
          return data.publicUrl;
        }
      } catch (err) {
        console.warn('Supabase storage upload failed, falling back to local file reader:', err);
      }
    }

    onProgress?.(100);
    // Local fallback: convert to Data URL for instant rendering & preservation
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(stored);
    });
  },

  async uploadVideo(file: File, bucket: 'logos' | 'products' | 'avatars' = 'products', onProgress?: (pct: number) => void): Promise<string> {
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska', 'video/ogg'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Unsupported video format. Please upload MP4, WEBM, MOV, or MKV.');
    }

    // Validate size (max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('Video size exceeds 100MB. Please choose a smaller video.');
    }

    // Every stored video becomes WebM. Re-encoding runs in the browser with
    // MediaRecorder; if the browser cannot re-encode, the original is kept.
    const stored = await (async (): Promise<File> => {
      if (file.type === 'video/webm') return file;
      if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported('video/webm')) return file;
      try {
        const url = URL.createObjectURL(file);
        const video = document.createElement('video');
        video.src = url;
        video.preload = 'auto';
        await new Promise<void>((resolve, reject) => {
          video.onloadedmetadata = () => resolve();
          video.onerror = () => reject(new Error('decode failed'));
        });

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('canvas unavailable');

        const stream = canvas.captureStream(30);
        try {
          const ac = new AudioContext();
          await ac.resume();
          const source = ac.createMediaElementSource(video);
          const dest = ac.createMediaStreamDestination();
          source.connect(dest);
          dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
        } catch {
          /* silent video is acceptable */
        }

        const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
          ? 'video/webm;codecs=vp9,opus'
          : 'video/webm';
        const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 2500000 });
        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size) chunks.push(e.data);
        };
        const stopped = new Promise<void>((resolve) => {
          recorder.onstop = () => resolve();
        });
        const draw = () => {
          if (video.ended) return;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          requestAnimationFrame(draw);
        };

        video.currentTime = 0;
        // Conversion is real-time playback; report it as the first half of the bar.
        video.ontimeupdate = () => {
          if (video.duration) onProgress?.(Math.round((video.currentTime / video.duration) * 50));
        };
        try {
          await video.play();
        } catch {
          video.muted = true;
          await video.play();
        }
        recorder.start(250);
        draw();
        await new Promise<void>((resolve) => {
          video.onended = () => resolve();
        });
        recorder.stop();
        await stopped;
        URL.revokeObjectURL(url);

        const blob = new Blob(chunks, { type: 'video/webm' });
        if (!blob.size) return file;
        const name = `${file.name.replace(/\.[^.]+$/, '')}.webm`;
        return new File([blob], name, { type: 'video/webm' });
      } catch {
        return file;
      }
    })();

    if (isSupabaseConfigured && supabase) {
      try {
        const targetBucket = bucket === 'avatars' ? 'logos' : bucket;
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData.user) throw new Error('Sign in before uploading media.');
        const fileExt = stored.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `${authData.user.id}/${fileName}`;

        await uploadWithProgress(targetBucket, filePath, stored, onProgress ? (p) => onProgress(50 + Math.round(p * 0.5)) : undefined, stored.type);
        const { data } = supabase.storage.from(targetBucket).getPublicUrl(filePath);
        if (data?.publicUrl) {
          onProgress?.(100);
          return data.publicUrl;
        }
      } catch (err) {
        console.warn('Supabase video upload failed, falling back to local file reader:', err);
      }
    }

    onProgress?.(100);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(stored);
    });
  },
};
