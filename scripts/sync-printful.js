import dotenv from 'dotenv';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Printful client
const printfulApiKey = process.env.VITE_PRINTFUL_API_KEY;
const printfulBaseUrl = 'https://api.printful.com';

// Headers for Printful API requests
const headers = {
  'Authorization': `Bearer ${printfulApiKey}`,
  'Content-Type': 'application/json'
};

// Get all products from Printful
async function getProducts() {
  try {
    const response = await axios.get(`${printfulBaseUrl}/store/products`, { headers });
    return response.data.result;
  } catch (error) {
    console.error('Error fetching Printful products:', error.message);
    throw error;
  }
}

// Get detailed product information
async function getProduct(productId) {
  try {
    const response = await axios.get(`${printfulBaseUrl}/store/products/${productId}`, { headers });
    return response.data.result;
  } catch (error) {
    console.error(`Error fetching Printful product ${productId}:`, error.message);
    throw error;
  }
}

// Sync Printful products with Supabase
async function syncPrintfulProducts() {
  try {
    console.log('Starting Printful product sync...');
    
    // Get all products from Printful
    const printfulProducts = await getProducts();
    console.log(`Found ${printfulProducts.length} products in Printful`);
    
    // For each Printful product, get detailed information including variants
    for (const product of printfulProducts) {
      console.log(`Processing product: ${product.name} (ID: ${product.id})`);
      
      try {
        const detailedProduct = await getProduct(product.id);
        console.log('Product details:', JSON.stringify(detailedProduct, null, 2).substring(0, 200) + '...');
        
        // The API returns sync_product and sync_variants separately
        const syncProduct = detailedProduct.sync_product || {};
        const syncVariants = detailedProduct.sync_variants || [];
        
        if (!syncVariants.length) {
          console.error(`No variants found for product ${product.id}`);
          continue;
        }
        
        // For each variant, create or update a product in Supabase
        for (const variant of syncVariants) {
          if (!variant || !variant.id) {
            console.error('Invalid variant data:', variant);
            continue;
          }
          
          // Prepare data for Supabase
          const productData = {
            name: variant.name || syncProduct.name || '',
            description: syncProduct.name || '',
            price: parseFloat(variant.retail_price || '0'),
            image_url: (variant.files && variant.files.length > 1 && variant.files[1].preview_url)
              ? variant.files[1].preview_url 
              : (syncProduct.thumbnail_url || ''),
            in_stock: variant.is_ignored === false,
            featured: false, // Set default value
            category: 'printful', // Set default category
            printful_product_id: syncProduct.id ? syncProduct.id.toString() : '',
            printful_variant_id: variant.id.toString(),
            sku: variant.sku || '',
            external_id: variant.external_id || ''
          };
          
          // Check if product already exists in Supabase by printful_variant_id
          const { data: existingProducts, error: queryError } = await supabase
            .from('products')
            .select('*')
            .eq('printful_variant_id', variant.id.toString())
            .single();
          
          if (queryError && queryError.code !== 'PGRST116') { // PGRST116 means no rows returned
            console.error('Error querying products:', queryError);
            
            // Try to insert the product directly (in case the table structure isn't ready yet)
            console.log(`Attempting direct insert for: ${productData.name}`);
            try {
              const { data, error: insertError } = await supabase
                .from('products')
                .insert({
                  name: productData.name,
                  description: productData.description,
                  price: productData.price,
                  image_url: productData.image_url,
                  in_stock: productData.in_stock,
                  featured: productData.featured,
                  category: productData.category,
                  // Skip the IDs if they're causing issues
                  sku: productData.sku,
                  external_id: productData.external_id
                })
                .select();
              
              if (insertError) {
                console.error('Direct insert error:', insertError);
              } else {
                console.log(`Successfully inserted basic product: ${productData.name}`);
              }
            } catch (err) {
              console.error('Exception during direct insert:', err);
            }
            continue;
          }
          
          // If product exists, update it, otherwise insert new product
          if (existingProducts) {
            console.log(`Updating existing product: ${productData.name}`);
            const { error: updateError } = await supabase
              .from('products')
              .update(productData)
              .eq('printful_variant_id', variant.id.toString());
            
            if (updateError) {
              console.error('Error updating product:', updateError);
            }
          } else {
            console.log(`Inserting new product: ${productData.name}`);
            const { error: insertError } = await supabase
              .from('products')
              .insert(productData);
            
            if (insertError) {
              console.error('Error inserting product:', insertError);
            } else {
              console.log(`Successfully inserted product: ${productData.name}`);
            }
          }
        }
      } catch (error) {
        console.error(`Error processing product ${product.id}:`, error);
        // Continue with next product
      }
    }
    
    console.log('Printful product sync completed successfully');
    return true;
  } catch (error) {
    console.error('Error syncing Printful products:', error);
    return false;
  }
}

// Run the sync function
syncPrintfulProducts()
  .then(() => {
    console.log('Sync process finished');
    process.exit(0);
  })
  .catch(error => {
    console.error('Sync process failed:', error);
    process.exit(1);
  }); 