import React from 'react';
import { MapPin, Phone, Mail, Clock, ShieldCheck } from 'lucide-react';
import { Profile } from '../../types';

interface BusinessInfoCardProps {
  profile: Profile;
}

export const BusinessInfoCard: React.FC<BusinessInfoCardProps> = ({ profile }) => {
  return (
    <div className="px-4 py-3 max-w-md mx-auto">
      <div className="p-4 bg-[var(--lk-surface,#fff)] rounded-xl border border-[var(--lk-border,#E4E4E7)] shadow-2xs text-left space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--lk-text,#18181B)] flex items-center justify-between">
          <span>Business Information</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Profile
          </span>
        </h4>

        <div className="space-y-2 text-xs text-[var(--lk-sub,#52525B)]">
          {profile.address && (
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              <span>
                {profile.address}
                {profile.city ? `, ${profile.city}` : ''}
                {profile.state ? `, ${profile.state}` : ''}
                {profile.country ? ` (${profile.country})` : ''}
              </span>
            </div>
          )}

          {profile.phone && (
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-zinc-400 shrink-0" />
              <a
                href={`tel:${profile.phone.replace(/[^0-9+]/g, '')}`}
                className="hover:underline text-[var(--lk-text,#27272A)]"
              >
                {profile.phone}
              </a>
            </div>
          )}

          {profile.email && (
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-zinc-400 shrink-0" />
              <a
                href={`mailto:${profile.email}`}
                className="hover:underline text-[var(--lk-text,#27272A)] truncate"
              >
                {profile.email}
              </a>
            </div>
          )}

          <div className="flex items-center gap-2.5 pt-1 border-t border-[var(--lk-border,#F4F4F5)] text-[var(--lk-sub,#71717A)] text-[11px]">
            <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>Mon – Sat: 9:30 AM – 8:30 PM • Sunday open</span>
          </div>
        </div>
      </div>
    </div>
  );
};
