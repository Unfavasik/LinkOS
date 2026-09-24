import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LogOut,
  User,
  FileText,
  Calendar,
  Info,
  Mail,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { LinkOsLogo } from '../components/common/LinkOsLogo';
import { StorageService } from '../lib/storage';
import type { Profile } from '../types';

const formatDate = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    + ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

export const SuspendedAccountPage: React.FC<{ profile?: Profile | null }> = ({ profile }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    StorageService.logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#050B18] text-white">
      <div className="mx-auto w-full max-w-md px-5 pb-12">
        {/* Top bar */}
        <header className="flex items-center justify-between py-5">
          <LinkOsLogo className="h-9 w-auto" />
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </header>

        {/* Illustration */}
        <img
          src="/images/suspended-account.png"
          alt="Illustration of a locked account"
          className="mx-auto mt-2 w-full max-w-sm rounded-3xl"
        />

        {/* Heading */}
        <h1 className="mt-5 text-center text-3xl font-extrabold tracking-tight text-balance">
          Your Account is <span className="text-red-500">Suspended</span>
        </h1>
        <p className="mt-3 text-center text-sm leading-relaxed text-slate-400 text-pretty">
          Your LinkOS account has been suspended by the admin for a violation of our terms or community guidelines.
        </p>

        {/* Status card */}
        <div className="mt-7 rounded-2xl border border-white/10 bg-[#0B1424]">
          <div className="flex items-center gap-3 border-b border-white/10 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/15">
              <User className="h-5 w-5 text-red-400" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">Account Status</p>
              <p className="text-sm text-red-400">Suspended</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-bold text-red-400">
              Suspended
            </span>
          </div>
          <div className="flex items-center gap-3 border-b border-white/10 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5">
              <FileText className="h-5 w-5 text-slate-300" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold">Reason</p>
              <p className="text-sm text-slate-400">Violation of terms or policy</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5">
              <Calendar className="h-5 w-5 text-slate-300" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold">Suspended On</p>
              <p className="text-sm text-slate-400">{formatDate(profile?.updated_at)}</p>
            </div>
          </div>
        </div>

        {/* What happens now */}
        <div className="mt-4 rounded-2xl border border-white/10 bg-[#0B1424] p-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600">
              <Info className="h-4 w-4 text-white" />
            </span>
            <h2 className="text-sm font-bold">What happens now?</h2>
          </div>
          <ul className="mt-3 space-y-2 pl-1 text-[13px] leading-relaxed text-slate-400">
            <li className="flex gap-2">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-500" />
              You won&apos;t be able to access your websites, templates or data.
            </li>
            <li className="flex gap-2">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-500" />
              Your websites are currently unpublished.
            </li>
            <li className="flex gap-2">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-500" />
              If you think this is a mistake, you can appeal for a review.
            </li>
          </ul>
        </div>

        {/* Actions */}
        <Link
          to="/help/contact"
          className="mt-6 flex items-center justify-between rounded-xl bg-blue-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-500 transition-colors"
        >
          <span className="inline-flex items-center gap-3">
            <Mail className="h-5 w-5" />
            Appeal This Decision
          </span>
          <ArrowRight className="h-5 w-5" />
        </Link>
        <Link
          to="/legal"
          className="mt-3 flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-5 py-4 text-sm font-bold text-white hover:bg-white/10 transition-colors"
        >
          <span className="inline-flex items-center gap-3">
            <BookOpen className="h-5 w-5" />
            Read Our Terms of Service
          </span>
          <ArrowRight className="h-5 w-5" />
        </Link>

        {/* Help footer */}
        <div className="mt-8 text-center">
          <p className="text-sm font-bold">Need Help?</p>
          <p className="mt-1 text-xs text-slate-400">If you have any questions, contact our support team.</p>
          <Link to="/help/contact" className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-blue-400 hover:text-blue-300">
            Contact Support
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
