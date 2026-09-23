import React, { useState } from 'react';
import useSWR from 'swr';
import { MessageSquareHeart, Send, ChevronLeft, Star, User } from 'lucide-react';
import { PageHeader, Badge, EmptyState, LoadingRows, ErrorState, PANEL, fmtDate } from './AdminShared';
import {
  fetchAllFeedback,
  replyToFeedback,
  setFeedbackStatus,
  type FeedbackItem,
  type FeedbackStatus,
} from '../../lib/feedback';

/**
 * Feedback queue — user feedback from the Send Feedback page. Owner, admin
 * and support can review, reply (admin_response) and move items through
 * new / reviewed / planned / resolved / archived.
 */

const STATUS_TONE: Record<FeedbackStatus, 'blue' | 'amber' | 'purple' | 'green' | 'slate'> = {
  new: 'blue',
  reviewed: 'amber',
  planned: 'purple',
  resolved: 'green',
  archived: 'slate',
};

const TYPE_LABEL: Record<string, string> = {
  general: 'General',
  bug: 'Bug',
  feature_request: 'Feature',
  testimonial: 'Testimonial',
  complaint: 'Complaint',
};

const NEXT_STATUSES: FeedbackStatus[] = ['new', 'reviewed', 'planned', 'resolved', 'archived'];

async function fetchFeedback(): Promise<FeedbackItem[]> {
  return fetchAllFeedback();
}

export const AdminFeedbackPage: React.FC = () => {
  const { data: items, error, mutate } = useSWR('admin-feedback', fetchFeedback, {
    refreshInterval: 30_000,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const selected = items?.find((f) => f.id === selectedId) ?? null;
  const newCount = items?.filter((f) => f.status === 'new').length ?? 0;

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !reply.trim()) return;
    setSending(true);
    try {
      await replyToFeedback(selected.id, reply.trim());
      setReply('');
      await mutate();
    } finally {
      setSending(false);
    }
  };

  const changeStatus = async (status: FeedbackStatus) => {
    if (!selected) return;
    await setFeedbackStatus(selected.id, status);
    await mutate();
  };

  /* ----- Detail view ----- */
  if (selected) {
    return (
      <div className="max-w-3xl">
        <button
          type="button"
          onClick={() => {
            setSelectedId(null);
            setReply('');
          }}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          Back to all feedback
        </button>

        <div className={`${PANEL} p-5`}>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
              <MessageSquareHeart className="w-5 h-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold text-white capitalize">
                {TYPE_LABEL[selected.feedback_type] || selected.feedback_type} feedback
              </p>
              <p className="text-[11.5px] text-slate-500">{fmtDate(selected.created_at)}</p>
            </div>
            <Badge tone={STATUS_TONE[selected.status]}>{selected.status}</Badge>
          </div>

          {selected.rating != null && (
            <div className="mt-3 flex items-center gap-1" aria-label={`Rated ${selected.rating} of 5`}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={`w-4 h-4 ${n <= (selected.rating ?? 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
                  aria-hidden="true"
                />
              ))}
              <span className="ml-1.5 text-[12px] text-slate-500">{selected.rating}/5</span>
            </div>
          )}

          <div className="mt-4 rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
            <div className="flex items-center gap-2 text-[12px] text-slate-400">
              <User className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="font-semibold text-slate-200">{selected.name}</span>
              <span>· {selected.email}</span>
              {selected.page_url && <span className="ml-auto text-slate-500">{selected.page_url}</span>}
            </div>
            <p className="mt-2.5 text-[13px] leading-relaxed text-slate-300 whitespace-pre-wrap">
              {selected.message}
            </p>
          </div>

          {selected.admin_response && (
            <div className="mt-4 rounded-xl bg-blue-500/[0.06] border border-blue-400/20 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-300">Team response</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-slate-200 whitespace-pre-wrap">
                {selected.admin_response}
              </p>
            </div>
          )}

          {/* Status controls */}
          <div className="mt-5">
            <p className="text-[12px] font-semibold text-slate-300 mb-2">Status</p>
            <div className="flex flex-wrap gap-2">
              {NEXT_STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={selected.status === s}
                  onClick={() => changeStatus(s)}
                  className={`h-9 px-3.5 rounded-lg text-[12px] font-semibold capitalize transition-colors ${
                    selected.status === s
                      ? 'bg-blue-600 text-white'
                      : 'border border-white/10 text-slate-300 hover:bg-white/[0.05]'
                  }`}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Reply form */}
          <form onSubmit={sendReply} className="mt-5">
            <label htmlFor="feedback-reply" className="block text-[12px] font-semibold text-slate-300 mb-1.5">
              Team response
            </label>
            <textarea
              id="feedback-reply"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={3}
              placeholder="Write an internal response to this feedback..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[13px] text-slate-200 placeholder:text-slate-500 outline-none focus:border-blue-500/50 transition-all resize-none"
            />
            <button
              type="submit"
              disabled={sending || !reply.trim()}
              className="mt-3 inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-[13px] font-semibold text-white transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
              {sending ? 'Saving...' : 'Save Response'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ----- List view ----- */
  return (
    <div>
      <PageHeader
        title="Feedback"
        subtitle={
          items?.length
            ? `${items.length} submissions · ${newCount} new — user feedback from the Send Feedback page.`
            : 'User feedback from the Send Feedback page.'
        }
      />

      <div className={`${PANEL} overflow-hidden`}>
        {error ? (
          <ErrorState />
        ) : !items ? (
          <LoadingRows rows={6} />
        ) : items.length === 0 ? (
          <EmptyState title="No feedback yet" sub="User feedback from the Send Feedback page will appear here." />
        ) : (
          <ul className="divide-y divide-white/[0.04]">
            {items.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(f.id)}
                  className="w-full text-left px-4 py-3.5 flex items-center gap-3.5 hover:bg-white/[0.02] transition-colors"
                >
                  <span className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
                    <MessageSquareHeart className="w-4.5 h-4.5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-semibold text-white truncate">
                      {TYPE_LABEL[f.feedback_type] || f.feedback_type}
                      {f.rating != null && (
                        <span className="ml-2 text-[11px] font-medium text-amber-400">{f.rating}/5</span>
                      )}
                    </p>
                    <p className="text-[11.5px] text-slate-500 truncate">
                      {f.name} · {f.message} · {fmtDate(f.created_at)}
                    </p>
                  </div>
                  <Badge tone={STATUS_TONE[f.status]}>{f.status}</Badge>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
