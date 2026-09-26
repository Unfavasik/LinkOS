-- Keep the live catalog aligned with src/data/templates.ts.
-- Existing profile/product/website rows are intentionally untouched.
begin;

update public.templates
set
  name = case id
    when 'cafe-pro' then 'Urban Brew Café'
    when 'autocare-pro' then 'AutoCare Service Centre'
    when 'godi-royal' then 'Rofik Godi Centre'
  end,
  category = case id
    when 'cafe-pro' then 'Food & Cafe'
    when 'autocare-pro' then 'Services'
    when 'godi-royal' then 'Retail'
  end,
  description = case id
    when 'cafe-pro' then 'Full-featured café & restaurant page — cover photo, menu with discounts, services, business hours, photo gallery and socials.'
    when 'autocare-pro' then 'Full-featured car & bike service page — dark garage cover, priced service cards, why-choose-us checklist, business hours, photo gallery and reviews.'
    when 'godi-royal' then 'Premium dark-and-gold page for car seat covers & interior accessories — hero banner, product grid, trust stats, about section and sticky WhatsApp CTA.'
  end,
  theme = case id when 'cafe-pro' then 'dark' when 'autocare-pro' then 'neutral' when 'godi-royal' then 'charcoal' end,
  accent_color = case id when 'cafe-pro' then '#22C55E' when 'autocare-pro' then '#2563EB' when 'godi-royal' then '#E8C87A' end,
  layout = case id when 'cafe-pro' then 'cafe' when 'autocare-pro' then 'garage' when 'godi-royal' then 'godi' end,
  popularity = 100,
  is_pro = true,
  is_active = true,
  tags = case id
    when 'cafe-pro' then '["cafe", "restaurant", "menu", "gallery", "Bestseller"]'::jsonb
    when 'autocare-pro' then '["auto", "car service", "bike service", "garage", "workshop", "Pro"]'::jsonb
    when 'godi-royal' then '["car seat covers", "car accessories", "auto", "premium", "dark", "Pro"]'::jsonb
  end,
  updated_at = timezone('utc', now())
where id in ('cafe-pro', 'autocare-pro', 'godi-royal');

commit;
