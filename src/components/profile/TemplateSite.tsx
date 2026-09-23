import React from 'react';
import {
  MessageCircle,
  Phone,
  Navigation,
  MapPin,
  Clock,
  Star,
  ChevronRight,
  Share2,
  Sparkles,
  Check,
  Link2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Profile, Product, LinkItem, Review } from '../../types';
import { StorageService } from '../../lib/storage';
import { getTemplateById } from '../../data/templates';
import { ProductCard } from './ProductCard';
import { LinksList } from './LinksList';
import { ReviewsSection } from './ReviewsSection';
import { BusinessInfoCard } from './BusinessInfoCard';
import { QueueWidget } from './QueueWidget';
import {
  TerminalLayout, EditorialLayout, StorybookLayout, AuroraLayout, SwissLayout,
  VelvetLayout, BonfireLayout, DarkroomLayout, GraphiteLayout, BentoLayout,
  BlueprintLayout, BrutalLayout, NotebookLayout, StickerLayout, LinenLayout,
  CandyLayout, MonoLayout, DuskLayout, ForestLayout, MarketLayout,
  CafeProLayout, GarageProLayout, GodiProLayout,
} from './DesignLanguageLayouts';

interface TemplateSiteProps {
  profile: Profile;
  products: Product[];
  links: LinkItem[];
  reviews: Review[];
  onSelectProduct: (p: Product) => void;
  onShare: () => void;
}

const whatsappHref = (profile: Profile) =>
  `https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    profile.whatsapp_message || `Hi ${profile.business_name}, I am reaching out from your LinkOS page!`
  )}`;

const telHref = (profile: Profile) => `tel:${profile.phone.replace(/[^0-9+]/g, '')}`;

const mapsHref = (profile: Profile) =>
  profile.google_maps_url ||
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    [profile.address, profile.city, profile.state].filter(Boolean).join(', ') || profile.business_name
  )}`;

function track(profile: Profile, event: Parameters<typeof StorageService.recordAnalyticsEvent>[1], source: string) {
  StorageService.recordAnalyticsEvent(profile.id, event, { source }).catch(() => {});
}

export function ActionRow({ profile, shape }: { profile: Profile; shape: Profile['button_style'] }) {
  const radius = shape === 'pill' ? '9999px' : shape === 'sharp' ? '6px' : '14px';
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {profile.whatsapp && (
        <a
          href={whatsappHref(profile)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track(profile, 'whatsapp_click', 'action_row')}
          className="flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white text-xs font-bold shadow-sm hover:opacity-90 active:scale-[0.98] transition-all"
          style={{ borderRadius: radius }}
        >
          <MessageCircle className="w-4 h-4 fill-current" />
          WhatsApp
        </a>
      )}
      {profile.phone && (
        <a
          href={telHref(profile)}
          onClick={() => track(profile, 'call_click', 'action_row')}
          className="flex items-center justify-center gap-2 py-3 bg-[var(--lk-accent,#18181B)] text-[var(--lk-accent-text,#fff)] text-xs font-bold shadow-sm hover:opacity-90 active:scale-[0.98] transition-all"
          style={{ borderRadius: radius }}
        >
          <Phone className="w-4 h-4" />
          Call
        </a>
      )}
      <a
        href={mapsHref(profile)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track(profile, 'directions_click', 'action_row')}
        className="flex items-center justify-center gap-2 py-3 bg-[var(--lk-surface,#fff)] border border-[var(--lk-border,#E4E4E7)] text-[var(--lk-text,#27272A)] text-xs font-bold hover:opacity-85 active:scale-[0.98] transition-all"
        style={{ borderRadius: radius }}
      >
        <Navigation className="w-4 h-4" />
        Directions
      </a>
    </div>
  );
}

function SectionTitle({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lk-text,#18181B)] flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5" />
        {children}
      </h2>
      {count !== undefined && <span className="text-[11px] text-[var(--lk-sub,#A1A1AA)] font-medium">{count} items</span>}
    </div>
  );
}

export function QueueSection({ profile }: { profile: Profile }) {
  if (!profile.queue_enabled || !profile.services?.length) return null;
  const template = getTemplateById(profile.template_id);
  return (
    <div className="max-w-md mx-auto w-full px-4 py-2">
      <QueueWidget profile={profile} queueLabel={template?.queue_label} />
    </div>
  );
}

function ProductGrid({ profile, products, onSelectProduct }: Pick<TemplateSiteProps, 'profile' | 'products' | 'onSelectProduct'>) {  if (products.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-[var(--lk-bg,#FAFAFA)] border border-dashed border-[var(--lk-border,#E4E4E7)] text-center">
        <p className="text-xs text-[var(--lk-sub,#71717A)]">No products published yet.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} profile={profile} onSelectProduct={onSelectProduct} />
      ))}
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto pt-8 pb-10 text-center border-t border-[var(--lk-border,#F4F4F5)]">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-900 transition-colors group"
      >
  <span>Powered by</span>
  <Link2 className="w-3.5 h-3.5 -rotate-45 text-zinc-400 group-hover:text-zinc-600 transition-colors" aria-hidden="true" />
  <span className="font-semibold text-zinc-900 group-hover:underline">LinkOS</span>
      </Link>
      <p className="text-[10px] text-zinc-400 mt-1">Create your free mobile business page in 3 minutes</p>
    </footer>
  );
}

export function ShareCard({ profile, onShare }: { profile: Profile; onShare: () => void }) {
  return (
    <div className="p-3.5 rounded-xl bg-[var(--lk-bg,#FAFAFA)] border border-[var(--lk-border,#E4E4E7)] flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[var(--lk-accent,#18181B)] text-[var(--lk-accent-text,#fff)] flex items-center justify-center">
          <Share2 className="w-4 h-4" />
        </div>
        <div className="text-left">
          <h4 className="text-xs font-bold text-[var(--lk-text,#18181B)]">Scan or Share Page</h4>
          <p className="text-[11px] text-[var(--lk-sub,#71717A)]">Instant digital card & standee</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onShare}
        className="px-3 py-1.5 rounded-lg bg-[var(--lk-surface,#fff)] border border-[var(--lk-border,#E4E4E7)] text-xs font-medium text-[var(--lk-text,#27272A)] hover:opacity-80 shadow-2xs transition-all"
      >
        Share QR
      </button>
    </div>
  );
}

/* Shared "Our Services" checklist — fed by the owner's service tags */
function ServicesCard({ profile }: { profile: Profile }) {
  const fallbackTags = ['Dine-in', 'Takeaway', 'Home Delivery', 'Birthday & Event Bookings', 'Custom Orders', 'Free WiFi'];
  const tags = profile.service_tags?.length
    ? profile.service_tags
    : profile.services?.length
      ? profile.services.map((s) => s.name)
      : fallbackTags;
  return (
    <section className="py-2 max-w-md mx-auto w-full px-4">
      <SectionTitle>Our Services</SectionTitle>
      <ul className="p-4 rounded-2xl bg-[var(--lk-surface,#fff)] border border-[var(--lk-border,#E4E4E7)] grid grid-cols-1 sm:grid-cols-2 gap-2">
        {tags.slice(0, 8).map((s) => (
          <li key={s} className="flex items-center gap-2 text-[13px] font-medium text-[var(--lk-text,#27272A)]">
            <span className="w-4 h-4 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
              <Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
            </span>
            {s}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------------- Layout: CLASSIC ---------------- */
function ClassicLayout({ profile, products, links, reviews, onSelectProduct, onShare }: TemplateSiteProps) {
  const initials = profile.business_name.charAt(0).toUpperCase();
  return (
    <div className="flex flex-col min-h-full">
      <ProfileBlock profile={profile} onShare={onShare} initials={initials} />
      <div className="px-4 max-w-md mx-auto w-full">
        <ActionRow profile={profile} shape={profile.button_style} />
      </div>
      <QueueSection profile={profile} />
      <section className="px-4 py-5 mt-2 max-w-md mx-auto w-full">
        <SectionTitle count={products.length}>Products & Catalog</SectionTitle>
        <ProductGrid profile={profile} products={products} onSelectProduct={onSelectProduct} />
      </section>
      <ServicesCard profile={profile} />
      {links.length > 0 && (
        <section className="py-2 max-w-md mx-auto w-full px-4">
          <SectionTitle>Social & Online Profiles</SectionTitle>
          <LinksList links={links} profile={profile} />
        </section>
      )}
      <div className="max-w-md mx-auto w-full px-4">
        <ReviewsSection reviews={reviews} />
        <div className="py-3"><BusinessInfoCard profile={profile} /></div>
        <ShareCard profile={profile} onShare={onShare} />
      </div>
      <SiteFooter />
    </div>
  );
}

function ProfileBlock({ profile, onShare, initials }: { profile: Profile; onShare: () => void; initials: string }) {
  return (
    <div className="pt-10 pb-6 px-4 text-center">
      <div className="relative inline-block">
        {profile.logo_url?.trim() ? (
          <img
            src={profile.logo_url.trim()}
            alt={profile.business_name}
            className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-md ring-1 ring-zinc-200"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-[var(--lk-accent,#18181B)] text-[var(--lk-accent-text,#fff)] flex items-center justify-center text-2xl font-bold border-2 border-white shadow-md ring-1 ring-zinc-200">
            {initials}
          </div>
        )}
        <button
          type="button"
          onClick={onShare}
          aria-label="Share page"
          className="absolute -right-1 bottom-0 p-2 rounded-full bg-white border border-zinc-200 shadow-sm text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <h1 className="mt-4 text-xl sm:text-2xl font-bold tracking-tight text-[var(--lk-text,#18181B)]">
        {profile.business_name}
      </h1>
      <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs sm:text-sm text-[var(--lk-sub,#71717A)]">
        {profile.category && <span className="font-medium text-[var(--lk-text,#3F3F46)]">{profile.category}</span>}
        {profile.verified && (
          <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold">
            <Star className="w-3 h-3 fill-current" /> Verified
          </span>
        )}
        {(profile.city || profile.state) && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {[profile.city, profile.state].filter(Boolean).join(', ')}
          </span>
        )}
      </div>
      {profile.description && (
        <p className="mt-2.5 text-xs sm:text-sm text-[var(--lk-sub,#52525B)] max-w-md mx-auto leading-relaxed">
          {profile.description}
        </p>
      )}
    </div>
  );
}

/* ---------------- Layout: BANNER ---------------- */
function BannerLayout({ profile, products, links, reviews, onSelectProduct, onShare }: TemplateSiteProps) {
  return (
    <div className="flex flex-col min-h-full">
      {/* Accent hero band */}
      <div className="relative px-5 pt-12 pb-16 bg-[var(--lk-accent,#18181B)] text-[var(--lk-accent-text,#fff)]">
        <button
          type="button"
          onClick={onShare}
          aria-label="Share page"
          className="absolute top-4 right-4 p-2 rounded-full bg-white/15 hover:bg-white/25 text-current transition-colors"
        >
          <Share2 className="w-4 h-4" />
        </button>
        {profile.logo_url?.trim() ? (
          <img
            src={profile.logo_url.trim()}
            alt={profile.business_name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-white/30 shadow-lg mb-4"
          />
        ) : null}
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-80">{profile.category}</p>
        <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight leading-tight max-w-sm">
          {profile.business_name}
        </h1>
        {profile.description && (
          <p className="mt-2 text-xs sm:text-sm opacity-85 leading-relaxed max-w-md">{profile.description}</p>
        )}
        {(profile.city || profile.state) && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold bg-white/15 rounded-full px-3 py-1">
            <MapPin className="w-3 h-3" />
            {[profile.city, profile.state].filter(Boolean).join(', ')}
          </p>
        )}
      </div>

      {/* Overlapping action card */}
      <div className="px-4 -mt-8 max-w-md mx-auto w-full">
        <div className="p-3 rounded-2xl bg-[var(--lk-surface,#fff)] border border-[var(--lk-border,#E4E4E7)] shadow-lg">
          <ActionRow profile={profile} shape={profile.button_style} />
        </div>
      </div>
      <QueueSection profile={profile} />

      <section className="px-4 py-6 max-w-md mx-auto w-full">
        <SectionTitle count={products.length}>Products & Catalog</SectionTitle>
        <ProductGrid profile={profile} products={products} onSelectProduct={onSelectProduct} />
      </section>
      <ServicesCard profile={profile} />
      {links.length > 0 && (
        <section className="px-4 pb-2 max-w-md mx-auto w-full">
          <SectionTitle>Find Us Online</SectionTitle>
          <LinksList links={links} profile={profile} />
        </section>
      )}
      <div className="max-w-md mx-auto w-full px-4">
        <ReviewsSection reviews={reviews} />
        <div className="py-3"><BusinessInfoCard profile={profile} /></div>
        <ShareCard profile={profile} onShare={onShare} />
      </div>
      <SiteFooter />
    </div>
  );
}

/* ---------------- Layout: SPLIT ---------------- */
function SplitLayout({ profile, products, links, reviews, onSelectProduct, onShare }: TemplateSiteProps) {
  return (
    <div className="flex flex-col min-h-full">
      {/* Split hero: identity left, info card right */}
      <div className="grid sm:grid-cols-2 gap-0 border-b border-[var(--lk-border,#E4E4E7)]">
        <div className="p-6 sm:p-8 flex flex-col justify-center">
          {profile.logo_url?.trim() ? (
            <img src={profile.logo_url.trim()} alt={profile.business_name} className="w-12 h-12 rounded-xl object-cover mb-3" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-[var(--lk-accent,#18181B)] text-[var(--lk-accent-text,#fff)] flex items-center justify-center text-lg font-bold mb-3">
              {profile.business_name.charAt(0).toUpperCase()}
            </div>
          )}
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--lk-sub,#71717A)]">{profile.category}</p>
          <h1 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-[var(--lk-text,#18181B)] leading-snug">
            {profile.business_name}
          </h1>
          {profile.description && (
            <p className="mt-2 text-xs text-[var(--lk-sub,#52525B)] leading-relaxed">{profile.description}</p>
          )}
          <div className="mt-4">
            <ActionRow profile={profile} shape={profile.button_style} />
          </div>
        </div>
        <div className="p-6 sm:p-8 bg-[var(--lk-bg,#FAFAFA)] border-t sm:border-t-0 sm:border-l border-[var(--lk-border,#E4E4E7)] flex flex-col justify-center gap-3 text-xs">
          {(profile.address || profile.city) && (
            <a
              href={mapsHref(profile)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track(profile, 'directions_click', 'split_info')}
              className="flex items-start gap-2.5 group"
            >
              <MapPin className="w-4 h-4 mt-0.5 text-[var(--lk-accent,#18181B)] shrink-0" />
              <span className="text-[var(--lk-sub,#52525B)] group-hover:text-[var(--lk-text,#18181B)] group-hover:underline">
                {[profile.address, profile.city, profile.state].filter(Boolean).join(', ')}
              </span>
            </a>
          )}
          {profile.phone && (
            <a href={telHref(profile)} onClick={() => track(profile, 'call_click', 'split_info')} className="flex items-center gap-2.5 hover:underline">
              <Phone className="w-4 h-4 text-[var(--lk-accent,#18181B)] shrink-0" />
              <span className="text-[var(--lk-sub,#52525B)]">{profile.phone}</span>
            </a>
          )}
          {profile.whatsapp && (
            <a href={whatsappHref(profile)} target="_blank" rel="noopener noreferrer" onClick={() => track(profile, 'whatsapp_click', 'split_info')} className="flex items-center gap-2.5 hover:underline">
              <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" />
              <span className="text-[var(--lk-sub,#52525B)]">WhatsApp us anytime</span>
            </a>
          )}
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-[var(--lk-accent,#18181B)] shrink-0" />
            <span className="text-[var(--lk-sub,#52525B)]">Open daily · 9 AM – 9 PM</span>
          </div>
          <button
            type="button"
            onClick={onShare}
            className="mt-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[var(--lk-accent,#18181B)] text-[var(--lk-accent-text,#fff)] text-[11px] font-bold hover:opacity-90 transition-opacity"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share this page
          </button>
        </div>
      </div>
      <QueueSection profile={profile} />

      <section className="px-4 py-6 max-w-md mx-auto w-full">
        <SectionTitle count={products.length}>Products & Catalog</SectionTitle>
        <ProductGrid profile={profile} products={products} onSelectProduct={onSelectProduct} />
      </section>
      {links.length > 0 && (
        <section className="px-4 pb-2 max-w-md mx-auto w-full">
          <SectionTitle>Online Profiles</SectionTitle>
          <LinksList links={links} profile={profile} />
        </section>
      )}
      <div className="max-w-md mx-auto w-full px-4">
        <ReviewsSection reviews={reviews} />
        <div className="py-3"><BusinessInfoCard profile={profile} /></div>
      </div>
      <SiteFooter />
    </div>
  );
}

/* ---------------- Layout: MINIMAL ---------------- */
function MinimalLayout({ profile, products, links, reviews, onSelectProduct, onShare }: TemplateSiteProps) {
  return (
    <div className="flex flex-col min-h-full">
      <div className="px-5 sm:px-8 pt-14 pb-8 max-w-xl mx-auto w-full">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--lk-sub,#A1A1AA)]">{profile.category}</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight leading-[1.1] text-[var(--lk-text,#18181B)]">
              {profile.business_name}
            </h1>
          </div>
          <button
            type="button"
            onClick={onShare}
            aria-label="Share page"
            className="p-2.5 rounded-full border border-[var(--lk-border,#E4E4E7)] text-[var(--lk-sub,#52525B)] hover:text-[var(--lk-text,#18181B)] transition-colors shrink-0"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
        {profile.description && (
          <p className="mt-4 text-sm text-[var(--lk-sub,#52525B)] leading-relaxed max-w-md">{profile.description}</p>
        )}
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--lk-sub,#52525B)]">
          {profile.phone && (
            <a href={telHref(profile)} onClick={() => track(profile, 'call_click', 'minimal')} className="inline-flex items-center gap-1.5 hover:text-[var(--lk-text,#18181B)] hover:underline">
              <Phone className="w-3.5 h-3.5" /> {profile.phone}
            </a>
          )}
          {profile.whatsapp && (
            <a href={whatsappHref(profile)} target="_blank" rel="noopener noreferrer" onClick={() => track(profile, 'whatsapp_click', 'minimal')} className="inline-flex items-center gap-1.5 hover:text-[var(--lk-text,#18181B)] hover:underline">
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </a>
          )}
          <a href={mapsHref(profile)} target="_blank" rel="noopener noreferrer" onClick={() => track(profile, 'directions_click', 'minimal')} className="inline-flex items-center gap-1.5 hover:text-[var(--lk-text,#18181B)] hover:underline">
            <MapPin className="w-3.5 h-3.5" /> Google Maps
          </a>
        </div>
      </div>

      <QueueSection profile={profile} />

      {/* Products as editorial list rows */}
      <section className="px-5 sm:px-8 pb-6 max-w-xl mx-auto w-full">
        <div className="border-t border-[var(--lk-border,#E4E4E7)] pt-5">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--lk-sub,#A1A1AA)] mb-2">
            Catalog — {products.length}
          </h2>
        </div>
        {products.length === 0 ? (
          <p className="py-6 text-xs text-[var(--lk-sub,#71717A)]">No products published yet.</p>
        ) : (
          <div className="divide-y divide-[var(--lk-border,#F4F4F5)]">
            {products.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => onSelectProduct(product)}
                className="w-full py-4 flex items-center justify-between gap-4 text-left group"
              >
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-[var(--lk-text,#18181B)] group-hover:opacity-70 transition-opacity">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-xs text-[var(--lk-sub,#71717A)] mt-0.5 line-clamp-1">{product.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-[var(--lk-text,#18181B)]">
                    {product.currency === 'INR' ? '₹' : product.currency === 'USD' ? '$' : ''}{product.price}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[var(--lk-sub,#A1A1AA)] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {links.length > 0 && (
        <section className="px-5 sm:px-8 pb-6 max-w-xl mx-auto w-full">
          <div className="border-t border-[var(--lk-border,#E4E4E7)] pt-5">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--lk-sub,#A1A1AA)] mb-3">Elsewhere</h2>
            <LinksList links={links} profile={profile} />
          </div>
        </section>
      )}

      <div className="px-5 sm:px-8 pb-4 max-w-xl mx-auto w-full">
        <ReviewsSection reviews={reviews} />
        <div className="py-3"><BusinessInfoCard profile={profile} /></div>
      </div>
      <SiteFooter />
    </div>
  );
}

/* ---------------- Layout: BOLD ---------------- */
function BoldLayout({ profile, products, links, reviews, onSelectProduct, onShare }: TemplateSiteProps) {
  return (
    <div className="flex flex-col min-h-full">
      {/* Oversized accent header */}
      <div className="px-5 pt-12 pb-8 bg-[var(--lk-accent,#18181B)] text-[var(--lk-accent-text,#fff)]">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] opacity-80">{profile.category}</p>
          <button
            type="button"
            onClick={onShare}
            aria-label="Share page"
            className="p-2 rounded-lg bg-white/15 hover:bg-white/25 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
        <h1 className="mt-3 text-4xl sm:text-5xl font-black tracking-tighter leading-[0.95] uppercase max-w-md">
          {profile.business_name}
        </h1>
        {profile.description && (
          <p className="mt-3 text-xs sm:text-sm opacity-85 leading-relaxed max-w-md">{profile.description}</p>
        )}
        <div className="mt-5">
          <ActionRow profile={profile} shape={profile.button_style} />
        </div>
      </div>

      {/* Category strip */}
      <div className="px-5 py-2.5 bg-[var(--lk-bg,#FAFAFA)] border-b border-[var(--lk-border,#E4E4E7)] overflow-x-auto [scrollbar-width:none]">
        <div className="flex gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--lk-sub,#71717A)] whitespace-nowrap">
          <span>Products</span>
          <span>·</span>
          <span>Contact</span>
          <span>·</span>
          <span>Location</span>
          <span>·</span>
          <span>Reviews</span>
        </div>
      </div>
      <QueueSection profile={profile} />

      <section className="px-4 py-6 max-w-md mx-auto w-full">
        <SectionTitle count={products.length}>Products & Catalog</SectionTitle>
        <ProductGrid profile={profile} products={products} onSelectProduct={onSelectProduct} />
      </section>
      {links.length > 0 && (
        <section className="px-4 pb-2 max-w-md mx-auto w-full">
          <SectionTitle>Follow & Connect</SectionTitle>
          <LinksList links={links} profile={profile} />
        </section>
      )}
      <div className="max-w-md mx-auto w-full px-4">
        <ReviewsSection reviews={reviews} />
        <div className="py-3"><BusinessInfoCard profile={profile} /></div>
        <ShareCard profile={profile} onShare={onShare} />
      </div>
      <SiteFooter />
    </div>
  );
}

/* ---------------- Dispatcher ---------------- */
const TemplateSiteLayout: React.FC<TemplateSiteProps> = (props) => {
  const template = getTemplateById(props.profile.template_id);
  switch (template?.layout) {
    case 'banner':
      return <BannerLayout {...props} />;
    case 'split':
      return <SplitLayout {...props} />;
    case 'minimal':
      return <MinimalLayout {...props} />;
    case 'bold':
      return <BoldLayout {...props} />;
    case 'terminal':
      return <TerminalLayout {...props} />;
    case 'editorial':
      return <EditorialLayout {...props} />;
    case 'storybook':
      return <StorybookLayout {...props} />;
    case 'aurora':
      return <AuroraLayout {...props} />;
    case 'swiss':
      return <SwissLayout {...props} />;
    case 'velvet':
      return <VelvetLayout {...props} />;
    case 'bonfire':
      return <BonfireLayout {...props} />;
    case 'darkroom':
      return <DarkroomLayout {...props} />;
    case 'graphite':
      return <GraphiteLayout {...props} />;
    case 'bento':
      return <BentoLayout {...props} />;
    case 'blueprint':
      return <BlueprintLayout {...props} />;
    case 'brutal':
      return <BrutalLayout {...props} />;
    case 'notebook':
      return <NotebookLayout {...props} />;
    case 'sticker':
      return <StickerLayout {...props} />;
    case 'linen':
      return <LinenLayout {...props} />;
    case 'candy':
      return <CandyLayout {...props} />;
    case 'mono':
      return <MonoLayout {...props} />;
    case 'dusk':
      return <DuskLayout {...props} />;
    case 'forest':
      return <ForestLayout {...props} />;
    case 'market':
      return <MarketLayout {...props} />;
    case 'cafe':
      return <CafeProLayout {...props} />;
    case 'garage':
      return <GarageProLayout {...props} />;
    case 'godi':
      return <GodiProLayout {...props} />;
    case 'classic':
    default:
      return <ClassicLayout {...props} />;
  }
};

/**
 * Wraps the layout with the page's light/dark mode from the owner's saved
 * choice (profile.theme_mode, set in My Page → Design → Appearance Mode).
 */
export const TemplateSite: React.FC<TemplateSiteProps> = (props) => {
  const mode = props.profile.theme_mode || 'light';

  return (
    <div className={mode === 'dark' ? 'lk-dark' : undefined}>
      <TemplateSiteLayout {...props} />
    </div>
  );
};
