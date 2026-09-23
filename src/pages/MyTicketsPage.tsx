import { PublicNavbar } from '../components/common/PublicNavbar';
import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
import {
  ChevronRight,
  FileText,
  LifeBuoy,
  MessageCircle,
  Ticket as TicketIcon,
} from 'lucide-react';
import { MobileTabBar } from '../components/common/MobileTabBar';
import { SupportSidebar } from '../components/support/SupportSidebar';
import { TrackTicket } from '../components/support/TrackTicket';
import { fetchUserTickets, type SupportTicket, type TicketStatus } from '../lib/supportTickets';
import { StorageService } from '../lib/storage';

/**
 * My Tickets — support-center page listing every ticket the user submitted
 * via Contact Support, in the same light design language as the Track My
 * Ticket view. Tapping a ticket opens the full TrackTicket detail (summary
 * card, conversation tabs, status timeline) via ?ticket=<id>.
 */

const STATUS_STYLE: Record<TicketStatus, { label: string; cls: string }> = {
  open: { label: 'Open', cls: 'bg-emerald-50 border-emerald-200 text-emerald-600' },
  in_progress: { label: 'In Progress', cls: 'bg-amber-50 border-amber-200 text-amber-600' },
  waiting_for_user: { label: 'Awaiting Your Response', cls: 'bg-purple-50 border-purple-200 text-purple-600' },
  resolved: { label: 'Resolved', cls: 'bg-blue-50 border-blue-200 text-blue-600' },
  closed: { label: 'Closed', cls: 'bg-slate-100 border-slate-200 text-slate-500' },
};

async function fetchMine(): Promise<SupportTicket[]> {
  const user = StorageService.getActiveUser();
  if (!user) return [];
  return fetchUserTickets(user.id);
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

export const MyTicketsPage: React.FC = () => {
  const { data: tickets, isLoading, mutate } = useSWR('my-support-tickets', fetchMine, {
    refreshInterval: 30_000,
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const openTicketId = searchParams.get('ticket');

  const openTicket = React.useMemo(
    () => tickets?.find((t) => t.ticket_id === openTicketId) ?? null,
    [tickets, openTicketId],
  );

  const closeTicket = () => setSearchParams({}, { replace: true });

  return (
    <div className="min-h-screen bg-[#050D1F] font-sans">
      <PublicNavbar />

      <div className="px-2 sm:px-4 pb-24 md:pb-6">
        <main className="max-w-6xl mx-auto rounded-3xl bg-[#EEF2F7] px-4 sm:px-6 py-6 sm:py-8">
          {openTicket ? (
            <TrackTicket ticket={openTicket} onBack={closeTicket} />
          ) : (
            <div className="grid md:grid-cols-[215px_minmax(0,1fr)] gap-6 items-start">
              <SupportSidebar variant="track" />

              <div className="min-w-0">
                {/* Breadcrumb */}
                <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[12px] text-slate-500">
                  <Link to="/help/contact" className="hover:text-blue-600 transition-colors">
                    Support
                  </Link>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                  <span className="text-slate-700 font-medium">My Tickets</span>
                </nav>

                {/* Header */}
                <div className="mt-2">
                  <h1 className="font-display text-[24px] font-bold text-slate-900">My Tickets</h1>
                  <p className="mt-1 text-[12.5px] text-slate-500">
                    All the support requests you&apos;ve submitted. Tap a ticket to view updates and reply.
                  </p>
                </div>

                {isLoading ? (
                  <div className="mt-5 space-y-3" aria-label="Loading tickets">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-24 rounded-2xl bg-white border border-slate-200/80 animate-pulse" />
                    ))}
                  </div>
                ) : !tickets || tickets.length === 0 ? (
                  <section className="mt-5 rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-sm">
                    <span className="mx-auto flex w-14 h-14 rounded-2xl bg-blue-50 items-center justify-center">
                      <TicketIcon className="w-7 h-7 text-blue-600" aria-hidden="true" />
                    </span>
                    <h2 className="mt-4 font-display text-[20px] font-bold text-slate-900">No tickets yet</h2>
                    <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-slate-500">
                      Need help? Send us a message and our support team will get back to you.
                    </p>
                    <Link
                      to="/help/contact"
                      className="mt-5 inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 transition text-[13px] font-bold text-white"
                    >
                      <MessageCircle className="w-4 h-4" aria-hidden="true" />
                      Contact Support
                    </Link>
                  </section>
                ) : (
                  <ul className="mt-5 space-y-3">
                    {tickets.map((t) => {
                      const status = STATUS_STYLE[t.status];
                      const lastReply = t.replies[t.replies.length - 1];
                      return (
                        <li key={t.id}>
                          <Link
                            to={`/help/tickets?ticket=${encodeURIComponent(t.ticket_id)}`}
                            className="block rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:border-blue-200 hover:shadow transition"
                            aria-label={`Open ticket ${t.ticket_id}`}
                          >
                            <div className="flex items-start gap-3.5">
                              <span className="flex w-12 h-12 rounded-xl bg-blue-50 items-center justify-center shrink-0">
                                <FileText className="w-5.5 h-5.5 text-blue-600" aria-hidden="true" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-[14px] font-bold text-slate-900">{t.ticket_id}</p>
                                  <span
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${status.cls}`}
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
                                    {status.label}
                                  </span>
                                </div>
                                <p className="mt-0.5 text-[12.5px] text-slate-600 truncate">{t.subject}</p>

                                {lastReply && (
                                  <p className="mt-2 text-[12px] leading-relaxed text-slate-500 line-clamp-2">
                                    <span className="font-semibold text-slate-700">
                                      {lastReply.by_role === 'user' ? 'You' : lastReply.by} replied:
                                    </span>{' '}
                                    {lastReply.message}
                                  </p>
                                )}

                                <p className="mt-2 text-[11px] text-slate-400">Created {fmt(t.created_at)}</p>
                              </div>
                              <ChevronRight className="w-4.5 h-4.5 text-slate-400 shrink-0 mt-3" aria-hidden="true" />
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {/* New ticket CTA */}
                <Link
                  to="/help/contact"
                  className="mt-5 flex items-center justify-between w-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:border-blue-200 hover:shadow transition"
                >
                  <span className="flex items-center gap-3.5">
                    <span className="flex w-12 h-12 rounded-xl bg-blue-50 items-center justify-center">
                      <LifeBuoy className="w-5.5 h-5.5 text-blue-600" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-[13.5px] font-bold text-slate-900">Still need help?</span>
                      <span className="block text-[11.5px] text-slate-500">Open a new support ticket</span>
                    </span>
                  </span>
                  <ChevronRight className="w-4.5 h-4.5 text-slate-400" aria-hidden="true" />
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>

      <MobileTabBar active="Resources" />
    </div>
  );
};
