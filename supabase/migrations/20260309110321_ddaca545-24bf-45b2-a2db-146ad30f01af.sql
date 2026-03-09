
-- Create shopify_connections table
CREATE TABLE public.shopify_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  store_domain text NOT NULL,
  storefront_token text NOT NULL,
  last_synced_at timestamptz,
  product_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shopify_connections ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own shopify connection"
  ON public.shopify_connections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shopify connection"
  ON public.shopify_connections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shopify connection"
  ON public.shopify_connections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shopify connection"
  ON public.shopify_connections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER update_shopify_connections_updated_at
  BEFORE UPDATE ON public.shopify_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
