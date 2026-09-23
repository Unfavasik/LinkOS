import { PublicNavbar } from '../components/common/PublicNavbar';
import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ChevronRight, CheckCircle2, PlayCircle, Clock, Image as ImageIcon } from 'lucide-react';
import useSWR from 'swr';
import { getGuideBySlug, type Guide } from '../lib/guides';
import { MobileTabBar } from '../components/common/MobileTabBar';
import { SeoHead } from '../components/common/SeoHead';

const TAG_COLORS: Record<string, string> = {
  Guide: 'bg-blue-500',
  Tutorial: 'bg-sky-500',
  Template: 'bg-emerald-500',
  'Business Tip': 'bg-violet-500',
};

async function fetchGuide(slug: string | undefined): Promise<Guide | undefined> {
  if (!slug) return undefined;
  return getGuideBySlug(slug);
}

export const GuideArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: guide, isLoading } = useSWR(['guide', slug], () => fetchGuide(slug));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050D1F] pb-24">
        <PublicNavbar />
        <div className="max-w-2xl mx-auto px-4 mt-8 space-y-4" aria-label="Loading" role="status">
          <div className="h-8 w-3/4 rounded-lg bg-white/[0.06] animate-pulse" />
          <div className="h-40 rounded-2xl bg-white/[0.06] animate-pulse" />
          <div className="h-4 w-full rounded bg-white/[0.06] animate-pulse" />
          <div className="h-4 w-5/6 rounded bg-white/[0.06] animate-pulse" />
        </div>
        <MobileTabBar active="Resources" />
      </div>
    );
  }

  if (!guide || !guide.is_published) return <Navigate to="/resources/guides" replace />;

  return (
    <div className="min-h-screen bg-[#050D1F] pb-24">
      <SeoHead title={`${guide.title} | LinkOS Guides`} description={guide.intro} />

      <PublicNavbar />

      <main className="max-w-2xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mt-1 flex items-center gap-1.5 text-[13px] flex-wrap">
          <Link to="/resources" className="text-blue-400 hover:text-blue-300 font-medium">Resources</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
          <Link to="/resources/guides" className="text-blue-400 hover:text-blue-300 font-medium">Guides</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
          <span className="text-slate-200 font-medium truncate max-w-[180px]">{guide.title}</span>
        </nav>

        {/* Title block */}
        <div className="mt-4 flex items-center gap-2.5 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-[12px] font-bold text-white ${TAG_COLORS[guide.tag] || 'bg-blue-500'}`}>
            {guide.tag}
          </span>
          {guide.read_time && (
            <span className="inline-flex items-center gap-1 text-[13px] text-slate-400">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              {guide.read_time}
            </span>
          )}
        </div>
        <h1 className="mt-3 text-[30px] leading-[1.18] font-bold text-white text-balance">
          {guide.title}
        </h1>
        {guide.intro && <p className="mt-3 text-[14px] leading-relaxed text-slate-300">{guide.intro}</p>}

        {/* Topic tags */}
        {guide.tags.length > 0 && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            {guide.tags.map((t) => (
              <span key={t} className="px-3 py-1 rounded-full border border-white/15 bg-white/5 text-[12px] font-semibold text-slate-200">
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Hero image */}
        {guide.hero_url && (
          <img
            src={guide.hero_url}
            alt={guide.hero_alt || guide.title}
            className="mt-5 w-full aspect-[16/10] object-cover rounded-2xl border border-white/10"
          />
        )}

        {/* What you'll learn */}
        {guide.learn.length > 0 && (
          <section className="mt-7" aria-labelledby="learn-heading">
            <h2 id="learn-heading" className="text-[19px] font-bold text-white">
              What you&apos;ll learn
            </h2>
            <ul className="mt-3.5 space-y-3">
              {guide.learn.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-px" aria-hidden="true" />
                  <span className="text-[14px] leading-relaxed text-slate-200">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Video tutorial */}
        {guide.video_url ? (
          <section className="mt-6" aria-labelledby="guide-video-heading">
            <h2 id="guide-video-heading" className="text-[19px] font-bold text-white">
              {guide.video || 'Video tutorial'}
            </h2>
            <video
              controls
              playsInline
              preload="metadata"
              src={guide.video_url}
              className="mt-3 w-full aspect-video rounded-2xl border border-white/10 bg-black"
            />
          </section>
        ) : (
          guide.video && (
            <button
              type="button"
              className="mt-6 w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-[14px] font-semibold text-white"
            >
              <PlayCircle className="w-5 h-5" aria-hidden="true" />
              {guide.video}
            </button>
          )
        )}

        <hr className="mt-8 border-white/10" />

        {/* Steps */}
        <div className="mt-7 space-y-9">
          {guide.steps.map((step, i) => (
            <section key={`${step.title}-${i}`} aria-labelledby={`step-${i}`}>
              <h2 id={`step-${i}`} className="text-[19px] font-bold text-white">
                {step.title}
              </h2>
              {step.body && <p className="mt-2 text-[14px] leading-relaxed text-slate-300">{step.body}</p>}
              {step.image_url && (
                <figure className="mt-4">
                  <img
                    src={step.image_url}
                    alt={step.image_alt || step.title}
                    className="w-full rounded-2xl border border-white/10"
                    loading="lazy"
                  />
                  {step.image_alt && (
                    <figcaption className="mt-2 text-center text-[11px] font-medium text-slate-500">
                      {step.image_alt}
                    </figcaption>
                  )}
                </figure>
              )}
            </section>
          ))}
          {guide.steps.length === 0 && (
            <p className="flex items-center gap-2 text-[13px] text-slate-500">
              <ImageIcon className="w-4 h-4" aria-hidden="true" />
              This guide has no steps yet.
            </p>
          )}
        </div>

        {/* Back to all guides */}
        <Link
          to="/resources/guides"
          className="mt-10 w-full h-12 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-[14px] font-semibold text-white"
        >
          <ChevronRight className="w-4 h-4 -rotate-180" aria-hidden="true" />
          Back to all guides
        </Link>
      </main>

      <MobileTabBar active="Resources" />
    </div>
  );
};
