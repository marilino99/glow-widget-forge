
ALTER TABLE public.widget_configurations
ADD COLUMN IF NOT EXISTS ai_provider text NOT NULL DEFAULT 'google',
ADD COLUMN IF NOT EXISTS ai_api_key text;
