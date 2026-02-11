
-- Fix 1: Restrict INSERT on chat tables (only service_role from edge functions should insert)
DROP POLICY IF EXISTS "Anyone can create conversations" ON public.conversations;
CREATE POLICY "Block direct conversation inserts"
  ON public.conversations FOR INSERT
  WITH CHECK (false);

DROP POLICY IF EXISTS "Anyone can insert messages" ON public.chat_messages;
CREATE POLICY "Block direct message inserts"
  ON public.chat_messages FOR INSERT
  WITH CHECK (false);

-- Fix 2: Make bug-attachments bucket private
UPDATE storage.buckets SET public = false WHERE id = 'bug-attachments';

-- Fix 3: Remove permissive storage policies and restrict to service_role only
DROP POLICY IF EXISTS "Anyone can upload bug attachments" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read bug attachments" ON storage.objects;
