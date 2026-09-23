import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, Loader2, Check } from 'lucide-react';
import { StorageService } from '../../lib/storage';
import { useUploadProgress, UploadProgressBar } from '../UploadProgressBar';
import { AdminAvatarCropper } from './AdminAvatarCropper';
import { updateAdminProfile, type AdminRecord } from '../../lib/adminAuth';

interface AdminEditProfileModalProps {
  open: boolean;
  admin: AdminRecord | null;
  onClose: () => void;
  onSaved: (admin: AdminRecord) => void;
}

export const AdminEditProfileModal: React.FC<AdminEditProfileModalProps> = ({
  open,
  admin,
  onClose,
  onSaved,
}) => {
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const up = useUploadProgress();
  const uploading = up.active;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(admin?.display_name || '');
      setAvatarUrl(admin?.avatar_url || null);
      setError('');
      setSaved(false);
      setPendingFile(null);
    }
  }, [open, admin]);

  if (!open) return null;

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (JPG, PNG, WebP, etc.).');
      return;
    }
    setError('');
    // Open the crop step; the WebP conversion + upload happen on confirm.
    setPendingFile(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleCropConfirm = async (webpFile: File) => {
    setPendingFile(null);
    try {
      const url = await up.run('Processing photo…', (report) => StorageService.uploadImage(webpFile, 'avatars', report));
      setAvatarUrl(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    }
  };

  const handleSave = async () => {
    const user = StorageService.getActiveUser();
    if (!admin?.id || !user) {
      setError('Admin session not found. Please log in again.');
      return;
    }
    setSaving(true);
    setError('');
    const updated = await updateAdminProfile(admin.id, {
      display_name: name.trim() || undefined,
      avatar_url: avatarUrl,
    });
    setSaving(false);
    if (!updated) {
      setError('Could not save profile. Please try again.');
      return;
    }
    setSaved(true);
    onSaved(updated);
    setTimeout(onClose, 700);
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Edit admin profile"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-[#0A1120] border border-white/10 shadow-2xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-bold text-white">Edit Profile</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Name */}
        <label htmlFor="admin-display-name" className="block text-[12px] font-semibold text-slate-300 mb-1.5">
          Display Name
        </label>
        <input
          id="admin-display-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Asik Ikbal"
          maxLength={60}
          className="w-full h-10 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-[13px] text-white placeholder:text-slate-500 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
        />

        {/* Avatar picker */}
        <div className="flex flex-col items-center gap-2 mt-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            aria-label="Upload avatar"
            className="relative group w-20 h-20 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/60"
          >
            {avatarUrl?.trim() ? (
              <img
                src={avatarUrl.trim()}
                alt="Admin avatar"
                className="w-20 h-20 rounded-full object-cover ring-2 ring-blue-500/40"
              />
            ) : (
              <span className="w-20 h-20 rounded-full bg-blue-600/20 ring-2 ring-blue-500/40 flex items-center justify-center text-2xl font-bold text-blue-300">
                {(name || admin?.email || 'A').charAt(0).toUpperCase()}
              </span>
            )}
            <span className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {uploading ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" aria-hidden="true" />
              ) : (
                <Camera className="w-5 h-5 text-white" aria-hidden="true" />
              )}
            </span>
          </button>
          <p className="text-[11px] text-slate-500">
            {uploading ? 'Uploading...' : 'Click the avatar to upload — crop, then saved as WebP'}
          </p>
          <UploadProgressBar {...up} className="w-full" />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>

        {pendingFile && (
          <AdminAvatarCropper
            file={pendingFile}
            onCancel={() => setPendingFile(null)}
            onConfirm={handleCropConfirm}
          />
        )}

        {error && <p className="mt-2 text-[12px] text-red-400">{error}</p>}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || uploading}
          className="mt-4 w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-[13px] font-bold text-white flex items-center justify-center gap-2 transition-colors"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : saved ? (
            <Check className="w-4 h-4" aria-hidden="true" />
          ) : null}
          {saved ? 'Saved' : saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};
