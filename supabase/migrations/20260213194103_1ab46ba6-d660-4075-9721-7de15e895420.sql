
-- Add new columns to courses table
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS level text NOT NULL DEFAULT 'beginner',
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'Bengali',
  ADD COLUMN IF NOT EXISTS max_students integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS short_description text,
  ADD COLUMN IF NOT EXISTS what_will_learn jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS requirements jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS is_free boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_discount boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS discount_price numeric,
  ADD COLUMN IF NOT EXISTS expiry_period text NOT NULL DEFAULT 'lifetime',
  ADD COLUMN IF NOT EXISTS expiry_months integer;

-- Add topic column to lessons table
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS topic text;

-- Create course_faqs table
CREATE TABLE IF NOT EXISTS public.course_faqs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on course_faqs
ALTER TABLE public.course_faqs ENABLE ROW LEVEL SECURITY;

-- Admin can CRUD course_faqs
CREATE POLICY "Admin manage course_faqs"
  ON public.course_faqs
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Public can read enabled FAQs
CREATE POLICY "Public read enabled faqs"
  ON public.course_faqs
  FOR SELECT
  USING (is_enabled = true);

-- Create course-thumbnails storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-thumbnails', 'course-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to course thumbnails
CREATE POLICY "Public read course thumbnails"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'course-thumbnails');

-- Allow admin upload course thumbnails
CREATE POLICY "Admin upload course thumbnails"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'course-thumbnails');

-- Allow admin update course thumbnails
CREATE POLICY "Admin update course thumbnails"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'course-thumbnails');

-- Allow admin delete course thumbnails
CREATE POLICY "Admin delete course thumbnails"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'course-thumbnails');
