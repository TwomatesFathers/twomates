import { v4 as uuidv4 } from 'uuid';
import { supabase } from './supabase';
import { printful } from './printful';
import { paypal } from './paypal';
import type { CartItem } from './supabase';
import type { PayPalItem } from './paypal';

// Order creation data
export interface OrderData {
  items: CartItem[];
  shippingAddress: {
    fullName: string;
    email: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    state?: string;
  };
  subtotal: number;
  shipping: number;
  total: number;
  userId?: string;
}

export interface OrderResult {
  success: boolean;
  orderId?: string;
  paypalOrderId?: string;
  printfulOrderId?: string;
  error?: string;
}

// Convert country name to ISO code
function getCountryCode(countryName: string): string {
  const countryMap: Record<string, string> = {
    'United States': 'US',
    'Canada': 'CA',
    'United Kingdom': 'GB',
    'Australia': 'AU',
    'Germany': 'DE',
    'France': 'FR',
    'Japan': 'JP',
  };
  return countryMap[countryName] || 'US';
}

// Create order in our database
async function createDatabaseOrder(orderData: OrderData): Promise<string> {
  const orderId = uuidv4();
  
  // Create main order record
  const { error: orderError } = await supabase
    .from('orders')
    .insert({
      id: orderId,
      user_id: orderData.userId || null,
      status: 'pending',
      total: orderData.total,
      created_at: new Date().toISOString(),
    });

  if (orderError) {
    throw new Error(`Failed to create order: ${orderError.message}`);
  }

  // Create shipping address
  const { error: addressError } = await supabase
    .from('addresses')
    .insert({
      id: uuidv4(),
      order_id: orderId,
      type: 'shipping',
      full_name: orderData.shippingAddress.fullName,
      address_line1: orderData.shippingAddress.address,
      city: orderData.shippingAddress.city,
      postal_code: orderData.shippingAddress.postalCode,
      country: orderData.shippingAddress.country,
      state: orderData.shippingAddress.state,
    });

  if (addressError) {
    throw new Error(`Failed to create shipping address: ${addressError.message}`);
  }

  // Create order items
  const orderItems = orderData.items.map(item => ({
    id: uuidv4(),
    order_id: orderId,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.product?.price || 0,
    size: item.size,
    created_at: new Date().toISOString(),
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    throw new Error(`Failed to create order items: ${itemsError.message}`);
  }

  return orderId;
}

// Create PayPal order
async function createPayPalOrder(orderData: OrderData): Promise<string> {
  if (!paypal) {
    throw new Error('PayPal is not configured');
  }

  const countryCode = getCountryCode(orderData.shippingAddress.country);
  
  // Prepare PayPal items
  const paypalItems: PayPalItem[] = orderData.items.map(item => ({
    name: item.product?.name || `Product ${item.product_id}`,
    quantity: item.quantity.toString(),
    unit_amount: {
      currency_code: 'USD',
      value: (item.product?.price || 0).toFixed(2),
    },
    sku: item.product?.sku || item.product_id.toString(),
    description: item.size ? `Size: ${item.size}` : undefined,
  }));

  // Create PayPal order data
  const paypalOrderData = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: 'USD',
          value: orderData.total.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: 'USD',
              value: orderData.subtotal.toFixed(2),
            },
            shipping: {
              currency_code: 'USD',
              value: orderData.shipping.toFixed(2),
            },
          },
        },
        items: paypalItems,
        shipping: {
          name: {
            full_name: orderData.shippingAddress.fullName,
          },
          address: {
            address_line_1: orderData.shippingAddress.address,
            admin_area_2: orderData.shippingAddress.city,
            postal_code: orderData.shippingAddress.postalCode,
            country_code: countryCode,
            admin_area_1: orderData.shippingAddress.state || '',
          },
        },
      },
    ],
  };

  const paypalOrder = await paypal.createOrder(paypalOrderData);
  return paypalOrder.id;
}

// Create Printful order
async function createPrintfulOrder(orderId: string, orderData: OrderData): Promise<string> {
  // Verify all items have printful variant IDs
  const missingVariantIds = orderData.items.filter(item => {
    return !item.product?.printful_variant_id;
  });

  if (missingVariantIds.length > 0) {
    throw new Error('Some items in your cart are not Printful products');
  }

  const countryCode = getCountryCode(orderData.shippingAddress.country);

  // Create the order data for Printful API
  const printfulOrderData = {
    external_id: orderId,
    recipient: {
      name: orderData.shippingAddress.fullName,
      email: orderData.shippingAddress.email,
      address1: orderData.shippingAddress.address,
      city: orderData.shippingAddress.city,
      state_code: orderData.shippingAddress.state || '',
      country_code: countryCode,
      zip: orderData.shippingAddress.postalCode,
    },
    items: orderData.items.map(item => ({
      sync_variant_id: parseInt(item.product?.printful_variant_id || '0'),
      quantity: item.quantity,
      retail_price: (item.product?.price || 0).toFixed(2),
      name: item.product?.name || '',
      external_id: item.id,
    })),
  };

  // Create the order in Printful
  const printfulOrder = await printful.createOrder(printfulOrderData);
  return printfulOrder.id.toString();
}

// Main order creation function
export async function createOrder(orderData: OrderData): Promise<OrderResult> {
  try {
    // Step 1: Create order in our database
    const orderId = await createDatabaseOrder(orderData);

    // Step 2: Create PayPal order
    const paypalOrderId = await createPayPalOrder(orderData);

    // Step 3: Update our order with PayPal order ID
    await supabase
      .from('orders')
      .update({ 
        paypal_order_id: paypalOrderId,
        status: 'payment_pending' 
      })
      .eq('id', orderId);

    return {
      success: true,
      orderId,
      paypalOrderId,
    };
  } catch (error) {
    console.error('Error creating order:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create order',
    };
  }
}

// Complete order after PayPal payment
export async function completeOrder(orderId: string, paypalOrderId: string): Promise<OrderResult> {
  try {
    if (!paypal) {
      throw new Error('PayPal is not configured');
    }

    // Step 1: Capture the PayPal payment
    const paypalOrder = await paypal.captureOrder(paypalOrderId);
    
    if (paypalOrder.status !== 'COMPLETED') {
      throw new Error('PayPal payment was not completed successfully');
    }

    // Step 2: Get order data from database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items:order_items(
          *,
          product:products(*)
        ),
        addresses:addresses(*)
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    const shippingAddress = order.addresses.find((addr: any) => addr.type === 'shipping');
    if (!shippingAddress) {
      throw new Error('Shipping address not found');
    }

    // Step 3: Create Printful order
    // Calculate subtotal from order items
    const subtotal = order.order_items.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0);
    
    // Calculate shipping cost (free for orders ≥ $100, otherwise $10)
    const shippingCost = subtotal >= 100 ? 0 : 10;
    
    const orderData: OrderData = {
      items: order.order_items.map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        product: item.product,
        quantity: item.quantity,
        size: item.size,
        user_id: order.user_id,
        created_at: item.created_at,
      })),
      shippingAddress: {
        fullName: shippingAddress.full_name,
        email: paypalOrder.payer?.email_address || '',
        address: shippingAddress.address_line1,
        city: shippingAddress.city,
        postalCode: shippingAddress.postal_code,
        country: shippingAddress.country,
        state: shippingAddress.state,
      },
      subtotal: subtotal,
      shipping: shippingCost,
      total: order.total,
      userId: order.user_id,
    };

    const printfulOrderId = await createPrintfulOrder(orderId, orderData);

    // Step 4: Update order status
    await supabase
      .from('orders')
      .update({ 
        printful_order_id: printfulOrderId,
        status: 'processing',
        payment_captured_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    return {
      success: true,
      orderId,
      paypalOrderId,
      printfulOrderId,
    };
  } catch (error) {
    console.error('Error completing order:', error);
    
    // Update order status to failed
    await supabase
      .from('orders')
      .update({ status: 'failed' })
      .eq('id', orderId);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to complete order',
    };
  }
}

// Cancel order
export async function cancelOrder(orderId: string): Promise<void> {
  await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId);
} 