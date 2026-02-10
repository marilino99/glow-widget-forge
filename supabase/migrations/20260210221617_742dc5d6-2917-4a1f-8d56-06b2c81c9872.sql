
-- Create widget_events table for tracking widget interactions
CREATE TABLE public.widget_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  widget_id UUID NOT NULL REFERENCES public.widget_configurations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  visitor_id TEXT,
  page_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_widget_events_widget_id ON public.widget_events(widget_id);
CREATE INDEX idx_widget_events_created_at ON public.widget_events(created_at);
CREATE INDEX idx_widget_events_type ON public.widget_events(event_type);

-- Enable RLS
ALTER TABLE public.widget_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert events (widget runs on external sites without auth)
CREATE POLICY "Anyone can insert widget events"
ON public.widget_events
FOR INSERT
WITH CHECK (true);

-- Owners can read their own widget events
CREATE POLICY "Owners can view their widget events"
ON public.widget_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.widget_configurations
    WHERE widget_configurations.id = widget_events.widget_id
    AND widget_configurations.user_id = auth.uid()
  )
);
