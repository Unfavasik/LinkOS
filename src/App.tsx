import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import PricingPage from './pages/PricingPage';
import FeaturesPage from './pages/FeaturesPage';
import { TemplatesGalleryPage } from './pages/TemplatesGalleryPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { ResourceArticlePage } from './pages/ResourceArticlePage';
import { GuidesListPage } from './pages/GuidesListPage';
import { GuideArticlePage } from './pages/GuideArticlePage';
import { HelpCenterPage } from './pages/HelpCenterPage';
import { ContactSupportPage } from './pages/ContactSupportPage';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { AdminRoute } from './pages/admin/AdminRoute';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage, AdminBusinessesPage, AdminPagesPage } from './pages/admin/AdminPeoplePages';
import { AdminTemplatesPage, AdminPlansPage, AdminOrdersPage } from './pages/admin/AdminCatalogPages';
import {
  AdminInquiriesPage,
  AdminReviewsPage,
  AdminQrCodesPage,
  AdminAnnouncementsPage,
  AdminNotificationsPage,
} from './pages/admin/AdminEngagePages';
import { AdminAnalyticsPage, AdminSettingsPage } from './pages/admin/AdminSystemPages';
import { AdminManageAdminsPage } from './pages/admin/AdminManageAdminsPage';
import { AdminGuidesPage } from './pages/admin/AdminGuidesPage';
import { AdminSupportTicketsPage } from './pages/admin/AdminSupportTicketsPage';
import { AdminFeedbackPage } from './pages/admin/AdminFeedbackPage';
import { AdminSectionGuard as Guard } from './pages/admin/AdminSectionGuard';
import { TemplateDetailPage } from './pages/TemplateDetailPage';
import { TemplatePreviewPage } from './pages/TemplatePreviewPage';
import { PublicProfilePage } from './pages/PublicProfilePage';
import { PublicWebsitePage } from './pages/PublicWebsitePage';
import { SuspendedAccountPage } from './pages/SuspendedAccountPage';
import { LegalPage } from './pages/LegalPage';
import { MyWebsitesPage } from './pages/dashboard/MyWebsitesPage';
import { CreateWebsitePage } from './pages/dashboard/CreateWebsitePage';
import { WebsiteManagePage } from './pages/dashboard/WebsiteManagePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { OverviewPage } from './pages/dashboard/OverviewPage';
import { PageDetailPage } from './pages/dashboard/PageDetailPage';
import { EditorPage } from './pages/dashboard/EditorPage';
import { ProductsPage } from './pages/dashboard/ProductsPage';
import { OrdersPage } from './pages/dashboard/OrdersPage';
import { NotificationsPage } from './pages/dashboard/NotificationsPage';
import { QueuePage } from './pages/dashboard/QueuePage';
import { CustomersPage } from './pages/dashboard/CustomersPage';
import { AnalyticsPage } from './pages/dashboard/AnalyticsPage';
import { QrCodePage } from './pages/dashboard/QrCodePage';
import { TemplatesPage } from './pages/dashboard/TemplatesPage';
import { SettingsPage } from './pages/dashboard/SettingsPage';
import { EditProfilePage } from './pages/dashboard/EditProfilePage';
import { NeedleAssistantPage } from './pages/dashboard/NeedleAssistantPage';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { StorageService } from './lib/storage';
import { verifyAdmin, isKnownAdminEmail, syncSupabaseAdminEmails } from './lib/adminAuth';

/**
 * SPA navigations preserve the previous scroll offset, which can make a
 * route change look like nothing happened on long pages. Reset to the top
 * whenever the path changes.
 */
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

/**
 * Listens for Supabase OAuth redirects and persists active session
 */
const AuthSynchronizer: React.FC = () => {
  React.useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // Load and sync admin emails dynamically from Supabase admins table
    syncSupabaseAdminEmails().catch(() => {});

    // Check existing session on load
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) {
        const u = data.session.user;
        const email = u.email || 'ayatulsekh3037@gmail.com';
        StorageService.setActiveUser({
          id: u.id,
          email,
        });
        if (isKnownAdminEmail(email)) {
          verifyAdmin(email, u.id);
        }
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const u = session.user;
        const email = u.email || 'ayatulsekh3037@gmail.com';
        StorageService.setActiveUser({
          id: u.id,
          email,
        });
        if (isKnownAdminEmail(email)) {
          verifyAdmin(email, u.id);
        }
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  return null;
};

/* Legacy /help/:slug URLs now live under Guides; old slugs map to their
   replacement guide, anything unknown falls back to the guides list. */
const LEGACY_HELP_SLUGS: Record<string, string> = {
  'create-your-first-page': 'how-to-create-your-first-business-page',
  'connect-custom-domain': 'how-to-create-your-first-business-page',
  'billing-and-payments': '10-ways-to-get-more-customers-online',
};

function HelpSlugRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/resources/guides/${LEGACY_HELP_SLUGS[slug ?? ''] ?? ''}`.replace(/\/$/, '')} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthSynchronizer />
      <Routes>
        {/* Public Landing & Marketing */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/templates" element={<TemplatesGalleryPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/resources/guides" element={<GuidesListPage />} />
        <Route path="/resources/business-tips" element={<GuidesListPage tagFilter="Business Tip" />} />
        <Route path="/resources/guides/:slug" element={<GuideArticlePage />} />
        <Route path="/resources/:slug" element={<ResourceArticlePage />} />
        <Route path="/legal" element={<LegalPage />} />
        <Route path="/help" element={<HelpCenterPage />} />
        <Route path="/help/:slug" element={<HelpSlugRedirect />} />
        <Route path="/help/contact" element={<ContactSupportPage />} />
        <Route path="/help/tickets" element={<MyTicketsPage />} />
        <Route path="/help/feedback" element={<FeedbackPage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/admin" element={<AdminRoute />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<Guard section="users"><AdminUsersPage /></Guard>} />
          <Route path="businesses" element={<Guard section="businesses"><AdminBusinessesPage /></Guard>} />
          <Route path="pages" element={<Guard section="pages"><AdminPagesPage /></Guard>} />
          <Route path="templates" element={<Guard section="templates"><AdminTemplatesPage /></Guard>} />
          <Route path="templates/:templateId/edit" element={<Guard section="templates"><EditorPage templateMode /></Guard>} />
          <Route path="plans" element={<Guard section="plans"><AdminPlansPage /></Guard>} />
          <Route path="orders" element={<Guard section="orders"><AdminOrdersPage /></Guard>} />
          <Route path="inquiries" element={<Guard section="inquiries"><AdminInquiriesPage /></Guard>} />
          <Route path="support" element={<Guard section="inquiries"><AdminSupportTicketsPage /></Guard>} />
          <Route path="feedback" element={<Guard section="inquiries"><AdminFeedbackPage /></Guard>} />
          <Route path="reviews" element={<Guard section="reviews"><AdminReviewsPage /></Guard>} />
          <Route path="qr-codes" element={<Guard section="qr-codes"><AdminQrCodesPage /></Guard>} />
          <Route path="announcements" element={<Guard section="announcements"><AdminAnnouncementsPage /></Guard>} />
          <Route path="notifications" element={<Guard section="announcements"><AdminNotificationsPage /></Guard>} />
          <Route path="guides" element={<Guard section="announcements"><AdminGuidesPage /></Guard>} />
          <Route path="analytics" element={<Guard section="analytics"><AdminAnalyticsPage /></Guard>} />
          <Route path="settings" element={<Guard section="settings"><AdminSettingsPage /></Guard>} />
          <Route path="manage-admins" element={<Guard section="manage-admins"><AdminManageAdminsPage /></Guard>} />
        </Route>
        <Route path="/templates/detail/:templateId" element={<TemplateDetailPage />} />
        <Route path="/templates/preview/:templateId" element={<TemplatePreviewPage />} />

        {/* Auth & Onboarding */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        {/* The old onboarding wizard was removed; old links now lead to the
            Create Website flow. */}
        <Route path="/onboarding" element={<Navigate to="/dashboard/websites/new" replace />} />

        {/* Dashboard & Admin */}
          <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="pages/:pageId" element={<PageDetailPage />} />
          <Route path="editor" element={<EditorPage />} />
          <Route path="websites" element={<MyWebsitesPage />} />
          <Route path="websites/new" element={<CreateWebsitePage />} />
          <Route path="websites/:websiteId" element={<WebsiteManagePage />} />
          <Route path="websites/:websiteId/edit" element={<EditorPage websiteMode />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        <Route path="queue" element={<QueuePage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="qr" element={<QrCodePage />} />
          <Route path="profile" element={<EditProfilePage />} />
          <Route path="assistant" element={<NeedleAssistantPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Public Mobile-First Business Page */}
        <Route path="/site/:slug" element={<PublicWebsitePage />} />
        <Route path="/:username" element={<PublicProfilePage />} />

        {/* Catch all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
