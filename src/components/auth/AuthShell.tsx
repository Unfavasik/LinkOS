import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Check, ChevronDown, MailCheck, ShieldCheck } from 'lucide-react';
import { LinkOsLogo } from '../common/LinkOsLogo';

/* ------------------------------------------------------------------ */
/* Top navigation — white bar on desktop, transparent on mobile dark  */
/* ------------------------------------------------------------------ */

const NAV_LINKS = [
  { label: 'Templates', to: '/templates' },
  { label: 'Features', to: '/' },
  { label: 'Pricing', to: '/' },
  { label: 'Domains', to: '/' },
  { label: 'Resources', to: '/' },
];

export const AuthTopNav: React.FC<{ variant: 'login' | 'signup' }> = ({ variant }) => (
  <header className="relative z-10 flex items-center justify-center px-4 py-3 md:justify-between md:border-b md:border-zinc-100 md:bg-white md:px-8">
    <Link
      to="/"
      aria-label="Go back"
      className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white md:hidden"
    >
      <ArrowLeft className="h-4 w-4" />
    </Link>

    <Link to="/" aria-label="LinkOS home">
      {/* The logo artwork has white "Link" text — dark pill on the white bar,
          bare on the dark mobile header. */}
      <span className="md:hidden"><LinkOsLogo size="md" tone="light" /></span>
      <span className="hidden md:inline-flex"><LinkOsLogo size="md" tone="dark" /></span>
    </Link>

    <nav className="hidden items-center gap-7 text-[13px] font-medium text-zinc-600 lg:flex" aria-label="Site">
      {NAV_LINKS.map((item) => (
        <Link key={item.label} to={item.to} className="transition-colors hover:text-zinc-900">
          {item.label}
          {item.label === 'Resources' && <ChevronDown className="ml-1 inline h-3.5 w-3.5" aria-hidden="true" />}
        </Link>
      ))}
    </nav>

    <div className="hidden items-center gap-3 md:flex">
      {variant === 'login' ? (
        <Link
          to="/"
          className="flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 text-[13px] font-semibold text-zinc-700 transition-colors hover:bg-zinc-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Home
        </Link>
      ) : (
        <>
          <span className="text-[13px] text-zinc-500">Already have an account?</span>
          <Link
            to="/login"
            className="rounded-full bg-zinc-100 px-4 py-2 text-[13px] font-semibold text-zinc-700 transition-colors hover:bg-zinc-200"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="flex items-center gap-1.5 rounded-full bg-[#1D7AFC] px-4 py-2 text-[13px] font-semibold text-white shadow-sm shadow-blue-600/30 transition-colors hover:bg-blue-600"
          >
            Get Started
            <span aria-hidden="true">→</span>
          </Link>
        </>
      )}
    </div>
  </header>
);

/* ------------------------------------------------------------------ */
/* Shell — dark brand panel (desktop) + light form column             */
/* ------------------------------------------------------------------ */

export const AuthShell: React.FC<{
  variant: 'login' | 'signup';
  left: React.ReactNode;
  children: React.ReactNode;
}> = ({ variant, left, children }) => (
  <div className="relative min-h-screen bg-[#060D1A] font-sans text-white md:bg-[#F8FAFC] md:text-zinc-900">
    {/* Mobile ambient glow */}
    <div
      className="pointer-events-none absolute -top-32 left-1/2 h-[360px] w-[560px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[110px] md:hidden"
      aria-hidden="true"
    />

    <AuthTopNav variant={variant} />

    <div className="md:grid md:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden flex-col overflow-hidden bg-gradient-to-br from-[#081226] via-[#060D1A] to-[#0A1830] text-white md:flex md:min-h-[calc(100vh-58px)]">
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-blue-600/15 blur-[110px]" aria-hidden="true" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-blue-500/10 blur-[100px]" aria-hidden="true" />
        {left}
      </aside>

      <main className="relative px-5 pb-12 pt-4 md:px-10 md:py-10">
        <div className="mx-auto w-full max-w-md">{children}</div>
      </main>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Form primitives — dark on mobile, light on desktop                 */
/* ------------------------------------------------------------------ */

export const TextField: React.FC<
  React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    icon: React.ReactNode;
    trailing?: React.ReactNode;
    hint?: React.ReactNode;
  }
> = ({ label, icon, trailing, hint, id, className = '', ...inputProps }) => (
  <div>
    <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-zinc-100 md:text-zinc-800">
      {label}
    </label>
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">{icon}</span>
      <input
        id={id}
        {...inputProps}
        className={`w-full rounded-xl border border-white/10 bg-white/[0.06] py-3 pl-10 pr-11 text-[13px] text-white placeholder:text-zinc-500 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 md:border-zinc-200 md:bg-white md:text-zinc-900 ${className}`}
      />
      {trailing && <span className="absolute right-3 top-1/2 -translate-y-1/2">{trailing}</span>}
    </div>
    {hint}
  </div>
);

export const PrimaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <button
    className={`flex w-full items-center justify-center gap-2 rounded-xl bg-[#1D7AFC] py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all active:scale-[0.98] hover:bg-blue-600 disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </button>
);

export const AuthAlert: React.FC<{ tone: 'error' | 'info'; children: React.ReactNode }> = ({ tone, children }) => (
  <div
    role={tone === 'error' ? 'alert' : 'status'}
    className={`mb-4 flex items-start gap-2 rounded-lg border p-3 text-xs ${
      tone === 'error'
        ? 'border-red-500/30 bg-red-500/10 text-red-300 md:border-red-200 md:bg-red-50 md:text-red-700'
        : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 md:border-emerald-200 md:bg-emerald-50 md:text-emerald-700'
    }`}
  >
    {tone === 'error' ? (
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
    ) : (
      <MailCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
    )}
    <span>{children}</span>
  </div>
);

/* ------------------------------------------------------------------ */
/* Signup stepper — 1 Account Details · 2 Preferences · 3 You're In!  */
/* ------------------------------------------------------------------ */

const STEPS = ['Account Details', 'Preferences', "You're In!"];

export const SignupStepper: React.FC<{ current: 1 | 2 | 3 }> = ({ current }) => (
  <ol className="flex items-start justify-center" aria-label="Signup progress">
    {STEPS.map((label, i) => {
      const n = i + 1;
      const done = n < current;
      const active = n === current;
      return (
        <li key={label} className="flex items-start">
          <div className="flex w-20 flex-col items-center sm:w-24">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${
                active || done
                  ? 'bg-[#1D7AFC] text-white shadow-sm shadow-blue-600/40'
                  : 'bg-white/10 text-zinc-400 md:bg-zinc-200 md:text-zinc-500'
              }`}
              aria-current={active ? 'step' : undefined}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : n}
            </span>
            <span
              className={`mt-1 text-center text-[10px] font-semibold leading-tight sm:text-[11px] ${
                active ? 'text-[#1D7AFC]' : 'text-zinc-400 md:text-zinc-500'
              }`}
            >
              {label}
            </span>
          </div>
          {n < STEPS.length && (
            <span
              className={`mt-3.5 h-px w-8 sm:w-12 ${done ? 'bg-[#1D7AFC]' : 'bg-white/10 md:bg-zinc-200'}`}
              aria-hidden="true"
            />
          )}
        </li>
      );
    })}
  </ol>
);

/* ------------------------------------------------------------------ */
/* Social buttons — Google / GitHub / Discord                         */
/* ------------------------------------------------------------------ */

const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z" />
    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15Z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
  </svg>
);

const GithubIcon = () => (
  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const DiscordIcon = () => (
  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

export type SocialProvider = 'google' | 'github' | 'discord';

interface SocialButtonsProps {
  dividerLabel: string;
  onSocial: (provider: SocialProvider) => void;
}

export const SocialButtons: React.FC<SocialButtonsProps> = ({ dividerLabel, onSocial }) => (
  <>
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-white/10 md:border-zinc-200" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-[#060D1A] px-3 text-[11px] text-zinc-500 md:bg-white">{dividerLabel}</span>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-2.5">
      <button
        type="button"
        onClick={() => onSocial('google')}
        className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-[13px] font-semibold text-zinc-100 transition-colors hover:bg-white/10 md:border-zinc-200 md:bg-white md:text-zinc-700 md:hover:bg-zinc-50"
      >
        <GoogleIcon /> Google
      </button>
      <button
        type="button"
        onClick={() => onSocial('github')}
        className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-[13px] font-semibold text-zinc-100 transition-colors hover:bg-white/10 md:border-zinc-200 md:bg-white md:text-zinc-700 md:hover:bg-zinc-50"
      >
        <GithubIcon /> GitHub
      </button>
      <button
        type="button"
        onClick={() => onSocial('discord')}
        className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-[13px] font-semibold text-zinc-100 transition-colors hover:bg-white/10 md:border-zinc-200 md:bg-white md:text-zinc-700 md:hover:bg-zinc-50"
      >
        <DiscordIcon /> Discord
      </button>
    </div>
  </>
);

/* ------------------------------------------------------------------ */
/* Shared trust note                                                  */
/* ------------------------------------------------------------------ */

export const SecurityNote: React.FC = () => (
  <p className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 md:text-zinc-400">
    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
    Your data is secure with industry-standard encryption.
  </p>
);
