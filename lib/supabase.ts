import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service role client for server-side operations (bypasses RLS)
// Only create this function to avoid client-side access to service role key
export function getSupabaseAdmin() {
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseServiceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Database types
export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          price: number;
          description: string;
          image: string;
          details: string[];
          category: string;
          sale_id?: string;
          product_type: 'clothing' | 'electronics' | 'general';
          in_stock: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          price: number;
          description: string;
          image: string;
          details?: string[];
          category?: string;
          sale_id?: string;
          product_type?: 'clothing' | 'electronics' | 'general';
          in_stock?: boolean;
        };
        Update: {
          name?: string;
          price?: number;
          description?: string;
          image?: string;
          details?: string[];
          category?: string;
          sale_id?: string;
          product_type?: 'clothing' | 'electronics' | 'general';
          in_stock?: boolean;
        };
      };
      sales: {
        Row: {
          id: string;
          title: string;
          description: string;
          banner_text: string;
          discount_type: 'site-wide' | 'category' | 'product-specific';
          discount_value: number;
          start_date: string;
          end_date: string;
          is_active: boolean;
          banner_image?: string;
          background_color?: string;
          text_color?: string;
          show_countdown: boolean;
          priority: number;
          applicable_categories?: string[];
          applicable_products?: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          title: string;
          description: string;
          banner_text: string;
          discount_type: 'site-wide' | 'category' | 'product-specific';
          discount_value: number;
          start_date: string;
          end_date: string;
          is_active?: boolean;
          banner_image?: string;
          background_color?: string;
          text_color?: string;
          show_countdown?: boolean;
          priority?: number;
          applicable_categories?: string[];
          applicable_products?: string[];
        };
        Update: {
          title?: string;
          description?: string;
          banner_text?: string;
          discount_type?: 'site-wide' | 'category' | 'product-specific';
          discount_value?: number;
          start_date?: string;
          end_date?: string;
          is_active?: boolean;
          banner_image?: string;
          background_color?: string;
          text_color?: string;
          show_countdown?: boolean;
          priority?: number;
          applicable_categories?: string[];
          applicable_products?: string[];
        };
      };
      orders: {
        Row: {
          id: string;
          customer_name: string;
          customer_email: string;
          stripe_session_id: string;
          total_amount: number;
          status: string;
          items: any[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          customer_name: string;
          customer_email: string;
          stripe_session_id: string;
          total_amount: number;
          status?: string;
          items: any[];
        };
        Update: {
          customer_name?: string;
          customer_email?: string;
          stripe_session_id?: string;
          total_amount?: number;
          status?: string;
          items?: any[];
        };
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';
          stock: number;
          in_stock: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          product_id: string;
          size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';
          stock?: number;
          in_stock?: boolean;
        };
        Update: {
          product_id?: string;
          size?: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';
          stock?: number;
          in_stock?: boolean;
        };
      };
      support_requests: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone?: string;
          subject: string;
          message: string;
          contact_method: 'email' | 'phone' | 'both';
          status: 'pending' | 'in-progress' | 'resolved';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          email: string;
          phone?: string;
          subject: string;
          message: string;
          contact_method: 'email' | 'phone' | 'both';
          status?: 'pending' | 'in-progress' | 'resolved';
        };
        Update: {
          name?: string;
          email?: string;
          phone?: string;
          subject?: string;
          message?: string;
          contact_method?: 'email' | 'phone' | 'both';
          status?: 'pending' | 'in-progress' | 'resolved';
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
