# MongoDB to Supabase Migration Guide

## Overview
This guide helps migrate your e-commerce application from MongoDB to Supabase (PostgreSQL).

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install @supabase/supabase-js
```

### 2. Set Up Environment Variables
Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Create Database Schema
Run the SQL commands in `supabase-schema.sql` in your Supabase SQL editor.

### 4. Migration Complete
The application has been updated to use Supabase instead of MongoDB.

## 📁 Files Modified

### New Files Created:
- `lib/supabase.ts` - Supabase client configuration
- `lib/supabaseModels.ts` - Database service classes
- `lib/supabaseSaleDiscountService.ts` - Sales discount service using Supabase
- `supabase-schema.sql` - Database schema for Supabase
- `.env.local.example` - Environment variables template

### Files Updated:
- `app/api/products/route.ts` - Uses ProductService instead of MongoDB
- `app/api/sales/route.ts` - Uses SaleService instead of MongoDB
- `app/api/sale-discounts/route.ts` - Uses SupabaseSaleDiscountService
- `app/api/checkout/route.ts` - Uses SupabaseSaleDiscountService
- `app/(shop)/product/[id]/page.tsx` - Uses SupabaseSaleDiscountService
- `app/(shop)/page.tsx` - Uses SaleService instead of MongoDB
- `package.json` - Added @supabase/supabase-js dependency

## 🔧 Database Schema Changes

### Key Differences:
- `_id` → `id` (UUID)
- `createdAt` → `created_at` (TIMESTAMP)
- `updatedAt` → `updated_at` (TIMESTAMP)
- `discountType` → `discount_type` (snake_case)
- `discountValue` → `discount_value` (snake_case)
- Arrays stored as native PostgreSQL arrays

## 🎯 Benefits of Supabase

1. **Real-time subscriptions** - Built-in real-time capabilities
2. **Row Level Security** - Fine-grained access control
3. **Auto-generated APIs** - RESTful APIs automatically created
4. **PostgreSQL power** - More robust than MongoDB for e-commerce
5. **Built-in auth** - User authentication ready
6. **Edge functions** - Serverless computing capabilities

## ⚠️ Important Notes

### Type Errors
The TypeScript errors you see are expected because:
1. `@supabase/supabase-js` package needs to be installed
2. Environment variables need to be configured

### Data Migration
You'll need to migrate existing data from MongoDB to Supabase:
1. Export data from MongoDB
2. Transform data to match new schema
3. Import into Supabase using SQL or API

### Testing
After setup:
1. Install dependencies: `npm install`
2. Start development: `npm run dev`
3. Test all CRUD operations
4. Verify discount calculations work correctly

## 🔄 Rollback Plan

If you need to rollback:
1. Keep MongoDB files as backup
2. Restore original API routes
3. Update imports back to MongoDB models

## 📞 Support

For issues with:
- Supabase: Check Supabase documentation
- Schema: Use the provided SQL schema
- Application: Check console logs for detailed errors
