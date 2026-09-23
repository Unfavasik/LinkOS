import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Settings,
  Database,
  Globe,
  AtSign,
  Check,
  AlertCircle,
  Sparkles,
  Shield,
  Save,
  RotateCcw,
} from 'lucide-react';
import { StorageService } from '../../lib/storage';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Profile } from '../../types';

export const SettingsPage: React.FC = () => {
  const { profile, setProfile } = useOutletContext<{
    profile: Profile | null;
    setProfile: (p: Profile) => void;
  }>();

  const [username, setUsername] = useState(profile?.username || '');
  const [checking, setChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Custom domain preview
  const [customDomain, setCustomDomain] = useState('anantseatcovers.in');

  useEffect(() => {
    if (profile?.username) {
      setUsername(profile.username);
    }
  }, [profile?.username]);

  const handleCheckAvailability = async (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(clean);
    if (clean === profile?.username) {
      setIsAvailable(true);
      return;
    }
    if (clean.length < 3) {
      setIsAvailable(null);
      return;
    }
    setChecking(true);
    const avail = await StorageService.checkUsernameAvailability(clean);
    setIsAvailable(avail);
    setChecking(false);
  };

  const handleSaveUsername = async () => {
    if (!profile || !username || isAvailable === false) return;
    const updated = await StorageService.saveProfile({ ...profile, username });
    setProfile(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleResetDemo = () => {
    if (
      window.confirm(
        'Reset to standard demo data? This will restore Urban Brew Café initial demo state.'
      )
    ) {
      StorageService.resetToDemo();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-2xs">
        <h1 className="text-xl font-bold text-zinc-900">Account & Page Settings</h1>
        <p className="text-xs text-zinc-500">
          Manage your public username, custom domain routing, and data storage configurations.
        </p>
      </div>

      {/* 1. Username & URL settings */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200/90 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm">
          <AtSign className="w-4 h-4 text-zinc-600" />
          <span>Public Page URL</span>
        </div>

        <p className="text-xs text-zinc-500">
          Changing your username immediately moves your link. Previous printed QR codes should be updated accordingly.
        </p>

        <div className="max-w-md">
          <div className="flex rounded-xl border border-zinc-300 overflow-hidden focus-within:ring-2 focus-within:ring-zinc-900">
            <span className="inline-flex items-center px-3.5 bg-zinc-100 text-zinc-500 text-xs font-mono border-r border-zinc-200">
              linkos.app/
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => handleCheckAvailability(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs sm:text-sm font-medium outline-hidden bg-white"
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-xs">
            {checking ? (
              <span className="text-zinc-400">Verifying availability...</span>
            ) : isAvailable === true ? (
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Available!
              </span>
            ) : isAvailable === false ? (
              <span className="text-red-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Already in use
              </span>
            ) : null}

            {saveSuccess && (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Updated!
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleSaveUsername}
            disabled={checking || isAvailable === false || username === profile?.username}
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 disabled:opacity-40 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Update URL</span>
          </button>
        </div>
      </div>

      {/* 2. Custom Domain (Pro feature) */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm">
            <Globe className="w-4 h-4 text-zinc-600" />
            <span>Custom Domain (LinkOS Pro)</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Pro Plan
          </span>
        </div>

        <p className="text-xs text-zinc-500">
          Connect your own `.com`, `.in`, or `.store` domain directly to your LinkOS page with automatic SSL certificates.
        </p>

        <div className="max-w-md space-y-3">
          <input
            type="text"
            value={customDomain}
            onChange={(e) => setCustomDomain(e.target.value)}
            placeholder="yourbusiness.com"
            className="w-full px-3.5 py-2 text-xs sm:text-sm border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 outline-hidden bg-white"
          />

          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs space-y-1.5 font-mono">
            <div className="text-zinc-500 font-sans font-semibold text-[11px]">
              DNS CNAME Configuration:
            </div>
            <div className="flex justify-between text-[11px] text-zinc-700">
              <span>Host: @ / www</span>
              <span>Points to: cname.linkos.app</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => alert('Custom domains are active on LinkOS Pro plan.')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
          >
            <span>Connect Custom Domain</span>
          </button>
        </div>
      </div>

      {/* 3. Database & Storage Status */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200/90 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm">
          <Database className="w-4 h-4 text-zinc-600" />
          <span>Database & Backend Persistence</span>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-800">Connection Mode:</span>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                isSupabaseConfigured
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-zinc-200 text-zinc-800'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-500'
                }`}
              />
              {isSupabaseConfigured ? 'Supabase Live Connected' : 'Local Storage Engine (Active)'}
            </span>
          </div>

          <p className="text-xs text-zinc-500 leading-relaxed">
            {isSupabaseConfigured
              ? 'Your applet is actively querying your remote Supabase PostgreSQL database.'
              : 'LinkOS is running with zero friction using its LocalStorage fallback engine. To connect a dedicated cloud database, add SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY to your environment variables.'}
          </p>
        </div>
      </div>

      {/* 4. Reset Demo Data */}
      <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-2xs flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-zinc-900">Reset Demo Business Data</h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Restore sample products, reviews, and test leads for Urban Brew Café.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetDemo}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-xs font-semibold text-red-700 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo</span>
        </button>
      </div>
    </div>
  );
};
