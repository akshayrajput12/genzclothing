-- Add Festival Special category
INSERT INTO public.categories (name, description, image_url, is_active) VALUES
  ('Festival Special', 'Exclusive sweets and treats for festive occasions', 'https://images.unsplash.com/photo-1606743825-936c2a0e8651?w=800', true)
ON CONFLICT (name) DO NOTHING;

-- Add sample Festival Special products
INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, nutritional_info, images, storage_instructions, marketing_info) 
SELECT 
  'Diwali Celebration Box - Assorted Sweets (1kg)', 
  'Premium assorted sweets box perfect for Diwali celebrations. Contains our most popular sweets in festive packaging.',
  899.00,
  1099.00,
  '1kg',
  c.id,
  '["Festive Special", "Assorted", "Premium Quality", "Gift Box", "Made in India"]'::jsonb,
  true,
  true,
  30,
  'FEST-DIW-1KG',
  '{"material": "Assorted Sweets", "origin": "India", "brand": "SweetShop Delights", "certification": "FSSAI Approved", "weight_per_unit": "1kg"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1606743825-936c2a0e8651?w=800', 'https://images.unsplash.com/photo-1613583288491-7a144d95b8d2?w=800'],
  'Store in a cool, dry place. Consume within 7 days for best freshness.',
  '{"marketedBy": "SweetShop Delights", "address": "123 Sweet Street", "city": "Delhi", "state": "Delhi", "fssaiLicense": "12345678901234"}'::jsonb
FROM public.categories c WHERE c.name = 'Festival Special'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, nutritional_info, images, storage_instructions, marketing_info) 
SELECT 
  'Holi Special - Gujiya Pack (500g)', 
  'Traditional Holi sweet - Gujiya filled with khoya and dry fruits. Perfect for Holi celebrations.',
  349.00,
  399.00,
  '500g',
  c.id,
  '["Holi Special", "Traditional Recipe", "Vegetarian", "Made in India", "Festive"]'::jsonb,
  false,
  true,
  40,
  'FEST-HOL-500G',
  '{"material": "Khoya, Dry Fruits, Wheat Flour", "origin": "India", "brand": "SweetShop Delights", "certification": "FSSAI Approved", "weight_per_unit": "500g"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1613583288491-7a144d95b8d2?w=800', 'https://images.unsplash.com/photo-1606743825-936c2a0e8651?w=800'],
  'Store in a cool, dry place. Consume within 5 days for best freshness.',
  '{"marketedBy": "SweetShop Delights", "address": "123 Sweet Street", "city": "Delhi", "state": "Delhi", "fssaiLicense": "12345678901234"}'::jsonb
FROM public.categories c WHERE c.name = 'Festival Special'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (name, description, price, original_price, pieces, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, nutritional_info, images, storage_instructions, marketing_info) 
SELECT 
  'Eid Special - Sheer Khurma (400g)', 
  'Rich and creamy Eid special dessert made with vermicelli, milk, and dry fruits. Authentic recipe for your Eid celebrations.',
  299.00,
  349.00,
  '400g',
  c.id,
  '["Eid Special", "Traditional Recipe", "Vegetarian", "Made in India", "Festive"]'::jsonb,
  true,
  false,
  25,
  'FEST-EID-400G',
  '{"material": "Vermicelli, Milk, Dry Fruits, Sugar", "origin": "India", "brand": "SweetShop Delights", "certification": "FSSAI Approved", "weight_per_unit": "400g"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1606743825-936c2a0e8651?w=800', 'https://images.unsplash.com/photo-1613583288491-7a144d95b8d2?w=800'],
  'Refrigerate after opening. Consume within 3 days for best freshness.',
  '{"marketedBy": "SweetShop Delights", "address": "123 Sweet Street", "city": "Delhi", "state": "Delhi", "fssaiLicense": "12345678901234"}'::jsonb
FROM public.categories c WHERE c.name = 'Festival Special'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, nutritional_info, images, storage_instructions, marketing_info) 
SELECT 
  'Christmas Special - Chocolate Truffle Cake (1kg)', 
  'Rich chocolate truffle cake perfect for Christmas celebrations. Made with premium Belgian chocolate.',
  799.00,
  999.00,
  '1kg',
  c.id,
  '["Christmas Special", "Chocolate", "Premium Quality", "Gift Box", "Made in India"]'::jsonb,
  false,
  true,
  20,
  'FEST-CHR-1KG',
  '{"material": "Belgian Chocolate, Cream, Cake Base", "origin": "India", "brand": "SweetShop Delights", "certification": "FSSAI Approved", "weight_per_unit": "1kg"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1613583288491-7a144d95b8d2?w=800', 'https://images.unsplash.com/photo-1606743825-936c2a0e8651?w=800'],
  'Refrigerate. Consume within 3 days for best freshness.',
  '{"marketedBy": "SweetShop Delights", "address": "123 Sweet Street", "city": "Delhi", "state": "Delhi", "fssaiLicense": "12345678901234"}'::jsonb
FROM public.categories c WHERE c.name = 'Festival Special'
ON CONFLICT (sku) DO NOTHING;