
ALTER TABLE public.widget_configurations
ADD COLUMN custom_css text DEFAULT NULL,
ADD COLUMN custom_js text DEFAULT NULL;
