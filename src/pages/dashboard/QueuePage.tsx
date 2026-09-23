import React, { useEffect, useMemo, useState } from 'react';
import { Ticket, Play, CheckCircle2, Users, Clock, Timer, RefreshCw, ListOrdered } from 'lucide-react';
import { Profile, QueueEntry } from '../../types';
import { StorageService } from '../../lib/storage';

const statusStyles: Record<QueueEntry['status'], string> = {
  waiting: 'bg-amber-50 text-amber-700 border-amber-200',
  serving: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  done: 'bg-zinc-100 text-zinc-500 border-zinc-200',
};

export const QueuePage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const p = await StorageService.getCurrentUserProfile();
      if (!mounted || !p) return;
      setProfile(p);
      setEntries(StorageService.getQueueEntries(p.id));
    };
    load();
    const timer = setInterval(() => {
      load();
      setTick((t) => t + 1);
    }, 4000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [tick === 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const waiting = entries.filter((e) => e.status === 'waiting');
  const serving = entries.find((e) => e.status === 'serving');
  const done = entries.filter((e) => e.status === 'done');
  const totalWait = waiting.reduce((s, e) => s + e.service_minutes, 0);

  const stats = useMemo(
    () => [
      { label: 'Waiting', value: waiting.length, icon: Users },
      { label: 'Now Serving', value: serving ? `#${serving.token}` : '—', icon: Play },
      { label: 'Completed', value: done.length, icon: CheckCircle2 },
      { label: 'Est. Total Wait', value: `${totalWait}m`, icon: Timer },
    ],
    [waiting.length, serving, done.length, totalWait]
  );

  const handleServeNext = () => {
    if (!profile) return;
    StorageService.serveNextInQueue(profile.id);
    setEntries(StorageService.getQueueEntries(profile.id));
  };

  const handleStatus = (entryId: string, status: QueueEntry['status']) => {
    if (!profile) return;
    StorageService.updateQueueEntry(profile.id, entryId, status);
    setEntries(StorageService.getQueueEntries(profile.id));
  };

  if (!profile) return null;

  const queueOn = profile.queue_enabled && (profile.services?.length || 0) > 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Ticket className="w-5 h-5" />
            Live Queue
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {queueOn
              ? 'Customers join from your public page — serve them in order.'
              : 'Live queue is off. Apply an industry template to enable it.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEntries(StorageService.getQueueEntries(profile.id))}
            className="p-2 rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:text-zinc-900 transition-colors"
            aria-label="Refresh queue"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleServeNext}
            disabled={!waiting.length}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-white text-xs font-bold transition-colors"
          >
            <Play className="w-4 h-4" />
            Serve Next
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
              <Icon className="w-3.5 h-3.5" />
              {label}
            </div>
            <div className="mt-1.5 text-2xl font-black tracking-tight">{value}</div>
          </div>
        ))}
      </div>

      {/* Queue list */}
      {entries.length === 0 ? (
        <div className="p-10 rounded-2xl border border-dashed border-zinc-300 text-center">
          <ListOrdered className="w-8 h-8 mx-auto text-zinc-300" />
          <p className="mt-3 text-sm font-semibold text-zinc-700">No one in the queue yet</p>
          <p className="text-xs text-zinc-500 mt-1">
            When customers tap “Join Queue” on your page, their tokens appear here live.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-zinc-200/90 shadow-2xs overflow-hidden">
          <div className="divide-y divide-zinc-100">
            {entries.map((e) => (
              <div key={e.id} className="p-3.5 flex items-center gap-3">
                <div
                  className={`w-12 h-12 shrink-0 flex flex-col items-center justify-center rounded-xl text-sm font-black ${
                    e.status === 'serving'
                      ? 'bg-emerald-600 text-white'
                      : e.status === 'done'
                      ? 'bg-zinc-100 text-zinc-400'
                      : 'bg-zinc-900 text-white'
                  }`}
                >
                  <span className="text-[8px] uppercase tracking-widest opacity-70">Tok</span>
                  #{e.token}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-bold truncate ${e.status === 'done' ? 'text-zinc-400 line-through' : 'text-zinc-900'}`}>
                    {e.customer_name}
                  </p>
                  <p className="text-[11px] text-zinc-500 truncate">
                    {e.service_name}
                    {e.customer_phone ? ` · ${e.customer_phone}` : ''}
                  </p>
                </div>
                <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide ${statusStyles[e.status]}`}>
                  <Clock className="w-3 h-3" />
                  {e.status}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {e.status === 'waiting' && (
                    <button
                      type="button"
                      onClick={() => handleStatus(e.id, 'serving')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors"
                    >
                      Serve
                    </button>
                  )}
                  {e.status === 'serving' && (
                    <button
                      type="button"
                      onClick={() => handleStatus(e.id, 'done')}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-bold transition-colors"
                    >
                      Done
                    </button>
                  )}
                  {e.status !== 'done' && (
                    <button
                      type="button"
                      onClick={() => handleStatus(e.id, 'done')}
                      className="px-2.5 py-1.5 rounded-lg border border-zinc-200 text-zinc-500 hover:text-zinc-900 text-[11px] font-semibold transition-colors"
                    >
                      Skip
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
