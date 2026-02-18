
-- Add visitor_token column to conversations for secure visitor identification
ALTER TABLE public.conversations ADD COLUMN visitor_token text;

-- Generate tokens for existing conversations
UPDATE public.conversations SET visitor_token = gen_random_uuid()::text WHERE visitor_token IS NULL;

-- Make it NOT NULL with a default for future rows
ALTER TABLE public.conversations ALTER COLUMN visitor_token SET NOT NULL;
ALTER TABLE public.conversations ALTER COLUMN visitor_token SET DEFAULT gen_random_uuid()::text;
