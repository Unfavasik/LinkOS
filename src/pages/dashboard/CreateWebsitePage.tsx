import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Loader2, Search } from 'lucide-react';
import { ALL_TEMPLATES, TEMPLATE_CATEGORIES } from '../../data/templates';
import { THEME_PALETTES } from '../../lib/theme';
import { createWebsiteFromTemplate, isSlugAvailable, slugify, suggestSlugs } from '../../lib/websites';

export const CreateWebsitePage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live slug availability: as the user types a name, check whether the
  // derived URL is free and offer tappable alternatives when it is taken.
  const slugPreview = useMemo(() => slugify(name.trim() || 'my-website'), [name]);
  const [slugTaken, setSlugTaken] = useState(false);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const clean = name.trim();
    if (!clean) {
      setSlugTaken(false);
      setSuggestions([]);
      setCheckingSlug(false);
      return;
    }
    setCheckingSlug(true);
    const timer = window.setTimeout(async () => {
      const taken = !(await isSlugAvailable(slugPreview));
      setSlugTaken(taken);
      setSuggestions(taken ? await suggestSlugs(clean) : []);
      setCheckingSlug(false);
    }, 450);
    return () => window.clearTimeout(timer);
  }, [name, slugPreview]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_TEMPLATES.filter(
      (t) =>
        (category === 'All' || t.category === category) &&
        (!q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)),
    );
  }, [query, category]);

  const create = async () => {
    if (!selected) return;
    setCreating(true);
    setError(null);
    const site = await createWebsiteFromTemplate(selected, name.trim() || 'My Website');
    setCreating(false);
    if (!site) {
      setError('Could not create the website. Please try again.');
      return;
    }
    navigate(`/dashboard/websites/${site.id}`);
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <button
        type="button"
        onClick={() => navigate('/dashboard/websites')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-800"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to My Websites
      </button>
      <h1 className="mt-3 text-xl font-extrabold text-zinc-900">Create New Website</h1>
      <p className="mt-1 text-xs text-zinc-500">
        Pick a template — you will get your own copy to customize. The original template is never modified.
      </p>

      <div className="mt-5 rounded-2xl border border-zinc-200 bg-white p-4">
        <label htmlFor="website-name" className="text-[11px] font-bold text-zinc-700 uppercase tracking-wide">
          Website name
        </label>
        <input
          id="website-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. My Cafe, Anant Seat Covers, My Portfolio"
          className="mt-2 w-full h-10 rounded-xl border border-zinc-300 px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1.5 text-[11px] text-zinc-400">
          Your URL will be <span className="font-mono">linkos.app/{slugPreview}</span>
          {checkingSlug && <span className="ml-2 text-zinc-400">checking…</span>}
        </p>
        {slugTaken && !checkingSlug && (
          <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-[11px] font-bold text-amber-800">
              linkos.app/{slugPreview} is already taken
            </p>
            <p className="mt-0.5 text-[11px] text-amber-700">Tap a suggestion to use it:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setName(s)}
                  className="rounded-lg border border-amber-300 bg-white px-2.5 py-1 font-mono text-[11px] font-bold text-amber-900 hover:bg-amber-100 transition-colors"
                >
                  {s}
                </button>
              ))}
              {suggestions.length === 0 && (
                <span className="text-[11px] text-amber-700">Loading suggestions…</span>
              )}
            </div>
            <p className="mt-2 text-[10px] text-amber-600">
              You can still create — a free suffix will be added automatically.
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search templates"
            aria-label="Search templates"
            className="w-full h-10 rounded-xl border border-zinc-300 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['All', ...TEMPLATE_CATEGORIES.map((c) => c)].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`shrink-0 px-3 h-8 rounded-lg text-[11px] font-bold transition-colors ${
                category === cat ? 'bg-zinc-900 text-white' : 'border border-zinc-300 text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mt-4 text-xs font-bold text-red-600">{error}</p>}

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((t) => {
          const isSelected = selected === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelected(isSelected ? null : t.id)}
              className={`relative text-left rounded-2xl border-2 overflow-hidden bg-white transition-all ${
                isSelected ? 'border-blue-600 shadow-md' : 'border-zinc-200 hover:border-zinc-300 shadow-sm'
              }`}
            >
              {isSelected && (
                <span className="absolute top-3 right-3 z-10 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </span>
              )}
              <div className="h-32 overflow-hidden" style={{ background: THEME_PALETTES[t.theme]?.bg || '#f4f4f5' }}>
                <img src={t.cover_url || '/images/cafe/cover.webp'} alt={`${t.name} template`} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <p className="text-sm font-bold text-zinc-900">{t.name}</p>
                <p className="mt-0.5 text-[11px] text-zinc-500">{t.category} template</p>
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="sticky bottom-4 mt-6 flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-3 shadow-lg">
          <p className="text-xs font-bold text-zinc-700 truncate">
            {ALL_TEMPLATES.find((t) => t.id === selected)?.name} selected
          </p>
          <button
            type="button"
            onClick={create}
            disabled={creating}
            className="inline-flex items-center gap-2 px-5 h-10 rounded-xl bg-blue-600 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-60 transition-colors"
          >
            {creating && <Loader2 className="w-4 h-4 animate-spin" />}
            {creating ? 'Creating…' : 'Create Website'}
          </button>
        </div>
      )}
    </div>
  );
};
