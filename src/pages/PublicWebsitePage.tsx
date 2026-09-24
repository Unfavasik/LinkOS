import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { fetchLiveWebsiteBySlug } from '../lib/websites';
import { StorageService } from '../lib/storage';
import { TemplateSite } from '../components/profile/TemplateSite';
import { ProductDetailModal } from '../components/profile/ProductDetailModal';
import { ShareModal } from '../components/profile/ShareModal';
import { SeoHead } from '../components/common/SeoHead';
import { getProfileThemeVars, DARK_MODE_VARS } from '../lib/theme';
import { DEMO_REVIEWS } from '../data/demoData';
import type { Profile, Product, LinkItem, Review } from '../types';

/** Public renderer for user-created websites (websites table, /site/:slug).
 *  Reuses the same TemplateSite renderer as profile pages, fed from the
 *  website's own content snapshot. */
export const PublicWebsitePage: React.FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [links] = useState<LinkItem[]>([]);
  const [reviews] = useState<Review[]>(DEMO_REVIEWS);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      const site = await fetchLiveWebsiteBySlug(slug);
      if (site && isMounted) {
        const prof = { ...site.content, id: site.id, username: site.slug } as Profile;
        setProfile(prof);
        const prods = await StorageService.getProducts(site.id).catch(() => []);
        if (isMounted) setProducts(prods);
        StorageService.recordAnalyticsEvent(site.id, 'page_view', {
          referrer: document.referrer || 'direct',
          path: window.location.pathname,
        }).catch(() => {});
      }
      if (isMounted) setLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, [slug]);

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
          <Globe className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-zinc-900 mb-1">Website Not Found</h1>
        <p className="text-sm text-zinc-500 max-w-sm mb-6">
          No published website lives at <span className="font-mono text-zinc-800">linkos.app/{slug}</span> — it may be a draft or the address may be wrong.
        </p>
        <Link
          to="/templates"
          className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
        >
          Browse Templates
        </Link>
      </div>
    );
  }

  const mode = profile?.theme_mode || 'light';

  return (
    <div
      style={{
        ...(getProfileThemeVars(profile) as React.CSSProperties),
        ...(mode === 'dark' ? (DARK_MODE_VARS as React.CSSProperties) : {}),
      }}
      className="min-h-screen"
    >
      <SeoHead
        title={`${profile.business_name} — ${profile.category || 'Official Business Page'}`}
        description={profile.description || `Official page for ${profile.business_name}.`}
        canonicalUrl={`${window.location.origin}/site/${slug}`}
      />
      <TemplateSite
        profile={profile}
        products={products}
        links={links}
        reviews={reviews}
        onSelectProduct={setSelectedProduct}
        onShare={() => setIsShareOpen(true)}
      />
      {selectedProduct && (
        <ProductDetailModal profile={profile} product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
      {isShareOpen && (
        <ShareModal profile={profile} isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
      )}
    </div>
  );
};
