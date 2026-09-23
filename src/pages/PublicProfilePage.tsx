import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageCircle, Phone, Share2, QrCode as QrIcon } from 'lucide-react';
import { Profile, Product, LinkItem, Review } from '../types';
import { StorageService } from '../lib/storage';
import { DEMO_REVIEWS } from '../data/demoData';
import { SeoHead } from '../components/common/SeoHead';
import { TemplateSite } from '../components/profile/TemplateSite';
import { ProductDetailModal } from '../components/profile/ProductDetailModal';
import { ShareModal } from '../components/profile/ShareModal';
import { getProfileThemeVars, DARK_MODE_VARS } from '../lib/theme';

export const PublicProfilePage: React.FC = () => {
  const { username = 'anant' } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [reviews] = useState<Review[]>(DEMO_REVIEWS);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  // Page's light/dark mode follows the owner's saved choice (My Page → Design)
  const mode = profile?.theme_mode || 'light';

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      try {
        const prof = await StorageService.getProfileByUsername(username);
        if (prof && isMounted) {
          setProfile(prof);
          const [prods, lnks] = await Promise.all([
            StorageService.getProducts(prof.id),
            StorageService.getLinks(prof.id),
          ]);
          if (isMounted) {
            setProducts(prods);
            setLinks(lnks);
            // Record Page View
            StorageService.recordAnalyticsEvent(prof.id, 'page_view', {
              referrer: document.referrer || 'direct',
              path: window.location.pathname,
            });
          }
        }
      } catch (err) {
        console.error('Error loading public profile:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-full bg-zinc-200 animate-pulse mb-4" />
        <div className="h-5 w-44 bg-zinc-200 animate-pulse rounded-md mb-2" />
        <div className="h-3.5 w-28 bg-zinc-200 animate-pulse rounded-md" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center mb-4 text-zinc-400">
          <QrIcon className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-zinc-900 mb-1">Business Page Not Found</h1>
        <p className="text-sm text-zinc-500 max-w-sm mb-6">
          The business username "<span className="font-mono text-zinc-800">{username}</span>" doesn't have an active page yet or may have been renamed.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/anant"
            className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
          >
            View Demo Business (Urban Brew Café)
          </Link>
          <Link
            to="/templates"
            className="px-5 py-2.5 rounded-xl border border-zinc-300 bg-white text-zinc-800 text-xs font-semibold hover:bg-zinc-50 transition-colors"
          >
            Claim linkos.app/{username}
          </Link>
        </div>
      </div>
    );
  }

  const pageTitle = `${profile.business_name} — ${profile.category || 'Official Business Page'}`;
  const pageDescription = profile.description || `Official page for ${profile.business_name}. Browse products, location, WhatsApp, and contact details.`;
  const canonical = `${window.location.origin}/${profile.username}`;

  return (
    <div
      className={`min-h-screen bg-[var(--lk-bg,#F4F4F5)] text-[var(--lk-text,#18181B)] flex justify-center selection:bg-zinc-900 selection:text-white pb-24 ${mode === 'dark' ? 'lk-dark' : ''}`}
      style={{ ...getProfileThemeVars(profile), ...(mode === 'dark' ? DARK_MODE_VARS : {}) }}
    >
      <SeoHead
        title={pageTitle}
        description={pageDescription}
        ogImage={profile.logo_url || profile.cover_url}
        canonicalUrl={canonical}
      />

      <main
        className="w-full max-w-lg min-h-screen bg-[var(--lk-surface,#fff)] shadow-xl sm:my-6 sm:rounded-3xl border-x sm:border border-[var(--lk-border,#E4E4E7)] overflow-hidden flex flex-col relative"
        style={{ fontFamily: 'var(--lk-font, inherit)' }}
      >
        <TemplateSite
          profile={profile}
          products={products}
          links={links}
          reviews={reviews}
          onSelectProduct={(p) => setSelectedProduct(p)}
          onShare={() => setIsShareOpen(true)}
        />

        {/* Mobile Sticky Quick Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-md border-t border-zinc-200/80 dark:border-white/10 sm:hidden flex gap-2">
          {profile.phone && (
            <a
              href={`tel:${profile.phone.replace(/[^0-9+]/g, '')}`}
              onClick={() => StorageService.recordAnalyticsEvent(profile.id, 'call_click', { source: 'mobile_sticky_bar' })}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-[#111B2E] font-semibold text-xs text-zinc-800 dark:text-zinc-100 active:scale-98 transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Call</span>
            </a>
          )}

          {profile.whatsapp && (
            <a
              href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                profile.whatsapp_message || `Hi ${profile.business_name}, I am reaching out from your LinkOS page!`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => StorageService.recordAnalyticsEvent(profile.id, 'whatsapp_click', { source: 'mobile_sticky_bar' })}
              className="flex-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366] text-white font-semibold text-xs active:scale-98 shadow-sm transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Chat on WhatsApp</span>
            </a>
          )}

          <button
            type="button"
            onClick={() => setIsShareOpen(true)}
            aria-label="Share page"
            className="p-3 rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-[#111B2E] text-zinc-700 dark:text-zinc-200 active:scale-98"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        profile={profile}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Share Dialog */}
      <ShareModal
        profile={profile}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </div>
  );
};
