-- Create a table for Hero Slides
CREATE TABLE IF NOT EXISTS hero_slides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  description TEXT NOT NULL,
  cta_text TEXT NOT NULL,
  image TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow everyone to view active slides
CREATE POLICY "Allow public read access" ON hero_slides
  FOR SELECT USING (true);

-- Allow authenticated users (admin) to insert, update, delete
CREATE POLICY "Allow authenticated full access" ON hero_slides
  FOR ALL USING (auth.role() = 'authenticated');

-- Seed data
INSERT INTO hero_slides (title, subtitle, description, cta_text, image, display_order, is_active)
VALUES
  ('Unapologetic Elegance', 'The Signature Collection', 'For those who don''t seek attention, but command it.', 'Discover', '/hero-images/hero_ethnic.png', 1, true),
  ('For The Few', 'Royal Bridal', 'Crafted for the bride who demands the world.', 'Enquire', '/hero-images/hero_bridal.png', 2, true),
  ('Opulence', 'Festive Edit', 'Shine brighter than the occasion itself.', 'Shop Festive', '/hero-images/hero_festive.png', 3, true),
  ('Legacy', 'Men''s Couture', 'Sophistication isn''t a choice. It''s a standard.', 'View Collection', '/hero-images/hero_mens.png', 4, true),
  ('Bespoke', 'Master Tailoring', 'Your fit. Your rules. Perfection guaranteed.', 'Consult', '/hero-images/hero_tailoring.png', 5, true);
