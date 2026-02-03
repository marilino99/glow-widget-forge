-- Create wix_installations table to track connected Wix sites
CREATE TABLE public.wix_installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  wix_instance_id TEXT UNIQUE NOT NULL,
  wix_site_id TEXT,
  wix_refresh_token TEXT NOT NULL,
  widget_config_id UUID REFERENCES widget_configurations(id) ON DELETE SET NULL,
  script_injected BOOLEAN DEFAULT false,
  installed_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.wix_installations ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own installations"
  ON public.wix_installations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own installations"
  ON public.wix_installations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own installations"
  ON public.wix_installations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role can insert (for webhook handling)
CREATE POLICY "Service role can insert installations"
  ON public.wix_installations FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update installations"
  ON public.wix_installations FOR UPDATE
  TO service_role
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_wix_installations_updated_at
  BEFORE UPDATE ON public.wix_installations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();