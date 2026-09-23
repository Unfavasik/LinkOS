import React, { useEffect, useMemo, useState } from 'react';
import { Ticket, Clock, BellRing, CheckCircle2, Users, ChevronRight, X } from 'lucide-react';
import { Profile, QueueEntry, ServiceItem } from '../../types';
import { StorageService } from '../../lib/storage';

interface QueueWidgetProps {
  profile: Profile;
  queueLabel?: string;
}

/**
 * Customer-facing live queue. Lets a visitor pick a service, join the
 * queue, and see their token, live position and estimated wait. The
 * ticket survives page refreshes via localStorage.
 */
export const QueueWidget: React.FC<QueueWidgetProps> = ({ profile, queueLabel }) => {
  const services: ServiceItem[] = profile.services || [];
  const [service, setService] = useState<ServiceItem | null>(services[0] || null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [ticket, setTicket] = useState<QueueEntry | null>(null);
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [notified, setNotified] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const refresh = () => {
    setEntries(StorageService.getQueueEntries(profile.id));
  };

  // Restore my ticket + poll the queue so position stays live
  useEffect(() => {
    refresh();
    const myId = StorageService.getMyTicketId(profile.id);
    if (myId) {
      const mine = StorageService.getQueueEntries(profile.id).find((e) => e.id === myId);
      if (mine) {
        setTicket(mine);
        setService(services.find((s) => s.name === mine.service_name) || null);
      }
    }
    const timer = setInterval(refresh, 5000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.id]);

  const waiting = entries.filter((e) => e.status === 'waiting');
  const serving = entries.find((e) => e.status === 'serving');
  const position = ticket ? waiting.filter((e) => e.token < ticket.token).length + 1 : 0;
  const estWait = ticket ? waiting.filter((e) => e.token < ticket.token).reduce((sum, e) => sum + e.service_minutes, (serving?.service_minutes || 0)) : 0;

  const handleJoin = () => {
    if (!service || name.trim().length < 2) return;
    const entry = StorageService.joinQueue(profile.id, {
      customer_name: name,
      customer_phone: phone,
      service_name: service.name,
      service_minutes: service.minutes,
    });
    setTicket(entry);
    setExpanded(false);
    refresh();
  };

  const handleNotify = async () => {
    setNotified(true);
    try {
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(profile.business_name, {
          body: `You are #${position} in the queue. We will alert you when your turn comes.`,
        });
      }
    } catch {
      // Notification API unavailable — in-app confirmation is enough
    }
  };

  const handleLeave = () => {
    if (!ticket) return;
    StorageService.updateQueueEntry(profile.id, ticket.id, 'done');
    StorageService.clearMyTicket(profile.id);
    setTicket(null);
    setNotified(false);
    refresh();
  };

  const radius = profile.button_style === 'pill' ? '9999px' : profile.button_style === 'sharp' ? '6px' : '14px';

  const header = useMemo(
    () => (
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lk-text,#18181B)] flex items-center gap-1.5">
          <Ticket className="w-3.5 h-3.5" />
          Live Queue
        </h2>
        <span className="text-[11px] text-[var(--lk-sub,#A1A1AA)] font-medium">
          {waiting.length} waiting
        </span>
      </div>
    ),
    [waiting.length]
  );

  if (services.length === 0) return null;

  /* ---------- Ticket view ---------- */
  if (ticket) {
    return (
      <div
        className="p-4 rounded-2xl bg-[var(--lk-surface,#fff)] border-2 border-[var(--lk-accent,#18181B)] shadow-sm"
        style={{ borderRadius: radius }}
      >
        {header}
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 shrink-0 flex flex-col items-center justify-center bg-[var(--lk-accent,#18181B)] text-[var(--lk-accent-text,#fff)]"
            style={{ borderRadius: radius }}
          >
            <span className="text-[9px] uppercase tracking-widest opacity-70">Token</span>
            <span className="text-xl font-black leading-none">#{ticket.token}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[var(--lk-text,#18181B)] truncate">{ticket.service_name}</p>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-[var(--lk-sub,#71717A)]">
              <span className="inline-flex items-center gap-1">
                <Users className="w-3 h-3" /> Position #{position}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" /> ~{estWait} min wait
              </span>
            </div>
            {serving && (
              <p className="mt-1 text-[11px] font-semibold text-emerald-600">
                Now serving: #{serving.token} · {serving.customer_name}
              </p>
            )}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleNotify}
            disabled={notified}
            className="inline-flex items-center justify-center gap-1.5 py-2.5 bg-[var(--lk-accent,#18181B)] text-[var(--lk-accent-text,#fff)] text-xs font-bold disabled:opacity-70"
            style={{ borderRadius: radius }}
          >
            {notified ? <CheckCircle2 className="w-4 h-4" /> : <BellRing className="w-4 h-4" />}
            {notified ? 'Reminder On' : 'Notify Me'}
          </button>
          <button
            type="button"
            onClick={handleLeave}
            className="inline-flex items-center justify-center gap-1.5 py-2.5 bg-[var(--lk-bg,#FAFAFA)] border border-[var(--lk-border,#E4E4E7)] text-[var(--lk-text,#27272A)] text-xs font-bold"
            style={{ borderRadius: radius }}
          >
            <X className="w-4 h-4" /> Leave Queue
          </button>
        </div>
        {notified && (
          <p className="mt-2 text-[11px] text-center text-[var(--lk-sub,#71717A)]">
            We will alert you when your turn is near. Keep this page open.
          </p>
        )}
      </div>
    );
  }

  /* ---------- Collapsed teaser ---------- */
  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="w-full p-4 rounded-2xl bg-[var(--lk-surface,#fff)] border border-[var(--lk-border,#E4E4E7)] shadow-sm flex items-center justify-between gap-3 text-left hover:opacity-90 active:scale-[0.99] transition-all"
        style={{ borderRadius: radius }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 shrink-0 flex items-center justify-center bg-[var(--lk-accent,#18181B)] text-[var(--lk-accent-text,#fff)]"
            style={{ borderRadius: radius }}
          >
            <Ticket className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[var(--lk-text,#18181B)]">
              {queueLabel || 'Join the Live Queue'}
            </p>
            <p className="text-[11px] text-[var(--lk-sub,#71717A)] truncate">
              {waiting.length} waiting{service ? ` · ${service.name} from ₹${service.price}` : ''}
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-[var(--lk-sub,#A1A1AA)] shrink-0" />
      </button>
    );
  }

  /* ---------- Join form ---------- */
  return (
    <div
      className="p-4 rounded-2xl bg-[var(--lk-surface,#fff)] border border-[var(--lk-border,#E4E4E7)] shadow-sm"
      style={{ borderRadius: radius }}
    >
      {header}
      <p className="text-[11px] text-[var(--lk-sub,#71717A)] mb-3">{queueLabel || 'Choose a service and take your token'}</p>

      {/* Service picker */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {services.map((s) => {
          const active = service?.name === s.name;
          return (
            <button
              key={s.name}
              type="button"
              onClick={() => setService(s)}
              className={`px-3 py-1.5 text-[11px] font-semibold border transition-colors ${
                active
                  ? 'bg-[var(--lk-accent,#18181B)] text-[var(--lk-accent-text,#fff)] border-transparent'
                  : 'bg-[var(--lk-bg,#FAFAFA)] text-[var(--lk-text,#27272A)] border-[var(--lk-border,#E4E4E7)]'
              }`}
              style={{ borderRadius: radius }}
            >
              {s.name}
              {s.price > 0 && <span className="opacity-70"> · ₹{s.price}</span>}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full px-3 py-2.5 text-xs bg-[var(--lk-bg,#FAFAFA)] border border-[var(--lk-border,#E4E4E7)] text-[var(--lk-text,#18181B)] placeholder:text-[var(--lk-sub,#A1A1AA)] outline-none focus:border-[var(--lk-accent,#18181B)]"
          style={{ borderRadius: radius }}
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone (optional)"
          type="tel"
          className="w-full px-3 py-2.5 text-xs bg-[var(--lk-bg,#FAFAFA)] border border-[var(--lk-border,#E4E4E7)] text-[var(--lk-text,#18181B)] placeholder:text-[var(--lk-sub,#A1A1AA)] outline-none focus:border-[var(--lk-accent,#18181B)]"
          style={{ borderRadius: radius }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleJoin}
          disabled={!service || name.trim().length < 2}
          className="inline-flex items-center justify-center gap-1.5 py-2.5 bg-[var(--lk-accent,#18181B)] text-[var(--lk-accent-text,#fff)] text-xs font-bold disabled:opacity-50"
          style={{ borderRadius: radius }}
        >
          <Ticket className="w-4 h-4" />
          Join Queue
        </button>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="py-2.5 bg-[var(--lk-bg,#FAFAFA)] border border-[var(--lk-border,#E4E4E7)] text-[var(--lk-text,#27272A)] text-xs font-bold"
          style={{ borderRadius: radius }}
        >
          Cancel
        </button>
      </div>
      {service && service.minutes > 0 && (
        <p className="mt-2 text-[11px] text-center text-[var(--lk-sub,#71717A)]">
          Approx {service.minutes} min per customer · {waiting.length} ahead of you
        </p>
      )}
    </div>
  );
};
