import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Store,
  FileText,
  LayoutGrid,
  CreditCard,
  ClipboardList,
  Inbox,
  BarChart3,
  QrCode,
  Megaphone,
  Settings,
  Search,
  Menu,
  Moon,
  Bell,
  ChevronDown,
  ChevronRight,
  Crown,
  ExternalLink,
  LogOut,
  Pencil,
  ShieldCheck,
  UserPlus,
  MessageSquare,
  Ban,
  CheckCheck,
  Headset,
  X,
  MessageSquareHeart,
  BookOpen,
  Home,
  Smartphone,
} from 'lucide-react';
import { LinkOsLogo } from '../../components/common/LinkOsLogo';
import { StorageService } from '../../lib/storage';
import { useAdminNotifications, markAllRead, getLastReadAt, type AdminNotification } from '../../lib/adminNotifications';
import { getCachedAdmin, verifyAdmin, type AdminRecord } from '../../lib/adminAuth';
import { canAccessSection, normalizeRole, type AdminSection } from '../../lib/adminPermissions';
import { isSupportModeActive, setSupportMode, getEffectiveRole } from '../../lib/supportMode';
import { AdminEditProfileModal } from '../../components/admin/AdminEditProfileModal';

const NAV_ITEMS: {
  label: string;
  icon: React.ElementType;
  to?: string;
  chevron?: boolean;
  section: AdminSection;
}[] = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin', section: 'dashboard' },
  { label: 'Users', icon: Users, to: '/admin/users', chevron: true, section: 'users' },
  { label: 'Businesses', icon: Store, to: '/admin/businesses', chevron: true, section: 'businesses' },
  { label: 'Pages', icon: FileText, to: '/admin/pages', section: 'pages' },
  { label: 'Templates', icon: LayoutGrid, to: '/admin/templates', chevron: true, section: 'templates' },
  { label: 'Plans & Payments', icon: CreditCard, to: '/admin/plans', section: 'plans' },
  { label: 'Orders & Bookings', icon: ClipboardList, to: '/admin/orders', section: 'orders' },
  { label: 'Inquiries / Leads', icon: Inbox, to: '/admin/inquiries', section: 'inquiries' },
  { label: 'Support Tickets', icon: Headset, to: '/admin/support', section: 'inquiries' },
  { label: 'Feedback', icon: MessageSquareHeart, to: '/admin/feedback', section: 'inquiries' },
  { label: 'Reviews & Reports', icon: BarChart3, to: '/admin/reviews', section: 'reviews' },
  { label: 'QR Codes', icon: QrCode, to: '/admin/qr-codes', section: 'qr-codes' },
  { label: 'Announcements', icon: Megaphone, to: '/admin/announcements', section: 'announcements' },
  { label: 'Help Articles', icon: BookOpen, to: '/admin/help-articles', section: 'announcements' },
  { label: 'Analytics', icon: BarChart3, to: '/admin/analytics', section: 'analytics' },
  { label: 'Settings', icon: Settings, to: '/admin/settings', section: 'settings' },
  { label: 'Manage Admins', icon: ShieldCheck, to: '/admin/manage-admins', section: 'manage-admins' },
];

const NOTIF_META: Record<AdminNotification['kind'], { icon: React.ElementType; cls: string }> = {
  business: { icon: UserPlus, cls: 'bg-emerald-500/15 text-emerald-400' },
  inquiry: { icon: MessageSquare, cls: 'bg-blue-500/15 text-blue-400' },
  suspended: { icon: Ban, cls: 'bg-red-500/15 text-red-400' },
};

function timeAgo(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

const NotifRow: React.FC<{ n: AdminNotification; go: (to: string) => void }> = ({ n, go }) => {
  const { icon: Icon, cls } = NOTIF_META[n.kind];
  const isUnread = new Date(n.created_at).getTime() > getLastReadAt();
  return (
    <button
      type="button"
      onClick={() => go(n.to)}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-white/[0.04] transition-colors border-b border-white/[0.04] last:border-0 ${
        isUnread ? 'bg-blue-500/[0.05]' : ''
      }`}
    >
      <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cls}`}>
        <Icon className="w-4 h-4" aria-hidden="true" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-1.5">
          <span className="text-[12px] font-semibold text-white truncate">{n.title}</span>
          {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" aria-label="Unread" />}
        </span>
        <span className="block text-[11px] text-slate-400 truncate mt-0.5">{n.detail}</span>
        <span className="block text-[10px] text-slate-500 mt-0.5">{timeAgo(n.created_at)}</span>
      </span>
    </button>
  );
};

export const AdminLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [activeUser, setActiveUser] = useState(StorageService.getActiveUser());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [admin, setAdmin] = useState<AdminRecord | null>(getCachedAdmin());
  const [editOpen, setEditOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [supportMode, setSupportModeState] = useState(isSupportModeActive());
  const notifRef = useRef<HTMLDivElement>(null);
  const { items: notifications, unread, isLoading: notifsLoading } = useAdminNotifications();

  const actualRole = normalizeRole(admin?.role);
  const effectiveRole = getEffectiveRole(admin?.role);
  const inSupportMode = effectiveRole === 'support';

  const toggleSupportMode = (on: boolean) => {
    setSupportMode(on);
    setSupportModeState(on);
  };

  // Close the notifications panel on outside click
  useEffect(() => {
    if (!notifOpen) return;
    const onDown = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [notifOpen]);
  const displayName = admin?.display_name?.trim() || admin?.email?.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || activeUser?.email?.split('@')[0] || 'Admin';
  const avatarUrl = admin?.avatar_url || null;

  useEffect(() => {
    setActiveUser(StorageService.getActiveUser());
    // Re-verify so a fresh display_name / avatar_url shows even after reload
    const user = StorageService.getActiveUser();
    if (user) verifyAdmin(user.email, user.id).then(setAdmin);
  }, []);

  const handleLogout = () => {
    StorageService.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#04070F] text-slate-200 font-sans" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
      {/* Mobile scrim */}
      {drawerOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar — off-canvas drawer on mobile, fixed rail on desktop */}
      <aside
        className={`fixed inset-y-0 left-0 w-[240px] bg-[#060B16] border-r border-white/[0.06] flex flex-col z-50 transition-transform duration-200 lg:translate-x-0 ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Admin sidebar"
      >
        <div className="px-5 pt-5 pb-4">
          <LinkOsLogo className="h-8" tone="light" />
          <p className="mt-1 text-[11px] font-medium text-slate-500 pl-9">Admin Panel</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 space-y-0.5 py-2" aria-label="Admin navigation">
          {NAV_ITEMS.filter((item) => canAccessSection(effectiveRole, item.section)).map(({ label, icon: Icon, to, chevron }) => (
            <NavLink
              key={label}
              to={to || '/admin'}
              end={to === '/admin'}
              onClick={to ? () => setDrawerOpen(false) : (e) => e.preventDefault()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
                  isActive && to
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`
              }
            >
              <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.9} aria-hidden="true" />
              <span className="flex-1 truncate">{label}</span>
              {chevron && <ChevronRight className="w-3.5 h-3.5 opacity-60" aria-hidden="true" />}
            </NavLink>
          ))}
        </nav>

        {/* Pro card */}
        <div className="px-3 pb-3">
          <div className="rounded-2xl bg-gradient-to-br from-blue-600/25 to-blue-900/20 border border-blue-500/30 p-4">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-amber-400/15 flex items-center justify-center">
                <Crown className="w-4.5 h-4.5 text-amber-400" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[13px] font-bold text-white leading-tight">LinkOS Pro</p>
                <p className="text-[10px] text-slate-400">Manage, Grow, Scale</p>
              </div>
            </div>
            <a
              href="/"
              className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 rounded-lg border border-blue-400/40 text-[12px] font-semibold text-blue-300 hover:bg-blue-500/10 transition-colors"
            >
              View Site
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="px-5 pb-4 pt-1 border-t border-white/[0.06]">
          <p className="text-[10px] text-slate-500 mt-3">LinkOS Admin &nbsp;v1.0.0</p>
          <p className="text-[10px] text-slate-600 mt-0.5">Built with &hearts; for local businesses</p>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:ml-[240px] min-h-screen flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 bg-[#04070F]/90 backdrop-blur border-b border-white/[0.06] flex items-center gap-3 px-4 sm:gap-4 sm:px-6">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="lg:hidden w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search users, businesses, pages..."
              aria-label="Search admin panel"
              className="w-full h-10 pl-10 pr-3 sm:pr-16 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[13px] text-slate-200 placeholder:text-slate-500 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            <kbd className="hidden sm:block absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-[10px] font-semibold text-slate-400">
              Ctrl K
            </kbd>
          </div>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              title="View Home Landing Page"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 transition-colors"
            >
              <Home className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden md:inline">Home</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              title="Open User Dashboard"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-xs font-semibold text-blue-300 transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden md:inline">Dashboard</span>
            </button>

            <button
              type="button"
              aria-label="Toggle dark mode"
              className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <Moon className="w-[18px] h-[18px]" aria-hidden="true" />
            </button>
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
                aria-expanded={notifOpen}
                onClick={() => setNotifOpen((v) => !v)}
                className="relative w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <Bell className="w-[18px] h-[18px]" aria-hidden="true" />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 ring-2 ring-[#04070F] flex items-center justify-center text-[9px] font-bold text-white">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div
                  role="dialog"
                  aria-label="Notifications panel"
                  className="absolute right-0 top-11 w-[320px] sm:w-[360px] rounded-2xl bg-[#0A1220] border border-white/[0.08] shadow-2xl shadow-black/50 overflow-hidden z-50"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                    <p className="text-[13px] font-bold text-white">Notifications</p>
                    {unread > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          markAllRead();
                          setNotifOpen(false);
                          setTimeout(() => setNotifOpen(true), 0);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <CheckCheck className="w-3.5 h-3.5" aria-hidden="true" /> Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[360px] overflow-y-auto">
                    {notifsLoading && notifications.length === 0 ? (
                      <p className="px-4 py-6 text-center text-[12px] text-slate-500">Loading…</p>
                    ) : notifications.length === 0 ? (
                      <p className="px-4 py-6 text-center text-[12px] text-slate-500">No notifications yet</p>
                    ) : (
                      notifications.map((n) => (
                        <NotifRow
                          key={n.id}
                          n={n}
                          go={(to) => {
                            setNotifOpen(false);
                            navigate(to);
                          }}
                        />
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="relative flex items-center gap-2 sm:gap-2.5 pl-2 sm:ml-1 sm:border-l border-white/[0.08]">
              <button
                type="button"
                onClick={() => setProfileOpen((v) => !v)}
                aria-label="Open profile menu"
                aria-expanded={profileOpen}
                className="flex items-center gap-2.5 shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/60"
              >
                {avatarUrl?.trim() ? (
                  <img
                    src={avatarUrl.trim()}
                    alt=""
                    aria-hidden="true"
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/40"
                  />
                ) : (
                  <span className="w-9 h-9 rounded-full bg-blue-600/20 ring-2 ring-blue-500/40 flex items-center justify-center text-[13px] font-bold text-blue-300">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="hidden md:block leading-tight text-left">
                  <p className="text-[13px] font-semibold text-white">{displayName}</p>
                  <p className="text-[11px] text-slate-500 capitalize">
                    {inSupportMode ? 'Support Mode' : admin?.role || 'Super Admin'}
                  </p>
                </div>
              </button>

              {profileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    aria-hidden="true"
                    onClick={() => setProfileOpen(false)}
                  />
                  <div
                    role="menu"
                    aria-label="Profile menu"
                    className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10 overflow-hidden"
                  >
                    <div className="px-4 pt-4 pb-3">
                      <p className="text-[15px] font-bold text-slate-900 truncate">{displayName}</p>
                      <p className="text-[13px] text-slate-500 truncate">{admin?.email || activeUser?.email}</p>
                    </div>
                    <div className="h-px bg-slate-100" aria-hidden="true" />
                    <div className="p-1.5">
                      {actualRole !== 'support' && (
                        <button
                          type="button"
                          role="menuitem"
                          aria-pressed={supportMode}
                          onClick={() => {
                            toggleSupportMode(!supportMode);
                            setProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
                        >
                          <Headset className="w-4 h-4 text-slate-500" aria-hidden="true" />
                          <span className="flex-1 text-left">
                            {supportMode ? 'Turn Off Support Mode' : 'View as Support Mode'}
                          </span>
                          <span
                            aria-hidden="true"
                            className={`w-9 h-5 rounded-full relative transition-colors ${supportMode ? 'bg-blue-600' : 'bg-slate-300'}`}
                          >
                            <span
                              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${supportMode ? 'left-[18px]' : 'left-0.5'}`}
                            />
                          </span>
                        </button>
                      )}
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setProfileOpen(false);
                          setEditOpen(true);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
                      >
                        <Pencil className="w-4 h-4 text-slate-500" aria-hidden="true" />
                        Edit Profile
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-semibold text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" aria-hidden="true" />
                        Log Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          {inSupportMode && (
            <div
              role="status"
              className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl bg-blue-500/[0.08] border border-blue-400/25 px-4 py-3"
            >
              <span className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
                <Headset className="w-4 h-4 text-blue-400" aria-hidden="true" />
              </span>
              <div className="flex-1 min-w-[200px]">
                <p className="text-[13px] font-bold text-white flex items-center gap-2">
                  Support Mode
                  <span className="px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-400/30 text-[10px] font-semibold text-blue-300 uppercase tracking-wide">
                    Limited access
                  </span>
                </p>
                <p className="text-[12px] text-slate-400 mt-0.5">
                  You can only view users, preview businesses and handle inquiries.
                </p>
              </div>
              {actualRole !== 'support' && (
                <button
                  type="button"
                  onClick={() => toggleSupportMode(false)}
                  className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-blue-400/40 text-[12px] font-semibold text-blue-300 hover:bg-blue-500/10 transition-colors"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                  Turn Off
                </button>
              )}
            </div>
          )}
          {children}
        </main>
      </div>

      <AdminEditProfileModal
        open={editOpen}
        admin={admin}
        onClose={() => setEditOpen(false)}
        onSaved={(updated) => setAdmin(updated)}
      />
    </div>
  );
};
