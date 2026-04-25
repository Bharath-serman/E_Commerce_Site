-- Add all Razorpay-related columns to orders table in one migration
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS transaction_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_applied TEXT DEFAULT 'none';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS original_total NUMERIC DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discounted_total NUMERIC DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS error TEXT;

-- Make stripe_session_id nullable for Razorpay orders
ALTER TABLE orders ALTER COLUMN stripe_session_id DROP NOT NULL;
