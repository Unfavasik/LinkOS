import React, { useEffect, useState } from 'react';
import { Download, FileImage, FileText, X } from 'lucide-react';
import { formatSize } from './AttachmentModal';
import type { TicketAttachment } from '../../lib/supportTickets';

export interface RenderAttachment {
  name: string;
  sizeLabel: string;
  /** Stored image source — data URL (or a storage public/signed URL). */
  dataUrl?: string;
  isImage: boolean;
}

const IMAGE_EXT_RE = /\.(jpe?g|png|gif|webp|bmp|svg)$/i;
// Older replies stored attachment names as a trailing "Attachments: a.jpg (98 KB)"
// text line (singular "Attachment:" on the first ticket message).
const LEGACY_ATTACH_RE = /\n(?:Attachments?):\s*([^\n]+)\s*$/;

const isImageName = (name: string, type?: string) =>
  (type || '').startsWith('image/') || IMAGE_EXT_RE.test(name);

/**
 * Split legacy attachment text lines back out of a message so they render as
 * file cards, and merge them with structured attachments saved on newer replies.
 */
export function splitMessageAttachments(
  message: string,
  structured?: TicketAttachment[],
): { text: string; attachments: RenderAttachment[] } {
  const attachments: RenderAttachment[] = (structured || []).map((a) => ({
    name: a.name,
    sizeLabel: formatSize(a.size),
    dataUrl: a.dataUrl,
    isImage: isImageName(a.name, a.type),
  }));

  const match = message.match(LEGACY_ATTACH_RE);
  let text = message;
  if (match) {
    text = message.slice(0, match.index).trimEnd();
    for (const entry of match[1].split(', ').filter(Boolean)) {
      const m = entry.match(/^(.*?) \(([^)]+)\)$/);
      const name = m ? m[1] : entry;
      const sizeLabel = m ? m[2] : '';
      if (attachments.some((a) => a.name === name)) continue;
      attachments.push({ name, sizeLabel, isImage: isImageName(name) });
    }
  }
  return { text, attachments };
}

const DownloadButton: React.FC<{ attachment: RenderAttachment; dark?: boolean }> = ({ attachment, dark }) => {
  if (!attachment.dataUrl) return null;
  return (
    <a
      href={attachment.dataUrl}
      download={attachment.name}
      aria-label={`Download ${attachment.name}`}
      title={`Download ${attachment.name}`}
      onClick={(e) => e.stopPropagation()}
      className={`flex w-8 h-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
        dark
          ? 'border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
          : 'border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600'
      }`}
    >
      <Download className="w-4 h-4" aria-hidden="true" />
    </a>
  );
};

const FileCard: React.FC<{ attachment: RenderAttachment; dark?: boolean }> = ({ attachment: a, dark }) => (
  <li className="flex items-center gap-2.5">
    <span
      className={`flex w-20 h-20 rounded-lg items-center justify-center border shrink-0 ${
        dark ? 'border-white/10 bg-white/[0.04]' : 'border-slate-200 bg-slate-50'
      }`}
    >
      {a.isImage ? (
        <FileImage className="w-6 h-6 text-blue-500" aria-hidden="true" />
      ) : (
        <FileText className="w-6 h-6 text-blue-500" aria-hidden="true" />
      )}
    </span>
    <span className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl border px-3.5 py-2.5 ${dark ? 'border-white/10 bg-white/[0.04]' : 'border-slate-200 bg-white'}`}>
      <FileText className="w-4.5 h-4.5 text-blue-500 shrink-0" aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className={`block truncate text-[12.5px] font-bold ${dark ? 'text-slate-100' : 'text-slate-800'}`}>
          {a.name}
        </span>
        <span className="block text-[11px] text-slate-400">{a.sizeLabel}</span>
      </span>
      <DownloadButton attachment={a} dark={dark} />
    </span>
  </li>
);

/**
 * Full-screen lightbox for image attachments. Closes on backdrop click,
 * the close button, or Escape.
 */
const Lightbox: React.FC<{ attachment: RenderAttachment; onClose: () => void }> = ({ attachment: a, onClose }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${a.name} — full size preview`}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-4 sm:p-8 cursor-zoom-out"
    >
      <button
        type="button"
        aria-label="Close preview"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
      >
        <X className="w-5 h-5" aria-hidden="true" />
      </button>
      <figure onClick={(e) => e.stopPropagation()} className="flex max-h-full max-w-full flex-col items-center gap-3 cursor-default">
        {a.dataUrl?.trim() && (
          <img
            src={a.dataUrl.trim()}
            alt={`${a.name} — full size preview`}
            className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
          />
        )}
        <figcaption className="max-w-full truncate rounded-full bg-white/10 px-4 py-1.5 text-[12px] font-semibold text-slate-100 backdrop-blur">
          {a.name} · {a.sizeLabel}
        </figcaption>
      </figure>
    </div>
  );
};

/**
 * Image attachment rendered as a preview card: the image itself in a rounded
 * container, with a filename/size metadata row and a download action below.
 * Falls back to the plain file card while loading or if the image is broken.
 */
const ImageCard: React.FC<{ attachment: RenderAttachment; dark?: boolean }> = ({ attachment: a, dark }) => {
  const [loaded, setLoaded] = useState(false);
  const [broken, setBroken] = useState(false);
  const [zoom, setZoom] = useState(false);

  // Data-URL images can finish loading before React attaches onLoad, so
  // detect already-complete images via the ref instead of an effect reset
  // (an effect would clobber the loaded state back to false).
  const imgRef = (el: HTMLImageElement | null) => {
    if (el && el.complete && el.naturalWidth > 0) setLoaded(true);
  };

  if (broken || !a.dataUrl?.trim()) return <FileCard attachment={a} dark={dark} />;

  return (
    <li className="w-full max-w-[280px]">
      <div
        className={`overflow-hidden rounded-xl border ${dark ? 'border-white/10 bg-white/[0.04]' : 'border-slate-200 bg-white'}`}
      >
        <button
          type="button"
          aria-label={`Open ${a.name} in full screen`}
          onClick={() => setZoom(true)}
          className={`relative block w-full cursor-zoom-in bg-slate-50 ${dark ? 'bg-white/[0.03]' : ''}`}
        >
          <img
            ref={imgRef}
            src={a.dataUrl.trim()}
            alt={`${a.name} preview`}
            onLoad={() => setLoaded(true)}
            onError={() => setBroken(true)}
            className={`h-40 w-full object-contain transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          />
          {!loaded && (
            <span
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center animate-pulse"
            >
              <FileImage className="h-6 w-6 text-slate-300" />
            </span>
          )}
        </button>
        <div
          className={`flex items-center gap-2 border-t px-3 py-2 ${dark ? 'border-white/10' : 'border-slate-100'}`}
        >
          <span className="min-w-0 flex-1">
            <span className={`block truncate text-[12px] font-bold ${dark ? 'text-slate-100' : 'text-slate-800'}`}>
              {a.name}
            </span>
            <span className="block text-[11px] text-slate-400">{a.sizeLabel}</span>
          </span>
          <DownloadButton attachment={a} dark={dark} />
        </div>
      </div>
      {zoom && <Lightbox attachment={a} onClose={() => setZoom(false)} />}
    </li>
  );
};

/**
 * Attachment cards shown under a conversation message — image attachments
 * render as preview cards, everything else as a compact file card.
 */
export const ReplyAttachments: React.FC<{ attachments: RenderAttachment[]; dark?: boolean }> = ({
  attachments,
  dark,
}) => {
  if (attachments.length === 0) return null;
  return (
    <ul className="mt-3 flex flex-col gap-2.5" aria-label="Attached files">
      {attachments.map((a, i) =>
        a.isImage ? (
          <ImageCard key={`${a.name}-${i}`} attachment={a} dark={dark} />
        ) : (
          <FileCard key={`${a.name}-${i}`} attachment={a} dark={dark} />
        ),
      )}
    </ul>
  );
};
