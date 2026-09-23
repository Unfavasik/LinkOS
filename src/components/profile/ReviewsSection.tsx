import React from 'react';
import { Star } from 'lucide-react';
import { Review } from '../../types';

interface ReviewsSectionProps {
  reviews: Review[];
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews }) => {
  if (!reviews || reviews.length === 0) return null;

  return (
    <div className="px-4 py-3 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--lk-text,#18181B)]">
            Verified Reviews
          </span>
          <div className="flex items-center text-amber-500">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="text-xs font-semibold text-[var(--lk-text,#27272A)] ml-1">5.0</span>
          </div>
        </div>
        <span className="text-[11px] text-zinc-400 font-medium">
          {reviews.length} reviews
        </span>
      </div>

      <div className="space-y-2">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="p-3 bg-[var(--lk-surface,#fff)] rounded-xl border border-[var(--lk-border,#E4E4E7)] shadow-2xs text-left"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-[var(--lk-text,#18181B)]">
                {review.author_name}
              </span>
              <div className="flex items-center gap-0.5 text-amber-500">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current" />
                ))}
              </div>
            </div>
            <p className="text-xs text-[var(--lk-sub,#52525B)] leading-relaxed">
              "{review.text}"
            </p>
            <span className="text-[10px] text-[var(--lk-sub,#A1A1AA)] mt-1 block">
              {review.date}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
