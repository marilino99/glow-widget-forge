-- Create storage bucket for custom avatar uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('custom-avatars', 'custom-avatars', true);

-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'custom-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access
CREATE POLICY "Custom avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'custom-avatars');

-- Allow users to update their own avatars
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'custom-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'custom-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
