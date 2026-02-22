
-- Training sources table to store scraped page content, uploaded docs, etc.
CREATE TABLE public.training_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'url', -- 'url', 'document', 'faq'
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  url TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'scraped', 'failed'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.training_sources ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own training sources"
ON public.training_sources FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own training sources"
ON public.training_sources FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own training sources"
ON public.training_sources FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own training sources"
ON public.training_sources FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_training_sources_updated_at
BEFORE UPDATE ON public.training_sources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for fast lookups
CREATE INDEX idx_training_sources_user_id ON public.training_sources(user_id);
