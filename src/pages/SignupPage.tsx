import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, Eye, EyeOff, User, ShieldCheck, Users, Zap, AlertCircle } from 'lucide-react';
import { AuthShell, SocialButtons } from '../components/auth/AuthShell';
import { StorageService } from '../lib/storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { resolvePostAuthRoute, verifyAdmin } from '../lib/adminAuth';

const COLLAGE = [
  { src: '/images/cafe/interior.webp', alt: 'Café interior', cls: 'left-0 top-0 w-28 h-20 -rotate-6' },
  { src: '/images/collage/gym.webp', alt: 'Gym', cls: 'right-0 top-0 w-24 h-20 rotate-6' },
  { src: '/images/collage/car-detailing.webp', alt: 'Car detailing workshop', cls: 'left-2 bottom-0 w-24 h-20 rotate-3' },
  { src: '/images/collage/clothing.webp', alt: 'Clothing store', cls: 'right-2 bottom-0 w-24 h-24 -rotate-3' },
];

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        // One credential set per user: try signing in first. Only create a new
        // account when the email has never been registered.
        const { data: signIn, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signIn?.user) {
          StorageService.setActiveUser({
            id: signIn.user.id,
            email: signIn.user.email || email,
            business_name: fullName || 'My Business',
          });
          // Admins never land on the user dashboard.
          navigate(await resolvePostAuthRoute(signIn.user.email || email, signIn.user.id));
          return;
        }

        // Wrong password for an existing account — do not create a duplicate.
        if (signInError && /email not confirmed/i.test(signInError.message)) {
          throw new Error('This email is registered but not confirmed yet. Please check your inbox for the confirmation link.');
        }
        if (
          signInError &&
          !/invalid login credentials/i.test(signInError.message)
        ) {
          throw signInError;
        }

        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) {
          if (/already registered|already exists|already been/i.test(authError.message)) {
            throw new Error(
              'This email is already registered. The password you entered does not match — please log in instead.'
            );
          }
          throw authError;
        }
        if (!data.user) throw new Error('Account creation failed. Please try again.');

        if (!data.session) {
          // No session: either the email already exists (Supabase returns an
          // obfuscated success) or the new account awaits email confirmation.
          const { data: retry, error: retryError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (retry?.user) {
            StorageService.setActiveUser({
              id: retry.user.id,
              email: retry.user.email || email,
              business_name: fullName || 'My Business',
            });
            navigate(await resolvePostAuthRoute(retry.user.email || email, retry.user.id));
            return;
          }
          if (retryError && !/email not confirmed/i.test(retryError.message)) {
            throw new Error(
              'This email is already registered with a different password. Please log in instead.'
            );
          }
          // New account awaiting confirmation — continue locally for now.
        }

        StorageService.setActiveUser({
          id: data.user.id,
          email: data.user.email || email,
          business_name: fullName || 'My Business',
        });
        // An invited admin signing up for the first time goes straight to the
        // admin panel; everyone else starts onboarding.
        const adminRoute = await verifyAdmin(data.user.email || email, data.user.id);
        navigate(adminRoute ? '/admin' : '/onboarding');
        return;
      }

      // Offline / Local-first user creation
      const { user } = StorageService.loginUser(email, password);
      if (fullName) {
        user.business_name = fullName;
        StorageService.setActiveUser(user);
        const p = await StorageService.getCurrentUserProfile();
        if (p) {
          p.business_name = fullName;
          await StorageService.saveProfile(p);
        }
      }
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    StorageService.loginDemoUser();
    navigate('/dashboard');
  };

  const handleSocial = (provider: 'google' | 'apple' | 'facebook') => {
    if (provider === 'google' && isSupabaseConfigured && supabase) {
      supabase.auth
        .signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/dashboard` } })
        .catch(() => undefined);
      return;
    }
    // Fast mock social sign in for testing
    StorageService.loginUser(`${provider}.user@linkos.dev`);
    navigate('/onboarding');
  };

  return (
    <AuthShell>
      {/* Photo collage + handwritten note */}
      <div className="relative h-48 mt-4" aria-hidden="true">
        {COLLAGE.map((img, i) => (
          <div key={i} className={`absolute ${img.cls} rounded-xl overflow-hidden border border-white/15 shadow-lg shadow-black/40`}>
            <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
          </div>
        ))}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="font-serif italic text-[17px] leading-snug text-white -rotate-3">
            Your Business<br />Online<br />In Minutes
          </p>
          <svg viewBox="0 0 80 12" className="w-20 h-3 mx-auto mt-1 stroke-[#1D7AFC] fill-none" strokeWidth="2.5" strokeLinecap="round">
            <path d="M2 8 C 25 2, 55 2, 78 6" />
          </svg>
        </div>
      </div>

      {/* Heading */}
      <h1 className="mt-5 text-[28px] font-bold tracking-tight leading-tight">
        Create Your <span className="text-[#3B82F6]">Account</span>
      </h1>
      <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-400 text-pretty">
        Join thousands of local businesses already growing with LinkOS.
      </p>

      {/* Form card */}
      <div className="mt-5 rounded-2xl bg-[#0B1626] border border-white/10 p-5">
        {error && (
          <div role="alert" className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>
              {error}
              {/already registered/i.test(error) && (
                <>
                  {' '}
                  <Link to="/login" className="font-semibold underline underline-offset-2 text-red-200 hover:text-white">
                    Log In
                  </Link>
                </>
              )}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="signup-name" className="block text-[13px] font-semibold mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              <input
                id="signup-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full pl-10 pr-3 py-3 text-[13px] rounded-xl bg-[#0A1420] border border-white/10 placeholder:text-zinc-500 focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/60 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="signup-email" className="block text-[13px] font-semibold mb-1.5">Email or Phone</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              <input
                id="signup-email"
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email or phone"
                className="w-full pl-10 pr-3 py-3 text-[13px] rounded-xl bg-[#0A1420] border border-white/10 placeholder:text-zinc-500 focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/60 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="signup-password" className="block text-[13px] font-semibold mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="w-full pl-10 pr-10 py-3 text-[13px] rounded-xl bg-[#0A1420] border border-white/10 placeholder:text-zinc-500 focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/60 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-zinc-500">At least 8 characters with a number and a symbol.</p>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              required
              className="w-4 h-4 mt-0.5 rounded accent-[#1D7AFC]"
            />
            <span className="text-[12px] leading-relaxed text-zinc-300">
              I agree to the{' '}
              <button type="button" className="text-[#3B82F6] font-semibold hover:text-blue-400">Terms of Service</button>
              {' '}and{' '}
              <button type="button" className="text-[#3B82F6] font-semibold hover:text-blue-400">Privacy Policy</button>
            </span>
          </label>

          <button
            type="submit"
            disabled={loading || !agreed}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#1D7AFC] hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <span>{loading ? 'Creating account...' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <SocialButtons dividerLabel="Or sign up with" onSocial={handleSocial} />

        <p className="text-center text-[13px] text-zinc-400 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#3B82F6] hover:text-blue-400 transition-colors">
            Log In
          </Link>
        </p>

        {import.meta.env.DEV && (
          <p className="text-center mt-4">
            <button type="button" onClick={handleDemoLogin} className="text-[11px] text-zinc-500 hover:text-zinc-300 underline underline-offset-2 transition-colors">
              Explore demo business
            </button>
          </p>
        )}
      </div>

      {/* Trust footer */}
      <div className="mt-6 flex items-center justify-center gap-5 text-[11px] text-zinc-400">
        <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Secure</span>
        <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-sky-400" /> Trusted by 10K+</span>
        <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-400" /> Quick Setup</span>
      </div>
    </AuthShell>
  );
};
