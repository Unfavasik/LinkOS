import React from 'react';
import {
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Linkedin,
  Globe,
  MapPin,
  Mail,
  ExternalLink,
  Link as LinkIcon,
} from 'lucide-react';
import { LinkItem, Profile } from '../../types';
import { StorageService } from '../../lib/storage';

interface LinksListProps {
  links: LinkItem[];
  profile: Profile;
}

export const LinksList: React.FC<LinksListProps> = ({ links, profile }) => {
  if (!links || links.length === 0) return null;

  const getIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case 'instagram':
        return <Instagram className="w-4 h-4 text-pink-600" />;
      case 'facebook':
        return <Facebook className="w-4 h-4 text-blue-600" />;
      case 'youtube':
        return <Youtube className="w-4 h-4 text-red-600" />;
      case 'twitter':
        return <Twitter className="w-4 h-4 text-sky-500" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4 text-blue-700" />;
      case 'map':
        return <MapPin className="w-4 h-4 text-emerald-600" />;
      case 'mail':
        return <Mail className="w-4 h-4 text-zinc-600" />;
      case 'globe':
      case 'website':
        return <Globe className="w-4 h-4 text-zinc-700" />;
      default:
        return <LinkIcon className="w-4 h-4 text-zinc-600" />;
    }
  };

  const handleLinkClick = (link: LinkItem) => {
    StorageService.recordAnalyticsEvent(profile.id, 'link_click', {
      link_id: link.id,
      title: link.title,
      url: link.url,
    });
  };

  const getSafeHref = (rawUrl: string): string | null => {
    const value = rawUrl.trim();
    if (!value) return null;
    try {
      const parsed = new URL(value, window.location.origin);
      const allowedProtocols = new Set(['http:', 'https:', 'mailto:', 'tel:']);
      if (!allowedProtocols.has(parsed.protocol)) return null;
      return parsed.href;
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-2 max-w-md mx-auto px-4">
      {links.map((link) => {
        const safeHref = getSafeHref(link.url);
        if (!safeHref) return null;
        return (
          <a
            key={link.id}
            href={safeHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleLinkClick(link)}
            className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--lk-surface,#fff)] hover:bg-[var(--lk-bg,#FAFAFA)] border border-[var(--lk-border,#E4E4E7)] shadow-2xs hover:shadow-xs transition-all active:scale-99 group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--lk-bg,#F4F4F5)] flex items-center justify-center group-hover:bg-[var(--lk-border,#E4E4E7)] transition-colors">
                {getIcon(link.icon)}
              </div>
              <span className="text-xs sm:text-sm font-medium text-[var(--lk-text,#27272A)] group-hover:opacity-80">
                {link.title}
              </span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
          </a>
        );
      })}
    </div>
  );
};
