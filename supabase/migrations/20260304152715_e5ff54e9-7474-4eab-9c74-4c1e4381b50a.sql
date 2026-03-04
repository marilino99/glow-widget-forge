ALTER TABLE public.widget_configurations
ADD COLUMN ai_temperature numeric NOT NULL DEFAULT 0.5,
ADD COLUMN ai_tone text NOT NULL DEFAULT 'friendly';