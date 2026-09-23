import { PublicNavbar } from '../components/common/PublicNavbar';
import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  BookOpen,
  FileText,
  Wrench,
  Lightbulb,
  Play,
  HelpCircle,
  ArrowRight,
  ChevronRight,
  Crown,
  Home as HomeIcon,
} from 'lucide-react';
import {
  RESOURCE_CATEGORIES,
  POPULAR_RESOURCES,
  type ResourceChip,
} from '../data/resources';
import { MobileTabBar } from '../components/common/MobileTabBar';
import { SeoHead } from '../components/common/SeoHead';

const CHIP_LIST: ResourceChip[] = ['All', 'Guides', 'Templates', 'Tools', 'Business Tips'];

const ICONS: Record<string, React.ElementType> = {
  book: BookOpen,
  file: FileText,
  wrench: Wrench,
  bulb: Lightbulb,
  play: Play,
  help: HelpCircle,
};

export const ResourcesPage: React.FC = () => {
  const navigate = useNavigate();
  const [chip, setChip] = useState<ResourceChip>('All');
  const [query, setQuery] = useState('');

  const categories = useMemo(() => {
    const q = query.trim().toLowerCase();
    return RESOURCE_CATEGORIES.filter((c) => {
      const matchesChip = chip === 'All' || c.chips.includes(chip) || c.chips.includes('All');
      const matchesQuery =
        !q || c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
      return matchesChip && matchesQuery;
    });
  }, [chip, query]);

  const popular = useMemo(() => {
    const q = query.trim().toLowerCase();
    return POPULAR_RESOURCES.filter((r) => !q || r.title.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="min-h-screen bg-[#050D1F] pb-20">
      <SeoHead
        title="Resources — Guides, Templates & Tools | LinkOS"
        description="Guides, tutorials, templates and tools to get the most out of LinkOS. Everything you need in one place."
      />

      {/* Header */}
      <PublicNavbar />

      {/* Dark hero section */}
      <section className="max-w-2xl md:max-w-5xl mx-auto px-4 pt-1">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px]">
          <Link to="/" className="text-blue-400 hover:text-blue-300 font-medium">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
          <span className="text-slate-300 font-medium">Resources</span>
        </nav>

        <div className="relative mt-5">
          <div className="max-w-[68%]">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 text-[12px] font-semibold text-slate-200">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
              Learn • Build • Grow
            </span>
            <h1 className="mt-3 text-[30px] leading-[1.15] font-bold text-white text-balance">
              Resources to
              <br />
              Help <span className="text-blue-500">You Grow</span>
            </h1>
            <p className="mt-3 text-[14px] leading-relaxed text-slate-400">
              Guides, tutorials, templates and tools to get the most out of LinkOS. Everything you
              need in one place.
            </p>
          </div>
          <img
            src="/images/resources/folder-3d.png"
            alt=""
            aria-hidden="true"
            className="absolute -top-6 right-[-16px] w-[140px] h-[140px] object-contain pointer-events-none select-none"
          />
        </div>

        {/* Search */}
        <div className="relative mt-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" aria-hidden="true" />
          <input
            id="res-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guides, templates, tools..."
            aria-label="Search guides, templates, tools"
            className="w-full h-12 pl-11 pr-4 rounded-xl border border-white/15 bg-white/5 text-[14px] text-white placeholder:text-slate-500 outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition"
          />
        </div>

        {/* Filter chips */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Filter resources">
          {CHIP_LIST.map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={chip === c}
              onClick={() => setChip(c)}
              className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold transition-colors ${
                chip === c
                  ? 'bg-blue-600 text-white'
                  : 'border border-white/15 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* White sheet */}
      <section className="mt-6 bg-white rounded-t-[28px] min-h-screen">
        <div className="max-w-2xl md:max-w-5xl mx-auto px-4 pt-6 pb-8">
          {/* Category cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
            {categories.map((c) => {
              const Icon = ICONS[c.icon];
              return (
                <Link
                  key={c.id}
                  to={c.href}
                  className={`${c.bg} rounded-2xl p-4 flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all`}
                >
                  <span className={`w-11 h-11 rounded-xl ${c.tileBg} flex items-center justify-center`}>
                    {c.icon === 'play' ? (
                      <span className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-white" aria-hidden="true" />
                      </span>
                    ) : (
                      <Icon className={`w-5.5 h-5.5 ${c.tileColor}`} aria-hidden="true" />
                    )}
                  </span>
                  <h3 className="mt-3 text-[15px] font-bold text-slate-900 leading-snug">{c.title}</h3>
                  <p className="mt-1 text-[12px] leading-relaxed text-slate-500 flex-1">{c.description}</p>
                  <span className="mt-3 flex items-center justify-between">
                    <span className={`text-[12px] font-semibold ${c.metaColor}`}>{c.meta}</span>
                    <ArrowRight className={`w-4 h-4 ${c.metaColor}`} aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>

          {categories.length === 0 && (
            <p className="text-center text-sm text-slate-500 py-8">No resources match your search.</p>
          )}

          {/* Go Pro */}
          <Link
            to="/pricing"
            className="mt-5 rounded-2xl bg-gradient-to-r from-[#0B1B2B] to-[#0E2A22] p-4 flex items-center gap-3.5 hover:opacity-95 transition-opacity"
          >
            <span className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5 text-amber-400" aria-hidden="true" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[15px] font-bold text-amber-400">Go Pro</span>
              <span className="block text-[12px] leading-snug text-slate-300">
                Get access to premium templates, advanced guides and exclusive resources.
              </span>
            </span>
            <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" aria-hidden="true" />
          </Link>

          {/* Popular Resources */}
          <div className="mt-7 flex items-center justify-between">
            <h2 className="text-[19px] font-bold text-slate-900">Popular Resources</h2>
            <Link to="/resources" className="text-[13px] font-semibold text-blue-600 hover:text-blue-700">
              View All
            </Link>
          </div>

          <ul className="mt-3 divide-y divide-slate-100">
            {popular.map((r) => (
              <li key={r.slug}>
                <Link to={`/resources/${r.slug}`} className="py-3 flex items-center gap-3 group">
                  <img
                    src={r.thumb}
                    alt=""
                    aria-hidden="true"
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                  />
                  <span className="flex-1 min-w-0">
                    <span className="block text-[14px] font-semibold text-slate-900 leading-snug">
                      {r.title}
                    </span>
                    <span className="mt-1.5 flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold text-white ${r.tagColor}`}>
                        {r.tag}
                      </span>
                      <span className="text-[12px] text-slate-400">{r.meta}</span>
                    </span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>

          {popular.length === 0 && (
            <p className="text-center text-sm text-slate-500 py-6">No articles match your search.</p>
          )}

          <p className="mt-6 flex items-center justify-center gap-1.5 text-[12px] text-slate-400">
            <HomeIcon className="w-3.5 h-3.5" aria-hidden="true" />
            LinkOS — Smart Business Pages
          </p>
        </div>
      </section>

      <MobileTabBar active="Resources" />
    </div>
  );
};
