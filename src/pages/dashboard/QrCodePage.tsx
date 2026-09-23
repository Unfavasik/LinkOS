import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Download,
  Printer,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Share2,
} from 'lucide-react';
import { Profile } from '../../types';
import { QrCodeCard } from '../../components/common/QrCodeCard';

export const QrCodePage: React.FC = () => {
  const { profile } = useOutletContext<{ profile: Profile | null }>();
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!profile) {
    return (
      <div className="p-8 text-center text-xs text-zinc-500">
        Loading QR Code generator...
      </div>
    );
  }

  const username = profile.username || 'anant';
  const fullUrl = `${window.location.origin}/${username}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const canvas = document.getElementById('qr-code-svg-canvas') as HTMLCanvasElement;
    if (!canvas) {
      alert('QR canvas ready. Right-click or long-press on mobile to save.');
      return;
    }
    const a = document.createElement('a');
    a.download = `linkos-${username}-qr.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">QR Code & Counter Standee</h1>
          <p className="text-xs text-zinc-500">
            Generate high-resolution printable QR codes for shop counters, vehicle stickers, and packaging.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-700 shadow-2xs transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-zinc-500" />}
            <span>{copied ? 'Copied' : 'Copy URL'}</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Standee Card</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Card Standee Preview & Print Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Standee Card Preview (Printable Area) */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="w-full max-w-sm">
            {/* The printable standee card component */}
            <div id="printable-standee-section">
              <QrCodeCard profile={profile} />
            </div>
          </div>
        </div>

        {/* Right: How to use & Placement Guide */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-2xs">
            <h3 className="text-sm font-bold text-zinc-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Counter Standee Best Practices
            </h3>
            <ul className="space-y-2.5 text-xs text-zinc-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 mt-1.5 shrink-0" />
                <span>
                  <strong>Billing Counter:</strong> Place an acrylic standee next to your UPI payment code so customers scan while waiting.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 mt-1.5 shrink-0" />
                <span>
                  <strong>Packaging & Carry Bags:</strong> Print stickers on cardboard boxes or bags for repeated customer re-orders.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 mt-1.5 shrink-0" />
                <span>
                  <strong>Vehicle Decals:</strong> Workshop owners can print QR stickers on rear windscreens for drive-by discovery.
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-2xs">
            <h3 className="text-sm font-bold text-zinc-900 mb-2">Direct Link</h3>
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 font-mono text-xs text-zinc-800 break-all select-all">
              {fullUrl}
            </div>
            <p className="text-[11px] text-zinc-400 mt-2">
              Encodes automatic UTM tags for tracking physical QR scans in your Analytics tab.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
