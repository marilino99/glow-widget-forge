-- 1. Add missing DELETE policy on widget_configurations
CREATE POLICY "Users can delete their own configuration"
ON public.widget_configurations
FOR DELETE
USING (auth.uid() = user_id);

-- 2. Move vector extension from public to extensions schema
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION vector SET SCHEMA extensions;
