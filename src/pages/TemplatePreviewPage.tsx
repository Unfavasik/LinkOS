import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Rocket } from 'lucide-react';
import { getTemplateById } from '../data/templates';
import { useTemplateOverrides, mergeTemplate, isProTemplate, templateBadge } from '../lib/templateService';
import { ProPaywallModal } from '../components/templates/ProPaywallModal';
import { StorageService } from '../lib/storage';
import { TemplateSite } from '../components/profile/TemplateSite';
import { TemplateApplyWizard } from '../components/templates/TemplateApplyWizard';
import { DEMO_PROFILE, DEMO_PRODUCTS, DEMO_LINKS, DEMO_REVIEWS } from '../data/demoData';
import { Profile, Product } from '../types';

const CAFE_PRODUCTS: Product[] = [
  {
    id: 'cafe_prod_1', profile_id: 'preview', name: 'Cappuccino',
    description: 'Rich & Smooth', price: 120, currency: '₹',
    image_url: '/images/cafe/cappuccino.webp', category: 'Coffee',
    available: true, featured: true, sort_order: 1,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'cafe_prod_2', profile_id: 'preview', name: 'Classic Burger',
    description: 'Juicy & Delicious', price: 180, currency: '₹',
    image_url: '/images/cafe/burger.webp', category: 'Food',
    available: true, featured: false, sort_order: 2,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'cafe_prod_3', profile_id: 'preview', name: 'French Fries',
    description: 'Crispy & Tasty', price: 99, currency: '₹', discount_pct: 20,
    image_url: '/images/cafe/fries.webp', category: 'Sides',
    available: true, featured: false, sort_order: 3,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'cafe_prod_4', profile_id: 'preview', name: 'Iced Latte',
    description: 'Chilled Perfection', price: 140, currency: '₹',
    image_url: '/images/cafe/latte.webp', category: 'Coffee',
    available: true, featured: false, sort_order: 4,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
];

const GARAGE_PRODUCTS: Product[] = [
  {
    id: 'garage_prod_1', profile_id: 'preview', name: 'Engine Oil Change',
    description: 'Keep your engine healthy', price: 1199, currency: '₹',
    image_url: '/images/garage/svc-oil.webp', category: 'Service',
    available: true, featured: true, sort_order: 1,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'garage_prod_2', profile_id: 'preview', name: 'Brake Service',
    description: 'Safe & smooth drive', price: 999, currency: '₹',
    image_url: '/images/garage/svc-brake.webp', category: 'Service',
    available: true, featured: false, sort_order: 2,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'garage_prod_3', profile_id: 'preview', name: 'Wheel Alignment',
    description: 'Better control', price: 799, currency: '₹',
    image_url: '/images/garage/svc-wheel.webp', category: 'Service',
    available: true, featured: false, sort_order: 3,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'garage_prod_4', profile_id: 'preview', name: 'AC Service',
    description: 'Cooler & fresher rides', price: 1299, currency: '₹',
    image_url: '/images/garage/svc-ac.webp', category: 'Service',
    available: true, featured: false, sort_order: 4,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
];

const GARAGE_REVIEWS = [
  { id: 'garage_rev_1', author_name: 'Rohit Das', rating: 5, date: '2 weeks ago', text: 'Excellent service! Staff are professional and friendly. Highly recommended!' },
  { id: 'garage_rev_2', author_name: 'Suhana Khatun', rating: 5, date: '1 month ago', text: 'Very good experience. Quick service and genuine parts. Best in Berhampore!' },
];

const GODI_PRODUCTS: Product[] = [
  {
    id: 'godi_prod_1', profile_id: 'preview', name: 'Car Seat Covers',
    description: 'Premium & Custom Fit', price: 2499, currency: '₹',
    image_url: '/images/godi/prod-car.webp', category: 'Seat Covers',
    available: true, featured: true, sort_order: 1,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'godi_prod_2', profile_id: 'preview', name: 'Bike Seat Covers',
    description: 'Stylish & Durable', price: 799, currency: '₹',
    image_url: '/images/godi/prod-bike.webp', category: 'Seat Covers',
    available: true, featured: false, sort_order: 2,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'godi_prod_3', profile_id: 'preview', name: 'Steering Covers',
    description: 'Comfort & Grip', price: 499, currency: '₹',
    image_url: '/images/godi/prod-steering.webp', category: 'Accessories',
    available: true, featured: false, sort_order: 3,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'godi_prod_4', profile_id: 'preview', name: 'Car Accessories',
    description: 'Pillows, Mats & More', price: 999, currency: '₹',
    image_url: '/images/godi/prod-accessories.webp', category: 'Accessories',
    available: true, featured: false, sort_order: 4,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
];

const GODI_REVIEWS = [
  { id: 'godi_rev_1', author_name: 'Sk Imran', rating: 5, date: '1 week ago', text: 'Best seat cover shop in Berhampore! Premium quality material and perfect fitting. Highly recommended!' },
  { id: 'godi_rev_2', author_name: 'Sabbir Hossain', rating: 5, date: '3 weeks ago', text: 'Got my car interior done from here. Excellent finishing and very reasonable price.' },
];

export const TemplatePreviewPage: React.FC = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { data: overrides } = useTemplateOverrides();
  const baseTemplate = getTemplateById(templateId || '');
  // Admin edits from the panel land in Supabase; merge them over the local
  // base so the preview always shows the latest admin-configured version.
  const template = useMemo(
    () => (baseTemplate ? mergeTemplate(baseTemplate, overrides?.[baseTemplate.id]) : undefined),
    [baseTemplate, overrides]
  );
  const override = baseTemplate ? overrides?.[baseTemplate.id] : undefined;
  const [wizardOpen, setWizardOpen] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [existingProfile, setExistingProfile] = useState<Profile | null>(null);

  const handleUseTemplate = () => {
    if (template && isProTemplate(template)) {
      const plan = StorageService.getActiveUser()?.plan || 'free';
      if (plan === 'free') {
        setPaywallOpen(true);
        return;
      }
    }
    setWizardOpen(true);
  };

  // If the visitor already owns a page, the wizard pre-fills and re-themes it
  useEffect(() => {
    StorageService.getCurrentUserProfile()
      .then((p) => setExistingProfile(p))
      .catch(() => setExistingProfile(null));
  }, []);

  const profile = useMemo<Profile>(() => {
    if (!template) return DEMO_PROFILE;
    const build = (): Profile => {
    const base: Profile = {
      ...DEMO_PROFILE,
      business_name: 'Urban Brew Café',
      category: template.category,
      template_id: template.id,
      theme: template.theme,
      accent_color: template.accent_color,
      button_style: template.button_style,
      font_family: template.font_family,
    };
    if (template.layout === 'cafe') {
      return {
        ...base,
        avatar_url: '/images/cafe/logo.webp',
        cover_url: '/images/cafe/cover.webp',
        bio: 'Great coffee, delicious food and a cozy ambience. Your everyday escape.',
        stats: { rating: 4.8, customers: '1K+', years: '3+' },
        business_hours: [
          { days: 'Mon - Sat', hours: '8:00 AM – 10:00 PM' },
          { days: 'Sunday', hours: '9:00 AM – 9:00 PM' },
        ],
        gallery: ['/images/cafe/interior.webp', '/images/cafe/cappuccino.webp', '/images/cafe/neon.webp', '/images/cafe/latte.webp'],
        service_tags: ['Dine-in', 'Takeaway', 'Home Delivery', 'Birthday & Event Bookings', 'Custom Orders', 'Free WiFi'],
        instagram: '@urbanbrewcafe',
      };
    }
    if (template.layout === 'garage') {
      return {
        ...base,
        business_name: 'AutoCare Service Centre',
        category: 'Car & Bike Service',
        avatar_url: '/images/garage/logo.webp',
        cover_url: '/images/garage/cover.webp',
        bio: 'AutoCare Service Centre is your trusted partner for car and bike servicing, repairs and genuine spare parts. Our skilled technicians ensure high-quality service, so you can drive with confidence.',
        description: 'Reliable Service. Smoother Journeys.',
        stats: { rating: 4.8, customers: '3K+', years: '8+' },
        city: 'Berhampore',
        state: 'West Bengal',
        phone: '+91 98765 43210',
        whatsapp: '+919876543210',
        email: 'autocare.bhp@gmail.com',
        instagram: '@autocare.bhp',
        business_hours: [
          { days: 'Mon - Sat', hours: '9:00 AM – 8:00 PM' },
          { days: 'Sunday', hours: '10:00 AM – 5:00 PM' },
        ],
        gallery: ['/images/garage/gal-1.webp', '/images/garage/gal-2.webp', '/images/garage/gal-3.webp', '/images/garage/gal-4.webp', '/images/garage/svc-oil.webp', '/images/garage/svc-brake.webp', '/images/garage/svc-wheel.webp', '/images/garage/svc-ac.webp', '/images/garage/cover.webp', '/images/garage/logo.webp', '/images/garage/gal-2.webp', '/images/garage/gal-3.webp', '/images/garage/gal-4.webp', '/images/garage/svc-oil.webp', '/images/garage/svc-brake.webp'],
        service_tags: ['Experienced Technicians', 'Genuine Spare Parts', 'Affordable Pricing', 'Multi-Brand Service', 'Quick Turnaround', 'Customer Support'],
      };
    }
    if (template.layout === 'godi') {
      return {
        ...base,
        business_name: 'Rofik Godi Centre',
        category: 'Car Seat Covers & Interior Accessories',
        avatar_url: '/images/godi/avatar.webp',
        cover_url: '/images/godi/cover.webp',
        bio: 'We provide premium quality seat covers and interior accessories for cars, bikes and commercial vehicles. Our goal is to give you comfort, durability and style — all at the best price.',
        description: 'Car Seat Covers & Interior Accessories',
        stats: { rating: 4.8, customers: '2K+', years: '8+' },
        address: 'Kadbeltala',
        city: 'Berhampore',
        state: 'Murshidabad',
        phone: '+91 98765 43210',
        whatsapp: '+919876543210',
        email: 'rofikgodicentre@gmail.com',
        instagram: '@rofikgodicentre',
        gallery: ['/images/godi/prod-car.webp', '/images/godi/prod-bike.webp', '/images/godi/prod-steering.webp', '/images/godi/prod-accessories.webp', '/images/godi/hero-seat.webp', '/images/godi/shop.webp'],
        service_tags: ['Custom Fit Seat Covers', 'Premium Material', 'Cars, Bikes & Commercial Vehicles', 'Affordable Pricing', 'Expert Fitting', 'Long Lasting Quality'],
      };
    }
    return base;
    };
    const built = build();
    // Admin-configured images and copy from the panel win over demo content
    return {
      ...built,
      business_name: override?.name || built.business_name,
      bio: override?.description || built.bio,
      avatar_url: override?.preview_url || built.avatar_url,
      cover_url: override?.cover_url || built.cover_url,
    };
  }, [template, override]);

  if (!template) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm text-zinc-400">Template not found.</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-zinc-900 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Go back
        </button>
      </div>
    );
  }

  const products = template.layout === 'cafe' ? CAFE_PRODUCTS : template.layout === 'garage' ? GARAGE_PRODUCTS : template.layout === 'godi' ? GODI_PRODUCTS : DEMO_PRODUCTS;

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Read-only preview bar */}
      <div className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur border-b border-white/10">
        <div className="max-w-2xl mx-auto px-3 py-2.5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition-colors shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <span className="inline-flex items-center gap-1.5 min-w-0 text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-full">
            <Lock className="w-3 h-3 shrink-0" />
            <span className="truncate">Preview only — editing disabled</span>
          </span>
          {template && templateBadge(template) && (
            <span className="hidden sm:inline-flex text-[10px] font-extrabold tracking-wide text-white bg-blue-600 px-2 py-1 rounded-full">
              {templateBadge(template)}
            </span>
          )}
          <button
            type="button"
            onClick={handleUseTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#05210F] text-[11px] font-bold transition-colors shrink-0"
          >
            <Rocket className="w-3.5 h-3.5" /> Use this Template
          </button>
        </div>
      </div>

      {/* The actual template page, rendered with demo data — nothing here is editable */}
      <div className="max-w-lg mx-auto sm:border-x sm:border-white/10 sm:shadow-2xl sm:shadow-black/50">
        <TemplateSite
          profile={profile}
          products={products}
          links={DEMO_LINKS}
          reviews={template.layout === 'garage' ? GARAGE_REVIEWS : template.layout === 'godi' ? GODI_REVIEWS : DEMO_REVIEWS}
          onSelectProduct={() => {}}
          onShare={() => {}}
        />
      </div>

      {/* Apply wizard — collects the user's own details and publishes their own URL */}
      {wizardOpen && (
        <TemplateApplyWizard
          template={template}
          existingProfile={existingProfile}
          onClose={() => setWizardOpen(false)}
          onPublished={() => navigate('/dashboard')}
        />
      )}
      {paywallOpen && template && (
        <ProPaywallModal
          templateName={template.name}
          templateId={template.id}
          onClose={() => setPaywallOpen(false)}
        />
      )}
    </div>
  );
};
