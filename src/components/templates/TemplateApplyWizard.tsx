import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import {
  X,
  ArrowLeft,
  ArrowRight,
  Rocket,
  Store,
  Phone,
  Package,
  Check,
  Copy,
  Download,
  ExternalLink,
  LayoutDashboard,
  QrCode as QrIcon,
  Plus,
  Trash2,
  Loader2,
  Crown,
  Image as ImageIcon,
  Camera,
  Share2,
  Star,
  MapPin,
  GripVertical,
  Pencil,
  Mail,
  Sparkles,
  MessageCircle,
  Upload,
  Briefcase,
  FileText,
} from 'lucide-react';
import { Profile, Product, Review } from '../../types';
import { StorageService } from '../../lib/storage';
import { PageTemplate, TEMPLATE_CATEGORIES } from '../../data/templates';
import { TemplatePreview } from './TemplatePreview';
import { GoogleMapEmbed, buildMapQuery, isValidMapsLink } from '../common/GoogleMapEmbed';
import { Toggle, TipBox, StarRating, StarInput, SOCIAL_PLATFORMS, BrandIcon, SERVICE_ICONS } from './WizardUI';

interface TemplateApplyWizardProps {
  template: PageTemplate;
  existingProfile: Profile | null;
  onClose: () => void;
  onPublished: (profile: Profile) => void;
}

interface ProductDraft {
  name: string;
  price: string;
  offerPrice: string;
  offerOn: boolean;
  category: string;
  description: string;
  image: string;
  available: boolean;
}

interface ServiceDraft {
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
}

interface ReviewDraft {
  author_name: string;
  rating: number;
  text: string;
  date: string;
}

interface SocialDraft {
  platform: string;
  url: string;
  enabled: boolean;
}

const CAFE_DEMO_GALLERY = ['/images/cafe/interior.webp', '/images/cafe/cappuccino.webp', '/images/cafe/cake.webp', '/images/cafe/latte.webp'];

const CAFE_DEMO_PRODUCTS: ProductDraft[] = [
  { name: 'Cappuccino', price: '120', offerPrice: '100', offerOn: true, category: 'Drinks', description: 'Rich & Smooth. A perfect start to your day.', image: '/images/cafe/cappuccino.webp', available: true },
  { name: 'Classic Burger', price: '180', offerPrice: '150', offerOn: true, category: 'Food', description: 'Juicy, delicious and always a favorite.', image: '/images/cafe/burger.webp', available: true },
  { name: 'Chocolate Cake', price: '140', offerPrice: '', offerOn: false, category: 'Desserts', description: 'Rich chocolate with a soft and moist texture.', image: '/images/cafe/cake.webp', available: true },
  { name: 'Iced Latte', price: '130', offerPrice: '110', offerOn: true, category: 'Drinks', description: 'Chilled coffee for a cooler you.', image: '/images/cafe/latte.webp', available: true },
];

const CAFE_DEMO_SERVICES: ServiceDraft[] = [
  { name: 'Dine-in', description: 'Enjoy a cozy dining experience at our cafe.', icon: 'utensils', enabled: true },
  { name: 'Takeaway', description: 'Quick and easy takeaway service.', icon: 'bag', enabled: true },
  { name: 'Home Delivery', description: 'Fresh food delivered to your doorstep.', icon: 'bike', enabled: true },
  { name: 'Event & Party Booking', description: 'Book for birthdays, meetups and events.', icon: 'calendar', enabled: true },
  { name: 'Free WiFi', description: 'High speed WiFi for all customers.', icon: 'wifi', enabled: true },
  { name: 'Custom Orders', description: 'Let us know your special request.', icon: 'settings', enabled: true },
];

const CAFE_DEMO_REVIEWS: ReviewDraft[] = [
  { author_name: 'Rahul Verma', rating: 5, text: 'Amazing coffee and peaceful ambience. The staff is very friendly. Highly recommended!', date: '12 Aug 2024' },
  { author_name: 'Sana Khan', rating: 5, text: 'Love the food! Great taste and beautiful interior. Best cafe in Berhampore!', date: '5 Aug 2024' },
  { author_name: 'Arjun Das', rating: 4, text: 'Nice place to hangout with friends. Cappuccino was excellent!', date: '28 Jul 2024' },
];

const CAFE_DEMO_SOCIAL: SocialDraft[] = [
  { platform: 'instagram', url: 'https://instagram.com/urbanbrew', enabled: true },
  { platform: 'facebook', url: 'https://facebook.com/urbanbrew', enabled: true },
  { platform: 'youtube', url: 'https://youtube.com/@urbanbrew', enabled: true },
  { platform: 'whatsapp', url: 'https://wa.me/919876543210', enabled: true },
  { platform: 'twitter', url: 'https://twitter.com/urbanbrew', enabled: false },
  { platform: 'linkedin', url: 'https://linkedin.com/company/urbanbrew', enabled: true },
  { platform: 'tiktok', url: 'https://tiktok.com/@urbanbrew', enabled: false },
  { platform: 'website', url: 'https://www.urbanbrew.in', enabled: true },
];

const QUICK_ACTIONS = ['WhatsApp', 'Call', 'Directions', 'Email'];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);

const STEPS = [
  { id: 0, label: 'Business', icon: Store },
  { id: 1, label: 'Photos & Bio', icon: ImageIcon },
  { id: 2, label: 'Contact & Location', icon: Phone },
  { id: 3, label: 'Products', icon: Package },
  { id: 4, label: 'Services', icon: Briefcase },
  { id: 5, label: 'Reviews', icon: Star },
  { id: 6, label: 'Social Links', icon: Share2 },
];

const inputCls =
  'w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-white text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-colors';

const labelCls = 'block text-[11px] font-bold text-zinc-700 mb-1.5';

const fieldHintCls = 'text-[11px] text-zinc-400';

const todayLabel = () =>
  new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export const TemplateApplyWizard: React.FC<TemplateApplyWizardProps> = ({
  template,
  existingProfile,
  onClose,
  onPublished,
}) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [publishing, setPublishing] = useState(false);
  const [publishedProfile, setPublishedProfile] = useState<Profile | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const isCafe = template.layout === 'cafe';

  // ---- Step 0: Business ----
  const [businessName, setBusinessName] = useState(existingProfile?.business_name || '');
  const [category, setCategory] = useState(existingProfile?.category || template.category);
  const [description, setDescription] = useState(existingProfile?.description || '');
  const [username, setUsername] = useState(existingProfile?.username || '');
  const [usernameTouched, setUsernameTouched] = useState(Boolean(existingProfile));
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'taken' | 'free'>('idle');

  // ---- Step 1: Photos & Bio ----
  const [avatarUrl, setAvatarUrl] = useState(existingProfile?.avatar_url || (isCafe ? '/images/cafe/logo.webp' : ''));
  const [coverUrl, setCoverUrl] = useState(existingProfile?.cover_url || (isCafe ? '/images/cafe/cover.webp' : ''));
  const [gallery, setGallery] = useState<string[]>(existingProfile?.gallery || (isCafe ? CAFE_DEMO_GALLERY : []));
  const [bio, setBio] = useState(existingProfile?.bio || (isCafe ? 'Great coffee, delicious food and a cozy ambience. Your everyday escape.' : ''));
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // ---- Step 2: Contact & Location ----
  const [phone, setPhone] = useState(existingProfile?.phone || '');
  const [whatsapp, setWhatsapp] = useState(existingProfile?.whatsapp || '');
  const [email, setEmail] = useState(existingProfile?.email || '');
  const [website, setWebsite] = useState(existingProfile?.website || '');
  const [address, setAddress] = useState(existingProfile?.address || '');
  const [city, setCity] = useState(existingProfile?.city || '');
  const [stateName, setStateName] = useState(existingProfile?.state || '');
  const [pinCode, setPinCode] = useState(existingProfile?.pin_code || '');
  const [mapsUrl, setMapsUrl] = useState(existingProfile?.google_maps_url || '');
  const [mapZoom, setMapZoom] = useState(14);
  const [quickActions, setQuickActions] = useState<string[]>(existingProfile?.quick_actions || QUICK_ACTIONS);

  // ---- Step 3: Products ----
  const [productDrafts, setProductDrafts] = useState<ProductDraft[]>(
    existingProfile
      ? [{ name: '', price: '', offerPrice: '', offerOn: false, category: '', description: '', image: '', available: true }]
      : isCafe
        ? CAFE_DEMO_PRODUCTS
        : [{ name: '', price: '', offerPrice: '', offerOn: false, category: '', description: '', image: '', available: true }]
  );
  const [productCategories, setProductCategories] = useState<string[]>(
    isCafe ? ['Drinks', 'Food', 'Desserts'] : []
  );
  const [productFilter, setProductFilter] = useState('All');
  const csvInputRef = useRef<HTMLInputElement>(null);

  // ---- Step 4: Services ----
  const [services, setServices] = useState<ServiceDraft[]>(
    existingProfile?.service_details?.length
      ? existingProfile.service_details.map((s) => ({ name: s.name, description: s.description, icon: s.icon || 'sparkles', enabled: s.enabled }))
      : isCafe
        ? CAFE_DEMO_SERVICES
        : []
  );

  // ---- Step 5: Reviews ----
  const [reviewMode, setReviewMode] = useState<'add' | 'import'>('add');
  const [reviews, setReviews] = useState<ReviewDraft[]>(
    existingProfile?.reviews?.length
      ? existingProfile.reviews.map((r) => ({ author_name: r.author_name, rating: r.rating, text: r.text, date: r.date }))
      : isCafe
        ? CAFE_DEMO_REVIEWS
        : []
  );

  // ---- Step 6: Social links ----
  const [socials, setSocials] = useState<SocialDraft[]>(() => {
    if (existingProfile?.social_links?.length) return existingProfile.social_links;
    if (isCafe) return CAFE_DEMO_SOCIAL;
    return SOCIAL_PLATFORMS.map((p) => ({ platform: p.key, url: '', enabled: false }));
  });

  // Legacy flat fields kept in sync for older layouts
  const flatSocial = (key: string) => socials.find((s) => s.platform === key)?.url || '';

  // Auto-slug username from business name until user edits it manually
  useEffect(() => {
    if (!usernameTouched) {
      setUsername(slugify(businessName));
    }
  }, [businessName, usernameTouched]);

  // Debounced username availability check
  useEffect(() => {
    if (!username || username.length < 2) {
      setUsernameStatus('idle');
      return;
    }
    setUsernameStatus('checking');
    const t = setTimeout(async () => {
      const free = await StorageService.checkUsernameAvailability(username, existingProfile?.id);
      setUsernameStatus(free ? 'free' : 'taken');
    }, 400);
    return () => clearTimeout(t);
  }, [username, existingProfile?.id]);

  const liveUrl = useMemo(
    () => `${window.location.origin}/${username || 'your-business'}`,
    [username]
  );

  useEffect(() => {
    if (publishedProfile) {
      QRCode.toDataURL(liveUrl, {
        width: 480,
        margin: 1.5,
        color: { dark: '#111827', light: '#FFFFFF' },
        errorCorrectionLevel: 'H',
      })
        .then((url: string) => setQrDataUrl(url))
        .catch(() => setQrDataUrl(''));
    }
  }, [publishedProfile, liveUrl]);

  const canProceed = () => {
    switch (step) {
      case 0:
        return businessName.trim().length >= 2 && username.length >= 2 && usernameStatus === 'free';
      case 2:
        return phone.trim().length >= 6;
      case 3:
        return productDrafts.some((p) => p.name.trim().length >= 2);
      default:
        return true;
    }
  };

  /* Upload file functionality */
  const uploadFile = async (file: File | undefined): Promise<string | null> => {
    if (!file) return null;
    setUploadingImage(true);
    try {
      return await StorageService.uploadImage(file, 'products');
    } catch (err) {
      console.error('Image upload failed:', err);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = await uploadFile(e.target.files?.[0]);
    if (url) setAvatarUrl(url);
    e.target.value = '';
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = await uploadFile(e.target.files?.[0]);
    if (url) setCoverUrl(url);
    e.target.value = '';
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 20 - gallery.length);
    setUploadingImage(true);
    try {
      const urls = await Promise.all(files.map((f) => StorageService.uploadImage(f, 'products')));
      setGallery((g) => [...g, ...urls.filter(Boolean)] as string[]);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleProductImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const url = await uploadFile(e.target.files?.[0]);
    if (url) updateDraft(index, { image: url });
    e.target.value = '';
  };

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const rows = String(reader.result || '').split(/\r?\n/).filter(Boolean);
      const imported: ProductDraft[] = rows.slice(1).map((line) => {
        const [name, price, cat, desc] = line.split(',').map((s) => s.trim());
        return {
          name: name || '',
          price: price || '',
          offerPrice: '',
          offerOn: false,
          category: cat && productCategories.includes(cat) ? cat : productCategories[0] || '',
          description: desc || '',
          image: '',
          available: true,
        };
      }).filter((p) => p.name);
      if (imported.length) setProductDrafts((d) => [...d.filter((p) => p.name.trim()), ...imported]);
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  /* Publish profile */
  const handlePublish = async () => {
    setPublishing(true);
    try {
      const now = new Date().toISOString();
      const profile: Profile = {
        ...(existingProfile || {
          id: `profile_${Date.now()}`,
          user_id: `user_${Date.now()}`,
          logo_url: '',
          plan: 'free' as const,
          created_at: now,
        }),
        business_name: businessName.trim(),
        username: username.trim().toLowerCase(),
        category,
        description: description.trim(),
        phone: phone.trim(),
        whatsapp: (whatsapp || phone).replace(/[^0-9+]/g, ''),
        email: email.trim(),
        website: flatSocial('website') || website.trim(),
        address: address.trim(),
        city: city.trim(),
        state: stateName.trim(),
        country: existingProfile?.country || 'India',
        pin_code: pinCode.trim() || undefined,
        google_maps_url: mapsUrl.trim(),
        quick_actions: quickActions,
        avatar_url: avatarUrl.trim() || existingProfile?.avatar_url,
        cover_url: coverUrl.trim() || existingProfile?.cover_url,
        bio: bio.trim() || description.trim(),
        stats: existingProfile?.stats,
        business_hours: existingProfile?.business_hours,
        gallery,
        service_tags: services.filter((s) => s.enabled && s.name.trim()).map((s) => s.name.trim()),
        service_details: services.filter((s) => s.name.trim()).map((s) => ({ name: s.name.trim(), description: s.description.trim(), icon: s.icon, enabled: s.enabled })),
        reviews: reviews
          .filter((r) => r.author_name.trim() && r.text.trim())
          .map((r, i) => ({ id: `rev_${Date.now()}_${i}`, author_name: r.author_name.trim(), rating: r.rating, text: r.text.trim(), date: r.date }) as Review),
        social_links: socials.filter((s) => s.enabled && s.url.trim()),
        instagram: flatSocial('instagram') || existingProfile?.instagram,
        facebook: flatSocial('facebook') || existingProfile?.facebook,
        youtube: flatSocial('youtube') || existingProfile?.youtube,
        twitter: flatSocial('twitter') || existingProfile?.twitter,
        theme: template.theme,
        accent_color: template.accent_color,
        button_style: template.button_style,
        font_family: template.font_family,
        template_id: template.id,
        queue_enabled: template.queue_type ? true : existingProfile?.queue_enabled,
        services: template.services?.length ? template.services : existingProfile?.services,
        updated_at: now,
      };

      const saved = await StorageService.saveProfile(profile);

      const validDrafts = productDrafts.filter((p) => p.name.trim().length >= 2);
      for (let i = 0; i < validDrafts.length; i++) {
        const draft = validDrafts[i];
        const price = Number(draft.price) || 0;
        const offer = Number(draft.offerPrice) || 0;
        const product: Product = {
          id: `prod_${Date.now()}_${i}`,
          profile_id: saved.id,
          name: draft.name.trim(),
          description: draft.description.trim(),
          price,
          currency: 'INR',
          image_url: draft.image.trim(),
          category: draft.category || category,
          available: draft.available,
          featured: i === 0,
          sort_order: i,
          discount_pct: draft.offerOn && offer > 0 && offer < price ? Math.round((1 - offer / price) * 100) : undefined,
          created_at: now,
          updated_at: now,
        };
        await StorageService.saveProduct(product);
      }

      StorageService.setActiveUser({
        id: saved.user_id,
        email: saved.email || `${saved.username}@linkos.app`,
        business_name: saved.business_name,
        username: saved.username,
      });

      setPublishedProfile(saved);
      onPublished(saved);
    } catch (err) {
      console.error('Publish failed:', err);
    } finally {
      setPublishing(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(liveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${username}-linkos-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const updateDraft = (index: number, patch: Partial<ProductDraft>) => {
    setProductDrafts((drafts) => drafts.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  };

  const updateService = (index: number, patch: Partial<ServiceDraft>) => {
    setServices((list) => list.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const updateReview = (index: number, patch: Partial<ReviewDraft>) => {
    setReviews((list) => list.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const updateSocial = (platform: string, patch: Partial<SocialDraft>) => {
    setSocials((list) => list.map((s) => (s.platform === platform ? { ...s, ...patch } : s)));
  };

  const openInMaps = () => {
    const url = mapsUrl.trim() && isValidMapsLink(mapsUrl)
      ? mapsUrl.trim()
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const mapQuery = useMemo(() => {
    const q = buildMapQuery([address, city, stateName]);
    return q || buildMapQuery([businessName, city]) || 'India';
  }, [address, city, stateName, businessName]);

  const visibleProducts = productFilter === 'All' ? productDrafts : productDrafts.filter((p) => p.category === productFilter);
  const enabledSocials = socials.filter((s) => s.enabled && s.url.trim());

  /* Success screen */
  if (publishedProfile) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-y-auto p-6 sm:p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center mx-auto">
            <Check className="w-7 h-7 text-emerald-600" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-zinc-900">Your website is live</h2>
          <p className="mt-1 text-xs text-zinc-500">
            {template.name} template applied to <span className="font-semibold text-zinc-800">{publishedProfile.business_name}</span>.
          </p>

          <div className="mt-5 p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between gap-2">
            <span className="text-xs font-mono text-zinc-800 truncate">{liveUrl}</span>
            <button
              type="button"
              onClick={handleCopyUrl}
              className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="mt-4 p-4 rounded-2xl border border-zinc-200 bg-gradient-to-b from-zinc-50 to-white flex flex-col items-center">
            {qrDataUrl?.trim() ? (
              <img src={qrDataUrl.trim()} alt={`QR code for ${publishedProfile.business_name}`} className="w-36 h-36 object-contain" />
            ) : (
              <div className="w-36 h-36 bg-zinc-100 animate-pulse rounded-lg flex items-center justify-center">
                <QrIcon className="w-8 h-8 text-zinc-300" />
              </div>
            )}
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mt-2">
              Scan to open your page
            </p>
            <button
              type="button"
              onClick={handleDownloadQr}
              disabled={!qrDataUrl}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-bold transition-colors"
            >
              <Download className="w-4 h-4" />
              Download QR Code
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
            <a
              href={`/${publishedProfile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-800 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Live Page
            </a>
          </div>
          <p className="mt-3 text-[10px] text-zinc-400">
            Full admin access is now in your dashboard — edit content, products, QR and analytics anytime.
          </p>
        </div>
      </div>
    );
  }

  /* Main wizard */
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[94vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 sm:px-7 pt-5 pb-4 border-b border-zinc-100 flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-zinc-900">Set up your website</h2>
              {template.is_pro && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-bold">
                  <Crown className="w-3 h-3" />
                  Pro
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              {template.name} template — fill in your details, we build the page for you.
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden sm:block text-right">
              <span className="text-[11px] font-bold text-zinc-700">{step + 1} / {STEPS.length}</span>
              <div className="flex gap-1 mt-1.5">
                {STEPS.map((s) => (
                  <span
                    key={s.id}
                    className={`h-1 w-5 rounded-full transition-colors ${s.id <= step ? 'bg-blue-600' : 'bg-zinc-200'}`}
                  />
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close setup"
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step tabs */}
        <div className="px-5 sm:px-7 py-3 border-b border-zinc-100 flex gap-2 overflow-x-auto [scrollbar-width:none] shrink-0">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const active = step === s.id;
            const done = step > s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => !publishing && setStep(s.id)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-bold transition-colors ${
                  active
                    ? 'bg-zinc-900 text-white'
                    : 'bg-white text-zinc-700 border border-zinc-200 hover:border-zinc-300'
                }`}
              >
                {done ? <Check className="w-3 h-3" /> : <Icon className="w-3.5 h-3.5" />}
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 sm:p-7">
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0"><Store className="w-4 h-4 text-zinc-700" /></span>
                    <label className="text-sm font-bold text-zinc-900" htmlFor="biz-name">Business name <span className="text-red-500">*</span></label>
                    <span className="ml-auto text-[11px] text-zinc-400">This will be shown on your page</span>
                  </div>
                  <input
                    id="biz-name"
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Sharma Electronics"
                    className={inputCls}
                    autoFocus
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0"><Package className="w-4 h-4 text-zinc-700" /></span>
                    <label className="text-sm font-bold text-zinc-900" htmlFor="cat">Business category <span className="text-red-500">*</span></label>
                    <span className="ml-auto text-[11px] text-zinc-400">Choose the category that fits best</span>
                  </div>
                  <select id="cat" value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
                    {TEMPLATE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0"><FileText className="w-4 h-4 text-zinc-700" /></span>
                    <label className="text-sm font-bold text-zinc-900" htmlFor="tagline">Short tagline / about</label>
                    <span className="ml-auto text-[11px] text-zinc-400">One or two lines about your business</span>
                  </div>
                  <textarea
                    id="tagline"
                    value={description}
                    onChange={(e) => setDescription(e.target.value.slice(0, 120))}
                    placeholder="e.g. Great coffee, delicious food and a cozy ambience."
                    rows={3}
                    className={inputCls}
                  />
                  <p className="mt-1 text-right text-[10px] text-zinc-400">{description.length}/120</p>
                </div>

                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0"><Share2 className="w-4 h-4 text-zinc-700" /></span>
                    <label className="text-sm font-bold text-zinc-900" htmlFor="page-addr">Your page address <span className="text-red-500">*</span></label>
                    <span className="ml-auto text-[11px] text-zinc-400">Choose a unique URL for your page</span>
                  </div>
                  <div className="flex items-center rounded-xl border border-zinc-200 overflow-hidden bg-white focus-within:ring-2 focus-within:ring-zinc-900/10 focus-within:border-zinc-400 transition-colors">
                    <span className="px-3 py-2.5 text-sm text-zinc-600 bg-zinc-50 border-r border-zinc-200 shrink-0">linkos.app/</span>
                    <input
                      id="page-addr"
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsernameTouched(true);
                        setUsername(slugify(e.target.value));
                      }}
                      placeholder="your-business"
                      className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between">
                    {usernameStatus === 'free' && (
                      <p className="text-[11px] text-emerald-600 font-bold inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Available</p>
                    )}
                    {usernameStatus === 'taken' && (
                      <p className="text-[11px] text-red-600 font-bold">This address is taken</p>
                    )}
                    {usernameStatus === 'checking' && (
                      <p className="text-[11px] text-zinc-400">Checking availability...</p>
                    )}
                    <span className="text-[11px] text-zinc-400">Only letters, numbers and hyphens</span>
                  </div>
                </div>

                <TipBox icon={<Sparkles className="w-4 h-4" />} title="Don't worry!">
                  You can always change these details later from your dashboard.
                </TipBox>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-zinc-900">Photos & Bio</h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Upload your logo, cover image and write a short bio. These will appear at the top of your page.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Profile picture (Logo)</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5 mb-2">Shown on your page, menu and search results.</p>
                    <div className="flex items-center gap-3">
                      <div className="w-28 h-28 rounded-xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center gap-1.5 shrink-0">
                        <Camera className="w-5 h-5 text-zinc-400" />
                        <p className="text-[11px] font-bold text-zinc-700">Upload Logo</p>
                        <p className="text-[9px] text-zinc-400">JPG, PNG, WebP (Max 2MB)</p>
                        <button
                          type="button"
                          onClick={() => logoInputRef.current?.click()}
                          disabled={uploadingImage}
                          className="mt-1 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white text-[11px] font-bold transition-colors"
                        >
                          {uploadingImage ? 'Uploading...' : 'Choose Image'}
                        </button>
                      </div>
                      {avatarUrl?.trim() && (
                        <div className="relative">
                          <img src={avatarUrl.trim()} alt="Logo preview" className="w-24 h-24 rounded-xl object-cover border border-zinc-200" />
                          <button
                            type="button"
                            onClick={() => setAvatarUrl('')}
                            aria-label="Remove logo"
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-zinc-900">Cover image</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5 mb-2">Shown at the top of your page.</p>
                    <div className="relative h-28 bg-zinc-100 rounded-xl overflow-hidden border border-zinc-200">
                      {coverUrl?.trim() && <img src={coverUrl.trim()} alt="Cover preview" className="w-full h-full object-cover" />}
                      {coverUrl?.trim() && (
                        <button
                          type="button"
                          onClick={() => setCoverUrl('')}
                          aria-label="Remove cover"
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 text-zinc-700 flex items-center justify-center shadow"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => coverInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="absolute bottom-2 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-900/85 hover:bg-zinc-900 text-white text-[11px] font-bold rounded-lg transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        {coverUrl ? 'Change Cover' : 'Upload Cover'}
                      </button>
                    </div>
                    <p className="mt-1.5 text-[10px] text-zinc-400 text-center">Recommended size: 1200 × 630 (JPG, PNG, WebP)</p>
                    <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-bold text-zinc-900">Gallery photos (Optional)</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">Upload more photos to showcase your business. You can reorder them later.</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-bold text-zinc-500">{gallery.length}/20</span>
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        disabled={uploadingImage || gallery.length >= 20}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-50 text-[11px] font-bold text-zinc-700 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Photos
                      </button>
                    </div>
                  </div>
                  {gallery.length > 0 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {gallery.map((src, i) => (
                        src?.trim() ? (
                          <div key={`${src}-${i}`} className="relative aspect-square rounded-lg overflow-hidden border border-zinc-200">
                            <img src={src.trim()} alt={`Gallery photo ${i + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setGallery((g) => g.filter((_, gi) => gi !== i))}
                              aria-label={`Remove gallery photo ${i + 1}`}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/90 text-zinc-700 flex items-center justify-center shadow"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : null
                      ))}
                    </div>
                  )}
                  <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />
                </div>

                <div>
                  <label className="block text-sm font-bold text-zinc-900 mb-1" htmlFor="bio-line">Bio / about line</label>
                  <p className="text-[11px] text-zinc-500 mb-2">A short description about your business. Keep it short and catchy.</p>
                  <textarea
                    id="bio-line"
                    value={bio}
                    onChange={(e) => setBio(e.target.value.slice(0, 120))}
                    placeholder="Short bio about your business"
                    rows={3}
                    className={inputCls}
                  />
                  <p className="mt-1 text-right text-[10px] text-zinc-400">{bio.length}/120</p>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-100">
                  <p className="text-xs font-bold text-blue-900 inline-flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-blue-600" /> Tips for a better page</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                    {['Use a clear logo', 'Add high-quality photos', 'Write a catchy bio'].map((tip) => (
                      <span key={tip} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-800">
                        <span className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center"><Check className="w-2.5 h-2.5 text-white" /></span>
                        {tip}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-zinc-900">Contact & Location</h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Add your contact details and location so customers can easily reach you.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl border border-zinc-200">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0"><Phone className="w-4 h-4 text-zinc-700" /></span>
                      <div>
                        <p className="text-xs font-bold text-zinc-900">Phone number <span className="text-red-500">*</span></p>
                        <p className="text-[10px] text-zinc-400">This will be shown on your page</p>
                      </div>
                    </div>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className={inputCls} />
                  </div>

                  <div className="p-3.5 rounded-xl border border-zinc-200">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0"><MessageCircle className="w-4 h-4 text-emerald-600" /></span>
                      <div>
                        <p className="text-xs font-bold text-zinc-900">WhatsApp number</p>
                        <p className="text-[10px] text-zinc-400">Leave empty if same as phone</p>
                      </div>
                    </div>
                    <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+91 98765 43210" className={inputCls} />
                    {!whatsapp.trim() && phone.trim() && (
                      <p className="mt-2 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-[11px] font-bold text-emerald-700 inline-flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Same as phone number
                      </p>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl border border-zinc-200">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0"><Mail className="w-4 h-4 text-zinc-700" /></span>
                      <div>
                        <p className="text-xs font-bold text-zinc-900">Email address</p>
                        <p className="text-[10px] text-zinc-400">Shown for direct inquiries</p>
                      </div>
                    </div>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hello@business.in" className={inputCls} />
                  </div>

                  <div className="p-3.5 rounded-xl border border-zinc-200">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0"><Share2 className="w-4 h-4 text-zinc-700" /></span>
                      <div>
                        <p className="text-xs font-bold text-zinc-900">Website <span className="font-normal text-zinc-400">(Optional)</span></p>
                        <p className="text-[10px] text-zinc-400">Link to your existing website</p>
                      </div>
                    </div>
                    <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://www.yourbusiness.in" className={inputCls} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0"><MapPin className="w-4 h-4 text-zinc-700" /></span>
                      <div>
                        <p className="text-xs font-bold text-zinc-900">Shop / Office address <span className="text-red-500">*</span></p>
                        <p className="text-[10px] text-zinc-400">Full address helps customers find you easily</p>
                      </div>
                    </div>
                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123, College Road, Kadamtala" className={inputCls} />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls} htmlFor="city-in">City <span className="text-red-500">*</span></label>
                        <input id="city-in" type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Berhampore" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls} htmlFor="state-in">State <span className="text-red-500">*</span></label>
                        <input id="state-in" type="text" value={stateName} onChange={(e) => setStateName(e.target.value)} placeholder="West Bengal" className={inputCls} />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls} htmlFor="pin-in">PIN code <span className="font-normal text-zinc-400">(Optional)</span></label>
                      <input id="pin-in" type="text" inputMode="numeric" value={pinCode} onChange={(e) => setPinCode(e.target.value.slice(0, 6))} placeholder="742101" className={inputCls} />
                    </div>

                    <div className="flex items-center gap-2.5 pt-1">
                      <span className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0"><Share2 className="w-4 h-4 text-zinc-700" /></span>
                      <div>
                        <p className="text-xs font-bold text-zinc-900">Google Maps location link</p>
                        <p className="text-[10px] text-zinc-400">Copy the link from Google Maps (Share → Copy link)</p>
                      </div>
                    </div>
                    <input
                      type="url"
                      value={mapsUrl}
                      onChange={(e) => setMapsUrl(e.target.value)}
                      placeholder="https://maps.app.goo.gl/abc123xyz"
                      className={inputCls}
                    />
                    {mapsUrl.trim() && (
                      isValidMapsLink(mapsUrl) ? (
                        <p className="text-[11px] text-emerald-600 font-bold inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Valid Google Maps link</p>
                      ) : (
                        <p className="text-[11px] text-amber-600 font-bold">This does not look like a Google Maps link</p>
                      )
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl border border-zinc-200 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-zinc-900">Location Preview</p>
                      <button
                        type="button"
                        onClick={openInMaps}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-[10px] font-bold text-zinc-700 transition-colors"
                      >
                        Open in Maps <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="relative flex-1 min-h-44 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100">
                      <GoogleMapEmbed
                        query={mapQuery}
                        zoom={mapZoom}
                        className="absolute inset-0 w-full h-full border-0"
                        title="Location preview"
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] text-zinc-400 truncate">{mapQuery}</span>
                      <div className="flex gap-1 shrink-0">
                        <button type="button" aria-label="Zoom in" onClick={() => setMapZoom((z) => Math.min(19, z + 1))} className="w-6 h-6 rounded-md border border-zinc-200 bg-white text-zinc-600 text-xs font-bold hover:bg-zinc-50">+</button>
                        <button type="button" aria-label="Zoom out" onClick={() => setMapZoom((z) => Math.max(3, z - 1))} className="w-6 h-6 rounded-md border border-zinc-200 bg-white text-zinc-600 text-xs font-bold hover:bg-zinc-50">−</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-zinc-900">Quick action buttons <span className="font-normal text-zinc-400">(Show on your page)</span></p>
                  <p className="text-[11px] text-zinc-500 mt-0.5 mb-2">Choose which buttons to display at the top of your page.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {QUICK_ACTIONS.map((action) => {
                      const on = quickActions.includes(action);
                      return (
                        <button
                          key={action}
                          type="button"
                          role="checkbox"
                          aria-checked={on}
                          onClick={() => setQuickActions((qa) => (on ? qa.filter((a) => a !== action) : [...qa, action]))}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-colors ${on ? 'border-zinc-300 bg-white text-zinc-900' : 'border-zinc-200 bg-zinc-50 text-zinc-400'}`}
                        >
                          <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${on ? 'bg-blue-600' : 'border border-zinc-300 bg-white'}`}>
                            {on && <Check className="w-3 h-3 text-white" />}
                          </span>
                          {action}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <TipBox icon={<Sparkles className="w-4 h-4" />} title="Make it easy for customers to reach you">
                  Accurate contact details can increase your customer inquiries.
                </TipBox>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900">Products & Menu</h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Add the products or services you want to show on your page. Photos and discounts are optional.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => csvInputRef.current?.click()}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-[11px] font-bold text-zinc-700 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" /> Import from CSV
                  </button>
                  <input ref={csvInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleCsvImport} />
                </div>

                {productCategories.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] pb-0.5">
                    {['All', ...productCategories].map((cat) => {
                      const count = cat === 'All' ? productDrafts.length : productDrafts.filter((p) => p.category === cat).length;
                      const active = productFilter === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setProductFilter(cat)}
                          className={`shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-colors ${active ? 'bg-zinc-900 text-white' : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300'}`}
                        >
                          {cat} {cat !== 'All' && `(${count})`}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => {
                        const name = window.prompt('New category name');
                        if (name && name.trim() && !productCategories.includes(name.trim())) {
                          setProductCategories((c) => [...c, name.trim()]);
                        }
                      }}
                      className="shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-bold text-zinc-600 bg-white border border-zinc-200 hover:border-zinc-300 transition-colors inline-flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Category
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  {visibleProducts.map((draft) => {
                    const i = productDrafts.indexOf(draft);
                    return (
                      <div key={i} className="p-3 rounded-xl border border-zinc-200 flex gap-3">
                        <GripVertical className="w-4 h-4 text-zinc-300 shrink-0 mt-1" aria-hidden="true" />
                        <label className="relative shrink-0 cursor-pointer group">
                          {draft.image?.trim() ? (
                            <img src={draft.image.trim()} alt="" className="w-16 h-16 rounded-lg object-cover border border-zinc-200" />
                          ) : (
                            <span className="w-16 h-16 rounded-lg border-2 border-dashed border-zinc-200 flex items-center justify-center">
                              <Camera className="w-4 h-4 text-zinc-400" />
                            </span>
                          )}
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleProductImageUpload(i, e)} />
                        </label>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex flex-wrap gap-2">
                            <input
                              type="text"
                              value={draft.name}
                              onChange={(e) => updateDraft(i, { name: e.target.value })}
                              placeholder="Product name"
                              aria-label="Product name"
                              className="flex-1 min-w-32 px-3 py-2 rounded-lg border border-zinc-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                            />
                            <div>
                              <label className="block text-[9px] font-bold text-zinc-400 mb-0.5">Price (₹)</label>
                              <input
                                type="number" min="0" inputMode="numeric"
                                value={draft.price}
                                onChange={(e) => updateDraft(i, { price: e.target.value })}
                                placeholder="120"
                                aria-label="Price"
                                className="w-20 px-2.5 py-2 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-zinc-400 mb-0.5">Offer Price (₹)</label>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number" min="0" inputMode="numeric"
                                  value={draft.offerPrice}
                                  onChange={(e) => updateDraft(i, { offerPrice: e.target.value })}
                                  placeholder="—"
                                  aria-label="Offer price"
                                  disabled={!draft.offerOn}
                                  className="w-20 px-2.5 py-2 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900/10 disabled:bg-zinc-50 disabled:text-zinc-300"
                                />
                                <Toggle checked={draft.offerOn} onChange={(v) => updateDraft(i, { offerOn: v })} color="red" label="Offer price on" />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setProductDrafts((d) => d.filter((_, di) => di !== i))}
                              aria-label={`Delete ${draft.name || 'product'}`}
                              className="ml-auto p-2 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors self-start"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2 items-center">
                            <select
                              value={draft.category}
                              onChange={(e) => updateDraft(i, { category: e.target.value })}
                              aria-label="Category"
                              className="px-2.5 py-2 rounded-lg border border-zinc-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                            >
                              <option value="">Category</option>
                              {productCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <input
                              type="text"
                              value={draft.description}
                              onChange={(e) => updateDraft(i, { description: e.target.value })}
                              placeholder="Short description"
                              aria-label="Product description"
                              className="flex-1 min-w-40 px-3 py-2 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                            />
                            <label className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[10px] font-bold text-zinc-500">Available</span>
                              <Toggle checked={draft.available} onChange={(v) => updateDraft(i, { available: v })} color="green" label="Available" />
                            </label>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {visibleProducts.length === 0 && (
                    <p className="text-center text-xs text-zinc-400 py-6">No products in this category yet.</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setProductDrafts((d) => [...d, { name: '', price: '', offerPrice: '', offerOn: false, category: productFilter === 'All' ? productCategories[0] || '' : productFilter, description: '', image: '', available: true }])}
                  className="w-full py-5 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/40 hover:bg-blue-50 transition-colors flex flex-col items-center gap-0.5"
                >
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-700">
                    <span className="w-5 h-5 rounded-full border-2 border-blue-500 text-blue-600 flex items-center justify-center"><Plus className="w-3 h-3" /></span>
                    Add New Product
                  </span>
                  <span className="text-[11px] text-blue-500/80">Upload image, add details and make your menu look amazing.</span>
                </button>

                <div className="grid sm:grid-cols-3 gap-2.5">
                  {[
                    { icon: <Camera className="w-4 h-4 text-blue-600" />, title: 'High quality photos', sub: 'Use clear, attractive images' },
                    { icon: <Star className="w-4 h-4 text-blue-600" />, title: 'Highlight best items', sub: 'Mark popular items' },
                    { icon: <Package className="w-4 h-4 text-violet-600" />, title: 'Offer discounts', sub: 'Show special prices' },
                  ].map((t) => (
                    <div key={t.title} className="p-3 rounded-xl border border-zinc-200 flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">{t.icon}</span>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-zinc-900 truncate">{t.title}</p>
                        <p className="text-[10px] text-zinc-400 truncate">{t.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-zinc-900">Services</h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Add the services you offer. These will be shown on your page as a service list or cards.</p>
                </div>

                <TipBox icon={<Star className="w-4 h-4" />} title="Services help customers know what you offer">
                  Add your main services. You can use icons and short descriptions.
                </TipBox>

                <button
                  type="button"
                  onClick={() => setServices((s) => [...s, { name: '', description: '', icon: 'sparkles', enabled: true }])}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Service
                </button>

                <div className="space-y-2.5">
                  {services.map((service, i) => {
                    const IconComp = SERVICE_ICONS[service.icon] || SERVICE_ICONS.sparkles;
                    return (
                      <div key={i} className="p-3 rounded-xl border border-zinc-200 flex gap-3 items-start">
                        <GripVertical className="w-4 h-4 text-zinc-300 shrink-0 mt-1" aria-hidden="true" />
                        <span className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                          <IconComp className="w-5 h-5 text-zinc-700" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={service.name}
                            onChange={(e) => updateService(i, { name: e.target.value })}
                            placeholder="Service name"
                            aria-label="Service name"
                            className="w-full px-2 py-1 rounded text-sm font-bold text-zinc-900 hover:bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 border border-transparent focus:border-zinc-200"
                          />
                          <input
                            type="text"
                            value={service.description}
                            onChange={(e) => updateService(i, { description: e.target.value })}
                            placeholder="Short description"
                            aria-label="Service description"
                            className="w-full px-2 py-1 rounded text-xs text-zinc-500 hover:bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 border border-transparent focus:border-zinc-200"
                          />
                          <div className="mt-1.5 flex items-center gap-2">
                            <select
                              value={service.icon}
                              onChange={(e) => updateService(i, { icon: e.target.value })}
                              aria-label="Service icon"
                              className="px-2 py-1 rounded-lg border border-zinc-200 text-[10px] bg-white text-zinc-600 focus:outline-none"
                            >
                              {Object.keys(SERVICE_ICONS).map((k) => <option key={k} value={k}>{k}</option>)}
                            </select>
                            <label className="flex items-center gap-1.5">
                              <Toggle checked={service.enabled} onChange={(v) => updateService(i, { enabled: v })} label="Show on page" />
                              <span className="text-[10px] font-semibold text-zinc-500">Show on page</span>
                            </label>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button type="button" aria-label={`Edit ${service.name || 'service'}`} onClick={() => updateService(i, {})} className="p-2 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Delete ${service.name || 'service'}`}
                            onClick={() => setServices((s) => s.filter((_, si) => si !== i))}
                            className="p-2 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setServices((s) => [...s, { name: '', description: '', icon: 'sparkles', enabled: true }])}
                  className="w-full py-3.5 rounded-xl bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 transition-colors flex flex-col items-center"
                >
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-800">
                    <span className="w-4 h-4 rounded-full border-2 border-zinc-500 text-zinc-600 flex items-center justify-center"><Plus className="w-2.5 h-2.5" /></span>
                    Add Another Service
                  </span>
                  <span className="text-[10px] text-zinc-400 mt-0.5">You can reorder, edit or remove services anytime.</span>
                </button>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-zinc-900">Customer Reviews</h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Add some customer reviews or testimonials. These will build trust and show on your page.</p>
                </div>

                <div className="grid grid-cols-2 rounded-xl bg-zinc-100 p-1 gap-1">
                  {(['add', 'import'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setReviewMode(mode)}
                      aria-pressed={reviewMode === mode}
                      className={`py-2 rounded-lg text-xs font-bold transition-colors ${reviewMode === mode ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900'}`}
                    >
                      {mode === 'add' ? 'Add Reviews' : 'Import from Google'}
                    </button>
                  ))}
                </div>

                {reviewMode === 'import' ? (
                  <TipBox icon={<MessageCircle className="w-4 h-4" />} title="Tip: You can also import reviews from Google Maps">
                    It saves time and helps you get real customer feedback. Paste your Google Maps link in the Contact &amp; Location step and we will fetch reviews when available.
                  </TipBox>
                ) : (
                  <>
                    <TipBox icon={<Star className="w-4 h-4" />} title="Real reviews make a big difference">
                      You can add your own reviews or import them from Google.
                    </TipBox>

                    <button
                      type="button"
                      onClick={() => setReviews((r) => [...r, { author_name: '', rating: 5, text: '', date: todayLabel() }])}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add Review
                    </button>

                    <div className="space-y-2.5">
                      {reviews.map((review, i) => (
                        <div key={i} className="p-3.5 rounded-xl border border-zinc-200 relative">
                          <button
                            type="button"
                            onClick={() => setReviews((r) => r.filter((_, ri) => ri !== i))}
                            aria-label={`Delete review by ${review.author_name || 'unknown'}`}
                            className="absolute top-3 right-3 p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <div className="flex items-center gap-2.5 pr-8">
                            <span className="w-9 h-9 rounded-full bg-zinc-200 text-zinc-600 flex items-center justify-center text-xs font-bold shrink-0" aria-hidden="true">
                              {(review.author_name.trim()[0] || '?').toUpperCase()}
                            </span>
                            <div className="min-w-0 flex-1">
                              <input
                                type="text"
                                value={review.author_name}
                                onChange={(e) => updateReview(i, { author_name: e.target.value })}
                                placeholder="Reviewer name"
                                aria-label="Reviewer name"
                                className="w-full px-2 py-1 rounded text-sm font-bold text-zinc-900 hover:bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 border border-transparent focus:border-zinc-200"
                              />
                              <div className="flex items-center gap-2 mt-0.5">
                                <StarInput value={review.rating} onChange={(v) => updateReview(i, { rating: v })} />
                                <input
                                  type="text"
                                  value={review.date}
                                  onChange={(e) => updateReview(i, { date: e.target.value })}
                                  placeholder="Date"
                                  aria-label="Review date"
                                  className="w-24 px-1.5 py-0.5 rounded text-[10px] text-zinc-400 hover:bg-zinc-50 focus:bg-white focus:outline-none border border-transparent focus:border-zinc-200"
                                />
                              </div>
                            </div>
                          </div>
                          <textarea
                            value={review.text}
                            onChange={(e) => updateReview(i, { text: e.target.value.slice(0, 300) })}
                            placeholder="Review text"
                            aria-label="Review text"
                            rows={2}
                            className="mt-2 w-full px-2 py-1.5 rounded text-xs text-zinc-700 hover:bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 border border-transparent focus:border-zinc-200 resize-none"
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {step === 6 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-zinc-900">Social Media Links</h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Add your social media profiles so customers can connect with you.</p>
                </div>

                <TipBox icon={<Share2 className="w-4 h-4" />} title="More ways to connect">
                  Show your social media links on your page with attractive icons.
                </TipBox>

                <div className="space-y-2">
                  {socials.map((social) => {
                    const meta = SOCIAL_PLATFORMS.find((p) => p.key === social.platform);
                    return (
                      <div key={social.platform} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-zinc-200">
                        <BrandIcon platform={social.platform} />
                        <span className="w-24 shrink-0 text-xs font-bold text-zinc-900">{meta?.label || social.platform}</span>
                        <input
                          type="url"
                          value={social.url}
                          onChange={(e) => updateSocial(social.platform, { url: e.target.value })}
                          placeholder={meta?.placeholder || `${social.platform} URL`}
                          aria-label={`${meta?.label || social.platform} URL`}
                          className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400"
                        />
                        <Toggle
                          checked={social.enabled}
                          onChange={(v) => updateSocial(social.platform, { enabled: v })}
                          label={`Show ${meta?.label || social.platform} on page`}
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="p-3.5 rounded-xl border border-zinc-200">
                  <p className="text-xs font-bold text-zinc-900 mb-2.5">Preview (shown on your page)</p>
                  {enabledSocials.length > 0 ? (
                    <div className="py-3 rounded-lg bg-zinc-50 flex items-center justify-center gap-3 flex-wrap">
                      {enabledSocials.map((s) => (
                        <BrandIcon key={s.platform} platform={s.platform} className="w-9 h-9 rounded-full" iconClassName="w-5 h-5 text-white" />
                      ))}
                    </div>
                  ) : (
                    <p className="py-3 text-center text-[11px] text-zinc-400">Enable a platform above to see it here.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-7 py-4 border-t border-zinc-100 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => (step === 0 ? onClose() : setStep(step - 1))}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-sm font-bold text-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 0 ? 'Cancel' : 'Back'}
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-bold disabled:opacity-50 transition-colors"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-bold disabled:opacity-50 transition-colors"
            >
              {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
              {publishing ? 'Publishing...' : 'Finish & Create Page'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
