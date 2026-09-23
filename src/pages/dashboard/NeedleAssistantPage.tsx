import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Link2,
  Loader2,
  PackagePlus,
  Palette,
  Send,
  Sparkles,
  WandSparkles,
} from 'lucide-react';
import { runNeedle, runNeedleWithImage, NeedleRunResult } from '../../lib/needleApi';

const QUICK_ACTIONS = [
  { label: 'Change my template', prompt: 'Show me the best available cafe template and apply it to my page.', icon: Palette },
  { label: 'Set my profile image', prompt: 'Set my avatar image.', icon: ImageIcon },
  { label: 'Add a product', prompt: 'Add a product called Masala Tea for 80 rupees.', icon: PackagePlus },
  { label: 'Add a link', prompt: 'Add a link titled Instagram with URL https://instagram.com/mybusiness.', icon: Link2 },
];

function prettyToolName(name: string) {
  return name.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export const NeedleAssistantPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [response, setResponse] = useState<NeedleRunResult | null>(null);

  const calls = useMemo(() => response?.result?.function_calls || [], [response]);
  const results = useMemo(() => response?.result?.results || [], [response]);

  const safeImageUrl = (value: unknown) => {
    if (typeof value !== 'string') return '';
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? value : '';
    } catch {
      return '';
    }
  };

  const imageUrlFromPrompt = (value: string) => {
    const match = value.match(/https?:\/\/[^\s"']+/i);
    return safeImageUrl(match?.[0] || '');
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be 5MB or smaller.');
      return;
    }
    setError('');
    setSelectedImage(file);
    setSelectedImagePreview(URL.createObjectURL(file));
  };

  const submit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt || loading) return;
    const requestedImageUrl = imageUrlFromPrompt(cleanPrompt);
    if (requestedImageUrl) setPreviewUrl(requestedImageUrl);
    setLoading(true);
    setError('');
    setResponse(null);
    try {
      const result = selectedImage
        ? await runNeedleWithImage(cleanPrompt, selectedImage)
        : await runNeedle(cleanPrompt);
      const imageCall = result.result.function_calls?.find((call) => call.name === 'set_profile_image');
      const completedImageUrl = safeImageUrl(imageCall?.arguments?.image_url);
      if (completedImageUrl) setPreviewUrl(completedImageUrl);
      if (result.uploaded_image?.url) setPreviewUrl(result.uploaded_image.url);
      setResponse(result);
      setPrompt('');
      setSelectedImage(null);
      setSelectedImagePreview('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Needle could not complete that request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full max-w-5xl mx-auto space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-600/25 via-[#101d37] to-[#0b1424] p-6 sm:p-8 shadow-2xl shadow-blue-950/20">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/25 bg-blue-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-200">
            <Sparkles className="h-3.5 w-3.5" /> Needle mode
          </div>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-4xl">Tell LinkOS what to do</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Change your template, update profile details, attach an image, add products or manage links with one simple request. Needle only changes your own LinkOS page.
          </p>
          <form onSubmit={submit} className="mt-7 flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Attach a photo and say: set avatar"
                className="min-h-12 flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
                maxLength={4000}
                disabled={loading}
              />
              <label className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.06] px-4 text-sm font-bold text-slate-200 transition hover:border-blue-300/50 hover:bg-blue-500/10">
                <ImageIcon className="h-4 w-4 text-blue-300" />
                {selectedImage ? 'Change image' : 'Attach image'}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/bmp" onChange={handleImageSelect} className="sr-only" disabled={loading} />
              </label>
              <button
                type="submit"
                disabled={!prompt.trim() || loading}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-blue-500 px-5 text-sm font-bold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {loading ? 'Working…' : 'Run task'}
              </button>
            </div>
            {selectedImagePreview?.trim() ? (
              <div className="flex items-center gap-3 rounded-2xl border border-blue-300/20 bg-blue-500/[0.08] p-3">
                <img src={selectedImagePreview.trim()} alt="Selected upload preview" className="h-16 w-16 rounded-xl object-cover" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-blue-100">Ready to upload as WebP</div>
                  <div className="truncate text-[11px] text-slate-400">{selectedImage?.name}</div>
                  <div className="text-[11px] text-slate-500">Say “set avatar” or “set logo” in the request.</div>
                </div>
              </div>
            ) : null}
          </form>
          {previewUrl?.trim() ? (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
              <img src={previewUrl.trim()} alt="Profile image preview" className="h-14 w-14 rounded-xl border border-white/10 object-cover" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
              <div className="min-w-0">
                <div className="text-xs font-bold text-blue-100">Profile image preview · WebP uploaded</div>
                <div className="truncate text-[11px] text-slate-400">{previewUrl}</div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white"><WandSparkles className="h-4 w-4 text-blue-400" /> Quick actions</div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map(({ label, prompt: actionPrompt, icon: Icon }) => (
            <button type="button" key={label} onClick={() => setPrompt(actionPrompt)} className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-400/40 hover:bg-blue-500/10">
              <Icon className="h-5 w-5 text-blue-300 transition group-hover:scale-110" />
              <div className="mt-3 text-xs font-bold text-slate-200">{label}</div>
              <div className="mt-1 text-[11px] leading-4 text-slate-500">Click to prepare a request</div>
            </button>
          ))}
        </div>
      </section>

      {error && <div className="flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div>}

      {response && (
        <section className="rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.07] p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-200"><CheckCircle2 className="h-4 w-4" /> Task completed{typeof response.result.confidence === 'number' && <span className="ml-auto text-xs font-medium text-emerald-300/70">Confidence {Math.round(response.result.confidence * 100)}%</span>}</div>
          {calls.length > 0 || results.length > 0 ? (
            <div className="mt-4 space-y-2">
              {calls.map((call, index) => <div key={`${call.name}-${index}`} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5"><div className="text-xs font-bold text-white">{prettyToolName(call.name)}</div><pre className="mt-1 overflow-x-auto whitespace-pre-wrap text-[11px] leading-5 text-slate-400">{JSON.stringify(call.arguments, null, 2)}</pre></div>)}
              {results.map((result, index) => <div key={`result-${index}`} className="rounded-xl border border-emerald-300/10 bg-black/20 px-3 py-2.5"><div className="text-xs font-bold text-emerald-100">Result {index + 1}</div><pre className="mt-1 overflow-x-auto whitespace-pre-wrap text-[11px] leading-5 text-slate-400">{JSON.stringify(result, null, 2)}</pre></div>)}
            </div>
          ) : <p className="mt-3 text-sm text-slate-300">Needle could not find a matching page action. Try one of the quick actions above.</p>}
          {response.result.reasoning && <p className="mt-4 text-xs leading-5 text-slate-400">{response.result.reasoning}</p>}
        </section>
      )}

      <p className="text-center text-[11px] leading-5 text-slate-500">Needle can only modify data belonging to your signed-in LinkOS account. Attached images are converted to WebP and saved to your profile storage.</p>
    </main>
  );
};
