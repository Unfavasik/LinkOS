import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { FullscreenNav, SOCIAL_ICONS } from '../ui/immersive-full-screen-nav';
import { StorageService } from '../../lib/storage';
import { useIsAdmin } from '../../lib/adminAuth';

const MENU_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Templates', to: '/templates' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Features', to: '/features' },
  { label: 'About LinkOS', to: '/about' },
  { label: 'Help Center', to: '/help' },
  { label: 'Contact Support', to: '/help/contact' },
  { label: 'Terms & Policies', to: '/legal' },
];

/**
 * LinkOS fullscreen menu built on the immersive-full-screen-nav component:
 * a clip-path wipe from the top reveals a dark panel with large links, an
 * auth-aware CTA and the social row. Replaces the old side MenuDrawer on
 * all public pages.
 */
export const FullscreenMenu: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const admin = useIsAdmin();
  const loggedIn = Boolean(StorageService.getActiveUser());

  return (
    <FullscreenNav
      open={open}
      onRequestClose={onClose}
      hideHeader
      clipOrigin="top"
      overlayBg="#060D1A"
      linkColor="#ffffff"
      linkHoverColor="#60A5FA"
      openDuration={0.9}
      closeDuration={0.7}
    >
      {(isOpen) => (
        <div className="flex w-full max-w-md flex-col items-center gap-4 px-8 py-24 text-center">
          <nav className="flex flex-col items-center gap-3" aria-label="Main">
            {admin && (
              <Link
                to="/admin"
                onClick={onClose}
                tabIndex={isOpen ? 0 : -1}
                className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-blue-400 transition-colors hover:text-blue-300 max-md:text-xl"
              >
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                Admin Panel
              </Link>
            )}
            {MENU_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={onClose}
                tabIndex={isOpen ? 0 : -1}
                className="text-4xl font-semibold tracking-tight text-white transition-colors hover:text-blue-300 max-md:text-3xl"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link
            to={loggedIn ? '/dashboard' : '/signup'}
            onClick={onClose}
            tabIndex={isOpen ? 0 : -1}
            className="mt-6 flex items-center justify-center gap-2 w-full max-w-xs py-3.5 rounded-xl bg-[#1D6FF2] hover:bg-[#3B82F6] text-white text-[15px] font-bold transition-colors"
          >
            {loggedIn ? 'Go to Dashboard' : 'Create Your Free Page'}
            <ArrowRight className="h-4.5 w-4.5" aria-hidden="true" />
          </Link>

          <div className="mt-8 flex items-center gap-5 text-white/70" aria-hidden="true">
            {(['facebook', 'twitter', 'instagram', 'linkedin'] as const).map((social) => (
              <span key={social}>{SOCIAL_ICONS[social]}</span>
            ))}
          </div>

          <p className="mt-2 text-sm text-zinc-500">Local Businesses. Stronger Together.</p>
        </div>
      )}
    </FullscreenNav>
  );
};
