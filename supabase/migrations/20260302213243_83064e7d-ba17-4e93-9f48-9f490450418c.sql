
-- Add visitor metadata columns to conversations
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS browser text;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS system text;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS region text;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS city text;
