import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FileText, Mail, MessageCircle, Paperclip, Send, Tag, User, X } from 'lucide-react';
import { submitSupportTicket, type SupportTicket } from '../../lib/supportTickets';
import { StorageService } from '../../lib/storage';

// Values must match the support_tickets.category check constraint in the DB.
const SUBJECTS = [
  { value: 'general', label: 'General Question' },
  { value: 'account', label: 'Account & Settings' },
  { value: 'billing', label: 'Billing & Payments' },
  { value: 'technical', label: 'Technical Issue' },
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature_request', label: 'Feature Request' },
];

const inputCls =
  'mt-1.5 w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400';

/**
 * "Send Us a Message" form — persists to the support_tickets table via
 * submitSupportTicket and hands the created ticket to the page so the
 * success / track views can use it.
 */
export const SupportForm: React.FC<{ onSuccess: (ticket: SupportTicket) => void }> = ({ onSuccess }) => {
  const [name, setName] = useState(() => StorageService.getActiveUser()?.business_name || '');
  const [email, setEmail] = useState(() => StorageService.getActiveUser()?.email || '');
  const [category, setCategory] = useState('');
  const [relatedTemplate, setRelatedTemplate] = useState('');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = name.trim() !== '' && email.trim() !== '' && category !== '' && message.trim() !== '';

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (f && f.size > 5 * 1024 * 1024) {
      setFileError('File is too large. Maximum size is 5MB.');
      e.target.value = '';
      return;
    }
    setFileError('');
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      setError('Please fill in all the required fields marked with *');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const fullMessage = [
        message.trim(),
        relatedTemplate.trim() ? `Related template: ${relatedTemplate.trim()}` : '',
        file ? `Attachment: ${file.name}` : '',
      ]
        .filter(Boolean)
        .join('\n\n');
      const ticket = await submitSupportTicket({ category, subject: SUBJECTS.find((s) => s.value === category)?.label || category, message: fullMessage, email: email.trim() });
      onSuccess(ticket);
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch {
      setError('Could not send your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-sm" aria-label="Send us a message">
      <div className="flex items-start gap-3">
        <span className="md:hidden flex w-10 h-10 rounded-xl bg-blue-50 items-center justify-center shrink-0" aria-hidden="true">
          <Mail className="w-5 h-5 text-blue-600" />
        </span>
        <div>
          <h2 className="font-display text-[20px] font-bold text-slate-900">Send Us a Message</h2>
          <p className="mt-1 text-[12.5px] text-slate-500">
            Fill out the form below and we&apos;ll get back to you as soon as possible.
          </p>
        </div>
      </div>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label htmlFor="sup-name" className="text-[12.5px] font-semibold text-slate-700">
              Your Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="md:hidden w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
              <input id="sup-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" className={`${inputCls} pl-9 md:pl-3.5`} />
            </div>
          </div>
          <div>
            <label htmlFor="sup-email" className="text-[12.5px] font-semibold text-slate-700">
              Your Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="md:hidden w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
              <input id="sup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className={`${inputCls} pl-9 md:pl-3.5`} />
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="sup-subject" className="text-[12.5px] font-semibold text-slate-700">
              Subject <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Tag className="md:hidden w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
              <select
                id="sup-subject"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`${inputCls} pl-9 md:pl-3.5 appearance-none pr-9 ${category ? 'text-slate-900' : 'text-slate-400'}`}
              >
                <option value="" disabled>
                  Select a subject
                </option>
                {SUBJECTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            </div>
          </div>
          <div>
            <label htmlFor="sup-template" className="text-[12.5px] font-semibold text-slate-700">
              Related Template <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <FileText className="md:hidden w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
              <input
                id="sup-template"
                type="text"
                value={relatedTemplate}
                onChange={(e) => setRelatedTemplate(e.target.value)}
                placeholder="e.g. Gym Pro, Cafe Modern"
                className={`${inputCls} pl-9 md:pl-3.5`}
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="sup-message" className="text-[12.5px] font-semibold text-slate-700">
            Message <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MessageCircle className="md:hidden w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" aria-hidden="true" />
            <textarea
              id="sup-message"
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
              placeholder="Tell us how we can help..."
              rows={6}
              className="mt-1.5 w-full pl-9 md:pl-3.5 pr-3.5 py-3 rounded-xl border border-slate-200 bg-white text-[13px] leading-relaxed text-slate-900 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400"
            />
          </div>
          <p className="mt-1 text-right text-[11px] text-slate-400">{message.length}/1000</p>
        </div>

        {/* Mobile attachment uploader */}
        <div className="md:hidden">
          <input id="sup-attachment" type="file" accept="image/*,.pdf,.doc,.docx,.txt" className="sr-only" onChange={handleFile} />
          {file ? (
            <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
              <Paperclip className="w-4.5 h-4.5 text-blue-500 shrink-0" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block text-[12.5px] font-bold text-blue-700 truncate">{file.name}</span>
                <span className="block text-[10.5px] text-slate-500">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
              </span>
              <button
                type="button"
                onClick={() => setFile(null)}
                aria-label="Remove attachment"
                className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 shrink-0"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="sup-attachment"
              className="flex items-center gap-3 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/60 px-4 py-3.5 cursor-pointer active:bg-blue-50 transition-colors"
            >
              <Paperclip className="w-5 h-5 text-blue-500 shrink-0" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-bold text-blue-600">Add Attachment (Optional)</span>
                <span className="block text-[11px] text-slate-500">Upload images, screenshots or files (Max 5MB)</span>
              </span>
              <ChevronRight className="w-4 h-4 text-blue-400 shrink-0" aria-hidden="true" />
            </label>
          )}
          {fileError && (
            <p role="alert" className="mt-1.5 text-[11.5px] font-medium text-red-500">
              {fileError}
            </p>
          )}
        </div>

        {error && (
          <p role="alert" className="text-[12px] font-medium text-red-500">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] transition flex items-center justify-center gap-2 text-[14px] font-bold text-white disabled:opacity-60"
        >
          <Send className="w-4 h-4" aria-hidden="true" />
          {submitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </section>
  );
};
