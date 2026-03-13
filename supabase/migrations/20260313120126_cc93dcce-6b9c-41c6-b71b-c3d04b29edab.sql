
CREATE TABLE public.calendly_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  access_token text NOT NULL,
  refresh_token text,
  token_type text DEFAULT 'Bearer',
  expires_at timestamp with time zone,
  scheduling_url text,
  calendly_user_uri text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.calendly_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own calendly connection"
  ON public.calendly_connections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendly connection"
  ON public.calendly_connections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendly connection"
  ON public.calendly_connections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendly connection"
  ON public.calendly_connections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
