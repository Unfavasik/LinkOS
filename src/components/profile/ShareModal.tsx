import React, { useState, useEffect } from 'react';
import { X, Copy, Check, MessageCircle, QrCode as QrIcon } from 'lucide-react';
import QRCode from 'qrcode';
import { Profile } from '../../types';
import { StorageService } from '../../lib/storage';

interface ShareModalProps {
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ profile, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [showQr, setShowQr] = useState(false);

  const fullUrl = `${window.location.origin}/${profile.username}`;

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(fullUrl, {
        width: 320,
        margin: 1.5,
        color: { dark: '#18181B', light: '#FFFFFF' },
      }).then(setQrUrl).catch(console.error);
    }
  }, [isOpen, fullUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    StorageService.recordAnalyticsEvent(profile.id, 'share_click', { method: 'copy_link' });
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    StorageService.recordAnalyticsEvent(profile.id, 'share_click', { method: 'whatsapp' });
    const text = `Check out ${profile.business_name} on LinkOS: ${fullUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div
        className="w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl border border-zinc-200 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <h3 className="text-sm font-bold text-zinc-900">Share Business Page</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close share dialog"
            className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-mono text-zinc-700 select-all mb-4">
            <span className="truncate mr-2">{fullUrl}</span>
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded-md hover:bg-zinc-200 text-zinc-600 transition-colors shrink-0"
              title="Copy"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-medium text-xs border border-[#25D366]/20 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Share WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={() => setShowQr(!showQr)}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 text-zinc-800 font-medium text-xs border border-zinc-200 transition-colors"
            >
              <QrIcon className="w-4 h-4" />
              <span>{showQr ? 'Hide QR' : 'Show QR'}</span>
            </button>
          </div>

          {showQr && qrUrl?.trim() && (
            <div className="mt-4 p-3 bg-zinc-50 rounded-xl border border-zinc-200 inline-block animate-in fade-in zoom-in-95">
              <img src={qrUrl.trim()} alt="QR Code" className="w-44 h-44 object-contain mx-auto" />
              <p className="text-[10px] text-zinc-400 mt-1">Scan with any phone camera</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
