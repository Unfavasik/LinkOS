import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { coverFor } from '../data/templateCovers';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Search,
  Heart,
  Eye,
  Store,
  Pencil,
  Trash2,
  Plus,
  Star,
  Copy,
  Share2,
  Home,
  Rocket,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Linkedin,
  Music2,
  Phone,
  Globe,
  Camera,
  ImageIcon,
  Lock,
  ChevronRight,
  X,
  BarChart3,
  Bell,
  HelpCircle,
  CreditCard,
  Bookmark,
  LayoutGrid,
  Crown,
} from 'lucide-react';
import { LinkOsLogo } from '../components/common/LinkOsLogo';
import { StorageService } from '../lib/storage';
import { useUploadProgress, UploadProgressBar } from '../components/UploadProgressBar';
import { TEMPLATES, TEMPLATE_CATEGORIES, getTemplateById } from '../data/templates';
import { Profile, Product, Review } from '../types';

const STEPS = [
  'Account',
  'Template',
  'Details',
  'Services',
  'Reviews',
  'Social',
  'Preview',
  'Published',
];

const SERVICE_IMAGES = [
  '/images/cafe/latte.webp',
  '/images/cafe/burger.webp',
  '/images/cafe/cake.webp',
  '/images/garage/cover.webp',
];

const SOCIAL_PLATFORMS = [
  { key: 'instagram', label: 'Instagram', icon: Instagram, color: 'bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600', placeholder: 'https://instagram.com/yourname' },
  { key: 'facebook', label: 'Facebook', icon: Facebook, color: 'bg-[#1877F2]', placeholder: 'https://facebook.com/yourname' },
  { key: 'youtube', label: 'YouTube', icon: Youtube, color: 'bg-[#FF0000]', placeholder: 'https://youtube.com/@yourname' },
  { key: 'x', label: 'X (Twitter)', icon: Twitter, color: 'bg-black', placeholder: 'https://x.com/yourname' },
  { key: 'tiktok', label: 'TikTok', icon: Music2, color: 'bg-zinc-900', placeholder: 'https://tiktok.com/@yourname' },
  { key: 'whatsapp', label: 'WhatsApp', icon: Phone, color: 'bg-[#25D366]', placeholder: 'https://wa.me/919876543210' },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'bg-[#0A66C2]', placeholder: 'https://linkedin.com/in/yourname' },
  { key: 'website', label: 'Website', icon: Globe, color: 'bg-slate-500', placeholder: 'https://yoursite.com' },
] as const;

interface ServiceDraft {
  name: string;
  description: string;
  price: string;
  category: string;
  image: string;
  enabled: boolean;
}

export const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTemplate = getTemplateById(searchParams.get('template') || '');

  const [step, setStep] = useState(1);

  // Step 1 — Account / profile (defaults come from the signed-up user, never demo data)
  const [editingProfile, setEditingProfile] = useState(false);
  const [fullName, setFullName] = useState(() => StorageService.getActiveUser()?.business_name || '');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [role, setRole] = useState('');
  const [userWebsite, setUserWebsite] = useState('');
  const [userLocation, setUserLocation] = useState('');

  // Step 2 — Template
  const [selectedTemplateId, setSelectedTemplateId] = useState(initialTemplate?.id || 'cafe-pro');
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateCategory, setTemplateCategory] = useState<string>('All');

  // Step 3 — Business details (pre-filled with the name entered at signup)
  const [businessName, setBusinessName] = useState(() => StorageService.getActiveUser()?.business_name || '');
  const [category, setCategory] = useState('Café, Bakery & Food');
  const [tagline, setTagline] = useState('');
  const [username, setUsername] = useState('');
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  // Step 4 — Services
  const [services, setServices] = useState<ServiceDraft[]>([
    { name: 'Coffee & Beverages', description: 'Fresh coffee, cold drinks, tea and more.', price: '99', category: 'Beverages', image: SERVICE_IMAGES[0], enabled: true },
    { name: 'Breakfast', description: 'Healthy & delicious breakfast options.', price: '149', category: 'Food', image: SERVICE_IMAGES[1], enabled: true },
    { name: 'Lunch & Dinner', description: 'Tasty meals for every mood.', price: '199', category: 'Food', image: SERVICE_IMAGES[1], enabled: true },
    { name: 'Desserts', description: 'Cakes, pastries and sweet treats.', price: '99', category: 'Desserts', image: SERVICE_IMAGES[2], enabled: true },
  ]);
  const [editingService, setEditingService] = useState<number | null>(null);
  const [serviceForm, setServiceForm] = useState<ServiceDraft>({ name: '', description: '', price: '', category: 'Beverages', image: SERVICE_IMAGES[0], enabled: true });

  // Step 5 — Reviews
  const [reviews, setReviews] = useState<Review[]>([
    { id: 'rev1', author_name: 'Ayesha Khan', rating: 5, text: 'Amazing coffee and beautiful ambiance! My new favorite place in town.', date: '2 days ago' },
    { id: 'rev2', author_name: 'Rohit Sharma', rating: 5, text: 'Great food, friendly staff and cozy vibe. Highly recommended!', date: '1 week ago' },
    { id: 'rev3', author_name: 'Sania Mir', rating: 5, text: 'The best cafe experience! Loved the pasta and coffee.', date: '2 weeks ago' },
  ]);
  const [reviewForm, setReviewForm] = useState({ author_name: '', rating: 5, text: '' });

  // Step 6 — Social
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({
    instagram: '',
    facebook: '',
    youtube: '',
    x: '',
    tiktok: '',
    whatsapp: '',
    linkedin: '',
    website: '',
  });
  const [showSocial, setShowSocial] = useState(true);

  // Step 8 — Published
  const [showShareModal, setShowShareModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedTemplate = getTemplateById(selectedTemplateId);
  const pageUrl = `https://linkos.app/${username || 'mybusiness'}`;

  // Auto-fill active user email
  useEffect(() => {
    const active = StorageService.getActiveUser();
    if (active?.email) setEmail(active.email);
  }, []);

  // Suggest a clean page address from the business name
  useEffect(() => {
    if (businessName && !username) {
      setUsername(
        businessName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .substring(0, 20)
      );
    }
  }, [businessName, username]);

  // Check page address availability with debounce
  useEffect(() => {
    if (!username || username.length < 2) {
      setIsUsernameAvailable(null);
      return;
    }
    const timer = setTimeout(async () => {
      const available = await StorageService.checkUsernameAvailability(username);
      setIsUsernameAvailable(available);
    }, 400);
    return () => clearTimeout(timer);
  }, [username]);

  // Celebrate when the page goes live
  useEffect(() => {
    if (step === 8) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
      const t = setTimeout(() => setShowWelcomeModal(true), 900);
      return () => clearTimeout(t);
    }
  }, [step]);

  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter((t) => {
      const matchesCategory = templateCategory === 'All' || t.category === templateCategory;
      const q = templateSearch.toLowerCase();
      const matchesSearch =
        !q || t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || t.tags.some((tag) => tag.includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [templateSearch, templateCategory]);

  const handleNext = () => setStep((s) => Math.min(s + 1, 8));
  const handleBack = () => {
    if (step === 1) {
      navigate('/dashboard');
      return;
    }
    setStep((s) => s - 1);
  };

  const openAddService = () => {
    setEditingService(null);
    setServiceForm({ name: '', description: '', price: '', category: 'Beverages', image: SERVICE_IMAGES[0], enabled: true });
  };

  const saveService = () => {
    if (!serviceForm.name.trim()) return;
    if (editingService !== null) {
      setServices((list) => list.map((s, i) => (i === editingService ? serviceForm : s)));
    } else {
      setServices((list) => [...list, serviceForm]);
    }
    setEditingService(null);
  };

  const addReview = () => {
    if (!reviewForm.author_name.trim() || !reviewForm.text.trim()) return;
    setReviews((list) => [
      { id: `rev_${Date.now()}`, author_name: reviewForm.author_name, rating: reviewForm.rating, text: reviewForm.text, date: 'Just now' },
      ...list,
    ]);
    setReviewForm({ author_name: '', rating: 5, text: '' });
  };

  const up = useUploadProgress();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'logo' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await up.run('Processing image…', (report) => StorageService.uploadImage(file, 'logos', report));
        if (target === 'logo') setLogoUrl(url);
        else setCoverUrl(url);
      } catch (err: any) {
        console.error('[v0] Image upload failed:', err);
      }
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      const activeUser = StorageService.getActiveUser();
      const userId = activeUser?.id || `user_${Date.now()}`;
      const finalUsername = (username || 'mybusiness').toLowerCase().replace(/[^a-z0-9_]/g, '');

      const newProfile: Profile = {
        id: `profile_${Date.now()}`,
        user_id: userId,
        business_name: businessName || 'My Business',
        username: finalUsername,
        category: category || 'General Business',
        description: tagline || `Welcome to ${businessName || 'our business'}.`,
        bio,
        logo_url: logoUrl || (selectedTemplate?.layout === 'garage' ? '/images/garage/logo.webp' : '/images/cafe/logo.webp'),
        cover_url: coverUrl || coverFor(selectedTemplate?.id, category),
        avatar_url: '/images/default-avatar.png',
        phone: phone || socialLinks.whatsapp,
        whatsapp: socialLinks.whatsapp || phone,
        whatsapp_message: `Hi ${businessName}! I found your LinkOS page and would like to inquire.`,
        email: email,
        website: socialLinks.website || userWebsite,
        address: '',
        city: userLocation.split(',')[0] || 'Local City',
        state: userLocation.split(',')[1]?.trim() || 'State',
        country: 'India',
        theme: selectedTemplate?.theme || 'neutral',
        accent_color: selectedTemplate?.accent_color || '#2563EB',
        button_style: selectedTemplate?.button_style || 'rounded',
        font_family: selectedTemplate?.font_family || 'inter',
        template_id: selectedTemplate?.id,
        service_tags: [],
        services: services
          .filter((s) => s.enabled && s.name)
          .map((s) => ({ name: s.name, price: parseFloat(s.price) || 0, minutes: 30 })),
        reviews: reviews,
        social_links: SOCIAL_PLATFORMS.filter((p) => socialLinks[p.key]).map((p) => ({
          platform: p.label,
          url: socialLinks[p.key],
          enabled: true,
        })),
        instagram: socialLinks.instagram,
        facebook: socialLinks.facebook,
        youtube: socialLinks.youtube,
        plan: 'free',
        verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const savedProfile = await StorageService.saveProfile(newProfile);

      // Save the first service as a product so the page menu is never empty
      const firstService = services.find((s) => s.enabled && s.name);
      if (firstService) {
        const firstProd: Product = {
          id: `prod_${Date.now()}`,
          profile_id: savedProfile.id,
          name: firstService.name,
          description: firstService.description || 'Quality guaranteed. Inquire for details.',
          price: parseFloat(firstService.price) || 99,
          currency: '₹',
          image_url: firstService.image || SERVICE_IMAGES[0],
          category: firstService.category || 'Services',
          available: true,
          featured: true,
          sort_order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await StorageService.saveProduct(firstProd);
      }

      StorageService.setActiveUser({
        id: userId,
        email: email || activeUser?.email || 'owner@business.com',
        business_name: savedProfile.business_name,
        username: savedProfile.username,
      });

      setSaving(false);
      handleNext();
    } catch (err) {
      console.error('[v0] Failed to create profile:', err);
      setSaving(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('[v0] Clipboard unavailable');
    }
  };

  const inputCls =
    'w-full px-4 py-3 text-sm border border-zinc-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden bg-white placeholder:text-zinc-400';
  const labelCls = 'block text-xs font-semibold text-zinc-700 mb-1.5';

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <UploadProgressBar
        {...up}
        tone="light"
        className="fixed bottom-4 left-1/2 z-50 w-64 -translate-x-1/2 rounded-xl border border-zinc-200 bg-white/95 p-3 shadow-xl"
      />
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-zinc-100">
        <div className="max-w-2xl mx-auto w-full flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <button onClick={handleBack} aria-label="Go back" className="p-1.5 -ml-1.5 text-zinc-700 hover:text-zinc-900">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <LinkOsLogo size="sm" />
          </div>
          <div className="flex items-center gap-2">
            <button aria-label="Search" className="w-9 h-9 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-600">
              <Search className="w-4 h-4" />
            </button>
            <button aria-label="Menu" className="w-9 h-9 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-600">
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Stepper */}
        <div className="max-w-2xl mx-auto w-full px-4 pb-3">
          <ol className="flex items-start justify-between">
            {STEPS.map((label, i) => {
              const n = i + 1;
              const done = step > n;
              const active = step === n;
              return (
                <li key={label} className="flex flex-col items-center gap-1 min-w-0">
                  <div className="flex items-center w-full">
                    <span className={`h-0.5 flex-1 ${i === 0 ? 'bg-transparent' : done || active ? 'bg-blue-600' : 'bg-zinc-200'}`} />
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        done ? 'bg-blue-600 text-white' : active ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-zinc-200 text-zinc-500'
                      }`}
                    >
                      {done ? <Check className="w-3 h-3" /> : n}
                    </span>
                    <span className={`h-0.5 flex-1 ${i === STEPS.length - 1 ? 'bg-transparent' : done ? 'bg-blue-600' : 'bg-zinc-200'}`} />
                  </div>
                  <span className={`text-[9px] font-semibold whitespace-nowrap ${active ? 'text-blue-600' : 'text-zinc-400'}`}>{label}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 pb-28">
        {/* ================= STEP 1: ACCOUNT ================= */}
        {step === 1 && !editingProfile && (
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Welcome to LinkOS</h1>
            <p className="mt-1 text-sm text-zinc-500">Manage your account, business pages and preferences.</p>

            {/* Profile card */}
            <section className="mt-5 bg-white rounded-2xl border border-zinc-100 p-5">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <img src="/images/default-avatar.png" alt="Profile photo" className="w-16 h-16 rounded-full object-cover" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center">
                    <Camera className="w-3 h-3 text-white" />
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-lg font-bold text-zinc-900 truncate">{fullName}</h2>
                    <button
                      onClick={() => setEditingProfile(true)}
                      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-600"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit Profile
                    </button>
                  </div>
                  <p className="text-xs text-zinc-500 truncate">{email || 'asik@example.com'}</p>
                  <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-semibold text-emerald-600">
                    <Check className="w-3 h-3" /> Verified
                  </span>
                </div>
              </div>
              <p className="mt-4 text-sm text-zinc-700">{bio}</p>
              <p className="text-xs text-zinc-400">Student • Developer • Founder</p>
            </section>

            {/* Stats */}
            <section className="mt-3 bg-white rounded-2xl border border-zinc-100 grid grid-cols-3 divide-x divide-zinc-100 py-4">
              {[
                { n: '0', l: 'Business Pages' },
                { n: '0', l: 'Templates Used' },
                { n: '0', l: 'Total Views' },
              ].map((s) => (
                <div key={s.l} className="text-center px-2">
                  <p className="text-xl font-bold text-zinc-900">{s.n}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{s.l}</p>
                </div>
              ))}
            </section>

            {/* Upgrade banner */}
            <section className="mt-3 rounded-2xl bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-100 p-4 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <Crown className="w-5 h-5 text-amber-500" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-zinc-900">Upgrade to Pro</p>
                <p className="text-[11px] text-zinc-500">Get premium templates, custom domain, analytics and more.</p>
              </div>
              <button className="shrink-0 inline-flex items-center gap-1 px-3.5 py-2 rounded-lg bg-blue-600 text-xs font-semibold text-white">
                Upgrade Now <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </section>

            {/* Quick links */}
            <section className="mt-3 grid grid-cols-3 gap-3">
              {[
                { icon: LayoutGrid, label: 'My Websites', sub: 'Manage all your business websites', color: 'text-blue-600 bg-blue-50' },
                { icon: Bookmark, label: 'Saved Templates', sub: 'View your favourite templates', color: 'text-blue-600 bg-blue-50' },
                { icon: CreditCard, label: 'Billing & Plans', sub: 'Manage subscription and payments', color: 'text-amber-500 bg-amber-50' },
                { icon: BarChart3, label: 'Analytics', sub: 'See performance and insights', color: 'text-blue-600 bg-blue-50' },
                { icon: Bell, label: 'Notifications', sub: 'Updates, tips and important alerts', color: 'text-blue-600 bg-blue-50', dot: true },
                { icon: HelpCircle, label: 'Help & Support', sub: 'Get help or contact our support team', color: 'text-blue-600 bg-blue-50' },
              ].map((q) => (
                <button key={q.label} className="bg-white rounded-2xl border border-zinc-100 p-3.5 text-left hover:border-zinc-200 transition-colors">
                  <span className={`w-9 h-9 rounded-xl flex items-center justify-center relative ${q.color}`}>
                    <q.icon className="w-4.5 h-4.5" />
                    {q.dot && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />}
                  </span>
                  <p className="mt-2.5 text-xs font-bold text-zinc-900">{q.label}</p>
                  <p className="mt-0.5 text-[10px] text-zinc-400 leading-snug">{q.sub}</p>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-300 mt-1.5" />
                </button>
              ))}
            </section>
          </div>
        )}

        {/* ================= STEP 1b: EDIT PROFILE ================= */}
        {step === 1 && editingProfile && (
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Edit Your Profile</h1>
            <p className="mt-1 text-sm text-zinc-500">Keep your information up to date. This helps customers trust your business.</p>

            <section className="mt-5 bg-white rounded-2xl border border-zinc-100 p-5">
              <p className="text-sm font-bold text-zinc-900">Profile Photo</p>
              <div className="mt-3 flex items-center gap-4">
                <img src="/images/default-avatar.png" alt="Profile photo" className="w-16 h-16 rounded-full object-cover" />
                <div className="flex gap-2">
                  <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-600">
                    <Camera className="w-3.5 h-3.5" /> Change Photo
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-red-200 bg-red-50 text-xs font-semibold text-red-500">
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <label className={labelCls}>Full Name *</label>
                  <input className={inputCls} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" />
                </div>
                <div>
                  <label className={labelCls}>Email Address *</label>
                  <div className="relative">
                    <input className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-semibold text-emerald-600">
                      <Check className="w-3 h-3" /> Verified
                    </span>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Phone Number</label>
                  <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className={labelCls}>Bio / About You</label>
                  <textarea rows={3} className={inputCls} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell people about yourself" />
                  <p className="mt-1 text-right text-[10px] text-zinc-400">{bio.length}/200</p>
                </div>
                <div>
                  <label className={labelCls}>Role</label>
                  <select className={inputCls} value={role} onChange={(e) => setRole(e.target.value)}>
                    {['Student', 'Developer', 'Founder', 'Business Owner', 'Freelancer', 'Creator'].map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Website (Optional)</label>
                  <input className={inputCls} value={userWebsite} onChange={(e) => setUserWebsite(e.target.value)} placeholder="https://yoursite.com" />
                </div>
                <div>
                  <label className={labelCls}>Location (Optional)</label>
                  <input className={inputCls} value={userLocation} onChange={(e) => setUserLocation(e.target.value)} placeholder="City, State, Country" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-zinc-700 mb-2">Social Links</p>
                  <div className="space-y-2">
                    {SOCIAL_PLATFORMS.slice(0, 4).map((p) => (
                      <div key={p.key} className="flex items-center gap-2.5">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${p.color}`}>
                          <p.icon className="w-4 h-4 text-white" />
                        </span>
                        <input
                          className={inputCls}
                          value={socialLinks[p.key] || ''}
                          onChange={(e) => setSocialLinks((s) => ({ ...s, [p.key]: e.target.value }))}
                          placeholder={p.placeholder}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 flex gap-3">
                  <Lock className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-blue-900">Your information is secure</p>
                    <p className="text-[11px] text-blue-700/80 mt-0.5">We never share your personal information with anyone.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ================= STEP 2: TEMPLATE ================= */}
        {step === 2 && (
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Step 2: Choose a Template</h1>
            <p className="mt-1 text-sm text-zinc-500">Pick a template that fits your business. You can always change it later.</p>

            <div className="mt-4 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                className={`${inputCls} pl-10`}
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                placeholder="Search templates (e.g. café, salon, shop...)"
              />
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
              {['All', ...TEMPLATE_CATEGORIES.slice(0, 7)].map((c) => (
                <button
                  key={c}
                  onClick={() => setTemplateCategory(c)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    templateCategory === c ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-zinc-200 text-zinc-600'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {filteredTemplates.slice(0, 10).map((t) => {
                const selected = selectedTemplateId === t.id;
                return (
                  <div key={t.id} className={`rounded-2xl border bg-white overflow-hidden ${selected ? 'border-blue-600 ring-2 ring-blue-100' : 'border-zinc-100'}`}>
                    <div className="relative">
                      <img src={coverFor(t.id, t.category)} alt={`${t.name} template preview`} className="w-full h-24 object-cover" loading="lazy" />
                      <button aria-label="Save template" className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center">
                        <Heart className="w-3.5 h-3.5 text-zinc-500" />
                      </button>
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-bold text-zinc-900 truncate">{t.name}</p>
                      <p className="text-[10px] text-zinc-400 truncate">{t.category}</p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <button
                          onClick={() => setSelectedTemplateId(t.id)}
                          className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold ${
                            selected ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'
                          }`}
                        >
                          {selected ? 'Selected' : 'Use Template'}
                        </button>
                        <Eye className="w-4 h-4 text-zinc-400 shrink-0" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= STEP 3: DETAILS ================= */}
        {step === 3 && (
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Step 3: Add Your Business Details</h1>
            <p className="mt-1 text-sm text-zinc-500">
              We&apos;ve loaded the {selectedTemplate?.name || 'default'} template. Now add your business information.
            </p>

            {/* Template preview */}
            <div className="mt-4 relative">
              <div className="rounded-2xl overflow-hidden border border-zinc-100">
                <img src={coverFor(selectedTemplate?.id, category)} alt="Template cover preview" className="w-full h-40 object-cover" />
              </div>
              <div className="absolute -bottom-4 right-3 w-20 rounded-xl overflow-hidden border-2 border-white shadow-lg">
                <img src={coverFor(selectedTemplate?.id, category)} alt="" aria-hidden="true" className="w-full h-28 object-cover" />
              </div>
            </div>
            <button className="mt-7 w-full py-2.5 rounded-xl border border-blue-200 bg-blue-50 text-sm font-semibold text-blue-600 inline-flex items-center justify-center gap-2">
              <Eye className="w-4 h-4" /> Preview Full Template
            </button>

            {/* Business information */}
            <section className="mt-5 bg-white rounded-2xl border border-zinc-100 p-5">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Store className="w-5 h-5 text-blue-600" />
                </span>
                <div>
                  <p className="text-sm font-bold text-zinc-900">Business Information</p>
                  <p className="text-[11px] text-zinc-400">This information will be used on your page.</p>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label className={labelCls}>Business name *</label>
                  <input className={inputCls} value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. Urban Brew Café" />
                </div>
                <div>
                  <label className={labelCls}>Business category *</label>
                  <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)}>
                    {[
                      'Café, Bakery & Food',
                      'Automotive & Workshops',
                      'Clothing & Fashion Boutique',
                      'Electronics & Mobile Store',
                      'Salon, Spa & Beauty',
                      'Home Decor & Furniture',
                      'Healthcare & Clinic',
                      'Professional Services',
                    ].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Short tagline / about *</label>
                  <textarea rows={3} className={inputCls} value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="What makes your business special?" />
                </div>
                <div>
                  <label className={labelCls}>Page address *</label>
                  <div className="flex items-center border border-zinc-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                    <span className="pl-4 pr-2 text-sm text-zinc-400 bg-zinc-50 self-stretch flex items-center">linkos.app/</span>
                    <input
                      className="flex-1 py-3 pr-3 text-sm outline-hidden bg-white"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="yourbusiness"
                    />
                    {isUsernameAvailable === true && (
                      <span className="pr-3 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 shrink-0">
                        <Check className="w-3.5 h-3.5" /> Available!
                      </span>
                    )}
                    {isUsernameAvailable === false && (
                      <span className="pr-3 inline-flex items-center gap-1 text-[11px] font-semibold text-red-500 shrink-0">Taken</span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Upload photos */}
            <section className="mt-3 bg-white rounded-2xl border border-zinc-100 p-5">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-blue-600" />
                </span>
                <div>
                  <p className="text-sm font-bold text-zinc-900">Upload Photos</p>
                  <p className="text-[11px] text-zinc-400">Add your logo and cover photo. You can change these later.</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {(
                  [
                    { key: 'logo', title: 'Upload Logo', sub: 'JPG, PNG (1:1)', value: logoUrl, pro: false },
                    { key: 'cover', title: 'Upload Cover Photo', sub: 'JPG, PNG (16:9)', value: coverUrl, pro: true },
                  ] as const
                ).map((u) => (
                  <label key={u.key} className="relative cursor-pointer rounded-2xl border-2 border-dashed border-zinc-200 p-5 flex flex-col items-center justify-center text-center hover:border-blue-300 transition-colors">
                    {u.value?.trim() ? (
                      <img src={u.value.trim()} alt={`${u.title} preview`} className="w-full h-16 object-cover rounded-lg" />
                    ) : (
                      <span className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
                        <Plus className="w-4.5 h-4.5 text-blue-600" />
                      </span>
                    )}
                    <p className="mt-2 text-xs font-bold text-zinc-800">{u.title}</p>
                    <p className="text-[10px] text-zinc-400">{u.sub}</p>
                    {u.pro && <Crown className="absolute top-2 right-2 w-4 h-4 text-amber-400" />}
                    <input type="file" accept="image/*" className="sr-only" onChange={(e) => handleImageUpload(e, u.key)} />
                  </label>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ================= STEP 4: SERVICES ================= */}
        {step === 4 && (
          <div>
            {editingService === null ? (
              <>
                <h1 className="text-2xl font-bold text-zinc-900">Step 4: Add Your Services</h1>
                <p className="mt-1 text-sm text-zinc-500">Show what you offer. You can add, edit or remove services anytime.</p>

                <div className="mt-4 space-y-2.5">
                  {services.map((s, i) => (
                    <div key={`${s.name}-${i}`} className="bg-white rounded-2xl border border-zinc-100 p-3 flex items-center gap-3">
                      {s.image?.trim() ? (
                        <img src={s.image.trim()} alt="" aria-hidden="true" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-500 font-bold text-xs">
                          {s.name.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-zinc-900 truncate">{s.name}</p>
                        <p className="text-[11px] text-zinc-400 truncate">{s.description}</p>
                        <p className="text-[11px] font-semibold text-zinc-600 mt-0.5">Starting from ₹{s.price}</p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingService(i);
                          setServiceForm(s);
                        }}
                        aria-label={`Edit ${s.name}`}
                        className="p-2 text-zinc-400 hover:text-blue-600"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setServices((list) => list.filter((_, idx) => idx !== i))}
                        aria-label={`Remove ${s.name}`}
                        className="p-2 text-zinc-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={openAddService}
                    className="w-full py-3.5 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 text-sm font-semibold text-blue-600 inline-flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add New Service
                  </button>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-zinc-900">Step 4: Add Your Services</h1>
                <div className="mt-4 relative rounded-2xl overflow-hidden">
                  <img src={serviceForm.image?.trim() || SERVICE_IMAGES[0]} alt="Service photo" className="w-full h-44 object-cover" />
                  <label className="absolute bottom-3 left-1/2 -translate-x-1/2 cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-black/60 backdrop-blur text-xs font-semibold text-white">
                    <Camera className="w-3.5 h-3.5" /> Change Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const url = await up.run('Processing image…', (report) => StorageService.uploadImage(file, 'products', report));
                            setServiceForm((f) => ({ ...f, image: url }));
                          } catch {
                            setServiceForm((f) => ({ ...f, image: SERVICE_IMAGES[Math.floor(Math.random() * SERVICE_IMAGES.length)] }));
                          }
                        }
                      }}
                    />
                  </label>
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <label className={labelCls}>Service Name *</label>
                    <input className={inputCls} value={serviceForm.name} onChange={(e) => setServiceForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Coffee & Beverages" />
                  </div>
                  <div>
                    <label className={labelCls}>Description *</label>
                    <textarea rows={2} className={inputCls} value={serviceForm.description} onChange={(e) => setServiceForm((f) => ({ ...f, description: e.target.value }))} placeholder="Fresh coffee, cold drinks, tea and more." />
                  </div>
                  <div>
                    <label className={labelCls}>Price (Optional)</label>
                    <input className={inputCls} value={serviceForm.price} onChange={(e) => setServiceForm((f) => ({ ...f, price: e.target.value.replace(/[^0-9]/g, '') }))} placeholder="Starting from ₹99" />
                  </div>
                  <div>
                    <label className={labelCls}>Category</label>
                    <select className={inputCls} value={serviceForm.category} onChange={(e) => setServiceForm((f) => ({ ...f, category: e.target.value }))}>
                      {['Beverages', 'Food', 'Desserts', 'Products', 'Services', 'Other'].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-2xl border border-zinc-100 px-4 py-3.5">
                    <span className="text-sm font-semibold text-zinc-800">Show this service on your page</span>
                    <button
                      role="switch"
                      aria-checked={serviceForm.enabled}
                      onClick={() => setServiceForm((f) => ({ ...f, enabled: !f.enabled }))}
                      className={`w-11 h-6 rounded-full relative transition-colors ${serviceForm.enabled ? 'bg-blue-600' : 'bg-zinc-300'}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${serviceForm.enabled ? 'left-[22px]' : 'left-0.5'}`} />
                    </button>
                  </div>
                  <button onClick={saveService} className="w-full py-3.5 rounded-xl bg-blue-600 text-sm font-bold text-white">
                    Save Service
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ================= STEP 5: REVIEWS ================= */}
        {step === 5 && (
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Step 5: Customer Reviews</h1>
            <p className="mt-1 text-sm text-zinc-500">Add real reviews to build trust. You can add them manually or import from Google.</p>

            <div className="mt-4 flex gap-2.5">
              <button className="flex-1 py-2.5 rounded-xl border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-600 inline-flex items-center justify-center gap-1.5">
                <Plus className="w-4 h-4" /> Add Review Manually
              </button>
              <button className="flex-1 py-2.5 rounded-xl border border-zinc-200 bg-white text-xs font-semibold text-zinc-700 inline-flex items-center justify-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-blue-500 inline-block" aria-hidden="true" />
                Import from Google
              </button>
            </div>

            {/* Add review form */}
            <section className="mt-4 bg-white rounded-2xl border border-zinc-100 p-4">
              <div className="grid grid-cols-2 gap-3">
                <input className={inputCls} value={reviewForm.author_name} onChange={(e) => setReviewForm((f) => ({ ...f, author_name: e.target.value }))} placeholder="Customer name" />
                <div className="flex items-center gap-1 px-3 border border-zinc-200 rounded-xl">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setReviewForm((f) => ({ ...f, rating: n }))} aria-label={`${n} star`}>
                      <Star className={`w-4.5 h-4.5 ${n <= reviewForm.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <textarea rows={2} className={`${inputCls} mt-3`} value={reviewForm.text} onChange={(e) => setReviewForm((f) => ({ ...f, text: e.target.value }))} placeholder="What did the customer say?" />
              <button onClick={addReview} className="mt-3 w-full py-2.5 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/50 text-xs font-semibold text-blue-600 inline-flex items-center justify-center gap-1.5">
                <Plus className="w-4 h-4" /> Add Another Review
              </button>
            </section>

            <div className="mt-3 space-y-2.5">
              {reviews.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl border border-zinc-100 p-4">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                      {r.author_name.charAt(0)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-zinc-900 truncate">{r.author_name}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="flex gap-0.5">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </span>
                        <span className="text-[10px] text-zinc-400">{r.date}</span>
                      </div>
                    </div>
                    <button onClick={() => setReviews((list) => list.filter((x) => x.id !== r.id))} aria-label={`Remove review from ${r.author_name}`} className="p-1.5 text-zinc-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="mt-2.5 text-xs text-zinc-600 leading-relaxed">&ldquo;{r.text}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= STEP 6: SOCIAL ================= */}
        {step === 6 && (
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Step 6: Connect Social Media</h1>
            <p className="mt-1 text-sm text-zinc-500">Add your social media links so customers can find and follow you everywhere.</p>

            <div className="mt-4 space-y-2.5">
              {SOCIAL_PLATFORMS.map((p) => (
                <div key={p.key} className="bg-white rounded-2xl border border-zinc-100 p-3 flex items-center gap-3">
                  <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${p.color}`}>
                    <p.icon className="w-4.5 h-4.5 text-white" />
                  </span>
                  <input
                    className="flex-1 min-w-0 text-xs text-zinc-700 bg-transparent outline-hidden placeholder:text-zinc-300"
                    value={socialLinks[p.key] || ''}
                    onChange={(e) => setSocialLinks((s) => ({ ...s, [p.key]: e.target.value }))}
                    placeholder={p.placeholder}
                  />
                  {socialLinks[p.key] && (
                    <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 bg-white rounded-2xl border border-zinc-100 px-4 py-3.5 flex items-center justify-between">
              <div className="pr-3">
                <p className="text-sm font-semibold text-zinc-800">Show social links on your page</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Customers will be able to see and click these links.</p>
              </div>
              <button
                role="switch"
                aria-checked={showSocial}
                aria-label="Show social links on your page"
                onClick={() => setShowSocial((v) => !v)}
                className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${showSocial ? 'bg-blue-600' : 'bg-zinc-300'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${showSocial ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 7: PREVIEW ================= */}
        {step === 7 && (
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Step 7: Preview Your Page</h1>
            <p className="mt-1 text-sm text-zinc-500">Take a final look at your page before publishing.</p>

            <div className="mt-4 rounded-2xl overflow-hidden border border-zinc-200 shadow-sm">
              <div className="relative">
                <img src={coverFor(selectedTemplate?.id, category)} alt="Page cover preview" className="w-full h-44 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 text-[10px] font-bold text-zinc-800">
                    <Store className="w-3 h-3" /> {businessName}
                  </span>
                  <LayoutGrid className="w-4.5 h-4.5 text-white" />
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <h2 className="text-xl font-bold text-white leading-tight">{tagline.split(' ').slice(0, 3).join(' ') || businessName}</h2>
                  <p className="text-[11px] text-white/80">{tagline}</p>
                  <div className="mt-2 flex gap-2">
                    <span className="px-3 py-1.5 rounded-full bg-white text-[10px] font-bold text-zinc-900">View Menu</span>
                    <span className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur text-[10px] font-bold text-white border border-white/40">Book a Table</span>
                  </div>
                </div>
              </div>

              {showSocial && (
                <div className="bg-white px-4 py-3 flex items-center gap-2.5 border-b border-zinc-100">
                  {SOCIAL_PLATFORMS.filter((p) => socialLinks[p.key])
                    .slice(0, 4)
                    .map((p) => (
                      <span key={p.key} className={`w-7 h-7 rounded-full flex items-center justify-center ${p.color}`}>
                        <p.icon className="w-3.5 h-3.5 text-white" />
                      </span>
                    ))}
                </div>
              )}

              <div className="bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-zinc-900">Our Services</p>
                  <span className="text-[11px] font-semibold text-blue-600">View All</span>
                </div>
                <div className="mt-3 space-y-2.5">
                  {services.filter((s) => s.enabled).slice(0, 2).map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {s.image?.trim() ? (
                        <img src={s.image.trim()} alt="" aria-hidden="true" className="w-11 h-11 rounded-xl object-cover" />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-500 font-bold text-xs">
                          {s.name.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-zinc-900 truncate">{s.name}</p>
                        <p className="text-[10px] text-zinc-400 truncate">{s.description}</p>
                      </div>
                      <span className="text-[11px] font-bold text-zinc-700">₹{s.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 8: PUBLISHED ================= */}
        {step === 8 && (
          <div className="text-center pt-6">
            <span className="mx-auto w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
              <span className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center">
                <Check className="w-8 h-8 text-white" />
              </span>
            </span>
            <h1 className="mt-5 text-2xl font-bold text-zinc-900">Page Published Successfully!</h1>
            <p className="mt-1.5 text-sm text-zinc-500">Your LinkOS page is now live and ready to receive customers.</p>

            <div className="mt-6 flex items-center gap-2 max-w-sm mx-auto">
              <div className="flex-1 px-4 py-3 rounded-xl bg-zinc-100 text-xs font-semibold text-zinc-600 truncate text-left">{pageUrl}</div>
              <button onClick={copyLink} className="px-4 py-3 rounded-xl bg-blue-600 text-xs font-bold text-white shrink-0">
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="mt-6 max-w-sm mx-auto space-y-2.5">
              <button onClick={() => navigate(`/${username}`)} className="w-full py-3.5 rounded-xl bg-blue-600 text-sm font-bold text-white inline-flex items-center justify-center gap-2">
                View My Website <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => setShowShareModal(true)} className="w-full py-3.5 rounded-xl border border-zinc-200 bg-white text-sm font-bold text-zinc-800 inline-flex items-center justify-center gap-2">
                <Share2 className="w-4 h-4 text-blue-600" /> Share Page
              </button>
              <button onClick={() => navigate('/dashboard')} className="w-full py-3.5 rounded-xl bg-blue-50 text-sm font-bold text-blue-700 inline-flex items-center justify-center gap-2">
                <Home className="w-4 h-4" /> Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer actions */}
      {step < 8 && (
        <footer className="sticky bottom-0 z-30 bg-white border-t border-zinc-100">
          <div className="max-w-2xl mx-auto w-full px-4 py-3.5 flex items-center gap-3">
            <button onClick={handleBack} className="px-5 py-3 rounded-xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-700 inline-flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            {step === 7 ? (
              <button
                onClick={handlePublish}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-blue-600 text-sm font-bold text-white inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? 'Publishing...' : 'Publish Page'} <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={step === 1 && editingProfile ? () => setEditingProfile(false) : handleNext} className="flex-1 py-3 rounded-xl bg-blue-600 text-sm font-bold text-white inline-flex items-center justify-center gap-2">
                {step === 1 && (editingProfile ? 'Save Changes' : 'Next: Choose Template')}
                {step === 2 && 'Next: Add Details'}
                {step === 3 && 'Next: Customize'}
                {step === 4 && 'Next: Customer Reviews'}
                {step === 5 && 'Next: Social Links'}
                {step === 6 && 'Next: Finish'}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </footer>
      )}

      {/* Share modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowShareModal(false)} aria-label="Close" className="absolute top-4 right-4 text-zinc-400">
              <X className="w-5 h-5" />
            </button>
            <p className="text-3xl" aria-hidden="true">🎉</p>
            <h2 className="mt-2 text-lg font-bold text-zinc-900">Share Your Page</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Let your customers know about your new page.</p>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 px-3 py-2.5 rounded-xl bg-zinc-100 text-[11px] font-semibold text-zinc-600 truncate">{pageUrl}</div>
              <button onClick={copyLink} className="px-3.5 py-2.5 rounded-xl bg-blue-600 text-[11px] font-bold text-white shrink-0">
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="mt-5 flex items-start justify-between gap-2">
              {[
                { icon: Phone, label: 'WhatsApp', color: 'bg-[#25D366]' },
                { icon: Facebook, label: 'Facebook', color: 'bg-[#1877F2]' },
                { icon: Instagram, label: 'Instagram', color: 'bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600' },
                { icon: Twitter, label: 'X', color: 'bg-black' },
                { icon: Share2, label: 'More', color: 'bg-zinc-200' },
              ].map((s) => (
                <button key={s.label} className="flex flex-col items-center gap-1.5 min-w-0">
                  <span className={`w-10 h-10 rounded-full flex items-center justify-center ${s.color}`}>
                    <s.icon className="w-4.5 h-4.5 text-white" />
                  </span>
                  <span className="text-[9px] font-semibold text-zinc-500 truncate">{s.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-5 rounded-xl bg-amber-50 border border-amber-100 p-3.5 flex gap-2.5">
              <span className="text-lg" aria-hidden="true">💡</span>
              <div>
                <p className="text-[11px] font-bold text-amber-900">Pro Tip</p>
                <p className="text-[10px] text-amber-800/80 mt-0.5">Add this link to your social media bios, business cards and WhatsApp status to get more customers.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Welcome modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 relative">
            <button onClick={() => setShowWelcomeModal(false)} aria-label="Close" className="absolute top-4 right-4 text-zinc-400">
              <X className="w-5 h-5" />
            </button>
            <span className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
              <Rocket className="w-8 h-8 text-blue-600" />
            </span>
            <h2 className="mt-4 text-lg font-bold text-zinc-900 text-center">Welcome to LinkOS!</h2>
            <p className="mt-1 text-xs text-zinc-500 text-center">Your business page is live. Now grow your business with more features.</p>
            <ul className="mt-4 space-y-2.5">
              {['Beautiful website', 'Your services online', 'Customer reviews', 'Social media connected', 'Ready to receive customers'].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-xs font-semibold text-zinc-700">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <button onClick={() => navigate('/dashboard')} className="mt-5 w-full py-3.5 rounded-xl bg-blue-600 text-sm font-bold text-white">
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
