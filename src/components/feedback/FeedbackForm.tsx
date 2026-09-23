import React, { useState } from 'react';
import { ChevronDown, ImagePlus, Paperclip, Send } from 'lucide-react';
import { submitFeedback, type FeedbackType } from '../../lib/feedback';

const TYPES: { value: FeedbackType; label: string }[] = [
  { value: 'feature_request', label: 'Feature Request' },
  { value: 'general', label: 'General Feedback' },
  { value: 'bug', label: 'Bug Report' },
  { value: 'testimonial', label: 'Testimonial' },
  { value: 'complaint', label: 'Complaint' },
];

/**
 * "Share Your Feedback" form card — type, subject, message with character
 * counter, optional screenshot and email. Persists via submitFeedback().
 */
export const FeedbackForm: React.FC<{ onSuccess: (ticketId: string) => void }> = ({ onSuccess }) => {
  const [type, setType] = useState<FeedbackType>('feature_request');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [screenshot, setScreenshot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = message.trim().length >= 5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      setError('Please write a short message (at least 5 characters).');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await submitFeedback({ feedback_type: type, message: message.trim(), rating: null, subject, email });
      const d = new Date();
      const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
      onSuccess(`#FB-${ymd}-${Math.floor(1000 + Math.random() * 9000)}`);
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch {
      setError('Could not send your feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    'w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-[13.5px] text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition';

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm" aria-labelledby="fb-form-title">
      <h2 id="fb-form-title" className="text-[19px] font-bold text-slate-900">Share Your Feedback</h2>
      <p className="mt-1 text-[12.5px] text-slate-500">Let us know your thoughts, suggestions, or issues.</p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4.5" noValidate>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fb-type" className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
              Feedback Type
            </label>
            <div className="relative">
              <select
                id="fb-type"
                value={type}
                onChange={(e) => setType(e.target.value as FeedbackType)}
                className={`${inputCls} appearance-none pr-9`}
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            </div>
          </div>

          <div>
            <label htmlFor="fb-subject" className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
              Subject
            </label>
            <input
              id="fb-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={120}
              placeholder="e.g. Add more templates, improve editor, etc."
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label htmlFor="fb-message" className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
            Your Message
          </label>
          <textarea
            id="fb-message"
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
            rows={6}
            placeholder="Tell us more about your feedback..."
            className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-white text-[13.5px] leading-relaxed text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition resize-none"
          />
          <p className="mt-1 text-right text-[11px] text-slate-400">{message.length}/1000</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-[12.5px] font-semibold text-slate-700 mb-1.5">Add Screenshot (Optional)</p>
            <label
              htmlFor="fb-screenshot"
              className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-4 py-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
            >
              <ImagePlus className="w-6 h-6 text-blue-500" aria-hidden="true" />
              <span className="text-[12px] font-semibold text-slate-700">Click to upload or drag and drop</span>
              <span className="text-[10.5px] text-slate-400">PNG, JPG, GIF (Max 5MB)</span>
              <input
                id="fb-screenshot"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => setScreenshot(e.target.files?.[0]?.name ?? '')}
              />
            </label>
            {screenshot && (
              <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                <Paperclip className="w-3 h-3" aria-hidden="true" />
                {screenshot}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="fb-email" className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
              Your Email (Optional)
            </label>
            <input
              id="fb-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputCls}
            />
            <p className="mt-1.5 text-[11px] text-slate-400">We&apos;ll only use this to follow up if needed.</p>
          </div>
        </div>

        {error && (
          <p role="alert" className="text-[12.5px] font-medium text-red-500">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] transition flex items-center justify-center gap-2 text-[14px] font-bold text-white disabled:opacity-60"
        >
          <Send className="w-4 h-4" aria-hidden="true" />
          {submitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </section>
  );
};
