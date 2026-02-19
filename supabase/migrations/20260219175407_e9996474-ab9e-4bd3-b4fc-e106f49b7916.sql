
ALTER TABLE public.widget_configurations ALTER COLUMN chatbot_enabled SET DEFAULT true;
UPDATE public.widget_configurations SET chatbot_enabled = true WHERE chatbot_enabled = false;
