import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
        };
        Update: {
          name?: string;
          price?: number;
          description?: string;
          image?: string;
          details?: string[];
          category?: string;
          sale_id?: string;
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
