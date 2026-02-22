-- Fix verification_codes: deny all direct access (only edge functions with service role should access)
CREATE POLICY "Deny all select on verification_codes"
ON public.verification_codes
FOR SELECT
USING (false);

CREATE POLICY "Deny all insert on verification_codes"
ON public.verification_codes
FOR INSERT
WITH CHECK (false);

CREATE POLICY "Deny all update on verification_codes"
ON public.verification_codes
FOR UPDATE
USING (false);

CREATE POLICY "Deny all delete on verification_codes"
ON public.verification_codes
FOR DELETE
USING (false);