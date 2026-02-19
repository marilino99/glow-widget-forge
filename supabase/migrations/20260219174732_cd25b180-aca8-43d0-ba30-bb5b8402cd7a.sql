
ALTER TABLE public.widget_configurations
ADD COLUMN chatbot_enabled boolean NOT NULL DEFAULT false,
ADD COLUMN chatbot_instructions text;
