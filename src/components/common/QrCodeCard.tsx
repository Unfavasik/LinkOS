import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, Download, Printer, ExternalLink, QrCode as QrIcon } from 'lucide-react';
import { Profile } from '../../types';

interface QrCodeCardProps {
  profile: Profile;
  compact?: boolean;
}

export const QrCodeCard: React.FC<QrCodeCardProps> = ({ profile, compact = false }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const fullUrl = `${window.location.origin}/${profile.username}`;

  useEffect(() => {
    QRCode.toDataURL(fullUrl, {
      width: 480,
      margin: 1.5,
      color: {
        dark: '#111827',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url: string) => setQrDataUrl(url))
      .catch((err: Error) => console.error('QR code generation error:', err));
  }, [fullUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${profile.username}-linkos-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    window.print();
  };

  if (compact) {
    return (
      <div className="flex flex-col items-center bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs">
        {qrDataUrl?.trim() ? (
          <img
            src={qrDataUrl.trim()}
            alt={`QR code for ${profile.business_name}`}
            className="w-28 h-28 object-contain rounded-md"
          />
        ) : (
          <div className="w-28 h-28 bg-zinc-100 animate-pulse rounded-md flex items-center justify-center">
            <QrIcon className="w-6 h-6 text-zinc-400" />
          </div>
        )}
        <span className="text-xs font-mono text-zinc-500 mt-2 truncate max-w-[140px]">
          linkos.app/{profile.username}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 md:p-8 shadow-xs max-w-xl mx-auto">
      {/* Printable Card Area */}
      <div
        ref={printRef}
        className="p-6 md:p-8 border border-zinc-200 rounded-xl bg-gradient-to-b from-zinc-50/60 to-white text-center flex flex-col items-center"
      >
        {/* Business Logo or Badge */}
        {profile.logo_url?.trim() ? (
          <img
            src={profile.logo_url.trim()}
            alt={profile.business_name}
            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-xs mb-3"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xl font-bold mb-3">
            {profile.business_name.charAt(0)}
          </div>
        )}

        <h3 className="text-xl font-bold text-zinc-900 tracking-tight">
          {profile.business_name}
        </h3>
        <p className="text-xs text-zinc-500 mt-0.5 max-w-xs">
          {profile.category} • {profile.city}, {profile.state}
        </p>

        {/* QR Code Graphic */}
        <div className="my-5 p-3 bg-white rounded-xl shadow-xs border border-zinc-200 inline-block">
          {qrDataUrl?.trim() ? (
            <img
              src={qrDataUrl.trim()}
              alt={`QR Code for ${profile.business_name}`}
              className="w-48 h-48 md:w-56 md:h-56 object-contain"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center bg-zinc-50 animate-pulse">
              <QrIcon className="w-10 h-10 text-zinc-300" />
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Scan to view products & WhatsApp
          </p>
          <div className="inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 bg-zinc-100 rounded-full text-xs font-mono text-zinc-800">
            <span>linkos.app/{profile.username}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-sm font-medium text-zinc-800 transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-zinc-500" />}
          <span>{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>

        <button
          type="button"
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-sm font-medium text-zinc-800 transition-colors"
        >
          <Download className="w-4 h-4 text-zinc-500" />
          <span>Download PNG</span>
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-sm font-medium text-white transition-colors shadow-xs"
        >
          <Printer className="w-4 h-4" />
          <span>Print Standee</span>
        </button>
      </div>

      <div className="mt-4 text-center">
        <a
          href={fullUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <span>Open public link in new tab</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
