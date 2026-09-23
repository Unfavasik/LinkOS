import { PublicNavbar } from '../components/common/PublicNavbar';
import { MobileTabBar } from '../components/common/MobileTabBar';
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Heart,
  Eye,
  ArrowRight,
  Star,
  Flame,
  Crown,
  Play,
  Wand2,
  Smartphone,
  Globe,
  Rocket,
  Utensils,
  Briefcase,
  Scissors,
  Dumbbell,
  GraduationCap,
  HeartPulse,
  Palette,
  PartyPopper,
  LayoutGrid,
  ChevronDown,
} from 'lucide-react';
import { TEMPLATES, PageTemplate, TemplateCategory } from '../data/templates';
import { useTemplateOverrides, mergeTemplate, isProTemplate, templateBadge } from '../lib/templateService';
import { ProPaywallModal } from '../components/templates/ProPaywallModal';
import { StorageService } from '../lib/storage';
import { TemplateApplyWizard } from '../components/templates/TemplateApplyWizard';
import { SeoHead } from '../components/common/SeoHead';
import { coverFor } from '../data/templateCovers';
import type { Profile } from '../types';

/* Filter pills — mirrors the design's category row */
const CATEGORY_PILLS: { label: string; icon: React.ElementType; match: TemplateCategory | 'All' }[] = [
  { label: 'All', icon: LayoutGrid, match: 'All' },
  { label: 'Business', icon: Briefcase, match: 'Business' },
  { label: 'Food & Beverage', icon: Utensils, match: 'Food & Cafe' },
  { label: 'Beauty & Salon', icon: Scissors, match: 'Beauty & Spa' },
  { label: 'Fitness & Gym', icon: Dumbbell, match: 'Fitness' },
  { label: 'Education', icon: GraduationCap, match: 'Education' },
  { label: 'Healthcare', icon: HeartPulse, match: 'Health' },
  { label: 'Portfolio', icon: Palette, match: 'Creative' },
  { label: 'Events', icon: PartyPopper, match: 'Events' },
];

const CATEGORY_ICONS: Partial<Record<TemplateCategory, React.ElementType>> = {
  'Food & Cafe': Utensils,
  Business: Briefcase,
  'Beauty & Spa': Scissors,
  Fitness: Dumbbell,
  Education: GraduationCap,
  Health: HeartPulse,
  Creative: Palette,
  Events: PartyPopper,
};

const FEATURE_CHIPS = [
  { icon: Wand2, title: 'Fully Customizable', sub: 'Make it truly yours', cls: 'text-violet-300 bg-violet-500/10 border-violet-500/20' },
  { icon: Smartphone, title: 'Mobile Responsive', sub: 'Looks great everywhere', cls: 'text-blue-300 bg-blue-500/10 border-blue-500/20' },
  { icon: Globe, title: 'SEO Ready', sub: 'Get found on Google', cls: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20' },
  { icon: Rocket, title: 'One Click Launch', sub: 'Go live in minutes', cls: 'text-amber-300 bg-amber-500/10 border-amber-500/20' },
];

export const TemplatesGalleryPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'All' | TemplateCategory>('All');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [wizardTemplate, setWizardTemplate] = useState<PageTemplate | null>(null);
  // Prefill the apply wizard with the signed-in user's My Page data so
  // creating a website starts from everything they already filled in.
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  React.useEffect(() => {
    StorageService.getCurrentUserProfile().then(setUserProfile).catch(() => {});
  }, []);
  const [paywall, setPaywall] = useState<{ name: string; id: string } | null>(null);
  const { data: overrides } = useTemplateOverrides();

  const handleUse = (t: PageTemplate) => {
    if (isProTemplate(t)) {
      const plan = StorageService.getActiveUser()?.plan || 'free';
      if (plan === 'free') {
        setPaywall({ name: t.name, id: t.id });
        return;
      }
    }
    setWizardTemplate(t);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    // Admin overrides from Supabase win; templates the admin disabled are hidden
    const list = TEMPLATES
      .filter((t) => overrides?.[t.id]?.is_active !== false)
      .map((t) => mergeTemplate(t, overrides?.[t.id]));
    return list.filter((t) => {
      const matchesCategory = category === 'All' || t.category === category;
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [search, category, overrides]);

  const popular = useMemo(
    () => [...filtered].sort((a, b) => b.popularity - a.popularity).slice(0, 8),
    [filtered]
  );

  const visiblePills = showAllCategories ? CATEGORY_PILLS : CATEGORY_PILLS.slice(0, 6);
  const collage = ['/images/cafe/cover.webp', '/images/cards/office.png', '/images/cards/portfolio.png'];

  return (
    <div className="min-h-screen bg-[#050D1F] text-white selection:bg-blue-600 selection:text-white">
      <SeoHead
        title="50+ Free Business Page Templates — LinkOS"
        description="Browse 50+ full-stack business page templates. Pick a design, modify it with your content and publish your live page in minutes."
      />

      <PublicNavbar />

      <main className="pb-28 md:pb-16">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-[#04070F]">
          <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-violet-600/15 blur-[120px]" aria-hidden="true" />
          <div className="absolute top-20 right-0 w-96 h-96 rounded-full bg-blue-500/10 blur-[110px]" aria-hidden="true" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-16 md:flex md:items-center md:gap-12">
            <div className="md:max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[11px] md:text-xs font-semibold text-blue-300">
                <LayoutGrid className="w-3.5 h-3.5" />
                50+ Professional Templates
              </span>
              <h1 className="mt-4 text-[32px] md:text-[52px] font-extrabold tracking-tight leading-[1.08] text-balance">
                Beautiful Templates for{' '}
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  Every Business
                </span>
              </h1>
              <p className="mt-3 text-sm md:text-base text-slate-400 leading-relaxed max-w-md text-pretty">
                Choose a template, customize it your way, and launch in minutes. No coding needed.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <a
                  href="#popular"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-3 text-sm font-bold text-white transition-colors"
                >
                  Browse Templates <ArrowRight className="w-4 h-4" />
                </a>
                <Link
                  to="/features"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-6 py-3 text-sm font-bold text-white transition-colors"
                >
                  <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0">
                    <Play className="w-3 h-3 fill-[#04070F] text-[#04070F]" />
                  </span>
                  How It Works
                </Link>
              </div>

              {/* Feature chips */}
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {FEATURE_CHIPS.map(({ icon: Icon, title, sub, cls }) => (
                  <div key={title} className={`rounded-xl border p-3 ${cls}`}>
                    <Icon className="w-4.5 h-4.5" />
                    <p className="mt-1.5 text-[12px] font-bold leading-tight">{title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Template collage — desktop only */}
            <div className="hidden md:block relative flex-1 h-[380px]" aria-hidden="true">
              <div className="absolute top-6 right-40 w-64 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50 -rotate-6">
                <img src={collage[1]} alt="" className="w-full h-40 object-cover" loading="lazy" />
              </div>
              <div className="absolute top-0 right-4 w-80 rounded-2xl overflow-hidden border border-white/15 shadow-2xl shadow-black/60 rotate-2 z-10">
                <img src={collage[0]} alt="" className="w-full h-52 object-cover" loading="lazy" />
                <div className="bg-[#0B1424] px-4 py-3">
                  <p className="text-sm font-bold">Modern Café</p>
                  <p className="text-[11px] text-slate-400">Great Coffee, Better Days</p>
                </div>
              </div>
              <div className="absolute bottom-0 right-24 w-64 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50 rotate-6">
                <img src={collage[2]} alt="" className="w-full h-36 object-cover" loading="lazy" />
              </div>
            </div>
          </div>
        </section>

        {/* ── Search + category pills ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          <div className="relative max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              id="tpl-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-10 pr-9 py-2.5 rounded-full border border-white/10 bg-[#0B1424] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600/40 focus:border-blue-600/50 transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                ×
              </button>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {visiblePills.map(({ label, icon: Icon, match }) => {
              const active = category === match;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setCategory(match)}
                  aria-pressed={active}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-semibold border transition-colors ${
                    active
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-[#0B1424] border-white/10 text-slate-300 hover:border-white/25'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setShowAllCategories((v) => !v)}
              aria-expanded={showAllCategories}
              className="shrink-0 inline-flex items-center gap-1 px-3.5 py-2 rounded-full text-[12px] font-semibold border border-white/10 bg-[#0B1424] text-slate-300 hover:border-white/25 transition-colors"
            >
              {showAllCategories ? 'Less' : 'More'}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllCategories ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </section>

        {/* ── Popular Templates ── */}
        <section id="popular" className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 scroll-mt-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg md:text-xl font-extrabold flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                Popular Templates
              </h2>
              <p className="text-[12px] text-slate-500 mt-0.5">Most used templates by our community</p>
            </div>
            <button
              type="button"
              onClick={() => { setSearch(''); setCategory('All'); }}
              className="shrink-0 inline-flex items-center gap-1 text-[12px] font-bold text-blue-400 hover:text-blue-300 transition-colors"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-slate-500">No templates match &quot;{search}&quot;. Try another keyword.</p>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {popular.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  badge={templateBadge(template) || undefined}
                  onUse={() => handleUse(template)}
                />
              ))}
            </div>
          )}
        </section>

        {/* All templates when searching / filtering */}
        {(search || category !== 'All') && filtered.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-10">
            <h2 className="text-lg font-extrabold">
              All Results <span className="text-slate-500 font-medium text-sm">({filtered.length})</span>
            </h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {filtered.map((template) => (
                <TemplateCard key={template.id} template={template} onUse={() => handleUse(template)} />
              ))}
            </div>
          </section>
        )}

        {/* Go Pro banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-10">
          <div className="relative overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-900/60 via-purple-800/40 to-indigo-900/60 p-4 md:p-5 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-violet-500/20 border border-violet-400/30 flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold">Get Unlimited Access</h3>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">Unlock all premium templates, new updates and advanced features.</p>
            </div>
            <Link
              to="/signup"
              className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-bold transition-colors"
            >
              Go Pro <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </section>
      </main>

      <MobileTabBar active="Templates" />

      {wizardTemplate && (
        <TemplateApplyWizard
          template={wizardTemplate}
          existingProfile={userProfile}
          onClose={() => setWizardTemplate(null)}
          onPublished={() => setWizardTemplate(null)}
        />
      )}
      {paywall && (
        <ProPaywallModal
          templateName={paywall.name}
          templateId={paywall.id}
          onClose={() => setPaywall(null)}
        />
      )}
    </div>
  );
};

const TemplateCard: React.FC<{ template: PageTemplate; badge?: string; onUse: () => void }> = ({ template, badge, onUse }) => {
  const [liked, setLiked] = useState(false);
  const cover = template.cover_url || coverFor(template.id, template.category);
  const CategoryIcon = CATEGORY_ICONS[template.category] || LayoutGrid;

  return (
    <div className="group rounded-2xl border border-white/10 bg-[#0B1424] overflow-hidden transition-colors hover:border-white/25">
      <div className="relative">
        <Link to={`/templates/detail/${template.id}`} className="block relative aspect-[16/10] bg-[#101B30]">
          {cover ? (
            <img src={cover} alt={`${template.name} template`} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-900 via-[#101B30] to-[#050D1F] flex items-center justify-center">
              <span className="text-2xl font-bold text-white/15">{template.name.charAt(0)}</span>
            </div>
          )}
          {badge && (
            <span className={`absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
              badge === 'Bestseller' || badge === 'Popular'
                ? 'bg-amber-400 text-amber-950'
                : badge === 'New'
                ? 'bg-blue-500 text-white'
                : badge === 'Hot'
                ? 'bg-red-500 text-white'
                : 'bg-purple-500 text-white'
            }`}>
              {(badge === 'Bestseller' || badge === 'Popular') && <Star className="w-2.5 h-2.5 fill-amber-950" />}
              {badge}
            </span>
          )}
          {template.is_pro && !badge && (
            <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[9px] font-bold">
              <Crown className="w-2.5 h-2.5" /> Pro
            </span>
          )}
        </Link>
        <button
          type="button"
          onClick={() => setLiked((v) => !v)}
          aria-label={liked ? 'Remove from favorites' : 'Save to favorites'}
          aria-pressed={liked}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-sm transition-colors ${liked ? 'bg-red-500/20 text-red-400' : 'bg-black/30 text-white/80 hover:text-white'}`}
        >
          <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-red-400' : ''}`} />
        </button>
      </div>
      <div className="p-3.5">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
          <CategoryIcon className="w-3.5 h-3.5" />
          {template.category}
        </p>
        <h3 className="mt-1 text-sm font-extrabold truncate">{template.name}</h3>
        <p className="mt-0.5 text-[11px] text-slate-500 leading-snug line-clamp-2 min-h-[2.1em]">{template.description}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link
            to={`/templates/detail/${template.id}`}
            className="inline-flex items-center justify-center gap-1 py-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-[11px] font-bold transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </Link>
          <button
            type="button"
            onClick={onUse}
            className="inline-flex items-center justify-center py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition-colors"
          >
            Use Template
          </button>
        </div>
      </div>
    </div>
  );
};
