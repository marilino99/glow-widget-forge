ALTER TABLE public.widget_configurations ADD COLUMN calendly_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE public.widget_configurations ADD COLUMN calendly_event_url text;