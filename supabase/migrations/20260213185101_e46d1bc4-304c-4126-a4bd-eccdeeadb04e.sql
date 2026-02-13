
-- Add deleted_at column to orders for soft delete
ALTER TABLE public.orders ADD COLUMN deleted_at timestamp with time zone DEFAULT NULL;

-- Admin can update orders (approve, soft-delete)
CREATE POLICY "Admin update orders"
ON public.orders
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin can delete orders permanently
CREATE POLICY "Admin delete orders"
ON public.orders
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin can insert orders (manual order creation)
CREATE POLICY "Admin insert orders"
ON public.orders
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admin can insert enrollments (when approving orders)
CREATE POLICY "Admin insert enrollments"
ON public.enrollments
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
