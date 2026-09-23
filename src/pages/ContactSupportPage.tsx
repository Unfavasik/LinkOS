import React, { useState } from 'react';
import { PublicNavbar } from '../components/common/PublicNavbar';
import { MobileTabBar } from '../components/common/MobileTabBar';
import { SupportHero } from '../components/support/SupportHero';
import { SupportSidebar } from '../components/support/SupportSidebar';
import { SupportForm } from '../components/support/SupportForm';
import { SupportRightRail } from '../components/support/SupportRightRail';
import { SupportFaq } from '../components/support/SupportFaq';
import { SupportSuccess } from '../components/support/SupportSuccess';
import { TrackTicket } from '../components/support/TrackTicket';
import type { SupportTicket } from '../lib/supportTickets';

/**
 * Contact support page with three views:
 *  - form:    dark hero + light panel (Get Support sidebar, message form,
 *             quick-help rail, FAQ accordion)
 *  - success: "Your Request Has Been Submitted!" with the ticket ID and the
 *             marketing footer
 *  - track:   "Track My Ticket" with the conversation thread, status
 *             timeline and related articles
 */
export const ContactSupportPage: React.FC = () => {
  const [view, setView] = useState<'form' | 'success' | 'track'>('form');
  const [ticket, setTicket] = useState<SupportTicket | null>(null);

  const go = (next: typeof view) => {
    setView(next);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="min-h-screen bg-[#050D1F] font-sans">
      <PublicNavbar mobileCentered />

      {view === 'success' ? (
        <SupportSuccess
          ticket={ticket}
          onTrack={() => go('track')}
          onBack={() => go('form')}
        />
      ) : (
        <>
          {view === 'form' && <SupportHero />}

          <div className="px-3 sm:px-4 pb-24 md:pb-6">
            <main
              className={`max-w-6xl mx-auto rounded-3xl ${
                view === 'form'
                  ? 'px-0 py-0 md:px-6 md:py-8 md:bg-[#EEF2F7]'
                  : 'bg-[#EEF2F7] px-4 sm:px-6 py-6 sm:py-8'
              }`}
            >
              {view === 'form' ? (
                <>
                  <div className="grid md:grid-cols-[250px_minmax(0,1fr)] lg:grid-cols-[250px_minmax(0,1fr)_320px] gap-6">
                    <SupportSidebar variant="form" />
                    <SupportForm
                      onSuccess={(t) => {
                        setTicket(t);
                        go('success');
                      }}
                    />
                    <div className="md:col-start-2 lg:col-start-3">
                      <SupportRightRail />
                    </div>
                  </div>
                  <SupportFaq />
                </>
              ) : (
                <TrackTicket ticket={ticket} onBack={() => go('form')} />
              )}
            </main>
          </div>
        </>
      )}

      <MobileTabBar active="Resources" />
    </div>
  );
};
