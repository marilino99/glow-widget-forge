
-- Create contacts table
CREATE TABLE public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE SET NULL,
  name text,
  email text NOT NULL,
  channel text DEFAULT 'chatbot',
  country text,
  language text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, email)
);

-- Enable RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Owner can read their contacts
CREATE POLICY "Users can view their own contacts"
  ON public.contacts FOR SELECT
  USING (auth.uid() = user_id);

-- Owner can delete their contacts
CREATE POLICY "Users can delete their own contacts"
  ON public.contacts FOR DELETE
  USING (auth.uid() = user_id);

-- Block direct inserts (only via edge functions)
CREATE POLICY "Block direct contact inserts"
  ON public.contacts FOR INSERT
  WITH CHECK (false);
