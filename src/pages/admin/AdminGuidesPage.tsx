import React, { useRef, useState } from 'react';
import useSWR from 'swr';
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  Link2,
  X,
  ArrowUp,
  ArrowDown,
  Save,
  ImagePlus,
  PlayCircle,
} from 'lucide-react';
import {
  loadAllGuides,
  saveGuide,
  deleteGuide,
  slugifyGuide,
  GUIDE_TAG_OPTIONS,
  type Guide,
  type GuideStep,
} from '../../lib/guides';
import { StorageService } from '../../lib/storage';
import { useUploadProgress, UploadProgressBar } from '../../components/UploadProgressBar';
import { PageHeader, Badge, EmptyState, LoadingRows, ErrorState, PANEL, TH, TD } from './AdminShared';

async function fetchGuides(): Promise<Guide[]> {
  return loadAllGuides();
}

const emptyGuide = (): Guide => ({
  slug: '',
  title: '',
  intro: '',
  tag: 'Guide',
  read_time: '',
  hero_url: '',
  hero_alt: '',
  learn: [],
  video: '',
  video_url: '',
  tags: [],
  steps: [],
  show_step_numbers: true,
  is_published: true,
});

/* One editable step row: title, body, image (upload → WebP) or URL */
const StepEditor: React.FC<{
  step: GuideStep;
  index: number;
  total: number;
  showNumbers: boolean;
  onChange: (next: GuideStep) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}> = ({ step, index, total, showNumbers, onChange, onRemove, onMove }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const up = useUploadProgress();
  const [uploadError, setUploadError] = useState('');

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploadError('');
    try {
      // Uploads are converted to WebP inside StorageService.uploadImage.
      const url = await up.run('Processing image…', (report) => StorageService.uploadImage(file, 'products', report));
      onChange({ ...step, image_url: url });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const inputCls =
    'w-full h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[13px] text-slate-200 placeholder:text-slate-500 outline-none focus:border-blue-500/50 transition-all';

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
          {showNumbers ? `Step ${index + 1}` : 'Step'}
        </span>
        <span className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            aria-label={`Move step ${index + 1} up`}
            className="p-1.5 rounded-md hover:bg-white/[0.06] text-slate-400 disabled:opacity-30"
          >
            <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            aria-label={`Move step ${index + 1} down`}
            className="p-1.5 rounded-md hover:bg-white/[0.06] text-slate-400 disabled:opacity-30"
          >
            <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove step ${index + 1}`}
            className="p-1.5 rounded-md hover:bg-red-500/10 text-red-400"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </span>
      </div>

      <input
        value={step.title}
        onChange={(e) => onChange({ ...step, title: e.target.value })}
        placeholder="Step title (e.g. Step 1: Create an Account)"
        aria-label={`Step ${index + 1} title`}
        className={inputCls}
      />
      <textarea
        value={step.body}
        onChange={(e) => onChange({ ...step, body: e.target.value })}
        placeholder="What should the reader do in this step?"
        aria-label={`Step ${index + 1} body`}
        rows={3}
        className={`${inputCls} h-auto py-2.5 leading-relaxed`}
      />

      {/* Step image: upload (auto WebP) or paste a URL */}
      <div className="flex items-start gap-2.5">
        {step.image_url ? (
          <img src={step.image_url} alt="" aria-hidden="true" className="w-16 h-16 rounded-lg object-cover border border-white/10 shrink-0" />
        ) : (
          <span className="w-16 h-16 rounded-lg bg-white/[0.04] border border-dashed border-white/15 flex items-center justify-center shrink-0">
            <ImagePlus className="w-5 h-5 text-slate-500" aria-hidden="true" />
          </span>
        )}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={up.active}
              className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 text-[12px] font-semibold text-blue-300 hover:bg-blue-600/30 disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" aria-hidden="true" />
              {up.active ? 'Processing…' : 'Upload image'}
            </button>
            <UploadProgressBar {...up} />
            {step.image_url && (
              <button
                type="button"
                onClick={() => onChange({ ...step, image_url: '', image_alt: '' })}
                className="text-[11px] text-red-400 hover:text-red-300 font-semibold"
              >
                Remove
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            onChange={(e) => handleFile(e.target.files?.[0])}
            className="sr-only"
            aria-label={`Upload image for step ${index + 1}`}
          />
          <input
            value={step.image_url}
            onChange={(e) => onChange({ ...step, image_url: e.target.value })}
            placeholder="…or paste an image URL"
            aria-label={`Image URL for step ${index + 1}`}
            className={`${inputCls} h-8 text-[12px]`}
          />
          <input
            value={step.image_alt || ''}
            onChange={(e) => onChange({ ...step, image_alt: e.target.value })}
            placeholder="Image description (alt text)"
            aria-label={`Image description for step ${index + 1}`}
            className={`${inputCls} h-8 text-[12px]`}
          />
          {uploadError && <p className="text-[11px] text-red-400">{uploadError}</p>}
        </div>
      </div>
    </div>
  );
};

export const AdminGuidesPage: React.FC = () => {
  const { data: guides, error, mutate } = useSWR('admin-guides', fetchGuides);
  const [editing, setEditing] = useState<Guide | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [formError, setFormError] = useState('');
  const [tagsText, setTagsText] = useState('');
  const heroFileRef = useRef<HTMLInputElement>(null);
  const heroUp = useUploadProgress();
  const videoFileRef = useRef<HTMLInputElement>(null);
  const videoUp = useUploadProgress();

  const openEditor = (guide: Guide) => {
    setEditing(structuredClone(guide));
    setTagsText(guide.tags.join(', '));
    setFormError('');
    setNotice('');
  };

  const patch = (updates: Partial<Guide>) => {
    if (!editing) return;
    const next = { ...editing, ...updates };
    // Keep the slug in sync with the title unless it was customised.
    if (updates.title !== undefined && !editing.id) next.slug = slugifyGuide(updates.title);
    setEditing(next);
  };

  const handleHeroFile = async (file: File | undefined) => {
    if (!file || !editing) return;
    setFormError('');
    try {
      const url = await heroUp.run('Processing image…', (report) => StorageService.uploadImage(file, 'products', report));
      patch({ hero_url: url });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      if (heroFileRef.current) heroFileRef.current.value = '';
    }
  };

  const handleVideoFile = async (file: File | undefined) => {
    if (!file || !editing) return;
    setFormError('');
    try {
      // Uploads are converted to WebM inside StorageService.uploadVideo.
      const url = await videoUp.run('Processing video…', (report) => StorageService.uploadVideo(file, 'products', report));
      patch({ video_url: url });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Video upload failed.');
    } finally {
      if (videoFileRef.current) videoFileRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.title.trim()) {
      setFormError('Title is required.');
      return;
    }
    setSaving(true);
    setFormError('');
    const toSave: Guide = {
      ...editing,
      slug: editing.slug || slugifyGuide(editing.title),
      tags: tagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      learn: editing.learn.filter((l) => l.trim()),
      steps: editing.steps.filter((s) => s.title.trim() || s.body.trim()),
    };
    const res = await saveGuide(toSave);
    setSaving(false);
    if (!res.ok) {
      setFormError(res.error || 'Could not save the guide.');
      return;
    }
    setNotice(`Guide "${toSave.title}" saved successfully.`);
    setEditing(null);
    mutate();
  };

  const handleDelete = async (guide: Guide) => {
    if (!window.confirm(`Delete guide "${guide.title}"? This cannot be undone.`)) return;
    await deleteGuide(guide.id!);
    setNotice(`Guide "${guide.title}" deleted.`);
    mutate();
  };

  const togglePublish = async (guide: Guide) => {
    await saveGuide({ ...guide, is_published: !guide.is_published });
    mutate();
  };

  const inputCls =
    'w-full h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[13px] text-slate-200 placeholder:text-slate-500 outline-none focus:border-blue-500/50 transition-all';

  /* ---------- Editor view ---------- */
  if (editing) {
    return (
      <div>
        <PageHeader
          title={editing.id ? 'Edit Guide' : 'New Guide'}
          subtitle="Steps render in order. Images become WebP, videos become WebM — automatically."
          actions={
            <span>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="h-10 px-4 rounded-xl border border-white/[0.08] text-[13px] font-semibold text-slate-300 hover:bg-white/[0.04]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="ml-2 inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-blue-600 text-[13px] font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
              >
                <Save className="w-4 h-4" aria-hidden="true" />
                {saving ? 'Saving…' : 'Save Guide'}
              </button>
            </span>
          }
        />

        {formError && (
          <p role="alert" className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[13px] text-red-300">
            {formError}
          </p>
        )}

        <div className="space-y-5">
          {/* Basics */}
          <div className={`${PANEL} p-4 space-y-3`}>
            <h2 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">Basics</h2>
            <input value={editing.title} onChange={(e) => patch({ title: e.target.value })} placeholder="Guide title" aria-label="Guide title" className={`${inputCls} h-11 font-semibold`} />
            <div className="grid sm:grid-cols-2 gap-3">
              <input value={editing.slug} onChange={(e) => patch({ slug: slugifyGuide(e.target.value) })} placeholder="url-slug" aria-label="URL slug" className={inputCls} />
              <select value={editing.tag} onChange={(e) => patch({ tag: e.target.value })} aria-label="Article tag" className={inputCls}>
                {GUIDE_TAG_OPTIONS.map((t) => (
                  <option key={t} value={t} className="bg-slate-900">{t}</option>
                ))}
              </select>
            </div>
            <textarea value={editing.intro} onChange={(e) => patch({ intro: e.target.value })} placeholder="Short intro shown under the title" aria-label="Guide intro" rows={2} className={`${inputCls} h-auto py-2.5 leading-relaxed`} />
            <div className="grid sm:grid-cols-2 gap-3">
              <input value={editing.read_time} onChange={(e) => patch({ read_time: e.target.value })} placeholder="Read time (e.g. 5 min read)" aria-label="Read time" className={inputCls} />
              <input value={editing.video} onChange={(e) => patch({ video: e.target.value })} placeholder="Video button label (optional)" aria-label="Video button label" className={inputCls} />
            </div>
            <input
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="Topic tags, comma separated (e.g. Getting Started, Templates)"
              aria-label="Topic tags"
              className={inputCls}
            />
            <label className="flex items-center gap-2.5 cursor-pointer select-none w-fit">
              <input type="checkbox" checked={editing.is_published} onChange={(e) => patch({ is_published: e.target.checked })} className="w-4 h-4 accent-blue-500" />
              <span className="text-[13px] text-slate-300 font-medium">Published (visible to everyone)</span>
            </label>
          </div>

          {/* Hero image */}
          <div className={`${PANEL} p-4 space-y-3`}>
            <h2 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">Hero image</h2>
            <div className="flex items-start gap-3">
              {editing.hero_url ? (
                <img src={editing.hero_url} alt="" aria-hidden="true" className="w-28 h-20 rounded-lg object-cover border border-white/10 shrink-0" />
              ) : (
                <span className="w-28 h-20 rounded-lg bg-white/[0.04] border border-dashed border-white/15 flex items-center justify-center shrink-0">
                  <ImagePlus className="w-6 h-6 text-slate-500" aria-hidden="true" />
                </span>
              )}
              <div className="flex-1 min-w-0 space-y-2">
                <button
                  type="button"
                  onClick={() => heroFileRef.current?.click()}
                  disabled={heroUp.active}
                  className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 text-[12px] font-semibold text-blue-300 hover:bg-blue-600/30 disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                  {heroUp.active ? 'Processing…' : 'Upload image'}
                </button>
                <UploadProgressBar {...heroUp} />
                <input ref={heroFileRef} type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" onChange={(e) => handleHeroFile(e.target.files?.[0])} className="sr-only" aria-label="Upload hero image" />
                <input value={editing.hero_url} onChange={(e) => patch({ hero_url: e.target.value })} placeholder="…or paste an image URL" aria-label="Hero image URL" className={`${inputCls} h-9 text-[12px]`} />
                <input value={editing.hero_alt} onChange={(e) => patch({ hero_alt: e.target.value })} placeholder="Hero image description (alt text)" aria-label="Hero image description" className={`${inputCls} h-9 text-[12px]`} />
              </div>
            </div>
          </div>

          {/* Video: upload (auto WebM) or paste a URL */}
          <div className={`${PANEL} p-4 space-y-3`}>
            <h2 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">Video tutorial</h2>
            <div className="space-y-2">
              {editing.video_url ? (
                <video
                  controls
                  playsInline
                  preload="metadata"
                  src={editing.video_url}
                  className="w-full max-w-sm aspect-video rounded-xl border border-white/10 bg-black"
                />
              ) : (
                <span className="flex w-full max-w-sm aspect-video rounded-xl bg-white/[0.04] border border-dashed border-white/15 items-center justify-center">
                  <PlayCircle className="w-8 h-8 text-slate-500" aria-hidden="true" />
                </span>
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => videoFileRef.current?.click()}
                  disabled={videoUp.active}
                  className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 text-[12px] font-semibold text-blue-300 hover:bg-blue-600/30 disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                  {videoUp.active ? 'Processing…' : 'Upload video'}
                </button>
                <UploadProgressBar {...videoUp} />
                {editing.video_url && (
                  <button
                    type="button"
                    onClick={() => patch({ video_url: '' })}
                    className="text-[11px] text-red-400 hover:text-red-300 font-semibold"
                  >
                    Remove
                  </button>
                )}
              </div>
              <input
                ref={videoFileRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/ogg"
                onChange={(e) => handleVideoFile(e.target.files?.[0])}
                className="sr-only"
                aria-label="Upload video tutorial"
              />
              <input
                value={editing.video_url}
                onChange={(e) => patch({ video_url: e.target.value })}
                placeholder="…or paste a video URL"
                aria-label="Video URL"
                className={`${inputCls} h-9 text-[12px]`}
              />
              <p className="text-[11px] text-slate-500">
                Uploaded videos are converted to WebM and stored on Supabase. The label below becomes the player heading.
              </p>
            </div>
          </div>

          {/* What you'll learn */}
          <div className={`${PANEL} p-4 space-y-3`}>
            <h2 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">What you&apos;ll learn</h2>
            {editing.learn.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={item}
                  onChange={(e) => {
                    const learn = [...editing.learn];
                    learn[i] = e.target.value;
                    patch({ learn });
                  }}
                  placeholder={`Point ${i + 1}`}
                  aria-label={`Learning point ${i + 1}`}
                  className={inputCls}
                />
                <button type="button" onClick={() => patch({ learn: editing.learn.filter((_, j) => j !== i) })} aria-label={`Remove learning point ${i + 1}`} className="p-2 rounded-md hover:bg-red-500/10 text-red-400 shrink-0">
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => patch({ learn: [...editing.learn, ''] })} className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-blue-400 hover:text-blue-300">
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              Add point
            </button>
          </div>

          {/* Steps */}
          <div className={`${PANEL} p-4 space-y-3`}>
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">Steps ({editing.steps.length})</h2>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editing.show_step_numbers}
                    onChange={(e) => patch({ show_step_numbers: e.target.checked })}
                    className="w-3.5 h-3.5 accent-blue-500"
                  />
                  Step numbers
                </label>
                <button
                  type="button"
                  onClick={() => patch({ steps: [...editing.steps, { title: '', body: '' }] })}
                  className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg bg-blue-600 text-[12px] font-semibold text-white hover:bg-blue-500"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  Add step
                </button>
              </div>
            </div>
            {editing.steps.length === 0 && (
              <p className="text-[12px] text-slate-500 py-2">No steps yet — add the first one.</p>
            )}
            <div className="space-y-3">
              {editing.steps.map((step, i) => (
                <StepEditor
                  key={i}
                  step={step}
                  index={i}
                  total={editing.steps.length}
                  showNumbers={editing.show_step_numbers}
                  onChange={(next) => {
                    const steps = [...editing.steps];
                    steps[i] = next;
                    patch({ steps });
                  }}
                  onRemove={() => patch({ steps: editing.steps.filter((_, j) => j !== i) })}
                  onMove={(dir) => {
                    const steps = [...editing.steps];
                    const j = i + dir;
                    [steps[i], steps[j]] = [steps[j], steps[i]];
                    patch({ steps });
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- List view ---------- */
  return (
    <div>
      <PageHeader
        title="Guides & Tutorials"
        subtitle="Articles shown on the Resources page. Uploaded images are converted to WebP."
        actions={
          <button
            type="button"
            onClick={() => openEditor(emptyGuide())}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-blue-600 text-[13px] font-semibold text-white hover:bg-blue-500"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            New Guide
          </button>
        }
      />

      {notice && (
        <p className="mb-4 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[13px] text-emerald-300">
          {notice}
        </p>
      )}

      <div className={`${PANEL} overflow-hidden`}>
        {error ? (
          <ErrorState />
        ) : !guides ? (
          <LoadingRows rows={5} />
        ) : guides.length === 0 ? (
          <EmptyState title="No guides yet" sub="Create the first guide — it will appear on the Resources page instantly." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-white/[0.03] border-b border-white/[0.06]">
                <tr>
                  <th className={TH}>Guide</th>
                  <th className={TH}>Tag</th>
                  <th className={TH}>Topics</th>
                  <th className={TH}>Steps</th>
                  <th className={TH}>Status</th>
                  <th className={TH}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {guides.map((g) => (
                  <tr key={g.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className={TD}>
                      <div className="flex items-center gap-3">
                        {g.hero_url ? (
                          <img src={g.hero_url} alt="" aria-hidden="true" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        ) : (
                          <span className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0">
                            <BookOpen className="w-4.5 h-4.5 text-blue-400" aria-hidden="true" />
                          </span>
                        )}
                        <span className="min-w-0">
                          <span className="block font-medium text-white truncate max-w-[260px]">{g.title}</span>
                          <span className="block text-[11px] text-slate-500">/resources/guides/{g.slug}</span>
                        </span>
                      </div>
                    </td>
                    <td className={TD}><Badge tone="blue">{g.tag}</Badge></td>
                    <td className={TD}>
                      <span className="flex flex-wrap gap-1 max-w-[200px]">
                        {g.tags.length === 0 ? <span className="text-slate-500">—</span> : g.tags.map((t) => (
                          <span key={t} className="px-2 py-0.5 rounded-full bg-white/[0.06] text-[10px] font-semibold text-slate-300">#{t}</span>
                        ))}
                      </span>
                    </td>
                    <td className={TD}>{g.steps.length}</td>
                    <td className={TD}>
                      <Badge tone={g.is_published ? 'green' : 'slate'}>{g.is_published ? 'Published' : 'Draft'}</Badge>
                    </td>
                    <td className={TD}>
                      <span className="flex items-center gap-1">
                        <a
                          href={`/resources/guides/${g.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Preview ${g.title}`}
                          className="p-2 rounded-md hover:bg-white/[0.06] text-slate-400"
                        >
                          <Eye className="w-4 h-4" aria-hidden="true" />
                        </a>
                        <button type="button" onClick={() => togglePublish(g)} aria-label={g.is_published ? `Unpublish ${g.title}` : `Publish ${g.title}`} className="p-2 rounded-md hover:bg-white/[0.06] text-slate-400">
                          {g.is_published ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                        </button>
                        <button type="button" onClick={() => openEditor(g)} aria-label={`Edit ${g.title}`} className="p-2 rounded-md hover:bg-white/[0.06] text-slate-400">
                          <Pencil className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button type="button" onClick={() => handleDelete(g)} aria-label={`Delete ${g.title}`} className="p-2 rounded-md hover:bg-red-500/10 text-red-400">
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
