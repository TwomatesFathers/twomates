import { createClient } from '@supabase/supabase-js';

// Get these from your Supabase project settings
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export interface Product {
  id: number;
  name: string; // Clean base product name (e.g., "twomates")
  description: string;
  price: number; // Variant-specific price
  category: string;
  image_url: string;
  in_stock: boolean;
  featured: boolean;
  created_at?: string;
  
  // Printful specific fields
  printful_product_id: string; // Groups variants together (from sync_product.id)
  printful_variant_id: string; // Unique variant identifier (from sync_variant.id)
  sku: string;
  external_id: string;
  
  // Variant-specific fields
  size: string; // e.g., "S", "M", "L", "XL"
  color: string; // e.g., "Black", "White"
  availability_status: string; // e.g., "active", "discontinued"
  
  // Admin tracking fields
  admin_edited?: boolean;
  last_edited_by?: string;
  last_edited_at?: string;
  
  // UI helper fields (computed)
  base_product_name?: string; // Clean name without size (for grouping)
  available_sizes?: string[]; // All sizes for this product group (computed in queries)
}

export interface User {
  id: string;
  email: string;
  created_at?: string;
  full_name?: string;
  avatar_url?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    name?: string;
    picture?: string;
    email?: string;
    is_admin?: boolean | string;
    is_super_admin?: boolean | string;
  };
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: number;
  quantity: number;
  size: string;
  created_at?: string;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'payment_pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'failed';
  total: number;
  created_at?: string;
  items: OrderItem[];
  shipping_address: Address;
  paypal_order_id?: string;      // PayPal order ID
  payment_captured_at?: string;  // When payment was captured
  printful_order_id?: string;
  tracking_number?: string;
  tracking_url?: string;
  failure_reason?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: number;
  quantity: number;
  size: string;
  price: number;
  product?: Product;
}

export interface Address {
  id: string;
  user_id?: string;        // Nullable - for user profile addresses
  order_id?: string;       // Nullable - for order shipping addresses  
  type?: 'shipping' | 'billing' | 'user_default';  // Address type
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  postal_code: string;
  country: string;
  state?: string;          // For regions/provinces/states
  is_default?: boolean;    // For user's default address
}

export default supabase; 