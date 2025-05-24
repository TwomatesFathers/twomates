import { printful } from './printful';
import { supabase, CartItem, Order, Address } from './supabase';

// Convert our cart items to Printful order format
export async function createPrintfulOrder(order: Order): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    // Verify all items have printful variant IDs
    const missingVariantIds = order.items.filter(item => {
      return !item.product?.printful_variant_id;
    });

    if (missingVariantIds.length > 0) {
      return {
        success: false,
        error: 'Some items in your cart are not Printful products'
      };
    }

    // Create the order data for Printful API
    const printfulOrderData = {
      external_id: order.id, // Use our order ID as external ID
      shipping: {
        name: order.shipping_address.full_name,
        address1: order.shipping_address.address_line1,
        address2: order.shipping_address.address_line2 || '',
        city: order.shipping_address.city,
        state_code: '', // Add state code if available
        country_code: order.shipping_address.country,
        zip: order.shipping_address.postal_code,
      },
      items: order.items.map(item => ({
        sync_variant_id: item.product?.printful_variant_id,
        quantity: item.quantity,
        retail_price: item.price.toString(),
        name: item.product?.name || '',
        external_id: item.id
      }))
    };

    // Create the order in Printful
    const printfulOrder = await printful.createOrder(printfulOrderData);

    // Update our order with Printful order ID
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        printful_order_id: printfulOrder.id.toString(),
        status: 'processing' 
      })
      .eq('id', order.id);

    if (updateError) {
      console.error('Error updating order with Printful ID:', updateError);
      return {
        success: true,
        orderId: printfulOrder.id.toString(),
        error: 'Order created in Printful but failed to update local order'
      };
    }

    return {
      success: true,
      orderId: printfulOrder.id.toString()
    };
  } catch (error) {
    console.error('Error creating Printful order:', error);
    return {
      success: false,
      error: 'Failed to create order in Printful'
    };
  }
}

// Get shipping rates for cart items
export async function getShippingRates(items: CartItem[], address: Address): Promise<any> {
  try {
    // Convert cart items to Printful shipping rate request format
    const shippingRateData = {
      recipient: {
        address1: address.address_line1,
        address2: address.address_line2 || '',
        city: address.city,
        country_code: address.country,
        zip: address.postal_code,
      },
      items: items.map(item => {
        // Ensure the item has a product with a printful_variant_id
        if (!item.product?.printful_variant_id) {
          throw new Error(`Item ${item.id} does not have a Printful variant ID`);
        }
        
        return {
          sync_variant_id: item.product.printful_variant_id,
          quantity: item.quantity
        };
      })
    };

    // Get shipping rates from Printful
    const rates = await printful.getShippingRates(shippingRateData);
    return rates;
  } catch (error) {
    console.error('Error getting shipping rates:', error);
    throw error;
  }
}

// Check if an order can be fulfilled by Printful
export function canFulfillWithPrintful(order: Order): boolean {
  // Check if all items have Printful variant IDs
  return order.items.every(item => Boolean(item.product?.printful_variant_id));
} 