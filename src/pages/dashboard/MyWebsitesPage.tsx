import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, Plus, Eye, ExternalLink, MoreHorizontal, LayoutTemplate, RefreshCw, Trash2, Pencil } from 'lucide-react';
import useSWR from 'swr';
import { fetchMyWebsites, deleteWebsite, setWebsiteStatus, summarize, type WebsiteSummary } from '../../lib/websites';

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const WebsiteCard: React.FC<{ site: WebsiteSummary; onChanged: () => void }> = ({ site, onChanged }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="group relative rounded-2xl border border-zinc-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <Link to={`/dashboard/websites/${site.id}`} className="block">
        <div className="relative h-36 overflow-hidden bg-zinc-100">
          <img src={site.cover} alt={`${site.name} preview`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <span
            className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
              site.status === 'live' ? 'bg-emerald-500/95 text-white' : 'bg-amber-400/95 text-amber-950'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${site.status === 'live' ? 'bg-white' : 'bg-amber-900'}`} />
            {site.status === 'live' ? 'Live' : 'Draft'}
          </span>
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link to={`/dashboard/websites/${site.id}`} className="block truncate text-sm font-bold text-zinc-900 hover:text-blue-600">
              {site.name}
            </Link>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-zinc-500 truncate">
              <LayoutTemplate className="w-3 h-3 shrink-0" aria-hidden="true" />
              {site.template_name}
            </p>
            <p className="mt-1 font-mono text-[11px] text-blue-600 truncate">linkos.app/{site.slug}</p>
          </div>
          <div className="relative shrink-0">
            <button
              type="button"
              aria-label="More actions"
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-9 z-10 w-44 rounded-xl border border-zinc-200 bg-white shadow-lg py-1 text-[12px] font-medium text-zinc-700">
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left hover:bg-zinc-50 flex items-center gap-2"
                  onClick={async () => {
                    setMenuOpen(false);
                    await setWebsiteStatus(site.id, site.status === 'live' ? 'draft' : 'live');
                    onChanged();
                  }}
                >
                  <Globe className="w-3.5 h-3.5" />
                  {site.status === 'live' ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left hover:bg-zinc-50 flex items-center gap-2"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate(`/dashboard/websites/${site.id}/edit`);
                  }}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit website
                </button>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left hover:bg-zinc-50 flex items-center gap-2 text-red-600"
                  onClick={async () => {
                    setMenuOpen(false);
                    if (window.confirm(`Delete "${site.name}"? This cannot be undone.`)) {
                      await deleteWebsite(site.id);
                      onChanged();
                    }
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="mt-2 text-[11px] text-zinc-400">Updated {timeAgo(site.updated_at)}</p>

        <div className="mt-3 flex items-center gap-2">
          <Link
            to={`/dashboard/websites/${site.id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 rounded-lg bg-zinc-900 text-[11px] font-bold text-white hover:bg-zinc-800 transition-colors"
          >
            Manage
          </Link>
          <Link
            to={`/dashboard/websites/${site.id}/edit`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 rounded-lg border border-zinc-300 text-[11px] font-bold text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </Link>
          {site.status === 'live' && (
            <a
              href={`/site/${site.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg border border-zinc-300 text-[11px] font-bold text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Visit
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export const MyWebsitesPage: React.FC = () => {
  const { data: sites, isLoading, mutate } = useSWR('my-websites', fetchMyWebsites, { fallbackData: [] });
  const list = (sites ?? []).map(summarize);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-zinc-900">My Websites</h1>
          <p className="mt-1 text-xs text-zinc-500">All websites you have created from LinkOS templates.</p>
        </div>
        <button
          type="button"
          onClick={() => mutate()}
          className="p-2 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50"
          aria-label="Refresh websites"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-zinc-200 bg-white h-64 animate-pulse" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-zinc-300 bg-white py-16 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400">
            <Globe className="w-7 h-7" />
          </div>
          <h2 className="mt-4 text-base font-bold text-zinc-900">Your websites will appear here</h2>
          <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
            Create your first website using one of our ready-made templates.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <Link
              to="/dashboard/websites/new"
              className="inline-flex items-center gap-2 px-5 h-10 rounded-xl bg-blue-600 text-xs font-bold text-white hover:bg-blue-500 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Website
            </Link>
            <Link
              to="/dashboard/templates"
              className="inline-flex items-center gap-2 px-5 h-10 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Browse Templates
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((site) => (
            <WebsiteCard key={site.id} site={site} onChanged={() => mutate()} />
          ))}
          <Link
            to="/dashboard/websites/new"
            className="flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-zinc-300 bg-white text-zinc-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            <span className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </span>
            <span className="text-sm font-bold">Create New Website</span>
            <span className="text-[11px] text-zinc-400">Pick a template and make it yours</span>
          </Link>
        </div>
      )}
    </div>
  );
};
