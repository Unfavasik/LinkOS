import React from 'react';
import { X, MessageCircle, Phone, Sparkles } from 'lucide-react';
import { Product, Profile } from '../../types';
import { StorageService } from '../../lib/storage';

interface ProductDetailModalProps {
  product: Product | null;
  profile: Profile;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  profile,
  onClose,
}) => {
  if (!product) return null;

  const handleWhatsAppEnquiry = () => {
    StorageService.recordAnalyticsEvent(profile.id, 'product_click', {
      product_id: product.id,
      product_name: product.name,
      action: 'modal_enquiry',
    });

    if (!profile.whatsapp) return;
    const cleanNumber = profile.whatsapp.replace(/[^0-9]/g, '');
    const message = `Hello ${profile.business_name}! I am interested in ordering/inquiring about *${product.name}* (Price: ${product.currency}${product.price.toLocaleString()}). Please let me know availability and fitting schedule.`;
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCall = () => {
    StorageService.recordAnalyticsEvent(profile.id, 'call_click', {
      source: 'product_modal',
      product_id: product.id,
    });
    if (profile.phone) {
      window.location.href = `tel:${profile.phone.replace(/[^0-9+]/g, '')}`;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl border border-zinc-200/80 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close */}
        <div className="relative">
          {product.image_url?.trim() ? (
            <div className="aspect-16/10 w-full bg-zinc-100 relative overflow-hidden">
              <img
                src={product.image_url.trim()}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
            </div>
          ) : (
            <div className="h-24 bg-zinc-100 flex items-center justify-center text-zinc-400 text-xs">
              No product image
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-xs transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {product.featured && (
            <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-900/90 backdrop-blur-xs text-white text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Featured Product</span>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 text-left">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                {product.category || 'Product'}
              </span>
              <h2 className="text-lg font-bold text-zinc-900 mt-0.5 leading-snug">
                {product.name}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-zinc-900">
                {product.currency}
                {product.price.toLocaleString()}
              </span>
              <div className="text-[11px] text-zinc-500 font-medium mt-0.5">
                {product.available ? 'Available' : 'Out of stock'}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-100">
            <h4 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">
              Description & Details
            </h4>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              {product.description || 'Contact business owner for full specifications and custom fit options.'}
            </p>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-zinc-50 border border-zinc-100 text-xs text-zinc-600 flex items-center justify-between">
            <span>Sold by: <strong className="text-zinc-900">{profile.business_name}</strong></span>
            <span className="text-zinc-400">{profile.city}</span>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex gap-2.5">
          <button
            type="button"
            onClick={handleCall}
            className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-semibold transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>Call</span>
          </button>

          <button
            type="button"
            onClick={handleWhatsAppEnquiry}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>Enquire on WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
