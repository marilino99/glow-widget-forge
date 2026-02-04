-- Change default for faq_enabled to true for new users
ALTER TABLE public.widget_configurations 
ALTER COLUMN faq_enabled SET DEFAULT true;