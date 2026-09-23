import { PublicNavbar } from '../components/common/PublicNavbar';
import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  CheckCircle2,
  PlayCircle,
} from 'lucide-react';
import { RESOURCE_ARTICLES, type ArticleStep } from '../data/resources';
import { MobileTabBar } from '../components/common/MobileTabBar';
import { SeoHead } from '../components/common/SeoHead';

/* Blue chain-link logo mark used across LinkOS mobile pages */
const LogoMark: React.FC = () => (
  <span className="flex items-center gap-1.5 select-none">
    <svg className="w-6 h-6" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M13 19a6 6 0 0 0 8.5 0l4-4a6 6 0 0 0-8.5-8.5l-2 2"
        stroke="#3B82F6"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path
        d="M19 13a6 6 0 0 0-8.5 0l-4 4a6 6 0 0 0 8.5 8.5l2-2"
        stroke="#60A5FA"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
    </svg>
    <span className="text-[19px] font-bold tracking-tight leading-none">
      <span className="text-white">Link</span>
      <span className="text-blue-500">OS</span>
    </span>
  </span>
);

/* Framed screenshot of the real LinkOS site, styled like a browser window */
export const ScreenshotFrame: React.FC<{ src: string; alt: string; caption?: string; children?: React.ReactNode }> = ({
  src,
  alt,
  caption,
  children,
}) => (
  <figure className="relative mt-4">
    <div className="rounded-2xl border border-white/15 bg-[#0B1526] shadow-[0_16px_40px_-16px_rgba(0,0,0,0.7)] overflow-hidden">
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 px-3.5 h-8 bg-white/[0.06] border-b border-white/10">
        <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" aria-hidden="true" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" aria-hidden="true" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" aria-hidden="true" />
        <span className="ml-2 flex-1 max-w-[220px] h-4.5 rounded-md bg-white/10 flex items-center px-2 text-[9px] font-medium text-slate-400 truncate">
          linkos.app
        </span>
      </div>
      <img src={src} alt={alt} className="w-full block" loading="lazy" />
    </div>
    {caption && (
      <figcaption className="mt-2 text-center text-[11px] font-medium text-slate-500">{caption}</figcaption>
    )}
    {children}
  </figure>
);

/* Step 1 — real signup screen with the handwritten annotation kept on top */
const SignupVisual: React.FC = () => (
  <div className="relative">
    <ScreenshotFrame
      src="/images/resources/guide/step1-signup.png"
      alt="LinkOS Create Your Account screen with name, email and password fields"
      caption="The real LinkOS sign-up screen — fill in your details and tap Create Account"
    />
    <div className="absolute -top-3 right-1 w-[96px] rotate-[8deg] text-right pointer-events-none">
      <span className="font-hand text-[19px] leading-[1.05] text-blue-400 font-semibold block drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
        Quick and easy signup
      </span>
      <svg className="w-8 h-8 mt-0.5 ml-auto -scale-x-100 rotate-[30deg]" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path d="M6 6c14 2 24 10 27 26" stroke="#60A5FA" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M27 27l6 6 1-9" stroke="#60A5FA" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  </div>
);

/* Step 2 — real templates gallery */
const TemplatesVisual: React.FC = () => (
  <ScreenshotFrame
    src="/images/resources/guide/step2-templates.png"
    alt="LinkOS templates gallery showing popular templates like Urban Brew Café and AutoCare Service Centre"
    caption="Browse 50+ ready-made templates — tap Use Template on the one you like"
  />
);

/* Step 3 — real onboarding screen */
const CustomizeVisual: React.FC = () => (
  <ScreenshotFrame
    src="/images/resources/guide/step3-onboarding.png"
    alt="LinkOS onboarding step asking for your business name and tagline"
    caption="Answer a few simple questions — your page builds itself as you go"
  />
);

/* Step 4 — real published page + dashboard */
const PublishVisual: React.FC = () => (
  <div className="mt-4 grid grid-cols-2 gap-3 items-start">
    <ScreenshotFrame
      src="/images/resources/guide/step4-published.png"
      alt="Published Urban Brew Café business page with WhatsApp, Call and Directions buttons"
    />
    <ScreenshotFrame
      src="/images/resources/guide/step4-dashboard.png"
      alt="LinkOS dashboard showing page views, clicks and the live page link"
    />
    <p className="col-span-2 text-center text-[11px] font-medium text-slate-500">
      Your live page (left) and your dashboard with views &amp; clicks (right)
    </p>
  </div>
);

export const STEP_VISUALS: Record<NonNullable<ArticleStep['visual']>, React.FC> = {
  signup: SignupVisual,
  templates: TemplatesVisual,
  customize: CustomizeVisual,
  publish: PublishVisual,
};

export const ResourceArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = RESOURCE_ARTICLES.find((a) => a.slug === slug);

  if (!article) return <Navigate to="/resources" replace />;

  return (
    <div className="min-h-screen bg-[#050D1F] pb-24">
      <SeoHead title={`${article.title} | LinkOS Resources`} description={article.intro} />

      {/* Header */}
      <PublicNavbar />

      <main className="max-w-2xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mt-1 flex items-center gap-1.5 text-[13px] flex-wrap">
          <Link to="/resources" className="text-blue-400 hover:text-blue-300 font-medium">Resources</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
          <span className="text-blue-400 font-medium">Guides</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
          <span className="text-slate-200 font-medium">Create Your First Page</span>
        </nav>

        {/* Title block */}
        <div className="mt-4 flex items-center gap-2.5">
          <span className={`px-3 py-1 rounded-full text-[12px] font-bold text-white ${article.tagColor}`}>
            {article.tag}
          </span>
          <span className="text-[13px] text-slate-400">{article.readTime}</span>
        </div>
        <h1 className="mt-3 text-[30px] leading-[1.18] font-bold text-white text-balance">
          {article.title}
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-slate-300">{article.intro}</p>

        {/* Hero image */}
        <img
          src={article.hero}
          alt={article.heroAlt}
          className="mt-5 w-full aspect-[16/10] object-cover rounded-2xl border border-white/10"
        />

        {/* What you'll learn */}
        <section className="mt-7" aria-labelledby="learn-heading">
          <h2 id="learn-heading" className="text-[19px] font-bold text-white">
            What you&apos;ll learn
          </h2>
          <ul className="mt-3.5 space-y-3">
            {article.learn.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-px" aria-hidden="true" />
                <span className="text-[14px] leading-relaxed text-slate-200">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Video CTA */}
        {article.video && (
          <button
            type="button"
            className="mt-6 w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-[14px] font-semibold text-white"
          >
            <PlayCircle className="w-5 h-5" aria-hidden="true" />
            {article.video}
          </button>
        )}

        <hr className="mt-8 border-white/10" />

        {/* Steps */}
        <div className="mt-7 space-y-9">
          {article.steps.map((step) => {
            const Visual = step.visual ? STEP_VISUALS[step.visual] : null;
            return (
              <section key={step.title} aria-labelledby={step.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}>
                <h2
                  id={step.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}
                  className="text-[19px] font-bold text-white"
                >
                  {step.title}
                </h2>
                <p className="mt-2 text-[14px] leading-relaxed text-slate-300">{step.body}</p>
                {Visual && <Visual />}
              </section>
            );
          })}
        </div>
      </main>

      <MobileTabBar active="Resources" />
    </div>
  );
};
