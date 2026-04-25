-- Add currency column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR';

-- Update existing orders to INR currency
UPDATE orders SET currency = 'INR' WHERE currency IS NULL OR currency = 'USD';
