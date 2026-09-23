import React from 'react';
import {
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Globe,
  Utensils,
  ShoppingBag,
  Bike,
  CalendarDays,
  Wifi,
  Settings,
  Coffee,
  Truck,
  Wrench,
  Scissors,
  Sparkles,
  Heart,
  Star,
  Store,
  type LucideIcon,
} from 'lucide-react';

/* ---------------- Toggle switch ---------------- */

const TOGGLE_COLORS = {
  blue: 'bg-blue-600',
  green: 'bg-emerald-500',
  red: 'bg-red-500',
} as const;

export const Toggle: React.FC<{
  checked: boolean;
  onChange: (v: boolean) => void;
  color?: keyof typeof TOGGLE_COLORS;
  label?: string;
}> = ({ checked, onChange, color = 'blue', label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${checked ? TOGGLE_COLORS[color] : 'bg-zinc-300'}`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : ''}`}
    />
  </button>
);

/* ---------------- Tip / info box ---------------- */

export const TipBox: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
}> = ({ icon, title, children, className }) => (
  <div className={`p-3.5 rounded-xl bg-blue-50/80 border border-blue-100 flex gap-3 ${className || ''}`}>
    <span className="text-blue-600 shrink-0 mt-0.5">{icon}</span>
    <div className="min-w-0">
      <p className="text-xs font-bold text-blue-900">{title}</p>
      <p className="text-[11px] text-blue-700/90 leading-relaxed mt-0.5">{children}</p>
    </div>
  </div>
);

/* ---------------- Stars ---------------- */

export const StarRating: React.FC<{ rating: number; className?: string }> = ({ rating, className }) => (
  <span className={`inline-flex text-amber-400 ${className || ''}`} aria-label={`${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? 'fill-amber-400' : 'fill-zinc-200 text-zinc-200'}`} />
    ))}
  </span>
);

export const StarInput: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => (
  <span className="inline-flex gap-0.5" role="radiogroup" aria-label="Rating">
    {[1, 2, 3, 4, 5].map((i) => (
      <button key={i} type="button" role="radio" aria-checked={value === i} aria-label={`${i} star${i > 1 ? 's' : ''}`} onClick={() => onChange(i)} className="p-0.5">
        <Star className={`w-5 h-5 transition-colors ${i <= value ? 'fill-amber-400 text-amber-400' : 'text-zinc-300 hover:text-amber-300'}`} />
      </button>
    ))}
  </span>
);

/* ---------------- Social platforms ---------------- */

export interface SocialPlatform {
  key: string;
  label: string;
  prefix: string;
  placeholder: string;
}

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { key: 'instagram', label: 'Instagram', prefix: 'https://instagram.com/', placeholder: 'https://instagram.com/urbanbrew' },
  { key: 'facebook', label: 'Facebook', prefix: 'https://facebook.com/', placeholder: 'https://facebook.com/urbanbrew' },
  { key: 'youtube', label: 'YouTube', prefix: 'https://youtube.com/', placeholder: 'https://youtube.com/@urbanbrew' },
  { key: 'whatsapp', label: 'WhatsApp', prefix: 'https://wa.me/', placeholder: 'https://wa.me/919876543210' },
  { key: 'twitter', label: 'X (Twitter)', prefix: 'https://twitter.com/', placeholder: 'https://twitter.com/urbanbrew' },
  { key: 'linkedin', label: 'LinkedIn', prefix: 'https://linkedin.com/company/', placeholder: 'https://linkedin.com/company/urbanbrew' },
  { key: 'tiktok', label: 'TikTok', prefix: 'https://tiktok.com/@', placeholder: 'https://tiktok.com/@urbanbrew' },
  { key: 'website', label: 'Website', prefix: 'https://', placeholder: 'https://www.urbanbrew.in' },
];

const WhatsAppIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
);

const XIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TikTokIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

const BRAND_STYLES: Record<string, { bg: string; icon: React.FC<{ className?: string }> }> = {
  instagram: { bg: 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]', icon: (p) => <Instagram {...p} /> },
  facebook: { bg: 'bg-[#1877F2]', icon: (p) => <Facebook {...p} /> },
  youtube: { bg: 'bg-[#FF0000]', icon: (p) => <Youtube {...p} /> },
  whatsapp: { bg: 'bg-[#25D366]', icon: (p) => <WhatsAppIcon {...p} /> },
  twitter: { bg: 'bg-black', icon: (p) => <XIcon {...p} /> },
  linkedin: { bg: 'bg-[#0A66C2]', icon: (p) => <Linkedin {...p} /> },
  tiktok: { bg: 'bg-black', icon: (p) => <TikTokIcon {...p} /> },
  website: { bg: 'bg-zinc-800', icon: (p) => <Globe {...p} /> },
};

export const BrandIcon: React.FC<{ platform: string; className?: string; iconClassName?: string }> = ({
  platform,
  className = 'w-8 h-8 rounded-lg',
  iconClassName = 'w-4 h-4 text-white',
}) => {
  const brand = BRAND_STYLES[platform] || BRAND_STYLES.website;
  const Icon = brand.icon;
  return (
    <span className={`${className} ${brand.bg} flex items-center justify-center shrink-0`}>
      <Icon className={iconClassName} />
    </span>
  );
};

/* ---------------- Service icons ---------------- */

export const SERVICE_ICONS: Record<string, LucideIcon> = {
  utensils: Utensils,
  bag: ShoppingBag,
  bike: Bike,
  calendar: CalendarDays,
  wifi: Wifi,
  settings: Settings,
  coffee: Coffee,
  truck: Truck,
  wrench: Wrench,
  scissors: Scissors,
  sparkles: Sparkles,
  heart: Heart,
  store: Store,
};

export const SERVICE_ICON_KEYS = Object.keys(SERVICE_ICONS);
