
-- Create checkout_attempts table for abandoned checkout tracking
CREATE TABLE public.checkout_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  course_slug TEXT,
  course_title TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_converted BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.checkout_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert checkout_attempts"
ON public.checkout_attempts FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admin read checkout_attempts"
ON public.checkout_attempts FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin update checkout_attempts"
ON public.checkout_attempts FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin delete checkout_attempts"
ON public.checkout_attempts FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add ip_address column to orders table
ALTER TABLE public.orders ADD COLUMN ip_address TEXT;
