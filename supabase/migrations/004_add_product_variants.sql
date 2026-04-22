-- Add product_type field to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_type TEXT DEFAULT 'general' CHECK (product_type IN ('clothing', 'electronics', 'general'));

-- Add in_stock field to products table for non-clothing items
ALTER TABLE products ADD COLUMN IF NOT EXISTS in_stock BOOLEAN DEFAULT true;

-- Create product_variants table for clothing sizes and stock
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL CHECK (size IN ('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL')),
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, size)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_in_stock ON product_variants(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_product_type ON products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);

-- Update existing products to have default product_type
UPDATE products SET product_type = 'general' WHERE product_type IS NULL;
