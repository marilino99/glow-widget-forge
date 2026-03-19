
-- Instagram DM connections table
CREATE TABLE public.instagram_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  instagram_user_id text NOT NULL,
  instagram_username text,
  page_id text NOT NULL,
  page_access_token text NOT NULL,
  connected_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- RLS
ALTER TABLE public.instagram_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own instagram connection"
  ON public.instagram_connections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own instagram connection"
  ON public.instagram_connections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own instagram connection"
  ON public.instagram_connections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own instagram connection"
  ON public.instagram_connections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add instagram_dm_enabled to widget_configurations
ALTER TABLE public.widget_configurations 
  ADD COLUMN IF NOT EXISTS instagram_dm_enabled boolean NOT NULL DEFAULT false;

-- Updated_at trigger
CREATE TRIGGER update_instagram_connections_updated_at
  BEFORE UPDATE ON public.instagram_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
