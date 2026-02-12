
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS sender_phone text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS trx_id text;
