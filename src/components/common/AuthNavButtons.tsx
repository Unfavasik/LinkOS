import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, UserRound } from 'lucide-react';
import { StorageService } from '../../lib/storage';
import { useIsAdmin } from '../../lib/adminAuth';

/**
 * Header auth buttons. Logged-out visitors see Log In / Sign Up; a logged-in
 * user sees "My Account"; a verified admin sees "Admin Panel" instead.
 */
export const AuthNavButtons: React.FC = () => {
  const user = StorageService.getActiveUser();
  const isAdmin = useIsAdmin();

  if (user && isAdmin) {
    return (
      <Link
        to="/admin"
        className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2 text-sm font-bold text-[#231A02] transition-colors"
        aria-label="Admin Panel"
      >
        <ShieldCheck className="w-4 h-4" aria-hidden="true" />
        Admin Panel
      </Link>
    );
  }

  if (user) {
    return (
      <Link
        to="/dashboard"
        className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm font-bold text-white transition-colors"
        aria-label="My Account"
      >
        <UserRound className="w-4 h-4" aria-hidden="true" />
        My Account
      </Link>
    );
  }

  return (
    <>
      <Link
        to="/login"
        className="hidden sm:inline-flex items-center rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm font-semibold transition-colors"
      >
        Log In
      </Link>
      <Link
        to="/signup"
        className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm font-bold transition-colors"
      >
        Create Free Page <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </Link>
    </>
  );
};
