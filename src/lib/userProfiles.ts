import type { Profile } from '../types';

/**
 * Mapping between the app's Profile shape and the public.user_profiles table.
 *
 * user_profiles columns:
 *   user_id, email, display_name, avatar_url, role, location, phone, bio,
 *   github_url, instagram_url, youtube_url, social_links (jsonb),
 *   created_at, updated_at
 *
 * role is an enum in the table: user | admin | owner | support.
 * Fields that don't have a dedicated column (website, facebook, twitter,
 * whatsapp, linkedin) are stored inside the social_links jsonb column.
 */

export type UserProfileRole = 'user' | 'admin' | 'owner' | 'support';

const USER_PROFILE_ROLES: UserProfileRole[] = ['user', 'admin', 'owner', 'support'];

export function toUserProfileRole(role?: string): UserProfileRole {
  return USER_PROFILE_ROLES.includes(role as UserProfileRole) ? (role as UserProfileRole) : 'user';
}

export interface SocialLinksJson {
  website?: string;
  facebook?: string;
  twitter?: string;
  whatsapp?: string;
  linkedin?: string;
  [key: string]: string | undefined;
}

export interface UserProfileRow {
  user_id: string;
  email?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  role?: UserProfileRole | null;
  location?: string | null;
  phone?: string | null;
  bio?: string | null;
  github_url?: string | null;
  instagram_url?: string | null;
  youtube_url?: string | null;
  social_links?: SocialLinksJson | null;
  created_at?: string;
  updated_at?: string;
}

function buildLocation(profile: Profile): string {
  return [profile.city, profile.state, profile.country].filter(Boolean).join(', ');
}

export function toUserProfilesRow(profile: Profile): UserProfileRow {
  const social: SocialLinksJson = {};
  if (profile.website) social.website = profile.website;
  if (profile.facebook) social.facebook = profile.facebook;
  if (profile.twitter) social.twitter = profile.twitter;
  if (profile.whatsapp) social.whatsapp = profile.whatsapp;
  if (Array.isArray(profile.social_links)) {
    for (const link of profile.social_links) {
      if (link.enabled !== false && link.url && !social[link.platform]) {
        social[link.platform] = link.url;
      }
    }
  }

  return {
    user_id: profile.user_id,
    email: profile.email || null,
    display_name: profile.business_name || null,
    avatar_url: profile.avatar_url || null,
    role: toUserProfileRole(profile.role),
    location: buildLocation(profile) || null,
    phone: profile.phone || null,
    bio: profile.bio || null,
    github_url: profile.github || null,
    instagram_url: profile.instagram || null,
    youtube_url: profile.youtube || null,
    social_links: social,
    updated_at: new Date().toISOString(),
  };
}

export function applyUserProfilesRow(profile: Profile, row: UserProfileRow): Profile {
  const merged: Profile = { ...profile };

  if (row.email) merged.email = row.email;
  if (row.display_name) merged.business_name = row.display_name;
  if (row.avatar_url) merged.avatar_url = row.avatar_url;
  if (row.role) merged.role = row.role;
  if (row.phone) merged.phone = row.phone;
  if (row.bio) merged.bio = row.bio;
  if (row.github_url) merged.github = row.github_url;
  if (row.instagram_url) merged.instagram = row.instagram_url;
  if (row.youtube_url) merged.youtube = row.youtube_url;

  if (row.location) {
    const parts = row.location.split(',').map((s) => s.trim()).filter(Boolean);
    merged.city = parts[0] || merged.city;
    merged.state = parts[1] || merged.state;
    merged.country = parts[2] || merged.country;
  }

  const social = row.social_links || {};
  if (social.website) merged.website = social.website;
  if (social.facebook) merged.facebook = social.facebook;
  if (social.twitter) merged.twitter = social.twitter;
  if (social.whatsapp) merged.whatsapp = social.whatsapp;

  return merged;
}
