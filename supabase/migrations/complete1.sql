-- =====================================================
-- DARE TO DIET COMPLETE DATABASE MIGRATION
-- =====================================================
-- This migration creates the complete database schema for Dare To Diet
-- A comprehensive bulk shopping e-commerce platform
-- 
-- Version: 3.0 (Complete Analysis-Based Migration)
-- Date: 2025-02-08
-- 
-- This migration is based on comprehensive analysis of:
-- - All admin TypeScript files
-- - Product form requirements
-- - Sales tracking needs
-- - Complete feature requirements
-- 
-- This single migration file contains:
-- 1. Complete database schema with all tables
-- 2. Product features enhancement system
-- 3. Sales tracking and inventory management
-- 4. Storage buckets and policies
-- 5. All necessary functions and triggers
-- 6. Row Level Security policies
-- 7. Performance indexes
-- 8. Initial sample data
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Categories Table (for bulk product categories)
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Products Table (bulk products across all categories)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  weight TEXT,
  pieces TEXT,
  category_id UUID REFERENCES public.categories(id),
  images TEXT[] DEFAULT '{}',
  product_specs JSONB,
  features JSONB DEFAULT '{}',
  care_instructions TEXT,
  marketing_info JSONB,
  is_bestseller BOOLEAN DEFAULT FALSE,
  new_arrival BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  stock_quantity INTEGER DEFAULT 0,
  sku TEXT UNIQUE,
  available_sizes JSONB DEFAULT '[]'::jsonb,
  size_chart_url TEXT,
  is_tailored_available BOOLEAN DEFAULT FALSE,
  custom_size_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  min_order_amount DECIMAL(10, 2) DEFAULT 0,
  max_discount_amount DECIMAL(10, 2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Product Coupons Junction Table
CREATE TABLE IF NOT EXISTS public.product_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(product_id, coupon_id)
);

-- Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  order_number TEXT NOT NULL UNIQUE,
  customer_info JSONB NOT NULL,
  delivery_location JSONB NOT NULL,
  address_details JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
  delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  cod_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  order_status TEXT NOT NULL DEFAULT 'placed',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  courier_name TEXT,
  courier_phone TEXT,
  tracking_url TEXT,
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  actual_delivery TIMESTAMP WITH TIME ZONE,
  special_instructions TEXT,
  coupon_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Addresses Table
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('home', 'work', 'other')),
  name TEXT NOT NULL,
  phone TEXT,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  landmark TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Product Sales Tracking Table
CREATE TABLE IF NOT EXISTS public.product_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  quantity_sold INTEGER NOT NULL DEFAULT 0,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_revenue DECIMAL(10, 2) NOT NULL,
  sale_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Product Features Table
CREATE TABLE IF NOT EXISTS public.product_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Settings Table for Admin Configuration
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activity Logs Table for Admin Tracking
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- UTILITY FUNCTIONS (Create after tables are created)
-- =====================================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to check if current user is admin (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(is_admin, false) FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = '';

-- Function to generate order receipts
CREATE OR REPLACE FUNCTION generate_order_receipt()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  receipt_id TEXT;
BEGIN
  -- Generate unique receipt ID for Razorpay
  receipt_id := 'BULKBUYSTORE_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 8);
  
  RETURN receipt_id;
END;
$$;

-- Function to make first user admin
CREATE OR REPLACE FUNCTION public.make_first_user_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is the first profile being created, make them admin
  IF (SELECT COUNT(*) FROM public.profiles) = 0 THEN
    NEW.is_admin = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to track product sales when orders are placed
CREATE OR REPLACE FUNCTION public.track_product_sales()
RETURNS TRIGGER AS $$
DECLARE
  item JSONB;
BEGIN
  -- Only track sales for paid/confirmed orders
  IF NEW.payment_status = 'paid' OR NEW.order_status = 'confirmed' THEN
    -- Loop through each item in the order
    FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
    LOOP
      -- Insert sales record for each product
      INSERT INTO public.product_sales (
        product_id,
        order_id,
        quantity_sold,
        unit_price,
        total_revenue,
        sale_date
      ) VALUES (
        (item->>'id')::UUID,
        NEW.id,
        (item->>'quantity')::INTEGER,
        (item->>'price')::DECIMAL,
        (item->>'price')::DECIMAL * (item->>'quantity')::INTEGER,
        NEW.created_at
      );
      
      -- Update product stock quantity
      UPDATE public.products 
      SET stock_quantity = GREATEST(0, stock_quantity - (item->>'quantity')::INTEGER)
      WHERE id = (item->>'id')::UUID;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Profiles Policies
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_select_admin" ON public.profiles FOR SELECT USING (public.is_admin());

-- Categories Policies
CREATE POLICY "categories_select_active" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "categories_all_admin" ON public.categories FOR ALL USING (public.is_admin());

-- Products Policies
CREATE POLICY "products_select_active" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "products_all_admin" ON public.products FOR ALL USING (public.is_admin());

-- Coupons Policies
CREATE POLICY "coupons_select_active" ON public.coupons FOR SELECT 
USING ((is_active = true) AND (valid_from <= now()) AND ((valid_until IS NULL) OR (valid_until >= now())));
CREATE POLICY "coupons_all_admin" ON public.coupons FOR ALL USING (public.is_admin());

-- Product Coupons Policies
CREATE POLICY "product_coupons_select_all" ON public.product_coupons FOR SELECT USING (true);
CREATE POLICY "product_coupons_all_admin" ON public.product_coupons FOR ALL USING (public.is_admin());

-- Orders Policies
CREATE POLICY "orders_select_own_or_admin" ON public.orders FOR SELECT 
USING ((auth.uid() = user_id) OR (user_id IS NULL) OR public.is_admin());
CREATE POLICY "orders_insert_anyone" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_update_admin" ON public.orders FOR UPDATE USING (public.is_admin());
CREATE POLICY "orders_all_admin" ON public.orders FOR ALL USING (public.is_admin());

-- Reviews Policies
CREATE POLICY "reviews_select_all" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_own" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_all_admin" ON public.reviews FOR ALL USING (public.is_admin());

-- Addresses Policies
CREATE POLICY "addresses_all_own" ON public.addresses FOR ALL USING (auth.uid() = user_id);

-- Product Sales Policies
CREATE POLICY "product_sales_select_all" ON public.product_sales FOR SELECT USING (true);
CREATE POLICY "product_sales_all_admin" ON public.product_sales FOR ALL USING (public.is_admin());

-- Product Features Policies
CREATE POLICY "product_features_select_active" ON public.product_features FOR SELECT 
USING (is_active = true);
CREATE POLICY "product_features_all_admin" ON public.product_features FOR ALL 
USING (public.is_admin());

-- Settings Policies
CREATE POLICY "settings_select_public" ON public.settings FOR SELECT 
USING (is_public = true);
CREATE POLICY "settings_all_admin" ON public.settings FOR ALL 
USING (public.is_admin());

-- Notifications Policies
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT 
USING (auth.uid() = user_id);
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE 
USING (auth.uid() = user_id);
CREATE POLICY "notifications_all_admin" ON public.notifications FOR ALL 
USING (public.is_admin());

-- Activity Logs Policies
CREATE POLICY "activity_logs_select_admin" ON public.activity_logs FOR SELECT 
USING (public.is_admin());
CREATE POLICY "activity_logs_insert_authenticated" ON public.activity_logs FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Updated at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_features_updated_at
  BEFORE UPDATE ON public.product_features
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- User signup trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- First user admin trigger
CREATE TRIGGER set_first_user_admin
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.make_first_user_admin();

-- Product sales tracking trigger
CREATE TRIGGER track_sales_on_order_insert
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.track_product_sales();

CREATE TRIGGER track_sales_on_order_update
  AFTER UPDATE ON public.orders
  FOR EACH ROW 
  WHEN (OLD.payment_status != NEW.payment_status OR OLD.order_status != NEW.order_status)
  EXECUTE FUNCTION public.track_product_sales();

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_bestseller ON public.products(is_bestseller) WHERE is_bestseller = true;
CREATE INDEX IF NOT EXISTS idx_products_new_arrival ON public.products(new_arrival) WHERE new_arrival = true;
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);

-- Addresses indexes
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_is_default ON public.addresses(is_default) WHERE is_default = true;

-- Product sales indexes
CREATE INDEX IF NOT EXISTS idx_product_sales_product_id ON public.product_sales(product_id);
CREATE INDEX IF NOT EXISTS idx_product_sales_order_id ON public.product_sales(order_id);
CREATE INDEX IF NOT EXISTS idx_product_sales_sale_date ON public.product_sales(sale_date DESC);

-- Product coupons indexes
CREATE INDEX IF NOT EXISTS idx_product_coupons_product_id ON public.product_coupons(product_id);
CREATE INDEX IF NOT EXISTS idx_product_coupons_coupon_id ON public.product_coupons(coupon_id);

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin) WHERE is_admin = true;
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Product features indexes
CREATE INDEX IF NOT EXISTS idx_product_features_is_active ON public.product_features(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_product_features_name ON public.product_features(name);

-- Settings indexes
CREATE INDEX IF NOT EXISTS idx_settings_key ON public.settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON public.settings(category);
CREATE INDEX IF NOT EXISTS idx_settings_is_public ON public.settings(is_public) WHERE is_public = true;

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Activity logs indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- =====================================================
-- STORAGE BUCKETS AND POLICIES
-- =====================================================

-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('product-images', 'product-images', true),
  ('category-images', 'category-images', true),
  ('coupon-images', 'coupon-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product images
CREATE POLICY "Anyone can view product images" ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');
CREATE POLICY "Admins can upload product images" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'product-images' AND public.is_admin());
CREATE POLICY "Admins can update product images" ON storage.objects FOR UPDATE 
USING (bucket_id = 'product-images' AND public.is_admin());
CREATE POLICY "Admins can delete product images" ON storage.objects FOR DELETE 
USING (bucket_id = 'product-images' AND public.is_admin());

-- Storage policies for category images
CREATE POLICY "Anyone can view category images" ON storage.objects FOR SELECT 
USING (bucket_id = 'category-images');
CREATE POLICY "Admins can upload category images" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'category-images' AND public.is_admin());
CREATE POLICY "Admins can update category images" ON storage.objects FOR UPDATE 
USING (bucket_id = 'category-images' AND public.is_admin());
CREATE POLICY "Admins can delete category images" ON storage.objects FOR DELETE 
USING (bucket_id = 'category-images' AND public.is_admin());

-- Storage policies for coupon images
CREATE POLICY "Anyone can view coupon images" ON storage.objects FOR SELECT 
USING (bucket_id = 'coupon-images');
CREATE POLICY "Admins can upload coupon images" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'coupon-images' AND public.is_admin());
CREATE POLICY "Admins can update coupon images" ON storage.objects FOR UPDATE 
USING (bucket_id = 'coupon-images' AND public.is_admin());
CREATE POLICY "Admins can delete coupon images" ON storage.objects FOR DELETE 
USING (bucket_id = 'coupon-images' AND public.is_admin());

-- =====================================================
-- INITIAL DATA FOR BULKBUYSTORE
-- =====================================================

-- Insert default categories for clothing store
INSERT INTO public.categories (id, name, description, image_url, is_active) VALUES
  (gen_random_uuid(), 'Sarees', 'Elegant heritage sarees in silk, georgette, and chiffon.', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800', true),
  (gen_random_uuid(), 'Lehengas', 'Bridal and party wear lehengas detailed with intricate embroidery.', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800', true),
  (gen_random_uuid(), 'Gowns', 'Contemporary evening gowns for special occasions.', 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800', true),
  (gen_random_uuid(), 'Suits', 'Classic and modern suits including Anarkalis and Shararas.', 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800', true),
  (gen_random_uuid(), 'Kurtas', 'Everyday and festive kurtas in premium fabrics.', 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800', true),
  (gen_random_uuid(), 'Bridal', 'Exclusive bridal collection for your special day.', 'https://images.unsplash.com/photo-1549439602-43ebca2327af?w=800', true),
  (gen_random_uuid(), 'Contemporary', 'Fusion wear blending traditional aesthetics with modern cuts.', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800', true)
ON CONFLICT (name) DO NOTHING;

-- Insert default features for clothing
INSERT INTO public.product_features (name, description, is_active) VALUES
  ('Hand Embroidered', 'Intricate hand embroidery work', true),
  ('Pure Silk', 'Made from 100% pure silk', true),
  ('Custom Fit Available', 'Tailoring services available for this item', true),
  ('Designer Collection', 'Exclusive designer wear', true),
  ('Ready to Ship', 'Available for immediate dispatch', true),
  ('Sustainable Fabric', 'Eco-friendly materials', true),
  ('Handwoven', 'Traditional handloom weaving', true),
  ('Zari Work', 'Premium gold/silver thread work', true),
  ('New Arrival', 'Latest collection', true),
  ('Best Seller', 'Most popular items', true)
ON CONFLICT (name) DO NOTHING;

-- Insert sample products: Sarees
INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, available_sizes, is_tailored_available, images, product_specs, care_instructions) 
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
  ARRAY['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800'],
  '{"fabric": "Pure Banarasi Silk", "pattern": "Floral Zari Butta", "saree_length": "5.5 meters", "blouse_length": "0.8 meters", "origin": "Varanasi, India", "occasion": "Wedding, Festive"}'::jsonb,
  'Dry clean only. Store in a muslin cloth. Avoid direct contact with perfume sprays.'
FROM public.categories c WHERE c.name = 'Sarees'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, available_sizes, is_tailored_available, images, product_specs, care_instructions) 
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
  ARRAY['https://images.unsplash.com/photo-1610030469665-2766329437bb?w=800'],
  '{"fabric": "Premium Georgette", "pattern": "Sequins Embroidery", "saree_length": "5.5 meters", "blouse_length": "0.8 meters", "work": "Scalloped Border"}'::jsonb,
  'Dry clean recommended. Iron on low heat on reverse side.'
FROM public.categories c WHERE c.name = 'Sarees'
ON CONFLICT (sku) DO NOTHING;

-- Insert sample products: Lehengas
INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, available_sizes, is_tailored_available, images, product_specs, care_instructions) 
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
  ARRAY['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800', 'https://images.unsplash.com/photo-1588117260148-44755104a37f?w=800'],
  '{"fabric": "Italian Velvet", "work": "Zardosi, Stone, Sequins", "dupatta": "Net with Velvet Border", "type": "Bridal Wear", "flare": "4.5 meters"}'::jsonb,
  'Professional dry clean only. Store in a garment bag. Do not fold heavily embroidered areas.'
FROM public.categories c WHERE c.name = 'Lehengas'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, available_sizes, is_tailored_available, images, product_specs, care_instructions) 
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
  ARRAY['https://images.unsplash.com/photo-1516766436979-bf7aeb7e7389?w=800'],
  '{"fabric": "Raw Silk", "print": "Digital Floral", "embellishment": "Pearl Handwork", "occasion": "Mehendi, Sangeet"}'::jsonb,
  'Dry clean only. Steam iron recommended.'
FROM public.categories c WHERE c.name = 'Lehengas'
ON CONFLICT (sku) DO NOTHING;

-- Insert sample products: Gowns
INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, available_sizes, is_tailored_available, images, product_specs, care_instructions) 
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
  ARRAY['https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800'],
  '{"fabric": "Net with Satin Lining", "work": "Full Sequin", "style": "Evening Gown", "neckline": "Plunging V"}'::jsonb,
  'Dry clean only. Handle with care explicitly for sequins.'
FROM public.categories c WHERE c.name = 'Gowns'
ON CONFLICT (sku) DO NOTHING;

-- Insert sample products: Suits
INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, available_sizes, is_tailored_available, images, product_specs, care_instructions) 
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
  ARRAY['https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800'],
  '{"fabric": "Chanderi Silk", "work": "Chikankari", "type": "Anarkali Suit", "includes": "Top, Bottom, Dupatta"}'::jsonb,
  'Dry clean recommended to maintain fabric luster.'
FROM public.categories c WHERE c.name = 'Suits'
ON CONFLICT (sku) DO NOTHING;

-- Insert sample products: Contemporary
INSERT INTO public.products (name, description, price, original_price, weight, category_id, features, is_bestseller, new_arrival, stock_quantity, sku, available_sizes, is_tailored_available, images, product_specs, care_instructions) 
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
  ARRAY['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800'],
  '{"fabric": "Satin Silk", "style": "Indo-Western Fusion", "components": "Crop Top, Dhoti Pants", "sleeve_type": "Cape Sleeves"}'::jsonb,
  'Dry clean only. Iron on low heat.'
FROM public.categories c WHERE c.name = 'Contemporary'
ON CONFLICT (sku) DO NOTHING;

-- =====================================================
-- INITIAL SETTINGS DATA
-- =====================================================

-- Insert comprehensive default settings
INSERT INTO public.settings (key, value, description, category, is_public) VALUES
  -- General Store Settings
  ('store_name', '"paridhan haat"', 'Store name displayed to customers', 'general', true),
  ('store_description', '"Premium ethnic wear and designer clothing for every occasion"', 'Store description', 'general', true),
  ('store_email', '"contact@daretodiet.fit"', 'Store contact email', 'general', true),
  ('store_phone', '"+91 9996616153"', 'Store contact phone', 'general', true),
  ('store_address', '"Shop number 5, Patel Nagar, Hansi road, Patiala chowk, JIND (Haryana) 126102, Near police station"', 'Store address', 'general', true),
  ('store_logo', '"https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200"', 'Store logo URL', 'general', true),
  
  -- Business Settings
  ('currency', '"INR"', 'Default currency', 'business', true),
  ('currency_symbol', '"₹"', 'Currency symbol', 'business', true),
  ('tax_rate', '18', 'Tax rate percentage (GST)', 'business', true),
  ('delivery_charge', '50', 'Standard delivery charge in rupees', 'business', true),
  ('free_delivery_threshold', '1000', 'Minimum order amount for free delivery', 'business', true),
  ('cod_charge', '25', 'Cash on Delivery charge', 'business', true),
  ('cod_threshold', '2000', 'Maximum order amount for COD', 'business', true),
  ('bulk_discount_threshold', '5000', 'Minimum order for bulk discount', 'business', true),
  ('bulk_discount_percentage', '5', 'Bulk discount percentage', 'business', true),
  ('min_order_amount', '200', 'Minimum order amount', 'business', true),
  ('max_order_amount', '50000', 'Maximum order amount', 'business', true),
  
  -- Operational Settings
  ('business_hours_start', '"09:00"', 'Business hours start time', 'operations', false),
  ('business_hours_end', '"21:00"', 'Business hours end time', 'operations', false),
  ('delivery_slots', '["09:00-12:00", "12:00-15:00", "15:00-18:00", "18:00-21:00"]', 'Available delivery time slots', 'operations', false),
  ('order_processing_time', '2', 'Order processing time in hours', 'operations', false),
  ('delivery_time_estimate', '24', 'Estimated delivery time in hours', 'operations', true),
  ('low_stock_threshold', '10', 'Low stock alert threshold', 'operations', false),
  ('auto_approve_orders', 'false', 'Automatically approve orders', 'operations', false),
  
  -- Display Settings
  ('products_per_page', '12', 'Products displayed per page', 'display', false),
  ('featured_products_count', '8', 'Number of featured products on homepage', 'display', false),
  ('bestsellers_count', '6', 'Number of bestsellers to display', 'display', false),
  ('related_products_count', '4', 'Number of related products to show', 'display', false),
  ('enable_reviews', 'true', 'Enable product reviews', 'display', true),
  ('enable_ratings', 'true', 'Enable product ratings', 'display', true),
  ('enable_wishlist', 'true', 'Enable wishlist functionality', 'display', true),
  
  -- Notification Settings
  ('email_notifications', 'true', 'Enable email notifications', 'notifications', false),
  ('sms_notifications', 'false', 'Enable SMS notifications', 'notifications', false),
  ('order_notifications', 'true', 'Enable order notifications to admin', 'notifications', false),
  ('low_stock_alerts', 'true', 'Enable low stock alerts', 'notifications', false),
  ('customer_notifications', 'true', 'Enable customer notifications', 'notifications', false),
  ('payment_notifications', 'true', 'Enable payment notifications', 'notifications', false),
  ('delivery_notifications', 'true', 'Enable delivery notifications', 'notifications', false),
  
  -- Security Settings
  ('session_timeout', '30', 'Session timeout in minutes', 'security', false),
  ('max_login_attempts', '5', 'Maximum login attempts before lockout', 'security', false),
  ('password_min_length', '8', 'Minimum password length', 'security', false),
  ('require_email_verification', 'true', 'Require email verification for new accounts', 'security', false),
  ('enable_two_factor', 'false', 'Enable two-factor authentication', 'security', false),
  
  -- Payment Settings
  ('razorpay_enabled', 'true', 'Enable Razorpay payments', 'payment', false),
  ('cod_enabled', 'true', 'Enable Cash on Delivery', 'payment', true),
  ('wallet_enabled', 'false', 'Enable wallet payments', 'payment', false),
  ('upi_enabled', 'true', 'Enable UPI payments', 'payment', true),
  ('card_enabled', 'true', 'Enable card payments', 'payment', true),
  ('netbanking_enabled', 'true', 'Enable net banking', 'payment', true),
  
  -- SEO Settings
  ('site_title', '"paridhan haat - Premium Ethnic Wear"', 'Site title for SEO', 'seo', true),
  ('site_description', '"Shop the finest collection of Sarees, Lehengas, and Suits. Premium quality designer wear."', 'Site meta description', 'seo', true),
  ('site_keywords', '"sarees, lehengas, bridal wear, ethnic fashion, designer suits, indian clothing"', 'Site meta keywords', 'seo', true),
  
  -- Social Media
  ('facebook_url', '""', 'Facebook page URL', 'social', true),
  ('instagram_url', '""', 'Instagram profile URL', 'social', true),
  ('twitter_url', '""', 'Twitter profile URL', 'social', true),
  ('linkedin_url', '""', 'LinkedIn profile URL', 'social', true),
  ('whatsapp_number', '"+91 9996616153"', 'WhatsApp business number', 'social', true)
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- DATA MIGRATION AND CLEANUP
-- =====================================================

-- Update existing products to convert old features format to new format
-- This will convert the old boolean-based features to the new array format
UPDATE public.products 
SET features = (
  SELECT jsonb_agg(feature_name)
  FROM (
    SELECT 
      CASE 
        WHEN key = 'humanlyRaised' AND value::boolean = true THEN 'Humanly Raised'
        WHEN key = 'handSelected' AND value::boolean = true THEN 'Hand Selected'
        WHEN key = 'temperatureControlled' AND value::boolean = true THEN 'Temperature Controlled'
        WHEN key = 'artisanalCut' AND value::boolean = true THEN 'Artisanal Cut'
        WHEN key = 'hygienicallyVacuumPacked' AND value::boolean = true THEN 'Hygienically Packed'
        WHEN key = 'netWeightOfPreppedMeat' AND value::boolean = true THEN 'Net Weight Prepped'
        WHEN key = 'qualityAndFoodsafetyChecks' AND value::boolean = true THEN 'Quality Certified'
        WHEN key = 'mixOfOffalOrgans' AND value::boolean = true THEN 'Mixed Organs'
        WHEN key = 'antibioticResidueFree' AND value::boolean = true THEN 'Antibiotic Free'
        WHEN key = 'bulk_pack' AND value::boolean = true THEN 'Bulk Pack'
        WHEN key = 'wholesale_price' AND value::boolean = true THEN 'Wholesale Price'
        WHEN key = 'restaurant_grade' AND value::boolean = true THEN 'Restaurant Grade'
        WHEN key = 'commercial_grade' AND value::boolean = true THEN 'Commercial Grade'
        WHEN key = 'long_shelf_life' AND value::boolean = true THEN 'Long Shelf Life'
        WHEN key = 'energy_efficient' AND value::boolean = true THEN 'Energy Efficient'
        WHEN key = 'long_lasting' AND value::boolean = true THEN 'Long Lasting'
        WHEN key = 'bulk_discount' AND value::boolean = true THEN 'Bulk Discount Available'
        ELSE NULL
      END as feature_name
    FROM jsonb_each(products.features)
    WHERE jsonb_typeof(products.features) = 'object'
  ) converted_features
  WHERE feature_name IS NOT NULL
)
WHERE jsonb_typeof(features) = 'object' AND features != 'null'::jsonb;

-- Set empty array for products with null or empty features
UPDATE public.products 
SET features = '[]'::jsonb
WHERE features IS NULL OR features = 'null'::jsonb OR features = '{}'::jsonb;

-- =====================================================
-- INVOICE GENERATION FUNCTIONS
-- =====================================================

-- Function to generate invoice data for orders
CREATE OR REPLACE FUNCTION public.generate_invoice_data(order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  order_record RECORD;
  invoice_data JSONB;
  store_settings JSONB;
  item_details JSONB;
BEGIN
  -- Get order details
  SELECT * INTO order_record FROM public.orders WHERE id = order_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
  
  -- Get store settings for invoice
  SELECT jsonb_object_agg(key, value) INTO store_settings
  FROM public.settings 
  WHERE key IN ('store_name', 'store_address', 'store_phone', 'store_email', 'currency_symbol');
  
  -- Build invoice data
  invoice_data := jsonb_build_object(
    'invoice_number', 'INV-' || order_record.order_number,
    'order_number', order_record.order_number,
    'invoice_date', to_char(order_record.created_at, 'DD/MM/YYYY'),
    'due_date', to_char(order_record.created_at + interval '30 days', 'DD/MM/YYYY'),
    'order_date', to_char(order_record.created_at, 'DD/MM/YYYY HH24:MI'),
    'store_info', store_settings,
    'customer_info', order_record.customer_info,
    'delivery_address', order_record.address_details,
    'items', order_record.items,
    'pricing', jsonb_build_object(
      'subtotal', order_record.subtotal,
      'tax', order_record.tax,
      'delivery_fee', order_record.delivery_fee,
      'cod_fee', order_record.cod_fee,
      'discount', order_record.discount,
      'total', order_record.total
    ),
    'payment_info', jsonb_build_object(
      'method', order_record.payment_method,
      'status', order_record.payment_status,
      'razorpay_payment_id', order_record.razorpay_payment_id
    ),
    'order_status', order_record.order_status,
    'coupon_code', order_record.coupon_code,
    'special_instructions', order_record.special_instructions
  );
  
  RETURN invoice_data;
END;
$$;

-- Function to get invoice template settings
CREATE OR REPLACE FUNCTION public.get_invoice_template_settings()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  template_settings JSONB;
BEGIN
  SELECT jsonb_object_agg(key, value) INTO template_settings
  FROM public.settings 
  WHERE key IN (
    'store_name', 'store_address', 'store_phone', 'store_email', 'store_logo',
    'currency_symbol', 'tax_rate', 'invoice_terms', 'invoice_footer'
  );
  
  -- Add default values if not set
  template_settings := template_settings || jsonb_build_object(
    'invoice_terms', COALESCE(template_settings->>'invoice_terms', 'Payment is due within 30 days of invoice date.'),
    'invoice_footer', COALESCE(template_settings->>'invoice_footer', 'Thank you for your business!')
  );
  
  RETURN template_settings;
END;
$$;

-- Function to get app settings for frontend
CREATE OR REPLACE FUNCTION public.get_app_settings()
RETURNS TABLE(key TEXT, value JSONB)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.key, s.value 
  FROM public.settings s
  WHERE s.key IN (
    'tax_rate',
    'delivery_charge',
    'free_delivery_threshold',
    'cod_charge',
    'cod_threshold',
    'min_order_amount',
    'max_order_amount',
    'bulk_discount_threshold',
    'bulk_discount_percentage',
    'currency_symbol',
    'cod_enabled',
    'razorpay_enabled',
    'upi_enabled',
    'card_enabled',
    'netbanking_enabled',
    'store_name',
    'store_phone',
    'store_email',
    'store_address'
  );
$$;

-- =====================================================
-- ADDITIONAL SETTINGS FOR INVOICE
-- =====================================================

-- Insert invoice-related settings
INSERT INTO public.settings (key, value, description, category, is_public) VALUES
  ('invoice_terms', '"Payment is due within 30 days of invoice date. Late payments may incur additional charges."', 'Invoice payment terms', 'invoice', false),
  ('invoice_footer', '"Thank you for choosing Dare To Diet! For any queries, contact us at contact@daretodiet.fit"', 'Invoice footer text', 'invoice', false),
  ('invoice_logo', '"https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200"', 'Invoice logo URL', 'invoice', false),
  ('company_registration', '"CIN: U12345MH2024PTC123456"', 'Company registration details', 'invoice', false),
  ('gst_number', '"27ABCDE1234F1Z5"', 'GST registration number', 'invoice', false),
  ('bank_details', '{"bank_name": "State Bank of India", "account_number": "1234567890", "ifsc": "SBIN0001234", "branch": "Mumbai Main Branch"}'::jsonb, 'Bank account details for invoice', 'invoice', false)
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- ADDITIONAL INDEXES AND OPTIMIZATIONS
-- =====================================================

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON public.orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_payment_id ON public.orders(razorpay_payment_id) WHERE razorpay_payment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_coupon_code ON public.orders(coupon_code) WHERE coupon_code IS NOT NULL;

-- Add composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON public.orders(user_id, order_status);
CREATE INDEX IF NOT EXISTS idx_orders_date_status ON public.orders(created_at DESC, order_status);
CREATE INDEX IF NOT EXISTS idx_products_category_active ON public.products(category_id, is_active) WHERE is_active = true;

-- =====================================================
-- ADDITIONAL TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update order status history
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Log status changes in activity_logs
  IF OLD.order_status != NEW.order_status OR OLD.payment_status != NEW.payment_status THEN
    INSERT INTO public.activity_logs (
      user_id,
      action,
      entity_type,
      entity_id,
      old_values,
      new_values
    ) VALUES (
      auth.uid(),
      'status_update',
      'order',
      NEW.id,
      jsonb_build_object(
        'order_status', OLD.order_status,
        'payment_status', OLD.payment_status
      ),
      jsonb_build_object(
        'order_status', NEW.order_status,
        'payment_status', NEW.payment_status
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for order status logging
CREATE TRIGGER log_order_status_changes
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.log_order_status_change();

-- Function to validate order data
CREATE OR REPLACE FUNCTION public.validate_order_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate required fields
  IF NEW.customer_info IS NULL OR NEW.customer_info = '{}'::jsonb THEN
    RAISE EXCEPTION 'Customer information is required';
  END IF;
  
  IF NEW.items IS NULL OR jsonb_array_length(NEW.items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item';
  END IF;
  
  IF NEW.total <= 0 THEN
    RAISE EXCEPTION 'Order total must be greater than zero';
  END IF;
  
  -- Validate payment method
  IF NEW.payment_method NOT IN ('cod', 'online', 'wallet', 'bank_transfer') THEN
    RAISE EXCEPTION 'Invalid payment method';
  END IF;
  
  -- Validate order status
  IF NEW.order_status NOT IN ('placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') THEN
    RAISE EXCEPTION 'Invalid order status';
  END IF;
  
  -- Validate payment status
  IF NEW.payment_status NOT IN ('pending', 'paid', 'failed', 'refunded', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid payment status';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for order validation
CREATE TRIGGER validate_order_before_insert
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_order_data();

CREATE TRIGGER validate_order_before_update
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_order_data();

-- =====================================================
-- ADDITIONAL RLS POLICIES
-- =====================================================

-- Policy for invoice generation (admin only)
CREATE POLICY "invoice_generation_admin_only" ON public.orders FOR SELECT
USING (public.is_admin() AND id IS NOT NULL);

-- =====================================================
-- VIEWS FOR REPORTING
-- =====================================================

-- Create view for order analytics
CREATE OR REPLACE VIEW public.order_analytics AS
SELECT 
  DATE_TRUNC('day', created_at) as order_date,
  COUNT(*) as total_orders,
  SUM(total) as total_revenue,
  AVG(total) as average_order_value,
  COUNT(CASE WHEN payment_method = 'cod' THEN 1 END) as cod_orders,
  COUNT(CASE WHEN payment_method = 'online' THEN 1 END) as online_orders,
  COUNT(CASE WHEN order_status = 'delivered' THEN 1 END) as delivered_orders,
  COUNT(CASE WHEN order_status = 'cancelled' THEN 1 END) as cancelled_orders
FROM public.orders
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY order_date DESC;

-- Create view for product performance
CREATE OR REPLACE VIEW public.product_performance AS
SELECT 
  p.id,
  p.name,
  p.category_id,
  c.name as category_name,
  COALESCE(SUM(ps.quantity_sold), 0) as total_sold,
  COALESCE(SUM(ps.total_revenue), 0) as total_revenue,
  p.stock_quantity,
  p.is_bestseller,
  p.is_active
FROM public.products p
LEFT JOIN public.categories c ON p.category_id = c.id
LEFT JOIN public.product_sales ps ON p.id = ps.product_id
GROUP BY p.id, p.name, p.category_id, c.name, p.stock_quantity, p.is_bestseller, p.is_active
ORDER BY total_revenue DESC;

-- =====================================================
-- FINAL PERMISSIONS AND CLEANUP
-- =====================================================

-- Grant permissions on new functions
GRANT EXECUTE ON FUNCTION public.generate_invoice_data(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_invoice_template_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_app_settings() TO anon, authenticated;

-- Grant permissions on views
GRANT SELECT ON public.order_analytics TO authenticated;
GRANT SELECT ON public.product_performance TO authenticated;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Dare To Diet database schema has been successfully created
-- with all necessary tables, policies, functions, initial data,
-- invoice generation capabilities, and comprehensive analytics
-- =====================================================