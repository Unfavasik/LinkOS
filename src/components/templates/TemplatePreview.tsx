import React from 'react';
import { PageTemplate } from '../../data/templates';
import { THEME_PALETTES, FONT_STACKS, getContrastText, getButtonRadius } from '../../lib/theme';

interface TemplatePreviewProps {
  template: PageTemplate;
  businessName: string;
  category?: string;
  className?: string;
}

type MiniProps = {
  accent: string;
  onAccent: string;
  radius: string | number;
  palette: (typeof THEME_PALETTES)[keyof typeof THEME_PALETTES];
  name: string;
  category?: string;
};

const Bar = ({ w, c, o = 1, h = 5 }: { w: string; c: string; o?: number; h?: number }) => (
  <div style={{ width: w, height: h, background: c, opacity: o, borderRadius: 99 }} />
);

/* Each design language gets its own miniature page structure so gallery
   cards are visually distinct at a glance — mirroring the real layouts. */
const MINIS: Record<string, React.FC<MiniProps>> = {
  cafe: (p) => (
    <div className="bg-[#0B0F14] min-h-full pb-3">
      <div className="relative h-14">
        <img src="/images/cafe/cover.webp" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14] via-transparent to-transparent" />
      </div>
      <div className="px-3 -mt-5 relative">
        <img src="/images/cafe/logo.webp" alt="" className="w-10 h-10 rounded-full border-2 border-[#0B0F14] object-cover" />
        <div className="mt-1.5 text-[13px] font-extrabold text-white">{p.name}</div>
        <div className="text-[9px] text-zinc-400">{p.category} · <span className="text-emerald-400 font-semibold">Verified</span></div>
        <div className="mt-2 grid grid-cols-3 gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-md bg-[#121924] border border-white/5 px-1.5 py-1">
              <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: p.accent }} /><Bar w="55%" c="#fff" o={0.9} h={4} /></div>
              <div className="mt-1"><Bar w="80%" c="#71717A" o={0.5} h={3} /></div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-1">
          <div className="flex-1 py-1.5 rounded-lg text-center text-[8px] font-bold bg-emerald-500 text-[#05210F]">WhatsApp</div>
          <div className="flex-1 py-1.5 rounded-lg text-center text-[8px] font-bold bg-[#1A2330] text-white">Call</div>
          <div className="flex-1 py-1.5 rounded-lg text-center text-[8px] font-bold bg-[#1A2330] text-white">Directions</div>
        </div>
        <div className="mt-2.5 flex gap-1.5 overflow-hidden">
          {['/images/cafe/cappuccino.webp', '/images/cafe/burger.webp', '/images/cafe/fries.webp'].map((src, i) => (
            <div key={i} className="w-16 shrink-0 rounded-lg overflow-hidden bg-[#121924] border border-white/5">
              <img src={src} alt="" className="w-full h-9 object-cover" />
              <div className="p-1"><Bar w="80%" c="#fff" o={0.85} h={3} /><div className="mt-0.5"><Bar w="45%" c="#22C55E" o={0.9} h={3} /></div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
  garage: (p) => (
    <div className="bg-[#F4F7FB] min-h-full pb-3">
      <div className="relative h-14">
        <img src="/images/garage/cover.webp" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050B16]/90 via-[#050B16]/60 to-transparent" />
        <div className="absolute left-2 bottom-1.5">
          <div className="text-[11px] font-extrabold text-white leading-none">Auto<span className="text-[#3B82F6]">Care</span></div>
          <div className="text-[6px] text-slate-300 mt-0.5">Service · Repair · Genuine Parts</div>
        </div>
      </div>
      <div className="px-3 relative">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-2 -mt-4 relative">
          <div className="flex items-center gap-1.5">
            <img src="/images/garage/logo.webp" alt="" className="w-8 h-8 rounded-full border-2 border-white shadow object-cover" />
            <div>
              <div className="text-[10px] font-extrabold text-slate-900 leading-none">{p.name}</div>
              <div className="text-[7px] text-slate-500 mt-0.5">{p.category} · <span className="text-emerald-600 font-semibold">Verified</span></div>
            </div>
          </div>
          <div className="mt-1.5 grid grid-cols-3 gap-1">
            {['4.8 (320+)', '3K+ Customers', '8+ Years'].map((s, i) => (
              <div key={i} className="rounded border border-slate-200 text-center text-[6px] font-bold text-slate-700 py-0.5">{s}</div>
            ))}
          </div>
          <div className="mt-1.5 grid grid-cols-4 gap-1">
            <div className="py-1 rounded text-center text-[6px] font-bold bg-emerald-500 text-white">WhatsApp</div>
            <div className="py-1 rounded text-center text-[6px] font-bold bg-blue-600 text-white">Call</div>
            <div className="py-1 rounded text-center text-[6px] font-bold border border-slate-200 text-slate-700">Directions</div>
            <div className="py-1 rounded text-center text-[6px] font-bold border border-slate-200 text-slate-700">Save</div>
          </div>
        </div>
        <div className="mt-2 rounded-lg bg-blue-50 border border-blue-100 p-1.5">
          <div className="text-[7px] font-extrabold text-slate-900">Our Services</div>
          <div className="mt-1 flex gap-1 overflow-hidden">
            {['/images/garage/svc-oil.webp', '/images/garage/svc-brake.webp', '/images/garage/svc-wheel.webp'].map((src, i) => (
              <div key={i} className="w-14 shrink-0 rounded overflow-hidden bg-white border border-slate-100">
                <img src={src} alt="" className="w-full h-7 object-cover" />
                <div className="p-0.5"><Bar w="85%" c="#0F172A" o={0.85} h={3} /><div className="mt-0.5"><Bar w="40%" c="#2563EB" o={0.9} h={3} /></div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),
  classic: (p) => (
    <div className="px-3 pt-4 text-center">
      <div className="w-9 h-9 rounded-full mx-auto flex items-center justify-center text-sm font-bold" style={{ background: p.accent, color: p.onAccent }}>{p.name.charAt(0)}</div>
      <div className="mt-2 text-[13px] font-bold" style={{ color: p.palette.text }}>{p.name}</div>
      {p.category && <div className="text-[9px] mt-0.5" style={{ color: p.palette.sub }}>{p.category}</div>}
      <div className="mt-2.5 grid grid-cols-3 gap-1.5">{['Chat', 'Call', 'Map'].map((l) => <div key={l} className="py-1.5 text-center text-[8px] font-semibold" style={{ background: p.accent, color: p.onAccent, borderRadius: p.radius }}>{l}</div>)}</div>
      <div className="mt-2.5 grid grid-cols-2 gap-1.5">{[0, 1].map((i) => <div key={i} className="rounded-lg overflow-hidden border" style={{ background: p.palette.surface, borderColor: p.palette.border }}><div className="h-8" style={{ background: i === 0 ? p.accent : p.palette.border, opacity: i === 0 ? 0.3 : 1 }} /><div className="p-1.5"><Bar w="75%" c={p.palette.text} o={0.85} /><div className="mt-1"><Bar w="50%" c={p.palette.sub} o={0.6} /></div></div></div>)}</div>
      <div className="mt-2.5 space-y-1.5">{[0, 1].map((i) => <div key={i} className="flex items-center justify-between px-2 py-1.5 rounded-lg border" style={{ background: p.palette.surface, borderColor: p.palette.border }}><Bar w={i === 0 ? '55%' : '40%'} c={p.palette.sub} /><div className="w-1.5 h-1.5 rounded-full" style={{ background: p.accent }} /></div>)}</div>
    </div>
  ),
  banner: (p) => (
    <div>
      <div className="h-10" style={{ background: p.accent }} />
      <div className="px-3 -mt-4">
        <div className="rounded-xl border p-2.5 shadow-md" style={{ background: p.palette.surface, borderColor: p.palette.border }}>
          <div className="grid grid-cols-3 gap-1.5">{['Chat', 'Call', 'Map'].map((l) => <div key={l} className="py-1.5 text-center text-[8px] font-semibold" style={{ background: p.accent, color: p.onAccent, borderRadius: p.radius }}>{l}</div>)}</div>
        </div>
      </div>
      <div className="px-3 pt-3 text-center">
        <div className="w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold" style={{ background: p.accent, color: p.onAccent }}>{p.name.charAt(0)}</div>
        <div className="mt-1.5 text-[12px] font-bold" style={{ color: p.palette.text }}>{p.name}</div>
      </div>
      <div className="px-3 pt-2.5 space-y-1.5">{[0, 1].map((i) => <div key={i} className="rounded-lg border p-2" style={{ background: p.palette.surface, borderColor: p.palette.border }}><Bar w="70%" c={p.palette.text} o={0.85} /><div className="mt-1"><Bar w="45%" c={p.palette.sub} o={0.6} /></div></div>)}</div>
    </div>
  ),
  split: (p) => (
    <div className="px-3 pt-4">
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ background: p.accent, color: p.onAccent }}>{p.name.charAt(0)}</div>
        <div><div className="text-[13px] font-bold" style={{ color: p.palette.text }}>{p.name}</div><div className="text-[9px]" style={{ color: p.palette.sub }}>{p.category}</div></div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1.5">{['Chat', 'Call', 'Map'].map((l) => <div key={l} className="py-1.5 text-center text-[8px] font-semibold" style={{ background: p.accent, color: p.onAccent, borderRadius: p.radius }}>{l}</div>)}</div>
      <div className="mt-3 space-y-2">{[0, 1].map((i) => <div key={i} className="flex gap-2"><div className="w-12 h-12 rounded-lg shrink-0" style={{ background: i === 0 ? p.accent : p.palette.border, opacity: i === 0 ? 0.35 : 1 }} /><div className="flex-1 pt-1"><Bar w="80%" c={p.palette.text} o={0.85} /><div className="mt-1.5"><Bar w="55%" c={p.palette.sub} o={0.6} /></div></div></div>)}</div>
    </div>
  ),
  minimal: (p) => (
    <div className="px-4 pt-5">
      <div className="text-[8px] font-bold uppercase tracking-[0.25em]" style={{ color: p.palette.sub }}>{p.category}</div>
      <div className="mt-1 text-[16px] font-bold tracking-tight" style={{ color: p.palette.text }}>{p.name}</div>
      <div className="mt-3 border-t pt-2" style={{ borderColor: p.palette.border }}>
        {[0, 1, 2].map((i) => <div key={i} className="flex items-center justify-between py-2 border-b" style={{ borderColor: p.palette.border }}><Bar w={i === 1 ? '60%' : '45%'} c={p.palette.text} o={0.8} /><span className="text-[8px] font-bold" style={{ color: p.palette.sub }}>₹{[150, 250, 500][i]}</span></div>)}
      </div>
      <div className="mt-3 flex gap-1.5">{['Chat', 'Call'].map((l) => <div key={l} className="flex-1 py-1.5 text-center text-[8px] font-semibold border" style={{ borderColor: p.palette.border, color: p.palette.text }}>{l}</div>)}</div>
    </div>
  ),
  bold: (p) => (
    <div>
      <div className="px-3 pt-4 pb-3" style={{ background: p.accent }}>
        <div className="text-[7px] font-black uppercase tracking-[0.3em]" style={{ color: p.onAccent, opacity: 0.8 }}>{p.category}</div>
        <div className="mt-1 text-[17px] font-black uppercase tracking-tight leading-[0.95]" style={{ color: p.onAccent }}>{p.name}</div>
        <div className="mt-2 grid grid-cols-3 gap-1">{['Chat', 'Call', 'Map'].map((l) => <div key={l} className="py-1 text-center text-[7px] font-bold" style={{ background: 'rgba(255,255,255,0.2)', color: p.onAccent }}>{l}</div>)}</div>
      </div>
      <div className="px-3 pt-2.5 grid grid-cols-2 gap-1.5">{[0, 1].map((i) => <div key={i} className="rounded-lg border p-2" style={{ background: p.palette.surface, borderColor: p.palette.border }}><Bar w="70%" c={p.palette.text} o={0.85} /><div className="mt-1"><Bar w="40%" c={p.palette.sub} o={0.6} /></div></div>)}</div>
    </div>
  ),
  terminal: (p) => (
    <div className="h-full bg-[#0A0F0A] px-3 pt-3 font-mono">
      <div className="flex gap-1"><span className="w-2 h-2 rounded-full bg-[#FF5F56]" /><span className="w-2 h-2 rounded-full bg-[#FFBD2E]" /><span className="w-2 h-2 rounded-full bg-[#27C93F]" /></div>
      <div className="mt-3 text-[10px] text-[#4CAF50]">$ whoami</div>
      <div className="text-[13px] font-bold text-[#E8F5E9]">{p.name}</div>
      <div className="text-[8px] text-[#81C784]">// {p.category}</div>
      <div className="mt-2.5 grid grid-cols-3 gap-1">{['[ chat ]', '[ call ]', '[ map ]'].map((l) => <div key={l} className="py-1.5 text-center text-[7px] text-[#4CAF50] border border-[#1E3321]">{l}</div>)}</div>
      <div className="mt-3 space-y-1">{[0, 1, 2].map((i) => <div key={i} className="flex justify-between text-[8px] border-b border-[#132013] py-1"><span className="text-[#C8E6C9]">&gt; item_{i + 1}</span><span className="text-[#FFBD2E]">₹{[99, 199, 499][i]}</span></div>)}</div>
    </div>
  ),
  editorial: (p) => (
    <div className="px-3 pt-4" style={{ background: '#F7F2E9', minHeight: '100%' }}>
      <div className="text-center border-b-2 pb-2" style={{ borderColor: '#1A1611' }}>
        <div className="text-[6px] uppercase tracking-[0.3em]" style={{ color: '#8A7B63' }}>Sunday, Edition No. 12</div>
        <div className="text-[15px] font-bold mt-1" style={{ color: '#1A1611', fontFamily: 'Georgia, serif' }}>{p.name}</div>
      </div>
      <div className="mt-2 space-y-0">{[0, 1, 2].map((i) => <div key={i} className="flex items-baseline gap-1.5 py-1.5 border-b" style={{ borderColor: 'rgba(26,22,17,0.15)' }}><span className="text-[8px] font-bold" style={{ color: '#B08D4F' }}>{String(i + 1).padStart(2, '0')}</span><div className="flex-1"><Bar w={`${65 - i * 10}%`} c="#1A1611" o={0.8} h={4} /></div><span className="text-[8px] font-bold" style={{ color: '#1A1611' }}>₹{[150, 250, 500][i]}</span></div>)}</div>
      <div className="mt-2 grid grid-cols-3 gap-1">{['WhatsApp', 'Call', 'Map'].map((l) => <div key={l} className="py-1 text-center text-[6px] uppercase tracking-widest border" style={{ borderColor: 'rgba(26,22,17,0.3)', color: '#1A1611' }}>{l}</div>)}</div>
    </div>
  ),
  storybook: (p) => (
    <div className="px-4 pt-5 text-center" style={{ background: '#FBF6EE', minHeight: '100%' }}>
      <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center text-sm font-bold border-4 border-white shadow" style={{ background: '#E8D9C3', color: '#9C6B2F' }}>{p.name.charAt(0)}</div>
      <div className="mt-2 text-[13px] font-bold" style={{ color: '#3E2F23', fontFamily: 'Georgia, serif' }}>{p.name}</div>
      <div className="text-[8px] uppercase tracking-[0.2em] mt-0.5" style={{ color: '#A98B67' }}>{p.category}</div>
      <div className="mt-2 text-[10px] tracking-[0.6em]" style={{ color: '#D9C6A5' }}>✻ ✻ ✻</div>
      <div className="mt-2 space-y-2">{[0, 1].map((i) => <div key={i} className="rounded-2xl bg-white border p-2.5 shadow-sm text-left" style={{ borderColor: '#F0E4D0' }}><Bar w="60%" c="#3E2F23" o={0.8} h={4} /><div className="mt-1"><Bar w="35%" c="#9C6B2F" o={0.7} h={4} /></div></div>)}</div>
    </div>
  ),
  aurora: (p) => (
    <div className="h-full bg-[#0B0614] relative overflow-hidden px-3 pt-4">
      <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-[#7C3AED]/50 blur-2xl" />
      <div className="absolute top-16 -right-8 w-24 h-24 rounded-full bg-[#DB2777]/40 blur-2xl" />
      <div className="relative">
        <div className="text-[7px] uppercase tracking-[0.3em] text-white/60">{p.category}</div>
        <div className="mt-1 text-[15px] font-black bg-gradient-to-r from-[#C4B5FD] to-[#F9A8D4] bg-clip-text text-transparent">{p.name}</div>
        <div className="mt-2.5 grid grid-cols-3 gap-1">{['Chat', 'Call', 'Map'].map((l) => <div key={l} className="py-1.5 text-center text-[7px] font-semibold text-white rounded-lg bg-white/10 border border-white/15">{l}</div>)}</div>
        <div className="mt-2.5 space-y-1.5">{[0, 1].map((i) => <div key={i} className="rounded-xl bg-white/[0.06] border border-white/10 p-2"><Bar w="60%" c="#fff" o={0.7} h={4} /></div>)}</div>
      </div>
    </div>
  ),
  swiss: (p) => (
    <div className="h-full bg-white">
      <div className="grid grid-cols-3 border-b-2 border-black">
        <div className="col-span-2 p-2.5 border-r-2 border-black"><div className="text-[14px] font-black uppercase tracking-tight leading-[0.95] text-black">{p.name}</div></div>
        <div className="p-2.5"><div className="text-[6px] font-bold uppercase tracking-widest text-black">{p.category}</div></div>
      </div>
      <div className="grid grid-cols-3 border-b border-black">{['WhatsApp', 'Call', 'Map'].map((l) => <div key={l} className="py-2 text-center text-[6px] font-bold uppercase tracking-widest border-r border-black last:border-0 text-black">{l}</div>)}</div>
      <div className="m-2.5 grid grid-cols-2 gap-px bg-black border border-black">{[0, 1, 2, 3].map((i) => <div key={i} className="bg-white p-1.5"><div className="text-[6px] font-bold text-[#E4032E]">{String(i + 1).padStart(2, '0')}</div><Bar w="70%" c="#111" o={0.85} h={4} /></div>)}</div>
    </div>
  ),
  velvet: (p) => (
    <div className="h-full bg-[#0D0B08] px-3 pt-5 text-center">
      <div className="flex items-center justify-center gap-2 text-[6px] uppercase tracking-[0.4em] text-[#C9A96A]"><span className="w-4 h-px bg-[#C9A96A]/60" />{p.category}<span className="w-4 h-px bg-[#C9A96A]/60" /></div>
      <div className="mt-2 text-[14px] text-[#F5EDD8]" style={{ fontFamily: 'Georgia, serif' }}>{p.name}</div>
      <div className="mt-3 grid grid-cols-3 gap-px bg-[#C9A96A]/30 border border-[#C9A96A]/30">{['WhatsApp', 'Call', 'Locate'].map((l) => <div key={l} className="bg-[#0D0B08] py-1.5 text-[6px] uppercase tracking-[0.2em] text-[#E9DFC8]">{l}</div>)}</div>
      <div className="mt-3 space-y-1.5">{[0, 1, 2].map((i) => <div key={i} className="flex items-baseline gap-1"><Bar w="35%" c="#E9DFC8" o={0.7} h={4} /><span className="flex-1 border-b border-dotted border-[#C9A96A]/40" /><span className="text-[7px] text-[#C9A96A]">₹{[499, 999, 1499][i]}</span></div>)}</div>
    </div>
  ),
  bonfire: (p) => (
    <div className="h-full" style={{ background: '#FFF8F0' }}>
      <div className="px-3 pt-4 pb-6 rounded-b-2xl bg-gradient-to-br from-[#7C2D12] to-[#C2410C]">
        <div className="text-[6px] font-bold uppercase tracking-[0.25em] text-white/80">{p.category}</div>
        <div className="mt-1 text-[15px] font-extrabold text-[#FFF8F0]">{p.name}</div>
      </div>
      <div className="px-3 -mt-3">
        <div className="bg-white rounded-2xl shadow-lg border border-[#F5E6D3] p-2 grid grid-cols-3 gap-1">{['Chat', 'Call', 'Map'].map((l) => <div key={l} className="py-1.5 text-center text-[7px] font-bold rounded-full bg-[#C2410C] text-white">{l}</div>)}</div>
        <div className="mt-2 space-y-1.5">{[0, 1].map((i) => <div key={i} className="bg-white border border-[#F5E6D3] rounded-xl p-2 flex items-center gap-1.5"><span className="w-5 h-5 rounded-lg bg-gradient-to-br from-[#FDBA74] to-[#EA580C] shrink-0" /><Bar w="55%" c="#2D1F14" o={0.8} h={4} /></div>)}</div>
      </div>
    </div>
  ),
  darkroom: (p) => (
    <div className="h-full bg-[#0C0C0D] px-3 pt-5">
      <div className="text-[6px] uppercase tracking-[0.35em] text-white/50">{p.category}</div>
      <div className="mt-1.5 text-[16px] font-light text-[#EDEDED]">{p.name}</div>
      <div className="mt-3 space-y-2">{[0, 1].map((i) => <div key={i}><div className="aspect-[16/9] rounded-lg border border-white/10 bg-gradient-to-br from-[#1C1C1E] to-[#232326] flex items-center justify-center"><span className="text-[14px] font-light text-white/15">{String(i + 1).padStart(2, '0')}</span></div><div className="mt-1 flex justify-between"><Bar w="40%" c="#fff" o={0.6} h={4} /><Bar w="15%" c="#fff" o={0.3} h={4} /></div></div>)}</div>
    </div>
  ),
  graphite: (p) => (
    <div className="h-full" style={{ background: '#F4F4F5' }}>
      <div className="bg-[#18181B] px-3 py-2 text-[6px] font-mono uppercase tracking-[0.25em] text-[#D4D4D8]">{p.category} / spec-sheet</div>
      <div className="px-3 pt-3 bg-white pb-2 border-b border-[#E4E4E7]">
        <div className="text-[13px] font-black text-[#18181B]">{p.name}</div>
        <div className="mt-2 grid grid-cols-3 gap-1">{['whatsapp', 'call', 'map'].map((l) => <div key={l} className="py-1 text-center text-[6px] font-mono uppercase border border-[#D4D4D8] text-[#3F3F46]">{l}</div>)}</div>
      </div>
      <div className="m-3 bg-white border border-[#E4E4E7]">
        <div className="flex justify-between px-2 py-1.5 bg-[#FAFAFA] border-b border-[#E4E4E7] text-[6px] font-mono uppercase text-[#71717A]"><span>Item</span><span>Price</span></div>
        {[0, 1, 2].map((i) => <div key={i} className="flex justify-between px-2 py-1.5 border-b border-[#F4F4F5] last:border-0"><Bar w="45%" c="#18181B" o={0.75} h={4} /><span className="text-[7px] font-mono text-[#18181B]">₹{[299, 599, 999][i]}</span></div>)}
      </div>
    </div>
  ),
  bento: (p) => (
    <div className="h-full p-2.5 space-y-2" style={{ background: '#EDEBE6' }}>
      <div className="bg-[#1C1B1A] rounded-2xl p-3">
        <div className="text-[6px] font-bold uppercase tracking-[0.25em] text-[#B8B2A5]">{p.category}</div>
        <div className="mt-1 text-[13px] font-black text-[#F5F4F0]">{p.name}</div>
      </div>
      <div className="grid grid-cols-3 gap-2">{[0, 1, 2].map((i) => <div key={i} className="bg-white rounded-xl p-2 min-h-12"><div className="w-3 h-3 rounded" style={{ background: i === 0 ? '#25D366' : '#1C1B1A', opacity: 0.7 }} /><div className="mt-2"><Bar w="70%" c="#1C1B1A" o={0.7} h={3} /></div></div>)}</div>
      <div className="grid grid-cols-2 gap-2">{[0, 1].map((i) => <div key={i} className="bg-white rounded-2xl p-2.5"><div className="text-[10px] font-black text-[#D6D2C8]">{i + 1}</div><div className="mt-1"><Bar w="75%" c="#1C1B1A" o={0.8} h={4} /></div></div>)}</div>
    </div>
  ),
  blueprint: (p) => (
    <div className="h-full p-3" style={{ background: '#EEF3F8', backgroundImage: 'linear-gradient(#D7E3EF 1px, transparent 1px), linear-gradient(90deg, #D7E3EF 1px, transparent 1px)', backgroundSize: '14px 14px' }}>
      <div className="border-2 border-dashed border-[#3E6B96] bg-white/80 p-3">
        <div className="text-[6px] font-mono uppercase tracking-widest text-[#3E6B96]">FIG. 01 — {p.category}</div>
        <div className="mt-1 text-[13px] font-black uppercase text-[#12314E]">{p.name}</div>
        <div className="mt-2 flex gap-1"><span className="px-2 py-1 bg-[#12314E] text-white text-[6px] font-mono uppercase">WhatsApp</span><span className="px-2 py-1 border border-[#12314E] text-[6px] font-mono uppercase text-[#12314E]">Call</span></div>
      </div>
      <div className="mt-2 space-y-1.5">{[0, 1].map((i) => <div key={i} className="border border-[#3E6B96] bg-white/80 p-2"><div className="flex justify-between"><span className="text-[6px] font-mono text-[#3E6B96]">FIG. {String(i + 1).padStart(2, '0')}</span><span className="text-[7px] font-black text-[#12314E]">₹{[499, 1299][i]}</span></div><div className="mt-1"><Bar w="55%" c="#12314E" o={0.8} h={4} /></div></div>)}</div>
    </div>
  ),
  brutal: (p) => (
    <div className="h-full p-2.5" style={{ background: '#FFFDF5' }}>
      <div className="border-[3px] border-black bg-[#FFD02F] p-3 shadow-[5px_5px_0_#000]">
        <span className="bg-black text-[#FFD02F] px-1.5 py-0.5 text-[6px] font-black uppercase tracking-widest">{p.category}</span>
        <div className="mt-1.5 text-[14px] font-black uppercase leading-[0.95] text-black">{p.name}</div>
      </div>
      <div className="mt-2.5 grid grid-cols-3 gap-1.5">{['Chat', 'Call', 'Map'].map((l) => <div key={l} className="border-[2px] border-black bg-white py-1.5 text-center text-[6px] font-black uppercase shadow-[2px_2px_0_#000] text-black">{l}</div>)}</div>
      <div className="mt-2.5 space-y-2">{[0, 1].map((i) => <div key={i} className="border-[2px] border-black bg-white p-2 shadow-[3px_3px_0_#000] flex justify-between items-center"><Bar w="45%" c="#000" o={0.85} h={4} /><span className="bg-black text-white px-1 text-[7px] font-black">₹{[999, 1999][i]}</span></div>)}</div>
    </div>
  ),
  notebook: (p) => (
    <div className="h-full px-3 pt-4" style={{ background: '#FDFBF4', backgroundImage: 'repeating-linear-gradient(transparent, transparent 15px, #E8E4D8 15px, #E8E4D8 16px)', borderLeft: '2px solid #E5B8B0' }}>
      <div className="text-[6px] uppercase tracking-[0.2em] font-bold text-[#9B4F44]">{p.category}</div>
      <div className="mt-1 text-[14px] font-bold text-[#2B2B33]" style={{ fontFamily: 'Georgia, serif' }}>{p.name}</div>
      <div className="mt-3 space-y-2">{[0, 1, 2].map((i) => <div key={i} className="flex items-baseline gap-1.5"><span className="text-[8px] font-bold text-[#9B4F44]">{i + 1}.</span><Bar w={`${55 - i * 8}%`} c="#2B2B33" o={0.75} h={4} /><span className="ml-auto text-[7px] font-bold text-[#2B2B33]/70">₹{[199, 349, 599][i]}</span></div>)}</div>
      <div className="mt-3 flex gap-1.5"><span className="px-2 py-1 bg-[#2B2B33] text-white rounded text-[6px] font-bold -rotate-1">WhatsApp</span><span className="px-2 py-1 bg-[#9B4F44] text-white rounded text-[6px] font-bold rotate-1">Call</span></div>
    </div>
  ),
  sticker: (p) => (
    <div className="h-full p-3" style={{ background: '#FFF4D8' }}>
      <div className="relative bg-white border-4 border-[#1F2937] rounded-2xl p-3 text-center shadow-[4px_4px_0_#1F2937]">
        <div className="w-8 h-8 mx-auto rounded-full bg-[#F97316] border-[3px] border-[#1F2937] flex items-center justify-center text-[11px] font-black text-white">{p.name.charAt(0)}</div>
        <div className="mt-1 text-[11px] font-black uppercase text-[#1F2937]">{p.name}</div>
      </div>
      <div className="mt-2.5 grid grid-cols-3 gap-1.5">{[['Chat', '#22C55E'], ['Call', '#3B82F6'], ['Map', '#FACC15']].map(([l, c]) => <div key={l} className="border-[3px] border-[#1F2937] rounded-xl py-1.5 text-center text-[6px] font-black uppercase shadow-[2px_2px_0_#1F2937]" style={{ background: c, color: l === 'Map' ? '#1F2937' : '#fff' }}>{l}</div>)}</div>
      <div className="mt-2.5 space-y-2">{[0, 1].map((i) => <div key={i} className={`bg-white border-[3px] border-[#1F2937] rounded-2xl p-2 shadow-[3px_3px_0_#1F2937] ${i ? 'rotate-[0.5deg]' : '-rotate-[0.5deg]'}`}><div className="flex justify-between items-center"><Bar w="45%" c="#1F2937" o={0.85} h={4} /><span className="bg-[#F97316] text-white border-2 border-[#1F2937] rounded-full px-1.5 text-[7px] font-black">₹{[99, 149][i]}</span></div></div>)}</div>
    </div>
  ),
  linen: (p) => (
    <div className="h-full px-4 pt-6 text-center" style={{ background: '#F5F1EA' }}>
      <div className="text-[6px] uppercase tracking-[0.5em] text-[#A89C8A]">{p.category}</div>
      <div className="mt-2 text-[15px] font-light text-[#4A4238]" style={{ fontFamily: 'Georgia, serif' }}>{p.name}</div>
      <div className="mt-2 mx-auto w-8 h-px bg-[#C9BBA4]" />
      <div className="mt-4 space-y-4">{[0, 1, 2].map((i) => <div key={i}><Bar w="45%" c="#4A4238" o={0.7} h={4} /><div className="mt-1 text-[6px] uppercase tracking-[0.25em] text-[#A89C8A]">₹{[899, 1499, 2499][i]}</div></div>)}</div>
      <div className="mt-4 grid grid-cols-3 gap-1 text-[5px] uppercase tracking-[0.2em]"><span className="py-1.5 bg-[#4A4238] text-[#F5F1EA]">WhatsApp</span><span className="py-1.5 border border-[#C9BBA4] text-[#4A4238]">Call</span><span className="py-1.5 border border-[#C9BBA4] text-[#4A4238]">Visit</span></div>
    </div>
  ),
  candy: (p) => (
    <div className="h-full px-3 pt-5 text-center" style={{ background: '#FDF2F6' }}>
      <div className="w-10 h-10 mx-auto rounded-2xl rotate-6 bg-gradient-to-br from-[#F9A8D4] to-[#C4B5FD] border-4 border-white shadow flex items-center justify-center text-[12px] font-black text-white">{p.name.charAt(0)}</div>
      <div className="mt-2 text-[13px] font-black text-[#3D2C35]">{p.name}</div>
      <div className="text-[7px] font-bold uppercase tracking-widest text-[#C084A5]">{p.category}</div>
      <div className="mt-2.5 grid grid-cols-3 gap-1.5">{[['Chat', '#F472B6', '#BE185D'], ['Call', '#A78BFA', '#6D28D9'], ['Map', '#6EE7B7', '#059669']].map(([l, c, s]) => <div key={l} className="rounded-full py-1.5 text-[6px] font-black text-white" style={{ background: c, boxShadow: `0 2px 0 ${s}` }}>{l}</div>)}</div>
      <div className="mt-2.5 space-y-1.5">{[0, 1].map((i) => <div key={i} className="bg-white rounded-2xl border-2 border-[#F9A8D4]/40 p-2 flex justify-between items-center"><Bar w="45%" c="#3D2C35" o={0.8} h={4} /><span className="rounded-full bg-[#FDF2F6] border border-[#F9A8D4] px-1.5 text-[7px] font-black text-[#BE185D]">₹{[249, 399][i]}</span></div>)}</div>
    </div>
  ),
  mono: (p) => (
    <div className="h-full bg-white px-3 pt-6">
      <div className="flex items-baseline justify-between"><div className="text-[18px] font-black tracking-[-0.04em] text-black leading-none">{p.name}</div><span className="text-[10px] text-black">↗</span></div>
      <div className="mt-1 text-[7px] text-black/50">{p.category}</div>
      <div className="mt-4 space-y-0">{[0, 1, 2].map((i) => <div key={i} className="py-2.5 border-t border-black/10 flex justify-between items-baseline"><span className="text-[10px] font-black text-black">{['Item One', 'Item Two', 'Item Three'][i]}</span><span className="text-[8px] font-bold text-black">₹{[1200, 2400, 4800][i]}</span></div>)}</div>
      <div className="mt-3 flex gap-3 text-[7px] font-bold text-black"><span className="underline underline-offset-4 decoration-2">WhatsApp</span><span className="underline underline-offset-4 decoration-2">Call</span></div>
    </div>
  ),
  dusk: (p) => (
    <div className="h-full px-3 pt-5" style={{ background: '#171334' }}>
      <div className="text-[6px] uppercase tracking-[0.35em] text-[#9D93D0]">{p.category}</div>
      <div className="mt-1.5 text-[15px] font-bold text-[#EDEAF7]">{p.name}</div>
      <div className="mt-3 grid grid-cols-3 gap-1">{['WhatsApp', 'Call', 'Map'].map((l, i) => <div key={l} className="rounded-lg py-1.5 text-center text-[6px] font-bold" style={i === 0 ? { background: '#F2A65A', color: '#171334' } : { background: 'rgba(255,255,255,0.1)', color: '#EDEAF7', border: '1px solid rgba(255,255,255,0.15)' }}>{l}</div>)}</div>
      <div className="mt-3 space-y-1.5">{[0, 1].map((i) => <div key={i} className="rounded-xl bg-[#221C4A] border border-[#372E6E] p-2 flex justify-between items-center"><Bar w="45%" c="#EDEAF7" o={0.7} h={4} /><span className="text-[7px] font-black text-[#F2A65A]">₹{[599, 1199][i]}</span></div>)}</div>
    </div>
  ),
  forest: (p) => (
    <div className="h-full px-3 pt-5" style={{ background: '#122B1D' }}>
      <div className="text-[6px] uppercase tracking-[0.3em] text-[#8FB996]">{p.category}</div>
      <div className="mt-2 flex items-center gap-2"><span className="w-7 h-7 rounded-xl bg-[#1E4029] border border-[#2E5A3C] flex items-center justify-center text-[10px] font-bold text-[#A7C4A0]">{p.name.charAt(0)}</span><span className="text-[13px] font-bold text-[#EDE8DC]">{p.name}</span></div>
      <div className="mt-3 grid grid-cols-3 gap-1">{['WhatsApp', 'Call', 'Visit'].map((l, i) => <div key={l} className="rounded-full py-1.5 text-center text-[6px] font-black" style={i === 0 ? { background: '#A7C4A0', color: '#122B1D' } : { border: '1px solid #2E5A3C', color: '#EDE8DC' }}>{l}</div>)}</div>
      <div className="mt-3 space-y-1.5">{[0, 1].map((i) => <div key={i} className="rounded-2xl bg-[#1E4029]/60 border border-[#2E5A3C] p-2 flex justify-between items-center"><Bar w="45%" c="#DCE8D5" o={0.7} h={4} /><span className="text-[7px] font-black text-[#A7C4A0]">₹{[349, 699][i]}</span></div>)}</div>
    </div>
  ),
  market: (p) => (
    <div className="h-full" style={{ background: '#FBEF3F' }}>
      <div className="px-3 pt-3 pb-5 bg-[#D7263D]">
        <span className="bg-[#FBEF3F] text-[#1A1A1A] px-1.5 py-0.5 text-[6px] font-black uppercase tracking-widest -rotate-2 inline-block">{p.category}</span>
        <div className="mt-1 text-[15px] font-black uppercase text-white" style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.35)' }}>{p.name}</div>
      </div>
      <div className="px-3 -mt-2.5">
        <div className="bg-white border-[3px] border-[#1A1A1A] rounded-xl p-2 grid grid-cols-3 gap-1 shadow-[3px_3px_0_#1A1A1A]">{['Chat', 'Call', 'Map'].map((l) => <div key={l} className="py-1 text-center text-[6px] font-black uppercase bg-[#1A1A1A] text-white">{l}</div>)}</div>
        <div className="mt-2 grid grid-cols-2 gap-1.5">{[0, 1].map((i) => <div key={i} className="bg-white border-[3px] border-[#1A1A1A] rounded-lg p-1.5 shadow-[2px_2px_0_#1A1A1A]"><span className="inline-block bg-[#2E933C] text-white text-[5px] font-black uppercase px-1 rounded-sm">Fresh</span><div className="mt-1"><Bar w="70%" c="#1A1A1A" o={0.85} h={4} /></div><div className="mt-1 text-[9px] font-black text-[#D7263D]">₹{[89, 149][i]}</div></div>)}</div>
      </div>
    </div>
  ),
};

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  businessName,
  category,
  className,
}) => {
  const palette = THEME_PALETTES[template.theme] ?? THEME_PALETTES.neutral;
  const accent = template.accent_color;
  const onAccent = getContrastText(accent);
  const radius = getButtonRadius(template.button_style);
  const font = FONT_STACKS[template.font_family] ?? FONT_STACKS.inter;

  const Mini = MINIS[template.layout] ?? MINIS.classic;

  return (
    <div
      className={`relative w-full aspect-[9/15] overflow-hidden ${className ?? ''}`}
      style={{ background: palette.bg, fontFamily: font }}
      aria-hidden="true"
    >
      <Mini
        accent={accent}
        onAccent={onAccent}
        radius={radius}
        palette={palette}
        name={businessName}
        category={category}
      />
    </div>
  );
};
