-- Create widget_configurations table to persist user settings
CREATE TABLE public.widget_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_avatar TEXT,
  faq_enabled BOOLEAN NOT NULL DEFAULT true,
  contact_name TEXT NOT NULL DEFAULT 'Support',
  offer_help TEXT NOT NULL DEFAULT 'Write to us',
  widget_theme TEXT NOT NULL DEFAULT 'dark',
  widget_color TEXT NOT NULL DEFAULT 'blue',
  button_logo TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.widget_configurations ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own configuration" 
ON public.widget_configurations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own configuration" 
ON public.widget_configurations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own configuration" 
ON public.widget_configurations 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_widget_configurations_updated_at
BEFORE UPDATE ON public.widget_configurations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();