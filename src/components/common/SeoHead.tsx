import React, { useEffect } from 'react';

interface SeoHeadProps {
  title: string;
  description: string;
  ogImage?: string;
  canonicalUrl?: string;
}

export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  ogImage,
  canonicalUrl,
}) => {
  useEffect(() => {
    // 1. Update Title
    document.title = title;

    // 2. Helper to set or create meta tag
    const setMetaTag = (selector: string, attr: string, value: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        const [attrName, attrVal] = selector
          .replace('meta[', '')
          .replace(']', '')
          .split('=');
        element.setAttribute(attrName, attrVal.replace(/"/g, ''));
        document.head.appendChild(element);
      }
      element.setAttribute(attr, value);
    };

    setMetaTag('meta[name="description"]', 'content', description);
    setMetaTag('meta[property="og:title"]', 'content', title);
    setMetaTag('meta[property="og:description"]', 'content', description);
    setMetaTag('meta[name="twitter:title"]', 'content', title);
    setMetaTag('meta[name="twitter:description"]', 'content', description);

    if (ogImage) {
      setMetaTag('meta[property="og:image"]', 'content', ogImage);
      setMetaTag('meta[name="twitter:image"]', 'content', ogImage);
    }

    if (canonicalUrl) {
      let linkElement = document.querySelector('link[rel="canonical"]');
      if (!linkElement) {
        linkElement = document.createElement('link');
        linkElement.setAttribute('rel', 'canonical');
        document.head.appendChild(linkElement);
      }
      linkElement.setAttribute('href', canonicalUrl);
    }
  }, [title, description, ogImage, canonicalUrl]);

  return null;
};
