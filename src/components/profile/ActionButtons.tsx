import React from 'react';
import { MessageCircle, Phone, Navigation } from 'lucide-react';
import { Profile } from '../../types';
import { StorageService } from '../../lib/storage';

interface ActionButtonsProps {
  profile: Profile;
  onActionTriggered?: (action: string) => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  profile,
  onActionTriggered,
}) => {
  const handleWhatsApp = (e: React.MouseEvent) => {
    StorageService.recordAnalyticsEvent(profile.id, 'whatsapp_click', {
      source: 'profile_action_buttons',
    });
    onActionTriggered?.('whatsapp');

    if (!profile.whatsapp) return;
    e.preventDefault();
    const cleanNumber = profile.whatsapp.replace(/[^0-9]/g, '');
    const defaultMsg =
      profile.whatsapp_message ||
      `Hi ${profile.business_name}, I found your page on LinkOS and would like to enquire.`;
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(defaultMsg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCall = (e: React.MouseEvent) => {
    StorageService.recordAnalyticsEvent(profile.id, 'call_click', {
      source: 'profile_action_buttons',
    });
    onActionTriggered?.('call');

    if (!profile.phone) return;
    const cleanPhone = profile.phone.replace(/[^0-9+]/g, '');
    window.location.href = `tel:${cleanPhone}`;
  };

  const handleDirections = (e: React.MouseEvent) => {
    StorageService.recordAnalyticsEvent(profile.id, 'directions_click', {
      source: 'profile_action_buttons',
    });
    onActionTriggered?.('directions');

    e.preventDefault();
    const query = encodeURIComponent(
      `${profile.business_name}, ${profile.address || ''}, ${profile.city || ''}, ${profile.state || ''}`.trim()
    );
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="px-4 py-2">
      <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-md mx-auto">
        {/* WhatsApp Button */}
        <button
          type="button"
          onClick={handleWhatsApp}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 border border-[#25D366]/20 transition-all active:scale-97 shadow-2xs"
        >
          <div className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xs mb-1.5">
            <MessageCircle className="w-5 h-5 fill-current" />
          </div>
          <span className="text-xs font-semibold text-[var(--lk-text,#18181B)]">WhatsApp</span>
          <span className="text-[10px] text-[var(--lk-sub,#71717A)] font-medium">Instant chat</span>
        </button>

        {/* Call Button */}
        <button
          type="button"
          onClick={handleCall}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-[var(--lk-surface,#F4F4F5)] hover:opacity-85 border border-[var(--lk-border,#E4E4E7)] text-[var(--lk-text,#27272A)] transition-all active:scale-97 shadow-2xs"
        >
          <div className="w-9 h-9 rounded-full bg-[var(--lk-accent,#18181B)] text-[var(--lk-accent-text,#fff)] flex items-center justify-center shadow-xs mb-1.5">
            <Phone className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-[var(--lk-text,#18181B)]">Call Now</span>
          <span className="text-[10px] text-[var(--lk-sub,#71717A)] font-medium">Direct line</span>
        </button>

        {/* Directions Button */}
        <button
          type="button"
          onClick={handleDirections}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-[var(--lk-surface,#F4F4F5)] hover:opacity-85 border border-[var(--lk-border,#E4E4E7)] text-[var(--lk-text,#27272A)] transition-all active:scale-97 shadow-2xs"
        >
          <div className="w-9 h-9 rounded-full bg-[var(--lk-accent,#18181B)] text-[var(--lk-accent-text,#fff)] flex items-center justify-center shadow-xs mb-1.5">
            <Navigation className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-[var(--lk-text,#18181B)]">Directions</span>
          <span className="text-[10px] text-[var(--lk-sub,#71717A)] font-medium">Find on map</span>
        </button>
      </div>
    </div>
  );
};
