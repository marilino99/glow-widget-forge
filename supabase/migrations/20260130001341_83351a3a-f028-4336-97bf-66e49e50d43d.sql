-- Add instagram_enabled column to widget_configurations
ALTER TABLE public.widget_configurations 
ADD COLUMN instagram_enabled BOOLEAN NOT NULL DEFAULT false;