import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ExternalLink, Eye, Globe, LayoutTemplate, Loader2, Settings,
  Share2, Trash2, BarChart3, Palette, FileText, Search as SeoIcon, Copy, Check,
} from 'lucide-react';
import useSWR from 'swr';
import {
  fetchWebsite, updateWebsite, setWebsiteStatus, deleteWebsite, websiteUrl,
} from '../../lib/websites';
import { getTemplateById } from '../../data/templates';
import { StorageService } from '../../lib/storage';

const SECTIONS = [
  { id: 'overview', label: 'Overview', icon: LayoutTemplate },
  { id: 'content', label: 'Content', icon: FileText },
  { id: 'design', label: 'Appearance', icon: Palette },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'seo', label: 'SEO', icon: SeoIcon },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

export const WebsiteManagePage: React.FC = () => {
  const { websiteId = '' } = useParams<{ websiteId: string }>();
  const navigate = useNavigate();
  const [section, setSection] = useState<SectionId>('overview');
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  const { data: site, mutate } = useSWR(['website', websiteId], () => fetchWebsite(websiteId));

  if (!site) {
    return (
      <div className="p-8 text-center text-xs text-zinc-400">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
        Loading website…
      </div>
    );
  }

  const tpl = getTemplateById(site.template_id);
  const url = websiteUrl(site);
  const isLive = site.status === 'live';

  const publish = async () => {
    setPublishing(true);
    await setWebsiteStatus(site.id, isLive ? 'draft' : 'live');
    setPublishing(false);
    mutate();
  };

  const copyUrl = () => {
    navigator.clipboard?.writeText(`https://${url}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    await updateWebsite(site.id, {
      name: name.trim() || site.name,
      slug: slug.trim() || site.slug,
    });
    setSavingSettings(false);
    mutate();
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <button
        type="button"
        onClick={() => navigate('/dashboard/websites')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-800"
      >
        <ArrowLeft className="w-4 h-4" />
        My Websites
      </button>

      {/* Header */}
      <div className="mt-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-zinc-900 truncate">{site.name}</h1>
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isLive ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                {isLive ? 'Live' : 'Draft'}
              </span>
            </div>
            <button
              type="button"
              onClick={copyUrl}
              className="mt-1 inline-flex items-center gap-1.5 font-mono text-xs text-blue-600 hover:text-blue-700"
            >
              linkos.app/{site.slug}
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </button>
            <p className="mt-1 text-[11px] text-zinc-500">{tpl?.name || 'Custom'} template</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/dashboard/websites/${site.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 h-9 rounded-xl border border-zinc-300 text-[11px] font-bold text-zinc-700 hover:bg-zinc-50"
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </Link>
            {isLive && (
              <a
                href={`/site/${site.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 h-9 rounded-xl border border-zinc-300 text-[11px] font-bold text-zinc-700 hover:bg-zinc-50"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Visit Website
              </a>
            )}
            <button
              type="button"
              onClick={publish}
              disabled={publishing}
              className={`inline-flex items-center gap-1.5 px-4 h-9 rounded-xl text-[11px] font-bold text-white disabled:opacity-60 ${
                isLive ? 'bg-zinc-900 hover:bg-zinc-800' : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              {publishing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <Globe className="w-3.5 h-3.5" />
              {isLive ? 'Unpublish' : 'Publish'}
            </button>
          </div>
        </div>
      </div>

      {/* Section nav */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSection(s.id)}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3 h-9 rounded-xl text-[11px] font-bold transition-colors ${
              section === s.id ? 'bg-zinc-900 text-white' : 'border border-zinc-300 text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            <s.icon className="w-3.5 h-3.5" />
            {s.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {section === 'overview' && (
        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total Visitors', value: '—' },
            { label: 'Page Views', value: '—' },
            { label: 'WhatsApp Clicks', value: '—' },
            { label: 'Contact Submissions', value: '—' },
          ].map((k) => (
            <div key={k.label} className="rounded-2xl border border-zinc-200 bg-white p-4">
              <p className="text-[11px] font-bold text-zinc-500">{k.label}</p>
              <p className="mt-1 text-xl font-extrabold text-zinc-900">{k.value}</p>
            </div>
          ))}
          <div className="col-span-2 lg:col-span-4 rounded-2xl border border-zinc-200 bg-white p-4">
            <h2 className="text-sm font-bold text-zinc-900">Quick actions</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                to={`/dashboard/websites/${site.id}/edit`}
                className="inline-flex items-center gap-1.5 px-4 h-9 rounded-xl bg-blue-600 text-[11px] font-bold text-white hover:bg-blue-500"
              >
                <FileText className="w-3.5 h-3.5" />
                Edit Content &amp; Design
              </Link>
              <button
                type="button"
                onClick={() => setSection('analytics')}
                className="inline-flex items-center gap-1.5 px-4 h-9 rounded-xl border border-zinc-300 text-[11px] font-bold text-zinc-700 hover:bg-zinc-50"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                View Analytics
              </button>
              <button
                type="button"
                onClick={() => setSection('settings')}
                className="inline-flex items-center gap-1.5 px-4 h-9 rounded-xl border border-zinc-300 text-[11px] font-bold text-zinc-700 hover:bg-zinc-50"
              >
                <Settings className="w-3.5 h-3.5" />
                Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content / Design → editor */}
      {(section === 'content' || section === 'design') && (
        <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6 text-center">
          <p className="text-sm font-bold text-zinc-900">
            {section === 'content' ? 'Edit your website content' : 'Customize appearance'}
          </p>
          <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
            {section === 'content'
              ? 'Business name, hero, about, services, products, gallery, contact and hours.'
              : 'Theme, colors, fonts and button styles — with a live preview.'}
          </p>
          <Link
            to={`/dashboard/websites/${site.id}/edit`}
            className="mt-4 inline-flex items-center gap-2 px-5 h-10 rounded-xl bg-blue-600 text-xs font-bold text-white hover:bg-blue-500"
          >
            <Palette className="w-4 h-4" />
            Open Editor
          </Link>
        </div>
      )}

      {/* Analytics */}
      {section === 'analytics' && <WebsiteAnalytics websiteId={site.id} />}

      {/* SEO */}
      {section === 'seo' && (
        <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4">
          <h2 className="text-sm font-bold text-zinc-900">SEO preview</h2>
          <div className="mt-3 rounded-xl border border-zinc-200 p-3">
            <p className="text-sm text-blue-700 truncate">{site.content?.business_name || site.name} — linkos.app/{site.slug}</p>
            <p className="mt-0.5 text-xs text-emerald-700">https://linkos.app/{site.slug}</p>
            <p className="mt-1 text-xs text-zinc-600">{site.content?.description || site.content?.bio || 'No description set yet.'}</p>
          </div>
          <p className="mt-3 text-[11px] text-zinc-400">
            Title and description come from your business name and description — edit them in the Content editor.
          </p>
        </div>
      )}

      {/* Settings */}
      {section === 'settings' && (
        <div className="mt-4 space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <h2 className="text-sm font-bold text-zinc-900">Website settings</h2>
            <label htmlFor="ws-name" className="mt-3 block text-[11px] font-bold text-zinc-700 uppercase tracking-wide">
              Name
            </label>
            <input
              id="ws-name"
              value={name || site.name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full h-10 rounded-xl border border-zinc-300 px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="ws-slug" className="mt-3 block text-[11px] font-bold text-zinc-700 uppercase tracking-wide">
              URL slug
            </label>
            <div className="mt-1.5 flex items-center h-10 rounded-xl border border-zinc-300 px-3">
              <span className="font-mono text-xs text-zinc-400">linkos.app/</span>
              <input
                id="ws-slug"
                value={slug || site.slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="flex-1 font-mono text-sm text-zinc-900 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={saveSettings}
              disabled={savingSettings}
              className="mt-4 inline-flex items-center gap-2 px-4 h-9 rounded-xl bg-zinc-900 text-[11px] font-bold text-white hover:bg-zinc-800 disabled:opacity-60"
            >
              {savingSettings && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Settings
            </button>
          </div>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <h2 className="text-sm font-bold text-red-700">Danger zone</h2>
            <p className="mt-1 text-[11px] text-red-600">Deleting a website removes its content permanently.</p>
            <button
              type="button"
              onClick={async () => {
                if (window.confirm(`Delete "${site.name}"? This cannot be undone.`)) {
                  await deleteWebsite(site.id);
                  navigate('/dashboard/websites');
                }
              }}
              className="mt-3 inline-flex items-center gap-1.5 px-4 h-9 rounded-xl bg-red-600 text-[11px] font-bold text-white hover:bg-red-500"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Website
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const WebsiteAnalytics: React.FC<{ websiteId: string }> = ({ websiteId }) => {
  const { data } = useSWR(['website-analytics', websiteId], () => StorageService.getAnalyticsSummary(websiteId));
  const cards = [
    { label: 'Total Visitors', value: data?.total_views ?? 0 },
    { label: 'Unique Visitors', value: data?.unique_visitors ?? 0 },
    { label: 'WhatsApp Clicks', value: data?.whatsapp_clicks ?? 0 },
    { label: 'Call Clicks', value: data?.call_clicks ?? 0 },
    { label: 'Product Views', value: data?.product_clicks ?? 0 },
    { label: 'Link Clicks', value: data?.link_clicks ?? 0 },
  ];
  return (
    <div className="mt-4 grid grid-cols-2 lg:grid-cols-3 gap-3">
      {cards.map((k) => (
        <div key={k.label} className="rounded-2xl border border-zinc-200 bg-white p-4">
          <p className="text-[11px] font-bold text-zinc-500">{k.label}</p>
          <p className="mt-1 text-xl font-extrabold text-zinc-900">{k.value}</p>
        </div>
      ))}
    </div>
  );
};
