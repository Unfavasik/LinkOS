import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Megaphone, ArrowUpRight, CheckCheck, Info } from 'lucide-react';
import {
  useUserNotifications,
  markAllNotificationsRead,
  getLastReadAt,
  type UserNotification,
} from '../../lib/userNotifications';

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

const NotificationRow: React.FC<{ item: UserNotification; unread: boolean }> = ({ item, unread }) => {
  const isAnnouncement = item.kind === 'announcement';
  const Icon = isAnnouncement ? Megaphone : Bell;
  const inner = (
    <div
      className={`flex items-start gap-3.5 px-5 py-4 transition-colors ${
        item.link ? 'hover:bg-zinc-50 cursor-pointer' : ''
      }`}
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
          isAnnouncement ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
        }`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[13.5px] font-semibold text-zinc-900">{item.title}</p>
          {unread && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" aria-label="Unread" />}
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
              isAnnouncement ? 'bg-purple-100 text-purple-700' : 'bg-zinc-100 text-zinc-500'
            }`}
          >
            {isAnnouncement ? 'Announcement' : 'Update'}
          </span>
        </div>
        {item.body && <p className="mt-0.5 text-[12.5px] text-zinc-600 leading-relaxed">{item.body}</p>}
        <p className="mt-1 text-[11px] text-zinc-400">{fmtDate(item.created_at)}</p>
      </div>
      {item.link && <ArrowUpRight className="w-4 h-4 text-zinc-300 shrink-0 mt-1" />}
    </div>
  );
  return item.link ? <Link to={item.link}>{inner}</Link> : inner;
};

export const NotificationsPage: React.FC = () => {
  const { items, unread, isLoading, refresh } = useUserNotifications();
  const lastReadAt = getLastReadAt();

  const markRead = () => {
    markAllNotificationsRead();
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Notifications</h1>
          <p className="text-xs text-zinc-500">
            Updates from the LinkOS team — announcements, tips and messages sent to you.
          </p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={markRead}
            disabled={unread === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 disabled:opacity-50 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read{unread > 0 ? ` (${unread})` : ''}
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="px-5 py-10 text-center text-xs text-zinc-400">Loading notifications…</div>
        ) : items.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-3">
              <Info className="w-5 h-5 text-zinc-400" />
            </div>
            <p className="text-sm font-semibold text-zinc-700">No notifications yet</p>
            <p className="text-xs text-zinc-500 mt-1">
              Announcements and messages from the team will show up here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {items.map((n) => (
              <li key={n.id}>
                <NotificationRow item={n} unread={new Date(n.created_at).getTime() > lastReadAt} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
