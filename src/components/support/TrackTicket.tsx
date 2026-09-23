import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronRight,
  CircleDot,
  FileText,
  Headset,
  LifeBuoy,
  MessageCircle,
  Paperclip,
  Send,
  Tag,
  Ticket,
  UserRound,
  X,
} from 'lucide-react';
import { replyToTicket, type SupportTicket, type TicketAttachment } from '../../lib/supportTickets';
import { StorageService } from '../../lib/storage';
import { SupportSidebar } from './SupportSidebar';
import { AttachmentModal, formatSize } from './AttachmentModal';
import { ReplyAttachments, splitMessageAttachments, type RenderAttachment } from './ReplyAttachments';

/** Images up to this size are inlined as data URLs so they render as previews. */
const INLINE_IMAGE_LIMIT = 2 * 1024 * 1024;

const fileToAttachment = (f: File): Promise<TicketAttachment> =>
  new Promise((resolve) => {
    const base = { name: f.name, size: f.size, type: f.type };
    if (!f.type.startsWith('image/') || f.size > INLINE_IMAGE_LIMIT) {
      resolve(base);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve({ ...base, dataUrl: String(reader.result) });
    reader.onerror = () => resolve(base);
    reader.readAsDataURL(f);
  });

interface ThreadMsg {
  key: string;
  by: string;
  role: 'user' | 'support';
  text: string;
  attachments: RenderAttachment[];
  at: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  general: 'General Question',
  account: 'Account & Settings',
  billing: 'Billing & Payments',
  technical: 'Technical Issue',
  bug: 'Bug Report',
  feature_request: 'Feature Request',
};

const PRIORITY_LABELS: Record<string, { label: string; cls: string }> = {
  low: { label: 'Low', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  normal: { label: 'Medium', cls: 'bg-amber-50 text-amber-600 border-amber-200' },
  high: { label: 'High', cls: 'bg-orange-50 text-orange-600 border-orange-200' },
  urgent: { label: 'Urgent', cls: 'bg-red-50 text-red-600 border-red-200' },
};

const STATUS_STEPS = [
  { label: 'Open', desc: 'Your request has been received.' },
  { label: 'In Progress', desc: "We're working on your request." },
  { label: 'Awaiting Your Response', desc: 'We may need more information.' },
  { label: 'Resolved', desc: 'Your issue will be marked as resolved once confirmed.' },
];

const STATUS_INDEX: Record<string, number> = {
  open: 0,
  in_progress: 1,
  waiting_for_user: 2,
  resolved: 3,
  closed: 3,
};

const RELATED_ARTICLES = [
  { title: 'How to edit a template?', desc: 'Step-by-step guide' },
  { title: 'Changes not showing on live site?', desc: 'Common reasons and fixes' },
  { title: 'How cache works?', desc: 'Learn about browser cache' },
  { title: 'Using custom images', desc: 'Best practices for images' },
];

const TABS = ['Conversation', 'Details', 'Activity Log', 'Related Articles'] as const;
type Tab = (typeof TABS)[number];

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

/**
 * "Track My Ticket" view — ticket summary, conversation thread with reply
 * box, status timeline and related articles, matching the support-center
 * design language.
 */
export const TrackTicket: React.FC<{ ticket: SupportTicket | null; onBack: () => void }> = ({ ticket, onBack }) => {
  const [localTicket, setLocalTicket] = useState<SupportTicket | null>(ticket);
  const [activeTab, setActiveTab] = useState<Tab>('Conversation');
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachOpen, setAttachOpen] = useState(false);

  // Keep in sync when a freshly submitted ticket arrives from the page.
  React.useEffect(() => setLocalTicket(ticket), [ticket]);

  const thread = useMemo<ThreadMsg[]>(() => {
    if (!localTicket) return [];
    const mk = (
      key: string,
      by: string,
      role: 'user' | 'support',
      message: string,
      at: string,
      structured?: TicketAttachment[],
    ): ThreadMsg => {
      const { text, attachments } = splitMessageAttachments(message, structured);
      return { key, by, role, text, attachments, at };
    };
    return [
      mk('msg-0', 'You', 'user', localTicket.message, localTicket.created_at),
      ...localTicket.replies.map((r, i) =>
        mk(
          `r-${i}`,
          r.by_role === 'user' ? 'You' : 'Support Team',
          r.by_role === 'user' ? 'user' : 'support',
          r.message,
          r.created_at,
          r.attachments,
        ),
      ),
    ];
  }, [localTicket]);

  if (!localTicket) {
    return (
      <div className="grid md:grid-cols-[215px_minmax(0,1fr)] gap-6">
        <SupportSidebar variant="track" />
        <section className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-sm">
          <span className="mx-auto flex w-14 h-14 rounded-2xl bg-blue-50 items-center justify-center">
            <Ticket className="w-7 h-7 text-blue-600" aria-hidden="true" />
          </span>
          <h1 className="mt-4 font-display text-[20px] font-bold text-slate-900">No ticket to track yet</h1>
          <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-slate-500">
            Submit a support request first and you&apos;ll be able to track it here, or open one of your previous
            tickets.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 transition text-[13px] font-bold text-white"
            >
              Contact Support
            </button>
            <Link
              to="/help/tickets"
              className="h-11 px-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition inline-flex items-center text-[13px] font-bold text-slate-700"
            >
              My Tickets
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const t = localTicket;
  const statusIdx = STATUS_INDEX[t.status] ?? 0;
  const priority = PRIORITY_LABELS[t.priority] || PRIORITY_LABELS.normal;

  const sendReply = async () => {
    const text = reply.trim();
    if ((!text && attachments.length === 0) || sending) return;
    setSending(true);
    try {
      const user = StorageService.getActiveUser();
      const payload = await Promise.all(attachments.map(fileToAttachment));
      const updated = await replyToTicket(t.ticket_id, {
        by: user?.business_name || 'You',
        by_role: 'user',
        message: text,
        attachments: payload,
      });
      setLocalTicket(
        updated || {
          ...t,
          replies: [
            ...t.replies,
            {
              by: user?.business_name || 'You',
              by_role: 'user',
              message: text,
              attachments: payload,
              created_at: new Date().toISOString(),
            },
          ],
          updated_at: new Date().toISOString(),
        },
      );
      setReply('');
      setAttachments([]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid md:grid-cols-[215px_minmax(0,1fr)] lg:grid-cols-[215px_minmax(0,1fr)_300px] gap-6 items-start">
      <SupportSidebar variant="track" />

      {/* Main column */}
      <div className="min-w-0">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[12px] text-slate-500">
          <button type="button" onClick={onBack} className="hover:text-blue-600 transition-colors">
            Support
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          <Link to="/help/tickets" className="hover:text-blue-600 transition-colors">
            My Tickets
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          <span className="text-slate-700 font-medium">{t.ticket_id}</span>
        </nav>

        {/* Header */}
        <div className="mt-2 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-[24px] font-bold text-slate-900">Track My Ticket</h1>
            <p className="mt-1 text-[12.5px] text-slate-500">
              View updates, respond to messages, and track the status of your support request.
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[12.5px] font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back to Support
          </button>
        </div>

        {/* Ticket summary card */}
        <section className="mt-4 rounded-2xl border border-slate-200/80 bg-white shadow-sm" aria-label="Ticket summary">
          <div className="flex items-start gap-3.5 p-5">
            <span className="flex w-12 h-12 rounded-xl bg-blue-50 items-center justify-center shrink-0">
              <FileText className="w-5.5 h-5.5 text-blue-600" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11.5px] text-slate-500">Ticket ID</p>
              <p className="text-[16px] font-bold text-slate-900 break-all">{t.ticket_id}</p>
              <p className="mt-0.5 text-[12px] text-slate-500 truncate">{t.subject}</p>
            </div>
            <div className="sm:text-right shrink-0">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11.5px] font-bold text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                Open
              </span>
              <p className="mt-1.5 text-[11px] text-slate-400">Created on</p>
              <p className="text-[12px] font-semibold text-slate-600">{fmt(t.created_at)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-100 p-5">
            <div>
              <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Tag className="w-3.5 h-3.5" aria-hidden="true" /> Category
              </p>
              <p className="mt-1 text-[12.5px] font-bold text-slate-800">{CATEGORY_LABELS[t.category] || t.category}</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <CircleDot className="w-3.5 h-3.5" aria-hidden="true" /> Priority
              </p>
              <span className={`mt-1 inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${priority.cls}`}>
                {priority.label}
              </span>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Calendar className="w-3.5 h-3.5" aria-hidden="true" /> Last Updated
              </p>
              <p className="mt-1 text-[12.5px] font-bold text-slate-800">{fmt(t.updated_at)}</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <UserRound className="w-3.5 h-3.5" aria-hidden="true" /> Assigned To
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-[12.5px] font-bold text-slate-800">
                <span className="flex w-5 h-5 rounded-full bg-[#0B1526] items-center justify-center">
                  <Headset className="w-3 h-3 text-white" aria-hidden="true" />
                </span>
                Support Team
              </p>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-0.5" role="tablist" aria-label="Ticket sections">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-[12.5px] font-bold border transition-colors ${
                activeTab === tab
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'Conversation' && (
          <section className="mt-4 space-y-3.5" aria-label="Conversation">
            {thread.map((m) => (
              <article
                key={m.key}
                className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
                aria-label={`Message from ${m.by}`}
              >
                <div className="flex items-start gap-3">
                  {m.role === 'support' ? (
                    <span className="flex w-10 h-10 rounded-full bg-[#0B1526] items-center justify-center shrink-0">
                      <Headset className="w-5 h-5 text-white" aria-hidden="true" />
                    </span>
                  ) : (
                    <span className="flex w-10 h-10 rounded-full bg-blue-100 items-center justify-center shrink-0 text-[13px] font-bold text-blue-700">
                      {(m.by || 'Y').charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[13px] font-bold text-slate-900">{m.by}</p>
                      <p className="text-[11px] text-slate-400">{fmt(m.at)}</p>
                    </div>
                    {m.text && (
                      <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-600 whitespace-pre-wrap">{m.text}</p>
                    )}
                    <ReplyAttachments attachments={m.attachments} />
                  </div>
                </div>
              </article>
            ))}

            {/* Reply box */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm">
              {attachments.length > 0 && (
                <ul className="mb-3 flex flex-wrap gap-2" aria-label="Attached files">
                  {attachments.map((a, i) => (
                    <li
                      key={`${a.name}:${a.size}:${i}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 pl-2.5 pr-1.5 py-1.5"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                      <span className="max-w-[180px] truncate text-[12px] font-semibold text-slate-700">{a.name}</span>
                      <span className="text-[11px] text-slate-400 shrink-0">{formatSize(a.size)}</span>
                      <button
                        type="button"
                        aria-label={`Remove ${a.name}`}
                        onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                        className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors shrink-0"
                      >
                        <X className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  aria-label="Attach a file"
                  aria-haspopup="dialog"
                  onClick={() => setAttachOpen(true)}
                  className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-colors shrink-0"
                >
                  <Paperclip className="w-4.5 h-4.5" aria-hidden="true" />
                </button>
                <label htmlFor="ticket-reply" className="sr-only">
                  Type your reply
                </label>
                <input
                  id="ticket-reply"
                  type="text"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) sendReply();
                  }}
                  placeholder="Type your reply..."
                  className="min-w-0 flex-1 h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <button
                  type="button"
                  onClick={sendReply}
                  disabled={sending || (reply.trim() === '' && attachments.length === 0)}
                  className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 transition inline-flex items-center gap-1.5 text-[12.5px] font-bold text-white disabled:opacity-60 shrink-0"
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                  Send Reply
                </button>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'Details' && (
          <section className="mt-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm" aria-label="Ticket details">
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
              {[
                ['Ticket ID', t.ticket_id],
                ['Subject', t.subject],
                ['Category', CATEGORY_LABELS[t.category] || t.category],
                ['Priority', priority.label],
                ['Your Email', t.email],
                ['Your Name', t.name],
                ['Created', fmt(t.created_at)],
                ['Last Updated', fmt(t.updated_at)],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[11px] text-slate-400">{k}</dt>
                  <dd className="mt-0.5 text-[13px] font-semibold text-slate-800 break-words">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {activeTab === 'Activity Log' && (
          <section className="mt-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm" aria-label="Activity log">
            <ol className="relative border-l-2 border-slate-100 ml-2 space-y-5">
              <li className="pl-5">
                <span className="absolute -left-[7px] w-3 h-3 rounded-full bg-blue-600 border-2 border-white" aria-hidden="true" />
                <p className="text-[12.5px] font-bold text-slate-800">Ticket created</p>
                <p className="text-[11px] text-slate-400">{fmt(t.created_at)}</p>
              </li>
              {t.replies.map((r, i) => (
                <li key={i} className="pl-5">
                  <span className="absolute -left-[7px] w-3 h-3 rounded-full bg-slate-300 border-2 border-white" aria-hidden="true" />
                  <p className="text-[12.5px] font-bold text-slate-800">
                    {r.by_role === 'user' ? 'You replied' : `${r.by} replied`}
                  </p>
                  <p className="text-[11px] text-slate-400">{fmt(r.created_at)}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {activeTab === 'Related Articles' && (
          <section className="mt-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm" aria-label="Related articles">
            <ul className="divide-y divide-slate-100">
              {RELATED_ARTICLES.map((a) => (
                <li key={a.title}>
                  <Link to="/help" className="group flex items-center gap-3 py-3">
                    <span className="flex w-9 h-9 rounded-lg bg-slate-100 items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-slate-500" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12.5px] font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {a.title}
                      </span>
                      <span className="block text-[11px] text-slate-500">{a.desc}</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Right rail */}
      <aside className="space-y-5 min-w-0">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm" aria-label="Ticket status">
          <h2 className="text-[15px] font-bold text-slate-900">Ticket Status</h2>
          <ol className="mt-4 space-y-5">
            {STATUS_STEPS.map((step, i) => {
              const done = i < statusIdx;
              const current = i === statusIdx;
              return (
                <li key={step.label} className="relative flex gap-3">
                  {i < STATUS_STEPS.length - 1 && (
                    <span
                      className={`absolute left-[11px] top-6 bottom-[-20px] w-0.5 ${done ? 'bg-blue-500' : 'bg-slate-200'}`}
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={`relative flex w-6 h-6 rounded-full items-center justify-center shrink-0 border-2 ${
                      current
                        ? 'border-blue-600 bg-white'
                        : done
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {done && <span className="w-2 h-2 rounded-full bg-white" aria-hidden="true" />}
                    {current && <span className="w-2.5 h-2.5 rounded-full bg-blue-600" aria-hidden="true" />}
                  </span>
                  <div className="min-w-0">
                    <p className={`text-[13px] font-bold ${current ? 'text-blue-600' : done ? 'text-slate-800' : 'text-slate-400'}`}>
                      {step.label}
                    </p>
                    {current && <p className="text-[11px] text-slate-400">{fmt(t.updated_at)}</p>}
                    <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">{step.desc}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm" aria-label="Need more help">
          <span className="flex w-10 h-10 rounded-xl bg-blue-600 items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" aria-hidden="true" />
          </span>
          <p className="mt-3 text-[14px] font-bold text-slate-900">Need more help?</p>
          <p className="mt-1 text-[11.5px] leading-relaxed text-slate-500">Chat with our team for faster support.</p>
          <button
            type="button"
            className="mt-3.5 w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2.5 text-[12px] font-bold text-blue-600 hover:bg-blue-50 transition-colors"
          >
            Start Live Chat
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm" aria-label="Related articles">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[15px] font-bold text-slate-900">Related Articles</h2>
            <Link to="/help" className="inline-flex items-center gap-1 text-[11.5px] font-bold text-blue-600 hover:text-blue-500">
              View All
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-slate-100">
            {RELATED_ARTICLES.map((a) => (
              <li key={a.title}>
                <Link to="/help" className="group flex items-center gap-3 py-3">
                  <span className="flex w-8 h-8 rounded-lg bg-slate-100 items-center justify-center shrink-0">
                    <LifeBuoy className="w-4 h-4 text-slate-500" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {a.title}
                    </span>
                    <span className="block text-[10.5px] text-slate-500">{a.desc}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </aside>

      <AttachmentModal
        open={attachOpen}
        initialFiles={attachments}
        onDone={setAttachments}
        onClose={() => setAttachOpen(false)}
      />
    </div>
  );
};
