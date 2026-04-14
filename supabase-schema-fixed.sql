-- E-Commerce Database Schema for Supabase (PostgreSQL) - FIXED VERSION

-- Drop existing tables if they exist (for recreation)
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS products CASCADE;

-- Products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  image VARCHAR(500) NOT NULL,
  details TEXT[] DEFAULT '{}',
  category VARCHAR(100) DEFAULT 'uncategorized',
  sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sales table with all required columns
CREATE TABLE sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  banner_text VARCHAR(255) NOT NULL,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('site-wide', 'category', 'product-specific')),
  discount_value INTEGER NOT NULL CHECK (discount_value >= 0 AND discount_value <= 100),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  banner_image VARCHAR(500),
  background_color VARCHAR(7) DEFAULT '#000000',
  text_color VARCHAR(7) DEFAULT '#ffffff',
  show_countdown BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  applicable_categories TEXT[] DEFAULT '{}',
  applicable_products UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  stripe_session_id VARCHAR(255) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  items JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_sales_active_dates ON sales(is_active, start_date, end_date);
CREATE INDEX idx_sales_discount_type ON sales(discount_type);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_stripe_session ON orders(stripe_session_id);

-- Row Level Security (RLS) policies
-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policies for public read access
CREATE POLICY "Public products are viewable by everyone" ON products
  FOR SELECT USING (true);

CREATE POLICY "Public sales are viewable by everyone" ON sales
  FOR SELECT USING (true);

CREATE POLICY "Public orders are viewable by everyone" ON orders
  FOR SELECT USING (true);

-- Policies for inserts (you may want to restrict these in production)
CREATE POLICY "Enable insert for all users" ON products
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable insert for all users" ON sales
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable insert for all users" ON orders
  FOR INSERT WITH CHECK (true);

-- Policies for updates (you may want to restrict these in production)
CREATE POLICY "Enable update for all users" ON products
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON sales
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON orders
  FOR UPDATE USING (true) WITH CHECK (true);

-- Policies for deletes (you may want to restrict these in production)
CREATE POLICY "Enable delete for all users" ON products
  FOR DELETE USING (true);

CREATE POLICY "Enable delete for all users" ON sales
  FOR DELETE USING (true);

CREATE POLICY "Enable delete for all users" ON orders
  FOR DELETE USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at 
  BEFORE UPDATE ON sales 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON orders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO products (name, price, description, image, details, category) VALUES
('Essential Cotton T-Shirt', 35.00, 'Comfortable 100% cotton t-shirt perfect for everyday wear', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', ARRAY['100% Cotton', 'Machine washable', 'Available in multiple colors'], 'clothing'),
('Minimalist Hoodie', 65.00, 'Premium quality hoodie with minimalist design', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', ARRAY['80% Cotton, 20% Polyester', 'Kangaroo pocket', 'Adjustable hood'], 'clothing'),
('Classic Denim Jacket', 120.00, 'Timeless denim jacket with modern fit', 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', ARRAY['100% Denim', 'Button front', 'Multiple pockets'], 'clothing'),
('Wool Blend Coat', 195.00, 'Elegant wool blend coat for formal occasions', 'https://images.unsplash.com/photo-1539533018408-ea9a9ba39151?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', ARRAY['70% Wool, 30% Polyester', 'Full lining', 'Dry clean only'], 'clothing');
