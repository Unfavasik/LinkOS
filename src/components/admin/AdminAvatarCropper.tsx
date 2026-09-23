import React, { useEffect, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { X, ZoomIn, Loader2, Check } from 'lucide-react';
import { cropToWebp } from '../../lib/imageConvert';

interface AdminAvatarCropperProps {
  file: File;
  onCancel: () => void;
  /** Receives the cropped, WebP-encoded file ready for upload. */
  onConfirm: (webpFile: File) => void;
}

/**
 * Full-screen crop step for the admin avatar upload.
 * Lets the admin pan and zoom the image inside a circular frame before it is
 * exported as a square WebP and handed back for upload.
 */
export const AdminAvatarCropper: React.FC<AdminAvatarCropperProps> = ({
  file,
  onCancel,
  onConfirm,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  // Created in an effect (not a ref initializer) so StrictMode's simulated
  // unmount gets a fresh URL on remount instead of a revoked one.
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    setError('');
    try {
      const webpFile = await cropToWebp(file, croppedAreaPixels, { maxSize: 512 });
      onConfirm(webpFile);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not crop the image.');
      setProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col bg-[#0A1120]/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Crop profile picture"
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h2 className="text-[14px] font-bold text-white">Frame your picture</h2>
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          aria-label="Cancel cropping"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      <div className="relative flex-1 min-h-0">
        {imageUrl && (
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            restrictPosition
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_area, areaPixels) => setCroppedAreaPixels(areaPixels)}
            objectFit="horizontal-cover"
            classes={{ containerClassName: 'bg-transparent' }}
          />
        )}
      </div>

      <div className="px-5 pb-6 pt-4 space-y-4">
        <div className="flex items-center gap-3">
          <ZoomIn className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            disabled={processing}
            aria-label="Zoom"
            className="w-full h-1.5 rounded-full appearance-none bg-white/15 accent-blue-500 cursor-pointer disabled:opacity-50"
          />
        </div>

        {error && <p className="text-[12px] text-red-400 text-center">{error}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={processing}
            className="flex-1 h-11 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-60 text-[13px] font-semibold text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={processing || !croppedAreaPixels}
            className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-[13px] font-bold text-white flex items-center justify-center gap-2 transition-colors"
          >
            {processing ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <Check className="w-4 h-4" aria-hidden="true" />
            )}
            {processing ? 'Processing...' : 'Use This Photo'}
          </button>
        </div>
      </div>
    </div>
  );
};
