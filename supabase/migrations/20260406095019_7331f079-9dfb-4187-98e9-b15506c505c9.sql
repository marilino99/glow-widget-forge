
-- Fix 1: training_chunks - replace overly permissive INSERT policy
DROP POLICY IF EXISTS "Service role can insert chunks" ON public.training_chunks;

CREATE POLICY "Users can insert their own chunks"
ON public.training_chunks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Fix 2: inspire-videos storage - replace INSERT and DELETE policies with ownership checks
DROP POLICY IF EXISTS "Users can upload inspire videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete inspire videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload inspire videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete inspire videos" ON storage.objects;

CREATE POLICY "Users can upload their own inspire videos"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'inspire-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own inspire videos"
ON storage.objects FOR DELETE
TO public
USING (
  bucket_id = 'inspire-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
