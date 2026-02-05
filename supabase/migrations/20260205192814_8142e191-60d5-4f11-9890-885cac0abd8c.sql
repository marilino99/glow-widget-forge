-- Add WhatsApp configuration fields to widget_configurations
ALTER TABLE public.widget_configurations 
ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS whatsapp_country_code TEXT DEFAULT '+39',
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;