import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  MoreVertical,
  Eye,
  Copy,
  Check,
  ExternalLink,
  X,
  Camera,
  ChevronDown,
  Pencil,
  Plus,
  MoreHorizontal,
  MessageCircle,
  Phone,
  Mail,
  Link2,
  MapPin,
  Instagram,
  Facebook,
  Youtube,
  Globe,
  Calendar,
  Star,
  Save,
  FileText,
  ChevronLeft,
  ChevronRight,
  Search,
  Sun,
  Moon,
  Trash2,
  Wrench,
  LayoutGrid,
  PlusCircle,
  GripVertical,
  Package,
} from 'lucide-react';
import { LinkOsLogo } from '../../components/common/LinkOsLogo';
import { StorageService } from '../../lib/storage';
import { getTemplateById } from '../../data/templates';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { updateTemplate, type TemplateOverride, type TemplateServices } from '../../lib/templateService';
import { Profile, Product } from '../../types';
import { DEMO_REVIEWS } from '../../data/demoData';

const CATEGORY_OPTIONS = [
  'Café & Restaurant',
  'Car & Bike Service',
  'Salon & Spa',
  'Retail Shop',
  'Gym & Fitness',
  'Consulting',
  'Other',
];

const Toggle: React.FC<{ on: boolean; onChange: () => void; label: string }> = ({ on, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    aria-label={label}
    onClick={onChange}
    className={`relative w-10 h-5.5 rounded-full transition-colors shrink-0 ${on ? 'bg-blue-600' : 'bg-slate-700'}`}
    style={{ height: 22 }}
  >
    <span
      className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`}
      style={{ width: 18, height: 18 }}
    />
  </button>
);

const SectionCard: React.FC<{ title: string; children: React.ReactNode; onEdit?: () => void }> = ({
  title,
  children,
  onEdit,
}) => (
  <section className="rounded-2xl bg-[#0B1626] border border-white/5 p-4">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-bold text-white">{title}</h3>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-200 hover:bg-white/10 transition-colors"
        >
          <Pencil className="w-3 h-3" /> Edit
        </button>
      )}
    </div>
    {children}
  </section>
);

const inputCls =
  'w-full rounded-xl bg-[#060D1A] border border-white/10 px-3 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-600/20 transition-colors';

export const EditorPage: React.FC<{ templateMode?: boolean }> = ({ templateMode = false }) => {
  const outletCtx = useOutletContext<{
    profile: Profile | null;
    setProfile: (p: Profile) => void;
  } | null>();
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'settings'>('content');
  const [saving, setSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [toast, setToast] = useState<{
    show: boolean;
    type: 'success' | 'error';
    title: string;
    description?: string;
  } | null>(null);

  const triggerToast = (
    title: string,
    description?: string,
    type: 'success' | 'error' = 'success'
  ) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, title, description });
    setSavedToast(true);
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      setSavedToast(false);
    }, 3200);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const [copied, setCopied] = useState(false);
  const [reviewIdx, setReviewIdx] = useState(0);

  // Template-mode metadata (library-only fields, saved to the templates table)
  const [tplMeta, setTplMeta] = useState({ category: '', popularity: 0, is_pro: false, is_active: true });
  const [tplMissing, setTplMissing] = useState(false);

  // inline "add" forms
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [showAddService, setShowAddService] = useState(false);
  const [newSvcName, setNewSvcName] = useState('');
  const [newSvcPrice, setNewSvcPrice] = useState('');
  const [newSvcDesc, setNewSvcDesc] = useState('');
  const [newSvcImage, setNewSvcImage] = useState('');
  const [newTag, setNewTag] = useState('');
  const [showAddButton, setShowAddButton] = useState(false);
  const [newBtnTitle, setNewBtnTitle] = useState('');
  const [newBtnUrl, setNewBtnUrl] = useState('');
  const [addHoursIdx, setAddHoursIdx] = useState(false);

  // visibility toggles (defaults derived from data)
  const [contactVis, setContactVis] = useState({ whatsapp: true, call: true, email: false, website: true, location: true });
  const [socialVis, setSocialVis] = useState({ instagram: true, facebook: true, youtube: false });
  const [seoVisible, setSeoVisible] = useState(true);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (templateMode && templateId) {
      // Seed the same Profile-shaped editor from the template library row
      let cancelled = false;
      (async () => {
        const base = getTemplateById(templateId);
        if (!base) {
          if (!cancelled) setTplMissing(true);
          return;
        }
        let o: TemplateOverride | null = null;
        if (isSupabaseConfigured && supabase) {
          const { data } = await supabase.from('templates').select('*').eq('id', templateId).maybeSingle();
          o = (data as TemplateOverride) ?? null;
        }
        if (cancelled) return;
        const svc = (o?.services ?? null) as TemplateServices | null;
        setFormData({
          id: `tpl_${base.id}`,
          user_id: 'admin',
          business_name: o?.name || base.name,
          username: base.id,
          category: (o?.category as string) || base.category,
          description: o?.description || base.description,
          logo_url: o?.preview_url || '',
          phone: '',
          whatsapp: '',
          email: '',
          website: '',
          address: '',
          city: '',
          state: '',
          country: '',
          bio: o?.description || base.description,
          theme: (o?.theme as Profile['theme']) || base.theme,
          accent_color: o?.accent_color || base.accent_color,
          button_style: (o?.button_style as Profile['button_style']) || base.button_style,
          font_family: (o?.font_family as Profile['font_family']) || base.font_family,
          template_id: base.id,
          cover_url: o?.cover_url || '',
          plan: 'free',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        setProducts(Array.isArray(svc?.items) ? svc!.items : []);
        setTplMeta({
          category: o?.category || base.category,
          popularity: o?.popularity ?? base.popularity,
          is_pro: o?.is_pro ?? base.is_pro,
          is_active: o?.is_active ?? true,
        });
      })();
      return () => {
        cancelled = true;
      };
    }
    if (outletCtx?.profile) {
      setFormData({ ...outletCtx.profile });
      StorageService.getProducts(outletCtx.profile.id).then(setProducts).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateMode, templateId, outletCtx?.profile?.id]);

  if (tplMissing) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="text-sm font-bold text-white">Template not found</p>
        <button type="button" onClick={() => navigate('/admin/templates')} className="mt-3 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition-colors">
          Back to Templates
        </button>
      </div>
    );
  }

  if (!formData) {
    return <div className="text-center py-12 text-slate-400 text-xs">Loading editor…</div>;
  }

  const set = (field: keyof Profile, value: any) =>
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));

  const liveUrl = `linkos.in/${formData.username}`;

  const handleSave = async () => {
    setSaving(true);
    try {
      if (templateMode && templateId) {
        // Save back to the template library — no user profile is touched.
        // Published pages keep their own copied values; new pages pick these up.
        const svc: TemplateServices = { tags: serviceTags, items: products };
        const res = await updateTemplate(templateId, {
          name: formData.business_name.trim() || null,
          description: formData.bio?.trim() || null,
          category: tplMeta.category || null,
          theme: formData.theme,
          accent_color: formData.accent_color,
          button_style: formData.button_style,
          font_family: formData.font_family,
          cover_url: formData.cover_url || null,
          services: svc,
          popularity: Number.isFinite(tplMeta.popularity) ? tplMeta.popularity : 0,
          is_pro: tplMeta.is_pro,
          is_active: tplMeta.is_active,
        });
        if (res.error) {
          console.error('[v0] Failed to save template:', res.error);
          triggerToast('Failed to Save', typeof res.error === 'string' ? res.error : 'Please check your connection and try again.', 'error');
          return;
        }
        triggerToast('Template Saved!', 'Successfully saved to template library.');
        return;
      }
      // Persist the layout defaults when the owner never touched the tags,
      // so the live page keeps showing the same list after a save
      const payload = formData.service_tags?.length ? formData : { ...formData, service_tags: defaultTags };
      const updated = await StorageService.saveProfile(payload);
      outletCtx?.setProfile(updated);
      triggerToast('Saved Successfully!', 'Your changes are now live and updated.');
    } catch (err: any) {
      console.error('[v0] Failed to save profile:', err);
      triggerToast('Save Failed', 'Could not save changes. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const copyUrl = () => {
    navigator.clipboard?.writeText(`https://${liveUrl}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const upload = async (file: File, apply: (url: string) => void) => {
    try {
      const url = await StorageService.uploadImage(file, 'products');
      apply(url);
    } catch (err: any) {
      console.error('[v0] Image upload failed:', err);
    }
  };

  const addProduct = async () => {
    if (!newProdName.trim() || !formData) return;
    const p: Product = {
      id: `prod_${Date.now()}`,
      profile_id: formData.id,
      name: newProdName.trim(),
      description: '',
      price: Number(newProdPrice.replace(/[^0-9.]/g, '')) || 0,
      currency: '₹',
      image_url: '',
      category: 'Menu',
      available: true,
      featured: false,
      sort_order: products.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const saved = templateMode ? p : await StorageService.saveProduct(p).catch(() => p);
    setProducts((prev) => [...prev, saved]);
    setNewProdName('');
    setNewProdPrice('');
    setShowAddProduct(false);
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    if (!templateMode && formData) {
      const existing = products.find((p) => p.id === id);
      if (existing) {
        await StorageService.saveProduct({ ...existing, ...updates }).catch(() => {});
      }
    }
  };

  const uploadProductPhoto = async (productId: string, file: File) => {
    try {
      const url = await StorageService.uploadImage(file, 'products');
      if (productId === 'draft_initial') {
        handleProductChange('draft_initial', { image_url: url });
      } else {
        updateProduct(productId, { image_url: url });
      }
    } catch (err: any) {
      console.error('Failed to upload product image', err);
    }
  };

  const handleAddNewProduct = async () => {
    if (!formData) return;
    const newProd: Product = {
      id: `prod_${Date.now()}`,
      profile_id: formData.id,
      name: '',
      description: '',
      price: 0,
      offer_price: undefined,
      currency: '₹',
      image_url: '',
      category: '',
      available: true,
      featured: false,
      sort_order: products.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const saved = templateMode ? newProd : await StorageService.saveProduct(newProd).catch(() => newProd);
    setProducts((prev) => [...prev, saved]);
  };

  const handleProductChange = async (id: string, updates: Partial<Product>) => {
    if (id === 'draft_initial') {
      const newProd: Product = {
        id: `prod_${Date.now()}`,
        profile_id: formData?.id || '',
        name: '',
        description: '',
        price: 0,
        offer_price: undefined,
        currency: '₹',
        image_url: '',
        category: '',
        available: true,
        featured: false,
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...updates,
      };
      const saved = templateMode ? newProd : await StorageService.saveProduct(newProd).catch(() => newProd);
      setProducts([saved]);
      return;
    }
    updateProduct(id, updates);
  };

  const addService = async () => {
    if (!newSvcName.trim() || !formData) return;
    const p: Product = {
      id: `svc_${Date.now()}`,
      profile_id: formData.id,
      name: newSvcName.trim(),
      description: newSvcDesc.trim(),
      price: Number(newSvcPrice.replace(/[^0-9.]/g, '')) || 0,
      currency: '₹',
      image_url: newSvcImage,
      category: 'Services',
      available: true,
      featured: false,
      sort_order: products.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const saved = templateMode ? p : await StorageService.saveProduct(p).catch(() => p);
    setProducts((prev) => [...prev, saved]);
    setNewSvcName('');
    setNewSvcPrice('');
    setNewSvcDesc('');
    setNewSvcImage('');
    setShowAddService(false);
  };

  const uploadServiceImage = async (file: File) => {
    try {
      const url = await StorageService.uploadImage(file, 'products');
      setNewSvcImage(url);
    } catch (err: any) {
      console.error('[v0] Service image upload failed:', err);
    }
  };

  // Services feed the live page's "Our Services" carousel (garage/service layouts)
  const services = products.filter((p) => p.category === 'Services');

  // Service tags — the checklist shown in the live page's "Our Services" card (cafe/restaurant layouts)
  const SERVICE_SUGGESTIONS = [
    'Dine-in',
    'Takeaway',
    'Home Delivery',
    'Birthday & Event Bookings',
    'Custom Orders',
    'Free WiFi',
    'Table Reservation',
    'Outdoor Seating',
    'Catering Service',
    'Family Section',
    'Parking Available',
    'Live Music Nights',
  ];
  // Defaults shown on the live page when the owner hasn't picked tags yet —
  // the editor prefills these so what you edit matches what visitors see.
  const DEFAULT_TAGS_BY_LAYOUT: Record<string, string[]> = {
    cafe: ['Dine-in', 'Takeaway', 'Home Delivery', 'Birthday & Event Bookings', 'Custom Orders', 'Free WiFi'],
    garage: ['Engine Diagnostics', 'Oil Change', 'Brake Service', 'Wheel Alignment', 'Car Wash & Detailing', 'AC Service'],
  };
  const templateLayout = getTemplateById(formData.template_id || '')?.layout;
  const defaultTags = DEFAULT_TAGS_BY_LAYOUT[templateLayout || ''] || DEFAULT_TAGS_BY_LAYOUT.cafe;
  const serviceTags = formData.service_tags?.length ? formData.service_tags : defaultTags;
  const addTag = (t: string) => {
    const v = t.trim();
    if (!v || serviceTags.some((x) => x.toLowerCase() === v.toLowerCase())) return;
    set('service_tags', [...serviceTags, v]);
  };
  const removeTag = (t: string) => set('service_tags', serviceTags.filter((x) => x !== t));
  const tagSuggestions = SERVICE_SUGGESTIONS.filter((s) => !serviceTags.some((x) => x.toLowerCase() === s.toLowerCase()));

  const removeProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (!templateMode) await StorageService.deleteProduct(id).catch(() => {});
  };

  const addCustomButton = () => {
    if (!newBtnTitle.trim() || !newBtnUrl.trim()) return;
    const link = {
      id: `link_${Date.now()}`,
      title: newBtnTitle.trim(),
      url: newBtnUrl.startsWith('http') ? newBtnUrl : `https://${newBtnUrl}`,
      icon: 'globe',
      enabled: true,
      sort_order: (formData.custom_links?.length || 0) + 1,
    };
    set('custom_links', [...(formData.custom_links || []), link]);
    setNewBtnTitle('');
    setNewBtnUrl('');
    setShowAddButton(false);
  };

  const reviews = DEMO_REVIEWS;
  const review = reviews[reviewIdx % reviews.length];

  return (
    <div className="mx-auto max-w-lg pb-10">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(templateMode ? '/admin/templates' : '/dashboard')}
            aria-label={templateMode ? 'Back to templates' : 'Back to dashboard'}
            className="p-2 rounded-full text-slate-200 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          {templateMode ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/15 border border-violet-500/30 px-3 py-1.5 text-[11px] font-bold text-violet-300">
              <LayoutGrid className="w-3.5 h-3.5" /> Template Editor
            </span>
          ) : (
            <LinkOsLogo size="sm" tone="light" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <a
            href={templateMode ? `/templates/preview/${templateId}` : `/${formData.username}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-slate-100 hover:bg-white/10 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> Preview
          </a>
          <button type="button" aria-label="More options" className="p-2 rounded-full text-slate-200 hover:bg-white/10 transition-colors">
            <MoreVertical className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className={`mt-3 grid gap-1 rounded-2xl bg-[#0B1626] border border-white/5 p-1.5 ${templateMode ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {((templateMode ? ['content', 'design'] : ['content', 'design', 'settings']) as ('content' | 'design' | 'settings')[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveTab(t)}
            className={`py-2 rounded-xl text-xs font-bold capitalize transition-colors ${
              activeTab === t ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {savedToast && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-400">
          <Check className="w-4 h-4" /> {templateMode ? 'Template saved to library' : 'Changes saved & live'}
        </div>
      )}

      {/* ══════════ CONTENT TAB ══════════ */}
      {activeTab === 'content' && (
        <div className="mt-4 space-y-4">
          {/* Template Library info (admin template mode) */}
          {templateMode && (
            <section className="rounded-2xl bg-violet-500/[0.07] border border-violet-500/25 p-4">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-violet-300" />
                <h3 className="text-sm font-bold text-white">Editing Template Library</h3>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-300">
                Changes are saved to the <strong className="text-violet-300">{templateId}</strong> template —
                they apply to every new page built from it. Businesses that already published keep their own copied design.
              </p>
            </section>
          )}

          {/* Page Status */}
          {!templateMode && (
          <section className="rounded-2xl bg-[#0B1626] border border-white/5 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Page Status</h3>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Published
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">Your page is live at</p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <button type="button" onClick={copyUrl} className="flex items-center gap-1.5 text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors">
                {liveUrl}
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              </button>
              <a
                href={`/${formData.username}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-3.5 py-2 text-xs font-bold text-white transition-colors shrink-0"
              >
                Visit Page <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </section>
          )}

          {/* Template Settings — library-only metadata */}
          {templateMode && (
            <SectionCard title="Template Settings">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="tpl-category" className="block text-[11px] font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    id="tpl-category"
                    value={tplMeta.category}
                    onChange={(e) => setTplMeta((m) => ({ ...m, category: e.target.value }))}
                    className={inputCls}
                  >
                    {['Business', 'Food & Cafe', 'Retail', 'Services', 'Beauty & Spa', 'Fitness', 'Creative', 'Real Estate', 'Education', 'Events', 'Health', 'Tech'].map((c) => (
                      <option key={c} value={c} className="bg-[#0B1626]">{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="tpl-popularity" className="block text-[11px] font-semibold text-slate-300 mb-1">Popularity</label>
                  <input
                    id="tpl-popularity"
                    type="number"
                    min={0}
                    max={100}
                    value={tplMeta.popularity}
                    onChange={(e) => setTplMeta((m) => ({ ...m, popularity: Number(e.target.value) }))}
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="mt-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-slate-300">Pro template</p>
                  <Toggle on={tplMeta.is_pro} label="Pro template" onChange={() => setTplMeta((m) => ({ ...m, is_pro: !m.is_pro }))} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-300">Active in gallery</p>
                    <p className="text-[10px] text-slate-500">Inactive templates are hidden from users</p>
                  </div>
                  <Toggle on={tplMeta.is_active} label="Template active" onChange={() => setTplMeta((m) => ({ ...m, is_active: !m.is_active }))} />
                </div>
              </div>
            </SectionCard>
          )}

          {/* Cover Image */}
          <SectionCard title="Cover Image">
            {formData.cover_url?.trim() ? (
              <div className="relative rounded-xl overflow-hidden">
                <img src={formData.cover_url.trim()} alt="Cover preview" className="h-36 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => set('cover_url', '')}
                  aria-label="Remove cover image"
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-900/80 border border-white/20 text-white flex items-center justify-center hover:bg-slate-900"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="absolute inset-0 m-auto w-fit h-fit inline-flex items-center gap-2 rounded-xl bg-slate-900/80 backdrop-blur border border-white/15 px-4 py-2 text-xs font-bold text-white hover:bg-slate-900 transition-colors"
                >
                  <Camera className="w-4 h-4" /> Upload Cover Image
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="w-full rounded-xl border border-dashed border-white/15 bg-[#060D1A] py-8 flex flex-col items-center gap-1.5 text-slate-400 hover:text-slate-200 hover:border-white/25 transition-colors"
              >
                <Camera className="w-5 h-5" />
                <span className="text-xs font-semibold">Upload Cover Image</span>
              </button>
            )}
            <p className="mt-2 text-center text-[10px] text-slate-500">Recommended size: 1200 x 630 (JPG, PNG, WebP)</p>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], (url) => set('cover_url', url))}
            />
          </SectionCard>

          {/* Basic Information */}
          <SectionCard title="Basic Information">
            <div className="flex gap-3">
              <div className="flex-1 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Business Name</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      maxLength={60}
                      value={formData.business_name}
                      onChange={(e) => set('business_name', e.target.value)}
                      className={`${inputCls} pl-9`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-slate-500">{formData.business_name.length}/60</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Short Description</label>
                  <div className="relative">
                    <textarea
                      rows={2}
                      maxLength={120}
                      value={formData.description}
                      onChange={(e) => set('description', e.target.value)}
                      className={`${inputCls} resize-none pb-5`}
                    />
                    <span className="absolute right-3 bottom-2 text-[9px] text-slate-500">{formData.description.length}/120</span>
                  </div>
                </div>
              </div>
              <div className="relative w-24 shrink-0 self-start">
                <div className="h-28 w-full rounded-xl overflow-hidden border border-white/10 bg-[#060D1A]">
                  {(formData.avatar_url?.trim() || formData.logo_url?.trim()) ? (
                    <img src={(formData.avatar_url?.trim() || formData.logo_url?.trim())} alt="Logo preview" className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="absolute bottom-1.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-lg bg-slate-900/85 backdrop-blur border border-white/15 px-2 py-1 text-[9px] font-bold text-white hover:bg-slate-900 transition-colors whitespace-nowrap"
                >
                  <Camera className="w-3 h-3" /> Change
                </button>
              </div>
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], (url) => set('avatar_url', url))}
            />
            <div className="mt-3">
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Category</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">☕</span>
                <select
                  value={formData.category}
                  onChange={(e) => set('category', e.target.value)}
                  className={`${inputCls} appearance-none pl-9 pr-9`}
                >
                  {[...new Set([formData.category, ...CATEGORY_OPTIONS])].filter(Boolean).map((c) => (
                    <option key={c} value={c} className="bg-[#0B1626]">{c}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </SectionCard>

          {/* Contact Information */}
          <SectionCard title="Contact Information">
            <div className="space-y-1">
              {([
                { key: 'whatsapp', icon: <MessageCircle className="w-4 h-4 text-emerald-400" />, label: 'WhatsApp', value: formData.whatsapp, setVal: (v: string) => set('whatsapp', v) },
                { key: 'call', icon: <Phone className="w-4 h-4 text-slate-300" />, label: 'Call', value: formData.phone, setVal: (v: string) => set('phone', v) },
                { key: 'email', icon: <Mail className="w-4 h-4 text-slate-300" />, label: 'Email', value: formData.email, setVal: (v: string) => set('email', v) },
                { key: 'website', icon: <Link2 className="w-4 h-4 text-slate-300" />, label: 'Website', value: formData.website, setVal: (v: string) => set('website', v) },
                { key: 'location', icon: <MapPin className="w-4 h-4 text-slate-300" />, label: 'Location', value: [formData.city, formData.state].filter(Boolean).join(', '), setVal: (v: string) => set('city', v) },
              ] as const).map((row) => (
                <div key={row.key} className="flex items-center gap-3 rounded-xl px-1 py-2">
                  <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">{row.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-slate-200">{row.label}</p>
                    <input
                      type="text"
                      value={row.value || ''}
                      onChange={(e) => row.setVal(e.target.value)}
                      className="w-full bg-transparent text-[11px] text-slate-400 outline-none border-b border-transparent focus:border-blue-500/50 transition-colors"
                    />
                  </div>
                  <Toggle
                    on={contactVis[row.key]}
                    label={`${row.label} visible`}
                    onChange={() => setContactVis((v) => ({ ...v, [row.key]: !v[row.key] }))}
                  />
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Social Media */}
          <SectionCard title="Social Media">
            <div className="grid grid-cols-3 gap-2">
              {([
                { key: 'instagram', icon: <Instagram className="w-5 h-5 text-pink-500" />, label: '@urbanbrew', value: formData.instagram, setVal: (v: string) => set('instagram', v) },
                { key: 'facebook', icon: <Facebook className="w-5 h-5 text-blue-500" />, label: 'Facebook', value: formData.facebook, setVal: (v: string) => set('facebook', v) },
                { key: 'youtube', icon: <Youtube className="w-5 h-5 text-red-500" />, label: 'YouTube', value: formData.youtube, setVal: (v: string) => set('youtube', v) },
              ] as const).map((s) => (
                <div key={s.key} className="rounded-xl bg-[#060D1A] border border-white/10 p-2.5 flex flex-col items-center gap-1.5">
                  <div className="flex w-full items-start justify-between">
                    <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">{s.icon}</span>
                    <button type="button" aria-label={`${s.label} options`} className="text-slate-500 hover:text-slate-300">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={s.value || ''}
                    onChange={(e) => s.setVal(e.target.value)}
                    placeholder="username"
                    className="w-full bg-transparent text-center text-[9px] text-slate-300 outline-none border-b border-transparent focus:border-blue-500/50"
                  />
                  <Toggle on={socialVis[s.key]} label={`${s.label} visible`} onChange={() => setSocialVis((v) => ({ ...v, [s.key]: !v[s.key] }))} />
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Business Hours */}
          <SectionCard title="Business Hours">
            <div className="space-y-2">
              {(formData.business_hours || []).map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={h.days}
                    onChange={(e) => {
                      const next = [...(formData.business_hours || [])];
                      next[i] = { ...next[i], days: e.target.value };
                      set('business_hours', next);
                    }}
                    className={`${inputCls} flex-1`}
                  />
                  <input
                    type="text"
                    value={h.hours}
                    onChange={(e) => {
                      const next = [...(formData.business_hours || [])];
                      next[i] = { ...next[i], hours: e.target.value };
                      set('business_hours', next);
                    }}
                    className={`${inputCls} flex-1`}
                  />
                  <button
                    type="button"
                    aria-label="Remove hours row"
                    onClick={() => set('business_hours', (formData.business_hours || []).filter((_, j) => j !== i))}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            {addHoursIdx ? (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Days (e.g. Mon - Fri)"
                  value={newBtnTitle}
                  onChange={(e) => setNewBtnTitle(e.target.value)}
                  className={`${inputCls} flex-1`}
                />
                <input
                  type="text"
                  placeholder="9:00 AM – 8:00 PM"
                  value={newBtnUrl}
                  onChange={(e) => setNewBtnUrl(e.target.value)}
                  className={`${inputCls} flex-1`}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newBtnTitle.trim()) return;
                    set('business_hours', [...(formData.business_hours || []), { days: newBtnTitle.trim(), hours: newBtnUrl.trim() || 'Closed' }]);
                    setNewBtnTitle('');
                    setNewBtnUrl('');
                    setAddHoursIdx(false);
                  }}
                  className="rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition-colors"
                >
                  Add
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAddHoursIdx(true)}
                className="mt-2 w-full rounded-xl border border-dashed border-white/15 py-2 text-[11px] font-semibold text-slate-400 hover:text-slate-200 hover:border-white/25 transition-colors"
              >
                + Add Hours Row
              </button>
            )}
          </SectionCard>

          {/* Gallery */}
          <SectionCard title="Gallery">
            <div className="grid grid-cols-4 gap-2">
              {(formData.gallery || []).map((src, i) => (
                src?.trim() ? (
                  <div key={i} className="relative rounded-lg overflow-hidden border border-white/10">
                    <img src={src.trim()} alt={`Gallery photo ${i + 1}`} className="h-16 w-full object-cover" />
                    <button
                      type="button"
                      aria-label={`Remove gallery photo ${i + 1}`}
                      onClick={() => set('gallery', (formData.gallery || []).filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 w-4.5 h-4.5 rounded-full bg-slate-900/85 border border-white/20 text-white flex items-center justify-center hover:bg-slate-900"
                      style={{ width: 18, height: 18 }}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ) : null
              ))}
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="h-16 rounded-lg border border-dashed border-white/15 bg-[#060D1A] flex flex-col items-center justify-center gap-0.5 text-slate-400 hover:text-slate-200 hover:border-white/25 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-[9px] font-semibold">Add Photos</span>
              </button>
            </div>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], (url) => set('gallery', [...(formData.gallery || []), url]))}
            />
          </SectionCard>

          {/* Our Services — feeds the live page's "Our Services" card & carousel */}
          <SectionCard title="Our Services">
            {/* Service tags — checklist on the live page */}
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Service Tags</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {serviceTags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 rounded-full bg-blue-600/15 border border-blue-500/30 px-2.5 py-1 text-[11px] font-semibold text-blue-300">
                  {t}
                  <button type="button" aria-label={`Remove ${t}`} onClick={() => removeTag(t)} className="text-blue-400/70 hover:text-red-400 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {serviceTags.length === 0 && (
                <p className="text-[11px] text-slate-500">No tags yet — pick from the suggestions below or add your own.</p>
              )}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                placeholder="Add a service tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(newTag);
                    setNewTag('');
                  }
                }}
                className={`${inputCls} flex-1`}
              />
              <button
                type="button"
                onClick={() => { addTag(newTag); setNewTag(''); }}
                className="rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition-colors"
              >
                Add
              </button>
            </div>
            {tagSuggestions.length > 0 && (
              <div className="mt-2">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Suggestions</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {tagSuggestions.slice(0, 8).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addTag(s)}
                      className="rounded-full border border-dashed border-white/20 bg-[#060D1A] px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:border-blue-500/50 hover:text-blue-300 transition-colors"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Priced services — carousel on garage/service layouts */}
            <p className="mt-4 text-[10px] font-bold uppercase tracking-wide text-slate-500">Priced Services</p>
            <div className="mt-1.5 space-y-2">
              {services.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl bg-[#060D1A] border border-white/10 p-2">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 shrink-0">
                    {p.image_url?.trim() ? (
                      <img src={p.image_url.trim()} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600"><Wrench className="w-4 h-4" /></div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{p.name}</p>
                    {p.description && <p className="text-[10px] text-slate-500 truncate">{p.description}</p>}
                    <p className="text-[11px] text-blue-400 font-bold">{p.currency === '₹' ? '₹' : ''}{p.price}</p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Delete ${p.name}`}
                    onClick={() => removeProduct(p.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {services.length === 0 && (
                <p className="text-[11px] text-slate-500 py-1">No services yet — add the services your business offers (shown on your live page).</p>
              )}
            </div>
            {showAddService ? (
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Service name (e.g. Oil Change)"
                    value={newSvcName}
                    onChange={(e) => setNewSvcName(e.target.value)}
                    className={`${inputCls} flex-1`}
                  />
                  <input
                    type="text"
                    placeholder="₹ Price"
                    value={newSvcPrice}
                    onChange={(e) => setNewSvcPrice(e.target.value)}
                    className={`${inputCls} w-20`}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Short description (optional)"
                  value={newSvcDesc}
                  onChange={(e) => setNewSvcDesc(e.target.value)}
                  className={`${inputCls} w-full`}
                />
                <div className="flex items-center gap-2">
                  <label className="flex-1 rounded-xl border border-dashed border-white/15 bg-[#060D1A] px-3 py-2.5 text-[11px] text-slate-400 cursor-pointer hover:border-white/30 transition-colors truncate">
                    {newSvcImage?.trim() ? 'Image added — tap to change' : 'Upload service photo (optional)'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadServiceImage(f); }} />
                  </label>
                  {newSvcImage?.trim() ? (
                    <img src={newSvcImage.trim()} alt="Service preview" className="w-10 h-10 rounded-lg object-cover border border-white/10" />
                  ) : null}
                  <button type="button" onClick={addService} className="rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition-colors">
                    Add
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddService(true)}
                className="mt-2 w-full rounded-xl border border-dashed border-blue-500/40 bg-blue-600/10 py-2.5 text-xs font-bold text-blue-400 hover:bg-blue-600/20 transition-colors"
              >
                + Add Service
              </button>
            )}
          </SectionCard>

          {/* Products & Services */}
          <SectionCard title="Products / Menu Items">
            {/* Products List */}
            <div className="space-y-4">
              {(products.length > 0
                ? products
                : [
                    {
                      id: 'draft_initial',
                      profile_id: formData?.id || '',
                      name: '',
                      description: '',
                      price: 0,
                      offer_price: undefined,
                      currency: '₹',
                      image_url: '',
                      category: '',
                      available: true,
                      featured: false,
                      sort_order: 1,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    },
                  ]
              ).map((p) => {
                const hasOffer = typeof p.offer_price === 'number' && p.offer_price > 0;
                const isAvailable = p.available !== false;

                return (
                  <div
                    key={p.id}
                    className="rounded-2xl border border-white/10 bg-[#060D1A] p-4 sm:p-5 shadow-xs text-white space-y-3.5 transition-all"
                  >
                    {/* Row 1: Drag handle + Photo upload + Name + Price */}
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      {/* Drag handle */}
                      <div
                        className="pt-2 text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing shrink-0"
                        title="Drag to reorder"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>

                      {/* Photo Box */}
                      <label className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl border-2 border-dashed border-white/15 hover:border-blue-500/50 bg-[#0B1626]/80 flex items-center justify-center shrink-0 cursor-pointer overflow-hidden group transition-colors">
                        {p.image_url?.trim() ? (
                          <>
                            <img
                              src={p.image_url.trim()}
                              alt={p.name || 'Product'}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-semibold">
                              <Camera className="w-5 h-5" />
                            </span>
                          </>
                        ) : (
                          <Camera className="w-6 h-6 text-slate-400 group-hover:text-blue-400 transition-colors" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              uploadProductPhoto(p.id, e.target.files[0]);
                            }
                          }}
                        />
                      </label>

                      {/* Product Name & Price Column */}
                      <div className="flex-1 min-w-0 flex items-center gap-3">
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Product name"
                            value={p.name}
                            onChange={(e) => handleProductChange(p.id, { name: e.target.value })}
                            className="w-full h-11 sm:h-12 rounded-xl border border-white/10 bg-[#0B1626] px-3.5 text-xs sm:text-sm font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-600/20 transition-all"
                          />
                        </div>

                        <div className="w-24 sm:w-28 shrink-0">
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                            Price (₹)
                          </label>
                          <input
                            type="text"
                            placeholder="₹0"
                            value={p.price || ''}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9.]/g, '');
                              handleProductChange(p.id, { price: val ? Number(val) : 0 });
                            }}
                            className="w-full h-9 rounded-xl border border-white/10 bg-[#0B1626] px-3 text-xs sm:text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-600/20 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Offer Price + Toggle + Delete */}
                    <div className="flex items-center justify-between gap-3 pl-6 sm:pl-7">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Offer Price (₹)
                        </label>
                        <div className="flex items-center gap-2.5">
                          <input
                            type="text"
                            placeholder="-"
                            value={p.offer_price ?? ''}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9.]/g, '');
                              handleProductChange(p.id, {
                                offer_price: val ? Number(val) : undefined,
                              });
                            }}
                            className="w-28 h-9 rounded-xl border border-white/10 bg-[#0B1626] px-3 text-xs sm:text-sm font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-600/20 transition-all"
                          />

                          {/* Offer Price Toggle */}
                          <button
                            type="button"
                            role="switch"
                            aria-checked={hasOffer}
                            aria-label="Toggle offer price discount"
                            onClick={() => {
                              if (hasOffer) {
                                handleProductChange(p.id, { offer_price: undefined });
                              } else {
                                handleProductChange(p.id, {
                                  offer_price: p.price ? Math.round(p.price * 0.9) : 0,
                                });
                              }
                            }}
                            className={`relative w-10 h-5.5 rounded-full transition-colors shrink-0 ${
                              hasOffer ? 'bg-blue-600' : 'bg-slate-700'
                            }`}
                            style={{ height: 22 }}
                          >
                            <span
                              className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-all ${
                                hasOffer ? 'left-[20px]' : 'left-0.5'
                              }`}
                              style={{ width: 18, height: 18 }}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (p.id !== 'draft_initial') {
                            removeProduct(p.id);
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                        title="Delete product"
                        aria-label={`Delete ${p.name || 'product'}`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Row 3: Category / Unit input */}
                    <div className="pl-6 sm:pl-7">
                      <input
                        type="text"
                        placeholder="Category (e.g. Starters, Desserts)"
                        value={p.category || ''}
                        onChange={(e) => handleProductChange(p.id, { category: e.target.value })}
                        className="w-48 sm:w-56 h-9 rounded-xl border border-white/10 bg-[#0B1626] px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-600/20 transition-all"
                      />
                    </div>

                    {/* Row 4: Short description + Available Switch */}
                    <div className="flex items-center gap-3 pl-6 sm:pl-7">
                      <input
                        type="text"
                        placeholder="Short description"
                        value={p.description || ''}
                        onChange={(e) => handleProductChange(p.id, { description: e.target.value })}
                        className="flex-1 h-9 rounded-xl border border-white/10 bg-[#0B1626] px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-600/20 transition-all"
                      />

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-semibold text-slate-300">Available</span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isAvailable}
                          aria-label="Toggle availability"
                          onClick={() => handleProductChange(p.id, { available: !isAvailable })}
                          className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                            isAvailable ? 'bg-emerald-500' : 'bg-slate-700'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                              isAvailable ? 'left-[22px]' : 'left-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Direct child button: Add New Product */}
            <button
              type="button"
              onClick={handleAddNewProduct}
              className="mt-4 w-full rounded-2xl border-2 border-dashed border-blue-500/35 bg-blue-600/[0.08] hover:bg-blue-600/[0.16] py-5 px-4 flex flex-col items-center justify-center text-center transition-colors group cursor-pointer"
            >
              <div className="flex items-center justify-center gap-2 text-blue-400 font-bold text-sm sm:text-base group-hover:text-blue-300">
                <PlusCircle className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                <span>Add New Product</span>
              </div>
              <p className="mt-1 text-xs text-slate-400 group-hover:text-slate-300">
                Upload image, add details and make your menu look amazing.
              </p>
            </button>

            {/* 3 Tip cards below */}
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-[#060D1A] p-3.5 flex items-center gap-3.5 shadow-2xs">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <Camera className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    High quality photos
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                    Use clear, attractive images
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#060D1A] p-3.5 flex items-center gap-3.5 shadow-2xs">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <Star className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    Highlight best items
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                    Mark popular items
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#060D1A] p-3.5 flex items-center gap-3.5 shadow-2xs">
                <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-white">Offer discounts</h4>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                    Show special prices
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Custom Buttons */}
          <SectionCard title="Custom Buttons">
            <div className="space-y-1">
              {(formData.custom_links || []).map((l) => (
                <div key={l.id} className="flex items-center gap-3 rounded-xl px-1 py-2">
                  <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4 text-slate-300" />
                  </span>
                  <p className="flex-1 text-xs font-semibold text-slate-200 truncate">{l.title}</p>
                  <Toggle
                    on={l.enabled !== false}
                    label={`${l.title} visible`}
                    onChange={() =>
                      set(
                        'custom_links',
                        (formData.custom_links || []).map((x) => (x.id === l.id ? { ...x, enabled: x.enabled === false } : x)),
                      )
                    }
                  />
                  <button
                    type="button"
                    aria-label={`Remove ${l.title}`}
                    onClick={() => set('custom_links', (formData.custom_links || []).filter((x) => x.id !== l.id))}
                    className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            {showAddButton ? (
              <div className="mt-2 space-y-2">
                <input type="text" placeholder="Button title (e.g. Book a Table)" value={newBtnTitle} onChange={(e) => setNewBtnTitle(e.target.value)} className={inputCls} />
                <div className="flex items-center gap-2">
                  <input type="text" placeholder="https://…" value={newBtnUrl} onChange={(e) => setNewBtnUrl(e.target.value)} className={`${inputCls} flex-1`} />
                  <button type="button" onClick={addCustomButton} className="rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition-colors">
                    Add
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddButton(true)}
                className="mt-2 w-full rounded-xl border border-dashed border-blue-500/40 bg-blue-600/10 py-2.5 text-xs font-bold text-blue-400 hover:bg-blue-600/20 transition-colors"
              >
                + Add Button
              </button>
            )}
          </SectionCard>

          {/* Reviews */}
          <SectionCard title="Reviews">
            <div className="relative rounded-xl bg-[#060D1A] border border-white/10 p-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xs font-extrabold text-blue-300 shrink-0">
                  {review.author_name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-white truncate">{review.author_name}</p>
                    <span className="text-[9px] text-slate-500 shrink-0">{review.date}</span>
                  </div>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700 fill-slate-700'}`} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-2.5 text-[11px] leading-relaxed text-slate-300 text-pretty">“{review.text}”</p>
              <button
                type="button"
                aria-label="Previous review"
                onClick={() => setReviewIdx((i) => (i - 1 + reviews.length) % reviews.length)}
                className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#0B1626] border border-white/10 text-slate-300 flex items-center justify-center hover:bg-white/10"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label="Next review"
                onClick={() => setReviewIdx((i) => (i + 1) % reviews.length)}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#0B1626] border border-white/10 text-slate-300 flex items-center justify-center hover:bg-white/10"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <div className="mt-3 flex justify-center gap-1.5">
                {reviews.map((_, i) => (
                  <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === reviewIdx % reviews.length ? 'bg-blue-500' : 'bg-slate-700'}`} />
                ))}
              </div>
            </div>
          </SectionCard>

          {/* SEO & Settings */}
          {!templateMode && (
          <SectionCard title="SEO &amp; Settings">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold text-slate-300 shrink-0">Custom URL</p>
              <button type="button" onClick={copyUrl} className="flex flex-1 items-center justify-end gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors min-w-0">
                <span className="truncate">{liveUrl}</span>
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <Copy className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-300">Search Engine Visibility</p>
                <p className="text-[10px] text-slate-500">{seoVisible ? 'Visible to search engines' : 'Hidden from search engines'}</p>
              </div>
              <Toggle on={seoVisible} label="Search engine visibility" onChange={() => setSeoVisible((v) => !v)} />
            </div>
          </SectionCard>
          )}

          {/* About Us */}
          <SectionCard title="About Us">
            <div className="relative">
              <textarea
                rows={3}
                maxLength={300}
                value={formData.bio || ''}
                onChange={(e) => set('bio', e.target.value)}
                placeholder="Tell customers about your business…"
                className={`${inputCls} resize-none pb-5`}
              />
              <span className="absolute right-3 bottom-2 text-[9px] text-slate-500">{(formData.bio || '').length}/300</span>
            </div>
          </SectionCard>

          {/* Save + View Live */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving…' : templateMode ? 'Save to Template Library' : 'Save Changes'}
            </button>
            <a
              href={templateMode ? `/templates/preview/${templateId}` : `/${formData.username}`}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 py-3 text-sm font-bold text-white transition-colors"
            >
              {templateMode ? 'Preview Template' : 'View Live Page'} <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {/* ══════════ DESIGN TAB ══════════ */}
      {activeTab === 'design' && (
        <div className="mt-4 space-y-4">
          <SectionCard title="Appearance Mode">
            <div className="grid grid-cols-2 gap-2">
              {([
                { id: 'light', name: 'Light', icon: Sun },
                { id: 'dark', name: 'Dark', icon: Moon },
              ] as const).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => set('theme_mode', m.id)}
                  className={`rounded-xl border p-3 flex items-center gap-2.5 transition-colors ${
                    (formData.theme_mode || 'light') === m.id ? 'border-blue-500 bg-blue-600/10' : 'border-white/10 bg-[#060D1A] hover:border-white/25'
                  }`}
                >
                  <m.icon className="w-4 h-4 text-slate-300" />
                  <span className="text-xs font-semibold text-slate-200">{m.name}</span>
                  {(formData.theme_mode || 'light') === m.id && <Check className="w-4 h-4 text-blue-400 ml-auto" />}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-2.5">Visitors also get a sun/moon toggle on your live page.</p>
          </SectionCard>

          <SectionCard title="Theme">
            <div className="grid grid-cols-2 gap-2">
              {([
                { id: 'neutral', name: 'Neutral White', bg: '#FAFAFA' },
                { id: 'cream', name: 'Warm Cream', bg: '#FDFBF7' },
                { id: 'charcoal', name: 'Charcoal', bg: '#18181B' },
                { id: 'dark', name: 'Midnight', bg: '#0A0A0C' },
              ] as const).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => set('theme', t.id)}
                  className={`rounded-xl border p-3 flex items-center gap-2.5 transition-colors ${
                    formData.theme === t.id ? 'border-blue-500 bg-blue-600/10' : 'border-white/10 bg-[#060D1A] hover:border-white/25'
                  }`}
                >
                  <span className="w-8 h-8 rounded-lg border border-white/20" style={{ background: t.bg }} />
                  <span className="text-xs font-semibold text-slate-200">{t.name}</span>
                  {formData.theme === t.id && <Check className="w-4 h-4 text-blue-400 ml-auto" />}
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Accent Color">
            <div className="flex gap-2.5">
              {['#2563EB', '#059669', '#EA580C', '#DC2626', '#7C3AED', '#18181B'].map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Accent ${c}`}
                  onClick={() => set('accent_color', c)}
                  className={`w-9 h-9 rounded-full border-2 transition-transform ${formData.accent_color === c ? 'border-white scale-110' : 'border-white/20'}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Button Style">
            <div className="grid grid-cols-3 gap-2">
              {(['pill', 'rounded', 'sharp'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set('button_style', s)}
                  className={`py-2.5 text-xs font-bold capitalize transition-colors ${
                    formData.button_style === s ? 'bg-blue-600 text-white' : 'bg-[#060D1A] border border-white/10 text-slate-300 hover:border-white/25'
                  } ${s === 'pill' ? 'rounded-full' : s === 'sharp' ? 'rounded-sm' : 'rounded-xl'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Font">
            <div className="grid grid-cols-2 gap-2">
              {(['inter', 'serif', 'mono', 'playfair'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => set('font_family', f)}
                  className={`py-2.5 text-xs font-bold capitalize transition-colors ${
                    formData.font_family === f ? 'bg-blue-600 text-white' : 'bg-[#060D1A] border border-white/10 text-slate-300 hover:border-white/25'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </SectionCard>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      )}

      {/* ══════════ SETTINGS TAB ══════════ */}
      {activeTab === 'settings' && (
        <div className="mt-4 space-y-4">
          <SectionCard title="Page Address">
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Username (your page URL)</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={formData.username}
                onChange={(e) => set('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                className={`${inputCls} pl-9`}
              />
            </div>
            <p className="mt-1.5 text-[10px] text-slate-500">Your page: linkos.in/{formData.username || '…'}</p>
          </SectionCard>

          <SectionCard title="WhatsApp Booking Message">
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Pre-filled message</label>
            <textarea
              rows={2}
              value={formData.whatsapp_message || ''}
              onChange={(e) => set('whatsapp_message', e.target.value)}
              placeholder="Hi! I saw your LinkOS page and would like to inquire."
              className={`${inputCls} resize-none`}
            />
          </SectionCard>

          <SectionCard title="Queue / Booking">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-300">Customer Queue</p>
                <p className="text-[10px] text-slate-500">Let customers join a live queue from your page</p>
              </div>
              <Toggle on={formData.queue_enabled !== false} label="Queue enabled" onChange={() => set('queue_enabled', formData.queue_enabled === false)} />
            </div>
          </SectionCard>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      )}

      {/* ── Fixed Floating Toast Notification ── */}
      <AnimatePresence>
        {toast?.show && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 32, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 400, damping: 26 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3.5 px-4.5 py-3.5 rounded-2xl backdrop-blur-xl border shadow-2xl min-w-[300px] max-w-[92vw] sm:max-w-md ${
              toast.type === 'error'
                ? 'bg-[#180A0E]/95 border-red-500/40 text-white shadow-red-950/40'
                : 'bg-[#071322]/95 border-emerald-500/40 text-white shadow-black/80'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                toast.type === 'error'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {toast.type === 'error' ? (
                <X className="w-4 h-4 stroke-[2.5]" />
              ) : (
                <Check className="w-4 h-4 stroke-[2.5]" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-bold text-white tracking-tight">
                {toast.title}
              </p>
              {toast.description && (
                <p className="text-[11px] text-slate-300 mt-0.5 truncate">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors shrink-0 cursor-pointer"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
