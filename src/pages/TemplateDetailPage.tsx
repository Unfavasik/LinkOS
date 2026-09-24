import { PublicNavbar } from '../components/common/PublicNavbar';
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Smartphone,
  Tablet,
  Monitor,
  ArrowRight,
  Star,
  ShieldCheck,
  Wand2,
  Sparkles,
  Gauge,
  Search,
  RefreshCw,
} from 'lucide-react';
import { TEMPLATES, getTemplateById, PageTemplate } from '../data/templates';
import { useTemplateOverrides, mergeTemplate } from '../lib/templateService';
import { TemplateApplyWizard } from '../components/templates/TemplateApplyWizard';
import { SeoHead } from '../components/common/SeoHead';
import { LinkOsLogo } from '../components/common/LinkOsLogo';
import { StorageService } from '../lib/storage';
import { Profile } from '../types';

/* Photographic cover per category — falls back to a gradient tile */
const CATEGORY_COVERS: Record<string, string> = {
  'Food & Cafe': '/images/cafe/cover.webp',
  Services: '/images/garage/cover.webp',
  'Beauty & Spa': '/images/cards/salon.webp',
  Fitness: '/images/cards/gym.webp',
  Health: '/images/cards/clinic.webp',
  Retail: '/images/cards/retail.webp',
  Business: '/images/cards/car.webp',
};

const FEATURES = [
  { icon: Smartphone, label: 'Fully Responsive' },
  { icon: Wand2, label: 'Easy to Customize' },
  { icon: Sparkles, label: 'Modern Design' },
  { icon: Gauge, label: 'Fast Loading' },
  { icon: Search, label: 'SEO Optimized' },
  { icon: RefreshCw, label: 'Free Updates' },
];

type Device = 'mobile' | 'tablet' | 'desktop';

const DEVICE_WIDTHS: Record<Device, string> = {
  mobile: 'w-[240px] md:w-[320px]',
  tablet: 'w-[420px] md:w-[600px]',
  desktop: 'w-full max-w-[560px] md:max-w-4xl',
};

export const TemplateDetailPage: React.FC = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { data: overrides } = useTemplateOverrides();
  const baseTemplate = getTemplateById(templateId || '');
  // Admin-configured version from Supabase wins over the local base
  const template = useMemo(
    () => (baseTemplate ? mergeTemplate(baseTemplate, overrides?.[baseTemplate.id]) : undefined),
    [baseTemplate, overrides]
  );
  const [wizardOpen, setWizardOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [device, setDevice] = useState<Device>('mobile');
  const [existingProfile, setExistingProfile] = useState<Profile | null>(null);

  useEffect(() => {
    StorageService.getCurrentUserProfile()
      .then((p) => setExistingProfile(p))
      .catch(() => setExistingProfile(null));
  }, []);

  const related = useMemo(() => {
    if (!template) return [];
    const same = TEMPLATES.filter((t) => t.id !== template.id && t.category === template.category);
    const rest = TEMPLATES.filter((t) => t.id !== template.id && t.category !== template.category);
    return [...same, ...rest].slice(0, 6);
  }, [template]);

  const relatedIdx = useMemo(() => {
    if (!template) return 0;
    return Math.max(0, related.findIndex((t) => t.id === template.id));
  }, [related, template]);

  if (!template) {
    return (
      <div className="min-h-screen bg-[#050D1F] text-white flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm text-slate-400">Template not found.</p>
        <button
          type="button"
          onClick={() => navigate('/templates')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold"
        >
          Browse Templates
        </button>
      </div>
    );
  }

  const cover = CATEGORY_COVERS[template.category];
  const popular = template.popularity >= 90;

  return (
    <div className="min-h-screen bg-[#050D1F] text-white">
      <SeoHead title={`${template.name} Template — LinkOS`} description={template.description} />

      {/* Header */}
      <PublicNavbar />

      <main className="max-w-2xl md:max-w-6xl mx-auto px-4 pb-16">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 py-3 text-[11px] text-slate-400 overflow-x-auto [scrollbar-width:none] whitespace-nowrap">
          <Link to="/templates" className="hover:text-slate-200 transition-colors">Templates</Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <span className="text-slate-500">{template.category}</span>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <span className="text-slate-200 font-semibold">{template.name}</span>
        </nav>

        {/* Hero — stacked on mobile, cover left / info right on desktop */}
        <div className="md:grid md:grid-cols-[1.15fr_1fr] md:gap-10 md:items-start">
          {/* Hero cover */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0B1424]">
            {cover?.trim() ? (
              <img src={cover.trim()} alt={`${template.name} template cover`} className="w-full h-52 sm:h-64 md:h-[380px] object-cover" />
            ) : (
              <div className="w-full h-52 sm:h-64 md:h-[380px] bg-gradient-to-br from-blue-900 via-[#0B1424] to-[#050D1F] flex items-center justify-center">
                <span className="text-4xl font-bold text-white/15">{template.name.charAt(0)}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050D1F]/80 via-transparent to-transparent" />
          </div>

          {/* Info column */}
          <div className="mt-4 md:mt-0">
            {/* Title block */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-balance">{template.name}</h1>
                <p className="text-xs text-slate-400 mt-1">{template.category} Template</p>
              </div>
              {popular && (
                <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
                  <Star className="w-3 h-3 fill-amber-300" />
                  Popular
                </span>
              )}
            </div>

            <p className="text-[13px] md:text-sm text-slate-400 leading-relaxed mt-3 text-pretty">{template.description} Perfect for showcasing your business and attracting more customers.</p>

            {/* Actions */}
            <div className="mt-4 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setWizardOpen(true)}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors active:scale-[0.99]"
              >
                Use This Template
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setLiked((v) => !v)}
                aria-label={liked ? 'Remove from favorites' : 'Save to favorites'}
                aria-pressed={liked}
                className={`p-3 rounded-xl border transition-colors ${liked ? 'border-red-500/40 bg-red-500/10 text-red-400' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}`}
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-red-400' : ''}`} />
              </button>
            </div>

            {/* Feature chips */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FEATURES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/10 bg-white/[0.04]">
                  <Icon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="text-[11px] font-semibold text-slate-200 truncate">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview on Device */}
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              Preview on Device
            </h2>
            <div className="flex items-center gap-1 p-1 rounded-lg border border-white/10 bg-white/5">
              {([
                { id: 'mobile', icon: Smartphone },
                { id: 'tablet', icon: Tablet },
                { id: 'desktop', icon: Monitor },
              ] as const).map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setDevice(id)}
                  aria-label={`Preview on ${id}`}
                  aria-pressed={device === id}
                  className={`p-1.5 rounded-md transition-colors ${device === id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>

          <div className="relative mt-4 flex items-center justify-center py-2">
            <button
              type="button"
              onClick={() => navigate(`/templates/detail/${related[(relatedIdx - 1 + related.length) % related.length].id}`)}
              aria-label="Previous template"
              className="absolute left-0 z-10 p-2.5 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className={`${DEVICE_WIDTHS[device]} transition-all duration-300`}>
              <div className="rounded-[2rem] border-[6px] border-[#1A2438] bg-[#0B1424] shadow-2xl overflow-hidden">
                <div className="h-[420px] md:h-[600px] bg-white">
                  <iframe
                    key={`${template.id}-${device}`}
                    src={`/templates/preview/${template.id}`}
                    title={`${template.name} live preview`}
                    className="w-full h-full border-0"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/templates/detail/${related[(relatedIdx + 1) % related.length].id}`)}
              aria-label="Next template"
              className="absolute right-0 z-10 p-2.5 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* You May Also Like */}
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">You May Also Like</h2>
            <Link to="/templates" className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="mt-3 grid grid-cols-3 md:grid-cols-6 gap-2.5 md:gap-4">
            {related.slice(0, 6).map((t: PageTemplate) => {
              const tCover = CATEGORY_COVERS[t.category];
              return (
                <Link key={t.id} to={`/templates/detail/${t.id}`} className="group">
                  <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#0B1424] aspect-[4/3]">
                    {tCover?.trim() ? (
                      <img src={tCover.trim()} alt={`${t.name} template`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-900 to-[#0B1424] flex items-center justify-center">
                        <span className="text-xl font-bold text-white/15">{t.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] font-bold mt-1.5 truncate">{t.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{t.category}</p>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      {wizardOpen && (
        <TemplateApplyWizard
          template={template}
          existingProfile={existingProfile}
          websiteMode
          onClose={() => setWizardOpen(false)}
          onWebsitePublished={(site) => navigate(`/dashboard/websites/${site.id}`)}
          onPublished={() => navigate('/dashboard')}
        />
      )}
    </div>
  );
};
