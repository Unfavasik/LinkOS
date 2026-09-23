import { PublicNavbar } from '../components/common/PublicNavbar';
import React, { useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft, ArrowRight, PlayCircle } from 'lucide-react';
import { type ResourceArticle } from '../data/resources';
import { getHelpArticle } from '../lib/helpArticles';
import { STEP_VISUALS } from './ResourceArticlePage';
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

/* Help Center article catalogue — read from the admin-managed helpArticles lib */
const stepId = (title: string) => title.replace(/[^a-z0-9]/gi, '-').toLowerCase();

export const HelpArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const entry = slug ? getHelpArticle(slug) : undefined;
  const [activeStep, setActiveStep] = useState(0);

  if (!entry) return <Navigate to="/help" replace />;
  const { article, category } = entry;
  const categoryLabel: string = category;

  const goToStep = (i: number) => {
    setActiveStep(i);
    document.getElementById(stepId(article.steps[i].title))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-[#050D1F] pb-24">
      <SeoHead title={`${article.title} | LinkOS Help Center`} description={article.intro} />

      {/* Header */}
      <PublicNavbar />

      <main className="max-w-2xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mt-1 flex items-center gap-1.5 text-[13px] flex-wrap">
          <Link to="/help" className="text-blue-400 hover:text-blue-300 font-medium">Help Center</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
          <span className="text-blue-400 font-medium">{categoryLabel}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
          <span className="text-slate-200 font-medium">{article.title.replace(/^How to /, '')}</span>
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

        {/* In this guide */}
        <section className="mt-7" aria-labelledby="guide-toc">
          <h2 id="guide-toc" className="text-[19px] font-bold text-white">
            In this guide
          </h2>
          <ol className="mt-4 space-y-3.5">
            {article.learn.map((item, i) => (
              <li key={item} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-[12px] font-bold text-blue-400 shrink-0">
                  {i + 1}
                </span>
                <span className="text-[14px] leading-relaxed text-slate-200">{item}</span>
              </li>
            ))}
          </ol>
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
          {article.steps.map((step, i) => {
            const Visual = step.visual ? STEP_VISUALS[step.visual] : null;
            return (
              <section key={step.title} aria-labelledby={stepId(step.title)}>
                <h2 id={stepId(step.title)} className="text-[19px] font-bold text-white scroll-mt-20">
                  {step.title}
                </h2>
                <p className="mt-2 text-[14px] leading-relaxed text-slate-300">{step.body}</p>
                {Visual && <Visual />}
              </section>
            );
          })}
        </div>

        {/* Prev / Next pager */}
        <nav aria-label="Guide steps" className="mt-10 flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={activeStep === 0}
            onClick={() => goToStep(Math.max(0, activeStep - 1))}
            className="inline-flex items-center gap-2 px-5 h-12 rounded-xl border border-white/15 bg-white/5 text-[14px] font-semibold text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Previous
          </button>
          {activeStep < article.steps.length - 1 ? (
            <button
              type="button"
              onClick={() => goToStep(activeStep + 1)}
              className="inline-flex items-center gap-2 px-5 h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-[14px] font-semibold text-white transition-colors"
            >
              Next: {article.steps[activeStep + 1].title.replace(/^Step \d+: /, '')}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          ) : (
            <Link
              to="/help"
              className="inline-flex items-center gap-2 px-5 h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-[14px] font-semibold text-white transition-colors"
            >
              Back to Help Center
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          )}
        </nav>
      </main>

      <MobileTabBar active="Resources" />
    </div>
  );
};
