import { PublicNavbar } from '../components/common/PublicNavbar';
import React from 'react';
import { Megaphone } from 'lucide-react';
import useSWR from 'swr';
import { MobileTabBar } from '../components/common/MobileTabBar';
import { SeoHead } from '../components/common/SeoHead';
import { loadPublishedAnnouncements, type Announcement } from '../lib/announcements';

/**
 * Announcements — public feed of platform-wide announcements published from
 * the admin panel, in the same light design language as the Support Center.
 */

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

const isNew = (iso: string) => Date.now() - new Date(iso).getTime() < 7 * 24 * 60 * 60 * 1000;

const AnnouncementCard: React.FC<{ a: Announcement }> = ({ a }) => (
  <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
    <div className="flex items-start gap-3.5">
      <span className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
        <Megaphone className="w-5 h-5 text-blue-600" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-[15px] font-bold text-slate-900">{a.title}</h2>
          {isNew(a.created_at) && (
            <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-bold text-blue-600 uppercase tracking-wide">
              New
            </span>
          )}
        </div>
        <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600 whitespace-pre-wrap">{a.body}</p>
        <p className="mt-2.5 text-[11.5px] text-slate-400">{fmtDate(a.created_at)}</p>
      </div>
    </div>
  </article>
);

export const AnnouncementsPage: React.FC = () => {
  const { data: items } = useSWR('published-announcements', () => loadPublishedAnnouncements(), {
    fallbackData: [],
  });

  return (
    <div className="min-h-screen bg-[#050D1F] font-sans">
      <SeoHead title="Announcements | LinkOS" description="Product updates and announcements from the LinkOS team." />
      <PublicNavbar />

      <main className="max-w-6xl mx-auto rounded-3xl bg-[#EEF2F7] px-4 sm:px-6 py-6 sm:py-8">
        <header className="mb-5">
          <p className="text-[12px] font-semibold text-slate-500">
            <span className="text-blue-600">Support</span> <span aria-hidden="true">›</span> Announcements
          </p>
          <h1 className="mt-1 text-[26px] sm:text-[30px] font-bold text-slate-900 flex items-center gap-2.5">
            <Megaphone className="w-6 h-6 text-blue-600" aria-hidden="true" />
            Announcements
          </h1>
          <p className="mt-1 text-[13.5px] text-slate-500">
            Product updates, new features and news from the LinkOS team.
          </p>
        </header>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-10 text-center shadow-sm">
            <span className="mx-auto w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Megaphone className="w-6 h-6 text-blue-500" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-[17px] font-bold text-slate-900">No announcements yet</h2>
            <p className="mt-1 text-[13px] text-slate-500">Updates from the LinkOS team will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {items.map((a) => (
              <AnnouncementCard key={a.id} a={a} />
            ))}
          </div>
        )}
      </main>

      <MobileTabBar active="Resources" />
    </div>
  );
};
