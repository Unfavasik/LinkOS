import React from 'react';
import { Lock, Crown, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/** Shown when a free user taps "Use this Template" on a Pro template. */
export const ProPaywallModal: React.FC<{
  templateName: string;
  templateId?: string;
  onClose: () => void;
}> = ({ templateName, templateId, onClose }) => {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal="true" aria-label="Premium template required">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full sm:max-w-sm bg-[#0A1322] border border-white/10 rounded-t-2xl sm:rounded-2xl p-6 text-center shadow-2xl">
        <button type="button" onClick={onClose} aria-label="Close dialog" className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors">
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
        <span className="mx-auto w-14 h-14 rounded-2xl bg-amber-400/15 text-amber-400 flex items-center justify-center">
          <Crown className="w-7 h-7" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-lg font-extrabold text-white">Premium Template</h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-slate-400">
          <span className="font-semibold text-slate-200">{templateName}</span> is a Pro template. Buy Premium to unlock it, then use it right away.
        </p>
        <button
          type="button"
          onClick={() => navigate(`/pricing?template=${templateId || ''}`)}
          className="mt-5 w-full h-11 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#1A1400] text-[14px] font-extrabold inline-flex items-center justify-center gap-2 transition-colors"
        >
          <Lock className="w-4 h-4" aria-hidden="true" />
          Buy Premium
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
        <button type="button" onClick={onClose} className="mt-2.5 w-full h-10 rounded-xl text-[13px] font-semibold text-slate-400 hover:text-white transition-colors">
          Maybe later
        </button>
      </div>
    </div>
  );
};
