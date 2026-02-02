-- Add Mithai category
INSERT INTO public.categories (name, description, image_url, is_active) VALUES
  ('Mithai', 'Traditional Indian sweets and desserts', 'https://images.unsplash.com/photo-1603532362003-c0e5a5420a04?w=800', true)
ON CONFLICT (name) DO NOTHING;