import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Instagram, MessageCircle, Twitter, Youtube } from 'lucide-react';
import { LinkOsLogo } from '../common/LinkOsLogo';

const COLUMNS = [
  { title: 'Product', links: ['Templates', 'Features', 'Pricing', 'Domains'], to: '/templates' },
  { title: 'Resources', links: ['Help Center', 'Documentation', 'Blog', 'Community'], to: '/help' },
  { title: 'Company', links: ['About', 'Contact', 'Privacy', 'Terms'], to: '/about' },
];

const SOCIALS = [
  { icon: Twitter, label: 'X (Twitter)' },
  { icon: Instagram, label: 'Instagram' },
  { icon: Youtube, label: 'YouTube' },
  { icon: MessageCircle, label: 'Discord' },
];

/** Dark marketing footer shown on the support success view. */
export const SupportFooter: React.FC = () => {
  return (
    <footer className="bg-[#050D1F] text-slate-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid gap-10 md:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))_minmax(0,1.3fr)]">
        <div>
          <LinkOsLogo tone="light" showTagline />
          <p className="mt-3 text-[12px] leading-relaxed max-w-[220px]">
            The all-in-one platform to create, launch and grow your online business.
          </p>
          <div className="mt-4 flex items-center gap-2.5">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                className="flex w-8 h-8 rounded-lg border border-white/10 items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <s.icon className="w-4 h-4" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="text-[13px] font-bold text-white">{col.title}</p>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l}>
                  <Link to={col.to} className="text-[12px] hover:text-white transition-colors">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <p className="text-[13px] font-bold text-white">Stay Updated</p>
          <p className="mt-3 text-[12px]">Get the latest news and updates.</p>
          <form className="mt-3 flex" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="footer-email" className="sr-only">
              Email address
            </label>
            <input
              id="footer-email"
              type="email"
              placeholder="Enter your email"
              className="min-w-0 flex-1 h-10 px-3.5 rounded-l-lg border border-white/10 bg-white/[0.06] text-[12px] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
            />
            <button
              type="submit"
              aria-label="Subscribe"
              className="h-10 px-3.5 rounded-r-lg bg-blue-600 hover:bg-blue-500 transition-colors text-white"
            >
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11.5px]">
          <p>© 2026 LinkOS. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" aria-hidden="true" /> in India
          </p>
        </div>
      </div>
    </footer>
  );
};
