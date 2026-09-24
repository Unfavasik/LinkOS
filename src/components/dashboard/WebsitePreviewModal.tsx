import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Pencil, ExternalLink, Loader2 } from 'lucide-react';
import { fetchWebsite, type WebsiteRecord } from '../../lib/websites';
import { StorageService } from '../../lib/storage';
import { TemplateSite } from '../profile/TemplateSite';
import { ProductDetailModal } from '../profile/ProductDetailModal';
import { getProfileThemeVars, DARK_MODE_VARS } from '../../lib/theme';
import { DEMO_REVIEWS } from '../../data/demoData';
import type { Profile, Product, LinkItem, Review } from '../../types';

/** Live preview of a user website (draft or live) rendered with the same
 *  TemplateSite renderer the public /site/:slug page uses, fed from the
 *  website's own content snapshot. Shown in a phone frame so the preview
 *  matches what visitors actually see on mobile. */
export const WebsitePreviewModal: React.FC<{
  websiteId: string;
  onClose: () => void;
}> = ({ websiteId, onClose }) => {
  const [site, setSite] = useState<WebsiteRecord | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      const record = await fetchWebsite(websiteId);
      if (record && isMounted) {
        setSite(record);
        const prods = await StorageService.getProducts(record.id).catch(() => []);
        if (isMounted) setProducts(prods);
      }
      if (isMounted) setLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, [websiteId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const profile = site ? ({ ...site.content, id: site.id, username: site.slug } as Profile) : null;
  const links: LinkItem[] = [];
  const reviews: Review[] = DEMO_REVIEWS;
  const mode = profile?.theme_mode || 'light';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${site?.name ?? 'Website'} live preview`}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-zinc-200 bg-white shrink-0">
          <div className="min-w-0">
            <p className="text-sm font-bold text-zinc-900 truncate">{site?.name || 'Preview'}</p>
            <p className="text-[11px] text-zinc-500 font-mono truncate">linkos.app/{site?.slug}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {site && (
              <Link
                to={`/dashboard/websites/${site.id}/edit`}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-zinc-900 text-[11px] font-bold text-white hover:bg-zinc-800 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </Link>
            )}
            {site?.status === 'live' && (
              <a
                href={`/site/${site.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-zinc-300 text-[11px] font-bold text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Visit
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Phone-frame preview */}
        <div className="flex-1 overflow-y-auto bg-zinc-100 p-4">
          {loading ? (
            <div className="h-full min-h-[420px] flex items-center justify-center text-zinc-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : profile ? (
            <div className="mx-auto w-full max-w-[390px] rounded-[2rem] border-[6px] border-zinc-900 overflow-hidden shadow-xl bg-white">
              <div
                style={{
                  ...(getProfileThemeVars(profile) as React.CSSProperties),
                  ...(mode === 'dark' ? (DARK_MODE_VARS as React.CSSProperties) : {}),
                }}
              >
                <TemplateSite
                  profile={profile}
                  products={products}
                  links={links}
                  reviews={reviews}
                  onSelectProduct={setSelectedProduct}
                  onShare={() => {}}
                />
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[420px] flex items-center justify-center text-sm text-zinc-500">
              Preview unavailable.
            </div>
          )}
        </div>
      </div>

      {selectedProduct && profile && (
        <ProductDetailModal profile={profile} product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
};
