import React from 'react';
import { MessageCircle, Sparkles } from 'lucide-react';
import { Product, Profile } from '../../types';
import { StorageService } from '../../lib/storage';

interface ProductCardProps {
  product: Product;
  profile: Profile;
  onSelectProduct?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  profile,
  onSelectProduct,
}) => {
  const handleEnquire = (e: React.MouseEvent) => {
    e.stopPropagation();
    StorageService.recordAnalyticsEvent(profile.id, 'product_click', {
      product_id: product.id,
      product_name: product.name,
      price: product.price,
    });

    if (!profile.whatsapp) return;
    const cleanNumber = profile.whatsapp.replace(/[^0-9]/g, '');
    const text = `Hi ${profile.business_name}! I am interested in: *${product.name}* (Price: ${product.currency}${product.price.toLocaleString()}). Could you share more details?`;
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCardClick = () => {
    StorageService.recordAnalyticsEvent(profile.id, 'product_click', {
      product_id: product.id,
      product_name: product.name,
      action: 'view_details',
    });
    onSelectProduct?.(product);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col bg-[var(--lk-surface,#fff)] rounded-xl border border-[var(--lk-border,#E4E4E7)] overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer text-left"
    >
      {/* Product Image */}
      <div className="relative aspect-4/3 sm:aspect-16/10 w-full overflow-hidden bg-zinc-100">
        {product.image_url?.trim() ? (
          <img
            src={product.image_url.trim()}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">
            No image
          </div>
        )}

        {/* Featured Tag */}
        {product.featured && (
          <div className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-900/90 backdrop-blur-xs text-white text-[11px] font-medium shadow-xs">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Featured</span>
          </div>
        )}

        {/* Category Pill */}
        {product.category && (
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-zinc-800 text-[10px] font-medium border border-zinc-200/60 shadow-2xs">
            {product.category}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold text-[var(--lk-text,#18181B)] group-hover:opacity-80 line-clamp-1">
            {product.name}
          </h3>
          <span className="text-sm font-bold text-[var(--lk-text,#18181B)] whitespace-nowrap">
            {product.currency}
            {product.price.toLocaleString()}
          </span>
        </div>

        {product.description && (
          <p className="mt-1 text-xs text-[var(--lk-sub,#71717A)] line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Action button */}
        <div className="mt-3 pt-2.5 border-t border-[var(--lk-border,#F4F4F5)] flex items-center justify-between">
          <span className="text-[11px] text-[var(--lk-sub,#A1A1AA)] font-medium">
            {product.available ? 'In stock' : 'Out of stock'}
          </span>

          <button
            type="button"
            onClick={handleEnquire}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--lk-accent,#18181B)] hover:opacity-85 text-[var(--lk-accent-text,#fff)] text-xs font-medium transition-all shadow-2xs active:scale-97"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Enquire</span>
          </button>
        </div>
      </div>
    </div>
  );
};
