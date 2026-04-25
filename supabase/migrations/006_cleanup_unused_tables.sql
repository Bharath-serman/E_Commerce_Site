-- Remove unused tables from database
-- WARNING: These are destructive operations

-- Drop verification table (email verification feature removed)
DROP TABLE IF EXISTS verification CASCADE;

-- Drop users table (leftover from previous auth system, not used in code)
-- Note: Keep 'user' table (Better Auth uses this)
DROP TABLE IF EXISTS users CASCADE;

-- Drop account table (not using OAuth/Google sign-in)
DROP TABLE IF EXISTS account CASCADE;

-- Note: Keep these tables as they are actively used:
-- - user (Better Auth authentication)
-- - session (Better Auth sessions)
-- - admin_users (Admin login system)
-- - support_requests (Contact form)
-- - product_variants (Clothing sizes)
-- - products, sales, orders, discounts, page_views (Core app tables)
