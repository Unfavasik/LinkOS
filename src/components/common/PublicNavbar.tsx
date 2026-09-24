import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, BookOpen, Headset, LifeBuoy, MessageSquareHeart, Info, FileText } from 'lucide-react';
import { LinkOsLogo } from './LinkOsLogo';
import { AuthNavButtons } from './AuthNavButtons';
import { MenuDrawer } from './MenuDrawer';

const MAIN_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Templates', to: '/templates' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Features', to: '/features' },
];

const RESOURCE_LINKS = [
  { label: 'Resources', to: '/resources', icon: FileText },
  { label: 'Help Center', to: '/help', icon: BookOpen },
  { label: 'Contact Support', to: '/help/contact', icon: Headset },
  { label: 'My Support Tickets', to: '/help/tickets', icon: LifeBuoy },
  { label: 'Feedback', to: '/help/feedback', icon: MessageSquareHeart },
  { label: 'About LinkOS', to: '/about', icon: Info },
];

/**
 * Shared public-site navbar. Desktop: logo + inline links (Resources is a
 * hover dropdown) + auth buttons, matching the marketing header style.
 * Mobile: logo + menu button that opens the full-screen drawer.
 */
export const PublicNavbar: React.FC<{ mobileCentered?: boolean }> = ({ mobileCentered = false }) => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  const linkCls = (active: boolean) =>
    `relative transition-colors ${active ? 'text-white font-semibold after:absolute after:-bottom-[21px] after:left-0 after:right-0 after:h-0.5 after:bg-blue-500' : 'hover:text-white'}`;

  return (
    <>
    {/* Drawer must live OUTSIDE the header: the header's backdrop-blur creates
        a containing block that traps the drawer's fixed positioning inside the
        64px-tall bar, causing horizontal overflow on mid-width screens. */}
    <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    <header className="sticky top-0 z-50 bg-[#060D1A]/90 backdrop-blur-md border-b border-white/5">
      {/* Contact Support mobile variant: logo left, menu button right */}
      {mobileCentered && (
        <div className="md:hidden relative flex items-center justify-between h-16 px-4">
          <Link to="/" onClick={() => setMenuOpen(false)} aria-label="LinkOS home">
            <LinkOsLogo size="md" tone="light" />
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white/80"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

        </div>
      )}
      <div className={`${mobileCentered ? 'hidden md:flex' : 'flex'} max-w-6xl mx-auto px-4 sm:px-6 h-16 items-center justify-between`}>
        <Link to="/" aria-label="LinkOS home">
          <LinkOsLogo size="md" tone="light" />
        </Link>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-7 text-sm text-zinc-300" aria-label="Main">
          {MAIN_LINKS.map((l) =>
            isActive(l.to) && l.to !== '/' ? (
              <span key={l.to} className={linkCls(true)} aria-current="page">{l.label}</span>
            ) : (
              <Link key={l.to} to={l.to} className={linkCls(isActive(l.to))} aria-current={isActive(l.to) ? 'page' : undefined}>
                {l.label}
              </Link>
            ),
          )}

          {/* Resources dropdown */}
          <div className="relative group">
            <button
              type="button"
              className={`flex items-center gap-1 transition-colors ${RESOURCE_LINKS.some((r) => isActive(r.to)) ? 'text-white font-semibold' : 'hover:text-white'}`}
              aria-haspopup="true"
            >
              Resources
              <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" aria-hidden="true" />
            </button>
            <div
              className="absolute right-0 top-full pt-3 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 transition-all duration-150"
            >
              <div className="w-56 rounded-2xl border border-white/10 bg-[#0A1220] shadow-2xl shadow-black/50 p-1.5">
                {RESOURCE_LINKS.map((r) => (
                  <Link
                    key={r.to}
                    to={r.to}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] transition-colors ${
                      isActive(r.to) ? 'bg-blue-500/15 text-white font-semibold' : 'text-zinc-300 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    <r.icon className="w-4 h-4 text-blue-400" aria-hidden="true" />
                    {r.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>

        <div className="flex items-center gap-2.5">
          <AuthNavButtons />
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="md:hidden w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white/80"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
    </>
  );
};
