-- Add payment method and payment status fields to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'stripe' CHECK (payment_method IN ('stripe', 'upi')),
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed'));

-- Add index on payment_status for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
