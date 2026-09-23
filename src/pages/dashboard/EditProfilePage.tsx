import React, { useRef, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  ArrowLeft,
  Camera,
  Trash2,
  ChevronDown,
  Link2,
  MapPin,
  Github,
  Instagram,
  Youtube,
  Globe,
  Lock,
  Check,
  Loader2,
} from 'lucide-react';
import { Profile } from '../../types';
import { StorageService } from '../../lib/storage';
import { useUploadProgress, UploadProgressBar } from '../../components/UploadProgressBar';

const COUNTRY_CODES = [
  { code: '+91', flag: '🇮🇳', label: 'India' },
  { code: '+880', flag: '🇧🇩', label: 'Bangladesh' },
  { code: '+1', flag: '🇺🇸', label: 'USA' },
  { code: '+44', flag: '🇬🇧', label: 'UK' },
  { code: '+971', flag: '🇦🇪', label: 'UAE' },
  { code: '+966', flag: '🇸🇦', label: 'Saudi Arabia' },
];

const ROLES = ['Student', 'Business Owner', 'Freelancer', 'Creator', 'Shop Owner', 'Other'];

const inputCls =
  'w-full px-4 py-3 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500 outline-none transition-all';
const labelCls = 'block text-[13px] font-semibold text-slate-700 mb-1.5';

export const EditProfilePage: React.FC = () => {
  const { profile, setProfile } = useOutletContext<{
    profile: Profile | null;
    setProfile: (p: Profile) => void;
  }>();

  // Wait for the async profile load so the form mounts with real values.
  if (!profile) return null;
  return <EditProfileForm key={profile.id} profile={profile} setProfile={setProfile} />;
};

const EditProfileForm: React.FC<{
  profile: Profile;
  setProfile: (p: Profile) => void;
}> = ({ profile, setProfile }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const location = [profile.city, profile.state, profile.country].filter(Boolean).join(', ');

  const [fullName, setFullName] = useState(profile.business_name || '');
  const [email, setEmail] = useState(profile.email || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [role, setRole] = useState(profile.role || '');
  const [website, setWebsite] = useState(profile.website || '');
  const [userLocation, setUserLocation] = useState(location);
  const [github, setGithub] = useState(profile.github || '');
  const [instagram, setInstagram] = useState(profile.instagram || '');
  const [youtube, setYoutube] = useState(profile.youtube || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '');

  const [countryCode, setCountryCode] = useState(() => {
    const match = (profile.phone || '').match(/^(\+\d{1,3})/);
    return match ? match[1] : '+91';
  });
  const [saving, setSaving] = useState(false);
  const up = useUploadProgress();
  const uploading = up.active;
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initials = (fullName || 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const stripCode = (value: string) => value.replace(/^(\+\d{1,3})\s?/, '').trim();

  const handleCountryChange = (code: string) => {
    setCountryCode(code);
    setPhone(`${code} ${stripCode(phone)}`.trim());
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value.startsWith('+') ? value : `${countryCode} ${value}`.trim());
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const url = await up.run('Processing photo…', (report) => StorageService.uploadImage(file, 'avatars', report));
      setAvatarUrl(url);
    } catch (err: any) {
      setError(err.message || 'Failed to upload photo.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const parts = userLocation.split(',').map((s) => s.trim());
      const updated: Profile = {
        ...profile,
        business_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        role: role.trim(),
        website: website.trim(),
        github: github.trim(),
        instagram: instagram.trim(),
        youtube: youtube.trim(),
        avatar_url: avatarUrl,
        city: parts[0] || '',
        state: parts[1] || '',
        country: parts[2] || profile.country || 'India',
        updated_at: new Date().toISOString(),
      };
      const savedProfile = await StorageService.saveProfile(updated);
      setProfile(savedProfile);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto pb-24 lg:pb-8">
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-7 text-slate-900">
        {/* Header */}
        <div className="flex items-center gap-3 mb-1">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="lg:hidden p-1.5 -ml-1.5 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-extrabold tracking-tight">Edit Your Profile</h1>
        </div>
        <p className="text-[13px] leading-relaxed text-slate-500 text-pretty">
          Keep your information up to date. This helps customers trust your business.
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success toast */}
        {saved && (
          <div
            role="status"
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm font-semibold shadow-2xl animate-[toast-in_0.25s_ease-out]"
          >
            <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-white" strokeWidth="3" />
            </span>
            User profile updated
          </div>
        )}

        {/* Profile photo */}
        <div className="mt-6 flex items-center gap-5">
          <div className="relative shrink-0">
            {avatarUrl?.trim() ? (
              <img
                src={avatarUrl.trim()}
                alt={`${fullName || 'User'} profile photo`}
                className="w-20 h-20 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-lg font-extrabold text-white">
                {initials}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Change profile photo"
              className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-white hover:bg-blue-500 transition-colors"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handlePhotoChange}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="w-full text-sm font-bold text-slate-800">Profile Photo</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 text-[13px] font-semibold hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              <Camera className="w-4 h-4" /> Change Photo
            </button>
            <UploadProgressBar {...up} tone="light" className="w-full" />
            {avatarUrl && (
              <button
                type="button"
                onClick={() => setAvatarUrl('')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-red-500 text-[13px] font-semibold hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Remove
              </button>
            )}
          </div>
        </div>

        {/* Form */}
        <form
          className="mt-7 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div>
            <label htmlFor="ep-name" className={labelCls}>
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="ep-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className={inputCls}
            />
          </div>

          <div>
            <label htmlFor="ep-email" className={labelCls}>
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              {/* Email is locked: it is the login identity and cannot be changed here. */}
              <input
                id="ep-email"
                type="email"
                readOnly
                value={email}
                placeholder="you@example.com"
                aria-describedby="ep-email-locked"
                className={`${inputCls} pr-24 bg-slate-50 text-slate-500 cursor-not-allowed select-none focus:ring-0 focus:border-slate-200`}
              />
              {email && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-600">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Check className="w-2 h-2 text-white" strokeWidth="3" />
                  </span>
                  Verified
                </span>
              )}
            </div>
            <p id="ep-email-locked" className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-400">
              <Lock className="w-3 h-3" />
              Your email is locked and cannot be changed.
            </p>
          </div>

          <div>
            <label htmlFor="ep-phone" className={labelCls}>
              Phone Number
            </label>
            <div className="flex gap-2">
              <div className="relative shrink-0">
                <select
                  aria-label="Country code"
                  value={countryCode}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="appearance-none h-full pl-3 pr-8 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500 outline-none cursor-pointer"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              <input
                id="ep-phone"
                type="tel"
                value={stripCode(phone)}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="98765 43210"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label htmlFor="ep-bio" className={labelCls}>
              Bio / About You
            </label>
            <textarea
              id="ep-bio"
              rows={3}
              maxLength={200}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell customers about yourself..."
              className={`${inputCls} resize-none leading-relaxed`}
            />
            <p className="mt-1 text-right text-[11px] text-slate-400">{bio.length}/200</p>
          </div>

          <div>
            <label htmlFor="ep-role" className={labelCls}>
              Role
            </label>
            <div className="relative">
              <select
                id="ep-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={`${inputCls} appearance-none pr-10 cursor-pointer`}
              >
                <option value="">Select your role</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label htmlFor="ep-location" className={labelCls}>
              Location <span className="font-normal text-slate-400">(Optional)</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                id="ep-location"
                type="text"
                value={userLocation}
                onChange={(e) => setUserLocation(e.target.value)}
                placeholder="City, State, Country"
                className={`${inputCls} pl-10`}
              />
            </div>
          </div>

          {/* Social links */}
          <div>
            <p className="text-[13px] font-bold text-slate-800 mb-2.5">Social Links</p>
            <div className="space-y-2.5">
              {[
                { Icon: Github, label: 'GitHub URL', value: github, set: setGithub, placeholder: 'https://github.com/username' },
                { Icon: Instagram, label: 'Instagram URL', value: instagram, set: setInstagram, placeholder: 'https://instagram.com/username' },
                { Icon: Youtube, label: 'YouTube URL', value: youtube, set: setYoutube, placeholder: 'https://youtube.com/@yourchannel' },
                { Icon: Globe, label: 'Website URL', value: website, set: setWebsite, placeholder: 'https://yourwebsite.com' },
              ].map(({ Icon, label, value, set, placeholder }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                    <Icon className="w-4.5 h-4.5 text-slate-700" />
                  </span>
                  <input
                    type="url"
                    aria-label={label}
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    placeholder={placeholder}
                    className={inputCls}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Security note */}
          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-blue-50 border border-blue-100">
            <span className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <Lock className="w-4.5 h-4.5 text-white" />
            </span>
            <div>
              <p className="text-sm font-bold text-blue-700">Your information is secure</p>
              <p className="text-[12px] text-blue-600/80 leading-snug">
                We never share your personal information with anyone.
              </p>
            </div>
          </div>

          {/* Save */}
          <button
            type="submit"
            disabled={saving || uploading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-600/25 transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4" /> Profile Updated
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
