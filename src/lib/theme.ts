import { Profile } from '../types';

export interface ThemePalette {
  bg: string;
  surface: string;
  text: string;
  sub: string;
  border: string;
}

export const THEME_PALETTES: Record<Profile['theme'], ThemePalette> = {
  neutral: { bg: '#FAFAFA', surface: '#FFFFFF', text: '#18181B', sub: '#71717A', border: '#E4E4E7' },
  warm: { bg: '#FDFBF7', surface: '#FFFFFF', text: '#292524', sub: '#78716C', border: '#E7E5E4' },
  midnight: { bg: '#0A0A0C', surface: '#141417', text: '#FAFAFA', sub: '#A1A1AA', border: '#27272A' },
  emerald: { bg: '#F0FDF4', surface: '#FFFFFF', text: '#052E16', sub: '#4D7C0F', border: '#BBF7D0' },
  charcoal: { bg: '#18181B', surface: '#1F1F23', text: '#F4F4F5', sub: '#A1A1AA', border: '#2E2E33' },
  cream: { bg: '#FFF7ED', surface: '#FFFFFF', text: '#431407', sub: '#9A3412', border: '#FED7AA' },
  dark: { bg: '#0F172A', surface: '#1E293B', text: '#F1F5F9', sub: '#94A3B8', border: '#334155' },
};

export const FONT_STACKS: Record<Profile['font_family'], string> = {
  inter: "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
  playfair: "'Playfair Display', Georgia, 'Times New Roman', serif",
};

export function getContrastText(hex: string): string {
  const clean = hex.replace('#', '');
  if (clean.length < 6) return '#FFFFFF';
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#18181B' : '#FFFFFF';
}

export function getButtonRadius(style: Profile['button_style'] | undefined): string {
  if (style === 'pill') return '9999px';
  if (style === 'sharp') return '4px';
  return '12px';
}

/**
 * Resolves a profile's saved theme into CSS custom properties.
 * Components consume them via Tailwind arbitrary values with hardcoded
 * fallbacks (e.g. bg-[var(--lk-surface,#fff)]) so unthemed contexts
 * (like the editor preview) keep the default look.
 */
/** Dark-mode overrides for the light surfaces — accent stays as chosen. */
export const DARK_MODE_VARS: Record<string, string> = {
  '--lk-bg': '#0B1120',
  '--lk-surface': '#111B2E',
  '--lk-text': '#F1F5F9',
  '--lk-sub': '#94A3B8',
  '--lk-border': 'rgba(255,255,255,0.10)',
};

export function getProfileThemeVars(
  profile: Pick<Profile, 'theme' | 'accent_color' | 'font_family' | 'button_style' | 'theme_mode'>
): Record<string, string> {
  const palette = THEME_PALETTES[profile.theme] ?? THEME_PALETTES.neutral;
  const accent = profile.accent_color || '#18181B';
  // Dark mode overrides the palette's light surfaces but keeps the chosen accent
  const colors = profile.theme_mode === 'dark' ? {
    bg: DARK_MODE_VARS['--lk-bg'],
    surface: DARK_MODE_VARS['--lk-surface'],
    text: DARK_MODE_VARS['--lk-text'],
    sub: DARK_MODE_VARS['--lk-sub'],
    border: DARK_MODE_VARS['--lk-border'],
  } : palette;
  return {
    '--lk-bg': colors.bg,
    '--lk-surface': colors.surface,
    '--lk-text': colors.text,
    '--lk-sub': colors.sub,
    '--lk-border': colors.border,
    '--lk-accent': accent,
    '--lk-accent-text': getContrastText(accent),
    '--lk-radius': getButtonRadius(profile.button_style),
    '--lk-font': FONT_STACKS[profile.font_family] ?? FONT_STACKS.inter,
  };
}
