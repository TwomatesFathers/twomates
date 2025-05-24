import { createClient } from '@supabase/supabase-js';

// Get these from your Supabase project settings
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  in_stock: boolean;
  featured: boolean;
  sizes?: string[];
  created_at?: string;
  // Printful specific fields
  printful_product_id?: string;
  printful_variant_id?: string;
  sku?: string;
  external_id?: string;
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
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  created_at?: string;
  items: OrderItem[];
  shipping_address: Address;
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
  user_id: string;
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export default supabase; 