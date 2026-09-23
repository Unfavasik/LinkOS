import React from 'react';
import { Link } from 'react-router-dom';
import { Home, LayoutGrid, PlusCircle, BookOpen, UserRound, ShieldCheck } from 'lucide-react';
import { StorageService } from '../../lib/storage';
import { useIsAdmin } from '../../lib/adminAuth';

const TABS = [
  { label: 'Home', icon: Home, to: '/' },
  { label: 'Templates', icon: LayoutGrid, to: '/templates' },
  { label: 'Create', icon: PlusCircle, to: '/onboarding' },
  { label: 'Resources', icon: BookOpen, to: '/resources' },
];

export const MobileTabBar: React.FC<{ active: string }> = ({ active }) => {
  // Logged-in users get a My Account tab; verified admins get Admin Panel
  const loggedIn = !!StorageService.getActiveUser();
  const admin = useIsAdmin();
  const lastTab = admin
    ? { label: 'Admin Panel', icon: ShieldCheck, to: '/admin' }
    : loggedIn
    ? { label: 'My Account', icon: UserRound, to: '/dashboard' }
    : { label: 'Log In', icon: UserRound, to: '/login' };
  const tabs = [...TABS, lastTab];

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-slate-200 md:hidden"
    >
      <div className="max-w-2xl mx-auto grid grid-cols-5">
        {tabs.map(({ label, icon: Icon, to }) => {
          const isActive = label === active;
          return (
            <Link
              key={label}
              to={to}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.4 : 2} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
