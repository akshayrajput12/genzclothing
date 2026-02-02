-- =====================================================
-- MIGRATION: CLOTHING STORE TRANSFORMATION
-- =====================================================

-- 1. ADD NEW COLUMNS TO PRODUCTS TABLE
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS available_sizes JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS size_chart_url TEXT,
ADD COLUMN IF NOT EXISTS is_tailored_available BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS custom_size_note TEXT;

-- 2. CLEAN UP EXISTING DUMMY DATA (Dependents first)
DELETE FROM public.product_sales;
DELETE FROM public.reviews;
DELETE FROM public.product_coupons;
DELETE FROM public.products;
DELETE FROM public.categories;
DELETE FROM public.product_features;

-- 3. INSERT NEW CATEGORIES
INSERT INTO public.categories (id, name, description, image_url, is_active) VALUES
  (gen_random_uuid(), 'Sarees', 'Elegant heritage sarees in silk, georgette, and chiffon.', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800', true),
  (gen_random_uuid(), 'Lehengas', 'Bridal and party wear lehengas detailed with intricate embroidery.', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800', true),
  (gen_random_uuid(), 'Gowns', 'Contemporary evening gowns for special occasions.', 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800', true),
  (gen_random_uuid(), 'Suits', 'Classic and modern suits including Anarkalis and Shararas.', 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800', true),
  (gen_random_uuid(), 'Kurtas', 'Everyday and festive kurtas in premium fabrics.', 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800', true),
  (gen_random_uuid(), 'Bridal', 'Exclusive bridal collection for your special day.', 'https://images.unsplash.com/photo-1549439602-43ebca2327af?w=800', true),
  (gen_random_uuid(), 'Contemporary', 'Fusion wear blending traditional aesthetics with modern cuts.', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800', true);

-- 4. INSERT NEW FEATURES
INSERT INTO public.product_features (name, description, is_active) VALUES
  ('Hand Embroidered', 'Intricate hand embroidery work', true),
  ('Pure Silk', 'Made from 100% pure silk', true),
  ('Custom Fit Available', 'Tailoring services available for this item', true),
  ('Designer Collection', 'Exclusive designer wear', true),
  ('Ready to Ship', 'Available for immediate dispatch', true),
  ('Sustainable Fabric', 'Eco-friendly materials', true),
  ('Handwoven', 'Traditional handloom weaving', true),
  ('Zari Work', 'Premium gold/silver thread work', true);

-- 5. INSERT NEW PRODUCTS (Sarees)
INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, available_sizes, is_tailored_available, images) 
SELECT 
  'Royal Banarasi Silk Saree', 
  'A timeless Banarasi silk saree in deep crimson with intricate gold zari floral motifs. Perfect for weddings and grand celebrations. Comes with an unstitched blouse piece.',
  15999.00,
  18999.00,
  '800g',
  c.id,
  '["Pure Silk", "Zari Work", "Handwoven", "Designer Collection"]'::jsonb,
  true,
  false,
  15,
  'SAR-BAN-001',
  '["Free Size"]'::jsonb,
  true,
  ARRAY['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800']
FROM public.categories c WHERE c.name = 'Sarees';

INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, available_sizes, is_tailored_available, images) 
SELECT 
  'Midnight Blue Georgette Saree', 
  'Lightweight georgette saree featuring sequins work and a scalloped border. Ideal for cocktail parties and evening receptions.',
  6499.00,
  8999.00,
  '450g',
  c.id,
  '["Ready to Ship", "Designer Collection"]'::jsonb,
  false,
  true,
  25,
  'SAR-GEO-002',
  '["Free Size"]'::jsonb,
  true,
  ARRAY['https://images.unsplash.com/photo-1610030469665-2766329437bb?w=800']
FROM public.categories c WHERE c.name = 'Sarees';

-- 6. INSERT NEW PRODUCTS (Lehengas)
INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, available_sizes, is_tailored_available, images) 
SELECT 
  'Emerald Velvet Bridal Lehenga', 
  'Luxurious velvet lehenga in emerald green with heavy zardosi and stone work. Includes a matching blouse and double dupatta set.',
  45000.00,
  55000.00,
  '3.5kg',
  c.id,
  '["Hand Embroidered", "Custom Fit Available", "Designer Collection", "Bridal"]'::jsonb,
  true,
  false,
  5,
  'LEH-VEL-001',
  '["S", "M", "L", "XL", "Tailored"]'::jsonb,
  true,
  ARRAY['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800', 'https://images.unsplash.com/photo-1588117260148-44755104a37f?w=800']
FROM public.categories c WHERE c.name = 'Lehengas';

INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, available_sizes, is_tailored_available, images) 
SELECT 
  'Pastel Pink Floral Lehenga', 
  'Soft silk lehenga with digital floral prints and subtle pearl embellishments. Perfect for day weddings and mehendi functions.',
  22500.00,
  28000.00,
  '2.0kg',
  c.id,
  '["Pure Silk", "Custom Fit Available", "New Arrival"]'::jsonb,
  false,
  true,
  10,
  'LEH-SIL-002',
  '["XS", "S", "M", "L", "XL"]'::jsonb,
  true,
  ARRAY['https://images.unsplash.com/photo-1516766436979-bf7aeb7e7389?w=800']
FROM public.categories c WHERE c.name = 'Lehengas';

-- 7. INSERT NEW PRODUCTS (Gowns)
INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, available_sizes, is_tailored_available, images) 
SELECT 
  'Sequined Champagne Evening Gown', 
  'Floor-length champagne gown fully embellished with sequins. Features a plunging neckline and a dramatic trail.',
  18500.00,
  22000.00,
  '1.5kg',
  c.id,
  '["Designer Collection", "Party Wear"]'::jsonb,
  false,
  true,
  12,
  'GWN-SEQ-001',
  '["S", "M", "L", "XL"]'::jsonb,
  true,
  ARRAY['https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800']
FROM public.categories c WHERE c.name = 'Gowns';

-- 8. INSERT NEW PRODUCTS (Suits)
INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, available_sizes, is_tailored_available, images) 
SELECT 
  'Ivory Anarkali Suit Set', 
  'Classic ivory floor-length anarkali in chanderi silk with chikankari work. Paired with a net dupatta and churidar.',
  12500.00,
  15000.00,
  '1.0kg',
  c.id,
  '["Hand Embroidered", "Classic Style", "Pure Silk"]'::jsonb,
  true,
  false,
  20,
  'SUT-ANA-001',
  '["XS", "S", "M", "L", "XL", "XXL"]'::jsonb,
  true,
  ARRAY['https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800']
FROM public.categories c WHERE c.name = 'Suits';

-- 9. INSERT NEW PRODUCTS (Contemporary)
INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, available_sizes, is_tailored_available, images) 
SELECT 
  'Fusion Dhoti Pant Set with Crop Top', 
  'Modern silhouette featuring draped satin dhoti pants and an embroidered crop top with attached cape sleeves.',
  9800.00,
  12000.00,
  '800g',
  c.id,
  '["Contemporary Fit", "Designer Collection"]'::jsonb,
  false,
  true,
  15,
  'CON-FUS-001',
  '["S", "M", "L"]'::jsonb,
  false,
  ARRAY['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800']
FROM public.categories c WHERE c.name = 'Contemporary';
