-- Add sample Mithai products
INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, nutritional_info, images, storage_instructions, marketing_info) 
SELECT 
  'Gulab Jamun - Classic Pack (500g)', 
  'Soft and spongy milk-based sweets soaked in sugar syrup. Perfect for celebrations and festivals.',
  249.00,
  299.00,
  '500g',
  c.id,
  '["Fresh", "Traditional Recipe", "Vegetarian", "Made in India"]'::jsonb,
  true,
  true,
  50,
  'MITHAI-GJ-500G',
  '{"material": "Khoya, Sugar, Milk Solids", "origin": "India", "brand": "SweetShop Delights", "certification": "FSSAI Approved", "weight_per_unit": "500g"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1603532362003-c0e5a5420a04?w=800', 'https://images.unsplash.com/photo-1613583288491-7a144d95b8d2?w=800'],
  'Store in a cool, dry place. Consume within 3 days for best freshness.',
  '{"marketedBy": "SweetShop Delights", "address": "123 Sweet Street", "city": "Delhi", "state": "Delhi", "fssaiLicense": "12345678901234"}'::jsonb
FROM public.categories c WHERE c.name = 'Mithai'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, nutritional_info, images, storage_instructions, marketing_info) 
SELECT 
  'Rasgulla - Bengali Delight (400g)', 
  'Soft cottage cheese balls in light sugar syrup. A Bengali favorite with a perfect sweet taste.',
  199.00,
  249.00,
  '400g',
  c.id,
  '["Fresh", "Bengali Special", "Vegetarian", "Made in India"]'::jsonb,
  true,
  false,
  40,
  'MITHAI-RAS-400G',
  '{"material": "Cottage Cheese, Sugar, Cardamom", "origin": "West Bengal, India", "brand": "SweetShop Delights", "certification": "FSSAI Approved", "weight_per_unit": "400g"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1613583288491-7a144d95b8d2?w=800', 'https://images.unsplash.com/photo-1603532362003-c0e5a5420a04?w=800'],
  'Store in refrigerator. Consume within 2 days for best freshness.',
  '{"marketedBy": "SweetShop Delights", "address": "123 Sweet Street", "city": "Delhi", "state": "Delhi", "fssaiLicense": "12345678901234"}'::jsonb
FROM public.categories c WHERE c.name = 'Mithai'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, nutritional_info, images, storage_instructions, marketing_info) 
SELECT 
  'Kaju Katli - Premium Cashew Fudge (250g)', 
  'Delicate diamond-shaped cashew fudge with pistachio topping. A royal sweet for special occasions.',
  399.00,
  499.00,
  '250g',
  c.id,
  '["Premium", "Nutrition Rich", "Vegetarian", "Made in India"]'::jsonb,
  false,
  true,
  30,
  'MITHAI-KK-250G',
  '{"material": "Cashew Nuts, Sugar, Edible Silver", "origin": "India", "brand": "SweetShop Delights", "certification": "FSSAI Approved", "weight_per_unit": "250g"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1613583288491-7a144d95b8d2?w=800', 'https://images.unsplash.com/photo-1603532362003-c0e5a5420a04?w=800'],
  'Store in a cool, dry place. Consume within 15 days for best freshness.',
  '{"marketedBy": "SweetShop Delights", "address": "123 Sweet Street", "city": "Delhi", "state": "Delhi", "fssaiLicense": "12345678901234"}'::jsonb
FROM public.categories c WHERE c.name = 'Mithai'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, nutritional_info, images, storage_instructions, marketing_info) 
SELECT 
  'Ladoo - Motichoor (500g)', 
  'Tiny pearl-like sweet balls made from chickpea flour in sugar syrup. A festive favorite.',
  229.00,
  279.00,
  '500g',
  c.id,
  '["Festive Special", "Traditional Recipe", "Vegetarian", "Made in India"]'::jsonb,
  false,
  false,
  45,
  'MITHAI-LO-500G',
  '{"material": "Chickpea Flour, Sugar, Cardamom", "origin": "India", "brand": "SweetShop Delights", "certification": "FSSAI Approved", "weight_per_unit": "500g"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1603532362003-c0e5a5420a04?w=800', 'https://images.unsplash.com/photo-1613583288491-7a144d95b8d2?w=800'],
  'Store in a cool, dry place. Consume within 5 days for best freshness.',
  '{"marketedBy": "SweetShop Delights", "address": "123 Sweet Street", "city": "Delhi", "state": "Delhi", "fssaiLicense": "12345678901234"}'::jsonb
FROM public.categories c WHERE c.name = 'Mithai'
ON CONFLICT (sku) DO NOTHING;