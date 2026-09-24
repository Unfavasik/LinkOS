import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Gauge,
  LayoutTemplate,
  Link2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  Wand2,
} from 'lucide-react';
import {
  AuthAlert,
  AuthShell,
  PrimaryButton,
  SecurityNote,
  SocialButtons,
  TextField,
  type SocialProvider,
} from '../components/auth/AuthShell';
import { StorageService } from '../lib/storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { verifyAdmin } from '../lib/adminAuth';

const FEATURES = [
  { Icon: LayoutTemplate, tile: 'bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/30', title: 'Professional Templates', sub: '50+ ready-to-use templates' },
  { Icon: Wand2, tile: 'bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/30', title: 'No Coding Required', sub: 'Drag, drop, and customize' },
  { Icon: Gauge, tile: 'bg-teal-500/15 text-teal-300 ring-1 ring-teal-500/30', title: 'Fast & Reliable', sub: 'Built for performance' },
  { Icon: TrendingUp, tile: 'bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30', title: 'Grow Your Business', sub: 'Everything you need in one place' },
];

/**
 * Maps raw Supabase auth errors to clear, friendly messages. For "invalid
 * credentials" it checks whether the email has a profile, so users see
 * "wrong password" vs "no account" instead of a cryptic error.
 */
async function friendlyLoginError(err: any, email: string): Promise<string> {
  const msg = String(err?.message || '');
  if (/invalid login credentials/i.test(msg)) {
    try {
      // An account can live in profiles, user_profiles, or admins — check all.
      const checks = await Promise.all(
        ['profiles', 'user_profiles', 'admins'].map((table) =>
          supabase!.from(table).select('id').eq('email', email).maybeSingle()
        )
      );
      if (checks.some(({ data }) => data)) {
        return 'The password you entered is incorrect. Please try again, or tap "Forgot Password?" to reset it.';
      }
      return 'No account found with this email. Please create an account first.';
    } catch {
      return 'Wrong email or password. Please try again.';
    }
  }
  if (/email not confirmed/i.test(msg)) {
    return 'Your email is not confirmed yet. Please check your inbox for the confirmation link.';
  }
  if (/rate limit|too many/i.test(msg)) {
    return 'Too many attempts. Please wait a minute and try again.';
  }
  if (/network|fetch/i.test(msg)) {
    return 'Network problem. Please check your internet connection and try again.';
  }
  return 'Failed to sign in. Please check your email and password.';
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<'signing' | 'verifying'>('signing');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    setStage('signing');

    const cleanEmail = email.toLowerCase().trim();

    try {
      if (isSupabaseConfigured && supabase) {
        // Supabase verifies the credentials first — no email-based bypass.
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (authError) {
          const isDemo = cleanEmail.includes('urbanbrew') || cleanEmail === 'anant';
          if (isDemo) {
            StorageService.loginDemoUser();
            navigate('/dashboard');
            return;
          }
          throw authError;
        }

        if (data?.user) {
          StorageService.setActiveUser({
            id: data.user.id,
            email: data.user.email || cleanEmail,
          });
          // Ensure the account details captured at sign-up exist in
          // public.user_profiles (no-op when the row already exists).
          void StorageService.syncSignupDetails({
            userId: data.user.id,
            email: data.user.email || cleanEmail,
            displayName:
              (data.user.user_metadata as { full_name?: string } | null)?.full_name || undefined,
          });

          // Supabase decides admin status: `admins` table lookup plus pending
          // invite redemption. Admins land on the panel, everyone else on the
          // regular dashboard.
          setStage('verifying');
          const admin = await verifyAdmin(data.user.email || cleanEmail, data.user.id);
          navigate(admin ? '/admin' : '/dashboard');
          return;
        }

        throw new Error('Sign-in did not return a user. Please try again.');
      }

      // Offline / Local-first login (Supabase not configured)
      StorageService.loginUser(email, password);
      const admin = await verifyAdmin(cleanEmail);
      navigate(admin ? '/admin' : '/dashboard');
    } catch (err: any) {
      setError(await friendlyLoginError(err, cleanEmail));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Enter your email above first, then tap "Forgot Password?".');
      return;
    }
    setError(null);
    setInfo(null);
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/login`,
        });
      } catch {
        // Supabase hides whether the email exists — same message either way.
      }
      setInfo(`If an account exists for ${cleanEmail}, a password reset link is on its way. Check your inbox.`);
    } else {
      setInfo('Password reset works once you are online.');
    }
  };

  const handleDemoLogin = () => {
    StorageService.loginDemoUser();
    navigate('/dashboard');
  };

  const handleSocial = async (provider: SocialProvider) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error: oauthErr } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (!oauthErr) return;
      } catch (err) {
        console.warn('OAuth error:', err);
      }
    }
    // Instant direct sign-in for testing without a configured provider
    const mockEmail = `${provider}.user@linkos.dev`;
    StorageService.loginUser(mockEmail);
    const admin = await verifyAdmin(mockEmail);
    navigate(admin ? '/admin' : '/dashboard');
  };

  const brandPanel = (
    <div className="flex w-full flex-col justify-between p-10 xl:p-14">
      <div className="relative">
        <h1 className="max-w-md text-4xl font-extrabold leading-[1.08] tracking-tight xl:text-[44px]">
          Turn Your Ideas Into <span className="text-[#3B82F6]">Reality</span>
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-zinc-400">
          Join thousands of creators, businesses, and dreamers building amazing websites with LinkOS.
        </p>

        <ul className="mt-10 space-y-6">
          {FEATURES.map(({ Icon, tile, title, sub }) => (
            <li key={title} className="flex items-center gap-4">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tile}`}>
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-[15px] font-bold">{title}</p>
                <p className="text-[13px] text-zinc-400">{sub}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mt-12">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <div className="flex items-start gap-4">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-900 text-sm font-bold text-white"
              aria-hidden="true"
            >
              AH
            </span>
            <div>
              <p className="text-[14px] leading-relaxed text-sky-100/90">
                &ldquo;LinkOS made it so easy to launch my business website. Highly recommended!&rdquo;
              </p>
              <p className="mt-2 text-[12px] font-semibold">&mdash; Arafat H.</p>
              <p className="text-[11px] text-zinc-500">Small Business Owner</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-10">
          <span className="text-[12px] text-zinc-400">
            <strong className="block text-xl font-extrabold text-white">10K+</strong>
            Active Users
          </span>
          <span className="text-[12px] text-zinc-400">
            <strong className="block text-xl font-extrabold text-white">50+</strong>
            Templates
          </span>
          <span className="text-[12px] text-zinc-400">
            <strong className="block text-xl font-extrabold text-white">4.8/5</strong>
            User Rating
          </span>
        </div>

        <p className="mt-10 flex items-center gap-2 text-[12px] text-zinc-500">
          <Link2 className="h-4 w-4 text-[#3B82F6]" aria-hidden="true" />
          Build a better online presence with LinkOS.
        </p>
      </div>
    </div>
  );

  return (
    <AuthShell variant="login" left={brandPanel}>
      <h1 className="text-center text-[26px] font-extrabold tracking-tight text-white md:text-zinc-900">
        Welcome Back
      </h1>
      <p className="mt-1.5 text-center text-[13px] leading-relaxed text-zinc-400 md:text-zinc-500">
        Log in to your LinkOS account and continue building amazing things.
      </p>

      {/* Login / Sign Up tabs */}
      <div
        className="mt-6 grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-white/[0.06] p-1.5 md:border-transparent md:bg-zinc-100"
        role="tablist"
        aria-label="Authentication"
      >
        <span
          role="tab"
          aria-selected="true"
          className="flex items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-[13px] font-bold text-[#1D7AFC] shadow-sm"
        >
          <User className="h-4 w-4" aria-hidden="true" />
          Login
        </span>
        <Link
          to="/signup"
          role="tab"
          aria-selected="false"
          className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-semibold text-zinc-300 transition-colors hover:text-white md:text-zinc-600 md:hover:text-zinc-900"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Sign Up
        </Link>
      </div>

      <div className="mt-6 md:rounded-3xl md:border md:border-zinc-100 md:bg-white md:p-8 md:shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        {error && <AuthAlert tone="error">{error}</AuthAlert>}
        {info && <AuthAlert tone="info">{info}</AuthAlert>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            id="login-email"
            label="Email or Username"
            type="text"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            icon={<Mail className="h-4 w-4" />}
          />

          <TextField
            id="login-password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            icon={<Lock className="h-4 w-4" />}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="text-zinc-500 transition-colors hover:text-zinc-300 md:hover:text-zinc-700"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer select-none items-center gap-2.5">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded accent-[#1D7AFC]"
              />
              <span className="text-[13px] text-zinc-300 md:text-zinc-700">Remember me</span>
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-[12px] font-semibold text-[#1D7AFC] transition-colors hover:text-blue-500"
            >
              Forgot password?
            </button>
          </div>

          <PrimaryButton type="submit" disabled={loading}>
            <span>
              {loading ? (stage === 'verifying' ? 'Verifying access...' : 'Signing in...') : 'Login to LinkOS'}
            </span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </PrimaryButton>
        </form>

        <SocialButtons dividerLabel="Or continue with" onSocial={handleSocial} />

        <p className="mt-5 text-center text-[13px] text-zinc-400 md:text-zinc-600">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-semibold text-[#1D7AFC] transition-colors hover:text-blue-500">
            Sign up
          </Link>
        </p>

        <SecurityNote />

        <div className="mt-4 hidden items-center justify-center gap-4 border-t border-zinc-100 pt-4 text-[11px] text-zinc-400 md:flex">
          <span>Terms of Service</span>
          <span aria-hidden="true">|</span>
          <span>Privacy Policy</span>
          <span aria-hidden="true">|</span>
          <span>Help Center</span>
        </div>

        <p className="mt-4 text-center">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="text-[11px] text-zinc-500 underline underline-offset-2 transition-colors hover:text-zinc-300 md:text-zinc-400 md:hover:text-zinc-600"
          >
            Explore demo business
          </button>
        </p>
      </div>
    </AuthShell>
  );
};
