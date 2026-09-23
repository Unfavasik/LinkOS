import React from 'react';
import { MessageCircle, Phone, Navigation, Share2, ChevronRight, Star, Clock, MapPin, ArrowUpRight, Users, ShieldCheck, ShoppingBag, Crown, Info, Settings, Check, Camera, Play, Mail, Instagram, Plus, Wrench, Hammer, Cog, BadgeCheck, Bookmark, Car, Menu, Search, Heart, CalendarCheck, Home, LayoutGrid, Images, ArrowRight, Infinity as InfinityIcon, Link2 } from 'lucide-react';
import { Profile, Product } from '../../types';
import { LinksList } from './LinksList';
import { ReviewsSection } from './ReviewsSection';
import { BusinessInfoCard } from './BusinessInfoCard';
import { ActionRow, QueueSection, ShareCard, SiteFooter } from './TemplateSite';
import { GoogleMapEmbed, buildMapQuery } from '../common/GoogleMapEmbed';

/* eslint-disable react-refresh/only-export-components */

interface LayoutProps {
  profile: Profile;
  products: Product[];
  links: import('../../types').LinkItem[];
  reviews: import('../../types').Review[];
  onSelectProduct: (p: Product) => void;
  onShare: () => void;
}

const inr = (p: Product) => `${p.currency === 'INR' ? '₹' : p.currency === 'USD' ? '$' : ''}${p.price}`;

/* ================= TERMINAL — "terminal war room" ================= */
export function TerminalLayout({ profile, products, links, reviews, onSelectProduct, onShare }: LayoutProps) {
  return (
    <div className="min-h-full bg-[#0A0F0A] text-[#C8E6C9] font-mono text-[13px]">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center gap-1.5 border-b border-[#1E3321] pb-3 text-[10px] text-[#4CAF50]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" /><span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" /><span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
          <span className="ml-2 opacity-70">{(profile as unknown as { username?: string }).username || profile.id}.linkos — zsh</span>
          <button type="button" onClick={onShare} aria-label="Share page" className="ml-auto hover:text-white"><Share2 className="w-3.5 h-3.5" /></button>
        </div>
        <div className="py-6 space-y-1">
          <p className="text-[#4CAF50]"><span className="text-[#FFBD2E]">$</span> whoami</p>
          <h1 className="text-2xl font-bold text-[#E8F5E9] tracking-tight">{profile.business_name}</h1>
          <p className="text-[#81C784] text-xs">// {profile.category}{profile.description ? ` — ${profile.description}` : ''}</p>
          <p className="text-[#4CAF50] text-xs">$ status <span className="inline-block w-2 h-3.5 bg-[#4CAF50] animate-pulse align-middle" /></p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {profile.whatsapp && <a href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="border border-[#1E3321] hover:bg-[#132013] py-2.5 text-center text-[11px] text-[#4CAF50]">[ whatsapp ]</a>}
          {profile.phone && <a href={`tel:${profile.phone.replace(/[^0-9+]/g, '')}`} className="border border-[#1E3321] hover:bg-[#132013] py-2.5 text-center text-[11px] text-[#4CAF50]">[ call ]</a>}
          <a href={profile.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address || profile.business_name)}`} target="_blank" rel="noopener noreferrer" className="border border-[#1E3321] hover:bg-[#132013] py-2.5 text-center text-[11px] text-[#4CAF50]">[ map ]</a>
        </div>
        <QueueSection profile={profile} />
        <section className="pt-6">
          <p className="text-[10px] text-[#4CAF50] opacity-70">// ──── catalog ────</p>
          {products.length === 0 ? <p className="py-4 opacity-50 text-xs">empty set</p> : products.map((p) => (
            <button key={p.id} type="button" onClick={() => onSelectProduct(p)} className="w-full flex items-center justify-between py-2.5 border-b border-[#132013] hover:bg-[#132013] px-2 text-left">
              <span className="text-[#C8E6C9]">&gt; {p.name}</span>
              <span className="text-[#FFBD2E]">{inr(p)}</span>
            </button>
          ))}
        </section>
        {links.length > 0 && <section className="pt-6"><p className="text-[10px] text-[#4CAF50] opacity-70">// links</p><LinksList links={links} profile={profile} /></section>}
        <div className="pt-6"><ReviewsSection reviews={reviews} /><BusinessInfoCard profile={profile} /></div>
        <SiteFooter />
      </div>
    </div>
  );
}

/* ================= EDITORIAL — "serif on warm paper" ================= */
export function EditorialLayout({ profile, products, links, reviews, onSelectProduct, onShare }: LayoutProps) {
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <div className="min-h-full bg-[#F7F2E9] text-[#1A1611] font-serif">
      <div className="max-w-xl mx-auto px-5">
        <div className="pt-8 pb-4 border-b-2 border-[#1A1611] text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#8A7B63]">{today}</p>
          <h1 className="mt-3 text-4xl sm:text-5xl leading-[1.02] tracking-tight">{profile.business_name}</h1>
          <p className="mt-2 text-xs uppercase tracking-[0.25em] text-[#8A7B63]">{profile.category}</p>
          <button type="button" onClick={onShare} className="mt-3 text-[10px] uppercase tracking-[0.2em] underline underline-offset-4">Share this page</button>
        </div>
        {profile.description && <p className="py-5 text-[15px] leading-relaxed first-letter:text-5xl first-letter:float-left first-letter:mr-2 first-letter:font-bold first-letter:leading-[0.85]">{profile.description}</p>}
        <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#1A1611]/25">
          {profile.whatsapp && <a href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="py-2.5 text-center text-[11px] uppercase tracking-widest hover:bg-[#1A1611] hover:text-[#F7F2E9] transition-colors">WhatsApp</a>}
          {profile.phone && <a href={`tel:${profile.phone.replace(/[^0-9+]/g, '')}`} className="py-2.5 text-center text-[11px] uppercase tracking-widest hover:bg-[#1A1611] hover:text-[#F7F2E9] transition-colors">Call</a>}
          <a href={profile.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address || profile.business_name)}`} target="_blank" rel="noopener noreferrer" className="py-2.5 text-center text-[11px] uppercase tracking-widest hover:bg-[#1A1611] hover:text-[#F7F2E9] transition-colors">Map</a>
        </div>
        <QueueSection profile={profile} />
        <section className="py-6">
          <h2 className="text-[11px] uppercase tracking-[0.3em] text-[#8A7B63] border-b border-[#1A1611]/25 pb-2">The Catalogue — No. {products.length}</h2>
          {products.map((p, i) => (
            <button key={p.id} type="button" onClick={() => onSelectProduct(p)} className="w-full flex items-baseline gap-4 py-4 border-b border-[#1A1611]/15 text-left hover:bg-[#1A1611]/[0.03]">
              <span className="text-sm font-bold text-[#B08D4F] w-8">{String(i + 1).padStart(2, '0')}</span>
              <span className="flex-1 min-w-0"><span className="block text-lg leading-snug">{p.name}</span>{p.description && <span className="block text-xs text-[#8A7B63] mt-0.5 line-clamp-1">{p.description}</span>}</span>
              <span className="text-base font-bold">{inr(p)}</span>
            </button>
          ))}
        </section>
        {links.length > 0 && <section className="py-4 border-t border-[#1A1611]/25"><h2 className="text-[11px] uppercase tracking-[0.3em] text-[#8A7B63] mb-3">Correspondence</h2><LinksList links={links} profile={profile} /></section>}
        <div className="py-4"><ReviewsSection reviews={reviews} /><div className="py-3"><BusinessInfoCard profile={profile} /></div></div>
        <SiteFooter />
      </div>
    </div>
  );
}

/* ================= STORYBOOK — warm, rounded, gentle ================= */
export function StorybookLayout({ profile, products, links, reviews, onSelectProduct, onShare }: LayoutProps) {
  return (
    <div className="min-h-full bg-[#FBF6EE] text-[#3E2F23] font-serif">
      <div className="max-w-md mx-auto px-4 py-10 text-center">
        <div className="w-20 h-20 rounded-full mx-auto bg-[#E8D9C3] border-4 border-white shadow-lg flex items-center justify-center text-2xl font-bold text-[#9C6B2F]">{profile.business_name.charAt(0)}</div>
        <h1 className="mt-4 text-3xl leading-tight">{profile.business_name}</h1>
        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#A98B67]">{profile.category}</p>
        {profile.description && <p className="mt-4 text-sm leading-relaxed text-[#6B5844]">{profile.description}</p>}
        <div className="mt-6 grid grid-cols-3 gap-2.5">
          {profile.whatsapp && <a href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#9C6B2F] text-white text-xs font-semibold py-3 shadow">WhatsApp</a>}
          {profile.phone && <a href={`tel:${profile.phone.replace(/[^0-9+]/g, '')}`} className="rounded-full bg-[#9C6B2F] text-white text-xs font-semibold py-3 shadow">Call</a>}
          <a href={profile.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address || profile.business_name)}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-white dark:bg-[#111B2E] border border-[#E8D9C3] text-xs font-semibold py-3 shadow-sm">Directions</a>
        </div>
        <QueueSection profile={profile} />
        <div className="my-8 text-[#D9C6A5] text-xl tracking-[1em] pl-2">✻ ✻ ✻</div>
        <section className="space-y-4 text-left">
          {products.map((p) => (
            <button key={p.id} type="button" onClick={() => onSelectProduct(p)} className="w-full bg-white dark:bg-[#111B2E] rounded-3xl p-5 shadow-[0_10px_30px_-12px_rgba(156,107,47,0.25)] border border-[#F0E4D0] text-left hover:-translate-y-0.5 transition-transform">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg">{p.name}</h3>
                <span className="text-[#9C6B2F] font-bold">{inr(p)}</span>
              </div>
              {p.description && <p className="text-xs text-[#A98B67] mt-1">{p.description}</p>}
            </button>
          ))}
        </section>
        {links.length > 0 && <section className="mt-8 text-left"><LinksList links={links} profile={profile} /></section>}
        <div className="mt-8 text-left"><ReviewsSection reviews={reviews} /><div className="py-3"><BusinessInfoCard profile={profile} /></div></div>
        <SiteFooter />
      </div>
    </div>
  );
}

/* ================= AURORA — violet glow, glass ================= */
export function AuroraLayout({ profile, products, links, reviews, onSelectProduct, onShare }: LayoutProps) {
  return (
    <div className="min-h-full bg-[#0B0614] text-white relative overflow-hidden">
      <div className="absolute -top-24 -left-16 w-72 h-72 rounded-full bg-[#7C3AED]/40 blur-[90px]" />
      <div className="absolute top-40 -right-20 w-72 h-72 rounded-full bg-[#DB2777]/30 blur-[100px]" />
      <div className="relative max-w-md mx-auto px-4 py-12">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/60">{profile.category}</span>
          <button type="button" onClick={onShare} aria-label="Share page" className="p-2 rounded-full bg-white/10 backdrop-blur border border-white/15"><Share2 className="w-3.5 h-3.5" /></button>
        </div>
        <h1 className="mt-6 text-4xl font-black tracking-tight bg-gradient-to-r from-[#C4B5FD] via-white to-[#F9A8D4] bg-clip-text text-transparent leading-tight">{profile.business_name}</h1>
        {profile.description && <p className="mt-3 text-sm text-white/70 leading-relaxed">{profile.description}</p>}
        <div className="mt-6 grid grid-cols-3 gap-2.5">
          {profile.whatsapp && <a href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-white/10 backdrop-blur border border-white/15 py-3 text-center text-xs font-semibold hover:bg-white/20">WhatsApp</a>}
          {profile.phone && <a href={`tel:${profile.phone.replace(/[^0-9+]/g, '')}`} className="rounded-xl bg-white/10 backdrop-blur border border-white/15 py-3 text-center text-xs font-semibold hover:bg-white/20">Call</a>}
          <a href={profile.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address || profile.business_name)}`} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-white/10 backdrop-blur border border-white/15 py-3 text-center text-xs font-semibold hover:bg-white/20">Map</a>
        </div>
        <QueueSection profile={profile} />
        <section className="mt-8 space-y-3">
          {products.map((p) => (
            <button key={p.id} type="button" onClick={() => onSelectProduct(p)} className="w-full rounded-2xl bg-white/[0.06] backdrop-blur border border-white/10 p-4 text-left hover:bg-white/[0.12] transition-colors">
              <div className="flex items-center justify-between"><h3 className="font-semibold">{p.name}</h3><span className="text-[#C4B5FD] font-bold">{inr(p)}</span></div>
              {p.description && <p className="text-xs text-white/60 mt-1">{p.description}</p>}
            </button>
          ))}
        </section>
        {links.length > 0 && <section className="mt-8"><LinksList links={links} profile={profile} /></section>}
        <div className="mt-8"><ReviewsSection reviews={reviews} /><div className="py-3"><BusinessInfoCard profile={profile} /></div></div>
        <SiteFooter />
      </div>
    </div>
  );
}

/* ================= SWISS — strict grid, huge type ================= */
export function SwissLayout({ profile, products, links, reviews, onSelectProduct, onShare }: LayoutProps) {
  return (
    <div className="min-h-full bg-white dark:bg-[#111B2E] text-[#111111]">
      <div className="max-w-xl mx-auto">
        <div className="grid grid-cols-3 border-b-2 border-[#111111]">
          <div className="col-span-2 p-5 border-r-2 border-[#111111]">
            <h1 className="text-4xl sm:text-5xl font-black tracking-[-0.03em] leading-[0.95] uppercase">{profile.business_name}</h1>
          </div>
          <div className="p-5 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest">{profile.category}</span>
            <button type="button" onClick={onShare} className="self-start text-[10px] font-bold uppercase tracking-widest underline">Share</button>
          </div>
        </div>
        <div className="grid grid-cols-3 border-b border-[#111111]">
          {profile.whatsapp && <a href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="py-4 text-center text-[11px] font-bold uppercase tracking-widest border-r border-[#111111] hover:bg-[#E4032E] hover:text-white transition-colors">WhatsApp</a>}
          {profile.phone && <a href={`tel:${profile.phone.replace(/[^0-9+]/g, '')}`} className="py-4 text-center text-[11px] font-bold uppercase tracking-widest border-r border-[#111111] hover:bg-[#E4032E] hover:text-white transition-colors">Call</a>}
          <a href={profile.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address || profile.business_name)}`} target="_blank" rel="noopener noreferrer" className="py-4 text-center text-[11px] font-bold uppercase tracking-widest hover:bg-[#E4032E] hover:text-white transition-colors">Directions</a>
        </div>
        <QueueSection profile={profile} />
        <section className="p-5">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#E4032E] mb-4">Catalog / {products.length}</h2>
          <div className="grid grid-cols-2 gap-px bg-[#111111] border border-[#111111]">
            {products.map((p) => (
              <button key={p.id} type="button" onClick={() => onSelectProduct(p)} className="bg-white p-4 text-left hover:bg-[#E4032E] hover:text-white transition-colors group">
                <span className="text-[9px] font-bold uppercase tracking-widest opacity-50">{String(products.indexOf(p) + 1).padStart(2, '0')}</span>
                <h3 className="font-bold text-sm leading-tight mt-1">{p.name}</h3>
                <span className="block mt-2 text-lg font-black">{inr(p)}</span>
              </button>
            ))}
          </div>
        </section>
        {links.length > 0 && <section className="px-5 pb-4"><LinksList links={links} profile={profile} /></section>}
        <div className="px-5 pb-6"><ReviewsSection reviews={reviews} /><div className="py-3"><BusinessInfoCard profile={profile} /></div></div>
        <SiteFooter />
      </div>
    </div>
  );
}

/* ================= VELVET — black & gold luxury ================= */
export function VelvetLayout({ profile, products, links, reviews, onSelectProduct, onShare }: LayoutProps) {
  return (
    <div className="min-h-full bg-[#0D0B08] text-[#E9DFC8] font-serif">
      <div className="max-w-md mx-auto px-5 py-12">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 text-[#C9A96A] text-[10px] uppercase tracking-[0.4em]">
            <span className="w-8 h-px bg-[#C9A96A]/60" />{profile.category}<span className="w-8 h-px bg-[#C9A96A]/60" />
          </div>
          <h1 className="mt-5 text-4xl leading-tight text-[#F5EDD8]">{profile.business_name}</h1>
          {profile.description && <p className="mt-4 text-sm italic text-[#B7A98A] leading-relaxed">{profile.description}</p>}
          <button type="button" onClick={onShare} className="mt-4 text-[10px] uppercase tracking-[0.3em] text-[#C9A96A] underline underline-offset-4">Share</button>
        </div>
        <div className="mt-8 grid grid-cols-3 gap-px bg-[#C9A96A]/30 border border-[#C9A96A]/30">
          {profile.whatsapp && <a href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="bg-[#0D0B08] py-3.5 text-center text-[11px] uppercase tracking-[0.2em] hover:bg-[#1A150D]">WhatsApp</a>}
          {profile.phone && <a href={`tel:${profile.phone.replace(/[^0-9+]/g, '')}`} className="bg-[#0D0B08] py-3.5 text-center text-[11px] uppercase tracking-[0.2em] hover:bg-[#1A150D]">Call</a>}
          <a href={profile.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address || profile.business_name)}`} target="_blank" rel="noopener noreferrer" className="bg-[#0D0B08] py-3.5 text-center text-[11px] uppercase tracking-[0.2em] hover:bg-[#1A150D]">Locate</a>
        </div>
        <QueueSection profile={profile} />
        <section className="mt-10">
          <h2 className="text-center text-[10px] uppercase tracking-[0.4em] text-[#C9A96A]">The Menu</h2>
          <div className="mt-5 space-y-1">
            {products.map((p) => (
              <button key={p.id} type="button" onClick={() => onSelectProduct(p)} className="w-full py-3.5 text-left group">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[15px] group-hover:text-[#C9A96A] transition-colors">{p.name}</span>
                  <span className="flex-1 border-b border-dotted border-[#C9A96A]/40" />
                  <span className="text-[#C9A96A]">{inr(p)}</span>
                </div>
                {p.description && <p className="text-[11px] text-[#8D8168] mt-0.5 italic">{p.description}</p>}
              </button>
            ))}
          </div>
        </section>
        {links.length > 0 && <section className="mt-8"><LinksList links={links} profile={profile} /></section>}
        <div className="mt-8"><ReviewsSection reviews={reviews} /><div className="py-3"><BusinessInfoCard profile={profile} /></div></div>
        <SiteFooter />
      </div>
    </div>
  );
}

/* ================= BONFIRE — warm ember ================= */
export function BonfireLayout({ profile, products, links, reviews, onSelectProduct, onShare }: LayoutProps) {
  return (
    <div className="min-h-full bg-[#FFF8F0] dark:bg-[#16213A] text-[#2D1F14]">
      <div className="bg-gradient-to-br from-[#7C2D12] via-[#9A3412] to-[#C2410C] text-[#FFF8F0] px-5 pt-10 pb-14 rounded-b-[2.5rem]">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-80">{profile.category}</span>
            <button type="button" onClick={onShare} aria-label="Share page" className="p-2 rounded-full bg-white/15"><Share2 className="w-3.5 h-3.5" /></button>
          </div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight">{profile.business_name}</h1>
          {profile.description && <p className="mt-2 text-sm opacity-85">{profile.description}</p>}
        </div>
      </div>
      <div className="max-w-md mx-auto px-4 -mt-8">
        <div className="bg-white rounded-3xl shadow-xl border border-[#F5E6D3] p-4">
          <ActionRow profile={profile} shape="pill" />
        </div>
        <QueueSection profile={profile} />
        <section className="pt-6 space-y-3">
          {products.map((p) => (
            <button key={p.id} type="button" onClick={() => onSelectProduct(p)} className="w-full bg-white dark:bg-[#111B2E] border border-[#F5E6D3] rounded-2xl p-4 flex items-center gap-4 text-left shadow-sm hover:shadow-md transition-shadow">
              <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FDBA74] to-[#EA580C] text-white flex items-center justify-center font-black">{p.name.charAt(0)}</span>
              <span className="flex-1 min-w-0"><span className="block font-bold text-sm">{p.name}</span>{p.description && <span className="block text-xs text-[#A0785A] mt-0.5 line-clamp-1">{p.description}</span>}</span>
              <span className="font-black text-[#C2410C]">{inr(p)}</span>
            </button>
          ))}
        </section>
        {links.length > 0 && <section className="pt-6"><LinksList links={links} profile={profile} /></section>}
        <div className="py-6"><ReviewsSection reviews={reviews} /><div className="py-3"><BusinessInfoCard profile={profile} /></div></div>
        <SiteFooter />
      </div>
    </div>
  );
}

/* ================= DARKROOM — photo-first, near-black ================= */
export function DarkroomLayout({ profile, products, links, reviews, onSelectProduct, onShare }: LayoutProps) {
  return (
    <div className="min-h-full bg-[#0C0C0D] text-[#EDEDED]">
      <div className="max-w-lg mx-auto">
        <div className="px-5 pt-14 pb-8">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.35em] text-white/50">
            <span>{profile.category}</span>
            <button type="button" onClick={onShare} aria-label="Share page" className="hover:text-white"><Share2 className="w-4 h-4" /></button>
          </div>
          <h1 className="mt-6 text-5xl font-light tracking-tight leading-[1.02]">{profile.business_name}</h1>
          {profile.description && <p className="mt-4 text-sm text-white/60 leading-relaxed max-w-sm">{profile.description}</p>}
        </div>
        <div className="grid grid-cols-3 gap-px bg-white/10">
          {profile.whatsapp && <a href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="bg-[#0C0C0D] py-4 text-center text-[11px] uppercase tracking-widest hover:bg-[#161617]">WhatsApp</a>}
          {profile.phone && <a href={`tel:${profile.phone.replace(/[^0-9+]/g, '')}`} className="bg-[#0C0C0D] py-4 text-center text-[11px] uppercase tracking-widest hover:bg-[#161617]">Call</a>}
          <a href={profile.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address || profile.business_name)}`} target="_blank" rel="noopener noreferrer" className="bg-[#0C0C0D] py-4 text-center text-[11px] uppercase tracking-widest hover:bg-[#161617]">Find Us</a>
        </div>
        <QueueSection profile={profile} />
        <section className="px-5 py-10">
          <h2 className="text-[10px] uppercase tracking-[0.35em] text-white/40 mb-6">Selected Work — {products.length}</h2>
          <div className="space-y-8">
            {products.map((p, i) => (
              <button key={p.id} type="button" onClick={() => onSelectProduct(p)} className="w-full text-left group">
                <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-[#1C1C1E] via-[#232326] to-[#161618] border border-white/10 flex items-center justify-center overflow-hidden">
                  {p.image_url?.trim() ? <img src={p.image_url.trim()} alt={p.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" /> : <span className="text-5xl font-light text-white/15">{String(i + 1).padStart(2, '0')}</span>}
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <h3 className="text-lg font-light">{p.name}</h3>
                  <span className="text-white/60 text-sm">{inr(p)}</span>
                </div>
              </button>
            ))}
          </div>
        </section>
        {links.length > 0 && <section className="px-5 pb-6"><LinksList links={links} profile={profile} /></section>}
        <div className="px-5 pb-8"><ReviewsSection reviews={reviews} /><div className="py-3"><BusinessInfoCard profile={profile} /></div></div>
        <SiteFooter />
      </div>
    </div>
  );
}

/* ================= GRAPHITE — technical, data-dense ================= */
export function GraphiteLayout({ profile, products, links, reviews, onSelectProduct, onShare }: LayoutProps) {
  return (
    <div className="min-h-full bg-[#F4F4F5] text-[#27272A]">
      <div className="max-w-xl mx-auto">
        <div className="bg-[#18181B] text-[#D4D4D8] px-5 py-3 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em]">{profile.category} / spec-sheet</span>
          <button type="button" onClick={onShare} aria-label="Share page" className="hover:text-white"><Share2 className="w-3.5 h-3.5" /></button>
        </div>
        <div className="px-5 py-8 bg-white dark:bg-[#111B2E] border-b border-[#E4E4E7]">
          <h1 className="text-3xl font-black tracking-tight">{profile.business_name}</h1>
          <p className="mt-1 font-mono text-[11px] text-[#71717A] uppercase">{profile.description || profile.category}</p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {profile.whatsapp && <a href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="border border-[#D4D4D8] py-2.5 text-center text-[11px] font-mono uppercase hover:bg-[#18181B] hover:text-white">whatsapp</a>}
            {profile.phone && <a href={`tel:${profile.phone.replace(/[^0-9+]/g, '')}`} className="border border-[#D4D4D8] py-2.5 text-center text-[11px] font-mono uppercase hover:bg-[#18181B] hover:text-white">call</a>}
            <a href={profile.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address || profile.business_name)}`} target="_blank" rel="noopener noreferrer" className="border border-[#D4D4D8] py-2.5 text-center text-[11px] font-mono uppercase hover:bg-[#18181B] hover:text-white">map</a>
          </div>
        </div>
        <QueueSection profile={profile} />
        <section className="p-5">
          <table className="w-full text-sm bg-white dark:bg-[#111B2E] border border-[#E4E4E7]">
            <thead><tr className="bg-[#FAFAFA] border-b border-[#E4E4E7] font-mono text-[10px] uppercase text-[#71717A]"><th className="text-left px-3 py-2 font-medium">Item</th><th className="text-left px-3 py-2 font-medium hidden sm:table-cell">Note</th><th className="text-right px-3 py-2 font-medium">Price</th></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} onClick={() => onSelectProduct(p)} className="border-b border-[#F4F4F5] last:border-0 hover:bg-[#FAFAFA] cursor-pointer">
                  <td className="px-3 py-3 font-semibold">{p.name}</td>
                  <td className="px-3 py-3 text-xs text-[#71717A] hidden sm:table-cell">{p.description || '—'}</td>
                  <td className="px-3 py-3 text-right font-mono">{inr(p)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        {links.length > 0 && <section className="px-5 pb-4"><LinksList links={links} profile={profile} /></section>}
        <div className="px-5 pb-6"><ReviewsSection reviews={reviews} /><div className="py-3"><BusinessInfoCard profile={profile} /></div></div>
        <SiteFooter />
      </div>
    </div>
  );
}

/* ================= BENTO — tile grid ================= */
export function BentoLayout({ profile, products, links, reviews, onSelectProduct, onShare }: LayoutProps) {
  return (
    <div className="min-h-full bg-[#EDEBE6] text-[#1C1B1A]">
      <div className="max-w-lg mx-auto p-3 space-y-3">
        <div className="bg-[#1C1B1A] text-[#F5F4F0] rounded-3xl p-6 relative overflow-hidden">
          <button type="button" onClick={onShare} aria-label="Share page" className="absolute top-4 right-4 p-2 rounded-full bg-white/10"><Share2 className="w-3.5 h-3.5" /></button>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#B8B2A5]">{profile.category}</span>
          <h1 className="mt-3 text-3xl font-black tracking-tight leading-tight">{profile.business_name}</h1>
          {profile.description && <p className="mt-2 text-xs text-[#B8B2A5] leading-relaxed">{profile.description}</p>}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {profile.whatsapp && <a href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="bg-white rounded-2xl p-4 flex flex-col justify-between min-h-20 hover:-translate-y-0.5 transition-transform shadow-sm"><MessageCircle className="w-4 h-4 text-[#25D366]" /><span className="text-xs font-bold mt-3">WhatsApp</span></a>}
          {profile.phone && <a href={`tel:${profile.phone.replace(/[^0-9+]/g, '')}`} className="bg-white rounded-2xl p-4 flex flex-col justify-between min-h-20 hover:-translate-y-0.5 transition-transform shadow-sm"><Phone className="w-4 h-4 text-[#1C1B1A]" /><span className="text-xs font-bold mt-3">Call</span></a>}
          <a href={profile.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address || profile.business_name)}`} target="_blank" rel="noopener noreferrer" className="bg-white rounded-2xl p-4 flex flex-col justify-between min-h-20 hover:-translate-y-0.5 transition-transform shadow-sm"><Navigation className="w-4 h-4 text-[#1C1B1A]" /><span className="text-xs font-bold mt-3">Directions</span></a>
        </div>
        <QueueSection profile={profile} />
        {products.length > 0 && (
          <section className="grid grid-cols-2 gap-3">
            {products.slice(0, 2).map((p) => (
              <button key={p.id} type="button" onClick={() => onSelectProduct(p)} className="bg-white rounded-3xl p-5 text-left hover:-translate-y-0.5 transition-transform shadow-sm">
                <span className="text-2xl font-black text-[#D6D2C8]">{String(products.indexOf(p) + 1)}</span>
                <h3 className="font-bold text-sm mt-2 leading-snug">{p.name}</h3>
                <span className="block mt-1 text-[#8A8578] font-bold text-sm">{inr(p)}</span>
              </button>
            ))}
            {products.slice(2).map((p) => (
              <button key={p.id} type="button" onClick={() => onSelectProduct(p)} className="col-span-2 bg-white dark:bg-[#111B2E] rounded-3xl p-4 flex items-center justify-between text-left hover:-translate-y-0.5 transition-transform shadow-sm">
                <span className="font-bold text-sm">{p.name}</span>
                <span className="font-black">{inr(p)}</span>
              </button>
            ))}
          </section>
        )}
        {(() => {
          const fallbackTags = ['Dine-in', 'Takeaway', 'Home Delivery', 'Birthday & Event Bookings', 'Custom Orders', 'Free WiFi'];
          const tags = profile.service_tags?.length
            ? profile.service_tags
            : profile.services?.length
              ? profile.services.map((s) => s.name)
              : fallbackTags;
          return (
            <section className="bg-white dark:bg-[#111B2E] rounded-3xl p-4 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wide text-[#8A8578] dark:text-slate-400">Our Services</h3>
              <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {tags.slice(0, 8).map((s) => (
                  <li key={s} className="flex items-center gap-2 text-[13px] font-medium">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
                    </span>
                    {s}
                  </li>
                ))}
              </ul>
            </section>
          );
        })()}
        {links.length > 0 && <section className="bg-white rounded-3xl p-4 shadow-sm"><LinksList links={links} profile={profile} /></section>}
        <div className="bg-white rounded-3xl p-4 shadow-sm"><ReviewsSection reviews={reviews} /><div className="py-3"><BusinessInfoCard profile={profile} /></div></div>
        <SiteFooter />
      </div>
    </div>
  );
}

/* ================= BLUEPRINT — technical drawing ================= */
export function BlueprintLayout({ profile, products, links, reviews, onSelectProduct, onShare }: LayoutProps) {
  return (
    <div className="min-h-full bg-[#EEF3F8] text-[#12314E] relative" style={{ backgroundImage: 'linear-gradient(#D7E3EF 1px, transparent 1px), linear-gradient(90deg, #D7E3EF 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      <div className="max-w-lg mx-auto p-5">
        <div className="border-2 border-dashed border-[#3E6B96] bg-white/80 backdrop-blur-sm p-6">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-[#3E6B96]">
            <span>FIG. 01 — {profile.category}</span>
            <button type="button" onClick={onShare} aria-label="Share page" className="underline">share</button>
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight uppercase">{profile.business_name}</h1>
          {profile.description && <p className="mt-2 text-xs leading-relaxed text-[#4A6B8A]">{profile.description}</p>}
          <div className="mt-5 flex flex-wrap gap-2">
            {profile.whatsapp && <a href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#12314E] text-white font-mono text-[11px] uppercase tracking-wider">WhatsApp</a>}
            {profile.phone && <a href={`tel:${profile.phone.replace(/[^0-9+]/g, '')}`} className="px-4 py-2 border border-[#12314E] font-mono text-[11px] uppercase tracking-wider">Call</a>}
            <a href={profile.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address || profile.business_name)}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-[#12314E] font-mono text-[11px] uppercase tracking-wider">Directions</a>
          </div>
        </div>
        <QueueSection profile={profile} />
        <section className="mt-4 space-y-3">
          {products.map((p, i) => (
            <button key={p.id} type="button" onClick={() => onSelectProduct(p)} className="w-full border border-[#3E6B96] bg-white/80 p-4 text-left hover:bg-white transition-colors">
              <div className="flex items-center justify-between font-mono">
                <span className="text-[10px] uppercase tracking-widest text-[#3E6B96]">FIG. {String(i + 1).padStart(2, '0')}</span>
                <span className="font-black">{inr(p)}</span>
              </div>
              <h3 className="font-bold mt-1">{p.name}</h3>
              {p.description && <p className="text-xs text-[#4A6B8A] mt-0.5">{p.description}</p>}
            </button>
          ))}
        </section>
        {links.length > 0 && <section className="mt-4 border border-[#3E6B96] bg-white/80 p-4"><LinksList links={links} profile={profile} /></section>}
        <div className="mt-4 border border-[#3E6B96] bg-white/80 p-4"><ReviewsSection reviews={reviews} /><div className="py-3"><BusinessInfoCard profile={profile} /></div></div>
        <SiteFooter />
      </div>
    </div>
  );
}

/* ================= BRUTAL — raw, hard shadows ================= */
export function BrutalLayout({ profile, products, links, reviews, onSelectProduct, onShare }: LayoutProps) {
  return (
    <div className="min-h-full bg-[#FFFDF5] dark:bg-[#16213A] text-black">
      <div className="max-w-lg mx-auto p-4">
        <div className="border-[3px] border-black bg-[#FFD02F] p-6 shadow-[8px_8px_0_#000]">
          <div className="flex items-center justify-between">
            <span className="bg-black text-[#FFD02F] px-2 py-1 text-[10px] font-black uppercase tracking-widest">{profile.category}</span>
            <button type="button" onClick={onShare} aria-label="Share page" className="border-2 border-black bg-white dark:bg-[#111B2E] px-2 py-1 text-[10px] font-black uppercase shadow-[3px_3px_0_#000] active:translate-y-0.5">SHARE</button>
          </div>
          <h1 className="mt-4 text-4xl font-black uppercase tracking-tight leading-[0.95]">{profile.business_name}</h1>
          {profile.description && <p className="mt-3 text-sm font-bold">{profile.description}</p>}
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {profile.whatsapp && <a href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="border-[3px] border-black bg-white dark:bg-[#111B2E] py-3 text-center text-xs font-black uppercase shadow-[4px_4px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#000]">WhatsApp</a>}
          {profile.phone && <a href={`tel:${profile.phone.replace(/[^0-9+]/g, '')}`} className="border-[3px] border-black bg-white dark:bg-[#111B2E] py-3 text-center text-xs font-black uppercase shadow-[4px_4px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#000]">Call</a>}
          <a href={profile.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address || profile.business_name)}`} target="_blank" rel="noopener noreferrer" className="border-[3px] border-black bg-white dark:bg-[#111B2E] py-3 text-center text-xs font-black uppercase shadow-[4px_4px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#000]">Map</a>
        </div>
        <QueueSection profile={profile} />
        <section className="mt-6 space-y-4">
          {products.map((p) => (
            <button key={p.id} type="button" onClick={() => onSelectProduct(p)} className="w-full border-[3px] border-black bg-white dark:bg-[#111B2E] p-4 text-left shadow-[6px_6px_0_#000] hover:shadow-[2px_2px_0_#000] hover:translate-x-1 hover:translate-y-1 transition-all">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-black uppercase text-lg leading-none">{p.name}</h3>
                <span className="bg-black text-white px-2 py-1 font-black text-sm">{inr(p)}</span>
              </div>
              {p.description && <p className="text-xs font-bold mt-2 text-[#444]">{p.description}</p>}
            </button>
          ))}
        </section>
        {links.length > 0 && <section className="mt-6"><LinksList links={links} profile={profile} /></section>}
        <div className="mt-6"><ReviewsSection reviews={reviews} /><div className="py-3"><BusinessInfoCard profile={profile} /></div></div>
        <SiteFooter />
      </div>
    </div>
  );
}

/* ================= NOTEBOOK — lined paper ================= */
export function NotebookLayout({ profile, products, links, reviews, onSelectProduct, onShare }: LayoutProps) {
  return (
    <div className="min-h-full bg-[#FDFBF4] text-[#2B2B33]" style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #E8E4D8 31px, #E8E4D8 32px)' }}>
      <div className="max-w-md mx-auto px-6 py-10" style={{ borderLeft: '2px solid #E5B8B0' }}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#9B4F44] font-bold">{profile.category}</span>
          <button type="button" onClick={onShare} aria-label="Share page" className="text-[11px] underline text-[#6B6B75]">share</button>
        </div>
        <h1 className="mt-3 text-4xl font-bold tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>{profile.business_name}</h1>
        {profile.description && <p className="mt-3 text-sm leading-[2] text-[#4A4A55]">{profile.description}</p>}
        <div className="mt-6 flex flex-wrap gap-2">
          {profile.whatsapp && <a href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#2B2B33] text-white rounded text-xs font-bold -rotate-1">WhatsApp</a>}
          {profile.phone && <a href={`tel:${profile.phone.replace(/[^0-9+]/g, '')}`} className="px-4 py-2 bg-[#9B4F44] text-white rounded text-xs font-bold rotate-1">Call</a>}
          <a href={profile.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address || profile.business_name)}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border-2 border-[#2B2B33] rounded text-xs font-bold -rotate-1 bg-white">Map</a>
        </div>
        <QueueSection profile={profile} />
        <section className="mt-8 space-y-5">
          {products.map((p, i) => (
            <button key={p.id} type="button" onClick={() => onSelectProduct(p)} className="w-full text-left group">
              <div className="flex items-baseline gap-3">
                <span className="text-[#9B4F44] font-bold text-sm">{i + 1}.</span>
                <span className="font-bold group-hover:underline underline-offset-4">{p.name}</span>
                <span className="ml-auto font-bold text-[#2B2B33]/70">{inr(p)}</span>
              </div>
              {p.description && <p className="text-xs text-[#6B6B75] mt-0.5 pl-6">{p.description}</p>}
            </button>
          ))}
        </section>
        {links.length > 0 && <section className="mt-8"><LinksList links={links} profile={profile} /></section>}
        <div className="mt-8"><ReviewsSection reviews={reviews} /><div className="py-3"><BusinessInfoCard profile={profile} /></div></div>
        <SiteFooter />
      </div>
    </div>
  );
}

/* ================= STICKER — playful, thick, rotated ================= */
export function StickerLayout({ profile, products, links, reviews, onSelectProduct, onShare }: LayoutProps) {
  return (
    <div className="min-h-full bg-[#FFF4D8] dark:bg-amber-500/15 text-[#1F2937]">
      <div className="max-w-md mx-auto px-4 py-10">
        <div className="relative bg-white dark:bg-[#111B2E] border-4 border-[#1F2937] rounded-[2rem] p-6 text-center shadow-[6px_6px_0_#1F2937]">
          <button type="button" onClick={onShare} aria-label="Share page" className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-[#F97316] border-4 border-[#1F2937] text-white flex items-center justify-center -rotate-12"><Share2 className="w-4 h-4" /></button>
          <div className="w-16 h-16 mx-auto rounded-full bg-[#F97316] border-4 border-[#1F2937] flex items-center justify-center text-2xl font-black text-white">{profile.business_name.charAt(0)}</div>
          <h1 className="mt-3 text-2xl font-black uppercase tracking-tight">{profile.business_name}</h1>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-[#6B7280]">{profile.category}</p>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          {profile.whatsapp && <a href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="bg-[#22C55E] border-4 border-[#1F2937] rounded-2xl py-3 text-center text-xs font-black uppercase shadow-[4px_4px_0_#1F2937] -rotate-1 active:rotate-0">Chat</a>}
          {profile.phone && <a href={`tel:${profile.phone.replace(/[^0-9+]/g, '')}`} className="bg-[#3B82F6] text-white border-4 border-[#1F2937] rounded-2xl py-3 text-center text-xs font-black uppercase shadow-[4px_4px_0_#1F2937] rotate-1 active:rotate-0">Call</a>}
          <a href={profile.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address || profile.business_name)}`} target="_blank" rel="noopener noreferrer" className="bg-[#FACC15] border-4 border-[#1F2937] rounded-2xl py-3 text-center text-xs font-black uppercase shadow-[4px_4px_0_#1F2937] -rotate-1 active:rotate-0">Map</a>
        </div>
        <QueueSection profile={profile} />
        <section className="mt-8 space-y-4">
          {products.map((p, i) => (
            <button key={p.id} type="button" onClick={() => onSelectProduct(p)} className={`w-full bg-white dark:bg-[#111B2E] border-4 border-[#1F2937] rounded-3xl p-4 text-left shadow-[5px_5px_0_#1F2937] hover:-translate-y-1 transition-transform ${i % 2 ? 'rotate-[0.5deg]' : '-rotate-[0.5deg]'}`}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-black uppercase">{p.name}</h3>
                <span className="bg-[#F97316] text-white border-2 border-[#1F2937] rounded-full px-3 py-1 text-sm font-black">{inr(p)}</span>
              </div>
              {p.description && <p className="text-xs font-semibold text-[#6B7280] mt-1">{p.description}</p>}
            </button>
          ))}
        </section>
        {links.length > 0 && <section className="mt-8"><LinksList links={links} profile={profile} /></section>}
        <div className="mt-8"><ReviewsSection reviews={reviews} /><div className="py-3"><BusinessInfoCard profile={profile} /></div></div>
        <SiteFooter />
      </div>
    </div>
  );
}

/* ================= LINEN — soft spa minimal ================= */
export function LinenLayout({ profile, products, links, reviews, onSelectProduct, onShare }: LayoutProps) {
  return (
    <div className="min-h-full bg-[#F5F1EA] text-[#4A4238] font-serif">
      <div className="max-w-md mx-auto px-6 py-16">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.5em] text-[#A89C8A]">{profile.category}</p>
          <h1 className="mt-5 text-4xl font-light tracking-wide leading-snug">{profile.business_name}</h1>
          <div className="mt-5 mx-auto w-12 h-px bg-[#C9BBA4]" />
          {profile.description && <p className="mt-5 text-sm leading-loose text-[#7A6F5F]">{profile.description}</p>}
          <button type="button" onClick={onShare} className="mt-4 text-[10px] uppercase tracking-[0.3em] text-[#A89C8A] hover:text-[#4A4238]">Share</button>
        </div>
        <div className="mt-10 grid grid-cols-3 gap-3 text-[11px] uppercase tracking-[0.2em]">
          {profile.whatsapp && <a href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="py-3.5 bg-[#4A4238] text-[#F5F1EA] text-center">WhatsApp</a>}
          {profile.phone && <a href={`tel:${profile.phone.replace(/[^0-9+]/g, '')}`} className="py-3.5 border border-[#C9BBA4] text-center">Call</a>}
          <a href={profile.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address || profile.business_name)}`} target="_blank" rel="noopener noreferrer" className="py-3.5 border border-[#C9BBA4] text-center">Visit</a>
        </div>
        <QueueSection profile={profile} />
        <section className="mt-14 space-y-10">
          {products.map((p) => (
            <button key={p.id} type="button" onClick={() => onSelectProduct(p)} className="w-full text-center group">
              <h3 className="text-xl font-light group-hover:italic transition-all">{p.name}</h3>
              <p className="mt-1 text-xs uppercase tracking-[0.25em] text-[#A89C8A]">{inr(p)}</p>
              {p.description && <p className="mt-2 text-xs text-[#7A6F5F] leading-relaxed">{p.description}</p>}
            </button>
          ))}
        </section>
        {links.length > 0 && <section className="mt-14"><LinksList links={links} profile={profile} /></section>}
        <div className="mt-12"><ReviewsSection reviews={reviews} /><div className="py-3"><BusinessInfoCard profile={profile} /></div></div>
        <SiteFooter />
      </div>
    </div>
  );
}

/* ================= CANDY — pastel bubbly ================= */
export function CandyLayout({ profile, products, links, reviews, onSelectProduct, onShare }: LayoutProps) {
  return (
    <div className="min-h-full bg-[#FDF2F6] text-[#3D2C35]">
      <div className="max-w-md mx-auto px-4 py-10">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto rounded-[2rem] rotate-6 bg-gradient-to-br from-[#F9A8D4] to-[#C4B5FD] border-4 border-white shadow-lg flex items-center justify-center text-2xl font-black text-white">{profile.business_name.charAt(0)}</div>
          <h1 className="mt-4 text-3xl font-black tracking-tight">{profile.business_name}</h1>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[#C084A5]">{profile.category}</p>
          {profile.description && <p className="mt-3 text-sm text-[#8A6B7A]">{profile.description}</p>}
          <button type="button" onClick={onShare} className="mt-3 text-xs font-bold text-[#C084A5] underline">share this page</button>
        </div>
        <div className="mt-8 grid grid-cols-3 gap-2.5">
          {profile.whatsapp && <a href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#F472B6] text-white text-xs font-black py-3.5 shadow-[0_4px_0_#BE185D] active:translate-y-1 active:shadow-none text-center">Chat</a>}
          {profile.phone && <a href={`tel:${profile.phone.replace(/[^0-9+]/g, '')}`} className="rounded-full bg-[#A78BFA] text-white text-xs font-black py-3.5 shadow-[0_4px_0_#6D28D9] active:translate-y-1 active:shadow-none text-center">Call</a>}
          <a href={profile.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address || profile.business_name)}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#6EE7B7] text-[#064E3B] text-xs font-black py-3.5 shadow-[0_4px_0_#059669] active:translate-y-1 active:shadow-none text-center">Map</a>
        </div>
        <QueueSection profile={profile} />
        <section className="mt-8 space-y-3">
          {products.map((p) => (
            <button key={p.id} type="button" onClick={() => onSelectProduct(p)} className="w-full bg-white dark:bg-[#111B2E] rounded-[1.75rem] p-4 text-left border-2 border-[#F9A8D4]/40 hover:border-[#F9A8D4] transition-colors">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-black">{p.name}</h3>
                <span className="rounded-full bg-[#FDF2F6] border border-[#F9A8D4] px-3 py-1 text-sm font-black text-[#BE185D]">{inr(p)}</span>
              </div>
              {p.description && <p className="text-xs text-[#8A6B7A] mt-1">{p.description}</p>}
            </button>
          ))}
        </section>
        {links.length > 0 && <section className="mt-8"><LinksList links={links} profile={profile} /></section>}
        <div className="mt-8"><ReviewsSection reviews={reviews} /><div className="py-3"><BusinessInfoCard profile={profile} /></div></div>
        <SiteFooter />
      </div>
    </div>
  );
}

/* ================= MONO — pure black & white ================= */
export function MonoLayout({ profile, products, links, reviews, onSelectProduct, onShare }: LayoutProps) {
  return (
    <div className="min-h-full bg-white dark:bg-[#111B2E] text-black">
      <div className="max-w-xl mx-auto px-6 py-16">
        <div className="flex items-baseline justify-between">
          <h1 className="text-5xl font-black tracking-[-0.04em] leading-none">{profile.business_name}</h1>
          <button type="button" onClick={onShare} aria-label="Share page" className="shrink-0 ml-4"><ArrowUpRight className="w-6 h-6" /></button>
        </div>
        <p className="mt-3 text-sm text-black/50">{profile.category}{profile.description ? ` — ${profile.description}` : ''}</p>
        <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold">
          {profile.whatsapp && <a href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-8 decoration-2">WhatsApp</a>}
          {profile.phone && <a href={`tel:${profile.phone.replace(/[^0-9+]/g, '')}`} className="underline underline-offset-8 decoration-2">Call</a>}
          <a href={profile.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address || profile.business_name)}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-8 decoration-2">Directions</a>
        </div>
        <QueueSection profile={profile} />
        <section className="mt-14">
          {products.map((p) => (
            <button key={p.id} type="button" onClick={() => onSelectProduct(p)} className="w-full py-6 border-t border-black/10 flex items-baseline justify-between text-left hover:bg-black hover:text-white px-2 -mx-2 transition-colors">
              <span className="text-2xl font-black tracking-tight">{p.name}</span>
              <span className="text-lg font-bold">{inr(p)}</span>
            </button>
          ))}
        </section>
        {links.length > 0 && <section className="mt-10 border-t border-black/10 pt-6"><LinksList links={links} profile={profile} /></section>}
        <div className="mt-10"><ReviewsSection reviews={reviews} /><div className="py-3"><BusinessInfoCard profile={profile} /></div></div>
        <SiteFooter />
      </div>
    </div>
  );
}

/* ================= DUSK — deep indigo evening ================= */
export function DuskLayout({ profile, products, links, reviews, onSelectProduct, onShare }: LayoutProps) {
  return (
    <div className="min-h-full bg-[#171334] text-[#EDEAF7]">
      <div className="max-w-md mx-auto px-5 py-12">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.35em] text-[#9D93D0]">{profile.category}</span>
          <button type="button" onClick={onShare} aria-label="Share page" className="text-[#9D93D0] hover:text-white"><Share2 className="w-4 h-4" /></button>
        </div>
        <h1 className="mt-6 text-4xl font-bold tracking-tight leading-tight">{profile.business_name}</h1>
        {profile.description && <p className="mt-3 text-sm text-[#B4ABE0] leading-relaxed">{profile.description}</p>}
        <div className="mt-7 grid grid-cols-3 gap-2">
          {profile.whatsapp && <a href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-[#F2A65A] text-[#171334] py-3 text-center text-xs font-black">WhatsApp</a>}
          {profile.phone && <a href={`tel:${profile.phone.replace(/[^0-9+]/g, '')}`} className="rounded-lg bg-white/10 border border-white/15 py-3 text-center text-xs font-bold">Call</a>}
          <a href={profile.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address || profile.business_name)}`} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-white/10 border border-white/15 py-3 text-center text-xs font-bold">Map</a>
        </div>
        <QueueSection profile={profile} />
        <section className="mt-10 space-y-2">
          {products.map((p) => (
            <button key={p.id} type="button" onClick={() => onSelectProduct(p)} className="w-full rounded-xl bg-[#221C4A] border border-[#372E6E] p-4 text-left hover:border-[#F2A65A]/60 transition-colors">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-bold">{p.name}</h3>
                <span className="text-[#F2A65A] font-black">{inr(p)}</span>
              </div>
              {p.description && <p className="text-xs text-[#9D93D0] mt-1">{p.description}</p>}
            </button>
          ))}
        </section>
        {links.length > 0 && <section className="mt-8"><LinksList links={links} profile={profile} /></section>}
        <div className="mt-8"><ReviewsSection reviews={reviews} /><div className="py-3"><BusinessInfoCard profile={profile} /></div></div>
        <SiteFooter />
      </div>
    </div>
  );
}

/* ================= FOREST — deep green organic ================= */
export function ForestLayout({ profile, products, links, reviews, onSelectProduct, onShare }: LayoutProps) {
  return (
    <div className="min-h-full bg-[#122B1D] text-[#EDE8DC]">
      <div className="max-w-md mx-auto px-5 py-12">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#8FB996]">{profile.category}</span>
          <button type="button" onClick={onShare} aria-label="Share page" className="text-[#8FB996] hover:text-white"><Share2 className="w-4 h-4" /></button>
        </div>
        <div className="mt-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1E4029] border border-[#2E5A3C] flex items-center justify-center text-xl font-bold text-[#A7C4A0]">{profile.business_name.charAt(0)}</div>
          <h1 className="text-3xl font-bold tracking-tight leading-tight">{profile.business_name}</h1>
        </div>
        {profile.description && <p className="mt-4 text-sm text-[#B5C9B3] leading-relaxed">{profile.description}</p>}
        <div className="mt-7 grid grid-cols-3 gap-2">
          {profile.whatsapp && <a href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#A7C4A0] text-[#122B1D] py-3 text-center text-xs font-black">WhatsApp</a>}
          {profile.phone && <a href={`tel:${profile.phone.replace(/[^0-9+]/g, '')}`} className="rounded-full border border-[#2E5A3C] py-3 text-center text-xs font-bold">Call</a>}
          <a href={profile.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address || profile.business_name)}`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-[#2E5A3C] py-3 text-center text-xs font-bold">Visit</a>
        </div>
        <QueueSection profile={profile} />
        <section className="mt-10 space-y-3">
          {products.map((p) => (
            <button key={p.id} type="button" onClick={() => onSelectProduct(p)} className="w-full rounded-2xl bg-[#1E4029]/60 border border-[#2E5A3C] p-4 text-left hover:bg-[#1E4029] transition-colors">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-bold text-[#DCE8D5]">{p.name}</h3>
                <span className="text-[#A7C4A0] font-black">{inr(p)}</span>
              </div>
              {p.description && <p className="text-xs text-[#8FB996] mt-1">{p.description}</p>}
            </button>
          ))}
        </section>
        {links.length > 0 && <section className="mt-8"><LinksList links={links} profile={profile} /></section>}
        <div className="mt-8"><ReviewsSection reviews={reviews} /><div className="py-3"><BusinessInfoCard profile={profile} /></div></div>
        <SiteFooter />
      </div>
    </div>
  );
}

/* ================= MARKET — loud mandi ================= */
export function MarketLayout({ profile, products, links, reviews, onSelectProduct, onShare }: LayoutProps) {
  return (
    <div className="min-h-full bg-[#FBEF3F] text-[#1A1A1A]">
      <div className="bg-[#D7263D] text-white px-5 pt-8 pb-10">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <span className="bg-[#FBEF3F] text-[#1A1A1A] px-2 py-1 text-[10px] font-black uppercase tracking-widest -rotate-2">{profile.category}</span>
            <button type="button" onClick={onShare} aria-label="Share page" className="p-2 bg-white/20 rounded-full"><Share2 className="w-4 h-4" /></button>
          </div>
          <h1 className="mt-4 text-4xl font-black uppercase tracking-tight leading-[0.95]" style={{ textShadow: '3px 3px 0 rgba(0,0,0,0.35)' }}>{profile.business_name}</h1>
          {profile.description && <p className="mt-2 text-sm font-bold opacity-90">{profile.description}</p>}
        </div>
      </div>
      <div className="max-w-md mx-auto px-4">
        <div className="-mt-6 bg-white dark:bg-[#111B2E] border-4 border-[#1A1A1A] rounded-2xl p-4 shadow-[6px_6px_0_#1A1A1A]">
          <ActionRow profile={profile} shape="sharp" />
        </div>
        <QueueSection profile={profile} />
        <section className="py-6 grid grid-cols-2 gap-3">
          {products.map((p) => (
            <button key={p.id} type="button" onClick={() => onSelectProduct(p)} className="bg-white border-4 border-[#1A1A1A] rounded-xl p-3 text-left shadow-[4px_4px_0_#1A1A1A] hover:-translate-y-1 transition-transform">
              <span className="inline-block bg-[#2E933C] text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded-sm">Fresh</span>
              <h3 className="font-black uppercase text-sm mt-2 leading-tight">{p.name}</h3>
              <span className="block mt-1.5 text-xl font-black text-[#D7263D]">{inr(p)}</span>
            </button>
          ))}
        </section>
        {links.length > 0 && <section className="pb-4"><LinksList links={links} profile={profile} /></section>}
        <div className="pb-6"><ReviewsSection reviews={reviews} /><div className="py-3"><BusinessInfoCard profile={profile} /></div></div>
        <SiteFooter />
      </div>
    </div>
  );
}

/* ================= CAFÉ PRO — full-featured restaurant page ================= */

const CAFE_DEFAULTS = {
  cover: '/images/cafe/cover.webp',
  avatar: '/images/cafe/logo.webp',
  gallery: ['/images/cafe/interior.webp', '/images/cafe/cappuccino.webp', '/images/cafe/neon.webp', '/images/cafe/latte.webp'],
  productImages: ['/images/cafe/cappuccino.webp', '/images/cafe/burger.webp', '/images/cafe/fries.webp', '/images/cafe/latte.webp'],
  hours: [
    { days: 'Mon - Sat', hours: '8:00 AM – 10:00 PM' },
    { days: 'Sunday', hours: '9:00 AM – 9:00 PM' },
  ],
  serviceTags: ['Dine-in', 'Takeaway', 'Home Delivery', 'Birthday & Event Bookings', 'Custom Orders', 'Free WiFi'],
};

function parseOpenNow(hours: { days: string; hours: string }[]): boolean {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  for (const row of hours) {
    const m = row.hours.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*[-–]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!m) continue;
    const to24 = (h: number, min: number, ap: string) => {
      const hh = h % 12 + (ap.toUpperCase() === 'PM' ? 12 : 0);
      return hh * 60 + min;
    };
    const open = to24(Number(m[1]), Number(m[2]), m[3]);
    const close = to24(Number(m[4]), Number(m[5]), m[6]);
    if (minutes >= open && minutes <= close) return true;
  }
  return false;
}

export function CafeProLayout({ profile, products, links, reviews, onSelectProduct, onShare }: LayoutProps) {
  const cover = profile.cover_url || CAFE_DEFAULTS.cover;
  const avatar = profile.avatar_url || profile.logo_url || CAFE_DEFAULTS.avatar;
  const bio = profile.bio || profile.description;
  const stats = profile.stats || { rating: 4.8, customers: '1K+', years: '3+' };
  const hours = profile.business_hours?.length ? profile.business_hours : CAFE_DEFAULTS.hours;
  const gallery = profile.gallery?.length ? profile.gallery : CAFE_DEFAULTS.gallery;
  const serviceTags = profile.service_tags?.length
    ? profile.service_tags
    : profile.services?.length
      ? profile.services.map((s) => s.name)
      : CAFE_DEFAULTS.serviceTags;
  const openNow = parseOpenNow(hours);
  const mapsHref = profile.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([profile.address, profile.city, profile.state].filter(Boolean).join(', ') || profile.business_name)}`;
  const wa = profile.whatsapp?.replace(/[^0-9]/g, '') || profile.phone?.replace(/[^0-9]/g, '');
  const igHandle = profile.instagram?.replace(/^@/, '').split('/').pop() || '';

  const tabs = [
    { id: 'menu', label: 'Menu' },
    { id: 'about', label: 'About' },
    { id: 'services', label: 'Services' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <div className="min-h-full bg-[#0B0F14] text-white">
      {/* Cover */}
      <div className="relative h-44 sm:h-56">
        {cover?.trim() && <img src={cover.trim()} alt={`${profile.business_name} cover`} className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14] via-[#0B0F14]/40 to-transparent" />
        <button type="button" onClick={onShare} aria-label="Share page" className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur border border-white/10">
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 max-w-lg mx-auto w-full">
        {/* Identity */}
        <div className="-mt-12 relative">
          <div className="relative w-24 h-24 rounded-full border-4 border-[#0B0F14] overflow-hidden bg-[#141B24]">
            {avatar?.trim() && <img src={avatar.trim()} alt={`${profile.business_name} logo`} className="w-full h-full object-cover" />}
          </div>
          {profile.verified !== false && (
            <span className="absolute left-[74px] top-[74px] w-6 h-6 rounded-full bg-emerald-500 border-[3px] border-[#0B0F14] flex items-center justify-center" aria-label="Verified business">
              <svg viewBox="0 0 12 12" className="w-3 h-3 fill-none stroke-white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6.5 5 9l4.5-6" /></svg>
            </span>
          )}
        </div>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight">{profile.business_name}</h1>
        <p className="mt-1 text-xs text-zinc-300 flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1"><Navigation className="w-3 h-3" />{profile.category}</span>
          <span className="text-zinc-600">•</span>
          <span className="text-emerald-400 font-semibold inline-flex items-center gap-1">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-emerald-400"><path d="M12 2 14.9 4.6 18.8 4.2 19.9 8 23 10.2 21.2 13.7 22 17.5 18.3 18.6 16.4 22 12.6 20.8 9 22.6 6.9 19.4 3.1 18.7 3.4 14.8 1 11.8 3.6 9 3.4 5.2 7.2 4.6 9.1 1.3Z" opacity=".9"/><path d="m8.5 12 2.3 2.3 4.7-4.7" fill="none" stroke="#0B0F14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Verified
          </span>
        </p>
        <p className="mt-1 text-xs text-zinc-400 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          {[profile.city, profile.state].filter(Boolean).join(', ') || profile.address || 'India'}
        </p>
        {bio && <p className="mt-2 text-[13px] leading-relaxed text-zinc-300 text-pretty">{bio}</p>}

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { icon: <Star className="w-4 h-4 text-amber-400 fill-amber-400" />, top: String(stats.rating ?? '4.8'), sub: 'Customer Rating' },
            { icon: <Users className="w-4 h-4 text-sky-400" />, top: stats.customers || '1K+', sub: 'Happy Customers' },
            { icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />, top: stats.years || '3+', sub: 'Years in Business' },
          ].map((s, i) => (
            <div key={i} className="rounded-xl bg-[#121924] border border-white/5 px-2.5 py-2.5">
              <div className="flex items-center gap-1.5">{s.icon}<span className="text-sm font-bold">{s.top}</span></div>
              <p className="mt-0.5 text-[10px] text-zinc-400 leading-tight">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {wa && (
            <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="col-span-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#05210F] text-xs font-bold transition-colors">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
          )}
          {profile.phone && (
            <a href={`tel:${profile.phone.replace(/[^0-9+]/g, '')}`} className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#1A2330] hover:bg-[#232E3D] border border-white/5 text-xs font-bold transition-colors">
              <Phone className="w-4 h-4" /> Call
            </a>
          )}
          <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#1A2330] hover:bg-[#232E3D] border border-white/5 text-xs font-bold transition-colors">
            <Navigation className="w-4 h-4" /> Directions
          </a>
        </div>
      </div>

      {/* Tab nav */}
      <nav className="sticky top-0 z-20 mt-4 bg-[#0B0F14]/95 backdrop-blur border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 flex gap-5 overflow-x-auto [scrollbar-width:none]">
          {tabs.map((t) => (
            <a key={t.id} href={`#${t.id}`} className="shrink-0 py-2.5 text-xs font-semibold text-zinc-400 hover:text-white border-b-2 border-transparent hover:border-white/20 transition-colors">
              {t.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="px-4 max-w-lg mx-auto w-full pb-8">
        {/* Menu */}
        <section id="menu" className="pt-5 scroll-mt-14">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center gap-1.5"><ShoppingBag className="w-4 h-4 text-emerald-400" /> Popular Items</h2>
            <a href="#menu" className="text-[11px] font-semibold text-sky-400">View All →</a>
          </div>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none]">
            {(products.length ? products : []).map((p, i) => {
              const img = p.image_url || CAFE_DEFAULTS.productImages[i % CAFE_DEFAULTS.productImages.length];
              const off = p.discount_pct || 0;
              const finalPrice = off > 0 ? Math.round(p.price * (1 - off / 100)) : p.price;
              return (
                <button key={p.id} type="button" onClick={() => onSelectProduct(p)} className="shrink-0 w-36 text-left rounded-2xl bg-[#121924] border border-white/5 overflow-hidden hover:border-white/15 transition-colors">
                  <div className="relative h-24">
                    <img src={img} alt={p.name} className="w-full h-full object-cover" />
                    {(p.featured || i === 0) && (
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-amber-400 text-[#231A00] text-[9px] font-extrabold inline-flex items-center gap-0.5"><Crown className="w-2.5 h-2.5" /> Bestseller</span>
                    )}
                    {off > 0 && (
                      <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-red-500 text-white text-[9px] font-extrabold">-{off}%</span>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-bold truncate">{p.name}</p>
                    {p.description && <p className="text-[10px] text-zinc-400 truncate">{p.description}</p>}
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs font-extrabold">
                        ₹{finalPrice}
                        {off > 0 && <span className="ml-1 text-[10px] text-zinc-500 line-through font-medium">₹{p.price}</span>}
                      </span>
                      {wa && (
                        <a
                          href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hi! I want to order: ${p.name} (₹${finalPrice})`)}`}
                          target="_blank" rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Order ${p.name} on WhatsApp`}
                          className="w-6 h-6 rounded-full bg-emerald-500 text-[#05210F] flex items-center justify-center hover:bg-emerald-400 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
            {products.length === 0 && (
              <p className="text-xs text-zinc-500 py-6">Menu coming soon.</p>
            )}
          </div>
        </section>

        {/* About + Services */}
        <section id="about" className="pt-3 grid sm:grid-cols-2 gap-3 scroll-mt-14">
          <div className="rounded-2xl bg-[#121924] border border-white/5 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold flex items-center gap-1.5"><Info className="w-3.5 h-3.5 text-sky-400" /> About Us</h3>
              <span className="text-[10px] text-zinc-500">Since {new Date().getFullYear() - Number(String(stats.years || '3').replace(/\D/g, '') || 3)}</span>
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-zinc-300 text-pretty">
              {bio || `${profile.business_name} is a local favourite. Great food, warm service and a place you will want to come back to.`}
            </p>
          </div>
          <div id="services" className="rounded-2xl bg-[#121924] border border-white/5 p-4 scroll-mt-14">
            <h3 className="text-xs font-bold flex items-center gap-1.5"><Settings className="w-3.5 h-3.5 text-emerald-400" /> Our Services</h3>
            <ul className="mt-2 space-y-1.5">
              {serviceTags.slice(0, 6).map((s) => (
                <li key={s} className="flex items-center gap-2 text-[12px] text-zinc-200">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-emerald-400" strokeWidth={3} />
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Hours + Location */}
        <section className="pt-3 grid sm:grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#121924] border border-white/5 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-amber-400" /> Business Hours</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${openNow ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                {openNow ? 'Open Now' : 'Closed'}
              </span>
            </div>
            <div className="mt-2 space-y-1.5">
              {hours.map((h) => (
                <div key={h.days} className="flex items-center justify-between text-[12px]">
                  <span className="text-zinc-400">{h.days}</span>
                  <span className="font-semibold">{h.hours}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-[#121924] border border-white/5 p-4">
            <h3 className="text-xs font-bold flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-red-400" /> Location</h3>
            <div className="mt-2 flex items-center gap-3">
              <p className="flex-1 text-[12px] text-zinc-300 leading-snug">{[profile.address, profile.city, profile.state].filter(Boolean).join(', ') || 'View on Google Maps'}</p>
              <div className="w-20 h-14 rounded-lg overflow-hidden relative shrink-0 bg-[#1A2330]">
                <GoogleMapEmbed
                  query={buildMapQuery([profile.address, profile.city, profile.state]) || profile.business_name}
                  zoom={15}
                  className="w-full h-full border-0"
                  title="Location map"
                />
              </div>
            </div>
            <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="mt-2.5 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-[#111B2E] text-[#0B0F14] text-[11px] font-bold hover:bg-zinc-200 transition-colors">
              View on Maps <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </section>

        {/* Gallery */}
        <section id="gallery" className="pt-5 scroll-mt-14">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center gap-1.5"><Camera className="w-4 h-4 text-sky-400" /> Photo Gallery</h2>
            <a href="#gallery" className="text-[11px] font-semibold text-sky-400">View All →</a>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {gallery.slice(0, 5).map((src, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-[#1A2330]">
                {src?.trim() && <img src={src.trim()} alt={`${profile.business_name} photo ${i + 1}`} className="w-full h-full object-cover" />}
                {i === 4 && gallery.length > 5 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs font-bold">+{gallery.length - 5}</div>
                )}
                {i === 0 && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center"><Play className="w-3.5 h-3.5 fill-white" /></span>
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Reviews */}
        <section id="reviews" className="pt-5 scroll-mt-14">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Customer Reviews</h2>
            <a href="#reviews" className="text-[11px] font-semibold text-sky-400">View All →</a>
          </div>
          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            {reviews.slice(0, 4).map((r) => (
              <div key={r.id} className="rounded-2xl bg-[#121924] border border-white/5 p-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center text-[11px] font-extrabold">
                    {r.author_name.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">{r.author_name}</p>
                    <p className="text-[10px] text-amber-400">{'★'.repeat(Math.round(r.rating))}<span className="text-zinc-600 ml-1.5">{r.date}</span></p>
                  </div>
                </div>
                <p className="mt-2 text-[12px] leading-relaxed text-zinc-300 text-pretty">{r.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact chips */}
        <section id="contact" className="pt-5 grid sm:grid-cols-3 gap-2.5 scroll-mt-14">
          {profile.phone && (
            <a href={`tel:${profile.phone.replace(/[^0-9+]/g, '')}`} className="rounded-xl bg-[#121924] border border-white/5 p-3 hover:border-white/15 transition-colors">
              <Phone className="w-4 h-4 text-emerald-400" />
              <p className="mt-1.5 text-[11px] font-bold truncate">{profile.phone}</p>
              <p className="text-[10px] text-zinc-500">Tap to call</p>
            </a>
          )}
          {profile.email && (
            <a href={`mailto:${profile.email}`} className="rounded-xl bg-[#121924] border border-white/5 p-3 hover:border-white/15 transition-colors">
              <Mail className="w-4 h-4 text-sky-400" />
              <p className="mt-1.5 text-[11px] font-bold truncate">{profile.email}</p>
              <p className="text-[10px] text-zinc-500">Tap to email</p>
            </a>
          )}
          {igHandle && (
            <a href={profile.instagram!.startsWith('http') ? profile.instagram : `https://instagram.com/${igHandle}`} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-[#121924] border border-white/5 p-3 hover:border-white/15 transition-colors">
              <Instagram className="w-4 h-4 text-pink-400" />
              <p className="mt-1.5 text-[11px] font-bold truncate">@{igHandle}</p>
              <p className="text-[10px] text-zinc-500">Follow us</p>
            </a>
          )}
        </section>

        {links.length > 0 && <section className="pt-4"><LinksList links={links} profile={profile} /></section>}

        {/* Footer */}
        <footer className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Powered by <span className="font-bold text-zinc-300">LinkOS</span></span>
          <a href="/templates" className="font-semibold text-sky-400 hover:text-sky-300">Create your own page →</a>
        </footer>
      </div>
    </div>
  );
}

/* ================= GARAGE PRO — "AutoCare service centre" ================= */
const GARAGE_DEFAULTS = {
  cover: '/images/garage/cover.webp',
  avatar: '/images/garage/logo.webp',
  gallery: ['/images/garage/gal-1.webp', '/images/garage/gal-2.webp', '/images/garage/gal-3.webp', '/images/garage/gal-4.webp'],
  serviceImages: ['/images/garage/svc-oil.webp', '/images/garage/svc-brake.webp', '/images/garage/svc-wheel.webp', '/images/garage/svc-ac.webp'],
  defaultServices: [
    { name: 'Engine Oil Change', description: 'Keep your engine healthy', price: 1199 },
    { name: 'Brake Service', description: 'Safe & smooth drive', price: 999 },
    { name: 'Wheel Alignment', description: 'Better control', price: 799 },
    { name: 'AC Service', description: 'Cooler & fresher rides', price: 1299 },
  ],
  hours: [
    { days: 'Mon - Sat', hours: '9:00 AM – 8:00 PM' },
    { days: 'Sunday', hours: '10:00 AM – 5:00 PM' },
  ],
  featureTags: [
    { icon: Wrench, label: 'Service' },
    { icon: Hammer, label: 'Repair' },
    { icon: Cog, label: 'Maintenance' },
    { icon: BadgeCheck, label: 'Genuine Parts' },
  ],
  whyUs: ['Experienced Technicians', 'Genuine Spare Parts', 'Affordable Pricing', 'Multi-Brand Service', 'Quick Turnaround', 'Customer Support'],
  defaultReviews: [
    { id: 'g-rev-1', author_name: 'Rohit Das', rating: 5, date: '2 weeks ago', text: 'Excellent service! Staff are professional and friendly. Highly recommended!' },
    { id: 'g-rev-2', author_name: 'Suhana Khatun', rating: 5, date: '1 month ago', text: 'Very good experience. Quick service and genuine parts. Best in Berhampore!' },
  ],
};

export function GarageProLayout({ profile, products, links, reviews, onSelectProduct, onShare }: LayoutProps) {
  const cover = profile.cover_url || GARAGE_DEFAULTS.cover;
  const avatar = profile.avatar_url || profile.logo_url || GARAGE_DEFAULTS.avatar;
  const stats = profile.stats || { rating: 4.8, customers: '3K+', years: '8+' };
  const hours = profile.business_hours?.length ? profile.business_hours : GARAGE_DEFAULTS.hours;
  const gallery = profile.gallery?.length ? profile.gallery : GARAGE_DEFAULTS.gallery;
  const openNow = parseOpenNow(hours);
  const mapsHref = profile.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([profile.address, profile.city, profile.state].filter(Boolean).join(', ') || profile.business_name)}`;
  const wa = profile.whatsapp?.replace(/[^0-9]/g, '') || profile.phone?.replace(/[^0-9]/g, '');
  const igHandle = profile.instagram?.replace(/^@/, '').split('/').pop() || '';
  const shownReviews = reviews.length ? reviews : GARAGE_DEFAULTS.defaultReviews;

  const svcOnly = products.filter((p) => p.category === 'Services');
  const serviceCards = ((svcOnly.length ? svcOnly : products).length ? (svcOnly.length ? svcOnly : products) : GARAGE_DEFAULTS.defaultServices.map((s, i) => ({
    id: `g-svc-${i}`,
    profile_id: profile.id,
    name: s.name,
    description: s.description,
    price: s.price,
    currency: 'INR',
    image_url: GARAGE_DEFAULTS.serviceImages[i % GARAGE_DEFAULTS.serviceImages.length],
    category: 'Services',
    available: true,
    featured: false,
    sort_order: i,
    created_at: '',
    updated_at: '',
  } as Product))).slice(0, 8);

  // "AutoCare Service Centre" → "Auto" white + "Care" blue (split at CamelCase boundary), rest as subtitle
  const nameWords = profile.business_name.split(' ');
  const head = nameWords[0] || profile.business_name;
  const rest = nameWords.slice(1).join(' ');
  const camelIdx = head.slice(1).search(/[A-Z]/) + 1;
  const mid = camelIdx > 0 ? camelIdx : head.length;

  const tabs = [
    { id: 'g-services', label: 'Services' },
    { id: 'g-products', label: 'Products' },
    { id: 'g-gallery', label: 'Gallery' },
    { id: 'g-reviews', label: 'Reviews' },
    { id: 'g-contact', label: 'Contact' },
  ];

  return (
    <div className="min-h-full bg-[#F4F7FB] dark:bg-[#0A1120] text-slate-900 dark:text-slate-100">
      {/* ── Dark cover ── */}
      <div className="relative">
        <div className="relative h-64 sm:h-80">
          {cover?.trim() && <img src={cover.trim()} alt={`${profile.business_name} cover`} className="absolute inset-0 w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-r from-[#050B16]/95 via-[#050B16]/70 to-[#050B16]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050B16] via-transparent to-[#050B16]/40" />

          <button type="button" onClick={onShare} aria-label="Share page" className="absolute top-3 right-3 p-2 rounded-full bg-white/10 backdrop-blur border border-white/15 text-white">
            <Share2 className="w-4 h-4" />
          </button>

          <div className="absolute inset-x-0 bottom-0">
            <div className="max-w-lg mx-auto px-4 pb-14 text-white">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 backdrop-blur px-3 py-1 text-[10px] font-semibold tracking-wide">
                <ShieldCheck className="w-3 h-3" /> Trusted &amp; Professional
              </span>
              <h1 className="mt-2 text-4xl font-extrabold tracking-tight leading-none">
                <span className="text-white">{head.slice(0, mid)}</span>
                <span className="text-[#3B82F6]">{head.slice(mid)}</span>
              </h1>
              {rest && <p className="mt-1 text-lg font-bold text-white">{rest}</p>}
              <p className="mt-1 text-xs text-slate-300">{profile.description || 'Reliable Service. Smoother Journeys.'}</p>
              <div className="mt-3 flex gap-5">
                {GARAGE_DEFAULTS.featureTags.map(({ icon: Icon, label }) => (
                  <span key={label} className="flex flex-col items-center gap-1 text-[9px] text-slate-200">
                    <Icon className="w-4 h-4 text-slate-100" />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <p className="absolute top-8 right-4 font-serif italic text-white/90 text-sm leading-tight text-right -rotate-6 select-none" aria-hidden="true">
            Drive<br />Better<br />Everyday
          </p>
        </div>

        {/* ── White identity card ── */}
        <div className="relative bg-white dark:bg-[#111B2E] rounded-t-3xl -mt-4 shadow-sm">
          <div className="max-w-lg mx-auto px-4 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="-mt-10 relative shrink-0">
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-slate-100">
                  {avatar?.trim() && <img src={avatar.trim()} alt={`${profile.business_name} logo`} className="w-full h-full object-cover" />}
                </div>
                {profile.verified !== false && (
                  <span className="absolute right-0 bottom-1 w-6 h-6 rounded-full bg-emerald-500 border-[3px] border-white flex items-center justify-center" aria-label="Verified business">
                    <svg viewBox="0 0 12 12" className="w-3 h-3 fill-none stroke-white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6.5 5 9l4.5-6" /></svg>
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-blue-100 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 px-3 py-2 shrink-0">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <p className="text-[10px] font-semibold leading-tight text-slate-700 dark:text-slate-200">Quality Service<br />Affordable Pricing</p>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>

            <div className="mt-2.5 flex items-center gap-1.5">
              <h2 className="text-xl font-extrabold tracking-tight">{profile.business_name}</h2>
              <BadgeCheck className="w-5 h-5 text-blue-600 fill-blue-600" />
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
              <span>{profile.category}</span>
              <span className="text-slate-300">���</span>
              <span className="text-emerald-600 font-semibold inline-flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Verified
              </span>
            </p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {[profile.city, profile.state].filter(Boolean).join(', ') || profile.address || 'India'}
            </p>

            {/* Stats */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { icon: <Star className="w-4 h-4 text-amber-400 fill-amber-400" />, top: String(stats.rating ?? '4.8'), sub: '(320+ reviews)' },
                { icon: <Users className="w-4 h-4 text-blue-600" />, top: stats.customers || '3K+', sub: 'Happy Customers' },
                { icon: <Cog className="w-4 h-4 text-slate-700 dark:text-slate-200" />, top: stats.years || '8+', sub: 'Years in Business' },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111B2E] px-2 py-2">
                  {s.icon}
                  <div className="leading-tight">
                    <span className="text-xs font-extrabold">{s.top}</span>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400">{s.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-3 grid grid-cols-4 gap-2">
              {wa && (
                <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition-colors">
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              )}
              {profile.phone && (
                <a href={`tel:${profile.phone.replace(/[^0-9+]/g, '')}`} className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-50 dark:bg-blue-500/100 text-white text-xs font-bold transition-colors">
                  <Phone className="w-4 h-4" /> Call
                </a>
              )}
              <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111B2E] hover:bg-slate-50 dark:bg-white/5 text-xs font-bold transition-colors">
                <Navigation className="w-4 h-4" /> Directions
              </a>
              <button type="button" className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111B2E] hover:bg-slate-50 dark:bg-white/5 text-xs font-bold transition-colors">
                <Bookmark className="w-4 h-4" /> Save
              </button>
            </div>
          </div>

          {/* Tab nav */}
          <nav className="sticky top-0 z-20 bg-[#0E1830]/95 backdrop-blur border-b border-slate-100 dark:border-white/5">
            <div className="max-w-lg mx-auto px-4 flex gap-5 overflow-x-auto [scrollbar-width:none]">
              <a href="#g-top" className="shrink-0 py-2.5 text-xs font-bold text-blue-600 border-b-2 border-blue-600">Overview</a>
              {tabs.map((t) => (
                <a key={t.id} href={`#${t.id}`} className="shrink-0 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-100 border-b-2 border-transparent hover:border-slate-200 dark:border-white/10 transition-colors">
                  {t.label}
                </a>
              ))}
            </div>
          </nav>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 w-full" id="g-top">
        {/* ── Our Services ── */}
        <section id="g-services" className="mt-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10/70 border border-blue-100 dark:border-blue-500/20 p-4 scroll-mt-16">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              <Wrench className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="text-base font-extrabold">Our Services</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Complete care for your vehicle</p>
              </div>
            </div>
            <a href="#g-services" className="text-xs font-bold text-blue-600 inline-flex items-center gap-1">View All <ChevronRight className="w-3.5 h-3.5" /></a>
          </div>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none]">
            {serviceCards.map((p, i) => {
              const img = p.image_url?.trim() || GARAGE_DEFAULTS.serviceImages[i % GARAGE_DEFAULTS.serviceImages.length];
              return (
                <button key={p.id} type="button" onClick={() => onSelectProduct(p)} className="w-40 shrink-0 text-left bg-white dark:bg-[#111B2E] rounded-xl border border-slate-100 dark:border-white/5 p-2 hover:border-blue-200 transition-colors">
                  {img ? (
                    <img src={img} alt={p.name} className="h-24 w-full rounded-lg object-cover" />
                  ) : (
                    <div className="h-24 w-full rounded-lg bg-slate-100 dark:bg-white/5" />
                  )}
                  <p className="mt-2 text-xs font-extrabold leading-tight">{p.name}</p>
                  <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400 leading-tight">{p.description}</p>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-sm font-extrabold">{inr(p)}</span>
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── About + Why Choose Us ── */}
        <section className="mt-3 grid sm:grid-cols-2 gap-3">
          <div className="rounded-2xl bg-blue-50 dark:bg-blue-500/10/70 border border-blue-100 dark:border-blue-500/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-extrabold">About Us</h3>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Since {new Date().getFullYear() - Number(stats.years?.replace(/\D/g, '') || 8)}</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300 text-pretty">
              {profile.bio || profile.description || `${profile.business_name} is your trusted partner for car and bike servicing, repairs and genuine spare parts. Our skilled technicians ensure high-quality service, so you can drive with confidence.`}
            </p>
            <button type="button" className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white dark:bg-[#111B2E] px-4 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:bg-blue-500/10 transition-colors">
              Read More <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-blue-50 dark:bg-blue-500/10/70 border border-blue-100 dark:border-blue-500/20 p-4">
            <ShieldCheck className="absolute -right-3 top-1/2 -translate-y-1/2 w-24 h-24 text-blue-200/70" aria-hidden="true" />
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-extrabold">Why Choose Us</h3>
            </div>
            <ul className="mt-2.5 space-y-1.5 relative">
              {(profile.service_tags?.length ? profile.service_tags : GARAGE_DEFAULTS.whyUs).slice(0, 6).map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200">
                  <span className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth="3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Hours / Location / Contact ── */}
        <section id="g-contact" className="mt-3 grid sm:grid-cols-3 gap-3 scroll-mt-16">
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111B2E] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-extrabold">Business Hours</h3>
              </div>
              {openNow && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700">Open Now</span>}
            </div>
            <div className="mt-2.5 space-y-1.5">
              {hours.map((h) => (
                <div key={h.days} className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">{h.days}</span>
                  <span className="font-semibold">{h.hours}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111B2E] p-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-extrabold">Our Location</h3>
            </div>
            <p className="mt-2 text-[11px] text-slate-600 dark:text-slate-300 leading-snug">{[profile.address, profile.city, profile.state].filter(Boolean).join(', ') || 'Berhampore, West Bengal'}</p>
            <div className="relative mt-2 rounded-lg overflow-hidden">
              <GoogleMapEmbed
                query={buildMapQuery([profile.address, profile.city, profile.state]) || profile.business_name}
                zoom={15}
                className="h-20 w-full border-0"
                title="Map location"
              />
              <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex items-center justify-center">
                <span className="inline-flex items-center gap-1 rounded-full bg-white dark:bg-[#111B2E] px-3 py-1 text-[10px] font-bold text-blue-600 shadow">View on Maps <ChevronRight className="w-3 h-3" /></span>
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111B2E] p-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0"><Phone className="w-3.5 h-3.5 text-white" /></span>
              <h3 className="text-xs font-extrabold">Contact Us</h3>
            </div>
            <div className="mt-2.5 space-y-2">
              {profile.phone && (
                <a href={`tel:${profile.phone.replace(/[^0-9+]/g, '')}`} className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 hover:text-blue-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" /> <span className="truncate">{profile.phone}</span>
                </a>
              )}
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 hover:text-blue-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" /> <span className="truncate">{profile.email}</span>
                </a>
              )}
              {igHandle && (
                <a href={profile.instagram!.startsWith('http') ? profile.instagram : `https://instagram.com/${igHandle}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 hover:text-blue-600">
                  <Instagram className="w-3.5 h-3.5 text-pink-500 shrink-0" /> <span className="truncate">@{igHandle}</span>
                </a>
              )}
            </div>
          </div>
        </section>

        {/* ── Photo Gallery ── */}
        <section id="g-gallery" className="mt-4 scroll-mt-16">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-extrabold">Photo Gallery</h3>
            </div>
            <a href="#g-gallery" className="text-xs font-bold text-blue-600 inline-flex items-center gap-1">View All <ChevronRight className="w-3.5 h-3.5" /></a>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {gallery.slice(0, 4).map((src, i) => (
              src?.trim() ? <img key={i} src={src.trim()} alt={`${profile.business_name} gallery photo ${i + 1}`} className="h-20 w-full rounded-lg object-cover" /> : null
            ))}
            {gallery.length > 4 && gallery[4]?.trim() && (
              <div className="relative h-20 w-full rounded-lg overflow-hidden">
                <img src={gallery[4].trim()} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center text-white">
                  <span className="text-sm font-extrabold">+{Math.max(gallery.length - 4, 8)} More</span>
                  <span className="text-[9px] text-slate-300">Photos</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Customer Reviews ── */}
        <section id="g-reviews" className="mt-4 scroll-mt-16">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-600 fill-blue-600" />
              <h3 className="text-base font-extrabold">Customer Reviews</h3>
            </div>
            <a href="#g-reviews" className="text-xs font-bold text-blue-600 inline-flex items-center gap-1">View All <ChevronRight className="w-3.5 h-3.5" /></a>
          </div>
          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            {shownReviews.slice(0, 4).map((r) => (
              <div key={r.id} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111B2E] p-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 flex items-center justify-center text-xs font-extrabold shrink-0">
                    {r.author_name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                  </span>
                  <div>
                    <p className="text-xs font-extrabold leading-tight">{r.author_name}</p>
                    <p className="flex items-center gap-1">
                      <span className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
                        ))}
                      </span>
                      <span className="text-[9px] text-slate-400">{r.date}</span>
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 text-pretty">{r.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA banner ── */}
        <section className="mt-4 mb-2">
          <div className="rounded-2xl bg-[#0B1424] p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Car className="w-5 h-5 text-blue-400" />
              </span>
              <div>
                <p className="text-sm font-extrabold text-white leading-tight">Ready for a Smoother Ride?</p>
                <p className="text-[11px] text-slate-400">Book your service today!</p>
              </div>
            </div>
            <a href={wa ? `https://wa.me/${wa}` : '#g-contact'} target={wa ? '_blank' : undefined} rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-[#111B2E] px-4 py-2 text-xs font-extrabold text-slate-900 dark:text-slate-100 hover:bg-slate-100 transition-colors shrink-0">
              Book Now <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>

        {links.length > 0 && <section className="pb-2"><LinksList links={links} profile={profile} /></section>}

        <footer className="mt-2 pb-6 pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Powered by <span className="font-bold text-slate-700 dark:text-slate-200">LinkOS</span></span>
          <a href="/templates" className="font-semibold text-blue-600 hover:text-blue-500">Create your own page →</a>
        </footer>
      </div>
    </div>
  );
}

/* ================= GODI — "Rofik Godi Centre" dark & gold ================= */

const WhatsAppGlyph = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
);

const GODI_GOLD = '#E8C87A';

const GODI_DEFAULTS = {
  cover: '/images/godi/cover.webp',
  avatar: '/images/godi/avatar.webp',
  hero: '/images/godi/hero-seat.webp',
  shop: '/images/godi/shop.webp',
  productImages: ['/images/godi/prod-car.webp', '/images/godi/prod-bike.webp', '/images/godi/prod-steering.webp', '/images/godi/prod-accessories.webp'],
  defaultProducts: [
    { name: 'Car Seat Covers', description: 'Premium & Custom Fit', price: 2499 },
    { name: 'Bike Seat Covers', description: 'Stylish & Durable', price: 799 },
    { name: 'Steering Covers', description: 'Comfort & Grip', price: 499 },
    { name: 'Car Accessories', description: 'Pillows, Mats & More', price: 999 },
  ],
  tags: ['Comfort', 'Style', 'Durability'],
  hours: [
    { days: 'Mon - Sat', hours: '9:00 AM – 8:30 PM' },
    { days: 'Sunday', hours: '10:00 AM – 6:00 PM' },
  ],
  defaultReviews: [
    { id: 'gd-rev-1', author_name: 'Sk Imran', rating: 5, date: '1 week ago', text: 'Best seat cover shop in Berhampore! Premium quality material and perfect fitting. Highly recommended!' },
    { id: 'gd-rev-2', author_name: 'Sabbir Hossain', rating: 5, date: '3 weeks ago', text: 'Got my car interior done from here. Excellent finishing and very reasonable price.' },
  ],
};

export function GodiProLayout({ profile, products, links, reviews, onSelectProduct, onShare }: LayoutProps) {
  const cover = profile.cover_url || GODI_DEFAULTS.cover;
  const avatar = profile.avatar_url || profile.logo_url || GODI_DEFAULTS.avatar;
  const stats = profile.stats || { rating: 4.8, customers: '2K+', years: '8+' };
  const gallery = profile.gallery?.length ? profile.gallery : GODI_DEFAULTS.productImages;
  const mapsHref = profile.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([profile.address, profile.city, profile.state].filter(Boolean).join(', ') || profile.business_name)}`;
  const wa = profile.whatsapp?.replace(/[^0-9]/g, '') || profile.phone?.replace(/[^0-9]/g, '');
  const shownReviews = reviews.length ? reviews : GODI_DEFAULTS.defaultReviews;

  const productCards = (products.length ? products : GODI_DEFAULTS.defaultProducts.map((s, i) => ({
    id: `gd-prod-${i}`,
    profile_id: profile.id,
    name: s.name,
    description: s.description,
    price: s.price,
    currency: 'INR',
    image_url: GODI_DEFAULTS.productImages[i % GODI_DEFAULTS.productImages.length],
    category: 'Products',
    available: true,
    featured: false,
    sort_order: i,
    created_at: '',
    updated_at: '',
  } as Product))).slice(0, 8);

  const location = [profile.address, profile.city, profile.state].filter(Boolean).join(', ') || 'Kadbeltala, Berhampore, Murshidabad';
  const subtitle = profile.description || profile.category || 'Car Seat Covers & Interior Accessories';

  const tabs = [
    { id: 'gd-top', label: 'Home', icon: Home },
    { id: 'gd-products', label: 'Products', icon: LayoutGrid },
    { id: 'gd-gallery', label: 'Gallery', icon: Images },
    { id: 'gd-reviews', label: 'Reviews', icon: Star },
    { id: 'gd-about', label: 'About', icon: Info },
    { id: 'gd-contact', label: 'Contact', icon: Mail },
  ];

  return (
    <div className="min-h-full bg-[#0B0B0D] text-white">
      {/* ── Top app bar ── */}
      <header className="sticky top-0 z-30 bg-[#0B0B0D]/95 backdrop-blur border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button type="button" aria-label="Menu" className="p-1.5 -ml-1.5 text-white/90">
            <Menu className="w-6 h-6" />
          </button>
          <a href="/" className="flex items-center min-w-0">
            <span className="text-[17px] font-bold tracking-[-0.04em] leading-none text-white">
              Link<span className="font-medium text-zinc-400">OS</span>
            </span>
          </a>
          <div className="ml-auto flex items-center gap-1.5">
            <button type="button" aria-label="Search" className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button type="button" onClick={onShare} aria-label="Share page" className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <button type="button" className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-[#E8C87A]/40 bg-[#E8C87A]/10 px-3.5 py-1.5 text-xs font-bold text-[#E8C87A] hover:bg-[#E8C87A]/20 transition-colors">
              <Heart className="w-3.5 h-3.5 fill-[#E8C87A]" /> Save
            </button>
          </div>
        </div>
      </header>

      {/* ── Cover + identity ── */}
      <div className="relative">
        <div className="relative h-72 sm:h-96">
          {cover?.trim() && <img src={cover.trim()} alt={`${profile.business_name} cover`} className="absolute inset-0 w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-[#0B0B0D]/35 to-[#0B0B0D]/55" />
          <p className="absolute top-6 right-5 font-serif italic text-[#F5E7C8]/95 text-base leading-snug text-right -rotate-3 select-none" aria-hidden="true">
            Drive<br />In Comfort<br />Everyday
          </p>
        </div>

        <div className="max-w-lg mx-auto px-4">
          <div className="-mt-16 relative w-fit">
            <div className="w-24 h-24 rounded-full border-[3px] border-[#E8C87A]/70 shadow-lg shadow-black/50 overflow-hidden bg-[#1A1A1E]">
              {avatar?.trim() && <img src={avatar.trim()} alt={`${profile.business_name} logo`} className="w-full h-full object-cover" />}
            </div>
            {profile.verified !== false && (
              <span className="absolute right-0.5 bottom-1 w-6 h-6 rounded-full bg-emerald-500 border-[3px] border-[#0B0B0D] flex items-center justify-center" aria-label="Verified business">
                <svg viewBox="0 0 12 12" className="w-3 h-3 fill-none stroke-white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6.5 5 9l4.5-6" /></svg>
              </span>
            )}
          </div>

          <h1 className="mt-3 text-[26px] leading-tight font-extrabold tracking-tight">{profile.business_name}</h1>
          <p className="mt-1 text-sm text-white/85 flex items-center gap-1.5">
            <Car className="w-4 h-4 text-[#E8C87A] shrink-0" />
            <span className="truncate">{subtitle}</span>
          </p>
          <p className="mt-1 text-xs text-white/60 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#E8C87A] shrink-0" />
            <span className="truncate">{location}</span>
          </p>

          {/* Stats pills */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { icon: <Star className="w-4 h-4 text-[#E8C87A] fill-[#E8C87A]" />, top: String(stats.rating ?? '4.8'), sub: '(120+ Reviews)' },
              { icon: <Users className="w-4 h-4 text-[#E8C87A]" />, top: stats.customers || '2K+', sub: 'Happy Customers' },
              { icon: <CalendarCheck className="w-4 h-4 text-[#E8C87A]" />, top: stats.years || '8+', sub: 'Years in Business' },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-2 py-2.5">
                {s.icon}
                <div className="leading-tight min-w-0">
                  <span className="text-xs font-extrabold block truncate">{s.top}</span>
                  <p className="text-[9px] text-white/55 truncate">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tags + premium badge */}
          <div className="mt-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#E8C87A]">
              {GODI_DEFAULTS.tags.map((t, i) => (
                <span key={t} className="flex items-center gap-2">
                  {i > 0 && <span className="text-white/25">|</span>}
                  {t}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-[#E8C87A]/25 bg-[#E8C87A]/[0.07] px-3 py-1.5 shrink-0">
              <Crown className="w-4 h-4 text-[#E8C87A] shrink-0" />
              <p className="text-[9px] font-semibold leading-tight text-white/85">Premium Seat Covers<br />for a Better Drive</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-3.5 grid grid-cols-4 gap-2">
            {wa && (
              <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#1EBE56] text-white text-xs font-bold transition-colors">
                <WhatsAppGlyph className="w-4 h-4" /> WhatsApp
              </a>
            )}
            {profile.phone && (
              <a href={`tel:${profile.phone.replace(/[^0-9+]/g, '')}`} className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/12 bg-white/[0.05] hover:bg-white/10 text-xs font-bold transition-colors">
                <Phone className="w-4 h-4" /> Call
              </a>
            )}
            <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/12 bg-white/[0.05] hover:bg-white/10 text-xs font-bold transition-colors">
              <Navigation className="w-4 h-4" /> Directions
            </a>
            <button type="button" onClick={onShare} className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/12 bg-white/[0.05] hover:bg-white/10 text-xs font-bold transition-colors">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>

        {/* ── Tab nav ── */}
        <nav className="sticky top-14 z-20 mt-4 bg-[#0B0B0D]/95 backdrop-blur border-b border-white/5">
          <div className="max-w-lg mx-auto px-4 flex gap-5 overflow-x-auto [scrollbar-width:none]">
            {tabs.map((t, i) => (
              <a
                key={t.id}
                href={`#${t.id}`}
                className={`shrink-0 py-2.5 flex flex-col items-center gap-0.5 border-b-2 transition-colors ${i === 0 ? 'text-[#E8C87A] border-[#E8C87A]' : 'text-white/55 border-transparent hover:text-white'}`}
              >
                <t.icon className="w-5 h-5" />
                <span className="text-[10px] font-semibold">{t.label}</span>
              </a>
            ))}
          </div>
        </nav>
      </div>

      <div className="max-w-lg mx-auto px-4 w-full">
        {/* ── Hero banner ── */}
        <section className="mt-4 relative overflow-hidden rounded-2xl border border-[#E8C87A]/35 bg-[#141210] scroll-mt-32" id="gd-top">
          <img src={GODI_DEFAULTS.hero} alt="" aria-hidden="true" className="absolute inset-y-0 right-0 w-1/2 h-full object-cover opacity-70 [mask-image:linear-gradient(to_right,transparent,black_45%)]" />
          <div className="relative p-4 sm:p-5">
            <p className="text-[9px] font-bold tracking-[0.18em] text-[#E8C87A] uppercase">Custom Fit. Premium Quality.</p>
            <h2 className="mt-1.5 text-xl sm:text-2xl font-extrabold leading-tight">
              <span className="text-[#E8C87A]">SEAT COVERS</span><br />
              <span className="text-white">THAT FIT YOUR STYLE</span>
            </h2>
            <p className="mt-1.5 text-[11px] text-white/65">Cars • Bikes • Commercial Vehicles</p>
            <a href="#gd-products" className="mt-3.5 inline-flex items-center gap-1.5 rounded-lg bg-[#E8C87A] hover:bg-[#F0D694] px-4 py-2 text-xs font-extrabold text-[#1A1408] transition-colors">
              View Collections <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <div className="mt-4 sm:mt-0 sm:absolute sm:right-4 sm:top-1/2 sm:-translate-y-1/2 flex sm:flex-col gap-3">
              {[
                { icon: ShieldCheck, label: 'Premium Material' },
                { icon: Cog, label: 'Perfect Fit' },
                { icon: InfinityIcon, label: 'Long Lasting' },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1.5 text-[10px] font-semibold text-white/85">
                  <span className="w-7 h-7 rounded-full border border-[#E8C87A]/40 bg-[#E8C87A]/10 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-[#E8C87A]" />
                  </span>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Products & Services ── */}
        <section id="gd-products" className="mt-6 scroll-mt-32">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-[#E8C87A]" /> Our Products &amp; Services
            </h3>
            <a href="#gd-products" className="text-xs font-bold text-[#E8C87A] inline-flex items-center gap-1">View All <ArrowRight className="w-3.5 h-3.5" /></a>
          </div>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {productCards.map((p, i) => {
              const img = p.image_url?.trim() || GODI_DEFAULTS.productImages[i % GODI_DEFAULTS.productImages.length];
              return (
                <button key={p.id} type="button" onClick={() => onSelectProduct(p)} className="text-left rounded-xl overflow-hidden border border-white/10 bg-white/[0.04] hover:border-[#E8C87A]/40 transition-colors group">
                  <div className="aspect-square overflow-hidden">
                    {img ? (
                      <img src={img} alt={p.name} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full bg-white/5" />
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-extrabold leading-tight truncate">{p.name}</p>
                    <p className="mt-0.5 text-[10px] text-white/55 truncate">{p.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Trust stats ── */}
        <section className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { icon: Users, top: stats.customers || '2K+', sub: 'Happy Customers' },
            { icon: Crown, top: '120+', sub: '5 Star Reviews' },
            { icon: ShieldCheck, top: stats.years || '8+', sub: 'Years Experience' },
            { icon: MapPin, top: profile.city || 'Berhampore', sub: 'Our Location' },
          ].map((s) => (
            <div key={s.sub} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 flex items-start gap-2">
              <span className="w-7 h-7 rounded-full bg-[#E8C87A]/15 flex items-center justify-center shrink-0">
                <s.icon className="w-3.5 h-3.5 text-[#E8C87A]" />
              </span>
              <div className="min-w-0 leading-tight">
                <p className="text-xs font-extrabold truncate">{s.top}</p>
                <p className="text-[9px] text-white/55 truncate">{s.sub}</p>
              </div>
            </div>
          ))}
        </section>

        {/* ── About ── */}
        <section id="gd-about" className="mt-4 grid sm:grid-cols-2 gap-3 scroll-mt-32">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <h3 className="text-sm font-extrabold">About {profile.business_name}</h3>
            <p className="mt-2 text-xs leading-relaxed text-white/65 text-pretty">
              {profile.bio || `${profile.business_name} provides premium quality seat covers and interior accessories for cars, bikes and commercial vehicles. Our goal is to give you comfort, durability and style — all at the best price.`}
            </p>
            <button type="button" className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#E8C87A] hover:bg-[#F0D694] px-4 py-2 text-xs font-extrabold text-[#1A1408] transition-colors">
              Read More <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="rounded-2xl overflow-hidden border border-white/10 min-h-40">
            <img src={GODI_DEFAULTS.shop} alt={`${profile.business_name} shop`} loading="lazy" decoding="async" className="w-full h-full object-cover" />
          </div>
        </section>

        {/* ── Gallery ── */}
        <section id="gd-gallery" className="mt-6 scroll-mt-32">
          <h3 className="text-base font-extrabold flex items-center gap-2">
            <Images className="w-5 h-5 text-[#E8C87A]" /> Gallery
          </h3>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {gallery.slice(0, 6).map((src, i) => (
              <div key={`${src}-${i}`} className="aspect-square rounded-xl overflow-hidden border border-white/10">
                <img src={src} alt={`${profile.business_name} photo ${i + 1}`} loading="lazy" decoding="async" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            ))}
          </div>
        </section>

        {/* ── Reviews ── */}
        <section id="gd-reviews" className="mt-6 scroll-mt-32">
          <h3 className="text-base font-extrabold flex items-center gap-2">
            <Star className="w-5 h-5 text-[#E8C87A] fill-[#E8C87A]" /> Customer Reviews
          </h3>
          <div className="mt-3 space-y-2.5">
            {shownReviews.slice(0, 4).map((r) => (
              <div key={r.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-[#E8C87A]/15 text-[#E8C87A] flex items-center justify-center text-xs font-extrabold shrink-0" aria-hidden="true">
                    {(r.author_name.trim()[0] || '?').toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold truncate">{r.author_name}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex" aria-label={`${r.rating} out of 5 stars`}>
                        {[1, 2, 3, 4, 5].map((si) => (
                          <Star key={si} className={`w-3 h-3 ${si <= Math.round(r.rating) ? 'fill-[#E8C87A] text-[#E8C87A]' : 'text-white/20'}`} />
                        ))}
                      </span>
                      <span className="text-[9px] text-white/40">{r.date}</span>
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-xs text-white/70 leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Contact / hours / location ── */}
        <section id="gd-contact" className="mt-6 grid sm:grid-cols-2 gap-3 scroll-mt-32">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#E8C87A]" />
              <h3 className="text-xs font-extrabold">Business Hours</h3>
            </div>
            <div className="mt-2.5 space-y-1.5">
              {GODI_DEFAULTS.hours.map((h) => (
                <div key={h.days} className="flex items-center justify-between text-[11px]">
                  <span className="text-white/55">{h.days}</span>
                  <span className="font-semibold">{h.hours}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
              {profile.phone && (
                <a href={`tel:${profile.phone.replace(/[^0-9+]/g, '')}`} className="flex items-center gap-2 text-[11px] text-white/70 hover:text-[#E8C87A] transition-colors">
                  <Phone className="w-3.5 h-3.5 text-[#E8C87A] shrink-0" /> <span className="truncate">{profile.phone}</span>
                </a>
              )}
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="flex items-center gap-2 text-[11px] text-white/70 hover:text-[#E8C87A] transition-colors">
                  <Mail className="w-3.5 h-3.5 text-[#E8C87A] shrink-0" /> <span className="truncate">{profile.email}</span>
                </a>
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#E8C87A]" />
              <h3 className="text-xs font-extrabold">Find Us</h3>
            </div>
            <p className="mt-2 text-[11px] text-white/65 leading-snug">{location}</p>
            <div className="relative mt-2.5 rounded-xl overflow-hidden border border-white/10">
              <GoogleMapEmbed
                query={buildMapQuery([profile.address, profile.city, profile.state]) || profile.business_name}
                zoom={15}
                className="h-28 w-full border-0"
                title="Map location"
              />
              <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex items-center justify-center">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#0B0B0D]/90 border border-[#E8C87A]/40 px-3 py-1 text-[10px] font-bold text-[#E8C87A]">Open in Google Maps <ChevronRight className="w-3 h-3" /></span>
              </a>
            </div>
          </div>
        </section>

        {links.length > 0 && <section className="mt-4 pb-2"><LinksList links={links} profile={profile} /></section>}

        {/* ── Footer ── */}
        <footer className="mt-4 pb-24 pt-5 border-t border-white/10 flex flex-col items-center gap-2 text-center">
          <a href="/" className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/70 transition-colors group">
            <span>Powered by</span>
            <Link2 className="w-3.5 h-3.5 -rotate-45 text-white/70" aria-hidden="true" />
            <span className="font-bold text-white group-hover:underline">LinkOS</span>
          </a>
          <p className="text-[10px] text-white/40">Create your free mobile business page in 3 minutes</p>
          <a href="/templates" className="text-[11px] font-semibold text-[#E8C87A] hover:underline">Create your own page →</a>
        </footer>
      </div>

      {/* ── Sticky WhatsApp CTA ── */}
      <div className="sticky bottom-0 z-30 bg-gradient-to-t from-[#0B0B0D] via-[#0B0B0D]/85 to-transparent pt-4 pb-3 px-4">
        <div className="max-w-lg mx-auto">
          {wa ? (
            <a
              href={`https://wa.me/${wa}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-[#E8C87A] hover:bg-[#F0D694] text-sm font-extrabold text-[#1A1408] shadow-lg shadow-black/40 transition-colors"
            >
              <WhatsAppGlyph className="w-5 h-5" /> Chat on WhatsApp
            </a>
          ) : (
            <a
              href={profile.phone ? `tel:${profile.phone.replace(/[^0-9+]/g, '')}` : '#gd-contact'}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-[#E8C87A] hover:bg-[#F0D694] text-sm font-extrabold text-[#1A1408] shadow-lg shadow-black/40 transition-colors"
            >
              <Phone className="w-5 h-5" /> Call Now
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
