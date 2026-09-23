import React, { useMemo } from 'react';

interface GoogleMapEmbedProps {
  /** Address, place name or "lat,lng" to show on the map */
  query: string;
  zoom?: number;
  className?: string;
  title?: string;
}

/** Joins non-empty address parts into a single map search query */
export const buildMapQuery = (parts: (string | undefined | null)[]): string =>
  parts.map((p) => (p || '').trim()).filter(Boolean).join(', ');

/**
 * Real Google Maps embed (no API key required).
 * Uses the public maps.google.com output=embed endpoint, so the map shown
 * is a live Google Map — searchable, zoomable and pannable.
 */
export const GoogleMapEmbed: React.FC<GoogleMapEmbedProps> = ({
  query,
  zoom = 14,
  className,
  title = 'Google Maps location',
}) => {
  const src = useMemo(
    () => `https://www.google.com/maps?q=${encodeURIComponent(query.trim())}&z=${zoom}&output=embed`,
    [query, zoom]
  );

  if (!query.trim()) return null;

  return (
    <iframe
      src={src}
      title={title}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
  );
};

/** Basic validation for pasted Google Maps share links */
export const isValidMapsLink = (url: string): boolean =>
  /^https?:\/\/(www\.)?(maps\.app\.goo\.gl|goo\.gl\/maps|maps\.google\.[a-z.]+|([a-z]+\.)?google\.[a-z.]+\/maps)/i.test(
    url.trim()
  );
