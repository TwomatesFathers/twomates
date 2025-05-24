import axios from 'axios';
import { supabase } from './supabase';

// Printful API Types
export interface PrintfulProduct {
  id: number;
  external_id: string;
  name: string;
  variants: PrintfulVariant[];
  thumbnail_url: string;
  is_ignored: boolean;
}

export interface PrintfulVariant {
  id: number;
  external_id: string;
  sync_product_id: number;
  name: string;
  synced: boolean;
  variant_id: number;
  retail_price: string;
  sku: string;
  currency: string;
  product: {
    variant_id: number;
    product_id: number;
    image: string;
    name: string;
  };
  files: PrintfulFile[];
}

export interface PrintfulFile {
  id: number;
  type: string;
  hash: string;
  url: string;
  filename: string;
  mime_type: string;
  size: number;
  width: number;
  height: number;
  dpi: number | null;
  status: string;
  created: number;
  thumbnail_url: string;
  preview_url: string;
  visible: boolean;
}

export interface PrintfulOrder {
  id: number;
  external_id: string;
  store: number;
  status: string;
  shipping: string;
  created: number;
  updated: number;
  recipient: {
    name: string;
    company: string;
    address1: string;
    address2: string;
    city: string;
    state_code: string;
    state_name: string;
    country_code: string;
    country_name: string;
    zip: string;
    phone: string;
    email: string;
  };
  items: PrintfulOrderItem[];
  retail_costs: {
    currency: string;
    subtotal: string;
    discount: string;
    shipping: string;
    tax: string;
    total: string;
  };
}

export interface PrintfulOrderItem {
  id: number;
  external_id: string;
  variant_id: number;
  sync_variant_id: number;
  quantity: number;
  price: string;
  retail_price: string;
  name: string;
  product: {
    variant_id: number;
    product_id: number;
    image: string;
    name: string;
  };
}

// Create a Printful API client
class PrintfulClient {
  private apiKey: string;
  private baseUrl: string = 'https://api.printful.com';
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  // Get all store products
  async getProducts(): Promise<PrintfulProduct[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/store/products`, {
        headers: this.getHeaders()
      });
      return response.data.result;
    } catch (error) {
      console.error('Error fetching Printful products:', error);
      throw error;
    }
  }

  // Get a specific product with its variants
  async getProduct(productId: number): Promise<PrintfulProduct> {
    try {
      const response = await axios.get(`${this.baseUrl}/store/products/${productId}`, {
        headers: this.getHeaders()
      });
      return response.data.result;
    } catch (error) {
      console.error(`Error fetching Printful product ${productId}:`, error);
      throw error;
    }
  }

  // Create an order in Printful
  async createOrder(order: any): Promise<PrintfulOrder> {
    try {
      const response = await axios.post(`${this.baseUrl}/orders`, order, {
        headers: this.getHeaders()
      });
      return response.data.result;
    } catch (error) {
      console.error('Error creating Printful order:', error);
      throw error;
    }
  }

  // Get shipping rates for an order
  async getShippingRates(orderData: any): Promise<any> {
    try {
      const response = await axios.post(`${this.baseUrl}/shipping/rates`, orderData, {
        headers: this.getHeaders()
      });
      return response.data.result;
    } catch (error) {
      console.error('Error fetching shipping rates:', error);
      throw error;
    }
  }
}

// Initialize the Printful client with the API key from environment variables
const printfulApiKey = import.meta.env.VITE_PRINTFUL_API_KEY || '';
export const printful = new PrintfulClient(printfulApiKey);

// Function to sync Printful products with Supabase
export async function syncPrintfulProducts() {
  try {
    // Get all products from Printful
    const printfulProducts = await printful.getProducts();
    
    // For each Printful product, get detailed information including variants
    for (const product of printfulProducts) {
      const detailedProduct = await printful.getProduct(product.id);
      console.log(detailedProduct);
      
      // For each variant, create or update a product in Supabase
      for (const variant of detailedProduct.variants) {
        // Prepare data for Supabase
        const productData = {
          name: variant.name,
          description: detailedProduct.name,
          price: parseFloat(variant.retail_price),
          image_url: variant.product.image,
          in_stock: variant.synced,
          featured: false, // Set default value
          category: 'printful', // Set default category
          printful_product_id: detailedProduct.id,
          printful_variant_id: variant.id,
          sku: variant.sku,
          external_id: variant.external_id
        };
        
        // Check if product already exists in Supabase by printful_variant_id
        const { data: existingProducts, error: queryError } = await supabase
          .from('products')
          .select('*')
          .eq('printful_variant_id', variant.id)
          .single();
        
        if (queryError && queryError.code !== 'PGRST116') { // PGRST116 means no rows returned
          console.error('Error querying products:', queryError);
          continue;
        }
        
        // If product exists, update it, otherwise insert new product
        if (existingProducts) {
          const { error: updateError } = await supabase
            .from('products')
            .update(productData)
            .eq('printful_variant_id', variant.id);
          
          if (updateError) {
            console.error('Error updating product:', updateError);
          }
        } else {
          const { error: insertError } = await supabase
            .from('products')
            .insert(productData);
          
          if (insertError) {
            console.error('Error inserting product:', insertError);
          }
        }
      }
    }
    
    console.log('Printful product sync completed');
    return true;
  } catch (error) {
    console.error('Error syncing Printful products:', error);
    return false;
  }
}

export default printful; 