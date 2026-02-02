-- Add SuperSweets products (900g Net Weight)
-- Migration to add traditional Indian sweets to the Mithai category

-- First, let's make sure the Mithai category exists
INSERT INTO public.categories (name, description, image_url, is_active) VALUES
  ('Mithai', 'Traditional Indian sweets and desserts', 'https://images.unsplash.com/photo-1603532362003-c0e5a5420a04?w=800', true)
ON CONFLICT (name) DO NOTHING;

-- Add SuperSweets products with 900g net weight
INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, nutritional_info, images, storage_instructions, marketing_info) 
SELECT 
  'Gajarpak Desi Ghee', 
  'Traditional grated carrot sweet cooked in pure desi ghee with khoya and dry fruits.',
  550.00,
  650.00,
  '900g',
  c.id,
  '["Fresh", "Traditional Recipe", "Vegetarian", "Made in India", "Desi Ghee"]'::jsonb,
  true,
  true,
  50,
  'MITHAI-GAJARP-900G',
  '{"material": "Carrot, Khoya, Desi Ghee, Sugar, Dry Fruits", "origin": "India", "brand": "SuperSweets", "certification": "FSSAI Approved", "weight_per_unit": "900g"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1603532362003-c0e5a5420a04?w=800', 'https://images.unsplash.com/photo-1613583288491-7a144d95b8d2?w=800'],
  'Store in a cool, dry place. Consume within 3 days for best freshness.',
  '{"marketedBy": "SuperSweets", "address": "Sweet Street", "city": "Delhi", "state": "Delhi", "fssaiLicense": "12345678901234"}'::jsonb
FROM public.categories c WHERE c.name = 'Mithai'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, nutritional_info, images, storage_instructions, marketing_info) 
SELECT 
  'Kaju Katli', 
  'Delicate diamond-shaped cashew fudge with pistachio topping. A royal sweet for special occasions.',
  800.00,
  950.00,
  '900g',
  c.id,
  '["Premium", "Nutrition Rich", "Vegetarian", "Made in India"]'::jsonb,
  true,
  false,
  30,
  'MITHAI-KK-900G',
  '{"material": "Cashew Nuts, Sugar, Edible Silver", "origin": "India", "brand": "SuperSweets", "certification": "FSSAI Approved", "weight_per_unit": "900g"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1613583288491-7a144d95b8d2?w=800', 'https://images.unsplash.com/photo-1603532362003-c0e5a5420a04?w=800'],
  'Store in a cool, dry place. Consume within 15 days for best freshness.',
  '{"marketedBy": "SuperSweets", "address": "Sweet Street", "city": "Delhi", "state": "Delhi", "fssaiLicense": "12345678901234"}'::jsonb
FROM public.categories c WHERE c.name = 'Mithai'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, nutritional_info, images, storage_instructions, marketing_info) 
SELECT 
  'Badam Katli', 
  'Delicate diamond-shaped almond fudge with pistachio topping. Rich in nutrition and taste.',
  800.00,
  950.00,
  '900g',
  c.id,
  '["Premium", "Nutrition Rich", "Vegetarian", "Made in India"]'::jsonb,
  true,
  false,
  30,
  'MITHAI-BK-900G',
  '{"material": "Almonds, Sugar, Edible Silver", "origin": "India", "brand": "SuperSweets", "certification": "FSSAI Approved", "weight_per_unit": "900g"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1613583288491-7a144d95b8d2?w=800', 'https://images.unsplash.com/photo-1603532362003-c0e5a5420a04?w=800'],
  'Store in a cool, dry place. Consume within 15 days for best freshness.',
  '{"marketedBy": "SuperSweets", "address": "Sweet Street", "city": "Delhi", "state": "Delhi", "fssaiLicense": "12345678901234"}'::jsonb
FROM public.categories c WHERE c.name = 'Mithai'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, nutritional_info, images, storage_instructions, marketing_info) 
SELECT 
  'Barfi Plain', 
  'Rich and creamy milk-based sweet with pure desi ghee, cut into squares.',
  400.00,
  480.00,
  '900g',
  c.id,
  '["Fresh", "Traditional Recipe", "Vegetarian", "Made in India"]'::jsonb,
  false,
  false,
  40,
  'MITHAI-BARFI-900G',
  '{"material": "Khoya, Sugar, Desi Ghee", "origin": "India", "brand": "SuperSweets", "certification": "FSSAI Approved", "weight_per_unit": "900g"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1603532362003-c0e5a5420a04?w=800', 'https://images.unsplash.com/photo-1613583288491-7a144d95b8d2?w=800'],
  'Store in a cool, dry place. Consume within 5 days for best freshness.',
  '{"marketedBy": "SuperSweets", "address": "Sweet Street", "city": "Delhi", "state": "Delhi", "fssaiLicense": "12345678901234"}'::jsonb
FROM public.categories c WHERE c.name = 'Mithai'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, nutritional_info, images, storage_instructions, marketing_info) 
SELECT 
  'Milk Cake', 
  'Soft and spongy milk-based sweet with rich flavor, perfect for celebrations.',
  360.00,
  420.00,
  '900g',
  c.id,
  '["Fresh", "Traditional Recipe", "Vegetarian", "Made in India"]'::jsonb,
  false,
  true,
  45,
  'MITHAI-MILKCAKE-900G',
  '{"material": "Milk Solids, Sugar, Desi Ghee", "origin": "India", "brand": "SuperSweets", "certification": "FSSAI Approved", "weight_per_unit": "900g"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1613583288491-7a144d95b8d2?w=800', 'https://images.unsplash.com/photo-1603532362003-c0e5a5420a04?w=800'],
  'Store in refrigerator. Consume within 3 days for best freshness.',
  '{"marketedBy": "SuperSweets", "address": "Sweet Street", "city": "Delhi", "state": "Delhi", "fssaiLicense": "12345678901234"}'::jsonb
FROM public.categories c WHERE c.name = 'Mithai'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, nutritional_info, images, storage_instructions, marketing_info) 
SELECT 
  'Pinni Desi Ghee', 
  'Traditional North Indian sweet made with wheat flour, desi ghee, and nuts.',
  400.00,
  480.00,
  '900g',
  c.id,
  '["Traditional", "Nutrition Rich", "Vegetarian", "Made in India", "Desi Ghee"]'::jsonb,
  false,
  true,
  35,
  'MITHAI-PINNI-900G',
  '{"material": "Wheat Flour, Desi Ghee, Sugar, Dry Fruits", "origin": "India", "brand": "SuperSweets", "certification": "FSSAI Approved", "weight_per_unit": "900g"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1603532362003-c0e5a5420a04?w=800', 'https://images.unsplash.com/photo-1613583288491-7a144d95b8d2?w=800'],
  'Store in a cool, dry place. Consume within 10 days for best freshness.',
  '{"marketedBy": "SuperSweets", "address": "Sweet Street", "city": "Delhi", "state": "Delhi", "fssaiLicense": "12345678901234"}'::jsonb
FROM public.categories c WHERE c.name = 'Mithai'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, nutritional_info, images, storage_instructions, marketing_info) 
SELECT 
  'Son Halwa', 
  'Rich semolina pudding cooked in ghee with nuts and dry fruits, a winter favorite.',
  350.00,
  420.00,
  '900g',
  c.id,
  '["Seasonal", "Traditional Recipe", "Vegetarian", "Made in India", "Desi Ghee"]'::jsonb,
  false,
  false,
  30,
  'MITHAI-SONHALWA-900G',
  '{"material": "Semolina, Desi Ghee, Sugar, Dry Fruits", "origin": "India", "brand": "SuperSweets", "certification": "FSSAI Approved", "weight_per_unit": "900g"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1613583288491-7a144d95b8d2?w=800', 'https://images.unsplash.com/photo-1603532362003-c0e5a5420a04?w=800'],
  'Store in a cool, dry place. Consume within 7 days for best freshness.',
  '{"marketedBy": "SuperSweets", "address": "Sweet Street", "city": "Delhi", "state": "Delhi", "fssaiLicense": "12345678901234"}'::jsonb
FROM public.categories c WHERE c.name = 'Mithai'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, nutritional_info, images, storage_instructions, marketing_info) 
SELECT 
  'Kalakand Barfi', 
  'Rich and creamy milk-based sweet with a soft texture, made from condensed milk.',
  400.00,
  480.00,
  '900g',
  c.id,
  '["Fresh", "Traditional Recipe", "Vegetarian", "Made in India"]'::jsonb,
  false,
  false,
  40,
  'MITHAI-KALAKAND-900G',
  '{"material": "Milk, Sugar, Desi Ghee", "origin": "India", "brand": "SuperSweets", "certification": "FSSAI Approved", "weight_per_unit": "900g"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1603532362003-c0e5a5420a04?w=800', 'https://images.unsplash.com/photo-1613583288491-7a144d95b8d2?w=800'],
  'Store in refrigerator. Consume within 3 days for best freshness.',
  '{"marketedBy": "SuperSweets", "address": "Sweet Street", "city": "Delhi", "state": "Delhi", "fssaiLicense": "12345678901234"}'::jsonb
FROM public.categories c WHERE c.name = 'Mithai'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, nutritional_info, images, storage_instructions, marketing_info) 
SELECT 
  'Peda', 
  'Soft and creamy milk-based sweet with rich flavor, dusted with dry fruits.',
  400.00,
  480.00,
  '900g',
  c.id,
  '["Fresh", "Traditional Recipe", "Vegetarian", "Made in India"]'::jsonb,
  false,
  false,
  45,
  'MITHAI-PEDA-900G',
  '{"material": "Khoya, Sugar, Cardamom", "origin": "India", "brand": "SuperSweets", "certification": "FSSAI Approved", "weight_per_unit": "900g"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1613583288491-7a144d95b8d2?w=800', 'https://images.unsplash.com/photo-1603532362003-c0e5a5420a04?w=800'],
  'Store in refrigerator. Consume within 3 days for best freshness.',
  '{"marketedBy": "SuperSweets", "address": "Sweet Street", "city": "Delhi", "state": "Delhi", "fssaiLicense": "12345678901234"}'::jsonb
FROM public.categories c WHERE c.name = 'Mithai'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, nutritional_info, images, storage_instructions, marketing_info) 
SELECT 
  'Coconut Barfi', 
  'Delicious coconut-based sweet with pure desi ghee, cut into diamond shapes.',
  160.00,
  190.00,
  '900g',
  c.id,
  '["Fresh", "Traditional Recipe", "Vegetarian", "Made in India"]'::jsonb,
  false,
  false,
  50,
  'MITHAI-COCONUT-900G',
  '{"material": "Coconut, Sugar, Desi Ghee", "origin": "India", "brand": "SuperSweets", "certification": "FSSAI Approved", "weight_per_unit": "900g"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1603532362003-c0e5a5420a04?w=800', 'https://images.unsplash.com/photo-1613583288491-7a144d95b8d2?w=800'],
  'Store in a cool, dry place. Consume within 5 days for best freshness.',
  '{"marketedBy": "SuperSweets", "address": "Sweet Street", "city": "Delhi", "state": "Delhi", "fssaiLicense": "12345678901234"}'::jsonb
FROM public.categories c WHERE c.name = 'Mithai'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, nutritional_info, images, storage_instructions, marketing_info) 
SELECT 
  'Laddu Motichoor', 
  'Tiny pearl-like sweet balls made from chickpea flour in sugar syrup, a festive favorite.',
  140.00,
  170.00,
  '900g',
  c.id,
  '["Festive Special", "Traditional Recipe", "Vegetarian", "Made in India"]'::jsonb,
  false,
  false,
  60,
  'MITHAI-LADDU-MOTI-900G',
  '{"material": "Chickpea Flour, Sugar, Cardamom", "origin": "India", "brand": "SuperSweets", "certification": "FSSAI Approved", "weight_per_unit": "900g"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1613583288491-7a144d95b8d2?w=800', 'https://images.unsplash.com/photo-1603532362003-c0e5a5420a04?w=800'],
  'Store in a cool, dry place. Consume within 5 days for best freshness.',
  '{"marketedBy": "SuperSweets", "address": "Sweet Street", "city": "Delhi", "state": "Delhi", "fssaiLicense": "12345678901234"}'::jsonb
FROM public.categories c WHERE c.name = 'Mithai'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, nutritional_info, images, storage_instructions, marketing_info) 
SELECT 
  'Laddu Simple', 
  'Traditional round sweet made from chickpea flour, ghee, and sugar.',
  140.00,
  170.00,
  '900g',
  c.id,
  '["Traditional", "Vegetarian", "Made in India"]'::jsonb,
  false,
  false,
  60,
  'MITHAI-LADDU-SIMPLE-900G',
  '{"material": "Chickpea Flour, Sugar, Desi Ghee", "origin": "India", "brand": "SuperSweets", "certification": "FSSAI Approved", "weight_per_unit": "900g"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1603532362003-c0e5a5420a04?w=800', 'https://images.unsplash.com/photo-1613583288491-7a144d95b8d2?w=800'],
  'Store in a cool, dry place. Consume within 5 days for best freshness.',
  '{"marketedBy": "SuperSweets", "address": "Sweet Street", "city": "Delhi", "state": "Delhi", "fssaiLicense": "12345678901234"}'::jsonb
FROM public.categories c WHERE c.name = 'Mithai'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, nutritional_info, images, storage_instructions, marketing_info) 
SELECT 
  'Rasgulla', 
  'Soft cottage cheese balls in light sugar syrup, a Bengali favorite with perfect sweet taste.',
  140.00,
  170.00,
  '900g',
  c.id,
  '["Fresh", "Bengali Special", "Vegetarian", "Made in India"]'::jsonb,
  true,
  false,
  40,
  'MITHAI-RASGULLA-900G',
  '{"material": "Cottage Cheese, Sugar, Cardamom", "origin": "West Bengal, India", "brand": "SuperSweets", "certification": "FSSAI Approved", "weight_per_unit": "900g"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1613583288491-7a144d95b8d2?w=800', 'https://images.unsplash.com/photo-1603532362003-c0e5a5420a04?w=800'],
  'Store in refrigerator. Consume within 2 days for best freshness.',
  '{"marketedBy": "SuperSweets", "address": "Sweet Street", "city": "Delhi", "state": "Delhi", "fssaiLicense": "12345678901234"}'::jsonb
FROM public.categories c WHERE c.name = 'Mithai'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, nutritional_info, images, storage_instructions, marketing_info) 
SELECT 
  'Gulab Jamun', 
  'Soft and spongy milk-based sweets soaked in sugar syrup, perfect for celebrations and festivals.',
  200.00,
  240.00,
  '900g',
  c.id,
  '["Fresh", "Traditional Recipe", "Vegetarian", "Made in India"]'::jsonb,
  true,
  false,
  50,
  'MITHAI-GULABJ-900G',
  '{"material": "Khoya, Sugar, Milk Solids", "origin": "India", "brand": "SuperSweets", "certification": "FSSAI Approved", "weight_per_unit": "900g"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1603532362003-c0e5a5420a04?w=800', 'https://images.unsplash.com/photo-1613583288491-7a144d95b8d2?w=800'],
  'Store in a cool, dry place. Consume within 3 days for best freshness.',
  '{"marketedBy": "SuperSweets", "address": "Sweet Street", "city": "Delhi", "state": "Delhi", "fssaiLicense": "12345678901234"}'::jsonb
FROM public.categories c WHERE c.name = 'Mithai'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, nutritional_info, images, storage_instructions, marketing_info) 
SELECT 
  'Chamcham', 
  'Traditional Bengali sweet made from chhena, with a soft and spongy texture.',
  300.00,
  360.00,
  '900g',
  c.id,
  '["Fresh", "Bengali Special", "Vegetarian", "Made in India"]'::jsonb,
  false,
  false,
  35,
  'MITHAI-CHAMCHAM-900G',
  '{"material": "Chhena, Sugar, Cardamom", "origin": "West Bengal, India", "brand": "SuperSweets", "certification": "FSSAI Approved", "weight_per_unit": "900g"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1613583288491-7a144d95b8d2?w=800', 'https://images.unsplash.com/photo-1603532362003-c0e5a5420a04?w=800'],
  'Store in refrigerator. Consume within 2 days for best freshness.',
  '{"marketedBy": "SuperSweets", "address": "Sweet Street", "city": "Delhi", "state": "Delhi", "fssaiLicense": "12345678901234"}'::jsonb
FROM public.categories c WHERE c.name = 'Mithai'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, nutritional_info, images, storage_instructions, marketing_info) 
SELECT 
  'Besan Barfi Desi Ghee', 
  'Rich and creamy gram flour sweet cooked in pure desi ghee with nuts.',
  150.00,
  180.00,
  '900g',
  c.id,
  '["Traditional", "Vegetarian", "Made in India", "Desi Ghee"]'::jsonb,
  false,
  false,
  45,
  'MITHAI-BESAN-BARFI-900G',
  '{"material": "Gram Flour, Desi Ghee, Sugar, Dry Fruits", "origin": "India", "brand": "SuperSweets", "certification": "FSSAI Approved", "weight_per_unit": "900g"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1603532362003-c0e5a5420a04?w=800', 'https://images.unsplash.com/photo-1613583288491-7a144d95b8d2?w=800'],
  'Store in a cool, dry place. Consume within 5 days for best freshness.',
  '{"marketedBy": "SuperSweets", "address": "Sweet Street", "city": "Delhi", "state": "Delhi", "fssaiLicense": "12345678901234"}'::jsonb
FROM public.categories c WHERE c.name = 'Mithai'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, nutritional_info, images, storage_instructions, marketing_info) 
SELECT 
  'Besan Laddu', 
  'Traditional round sweet made from gram flour, desi ghee, and sugar with nuts.',
  120.00,
  150.00,
  '900g',
  c.id,
  '["Traditional", "Vegetarian", "Made in India", "Desi Ghee"]'::jsonb,
  false,
  false,
  50,
  'MITHAI-BESAN-LADDU-900G',
  '{"material": "Gram Flour, Desi Ghee, Sugar, Dry Fruits", "origin": "India", "brand": "SuperSweets", "certification": "FSSAI Approved", "weight_per_unit": "900g"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1613583288491-7a144d95b8d2?w=800', 'https://images.unsplash.com/photo-1603532362003-c0e5a5420a04?w=800'],
  'Store in a cool, dry place. Consume within 5 days for best freshness.',
  '{"marketedBy": "SuperSweets", "address": "Sweet Street", "city": "Delhi", "state": "Delhi", "fssaiLicense": "12345678901234"}'::jsonb
FROM public.categories c WHERE c.name = 'Mithai'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, nutritional_info, images, storage_instructions, marketing_info) 
SELECT 
  'Boondi', 
  'Tiny round droplets made from chickpea flour batter, deep-fried and soaked in sugar syrup.',
  140.00,
  170.00,
  '900g',
  c.id,
  '["Festive Special", "Traditional Recipe", "Vegetarian", "Made in India"]'::jsonb,
  false,
  false,
  55,
  'MITHAI-BOONDI-900G',
  '{"material": "Chickpea Flour, Sugar, Cardamom", "origin": "India", "brand": "SuperSweets", "certification": "FSSAI Approved", "weight_per_unit": "900g"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1603532362003-c0e5a5420a04?w=800', 'https://images.unsplash.com/photo-1613583288491-7a144d95b8d2?w=800'],
  'Store in a cool, dry place. Consume within 5 days for best freshness.',
  '{"marketedBy": "SuperSweets", "address": "Sweet Street", "city": "Delhi", "state": "Delhi", "fssaiLicense": "12345678901234"}'::jsonb
FROM public.categories c WHERE c.name = 'Mithai'
ON CONFLICT (sku) DO NOTHING;
</parameter_content>