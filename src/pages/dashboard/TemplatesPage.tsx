import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext, Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  LayoutTemplate,
  X,
  Check,
  Crown,
  ExternalLink,
  Sparkles,
  Type,
  Shapes,
  Palette,
  Eye,
  Rocket,
  Heart,
  Bookmark,
} from 'lucide-react';
import { Profile } from '../../types';
import { StorageService } from '../../lib/storage';
import { TEMPLATES, TEMPLATE_CATEGORIES, PageTemplate, TemplateCategory, getTemplateById } from '../../data/templates';
import { TemplatePreview } from '../../components/templates/TemplatePreview';
import { TemplateApplyWizard } from '../../components/templates/TemplateApplyWizard';
import { THEME_PALETTES, FONT_STACKS } from '../../lib/theme';
import { fetchSavedTemplates, toggleSavedTemplate, type SavedTemplate } from '../../lib/savedTemplates';

export const TemplatesPage: React.FC = () => {
  const { profile, setProfile } = useOutletContext<{
    profile: Profile | null;
    setProfile: (p: Profile) => void;
  }>();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'All' | TemplateCategory>('All');
  const [selected, setSelected] = useState<PageTemplate | null>(null);
  const [wizardTemplate, setWizardTemplate] = useState<PageTemplate | null>(null);
  const [publishedName, setPublishedName] = useState<string | null>(null);
  const [savedRows, setSavedRows] = useState<SavedTemplate[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('view') === 'saved' ? 'saved' : 'all';

  const currentTemplate = getTemplateById(profile?.template_id);

  useEffect(() => {
    let cancelled = false;
    const user = StorageService.getActiveUser();
    if (!user) return;
    fetchSavedTemplates(user.id).then((rows) => {
      if (!cancelled) setSavedRows(rows);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const savedIds = useMemo(() => new Set(savedRows.map((row) => row.template_id)), [savedRows]);

  const handleToggleSave = async (template: PageTemplate) => {
    const user = StorageService.getActiveUser();
    if (!user) return;
    const userName = profile?.business_name || user.email || 'LinkOS User';
    const nowSaved = await toggleSavedTemplate(user.id, userName, template.id, template.name);
    setSavedRows(await fetchSavedTemplates(user.id));
    if (nowSaved && view === 'all') {
      // Keep the user on the grid; the heart fill is the confirmation.
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base =
      view === 'saved'
        ? TEMPLATES.filter((t) => savedIds.has(t.id))
        : TEMPLATES;
    return base.filter((t) => {
      const matchesCategory = category === 'All' || t.category === category;
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [search, category, view, savedIds]);

  const businessName = profile?.business_name || 'Your Business';
  const pageCategory = profile?.category || 'Business';

  const handlePublished = (updated: Profile) => {
    setProfile(updated);
    setPublishedName(updated.business_name);
    setWizardTemplate(null);
    setTimeout(() => setPublishedName(null), 10000);
  };

  return (
    <div className="max-w-5xl">
      {/* Page heading */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
        <div>
          <h1 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-zinc-700" />
            Templates
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            {TEMPLATES.length} ready-made designs. Preview, modify and publish to your live page in one click.
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-zinc-200 bg-white p-0.5 self-start">
          <button
            type="button"
            onClick={() => setSearchParams({})}
            className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-colors ${
              view === 'all' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            All Templates
          </button>
          <button
            type="button"
            onClick={() => setSearchParams({ view: 'saved' })}
            className={`px-3 py-1.5 rounded-md text-[11px] font-semibold inline-flex items-center gap-1.5 transition-colors ${
              view === 'saved' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            Saved{savedRows.length > 0 ? ` (${savedRows.length})` : ''}
          </button>
        </div>
        {currentTemplate && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-700 self-start">
            <Check className="w-3.5 h-3.5" />
            Current: {currentTemplate.name}
          </div>
        )}
      </div>

      {/* Published success banner */}
      {publishedName && (
        <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <Rocket className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-900">Published — "{publishedName}" is now live.</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Your page theme, colors, fonts and buttons were updated instantly.
              </p>
            </div>
          </div>
          <Link
            to={`/dashboard/editor`}
            className="shrink-0 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Page
          </Link>
        </div>
      )}

      {/* Search + category filter */}
      <div className="mb-5 space-y-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates, styles, industries..."
            className="w-full pl-9 pr-8 py-2 rounded-lg border border-zinc-200 bg-white text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-zinc-400 hover:text-zinc-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none]">
          {(['All', ...TEMPLATE_CATEGORIES] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat as 'All' | TemplateCategory)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-colors ${
                category === cat
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400 hover:text-zinc-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Template grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          {view === 'saved' ? (
            <>
              <Bookmark className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
              <p className="text-xs text-zinc-500">No saved templates yet.</p>
              <p className="text-[11px] text-zinc-400 mt-1">Tap the heart on any template to save it here.</p>
            </>
          ) : (
            <>
              <LayoutTemplate className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
              <p className="text-xs text-zinc-500">No templates match "{search}". Try a different keyword.</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((template) => {
            const isCurrent = profile?.template_id === template.id;
            return (
              <div
                key={template.id}
                className={`group relative rounded-2xl border bg-white p-2.5 transition-all hover:shadow-md ${
                  isCurrent ? 'border-emerald-400 ring-1 ring-emerald-300' : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                {isCurrent && (
                  <span className="absolute top-4 left-4 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-xs">
                    <Check className="w-3 h-3" />
                    Live
                  </span>
                )}
                {template.is_pro && !isCurrent && (
                  <span className="absolute top-4 left-4 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-bold">
                    <Crown className="w-3 h-3" />
                    Pro
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleToggleSave(template)}
                  aria-label={savedIds.has(template.id) ? `Remove ${template.name} from saved` : `Save ${template.name}`}
                  title={savedIds.has(template.id) ? 'Saved — tap to remove' : 'Save template'}
                  className={`absolute top-4 right-4 z-10 p-1.5 rounded-full backdrop-blur-sm border transition-colors ${
                    savedIds.has(template.id)
                      ? 'bg-rose-50 border-rose-200 text-rose-500'
                      : 'bg-white/80 border-zinc-200 text-zinc-400 hover:text-rose-500 hover:border-rose-200'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${savedIds.has(template.id) ? 'fill-rose-500' : ''}`} />
                </button>

                <TemplatePreview
                  template={template}
                  businessName={businessName}
                  category={pageCategory}
                  className="rounded-xl border border-zinc-100"
                />

                <div className="pt-2.5 px-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-bold text-zinc-900 truncate">{template.name}</h3>
                    <span className="text-[10px] text-zinc-400 shrink-0">{template.category}</span>
                  </div>
                  {view === 'saved' &&
                    (() => {
                      const row = savedRows.find((r) => r.template_id === template.id);
                      return row ? (
                        <p className="text-[10px] text-rose-500 font-medium mt-0.5 truncate">
                          Saved by {row.user_name}
                        </p>
                      ) : null;
                    })()}
                  <div className="mt-2 grid grid-cols-[1fr_1.5fr] gap-2">
                    <Link
                      to={`/templates/preview/${template.id}`}
                      className="inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-[11px] font-semibold transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSelected(template)}
                      className="inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-semibold transition-colors"
                    >
                      {isCurrent ? 'View & Edit' : 'Preview & Apply'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Apply wizard */}
      {wizardTemplate && (
        <TemplateApplyWizard
          template={wizardTemplate}
          existingProfile={profile}
          onClose={() => setWizardTemplate(null)}
          onPublished={handlePublished}
        />
      )}

      {/* Preview & Apply Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid sm:grid-cols-[220px_1fr] gap-0">
              {/* Phone preview */}
              <div className="p-5 bg-zinc-50 sm:bg-zinc-100/60 flex justify-center border-b sm:border-b-0 sm:border-r border-zinc-200">
                <div className="w-40 rounded-[1.4rem] border-[6px] border-zinc-900 overflow-hidden shadow-xl bg-zinc-900">
                  <TemplatePreview
                    template={selected}
                    businessName={businessName}
                    category={pageCategory}
                  />
                </div>
              </div>

              {/* Details */}
              <div className="p-5 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-zinc-900">{selected.name}</h2>
                      {selected.is_pro && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-bold">
                          <Crown className="w-3 h-3" />
                          Pro
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {selected.category} template · {selected.popularity}% popularity
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    aria-label="Close preview"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-zinc-600 leading-relaxed mt-3">{selected.description}</p>

                {/* Style specs */}
                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-100">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-zinc-500">
                      <Palette className="w-3 h-3" />
                      Colors
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span
                        className="w-5 h-5 rounded-md border border-zinc-200"
                        style={{ background: THEME_PALETTES[selected.theme].bg }}
                        title="Page background"
                      />
                      <span
                        className="w-5 h-5 rounded-md border border-zinc-200"
                        style={{ background: THEME_PALETTES[selected.theme].surface }}
                        title="Card surface"
                      />
                      <span
                        className="w-5 h-5 rounded-md border border-zinc-200"
                        style={{ background: selected.accent_color }}
                        title="Accent color"
                      />
                      <span className="text-[10px] text-zinc-500 font-medium capitalize ml-1">
                        {selected.theme} theme
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-100">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-zinc-500">
                      <Type className="w-3 h-3" />
                      Typography
                    </div>
                    <p
                      className="text-sm font-semibold text-zinc-900 mt-1.5 truncate"
                      style={{ fontFamily: FONT_STACKS[selected.font_family] }}
                    >
                      {businessName}
                    </p>
                    <p className="text-[10px] text-zinc-500 capitalize">{selected.font_family} typeface</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-100">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-zinc-500">
                      <Shapes className="w-3 h-3" />
                      Buttons
                    </div>
                    <div
                      className="mt-2 inline-block px-3 py-1 bg-zinc-900 text-white text-[10px] font-semibold"
                      style={{
                        borderRadius: selected.button_style === 'pill' ? '9999px' : selected.button_style === 'sharp' ? '4px' : '12px',
                      }}
                    >
                      {selected.button_style}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-100">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-zinc-500">
                      <Sparkles className="w-3 h-3" />
                      Layout
                    </div>
                    <p className="text-xs font-semibold text-zinc-900 mt-2 capitalize">{selected.layout}</p>
                    <p className="text-[10px] text-zinc-500 capitalize">
                      {selected.layout === 'banner' || selected.layout === 'bold' ? 'Accent header band' : 'Clean header'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 flex flex-col sm:flex-row gap-2 sm:mt-auto pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setWizardTemplate(selected);
                      setSelected(null);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-colors"
                  >
                    <Rocket className="w-4 h-4" />
                    {profile?.template_id === selected.id ? 'Edit & Republish' : 'Apply — Set Up My Website'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="px-4 py-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
