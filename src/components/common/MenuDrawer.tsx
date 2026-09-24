import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  X,
  Home,
  LayoutGrid,
  Tag,
  Sparkles,
  BookOpen,
  ChevronRight,
  PlusCircle,
  Search,
  BarChart3,
  Link2,
  Info,
  HelpCircle,
  LogIn,
  UserPlus,
  ShieldCheck,
  Crown,
  ArrowRight,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Heart,
  Headset,
  MessageSquareHeart,
  LifeBuoy,
  Scale,
} from 'lucide-react';
import { LinkOsLogo } from './LinkOsLogo';
import { StorageService } from '../../lib/storage';
import { useIsAdmin } from '../../lib/adminAuth';

interface MenuDrawerProps {
  open: boolean;
  onClose: () => void;
}

interface MenuItem {
  label: string;
  icon: React.ElementType;
  to?: string;
  active?: boolean;
  chevron?: boolean;
}

const MAIN_ITEMS: MenuItem[] = [
  { label: 'Home', icon: Home, to: '/', active: true },
  { label: 'Templates', icon: LayoutGrid, to: '/templates' },
  { label: 'Pricing', icon: Tag, to: '/pricing' },
  { label: 'Features', icon: Sparkles, to: '/features' },
  { label: 'Resources', icon: BookOpen, to: '/resources' },
];

const BUSINESS_ITEMS: MenuItem[] = [
  { label: 'Create Your Page', icon: PlusCircle, to: '/signup' },
  { label: 'Explore Businesses', icon: Search, to: '/templates' },
  { label: 'Business Dashboard', icon: BarChart3, to: '/dashboard' },
  { label: 'My LinkOS Page', icon: Link2, to: '/dashboard' },
];

const COMPANY_ITEMS: MenuItem[] = [
  { label: 'About LinkOS', icon: Info, to: '/about' },
  { label: 'Help Center', icon: HelpCircle, to: '/help' },
  { label: 'Contact Support', icon: Headset, to: '/help/contact' },
  { label: 'My Support Tickets', icon: LifeBuoy, to: '/help/tickets' },
  { label: 'Feedback', icon: MessageSquareHeart, to: '/help/feedback' },
  { label: 'Terms & Policies', icon: Scale, to: '/legal' },
];

const ACCOUNT_ITEMS_LOGGED_OUT: MenuItem[] = [
  { label: 'Log In', icon: LogIn, to: '/login' },
  { label: 'Sign Up', icon: UserPlus, to: '/signup' },
];

// Logged-in users reach the dashboard via the "Go to Dashboard" CTA at the
// bottom of the drawer, so no extra account entry is needed here.
const ACCOUNT_ITEMS_ADMIN: MenuItem[] = [
  { label: 'Admin Panel', icon: ShieldCheck, to: '/admin', chevron: true },
];

const SOCIALS = [
  { label: 'Facebook', icon: Facebook, color: 'text-[#1877F2]' },
  { label: 'X', icon: Twitter, color: 'text-white' },
  { label: 'Instagram', icon: Instagram, color: 'text-[#E1306C]' },
  { label: 'YouTube', icon: Youtube, color: 'text-[#FF0000]' },
  { label: 'LinkedIn', icon: Linkedin, color: 'text-[#0A66C2]' },
];

const ItemRow: React.FC<{ item: MenuItem; onClose: () => void }> = ({ item, onClose }) => {
  const Icon = item.icon;
  const location = useLocation();
  const active = item.to
    ? item.to === '/'
      ? location.pathname === '/'
      : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)
    : Boolean(item.active);
  const content = (
    <>
      <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-[#3B82F6]' : 'text-zinc-300'}`} />
      <span className={`text-[15px] font-medium ${active ? 'text-[#3B82F6]' : 'text-zinc-100'}`}>
        {item.label}
      </span>
      {item.chevron && <ChevronRight className="w-4 h-4 ml-auto text-zinc-500" />}
    </>
  );
  const cls = `flex items-center gap-4 w-full px-4 py-3 rounded-xl transition-colors ${
    active ? 'bg-[#12294D]' : 'hover:bg-white/5'
  }`;
  return item.to ? (
    <Link to={item.to} onClick={onClose} className={cls} aria-label={item.label}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={onClose} className={`${cls} text-left`} aria-label={item.label}>
      {content}
    </button>
  );
};

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="px-4 mb-1.5 text-[13px] font-medium text-zinc-500">{children}</p>
);

export const MenuDrawer: React.FC<MenuDrawerProps> = ({ open, onClose }) => {
  const admin = useIsAdmin();
  const loggedIn = Boolean(StorageService.getActiveUser());

  return (
    <div
      className={`fixed inset-0 z-[100] ${open ? 'pointer-events-auto visible' : 'pointer-events-none invisible'}`}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Panel */}
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-sm bg-[#0A1220] border-l border-white/10 shadow-2xl transition-transform duration-300 ease-out overflow-y-auto ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col min-h-full px-4 pt-5 pb-6">
          {/* Header */}
          <div className="flex items-center justify-between px-1">
            <Link to="/" onClick={onClose} aria-label="LinkOS home">
              <LinkOsLogo size="md" tone="light" />
            </Link>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Main */}
          <nav className="mt-6 flex flex-col gap-0.5" aria-label="Main">
            <SectionLabel>Main</SectionLabel>
            {MAIN_ITEMS.map((item) => (
              <ItemRow key={item.label} item={item} onClose={onClose} />
            ))}
          </nav>

          <hr className="my-4 border-white/10" />

          {/* For Business */}
          <nav className="flex flex-col gap-0.5" aria-label="For Business">
            <SectionLabel>For Business</SectionLabel>
            {BUSINESS_ITEMS.map((item) => (
              <ItemRow key={item.label} item={item} onClose={onClose} />
            ))}
          </nav>

          <hr className="my-4 border-white/10" />

          {/* Company */}
          <nav className="flex flex-col gap-0.5" aria-label="Company">
            <SectionLabel>Company</SectionLabel>
            {COMPANY_ITEMS.map((item) => (
              <ItemRow key={item.label} item={item} onClose={onClose} />
            ))}
          </nav>

          <hr className="my-4 border-white/10" />

          {/* Account — hidden for signed-in users (they have the dashboard CTA) */}
          {(admin || !loggedIn) && (
            <nav className="flex flex-col gap-0.5" aria-label="Account">
              <SectionLabel>Account</SectionLabel>
              {(admin ? ACCOUNT_ITEMS_ADMIN : ACCOUNT_ITEMS_LOGGED_OUT).map((item) => (
                <ItemRow key={item.label} item={item} onClose={onClose} />
              ))}
            </nav>
          )}

          <hr className="my-4 border-white/10" />

          {/* Go Pro card */}
          <button
            type="button"
            className="flex items-center gap-3.5 w-full rounded-2xl bg-[#101B2E] border border-white/10 px-4 py-4 text-left hover:bg-[#142238] transition-colors"
          >
            <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#1A2740] shrink-0">
              <Crown className="w-6 h-6 text-amber-400" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[15px] font-bold text-amber-400">Go Pro</span>
              <span className="block text-[13px] leading-snug text-zinc-400">
                Unlock advanced features and grow faster.
              </span>
            </span>
            <ArrowRight className="w-5 h-5 text-zinc-400 shrink-0" />
          </button>

          {/* CTA — signup for visitors, dashboard for signed-in users */}
          <Link
            to={loggedIn ? '/dashboard' : '/signup'}
            onClick={onClose}
            className="mt-4 flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#1D6FF2] hover:bg-[#3B82F6] text-white text-[15px] font-bold transition-colors"
          >
            {loggedIn ? 'Go to Dashboard' : 'Create Your Free Page'}
            <ArrowRight className="w-4.5 h-4.5" />
          </Link>

          {/* Socials */}
          <div className="mt-6 flex items-center justify-center gap-7">
            {SOCIALS.map(({ label, icon: Icon, color }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                onClick={(e) => e.preventDefault()}
                className={`transition-opacity hover:opacity-75 ${color}`}
              >
                <Icon className="w-6 h-6" />
              </a>
            ))}
          </div>

          {/* Footer */}
          <p className="mt-auto pt-8 text-center text-[13px] text-zinc-400 flex items-center justify-center gap-1.5">
            Local Businesses. Stronger Together.
            <Heart className="w-3.5 h-3.5 text-zinc-400" />
          </p>
        </div>
      </div>
    </div>
  );
};
