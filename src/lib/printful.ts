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
    
    // Process each Printful product
    for (const product of printfulProducts) {
      const detailedProduct = await printful.getProduct(product.id);
      console.log(detailedProduct);
      
      // Create a base product first
      const baseProductData = {
        name: detailedProduct.name,
        description: detailedProduct.name,
        price: parseFloat(detailedProduct.variants[0]?.retail_price || '0'),
        image_url: detailedProduct.variants[0]?.product.image || '',
        in_stock: true,
        featured: false, // Set default value
        category: 'printful', // Set default category
        printful_product_id: detailedProduct.id.toString(),
        is_base_product: true,
        variant_name: 'Default',
      };
      
      // Check if base product already exists
      let baseProductId: number;
      const { data: existingBaseProduct, error: baseQueryError } = await supabase
        .from('products')
        .select('id')
        .eq('printful_product_id', detailedProduct.id.toString())
        .eq('is_base_product', true)
        .single();
      
      if (baseQueryError && baseQueryError.code !== 'PGRST116') { // PGRST116 means no rows returned
        console.error('Error querying base product:', baseQueryError);
        continue;
      }
      
      if (existingBaseProduct) {
        // Update existing base product
        baseProductId = existingBaseProduct.id;
        const { error: updateError } = await supabase
          .from('products')
          .update(baseProductData)
          .eq('id', baseProductId);
        
        if (updateError) {
          console.error('Error updating base product:', updateError);
          continue;
        }
      } else {
        // Insert new base product
        const { data: insertedBaseProduct, error: insertError } = await supabase
          .from('products')
          .insert(baseProductData)
          .select('id')
          .single();
        
        if (insertError || !insertedBaseProduct) {
          console.error('Error inserting base product:', insertError);
          continue;
        }
        
        baseProductId = insertedBaseProduct.id;
      }
      
      // Now process all variants and link them to the base product
      for (const variant of detailedProduct.variants) {
        // Extract size from variant name if possible
        const variantNameParts = variant.name.split(' - ');
        const variantName = variantNameParts.length > 1 ? variantNameParts[1] : variant.name;
        
        // Prepare variant data
        const variantData = {
          name: variant.name,
          description: detailedProduct.name,
          price: parseFloat(variant.retail_price),
          image_url: variant.product.image,
          in_stock: variant.synced,
          featured: false,
          category: baseProductData.category,
          printful_product_id: detailedProduct.id.toString(),
          printful_variant_id: variant.id.toString(),
          sku: variant.sku,
          external_id: variant.external_id,
          base_product_id: baseProductId,
          variant_name: variantName,
          is_base_product: false,
        };
        
        // Check if variant already exists
        const { data: existingVariant, error: variantQueryError } = await supabase
          .from('products')
          .select('*')
          .eq('printful_variant_id', variant.id.toString())
          .single();
        
        if (variantQueryError && variantQueryError.code !== 'PGRST116') {
          console.error('Error querying variant:', variantQueryError);
          continue;
        }
        
        if (existingVariant) {
          // Update existing variant
          const { error: updateError } = await supabase
            .from('products')
            .update(variantData)
            .eq('printful_variant_id', variant.id.toString());
          
          if (updateError) {
            console.error('Error updating variant:', updateError);
          }
        } else {
          // Insert new variant
          const { error: insertError } = await supabase
            .from('products')
            .insert(variantData);
          
          if (insertError) {
            console.error('Error inserting variant:', insertError);
          }
        }
      }
    }
    
    console.log('Printful product sync completed');
    return true;
  } catch (error) {
    console.log('Error syncing Printful products:', error);
    return false;
  }
}

export default printful; 