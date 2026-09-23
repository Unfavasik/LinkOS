import { PublicNavbar } from '../components/common/PublicNavbar';
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, BookOpen, Clock, ArrowRight } from 'lucide-react';
import useSWR from 'swr';
import { loadPublishedGuides, type Guide } from '../lib/guides';
import { MobileTabBar } from '../components/common/MobileTabBar';
import { SeoHead } from '../components/common/SeoHead';

const TAG_COLORS: Record<string, string> = {
  Guide: 'bg-blue-500',
  Tutorial: 'bg-sky-500',
  Template: 'bg-emerald-500',
  'Business Tip': 'bg-violet-500',
};

async function fetchGuides(): Promise<Guide[]> {
  return loadPublishedGuides();
}

export const GuidesListPage: React.FC = () => {
  const { data: guides, error } = useSWR('published-guides', fetchGuides);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!guides) return [];
    return guides.filter(
      (g) =>
        !q ||
        g.title.toLowerCase().includes(q) ||
        g.intro.toLowerCase().includes(q) ||
        g.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [guides, query]);

  return (
    <div className="min-h-screen bg-[#050D1F] pb-20">
      <SeoHead
        title="Guides & Tutorials | LinkOS Resources"
        description="Step-by-step guides and tutorials to create, customize and grow your LinkOS business page."
      />

      <PublicNavbar />

      {/* Dark hero */}
      <section className="max-w-2xl md:max-w-5xl mx-auto px-4 pt-1">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px]">
          <Link to="/" className="text-blue-400 hover:text-blue-300 font-medium">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
          <Link to="/resources" className="text-blue-400 hover:text-blue-300 font-medium">Resources</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
          <span className="text-slate-300 font-medium">Guides &amp; Tutorials</span>
        </nav>

        <div className="mt-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 text-[12px] font-semibold text-slate-200">
            <BookOpen className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
            Learn • Build • Grow
          </span>
          <h1 className="mt-3 text-[30px] leading-[1.15] font-bold text-white text-balance">
            Guides &amp; <span className="text-blue-500">Tutorials</span>
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-slate-400">
            Step-by-step guides to create, customize and grow your business page. Pick one and
            follow along.
          </p>
        </div>

        {/* Search */}
        <div className="relative mt-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guides by title or topic..."
            aria-label="Search guides"
            className="w-full h-12 pl-11 pr-4 rounded-xl border border-white/15 bg-white/5 text-[14px] text-white placeholder:text-slate-500 outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition"
          />
        </div>
      </section>

      {/* White sheet with guide list */}
      <section className="mt-6 bg-white rounded-t-[28px] min-h-screen">
        <div className="max-w-2xl md:max-w-5xl mx-auto px-4 pt-6 pb-8">
          <h2 className="text-[19px] font-bold text-slate-900">
            All Guides <span className="text-slate-400 font-semibold text-[14px]">({filtered.length})</span>
          </h2>

          {error ? (
            <p className="text-center text-sm text-slate-500 py-10">Could not load guides. Please try again.</p>
          ) : !guides ? (
            <div className="mt-4 space-y-3" aria-label="Loading" role="status">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-10">
              {query ? 'No guides match your search.' : 'No guides published yet — check back soon.'}
            </p>
          ) : (
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {filtered.map((g) => (
                <li key={g.slug}>
                  <Link
                    to={`/resources/guides/${g.slug}`}
                    className="group flex gap-3.5 rounded-2xl border border-slate-200 bg-white p-3 hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    {g.hero_url ? (
                      <img
                        src={g.hero_url}
                        alt=""
                        aria-hidden="true"
                        className="w-24 h-24 rounded-xl object-cover shrink-0"
                        loading="lazy"
                      />
                    ) : (
                      <span className="w-24 h-24 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                        <BookOpen className="w-8 h-8 text-blue-500" aria-hidden="true" />
                      </span>
                    )}
                    <span className="flex-1 min-w-0 flex flex-col">
                      <span className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold text-white ${TAG_COLORS[g.tag] || 'bg-blue-500'}`}>
                          {g.tag}
                        </span>
                        {g.read_time && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            {g.read_time}
                          </span>
                        )}
                      </span>
                      <span className="mt-1.5 block text-[14px] font-bold text-slate-900 leading-snug text-balance">
                        {g.title}
                      </span>
                      <span className="mt-1 block text-[12px] leading-relaxed text-slate-500 line-clamp-2">
                        {g.intro}
                      </span>
                      {g.tags.length > 0 && (
                        <span className="mt-auto pt-1.5 flex items-center gap-1.5 flex-wrap">
                          {g.tags.slice(0, 3).map((t) => (
                            <span key={t} className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-500">
                              #{t}
                            </span>
                          ))}
                        </span>
                      )}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0 self-center" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <MobileTabBar active="Resources" />
    </div>
  );
};
