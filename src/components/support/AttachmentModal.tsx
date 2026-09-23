import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, CloudUpload, FileText, FileVideo, Paperclip, Plus, X } from 'lucide-react';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB per file

const FILE_TYPES = [
  { label: 'Images', accept: 'image/*', icon: FileText },
  { label: 'Documents', accept: '.pdf,.doc,.docx,.txt', icon: FileText },
  { label: 'Videos', accept: 'video/*', icon: FileVideo },
  { label: 'Other Files', accept: '*', icon: FileText },
];

export const formatSize = (bytes: number) => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
};

const FileImageThumbnail: React.FC<{ file: File }> = ({ file }) => {
  const [src, setSrc] = useState<string>('');

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  if (!src) {
    return <span className="w-12 h-12 rounded-lg bg-slate-100 shrink-0" />;
  }

  return (
    <img
      src={src}
      alt=""
      className="w-12 h-12 rounded-lg object-cover border border-slate-100 shrink-0"
    />
  );
};

/**
 * "Add Attachment" dialog for the ticket reply box — drag & drop or pick a
 * file type, review selected files, then confirm with Done.
 */
export const AttachmentModal: React.FC<{
  open: boolean;
  initialFiles: File[];
  onDone: (files: File[]) => void;
  onClose: () => void;
}> = ({ open, initialFiles, onDone, onClose }) => {
  const [files, setFiles] = useState<File[]>(initialFiles);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [accept, setAccept] = useState<string>('');

  // Reset state when opening
  useEffect(() => {
    if (open) {
      setFiles(initialFiles);
      setError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const addFiles = (incoming: FileList | File[] | null) => {
    if (!incoming) return;
    const next: File[] = [];
    for (const f of Array.from(incoming)) {
      if (f.size > MAX_SIZE) {
        setError(`"${f.name}" is larger than 5MB. Please choose a smaller file.`);
        continue;
      }
      next.push(f);
    }
    if (next.length) {
      setError('');
      setFiles((prev) => {
        const seen = new Set(prev.map((p) => `${p.name}:${p.size}`));
        return [...prev, ...next.filter((n) => !seen.has(`${n.name}:${n.size}`))];
      });
    }
  };

  const pickType = (type: (typeof FILE_TYPES)[number]) => {
    setAccept(type.accept);
    // Reset so picking the same file twice still fires onChange.
    if (inputRef.current) inputRef.current.value = '';
    requestAnimationFrame(() => inputRef.current?.click());
  };

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1526]/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Add attachment"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3.5 p-5 pb-4">
          <span className="flex w-11 h-11 rounded-xl bg-blue-50 items-center justify-center shrink-0">
            <Paperclip className="w-5 h-5 text-blue-600" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-[19px] font-bold text-slate-900">Add Attachment</h2>
            <p className="mt-0.5 text-[12px] leading-relaxed text-slate-500">
              Upload files, images or screenshots to help us understand your issue better.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors shrink-0"
          >
            <X className="w-4.5 h-4.5" aria-hidden="true" />
          </button>
        </div>

        <div className="px-5 pb-5">
          {files.length === 0 ? (
            /* Empty state — drop zone + file type shortcuts */
            <>
              <div
                role="button"
                tabIndex={0}
                aria-label="Upload files"
                onClick={() => pickType(FILE_TYPES[0])}
                onKeyDown={(e) => e.key === 'Enter' && pickType(FILE_TYPES[0])}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  addFiles(e.dataTransfer.files);
                }}
                className={`rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors cursor-pointer ${
                  dragOver ? 'border-blue-500 bg-blue-50' : 'border-blue-200 bg-blue-50/50 hover:bg-blue-50'
                }`}
              >
                <span className="mx-auto flex w-12 h-12 rounded-full bg-white shadow-sm items-center justify-center">
                  <CloudUpload className="w-6 h-6 text-blue-500" aria-hidden="true" />
                </span>
                <p className="mt-3 text-[14px] font-bold text-slate-900">Drag &amp; drop files here</p>
                <p className="text-[12.5px] text-slate-500">
                  or <span className="text-blue-600 font-semibold">click to browse</span>
                </p>
                <p className="mt-2 text-[11.5px] text-slate-400">Supports images, videos, PDF, and documents</p>
                <p className="text-[11.5px] text-slate-400">Max file size: 5MB per file</p>
              </div>

              <div className="my-4 flex items-center gap-3" aria-hidden="true">
                <span className="h-px flex-1 bg-slate-200" />
                <span className="text-[11.5px] text-slate-400">Or choose a file</span>
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {FILE_TYPES.map((type) => (
                  <button
                    key={type.label}
                    type="button"
                    onClick={() => pickType(type)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-4 flex flex-col items-center gap-2 text-slate-600 hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-600 transition-colors"
                  >
                    <type.icon className="w-5 h-5" aria-hidden="true" />
                    <span className="text-[12px] font-semibold">{type.label}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* Files selected — list + add more */
            <>
              <ul className="space-y-2.5">
                {files.map((f, i) => (
                  <li
                    key={`${f.name}:${f.size}:${i}`}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
                  >
                    {f.type.startsWith('image/') ? (
                      <FileImageThumbnail file={f} />
                    ) : (
                      <span className="flex w-12 h-12 rounded-lg bg-slate-100 items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-slate-500" aria-hidden="true" />
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold text-slate-900 truncate">{f.name}</p>
                      <p className="text-[11.5px] text-slate-400">{formatSize(f.size)}</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" aria-hidden="true" />
                    <button
                      type="button"
                      aria-label={`Remove ${f.name}`}
                      onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors shrink-0"
                    >
                      <X className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>

              <div
                role="button"
                tabIndex={0}
                aria-label="Add more files"
                onClick={() => pickType(FILE_TYPES[0])}
                onKeyDown={(e) => e.key === 'Enter' && pickType(FILE_TYPES[0])}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  addFiles(e.dataTransfer.files);
                }}
                className={`mt-3 rounded-xl border-2 border-dashed px-6 py-5 text-center transition-colors cursor-pointer ${
                  dragOver ? 'border-blue-500 bg-blue-50' : 'border-blue-200 bg-blue-50/50 hover:bg-blue-50'
                }`}
              >
                <span className="mx-auto flex w-9 h-9 rounded-full bg-white shadow-sm items-center justify-center">
                  <Plus className="w-5 h-5 text-blue-500" aria-hidden="true" />
                </span>
                <p className="mt-2 text-[13px] font-bold text-slate-900">Add More Files</p>
                <p className="text-[11.5px] text-slate-400">You can upload multiple files (Max 5MB each)</p>
              </div>
            </>
          )}

          {error && (
            <p role="alert" className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-[12px] font-medium text-red-600">
              {error}
            </p>
          )}

          {/* Footer */}
          <div className="mt-5 flex items-center justify-between gap-3">
            <p className="text-[12px] text-slate-500">
              {files.length > 0 && (
                <>
                  {files.length} file{files.length > 1 ? 's' : ''} selected
                  {totalSize > 0 && ` (${formatSize(totalSize)})`}
                </>
              )}
            </p>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="h-10 px-5 rounded-xl border border-slate-200 bg-white text-[12.5px] font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDone(files);
                  onClose();
                }}
                className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 transition text-[12.5px] font-bold text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>

        {/* Hidden input shared by the drop zone and type shortcuts */}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept === '*' ? undefined : accept}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>
    </div>
  );
};
