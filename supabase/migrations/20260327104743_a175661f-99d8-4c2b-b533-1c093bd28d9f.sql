
-- Add inspire_enabled to widget_configurations
ALTER TABLE public.widget_configurations ADD COLUMN IF NOT EXISTS inspire_enabled boolean NOT NULL DEFAULT false;

-- Create inspire_videos table
CREATE TABLE public.inspire_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  video_url text NOT NULL,
  thumbnail_url text,
  source text NOT NULL DEFAULT 'manual',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.inspire_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own inspire videos" ON public.inspire_videos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own inspire videos" ON public.inspire_videos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own inspire videos" ON public.inspire_videos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own inspire videos" ON public.inspire_videos FOR DELETE USING (auth.uid() = user_id);

-- Create inspire_video_products join table
CREATE TABLE public.inspire_video_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES public.inspire_videos(id) ON DELETE CASCADE,
  product_card_id uuid NOT NULL REFERENCES public.product_cards(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.inspire_video_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own video products" ON public.inspire_video_products FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.inspire_videos WHERE inspire_videos.id = inspire_video_products.video_id AND inspire_videos.user_id = auth.uid())
);
CREATE POLICY "Users can create their own video products" ON public.inspire_video_products FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.inspire_videos WHERE inspire_videos.id = inspire_video_products.video_id AND inspire_videos.user_id = auth.uid())
);
CREATE POLICY "Users can update their own video products" ON public.inspire_video_products FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.inspire_videos WHERE inspire_videos.id = inspire_video_products.video_id AND inspire_videos.user_id = auth.uid())
);
CREATE POLICY "Users can delete their own video products" ON public.inspire_video_products FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.inspire_videos WHERE inspire_videos.id = inspire_video_products.video_id AND inspire_videos.user_id = auth.uid())
);

-- Create storage bucket for inspire videos
INSERT INTO storage.buckets (id, name, public) VALUES ('inspire-videos', 'inspire-videos', true);

-- Storage RLS policies
CREATE POLICY "Users can upload inspire videos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'inspire-videos' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can view inspire videos" ON storage.objects FOR SELECT USING (bucket_id = 'inspire-videos');
CREATE POLICY "Users can delete their inspire videos" ON storage.objects FOR DELETE USING (bucket_id = 'inspire-videos' AND auth.uid() IS NOT NULL);

-- Add updated_at trigger for inspire_videos
CREATE TRIGGER update_inspire_videos_updated_at BEFORE UPDATE ON public.inspire_videos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
