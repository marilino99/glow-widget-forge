-- Fix warn finding: replace permissive widget_events INSERT policy
DROP POLICY IF EXISTS "Anyone can insert widget events" ON public.widget_events;

CREATE POLICY "Anyone can insert widget events"
ON public.widget_events
FOR INSERT
WITH CHECK (
  widget_id IS NOT NULL
  AND NULLIF(BTRIM(event_type), '') IS NOT NULL
  AND CHAR_LENGTH(event_type) <= 100
  AND (visitor_id IS NULL OR CHAR_LENGTH(visitor_id) <= 255)
  AND (page_url IS NULL OR CHAR_LENGTH(page_url) <= 2048)
);

-- Fix warn finding: allow users to read their own activity logs
DROP POLICY IF EXISTS "Users can view own logs" ON public.user_activity_logs;

CREATE POLICY "Users can view own logs"
ON public.user_activity_logs
FOR SELECT
USING (auth.uid() = user_id);