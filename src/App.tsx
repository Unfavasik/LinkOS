import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import PricingPage from './pages/PricingPage';
import FeaturesPage from './pages/FeaturesPage';
import { TemplatesGalleryPage } from './pages/TemplatesGalleryPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { ResourceArticlePage } from './pages/ResourceArticlePage';
import { HelpCenterPage } from './pages/HelpCenterPage';
import { HelpArticlePage } from './pages/HelpArticlePage';
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
  AdminHelpArticlesPage,
} from './pages/admin/AdminEngagePages';
import { AdminAnalyticsPage, AdminSettingsPage } from './pages/admin/AdminSystemPages';
import { AdminManageAdminsPage } from './pages/admin/AdminManageAdminsPage';
import { AdminSupportTicketsPage } from './pages/admin/AdminSupportTicketsPage';
import { AdminFeedbackPage } from './pages/admin/AdminFeedbackPage';
import { AdminSectionGuard as Guard } from './pages/admin/AdminSectionGuard';
import { TemplateDetailPage } from './pages/TemplateDetailPage';
import { TemplatePreviewPage } from './pages/TemplatePreviewPage';
import { PublicProfilePage } from './pages/PublicProfilePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { OnboardingWizard } from './pages/OnboardingWizard';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { OverviewPage } from './pages/dashboard/OverviewPage';
import { PageDetailPage } from './pages/dashboard/PageDetailPage';
import { EditorPage } from './pages/dashboard/EditorPage';
import { ProductsPage } from './pages/dashboard/ProductsPage';
import { OrdersPage } from './pages/dashboard/OrdersPage';
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
        <Route path="/resources/:slug" element={<ResourceArticlePage />} />
        <Route path="/help" element={<HelpCenterPage />} />
        <Route path="/help/:slug" element={<HelpArticlePage />} />
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
          <Route path="help-articles" element={<Guard section="announcements"><AdminHelpArticlesPage /></Guard>} />
          <Route path="analytics" element={<Guard section="analytics"><AdminAnalyticsPage /></Guard>} />
          <Route path="settings" element={<Guard section="settings"><AdminSettingsPage /></Guard>} />
          <Route path="manage-admins" element={<Guard section="manage-admins"><AdminManageAdminsPage /></Guard>} />
        </Route>
        <Route path="/templates/detail/:templateId" element={<TemplateDetailPage />} />
        <Route path="/templates/preview/:templateId" element={<TemplatePreviewPage />} />

        {/* Auth & Onboarding */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/onboarding" element={<OnboardingWizard />} />

        {/* Dashboard & Admin */}
          <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="pages/:pageId" element={<PageDetailPage />} />
          <Route path="editor" element={<EditorPage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="orders" element={<OrdersPage />} />
        <Route path="queue" element={<QueuePage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="qr" element={<QrCodePage />} />
          <Route path="profile" element={<EditProfilePage />} />
          <Route path="assistant" element={<NeedleAssistantPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Public Mobile-First Business Page */}
        <Route path="/:username" element={<PublicProfilePage />} />

        {/* Catch all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
