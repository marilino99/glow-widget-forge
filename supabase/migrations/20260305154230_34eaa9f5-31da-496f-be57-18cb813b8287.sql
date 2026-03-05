
-- Create storage bucket for training documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('training-documents', 'training-documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: users can upload to their own folder
CREATE POLICY "Users can upload training documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'training-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: users can read their own documents
CREATE POLICY "Users can read own training documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'training-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: users can delete their own documents
CREATE POLICY "Users can delete own training documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'training-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
