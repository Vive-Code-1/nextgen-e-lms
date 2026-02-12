
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage settings" ON public.site_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Anyone can read settings" ON public.site_settings
  FOR SELECT USING (true);

INSERT INTO public.site_settings (key, value) VALUES
  ('payment_methods', '{"uddoktapay": true, "stripe": true, "paypal": true, "cod": true, "bd_manual": true}'::jsonb),
  ('uddoktapay_base_url', '"https://digitaltechdude.paymently.io/api"'::jsonb);
