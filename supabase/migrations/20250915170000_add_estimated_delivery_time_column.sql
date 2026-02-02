-- Add estimated_delivery_time column to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS estimated_delivery_time TEXT;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_orders_estimated_delivery_time ON public.orders(estimated_delivery_time);