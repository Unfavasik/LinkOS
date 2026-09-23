import React from 'react';
import { MapPin, BadgeCheck, Share2 } from 'lucide-react';
import { Profile } from '../../types';

interface ProfileHeaderProps {
  profile: Profile;
  onShareClick?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  onShareClick,
}) => {
  return (
    <header className="relative pt-6 pb-4 px-4 text-center">
      {/* Top right quick share button */}
      {onShareClick && (
        <button
          type="button"
          onClick={onShareClick}
          aria-label="Share profile"
          className="absolute top-4 right-4 p-2.5 rounded-full bg-white/80 backdrop-blur-xs border border-zinc-200/80 text-zinc-700 hover:text-zinc-950 hover:bg-white shadow-xs transition-colors"
        >
          <Share2 className="w-4 h-4" />
        </button>
      )}

      {/* Business Logo */}
      <div className="flex justify-center mb-3">
        <div className="relative">
          {profile.logo_url?.trim() ? (
            <img
              src={profile.logo_url.trim()}
              alt={profile.business_name}
              className="w-22 h-22 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-white shadow-md ring-1 ring-zinc-200/70"
            />
          ) : (
            <div className="w-22 h-22 sm:w-24 sm:h-24 rounded-full bg-[var(--lk-accent,#18181B)] text-[var(--lk-accent-text,#fff)] flex items-center justify-center text-2xl font-bold border-2 border-white shadow-md ring-1 ring-zinc-200">
              {profile.business_name.charAt(0)}
            </div>
          )}
          {profile.verified && (
            <div
              title="Verified Business"
              className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 shadow-xs"
            >
              <BadgeCheck className="w-6 h-6 text-blue-600 fill-blue-50" />
            </div>
          )}
        </div>
      </div>

      {/* Business Name */}
      <div className="flex items-center justify-center gap-1.5">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--lk-text,#18181B)]">
          {profile.business_name}
        </h1>
      </div>

      {/* Category & Location */}
      <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs sm:text-sm text-[var(--lk-sub,#71717A)]">
        {profile.category && (
          <span className="font-medium text-[var(--lk-text,#3F3F46)]">{profile.category}</span>
        )}
        {profile.category && (profile.city || profile.state) && (
          <span className="text-zinc-300">•</span>
        )}
        {(profile.city || profile.state) && (
          <span className="inline-flex items-center gap-1 text-[var(--lk-sub,#52525B)]">
            <MapPin className="w-3.5 h-3.5 text-zinc-400" />
            <span>
              {profile.city}
              {profile.city && profile.state ? `, ${profile.state}` : profile.state}
            </span>
          </span>
        )}
      </div>

      {/* Description */}
      {profile.description && (
        <p className="mt-2.5 text-xs sm:text-sm text-[var(--lk-sub,#52525B)] max-w-md mx-auto leading-relaxed px-2">
          {profile.description}
        </p>
      )}
    </header>
  );
};
