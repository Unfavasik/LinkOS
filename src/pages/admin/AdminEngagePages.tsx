import React, { useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Inbox,
  Star,
  QrCode,
  Megaphone,
  Download,
  Trash2,
  Send,
  BookOpen,
  Plus,
  X,
  Eye,
  EyeOff,
  Globe,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import {
  PageHeader,
  Badge,
  EmptyState,
  LoadingRows,
  ErrorState,
  PANEL,
  TH,
  TD,
  fmtDate,
  initials,
} from './AdminShared';
import {
  loadAnnouncements,
  addAnnouncement,
  deleteAnnouncement,
  updateAnnouncement,
  type Announcement,
} from '../../lib/announcements';
import {
  loadHelpArticles,
  addHelpArticle,
  deleteHelpArticle,
  slugify,
  HELP_CATEGORIES,
  type HelpArticleEntry,
} from '../../lib/helpArticles';

/* ---------- Inquiries / Leads ---------- */

interface CustomerRow {
  id: string;
  profile_id: string | null;
  name: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  created_at: string;
}

async function fetchCustomers(): Promise<CustomerRow[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('customers')
    .select('id, profile_id, name, phone, email, notes, created_at')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as CustomerRow[];
}

async function fetchBizNames(): Promise<Record<string, string>> {
  if (!isSupabaseConfigured || !supabase) return {};
  const { data, error } = await supabase.from('profiles').select('id, business_name').limit(300);
  if (error) return {};
  return Object.fromEntries((data ?? []).map((p) => [p.id, p.business_name || '—']));
}

export const AdminInquiriesPage: React.FC = () => {
  const { data: customers, error } = useSWR('admin-customers', fetchCustomers, { refreshInterval: 60_000 });
  const { data: bizNames } = useSWR('admin-biz-names', fetchBizNames, { refreshInterval: 60_000 });

  return (
    <div>
      <PageHeader title="Inquiries / Leads" subtitle="Customer inquiries collected from business pages." />

      <div className={`${PANEL} overflow-hidden`}>
        {error ? (
          <ErrorState />
        ) : !customers ? (
          <LoadingRows rows={6} />
        ) : customers.length === 0 ? (
          <EmptyState title="No inquiries yet" sub="Leads captured on business pages will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-white/[0.03] border-b border-white/[0.06]">
                <tr>
                  <th className={TH}>#</th>
                  <th className={TH}>Name</th>
                  <th className={TH}>Contact</th>
                  <th className={TH}>Business</th>
                  <th className={TH}>Notes</th>
                  <th className={TH}>Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {customers.map((c, i) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className={TD}>{i + 1}</td>
                    <td className={TD}>
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-full bg-sky-500/15 text-sky-400 text-[11px] font-bold flex items-center justify-center shrink-0">
                          {initials(c.name)}
                        </span>
                        <span className="font-medium text-white">{c.name || '—'}</span>
                      </div>
                    </td>
                    <td className={TD}>
                      <p>{c.phone || '—'}</p>
                      <p className="text-[11px] text-slate-500">{c.email || ''}</p>
                    </td>
                    <td className={TD}>{(c.profile_id && bizNames?.[c.profile_id]) || '—'}</td>
                    <td className={`${TD} max-w-[220px] truncate`} title={c.notes || ''}>
                      {c.notes || '—'}
                    </td>
                    <td className={TD}>{fmtDate(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------- Reviews & Reports ---------- */

interface ReviewItem {
  business: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

async function fetchReviews(): Promise<ReviewItem[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase.from('profiles').select('business_name, reviews').limit(200);
  if (error) throw error;
  const out: ReviewItem[] = [];
  for (const p of data ?? []) {
    const list = Array.isArray(p.reviews) ? p.reviews : [];
    for (const r of list) {
      if (r && typeof r === 'object') {
        const o = r as Record<string, unknown>;
        out.push({
          business: p.business_name || '—',
          author: String(o.name || o.author || o.customer_name || 'Anonymous'),
          rating: Number(o.rating || o.stars || 0),
          comment: String(o.comment || o.text || o.review || ''),
          date: String(o.date || o.created_at || ''),
        });
      }
    }
  }
  return out;
}

export const AdminReviewsPage: React.FC = () => {
  const { data: reviews, error } = useSWR('admin-reviews', fetchReviews, { refreshInterval: 60_000 });

  const avg = reviews?.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div>
      <PageHeader
        title="Reviews & Reports"
        subtitle={
          reviews?.length
            ? `${reviews.length} reviews · average ${avg.toFixed(1)} / 5`
            : 'Customer reviews across all business pages.'
        }
      />

      {error ? (
        <div className={PANEL}>
          <ErrorState />
        </div>
      ) : !reviews ? (
        <div className={PANEL}>
          <LoadingRows rows={6} />
        </div>
      ) : reviews.length === 0 ? (
        <div className={PANEL}>
          <EmptyState title="No reviews yet" sub="Reviews left on business pages will appear here." />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {reviews.slice(0, 40).map((r, i) => (
            <div key={i} className={`${PANEL} p-4`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                    <Star className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-white truncate">{r.author}</p>
                    <p className="text-[11px] text-slate-500 truncate">{r.business}</p>
                  </div>
                </div>
                <span className="text-[12px] font-bold text-amber-400 shrink-0">
                  {'★'.repeat(Math.max(0, Math.min(5, Math.round(r.rating))))}
                </span>
              </div>
              {r.comment && <p className="mt-2.5 text-[12px] text-slate-400">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ---------- QR Codes ---------- */

interface QrBiz {
  id: string;
  business_name: string | null;
  username: string | null;
  is_published: boolean | null;
}

async function fetchQrBiz(): Promise<QrBiz[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('id, business_name, username, is_published')
    .order('created_at', { ascending: false })
    .limit(60);
  if (error) throw error;
  return (data ?? []) as QrBiz[];
}

export const AdminQrCodesPage: React.FC = () => {
  const { data: bizList, error } = useSWR('admin-qr-biz', fetchQrBiz);

  const download = (username: string, evt: React.MouseEvent) => {
    const canvas = (evt.currentTarget.closest('[data-qr-card]') as HTMLElement | null)?.querySelector('canvas');
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `${username}-qr.png`;
    a.click();
  };

  return (
    <div>
      <PageHeader title="QR Codes" subtitle="Scan-to-open QR codes for every published business page." />

      {error ? (
        <div className={PANEL}>
          <ErrorState />
        </div>
      ) : !bizList ? (
        <div className={PANEL}>
          <LoadingRows rows={4} />
        </div>
      ) : bizList.length === 0 ? (
        <div className={PANEL}>
          <EmptyState title="No pages yet" sub="Create a business page to generate its QR code." />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {bizList.map((b) => {
            const url = b.username ? `${window.location.origin}/${b.username}` : '';
            return (
              <div key={b.id} data-qr-card className={`${PANEL} p-4 flex flex-col items-center text-center`}>
                <div className="flex items-center gap-2 self-stretch mb-3">
                  <span className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
                    <QrCode className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 text-left">
                    <p className="text-[13px] font-semibold text-white truncate">{b.business_name || 'Untitled'}</p>
                    <p className="text-[11px] text-slate-500 truncate">/{b.username || '—'}</p>
                  </div>
                  {b.is_published ? <Badge tone="green">Live</Badge> : <Badge tone="slate">Draft</Badge>}
                </div>
                {b.username ? (
                  <>
                    <div className="p-2.5 bg-white rounded-xl">
                      <QRCodeCanvas value={url} size={128} includeMargin={false} aria-label={`QR code for ${b.business_name}`} />
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => download(b.username!, e)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" aria-hidden="true" />
                        Download PNG
                      </button>
                      <a
                        href={`/${b.username}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-white/[0.05] text-slate-300 hover:bg-white/[0.1] transition-colors"
                      >
                        Open
                      </a>
                    </div>
                  </>
                ) : (
                  <EmptyState title="No username" sub="Set a username to generate a QR." />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ---------- Announcements ---------- */

export const AdminAnnouncementsPage: React.FC = () => {
  const [items, setItems] = useState<Announcement[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [publishNow, setPublishNow] = useState(true);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    setItems(loadAnnouncements());
  }, []);

  const refresh = () => setItems(loadAnnouncements());

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    addAnnouncement({ title, body, published: publishNow });
    setTitle('');
    setBody('');
    setPublishNow(true);
    refresh();
    setSent(true);
    window.setTimeout(() => setSent(false), 2500);
  };

  return (
    <div>
      <PageHeader
        title="Announcements"
        subtitle="Publish platform-wide announcements. Published items appear on the public Announcements page."
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <form onSubmit={submit} className={`${PANEL} p-4 lg:col-span-2 h-fit`} aria-label="New announcement">
          <label htmlFor="ann-title" className="block text-[12px] font-semibold text-slate-300 mb-1.5">
            Title
          </label>
          <input
            id="ann-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. New Pro features are live"
            className="w-full h-10 px-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[13px] text-slate-200 placeholder:text-slate-500 outline-none focus:border-blue-500/50 transition-all"
          />
          <label htmlFor="ann-body" className="block text-[12px] font-semibold text-slate-300 mb-1.5 mt-3.5">
            Message
          </label>
          <textarea
            id="ann-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="Write the announcement..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[13px] text-slate-200 placeholder:text-slate-500 outline-none focus:border-blue-500/50 transition-all resize-none"
          />
          <label htmlFor="ann-publish" className="mt-3.5 flex items-center gap-3 cursor-pointer select-none">
            <input
              id="ann-publish"
              type="checkbox"
              checked={publishNow}
              onChange={(e) => setPublishNow(e.target.checked)}
              className="w-4 h-4 accent-blue-600"
            />
            <span className="text-[12.5px] font-semibold text-slate-300">
              Publish immediately (visible to all users)
            </span>
          </label>
          <button
            type="submit"
            className="mt-3.5 inline-flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-[13px] font-semibold text-white transition-colors"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
            Save Announcement
          </button>
          {sent && (
            <p className="mt-2 text-[12px] text-emerald-400 text-center" role="status">
              Announcement saved{publishNow ? ' and published' : ' as draft'}.
            </p>
          )}
        </form>

        <div className={`${PANEL} overflow-hidden lg:col-span-3`}>
          <div className="px-4 py-3.5 border-b border-white/[0.06] flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-purple-400" aria-hidden="true" />
            <p className="text-[14px] font-semibold text-white">All Announcements</p>
            <a
              href="/announcements"
              target="_blank"
              rel="noreferrer"
              className="ml-auto inline-flex items-center gap-1 text-[11.5px] font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" aria-hidden="true" />
              View public page
            </a>
          </div>
          {items.length === 0 ? (
            <EmptyState title="Nothing saved yet" sub="Announcements you save will be listed here." />
          ) : (
            <ul className="divide-y divide-white/[0.04]">
              {items.map((a) => (
                <li key={a.id} className="px-4 py-3.5 flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[13px] font-semibold text-white">{a.title}</p>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                          a.published ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                        }`}
                      >
                        {a.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[12px] text-slate-400">{a.body}</p>
                    <p className="mt-1 text-[11px] text-slate-500">{fmtDate(a.created_at)}</p>
                  </div>
                  <button
                    type="button"
                    aria-label={a.published ? `Unpublish ${a.title}` : `Publish ${a.title}`}
                    title={a.published ? 'Unpublish' : 'Publish'}
                    onClick={() => {
                      updateAnnouncement(a.id, { published: !a.published });
                      refresh();
                    }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors shrink-0"
                  >
                    {a.published ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${a.title}`}
                    onClick={() => {
                      deleteAnnouncement(a.id);
                      refresh();
                    }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

/* ---------- Help Articles ---------- */

interface StepRow {
  title: string;
  body: string;
}

export const AdminHelpArticlesPage: React.FC = () => {
  const [items, setItems] = useState<HelpArticleEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>(HELP_CATEGORIES[0]);
  const [readTime, setReadTime] = useState('4 min read');
  const [intro, setIntro] = useState('');
  const [learn, setLearn] = useState<string[]>(['']);
  const [steps, setSteps] = useState<StepRow[]>([{ title: '', body: '' }]);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const refresh = () => setItems(loadHelpArticles());

  useEffect(() => {
    refresh();
  }, []);

  const resetForm = () => {
    setTitle('');
    setCategory(HELP_CATEGORIES[0]);
    setReadTime('4 min read');
    setIntro('');
    setLearn(['']);
    setSteps([{ title: '', body: '' }]);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    const cleanIntro = intro.trim();
    const cleanLearn = learn.map((l) => l.trim()).filter(Boolean);
    const cleanSteps = steps
      .map((s) => ({ title: s.title.trim(), body: s.body.trim() }))
      .filter((s) => s.title && s.body);
    if (!cleanTitle || !cleanIntro || cleanSteps.length === 0) {
      setError('Title, intro and at least one complete step are required.');
      return;
    }
    const slug = slugify(cleanTitle);
    const result = addHelpArticle({
      slug,
      category: category as HelpArticleEntry['category'],
      article: {
        slug,
        tag: 'Guide',
        tagColor: 'bg-blue-500',
        readTime: readTime.trim() || '4 min read',
        title: cleanTitle,
        intro: cleanIntro,
        hero: '/images/resources/guide-hero.png',
        heroAlt: cleanTitle,
        learn: cleanLearn.length > 0 ? cleanLearn : cleanSteps.map((s) => s.title),
        steps: cleanSteps,
      },
    });
    if (!result.ok) {
      setError(result.error || 'Could not save the article.');
      return;
    }
    setError('');
    resetForm();
    setOpen(false);
    refresh();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  const inputCls =
    'w-full h-10 px-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[13px] text-slate-200 placeholder:text-slate-500 outline-none focus:border-blue-500/50 transition-all';

  return (
    <div>
      <PageHeader title="Help Articles" subtitle="Guides shown in the public Help Center. Changes go live immediately." />

      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="text-[12.5px] text-slate-400">{items.length} articles published</p>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-[12.5px] font-semibold text-white transition-colors"
        >
          {open ? <X className="w-4 h-4" aria-hidden="true" /> : <Plus className="w-4 h-4" aria-hidden="true" />}
          {open ? 'Cancel' : 'New Article'}
        </button>
      </div>

      {open && (
        <form onSubmit={submit} className={`${PANEL} p-4 mb-4 space-y-3.5`} aria-label="New help article">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="sm:col-span-2">
              <label htmlFor="ha-title" className="block text-[12px] font-semibold text-slate-300 mb-1.5">
                Title
              </label>
              <input id="ha-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="How to ..." className={inputCls} />
            </div>
            <div>
              <label htmlFor="ha-cat" className="block text-[12px] font-semibold text-slate-300 mb-1.5">
                Category
              </label>
              <select id="ha-cat" value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
                {HELP_CATEGORIES.map((c) => (
                  <option key={c} value={c} className="text-slate-900">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="ha-intro" className="block text-[12px] font-semibold text-slate-300 mb-1.5">
              Intro
            </label>
            <textarea
              id="ha-intro"
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              rows={2}
              placeholder="One or two sentences describing the guide..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[13px] text-slate-200 placeholder:text-slate-500 outline-none focus:border-blue-500/50 transition-all resize-none"
            />
          </div>
          <div>
            <label htmlFor="ha-read" className="block text-[12px] font-semibold text-slate-300 mb-1.5">
              Read time
            </label>
            <input id="ha-read" value={readTime} onChange={(e) => setReadTime(e.target.value)} placeholder="4 min read" className={inputCls} />
          </div>
          <div>
            <p className="text-[12px] font-semibold text-slate-300 mb-1.5">Steps</p>
            <div className="space-y-2.5">
              {steps.map((s, i) => (
                <div key={i} className="flex gap-2.5 items-start">
                  <div className="flex-1 space-y-2">
                    <input
                      value={s.title}
                      onChange={(e) => setSteps(steps.map((x, xi) => (xi === i ? { ...x, title: e.target.value } : x)))}
                      placeholder={`Step ${i + 1} title`}
                      aria-label={`Step ${i + 1} title`}
                      className={inputCls}
                    />
                    <textarea
                      value={s.body}
                      onChange={(e) => setSteps(steps.map((x, xi) => (xi === i ? { ...x, body: e.target.value } : x)))}
                      placeholder={`Step ${i + 1} instructions`}
                      aria-label={`Step ${i + 1} instructions`}
                      rows={2}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[13px] text-slate-200 placeholder:text-slate-500 outline-none focus:border-blue-500/50 transition-all resize-none"
                    />
                  </div>
                  {steps.length > 1 && (
                    <button
                      type="button"
                      aria-label={`Remove step ${i + 1}`}
                      onClick={() => setSteps(steps.filter((_, xi) => xi !== i))}
                      className="mt-1.5 w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setSteps([...steps, { title: '', body: '' }])}
              className="mt-2.5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              Add step
            </button>
          </div>
          {error && (
            <p className="text-[12px] text-red-400" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-[13px] font-semibold text-white transition-colors"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
            Publish Article
          </button>
          {saved && (
            <p className="text-[12px] text-emerald-400" role="status">
              Article published to the Help Center.
            </p>
          )}
        </form>
      )}

      <div className={`${PANEL} overflow-hidden`}>
        <div className="px-4 py-3.5 border-b border-white/[0.06] flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-400" aria-hidden="true" />
          <p className="text-[14px] font-semibold text-white">Published Articles</p>
        </div>
        {items.length === 0 ? (
          <EmptyState title="No articles" sub="Create the first Help Center guide." />
        ) : (
          <ul className="divide-y divide-white/[0.04]">
            {items.map((a) => (
              <li key={a.slug} className="px-4 py-3.5 flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] font-semibold text-white">{a.article.title}</p>
                    <span className="px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 text-[10px] font-bold uppercase tracking-wide">
                      {a.category}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12px] text-slate-400 line-clamp-1">{a.article.intro}</p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    /help/{a.slug} · {a.article.readTime} · {a.article.steps.length} steps
                  </p>
                </div>
                <a
                  href={`/help/${a.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Preview ${a.article.title}`}
                  title="Preview"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors shrink-0"
                >
                  <Globe className="w-4 h-4" aria-hidden="true" />
                </a>
                <button
                  type="button"
                  aria-label={`Delete ${a.article.title}`}
                  onClick={() => {
                    deleteHelpArticle(a.slug);
                    refresh();
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
