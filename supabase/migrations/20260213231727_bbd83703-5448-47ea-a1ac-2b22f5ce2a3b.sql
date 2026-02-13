
-- Contact form leads
CREATE TABLE public.contact_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage contact_leads" ON public.contact_leads FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone insert contact_leads" ON public.contact_leads FOR INSERT WITH CHECK (true);

-- Newsletter subscribers
CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage newsletter" ON public.newsletter_subscribers FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone insert newsletter" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
