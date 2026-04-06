
-- Remove old insecure DELETE policy (the new ownership-scoped one remains)
DROP POLICY IF EXISTS "Users can delete their inspire videos" ON storage.objects;

-- Also remove old insecure INSERT policy if it still exists
DROP POLICY IF EXISTS "Users can upload inspire videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload inspire videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete inspire videos" ON storage.objects;
