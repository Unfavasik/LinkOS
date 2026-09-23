import React, { useState } from 'react';
import useSWR from 'swr';
import { LifeBuoy, Send, ChevronLeft, CheckCheck, User } from 'lucide-react';
import { PageHeader, Badge, EmptyState, LoadingRows, ErrorState, PANEL, fmtDate } from './AdminShared';
import {
  fetchAllTickets,
  replyToTicket,
  setTicketStatus,
  type SupportTicket,
  type TicketStatus,
} from '../../lib/supportTickets';
import { getCachedAdmin } from '../../lib/adminAuth';
import { ReplyAttachments, splitMessageAttachments } from '../../components/support/ReplyAttachments';

/**
 * Support ticket queue — visible to owner, admin and support roles. Anyone
 * with access can read user tickets and reply; replies are visible to the
 * user on their My Tickets page.
 */

const STATUS_TONE: Record<TicketStatus, 'green' | 'blue' | 'amber' | 'purple' | 'slate'> = {
  open: 'blue',
  in_progress: 'amber',
  waiting_for_user: 'purple',
  resolved: 'green',
  closed: 'slate',
};

const PRIORITY_TONE: Record<string, 'red' | 'amber' | 'blue' | 'slate'> = {
  urgent: 'red',
  high: 'amber',
  normal: 'blue',
  low: 'slate',
};

const SETTABLE_STATUSES: TicketStatus[] = ['open', 'in_progress', 'waiting_for_user', 'resolved', 'closed'];

async function fetchTickets(): Promise<SupportTicket[]> {
  return fetchAllTickets();
}

export const AdminSupportTicketsPage: React.FC = () => {
  const { data: tickets, error, mutate } = useSWR('admin-support-tickets', fetchTickets, {
    refreshInterval: 30_000,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const selected = tickets?.find((t) => t.ticket_id === selectedId) ?? null;
  const openCount = tickets?.filter((t) => t.status === 'open').length ?? 0;

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !reply.trim()) return;
    const admin = getCachedAdmin();
    setSending(true);
    try {
      await replyToTicket(selected.ticket_id, {
        by: admin?.display_name || admin?.email || 'Support team',
        by_role: admin?.role || 'support',
        message: reply.trim(),
      });
      setReply('');
      await mutate();
    } finally {
      setSending(false);
    }
  };

  const closeTicket = async () => {
    if (!selected) return;
    await setTicketStatus(selected.ticket_id, 'resolved');
    await mutate();
  };

  const changeStatus = async (status: TicketStatus) => {
    if (!selected) return;
    await setTicketStatus(selected.ticket_id, status);
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
          Back to all tickets
        </button>

        <div className={`${PANEL} p-5`}>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
              <LifeBuoy className="w-5 h-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold text-white">{selected.subject}</p>
              <p className="text-[11.5px] text-slate-500">
                {selected.ticket_id} · {selected.category}
              </p>
            </div>
            <Badge tone={PRIORITY_TONE[selected.priority] || 'slate'}>{selected.priority}</Badge>
            <Badge tone={STATUS_TONE[selected.status]}>{selected.status}</Badge>
          </div>

          {/* Status controls */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-semibold text-slate-300">Set status:</span>
            {SETTABLE_STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={selected.status === s}
                onClick={() => changeStatus(s)}
                className={`h-8 px-3 rounded-lg text-[11.5px] font-semibold transition-colors ${
                  selected.status === s
                    ? 'bg-blue-600 text-white'
                    : 'border border-white/10 text-slate-300 hover:bg-white/[0.05]'
                }`}
              >
                {s.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
            <div className="flex items-center gap-2 text-[12px] text-slate-400">
              <User className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="font-semibold text-slate-200">{selected.name}</span>
              <span>· {selected.email}</span>
              <span className="ml-auto">{fmtDate(selected.created_at)}</span>
            </div>
            <p className="mt-2.5 text-[13px] leading-relaxed text-slate-300 whitespace-pre-wrap">
              {selected.message}
            </p>
          </div>

          {/* Conversation */}
          {selected.replies.length > 0 && (
            <div className="mt-4 space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Replies ({selected.replies.length})
              </p>
              {selected.replies.map((r, i) => {
                const { text, attachments } = splitMessageAttachments(r.message, r.attachments);
                return (
                  <div key={i} className="rounded-xl bg-blue-500/[0.06] border border-blue-400/20 p-4">
                    <div className="flex items-center gap-2 text-[12px]">
                      <span className="font-semibold text-blue-300">{r.by}</span>
                      <span className="text-slate-500 capitalize">({r.by_role})</span>
                      <span className="ml-auto text-slate-500">{fmtDate(r.created_at)}</span>
                    </div>
                    {text && (
                      <p className="mt-2 text-[13px] leading-relaxed text-slate-200 whitespace-pre-wrap">{text}</p>
                    )}
                    <ReplyAttachments attachments={attachments} dark />
                  </div>
                );
              })}
            </div>
          )}

          {/* Reply form */}
          {selected.status !== 'closed' && (
            <form onSubmit={sendReply} className="mt-5">
              <label htmlFor="ticket-reply" className="block text-[12px] font-semibold text-slate-300 mb-1.5">
                Reply to {selected.name}
              </label>
              <textarea
                id="ticket-reply"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
                placeholder="Write your response. The user will see it on their My Tickets page..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[13px] text-slate-200 placeholder:text-slate-500 outline-none focus:border-blue-500/50 transition-all resize-none"
              />
              <div className="mt-3 flex items-center gap-2.5">
                <button
                  type="submit"
                  disabled={sending || !reply.trim()}
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-[13px] font-semibold text-white transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                  {sending ? 'Sending...' : 'Send Reply'}
                </button>
                <button
                  type="button"
                  onClick={closeTicket}
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-white/10 text-[13px] font-semibold text-slate-300 hover:bg-white/[0.05] transition-colors"
                >
                  <CheckCheck className="w-4 h-4" aria-hidden="true" />
                  Mark Resolved
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  /* ----- List view ----- */
  return (
    <div>
      <PageHeader
        title="Support Tickets"
        subtitle={
          tickets?.length
            ? `${tickets.length} tickets · ${openCount} open — user messages from Contact Support.`
            : 'Messages users send through Contact Support.'
        }
      />

      <div className={`${PANEL} overflow-hidden`}>
        {error ? (
          <ErrorState />
        ) : !tickets ? (
          <LoadingRows rows={6} />
        ) : tickets.length === 0 ? (
          <EmptyState title="No support tickets yet" sub="User messages from Contact Support will appear here." />
        ) : (
          <ul className="divide-y divide-white/[0.04]">
            {tickets.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(t.ticket_id)}
                  className="w-full text-left px-4 py-3.5 flex items-center gap-3.5 hover:bg-white/[0.02] transition-colors"
                >
                  <span className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
                    <LifeBuoy className="w-4.5 h-4.5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-semibold text-white truncate">
                      {t.subject}
                      {t.replies.length > 0 && (
                        <span className="ml-2 text-[11px] font-medium text-slate-500">
                          ({t.replies.length} reply{t.replies.length > 1 ? 's' : ''})
                        </span>
                      )}
                    </p>
                    <p className="text-[11.5px] text-slate-500 truncate">
                      {t.name} · {t.ticket_id} · {t.category} · {fmtDate(t.created_at)}
                    </p>
                  </div>
                  {t.priority === 'urgent' || t.priority === 'high' ? (
                    <Badge tone={PRIORITY_TONE[t.priority]}>{t.priority}</Badge>
                  ) : null}
                  <Badge tone={STATUS_TONE[t.status]}>{t.status}</Badge>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
