import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  AtSign,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  Cloud,
  Code2,
  Eye,
  EyeOff,
  FileText,
  Globe,
  LayoutGrid,
  LayoutTemplate,
  Lock,
  Mail,
  MoreHorizontal,
  Rocket,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  User,
  Users,
  Zap,
} from 'lucide-react';
import {
  AuthAlert,
  AuthShell,
  PrimaryButton,
  SecurityNote,
  SignupStepper,
  SocialButtons,
  TextField,
  type SocialProvider,
} from '../components/auth/AuthShell';
import { LinkOsLogo } from '../components/common/LinkOsLogo';
import { StorageService } from '../lib/storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { resolvePostAuthRoute, verifyAdmin } from '../lib/adminAuth';

const SIGNUP_FEATURES = [
  { Icon: Zap, tile: 'bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/30', title: 'Instant Access', sub: 'Start building in seconds' },
  { Icon: LayoutGrid, tile: 'bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/30', title: '50+ Professional Templates', sub: 'For any business or idea' },
  { Icon: Cloud, tile: 'bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30', title: 'No Coding Required', sub: 'Drag, drop, and customize' },
  { Icon: TrendingUp, tile: 'bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/30', title: 'Grow Faster', sub: 'With powerful built-in tools' },
];

const PERSONAS = [
  { id: 'individual', Icon: User, title: 'Individual', sub: "I'm a student, creator, or hobbyist" },
  { id: 'business', Icon: Briefcase, title: 'Business Owner', sub: 'I run a business' },
  { id: 'developer', Icon: Code2, title: 'Developer', sub: 'I build for clients or myself' },
  { id: 'agency', Icon: Building2, title: 'Agency', sub: 'I work with multiple clients' },
];

const INTERESTS = [
  { id: 'templates', Icon: LayoutTemplate, label: 'Website Templates' },
  { id: 'ecommerce', Icon: ShoppingBag, label: 'Ecommerce' },
  { id: 'portfolio', Icon: Briefcase, label: 'Portfolio' },
  { id: 'blog', Icon: FileText, label: 'Blog / Content' },
  { id: 'landing', Icon: Rocket, label: 'Landing Pages' },
  { id: 'tools', Icon: LayoutGrid, label: 'Business Tools' },
  { id: 'domain', Icon: Globe, label: 'Custom Domain' },
  { id: 'other', Icon: MoreHorizontal, label: 'Other' },
];

const HEARD_OPTIONS = ['Google Search', 'Social Media', 'Friend or Colleague', 'YouTube', 'Other'];

const SUCCESS_FEATURES = [
  { Icon: Rocket, tile: 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-400/30', title: 'Explore Templates', sub: '50+ professional templates' },
  { Icon: Sparkles, tile: 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-400/30', title: 'Customize Easily', sub: 'No coding required' },
  { Icon: Users, tile: 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-400/30', title: 'Grow Online', sub: 'Launch and scale faster' },
];

const CONFETTI = [
  { cls: 'left-[8%] top-[16%] h-3 w-1.5 rotate-12', color: 'bg-pink-400' },
  { cls: 'left-[16%] top-[38%] h-2 w-1 -rotate-45', color: 'bg-cyan-300' },
  { cls: 'left-[10%] bottom-[24%] h-3 w-1.5 rotate-45', color: 'bg-amber-300' },
  { cls: 'left-[24%] top-[10%] h-2 w-1 rotate-12', color: 'bg-violet-400' },
  { cls: 'right-[12%] top-[14%] h-3 w-1.5 -rotate-12', color: 'bg-emerald-300' },
  { cls: 'right-[20%] top-[34%] h-2 w-1 rotate-45', color: 'bg-pink-400' },
  { cls: 'right-[9%] bottom-[28%] h-3 w-1.5 -rotate-45', color: 'bg-cyan-300' },
  { cls: 'right-[28%] top-[8%] h-2 w-1 -rotate-12', color: 'bg-amber-300' },
  { cls: 'left-[38%] top-[6%] h-2 w-1 rotate-90', color: 'bg-emerald-300' },
  { cls: 'right-[38%] bottom-[12%] h-2 w-1 -rotate-90', color: 'bg-violet-400' },
];

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [persona, setPersona] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [heardAbout, setHeardAbout] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pwChecks = [
    { ok: password.length >= 8, label: 'At least 8 characters' },
    { ok: /[a-zA-Z]/.test(password) && /\d/.test(password), label: 'One letter and one number' },
    { ok: /[^a-zA-Z0-9]/.test(password) || password.length >= 12, label: 'Use a strong password' },
  ];

  // A brand-new account continues to the preferences step instead of
  // navigating straight to the dashboard.
  const completeAuth = () => setStep(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
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
          void StorageService.syncSignupDetails({
            userId: signIn.user.id,
            email: signIn.user.email || email,
            displayName: fullName || undefined,
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
          options: {
            data: {
              full_name: fullName,
              username,
              persona,
              interests,
              heard_from: heardAbout || undefined,
            },
          },
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
            void StorageService.syncSignupDetails({
              userId: retry.user.id,
              email: retry.user.email || email,
              displayName: fullName || undefined,
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
        void StorageService.syncSignupDetails({
          userId: data.user.id,
          email: data.user.email || email,
          displayName: fullName || undefined,
        });
        // An invited admin signing up for the first time goes straight to the
        // admin panel; everyone else continues onboarding.
        const adminRoute = await verifyAdmin(data.user.email || email, data.user.id);
        if (adminRoute) {
          navigate('/admin');
          return;
        }
        completeAuth();
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
      completeAuth();
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

  const handleSocial = (provider: SocialProvider) => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth
        .signInWithOAuth({ provider, options: { redirectTo: `${window.location.origin}/dashboard` } })
        .catch(() => undefined);
      return;
    }
    // Fast mock social sign in for testing
    StorageService.loginUser(`${provider}.user@linkos.dev`);
    completeAuth();
  };

  const brandPanel = (
    <div className="flex w-full flex-col justify-between p-10 xl:p-14">
      <div className="relative">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-1.5 text-[12px] font-semibold text-zinc-200">
          <Rocket className="h-3.5 w-3.5 text-[#3B82F6]" aria-hidden="true" />
          Join 10,000+ creators worldwide
        </span>
        <h1 className="mt-6 max-w-md text-4xl font-extrabold leading-[1.08] tracking-tight xl:text-[44px]">
          Create Your Account and <span className="text-[#3B82F6]">Start Building</span>
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-zinc-400">
          Join LinkOS and get instant access to beautiful templates, powerful tools, and everything you need to launch
          and grow online &mdash; no coding required.
        </p>

        <ul className="mt-8 space-y-5">
          {SIGNUP_FEATURES.map(({ Icon, tile, title, sub }) => (
            <li key={title} className="flex items-center gap-4">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tile}`}>
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <p className="flex items-center gap-2 text-[14px] font-bold">
                  <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                  {title}
                </p>
                <p className="text-[12px] text-zinc-400">{sub}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mt-12">
        <div className="flex items-center gap-10">
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

        <div className="mt-8 flex items-start gap-4">
          <div className="flex shrink-0 -space-x-2" aria-hidden="true">
            {['from-blue-500 to-blue-800', 'from-violet-500 to-violet-800', 'from-sky-500 to-sky-800', 'from-teal-500 to-teal-800', 'from-indigo-500 to-indigo-800'].map(
              (g, i) => (
                <span
                  key={i}
                  className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${g} text-[10px] font-bold text-white ring-2 ring-[#060D1A]`}
                >
                  {['AH', 'RS', 'MK', 'TS', 'JB'][i]}
                </span>
              )
            )}
          </div>
          <p className="text-[13px] leading-relaxed text-zinc-300">
            &ldquo;LinkOS made it so easy to launch my website. Highly recommended!&rdquo;
            <span className="mt-1 block font-semibold text-white">&mdash; Arafat H.</span>
          </p>
        </div>

        <p className="mt-10 flex items-center gap-2 text-[12px] text-zinc-500">
          <ShieldCheck className="h-4 w-4 text-[#3B82F6]" aria-hidden="true" />
          Build a better online presence with LinkOS.
        </p>
      </div>
    </div>
  );

  /* ---------------- Step 3: You're In! ---------------- */

  if (step === 3) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#0A1830] via-[#081226] to-[#060D1A] px-5 py-12 font-sans text-white">
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-[340px] w-[520px] -translate-x-1/2 rounded-full bg-blue-600/25 blur-[110px]"
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {CONFETTI.map((c, i) => (
            <span key={i} className={`absolute rounded-[2px] ${c.cls} ${c.color}`} />
          ))}
        </div>

        <Link to="/" aria-label="LinkOS home" className="relative mb-8">
          <LinkOsLogo size="md" tone="light" />
        </Link>

        <div className="relative">
          <span className="absolute inset-0 rounded-full bg-blue-500/40 blur-2xl" aria-hidden="true" />
          <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#4F8CFF] to-[#1D4ED8] shadow-[0_0_60px_rgba(37,99,235,0.6)] ring-4 ring-blue-400/30">
            <Check className="h-11 w-11 text-white" strokeWidth={3} aria-hidden="true" />
          </span>
        </div>

        <h1 className="relative mt-6 text-center text-4xl font-extrabold tracking-tight">
          You&apos;re In! <span aria-hidden="true">🎉</span>
        </h1>
        <p className="relative mt-2 max-w-sm text-center text-[14px] leading-relaxed text-zinc-300">
          Your LinkOS account is ready. Let&apos;s build something amazing together.
        </p>

        <div className="relative mt-8 w-full max-w-md space-y-2.5">
          {SUCCESS_FEATURES.map(({ Icon, tile, title, sub }) => (
            <div key={title} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-sm">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tile}`}>
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-[14px] font-bold">{title}</p>
                <p className="text-[12px] text-zinc-400">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative mt-8 w-full max-w-md space-y-3">
          <PrimaryButton type="button" onClick={() => navigate('/dashboard/websites/new')}>
            <span>Go to Dashboard</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </PrimaryButton>
          <button
            type="button"
            onClick={() => navigate('/templates')}
            className="flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] py-3.5 text-sm font-bold text-white transition-all active:scale-[0.98] hover:bg-white/[0.1]"
          >
            Browse Templates
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- Step 2: Preferences ---------------- */

  if (step === 2) {
    return (
      <AuthShell variant="signup" left={brandPanel}>
        <SignupStepper current={2} />

        <div className="mt-6 md:rounded-3xl md:border md:border-zinc-100 md:bg-white md:p-8 md:shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <h1 className="text-[22px] font-extrabold tracking-tight text-white md:text-zinc-900">
            Tell us about your preferences
          </h1>
          <p className="mt-1 text-[13px] leading-relaxed text-zinc-400 md:text-zinc-500">
            This helps us show you the most relevant templates, tools, and resources.
          </p>

          <p className="mt-6 text-[13px] font-bold text-zinc-100 md:text-zinc-800">What best describes you?</p>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {PERSONAS.map(({ id, Icon, title, sub }) => {
              const on = persona === id;
              return (
                <button
                  type="button"
                  key={id}
                  onClick={() => setPersona(id)}
                  aria-pressed={on}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
                    on
                      ? 'border-[#1D7AFC] bg-blue-500/10 ring-1 ring-[#1D7AFC] md:bg-blue-50'
                      : 'border-white/10 bg-white/[0.04] hover:border-white/25 md:border-zinc-200 md:bg-white md:hover:border-zinc-300'
                  }`}
                >
                  <Icon
                    className={`mt-0.5 h-5 w-5 shrink-0 ${on ? 'text-[#1D7AFC]' : 'text-zinc-400 md:text-zinc-500'}`}
                    aria-hidden="true"
                  />
                  <span>
                    <span className="block text-[13px] font-bold text-zinc-100 md:text-zinc-900">{title}</span>
                    <span className="block text-[11px] leading-snug text-zinc-400 md:text-zinc-500">{sub}</span>
                  </span>
                  {on && <Check className="ml-auto h-4 w-4 shrink-0 text-[#1D7AFC]" aria-hidden="true" />}
                </button>
              );
            })}
          </div>

          <p className="mt-6 text-[13px] font-bold text-zinc-100 md:text-zinc-800">What are you mainly interested in?</p>
          <p className="text-[11px] text-zinc-500">You can select multiple options.</p>
          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {INTERESTS.map(({ id, Icon, label }) => {
              const on = interests.includes(id);
              return (
                <button
                  type="button"
                  key={id}
                  onClick={() => setInterests(on ? interests.filter((i) => i !== id) : [...interests, id])}
                  aria-pressed={on}
                  className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
                    on
                      ? 'border-[#1D7AFC] bg-blue-500/10 ring-1 ring-[#1D7AFC] md:bg-blue-50'
                      : 'border-white/10 bg-white/[0.04] hover:border-white/25 md:border-zinc-200 md:bg-white md:hover:border-zinc-300'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${on ? 'text-[#1D7AFC]' : 'text-zinc-400 md:text-zinc-500'}`}
                    aria-hidden="true"
                  />
                  <span className="text-[12px] font-semibold leading-tight text-zinc-100 md:text-zinc-800">{label}</span>
                  {on && <Check className="ml-auto h-3.5 w-3.5 shrink-0 text-[#1D7AFC]" aria-hidden="true" />}
                </button>
              );
            })}
          </div>

          <label htmlFor="heard-about" className="mt-6 block text-[13px] font-bold text-zinc-100 md:text-zinc-800">
            How did you hear about us?
          </label>
          <select
            id="heard-about"
            value={heardAbout}
            onChange={(e) => setHeardAbout(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.06] px-3 py-3 text-[13px] text-white outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 md:border-zinc-200 md:bg-white md:text-zinc-900"
          >
            <option value="" className="text-zinc-900">
              Select an option (optional)
            </option>
            {HEARD_OPTIONS.map((o) => (
              <option key={o} value={o} className="text-zinc-900">
                {o}
              </option>
            ))}
          </select>

          <div className="mt-7 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 text-[13px] font-semibold text-zinc-300 transition-colors hover:text-white md:text-zinc-600 md:hover:text-zinc-900"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </button>
            <PrimaryButton type="button" onClick={() => setStep(3)} disabled={!persona} className="!w-auto px-8">
              <span>Continue</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </PrimaryButton>
          </div>
        </div>
      </AuthShell>
    );
  }

  /* ---------------- Step 1: Account Details ---------------- */

  return (
    <AuthShell variant="signup" left={brandPanel}>
      <h1 className="text-center text-[26px] font-extrabold tracking-tight text-white md:text-zinc-900">
        Create Your Account
      </h1>
      <p className="mt-1.5 text-center text-[13px] leading-relaxed text-zinc-400 md:text-zinc-500">
        Join LinkOS and start building something amazing today.
      </p>

      <div className="mt-5">
        <SignupStepper current={1} />
      </div>

      <div className="mt-6 md:rounded-3xl md:border md:border-zinc-100 md:bg-white md:p-8 md:shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        {error && (
          <AuthAlert tone="error">
            {error}
            {/already registered/i.test(error) && (
              <>
                {' '}
                <Link to="/login" className="font-semibold text-red-200 underline underline-offset-2 hover:text-white md:text-red-800 md:hover:text-red-900">
                  Log In
                </Link>
              </>
            )}
          </AuthAlert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            id="signup-name"
            label="Full Name"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            autoComplete="name"
            icon={<User className="h-4 w-4" />}
          />

          <TextField
            id="signup-username"
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
            autoComplete="username"
            icon={<AtSign className="h-4 w-4" />}
            hint={<p className="mt-1.5 text-[11px] text-zinc-500">This will be your public profile name.</p>}
          />

          <TextField
            id="signup-email"
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            icon={<Mail className="h-4 w-4" />}
          />

          <TextField
            id="signup-password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            autoComplete="new-password"
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
            hint={
              <ul className="mt-2 space-y-1">
                {pwChecks.map((c) => (
                  <li
                    key={c.label}
                    className={`flex items-center gap-1.5 text-[11px] ${c.ok ? 'text-emerald-500' : 'text-zinc-500'}`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {c.label}
                  </li>
                ))}
              </ul>
            }
          />

          <label className="flex cursor-pointer select-none items-start gap-2.5">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              required
              className="mt-0.5 h-4 w-4 rounded accent-[#1D7AFC]"
            />
            <span className="text-[12px] leading-relaxed text-zinc-300 md:text-zinc-600">
              I agree to the{' '}
              <button type="button" className="font-semibold text-[#1D7AFC] transition-colors hover:text-blue-500">
                Terms of Service
              </button>{' '}
              and{' '}
              <button type="button" className="font-semibold text-[#1D7AFC] transition-colors hover:text-blue-500">
                Privacy Policy
              </button>
            </span>
          </label>

          <PrimaryButton type="submit" disabled={loading || !agreed}>
            <span>{loading ? 'Creating account...' : 'Create Account'}</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </PrimaryButton>
        </form>

        <SocialButtons dividerLabel="Or sign up with" onSocial={handleSocial} />

        <p className="mt-5 text-center text-[13px] text-zinc-400 md:text-zinc-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#1D7AFC] transition-colors hover:text-blue-500">
            Log In
          </Link>
        </p>

        <SecurityNote />

        {import.meta.env.DEV && (
          <p className="mt-4 text-center">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="text-[11px] text-zinc-500 underline underline-offset-2 transition-colors hover:text-zinc-300 md:text-zinc-400 md:hover:text-zinc-600"
            >
              Explore demo business
            </button>
          </p>
        )}
      </div>
    </AuthShell>
  );
};
