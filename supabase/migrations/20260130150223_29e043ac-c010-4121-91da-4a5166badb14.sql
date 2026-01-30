-- Add website_url column to widget_configurations
ALTER TABLE public.widget_configurations 
ADD COLUMN website_url text DEFAULT NULL;