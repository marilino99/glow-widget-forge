-- Add background_type column to widget_configurations table
ALTER TABLE public.widget_configurations 
ADD COLUMN background_type text NOT NULL DEFAULT 'gradient';