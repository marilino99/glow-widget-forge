-- Add forward_email column to widget_configurations
ALTER TABLE public.widget_configurations 
ADD COLUMN IF NOT EXISTS forward_email TEXT;

-- Create storage bucket for bug report attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('bug-attachments', 'bug-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload to bug-attachments (visitors submitting reports)
CREATE POLICY "Anyone can upload bug attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'bug-attachments');

-- Allow anyone to read bug attachments
CREATE POLICY "Anyone can read bug attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'bug-attachments');