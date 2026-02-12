INSERT INTO public.user_roles (user_id, role)
VALUES ('b1a438bf-8a83-4954-b195-cc9dec52e735', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;