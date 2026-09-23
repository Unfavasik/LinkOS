// Per-template cover images — each card shows artwork matching its own theme.
// Templates data has no cover asset, so we map template ids to artwork here.
export const TEMPLATE_COVERS: Record<string, string> = {
  // Business
  'boardroom-slate': '/images/cards/office.png',
  'corporate-navy': '/images/cards/office.png',
  'consulting-ivory': '/images/cards/office.png',
  'startup-pitch': '/images/resources/growth-tips.png',
  'agency-mono': '/images/cards/portfolio.png',
  'executive-noir': '/images/cards/office.png',
  // Food & Cafe
  'cafe-pro': '/images/cafe/cover.webp',
  'cafe-crema': '/images/cafe/latte.webp',
  'spice-route': '/images/cards/spice.png',
  'bakery-butter': '/images/cafe/cake.webp',
  'bistro-noir': '/images/cafe/burger.webp',
  'sushi-slate': '/images/cards/sushi.png',
  'juice-bar': '/images/cards/juice.png',
  // Retail
  'boutique-rose': '/images/cards/retail.webp',
  'market-green': '/images/cards/market.png',
  'denim-indigo': '/images/cards/retail.webp',
  'tech-mart': '/images/cards/techmart.png',
  'jewel-box': '/images/cards/jewel.png',
  // Services
  'handyman-amber': '/images/cards/handyman.png',
  'clean-sweep': '/images/cards/handyman.png',
  'legal-ledger': '/images/cards/office.png',
  'autocare-pro': '/images/garage/cover.webp',
  'auto-garage': '/images/garage/cover.webp',
  'godi-royal': '/images/cards/car.webp',
  'pet-care': '/images/cards/pet.png',
  // Beauty & Spa
  'rose-quartz': '/images/cards/salon.webp',
  'salon-noir': '/images/cards/salon.webp',
  'mint-spa': '/images/cards/spa.png',
  'glow-gold': '/images/cards/spa.png',
  'lilac-studio': '/images/cards/salon.webp',
  // Fitness
  'iron-grid': '/images/cards/gym.webp',
  'yoga-sage': '/images/cards/yoga.png',
  'sprint-red': '/images/cards/sprint.png',
  'aqua-fit': '/images/cards/sprint.png',
  // Creative
  'portfolio-paper': '/images/cards/portfolio.png',
  'gallery-white': '/images/cards/portfolio.png',
  'ink-mono': '/images/cards/portfolio.png',
  'sunset-studio': '/images/cards/portfolio.png',
  'neon-folio': '/images/cards/portfolio.png',
  // Real Estate
  'estate-emerald': '/images/cards/estate.png',
  'villa-sand': '/images/cards/estate.png',
  'skyline-blue': '/images/cards/estate.png',
  'brick-mortar': '/images/cards/estate.png',
  // Education
  chalkboard: '/images/cards/education.png',
  'campus-blue': '/images/cards/education.png',
  'library-sepia': '/images/cards/education.png',
  'stem-lab': '/images/cards/education.png',
  // Events
  'wedding-blush': '/images/cards/wedding.png',
  'conference-dark': '/images/cards/office.png',
  'party-pop': '/images/cards/wedding.png',
  'festival-field': '/images/cards/wedding.png',
  // Health
  'clinic-mint': '/images/cards/clinic.webp',
  'pharmacy-cross': '/images/cards/clinic.webp',
  'wellness-wave': '/images/cards/spa.png',
  // Tech
  'terminal-green': '/images/resources/growth-tips.png',
  'cloud-slate': '/images/resources/growth-tips.png',
  'circuit-violet': '/images/cards/portfolio.png',
};

const CATEGORY_FALLBACKS: Record<string, string> = {
  'Food & Cafe': '/images/cafe/cover.webp',
  'Beauty & Spa': '/images/cards/salon.webp',
  Fitness: '/images/cards/gym.webp',
  Retail: '/images/cards/retail.webp',
  Health: '/images/cards/clinic.webp',
  Education: '/images/cards/education.png',
  Creative: '/images/cards/portfolio.png',
  Business: '/images/cards/office.png',
  Services: '/images/garage/cover.webp',
};

export function coverFor(templateId: string | undefined, category: string): string {
  if (templateId && TEMPLATE_COVERS[templateId]) return TEMPLATE_COVERS[templateId];
  return CATEGORY_FALLBACKS[category] || '/images/cafe/cover.webp';
}
