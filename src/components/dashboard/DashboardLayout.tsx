import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Globe,
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  QrCode as QrIcon,
  Ticket,
  LayoutTemplate,
  Bookmark,
  Settings,
  ExternalLink,
  Share2,
  Edit3,
  Copy,
  Check,
  LogOut,
  Sparkles,
  HelpCircle,
  Menu,
  X,
  CreditCard,
  Search,
  Bell,
  UserCog,
  Loader2,
  Home,
  ShieldCheck,
  Megaphone,
} from 'lucide-react';
import useSWR from 'swr';
import { LinkOsLogo } from '../common/LinkOsLogo';
import { StorageService } from '../../lib/storage';
import { Profile } from '../../types';
import { ShareModal } from '../profile/ShareModal';
import { useIsAdmin, isKnownAdminEmail } from '../../lib/adminAuth';

import { loadPublishedAnnouncements, type Announcement } from '../../lib/announcements';
import { useUserNotifications } from '../../lib/userNotifications';

export const DashboardLayout: React.FC = () => {
  const location = useLocation();
  // The page editor is a focused full-screen experience with its own header — hide global chrome there
  const isEditorRoute = location.pathname.startsWith('/dashboard/editor');
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [copied, setCopied] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const { unread: notifUnread } = useUserNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const isVerifiedAdmin = useIsAdmin();

  // Latest published announcement, shown inside the menu.
  const { data: announcements } = useSWR('dashboard-announcements', loadPublishedAnnouncements, {
    revalidateOnFocus: false,
  });
  const latestAnnouncement: Announcement | undefined = announcements?.find((a) => a.published);
  const isAdmin = isVerifiedAdmin || isKnownAdminEmail(profile?.email) || profile?.role === 'owner' || profile?.role === 'admin';

  useEffect(() => {
    let isMounted = true;
    async function load() {
      const activeUser = StorageService.getActiveUser();
      if (!activeUser) {
        navigate('/login');
        return;
      }
      const p = await StorageService.getCurrentUserProfile();
      if (!isMounted) return;
      if (!p) {
        navigate('/login');
        return;
      }
      setProfile(p);
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [location.pathname, navigate]);

  // Admins never use the user dashboard: send them straight to the admin
  // panel, even if they navigate to /dashboard manually.
  useEffect(() => {
    if (isVerifiedAdmin) navigate('/admin', { replace: true });
  }, [isVerifiedAdmin, navigate]);

  const username = profile?.username || '';
  const fullPageUrl = `${window.location.origin}/${username}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullPageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    StorageService.logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard, exact: true },
    { label: 'My Websites', path: '/dashboard/websites', icon: Globe },
    { label: 'Templates', path: '/dashboard/templates', icon: LayoutTemplate },
    { label: 'Saved Templates', path: '/dashboard/templates?view=saved', query: 'view=saved', icon: Bookmark },
    { label: 'Products', path: '/dashboard/products', icon: Package },
    { label: 'Orders', path: '/dashboard/orders', icon: ShoppingBag },
    { label: 'Live Queue', path: '/dashboard/queue', icon: Ticket },
    { label: 'Customers', path: '/dashboard/customers', icon: Users },
    { label: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
    { label: 'QR Code', path: '/dashboard/qr', icon: QrIcon },
    { label: 'Edit Profile', path: '/dashboard/profile', icon: UserCog },
    { label: 'Needle Assistant', path: '/dashboard/assistant', icon: Sparkles },
    { label: 'Announcements', path: '/announcements', icon: Megaphone },
    { label: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  const isActive = (item: { path: string; exact?: boolean; query?: string }) => {
    const itemPath = item.path.split('?')[0];
    if (item.exact) {
      return location.pathname === itemPath;
    }
    const base = location.pathname.startsWith(itemPath);
    // Items like "Saved Templates" share a route with a sibling tab — only
    // highlight when the matching query param is present.
    if (item.query) {
      return base && location.search.includes(item.query);
    }
    return base;
  };

  const ownerInitials = (profile?.business_name || 'L')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Latest announcement card, rendered inside both the desktop sidebar and
  // the mobile drawer menu.
  const announcementCard = latestAnnouncement ? (
    <Link
      to="/announcements"
      className="block p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/25 hover:bg-blue-500/15 transition-colors"
    >
      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-300 mb-1">
        <Megaphone className="w-3.5 h-3.5" />
        <span>Announcement</span>
      </div>
      <p className="text-[11px] font-semibold text-white leading-snug line-clamp-2">
        {latestAnnouncement.title}
      </p>
      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{latestAnnouncement.body}</p>
      <span className="inline-block mt-1.5 text-[10px] font-bold text-blue-400">View all →</span>
    </Link>
  ) : null;

  // Don't render the dashboard with default/placeholder data while the
  // profile is still loading — it flashes the wrong name and no avatar.
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#060D1A] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" aria-label="Loading dashboard" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060D1A] text-white flex flex-col selection:bg-blue-600 selection:text-white">
      {/* 1. TOP HEADER */}
      <header hidden={isEditorRoute} className="sticky top-0 z-40 bg-[#060D1A]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Mobile hamburger & Logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:bg-white/10"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/dashboard">
              <LinkOsLogo size="md" tone="light" />
            </Link>
          </div>

          {/* Center: Live page URL pill (desktop) */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 max-w-sm truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-slate-400 font-medium">Your Page:</span>
            <span className="font-mono font-semibold text-white truncate">
              linkos.in/{username}
            </span>
          </div>

          {/* Right: Home, Admin Panel, search, notifications, avatar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 transition-colors"
              title="Return to Home Page"
            >
              <Home className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Home</span>
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-bold text-amber-300 transition-colors shadow-sm animate-pulse hover:animate-none"
                title="Open Admin Control Center"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Panel</span>
              </Link>
            )}

            <button
              type="button"
              onClick={handleCopyLink}
              title="Copy Page Link"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied' : 'Copy Link'}</span>
            </button>

            <Link
              to="/dashboard/templates"
              aria-label="Search templates"
              className="p-2.5 rounded-full hover:bg-white/10 text-slate-300 transition-colors"
            >
              <Search className="w-5 h-5" />
            </Link>

            <button
              type="button"
              aria-label="Notifications"
              onClick={() => navigate('/dashboard/notifications')}
              className="relative p-2.5 rounded-full hover:bg-white/10 text-slate-300 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {notifUnread > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
                  {notifUnread > 9 ? '9+' : notifUnread}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsShareOpen(true)}
              aria-label="Share page"
              className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 border-2 border-white/20 flex items-center justify-center text-[11px] font-extrabold text-white shrink-0 hover:border-white/40 transition-colors overflow-hidden"
            >
              {profile?.avatar_url?.trim() ? (
                <img
                  src={profile.avatar_url.trim()}
                  alt={`${profile.business_name || 'User'} avatar`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src="/images/default-avatar.png"
                  alt="Default avatar"
                  className="w-full h-full object-cover"
                />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 2. BODY LAYOUT (Sidebar + Main Area) */}
      <div className={`flex-1 w-full mx-auto py-6 flex gap-8 ${isEditorRoute ? 'px-4 sm:px-6' : 'max-w-7xl px-4 sm:px-6 lg:px-8'}`}>
        {/* Desktop Sidebar */}
        <aside hidden={isEditorRoute} className="hidden lg:flex flex-col w-56 shrink-0 space-y-6">
          <nav className="space-y-1">
            {/* Quick Home button */}
            <Link
              to="/"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors group mb-2 border border-white/5"
            >
              <Home className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <span>Home Page</span>
            </Link>

            {/* Special Admin Control Room link if user is admin */}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all shadow-md mb-2"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span className="flex-1">Admin Panel</span>
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-400 text-black font-black">ADMIN</span>
              </Link>
            )}

            {navItems.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Latest Announcement */}
          {announcementCard && <div className="mb-3">{announcementCard}</div>}

          {/* Pro Upgrade Teaser Card */}
          <div className="p-3.5 rounded-xl bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/20 text-left">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>LinkOS Pro</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
              Remove branding, connect custom domain &amp; get unlimited products.
            </p>
            <Link
              to="/dashboard/settings"
              className="w-full inline-flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#1A1300] text-[11px] font-bold transition-colors"
            >
              <CreditCard className="w-3 h-3" />
              <span>Upgrade ₹199/mo</span>
            </Link>
          </div>

          {/* Bottom links: Help & Logout */}
          <div className="mt-auto pt-4 border-t border-white/10 space-y-1">
            <a
              href="https://wa.me/?text=Need%20help%20with%20LinkOS"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Help &amp; Support</span>
            </a>
            <button
              type="button"
              onClick={() => setConfirmLogout(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Mobile Slide-out Drawer */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-50 lg:hidden bg-black/60 backdrop-blur-xs flex"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="w-64 bg-[#0B1424] h-full p-5 shadow-2xl flex flex-col justify-between border-r border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                  <LinkOsLogo size="sm" tone="light" />
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded-md text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {/* Home Link */}
                  <Link
                    to="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors mb-2 border border-white/5"
                  >
                    <Home className="w-4 h-4 text-blue-400" />
                    <span>Home Page</span>
                  </Link>

                  {/* Admin Panel Link */}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all mb-2"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span className="flex-1">Admin Panel</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-400 text-black font-black">ADMIN</span>
                    </Link>
                  )}

                  {navItems.map((item) => {
                    const active = isActive(item);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                          active
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                {/* Latest Announcement */}
                {announcementCard && <div className="mt-4">{announcementCard}</div>}
              </div>

              <div className="pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setConfirmLogout(true)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 pb-16 lg:pb-0">
          <Outlet context={{ profile, setProfile }} />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav hidden={isEditorRoute} className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B1424]/95 backdrop-blur-md border-t border-white/10 px-2 py-1.5 flex items-center justify-around">
        {navItems.slice(0, 5).map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors ${
                active ? 'text-blue-400 font-bold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Confirmation */}
      {confirmLogout && (
        <div
          className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setConfirmLogout(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Confirm sign out"
        >
          <div
            className="w-full max-w-xs bg-[#0B1424] border border-white/10 rounded-2xl p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center mb-3">
              <LogOut className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-sm font-bold text-white">Sign out of LinkOS?</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              You will need to sign in again to manage your pages and websites.
            </p>
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => setConfirmLogout(false)}
                className="flex-1 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-xs font-bold text-white transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {profile && (
        <ShareModal
          profile={profile}
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
        />
      )}
    </div>
  );
};
