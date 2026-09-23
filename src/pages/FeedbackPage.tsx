import React, { useState } from 'react';
import { PublicNavbar } from '../components/common/PublicNavbar';
import { MobileTabBar } from '../components/common/MobileTabBar';
import { FeedbackHero } from '../components/feedback/FeedbackHero';
import { FeedbackSidebar } from '../components/feedback/FeedbackSidebar';
import { FeedbackForm } from '../components/feedback/FeedbackForm';
import { FeedbackRightRail } from '../components/feedback/FeedbackRightRail';
import { FeedbackSuccess } from '../components/feedback/FeedbackSuccess';

/**
 * Feedback page — dark hero with community stats, then a light panel with
 * the support-center sidebar, the feedback form and a "why it matters" rail.
 * After submitting, the panel switches to the thank-you view with the
 * ticket ID and next steps.
 */
export const FeedbackPage: React.FC = () => {
  const [ticketId, setTicketId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#050D1F] font-sans">
      <PublicNavbar />

      {!ticketId && <FeedbackHero />}

      <div className="px-2 sm:px-4 pb-24 md:pb-6 -mt-0">
        <main className="max-w-6xl mx-auto rounded-3xl bg-[#EEF2F7] px-4 sm:px-6 py-6 sm:py-8">
          <div className="grid md:grid-cols-[215px_minmax(0,1fr)] lg:grid-cols-[215px_minmax(0,1fr)_320px] gap-6">
            <FeedbackSidebar variant={ticketId ? 'success' : 'form'} />

            {ticketId ? (
              <div className="md:col-start-2 lg:col-span-2">
                <FeedbackSuccess ticketId={ticketId} onReset={() => setTicketId(null)} />
              </div>
            ) : (
              <>
                <FeedbackForm onSuccess={setTicketId} />
                <div className="md:col-start-2 lg:col-start-3">
                  <FeedbackRightRail />
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      <MobileTabBar active="Resources" />
    </div>
  );
};
