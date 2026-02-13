ALTER TABLE public.assignments ADD COLUMN total_marks integer NOT NULL DEFAULT 0;
ALTER TABLE public.assignments ADD COLUMN instructions text;
ALTER TABLE public.assignments ADD COLUMN status text NOT NULL DEFAULT 'published';