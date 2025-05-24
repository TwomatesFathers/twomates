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
    
    // Keep track of all printful variant IDs we process
    const processedVariantIds = new Set();
    
    // For each Printful product, get detailed information and create variant records
    for (const product of printfulProducts) {
      console.log(`Processing product: ${product.name} (ID: ${product.id})`);
      
      try {
        const detailedProduct = await getProduct(product.id);
        
        // The API returns sync_product and sync_variants separately
        const syncProduct = detailedProduct.sync_product || {};
        const syncVariants = detailedProduct.sync_variants || [];
        
        if (!syncVariants.length) {
          console.error(`No variants found for product ${product.id}`);
          continue;
        }
        
        // Get the clean base product name from sync_product
        const baseProductName = syncProduct.name || 'Untitled Product';
        console.log(`Base product name: ${baseProductName}`);
        
        // Process each variant as a separate product record
        for (const variant of syncVariants) {
          if (!variant || !variant.id) {
            console.error('Invalid variant data:', variant);
            continue;
          }
          
          // Track that we processed this variant
          processedVariantIds.add(variant.id.toString());
          
          // Get the best available image for this variant
          let imageUrl = '';
          
          // Try sync_product thumbnail first
          if (syncProduct.thumbnail_url) {
            imageUrl = syncProduct.thumbnail_url;
          }
          // Try variant's files
          else if (variant.files && variant.files.length > 0) {
            const previewFile = variant.files.find(file => file.type === 'preview') || 
                              variant.files[1] || 
                              variant.files[0];
            if (previewFile && previewFile.preview_url) {
              imageUrl = previewFile.preview_url;
            }
          }
          // Try variant product image as last resort
          else if (variant.product?.image) {
            imageUrl = variant.product.image;
          }
          
          // Prepare variant data with all required fields
          const variantData = {
            name: baseProductName, // Use clean base name, not variant name
            description: baseProductName,
            price: parseFloat(variant.retail_price || '0'),
            image_url: imageUrl,
            in_stock: variant.availability_status === 'active' && !variant.is_ignored,
            featured: false,
            category: 'printful',
            
            // Printful identifiers
            printful_product_id: syncProduct.id.toString(),
            printful_variant_id: variant.id.toString(),
            sku: variant.sku || '',
            external_id: variant.external_id || '',
            
            // Variant-specific details
            size: variant.size || 'One Size',
            color: variant.color || 'Default',
            availability_status: variant.availability_status || 'unknown'
          };
          
          console.log(`Variant: ${baseProductName} - ${variantData.size} (${variantData.color})`, {
            price: variantData.price,
            sku: variantData.sku,
            availability: variantData.availability_status,
            in_stock: variantData.in_stock
          });
          
          // Check if this variant already exists
          const { data: existingVariant, error: queryError } = await supabase
            .from('products')
            .select('id, name, printful_variant_id')
            .eq('printful_variant_id', variant.id.toString())
            .single();
          
          if (queryError && queryError.code !== 'PGRST116') {
            console.error('Error querying variant:', queryError);
            continue;
          }
          
          if (existingVariant) {
            // Update existing variant
            console.log(`Updating variant: ${baseProductName} - ${variantData.size}`);
            const { error: updateError } = await supabase
              .from('products')
              .update(variantData)
              .eq('id', existingVariant.id);
            
            if (updateError) {
              console.error('Error updating variant:', updateError);
            } else {
              console.log(`Successfully updated variant: ${variantData.size}`);
            }
          } else {
            // Create new variant
            console.log(`Creating new variant: ${baseProductName} - ${variantData.size}`);
            const { data: newVariant, error: insertError } = await supabase
              .from('products')
              .insert(variantData)
              .select('id')
              .single();
            
            if (insertError) {
              console.error('Error creating variant:', insertError);
            } else {
              console.log(`Successfully created variant: ${variantData.size} (ID: ${newVariant?.id})`);
            }
          }
        }
      } catch (error) {
        console.error(`Error processing product ${product.id}:`, error);
        // Continue with next product
      }
    }
    
    // Remove variants that are no longer in Printful
    console.log('Checking for variants to remove...');
    console.log('Processed variant IDs:', processedVariantIds.size);
    
    const { data: allDbVariants, error: fetchError } = await supabase
      .from('products')
      .select('id, name, printful_variant_id, size')
      .not('printful_variant_id', 'is', null);
    
    if (fetchError) {
      console.error('Error fetching existing variants:', fetchError);
    } else {
      console.log(`Found ${allDbVariants.length} variants in database`);
      
      const variantsToRemove = allDbVariants.filter(variant => {
        const shouldRemove = variant.printful_variant_id && !processedVariantIds.has(variant.printful_variant_id);
        if (shouldRemove) {
          console.log(`Variant "${variant.name} - ${variant.size}" (Printful Variant ID: ${variant.printful_variant_id}) not found in current Printful variants`);
        }
        return shouldRemove;
      });
      
      if (variantsToRemove.length > 0) {
        console.log(`Found ${variantsToRemove.length} variants to remove:`);
        for (const variant of variantsToRemove) {
          console.log(`- Removing variant: ${variant.name} - ${variant.size} (ID: ${variant.id})`);
          const { error: deleteError } = await supabase
            .from('products')
            .delete()
            .eq('id', variant.id);
          
          if (deleteError) {
            console.error(`Error removing variant ${variant.name} - ${variant.size}:`, deleteError);
          } else {
            console.log(`Successfully removed: ${variant.name} - ${variant.size}`);
          }
        }
      } else {
        console.log('No variants need to be removed');
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