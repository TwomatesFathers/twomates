import { supabase } from './supabase';

// Printful webhook types
interface PrintfulWebhookEvent {
  type: string;
  created: number;
  retries: number;
  store: number;
  data: any;
}

// Process webhook events from Printful
export async function handlePrintfulWebhook(event: PrintfulWebhookEvent) {
  try {
    console.log('Received Printful webhook event:', event.type);
    
    switch (event.type) {
      case 'package_shipped':
        // Handle package shipped event
        await handlePackageShipped(event.data);
        break;
        
      case 'order_failed':
        // Handle order failed event
        await handleOrderFailed(event.data);
        break;
        
      case 'order_created':
        // Handle order created in Printful
        await handleOrderCreated(event.data);
        break;
        
      case 'stock_updated':
        // Handle stock update event
        await handleStockUpdated(event.data);
        break;
        
      default:
        console.log('Unhandled webhook event type:', event.type);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error processing Printful webhook:', error);
    return { success: false, error: 'Failed to process webhook' };
  }
}

// Update order status when package is shipped
async function handlePackageShipped(data: any) {
  const { order } = data;
  
  // Find the order in our database using Printful's external_id
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', order.external_id)
    .single();
  
  if (orderError) {
    console.error('Error finding order:', orderError);
    return;
  }
  
  // Update the order status
  const { error: updateError } = await supabase
    .from('orders')
    .update({ 
      status: 'shipped',
      tracking_number: data.tracking_number,
      tracking_url: data.tracking_url
    })
    .eq('id', order.external_id);
  
  if (updateError) {
    console.error('Error updating order status:', updateError);
  }
}

// Update order status when order fails
async function handleOrderFailed(data: any) {
  const { order, reason } = data;
  
  // Find the order in our database using Printful's external_id
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', order.external_id)
    .single();
  
  if (orderError) {
    console.error('Error finding order:', orderError);
    return;
  }
  
  // Update the order status
  const { error: updateError } = await supabase
    .from('orders')
    .update({ 
      status: 'cancelled',
      failure_reason: reason
    })
    .eq('id', order.external_id);
  
  if (updateError) {
    console.error('Error updating order status:', updateError);
  }
}

// Handle when order is created in Printful
async function handleOrderCreated(data: any) {
  const { order } = data;
  
  // Find the order in our database using Printful's external_id
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', order.external_id)
    .single();
  
  if (orderError) {
    console.error('Error finding order:', orderError);
    return;
  }
  
  // Update the order with Printful's order ID
  const { error: updateError } = await supabase
    .from('orders')
    .update({ 
      printful_order_id: order.id,
      status: 'processing'
    })
    .eq('id', order.external_id);
  
  if (updateError) {
    console.error('Error updating order with Printful ID:', updateError);
  }
}

// Update product stock when inventory changes
async function handleStockUpdated(data: any) {
  const { sync_variant_id, quantity } = data;
  
  // Find the product in our database using Printful's sync_variant_id
  const { data: productData, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('printful_variant_id', sync_variant_id)
    .single();
  
  if (productError) {
    console.error('Error finding product:', productError);
    return;
  }
  
  // Update the product stock status
  const { error: updateError } = await supabase
    .from('products')
    .update({ 
      in_stock: quantity > 0
    })
    .eq('printful_variant_id', sync_variant_id);
  
  if (updateError) {
    console.error('Error updating product stock:', updateError);
  }
} 