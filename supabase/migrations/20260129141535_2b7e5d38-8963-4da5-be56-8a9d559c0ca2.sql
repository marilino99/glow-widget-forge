-- Add missing columns to widget_configurations for typography settings
ALTER TABLE public.widget_configurations 
ADD COLUMN IF NOT EXISTS logo TEXT,
ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'en',
ADD COLUMN IF NOT EXISTS say_hello TEXT NOT NULL DEFAULT 'Hello, nice to see you here 👋';

-- Create product_cards table
CREATE TABLE public.product_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  product_url TEXT,
  image_url TEXT,
  price TEXT,
  old_price TEXT,
  promo_badge TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on product_cards
ALTER TABLE public.product_cards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for product_cards
CREATE POLICY "Users can view their own product cards"
ON public.product_cards
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own product cards"
ON public.product_cards
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own product cards"
ON public.product_cards
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own product cards"
ON public.product_cards
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_product_cards_updated_at
BEFORE UPDATE ON public.product_cards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();