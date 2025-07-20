-- Add tracking and return functionality to orders table
ALTER TABLE public.orders 
ADD COLUMN tracking_number TEXT,
ADD COLUMN shipping_carrier TEXT,
ADD COLUMN tracking_url TEXT,
ADD COLUMN estimated_delivery DATE,
ADD COLUMN actual_delivery DATE,
ADD COLUMN return_status TEXT DEFAULT NULL CHECK (return_status IN ('none', 'requested', 'approved', 'rejected', 'returned', 'refunded')),
ADD COLUMN return_reason TEXT,
ADD COLUMN return_requested_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN return_processed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN refund_amount INTEGER,
ADD COLUMN return_notes TEXT;

-- Create order_tracking_updates table for tracking history
CREATE TABLE public.order_tracking_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL,
  status TEXT NOT NULL,
  location TEXT,
  description TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on order_tracking_updates
ALTER TABLE public.order_tracking_updates ENABLE ROW LEVEL SECURITY;

-- Create policies for order_tracking_updates
CREATE POLICY "Users can view tracking updates for their orders" 
ON public.order_tracking_updates 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.orders 
  WHERE orders.id = order_tracking_updates.order_id 
  AND orders.user_id = auth.uid()
));

CREATE POLICY "Edge functions can manage tracking updates" 
ON public.order_tracking_updates 
FOR ALL 
USING (true);

-- Add indexes for better performance
CREATE INDEX idx_orders_tracking_number ON public.orders(tracking_number);
CREATE INDEX idx_orders_return_status ON public.orders(return_status);
CREATE INDEX idx_order_tracking_updates_order_id ON public.order_tracking_updates(order_id);
CREATE INDEX idx_order_tracking_updates_timestamp ON public.order_tracking_updates(timestamp); 