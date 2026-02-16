
-- Create verification_codes table for custom OTP verification
CREATE TABLE public.verification_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- No direct client access - only edge functions with service_role key can read/write
-- This is intentional: verification codes are managed server-side only

-- Index for fast lookups
CREATE INDEX idx_verification_codes_email_code ON public.verification_codes (email, code);

-- Auto-cleanup old codes (optional: can be done via cron later)
CREATE INDEX idx_verification_codes_expires_at ON public.verification_codes (expires_at);
