-- 1. Fix widget_configurations: restrict write policies to authenticated role
DROP POLICY IF EXISTS "Users can create their own configuration" ON public.widget_configurations;
DROP POLICY IF EXISTS "Users can update their own configuration" ON public.widget_configurations;
DROP POLICY IF EXISTS "Users can delete their own configuration" ON public.widget_configurations;

CREATE POLICY "Users can create their own configuration"
ON public.widget_configurations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own configuration"
ON public.widget_configurations
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own configuration"
ON public.widget_configurations
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Also restrict SELECT to authenticated
DROP POLICY IF EXISTS "Users can view their own configuration" ON public.widget_configurations;
CREATE POLICY "Users can view their own configuration"
ON public.widget_configurations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. Add storage policies for bug-attachments bucket
CREATE POLICY "Users can upload bug attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'bug-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own bug attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'bug-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own bug attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'bug-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);