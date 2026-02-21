-- Add Google Reviews data columns to widget_configurations
ALTER TABLE public.widget_configurations
  ADD COLUMN google_reviews_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN google_business_name text,
  ADD COLUMN google_business_rating numeric,
  ADD COLUMN google_business_ratings_total integer,
  ADD COLUMN google_business_url text,
  ADD COLUMN google_business_place_id text;