import { supabase, isSupabaseConfigured } from './supabase';
import { StorageService } from './storage';

/**
 * Support tickets: users submit via Contact Support; owner/admin/support see
 * and reply to them in the admin panel. Uses the existing public.support_tickets
 * table (user_id, email, name, category, subject, message, status, priority,
 * admin_response, metadata). The conversation thread (ticket id + replies) is
 * kept in the metadata jsonb column so no schema change is needed.
 * If Supabase is unreachable, tickets fall back to a local queue so the
 * user's submission is never lost.
 */

export interface TicketAttachment {
  name: string;
  size: number;
  type: string;
  /** Base64 data URL for image previews (only set for images small enough to inline). */
  dataUrl?: string;
}

export interface TicketReply {
  by: string;
  by_role: string;
  message: string;
  created_at: string;
  attachments?: TicketAttachment[];
}

export type TicketStatus = 'open' | 'in_progress' | 'waiting_for_user' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface SupportTicket {
  id: string;
  ticket_id: string;
  user_id: string | null;
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  status: TicketStatus;
  priority: TicketPriority;
  replies: TicketReply[];
  created_at: string;
  updated_at: string;
}

/** Row shape of the existing support_tickets table. */
interface TicketRow {
  id: string;
  user_id: string | null;
  email: string;
  name: string;
  subject: string;
  message: string;
  category: string;
  status: string | null;
  priority: string | null;
  admin_response: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

const LS_KEY = 'linkos_support_tickets_v1';
const TICKET_PREFIX = '#LK-';

function readLocal(): SupportTicket[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as SupportTicket[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(tickets: SupportTicket[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(tickets));
  } catch {
    /* storage full — ignore */
  }
}

export function makeTicketId(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${TICKET_PREFIX}${ymd}-${rand}`;
}

function rowToTicket(row: TicketRow): SupportTicket {
  const meta = (row.metadata && typeof row.metadata === 'object' ? row.metadata : {}) as {
    ticket_id?: string;
    replies?: TicketReply[];
  };
  return {
    id: row.id,
    ticket_id: meta.ticket_id || `${TICKET_PREFIX}${row.id.slice(0, 8).toUpperCase()}`,
    user_id: row.user_id,
    name: row.name,
    email: row.email,
    category: row.category,
    subject: row.subject,
    message: row.message,
    status: (row.status as TicketStatus) || 'open',
    priority: (row.priority as TicketPriority) || 'normal',
    replies: Array.isArray(meta.replies) ? meta.replies : [],
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function submitSupportTicket(input: {
  category: string;
  subject: string;
  message: string;
  email: string;
}): Promise<SupportTicket> {
  const user = StorageService.getActiveUser();
  const now = new Date().toISOString();
  // user_id is a uuid column — only send it when the id is a real UUID.
  const userId = user?.id && UUID_RE.test(user.id) ? user.id : null;
  const ticket: SupportTicket = {
    id: crypto.randomUUID(),
    ticket_id: makeTicketId(),
    user_id: userId,
    name: user?.business_name || 'Guest user',
    email: input.email,
    category: input.category,
    subject: input.subject,
    message: input.message,
    status: 'open',
    priority: 'normal',
    replies: [],
    created_at: now,
    updated_at: now,
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('support_tickets').insert({
        user_id: ticket.user_id,
        email: ticket.email,
        name: ticket.name,
        subject: ticket.subject,
        message: ticket.message,
        category: ticket.category,
        priority: 'normal',
        status: ticket.status,
        metadata: { ticket_id: ticket.ticket_id, replies: [] },
      });
      if (!error) return ticket;
      console.warn('[v0] support_tickets insert failed, saving locally:', error.message);
    } catch (err) {
      console.warn('[v0] support_tickets insert error:', err);
    }
  }

  writeLocal([ticket, ...readLocal()]);
  return ticket;
}

export async function fetchAllTickets(): Promise<SupportTicket[]> {
  let remote: SupportTicket[] | null = null;
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (!error && data) {
        remote = (data as TicketRow[]).map(rowToTicket);
      } else if (error) {
        console.warn('[v0] support_tickets fetch failed:', error.message);
      }
    } catch (err) {
      console.warn('[v0] support_tickets fetch error:', err);
    }
  }
  if (!remote) return readLocal().sort((a, b) => b.created_at.localeCompare(a.created_at));
  // Keep any tickets that only exist locally (e.g. saved during an outage).
  const remoteIds = new Set(remote.map((t) => t.ticket_id));
  const localOnly = readLocal().filter((t) => !remoteIds.has(t.ticket_id));
  return [...remote, ...localOnly].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function fetchUserTickets(userId: string): Promise<SupportTicket[]> {
  const all = await fetchAllTickets();
  const user = StorageService.getActiveUser();
  return all.filter(
    (t) => t.user_id === userId || (user?.email && t.email.toLowerCase() === user.email.toLowerCase()),
  );
}

export async function replyToTicket(
  ticketId: string,
  reply: { by: string; by_role: string; message: string; attachments?: TicketAttachment[] },
): Promise<SupportTicket | null> {
  const entry: TicketReply = { ...reply, created_at: new Date().toISOString() };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: existing } = await supabase
        .from('support_tickets')
        .select('id, metadata')
        .eq('metadata->>ticket_id', ticketId)
        .maybeSingle();
      if (existing) {
        const meta = (existing.metadata && typeof existing.metadata === 'object' ? existing.metadata : {}) as {
          ticket_id?: string;
          replies?: TicketReply[];
        };
        const replies = [...(Array.isArray(meta.replies) ? meta.replies : []), entry];
        const { data, error } = await supabase
          .from('support_tickets')
          .update({
            metadata: { ...meta, replies },
            admin_response: entry.message,
            status: 'in_progress',
            updated_at: entry.created_at,
          })
          .eq('id', (existing as { id: string }).id)
          .select()
          .single();
        if (!error && data) return rowToTicket(data as TicketRow);
        console.warn('[v0] support_tickets reply failed:', error?.message);
      }
    } catch (err) {
      console.warn('[v0] support_tickets reply error:', err);
    }
  }

  // Local fallback
  const tickets = readLocal();
  const idx = tickets.findIndex((t) => t.ticket_id === ticketId);
  if (idx === -1) return null;
  tickets[idx] = {
    ...tickets[idx],
    replies: [...tickets[idx].replies, entry],
    status: 'in_progress',
    updated_at: entry.created_at,
  };
  writeLocal(tickets);
  return tickets[idx];
}

export async function setTicketStatus(ticketId: string, status: TicketStatus): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('metadata->>ticket_id', ticketId);
      if (!error) return;
    } catch {
      /* fall through to local */
    }
  }
  const tickets = readLocal();
  const idx = tickets.findIndex((t) => t.ticket_id === ticketId);
  if (idx !== -1) {
    tickets[idx] = { ...tickets[idx], status, updated_at: new Date().toISOString() };
    writeLocal(tickets);
  }
}

/** Tickets in these states no longer accept messages from the user. */
export function isTicketLocked(status: TicketStatus): boolean {
  return status === 'resolved' || status === 'closed';
}

/**
 * Reply from the user's side of the conversation. Reopens the ticket so the
 * support team sees it needs attention. Rejected when the ticket is
 * resolved/closed — the conversation is locked at that point.
 */
export async function addUserReply(
  ticketId: string,
  message: string,
): Promise<{ ok: boolean; error?: 'locked' }> {
  const tickets = await fetchAllTickets();
  const ticket = tickets.find((t) => t.ticket_id === ticketId);
  if (!ticket) return { ok: false };
  if (isTicketLocked(ticket.status)) return { ok: false, error: 'locked' };

  const user = StorageService.getActiveUser();
  const entry: TicketReply = {
    by: user?.business_name || ticket.name || 'You',
    by_role: 'user',
    message,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: existing } = await supabase
        .from('support_tickets')
        .select('id, metadata, status')
        .eq('metadata->>ticket_id', ticketId)
        .maybeSingle();
      if (existing) {
        const row = existing as { id: string; metadata: Record<string, unknown> | null; status: string | null };
        if (isTicketLocked((row.status as TicketStatus) || 'open')) return { ok: false, error: 'locked' };
        const meta = (row.metadata && typeof row.metadata === 'object' ? row.metadata : {}) as {
          ticket_id?: string;
          replies?: TicketReply[];
        };
        const replies = [...(Array.isArray(meta.replies) ? meta.replies : []), entry];
        const { error } = await supabase
          .from('support_tickets')
          .update({
            metadata: { ...meta, replies },
            status: 'open',
            updated_at: entry.created_at,
          })
          .eq('id', row.id);
        if (!error) return { ok: true };
        console.warn('[v0] support_tickets user reply failed:', error.message);
      }
    } catch (err) {
      console.warn('[v0] support_tickets user reply error:', err);
    }
  }

  // Local fallback
  const local = readLocal();
  const idx = local.findIndex((t) => t.ticket_id === ticketId);
  if (idx === -1) return { ok: false };
  local[idx] = {
    ...local[idx],
    replies: [...local[idx].replies, entry],
    status: 'open',
    updated_at: entry.created_at,
  };
  writeLocal(local);
  return { ok: true };
}
