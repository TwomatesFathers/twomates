import { v4 as uuidv4 } from 'uuid';
import { supabase } from './supabase';
import { printful } from './printful';
import { paypal } from './paypal';
import type { CartItem } from './supabase';
import type { PayPalItem } from './paypal';

// Order service handles order creation and completion
// Environment behavior:
// - Development (VITE_PAYPAL_ENVIRONMENT=sandbox): Uses PayPal sandbox, creates draft Printful orders (not confirmed/processed)
// - Production (VITE_PAYPAL_ENVIRONMENT=production): Uses PayPal production, creates confirmed Printful orders (auto-processed)

// Order creation data
export interface OrderData {
  items: CartItem[];
  shippingAddress: {
    fullName: string;
    email: string;
    phone?: string;
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
    // Nordic countries
    'Norway': 'NO',
    'Sweden': 'SE',
    'Denmark': 'DK',
    'Finland': 'FI',
    'Iceland': 'IS',
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
      phone: orderData.shippingAddress.phone,
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
async function createPrintfulOrder(orderId: string, orderData: OrderData, confirm: boolean = true): Promise<string> {
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
    confirm: confirm, // This determines if the order will be processed immediately
    recipient: {
      name: orderData.shippingAddress.fullName,
      email: orderData.shippingAddress.email,
      phone: orderData.shippingAddress.phone || '',
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

    console.log(`Starting order completion for order: ${orderId}, PayPal order: ${paypalOrderId}`);

    // Step 1: Capture the PayPal payment
    const paypalOrder = await paypal.captureOrder(paypalOrderId);
    
    if (paypalOrder.status !== 'COMPLETED') {
      throw new Error('PayPal payment was not completed successfully');
    }

    console.log('PayPal payment captured successfully');

    // Step 2: Get order data from database
    console.log(`Looking up order in database: ${orderId}`);
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items:order_items(
          *,
          product:products(*)
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError) {
      console.error('Database error when fetching order:', orderError);
      throw new Error(`Database error: ${orderError.message}`);
    }

    if (!order) {
      console.error(`Order not found in database: ${orderId}`);
      throw new Error('Order not found');
    }

    console.log('Order found in database:', order);

    // Fetch addresses separately to avoid relationship ambiguity
    const { data: addresses, error: addressError } = await supabase
      .from('addresses')
      .select('*')
      .eq('order_id', orderId);

    if (addressError) {
      console.error('Database error when fetching addresses:', addressError);
      throw new Error(`Address lookup error: ${addressError.message}`);
    }

    if (!addresses || addresses.length === 0) {
      console.error('No addresses found for order:', orderId);
      throw new Error('No addresses found for order');
    }

    // Add addresses to order object to match the original structure
    order.addresses = addresses;

    const shippingAddress = order.addresses.find((addr: any) => addr.type === 'shipping');
    if (!shippingAddress) {
      console.error('No shipping address found for order:', orderId);
      throw new Error('Shipping address not found');
    }

    // Check if we're in production environment
    const paypalEnvironment = import.meta.env.VITE_PAYPAL_ENVIRONMENT || 'sandbox';
    const isProduction = paypalEnvironment === 'production';

    let printfulOrderId: string | undefined;

    // Step 3: Create Printful order (draft in development, confirmed in production)
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
        phone: shippingAddress.phone || '',
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

    try {
      // Create Printful order - confirmed in production, draft in development
      const isDevelopment = import.meta.env.DEV;
      
      if (isDevelopment) {
        // Development mode: Skip Printful API calls to avoid CORS issues
        // Generate a mock Printful order ID for testing
        printfulOrderId = `dev-mock-${Date.now()}`;
        console.log(`Development mode: Using mock Printful order ID ${printfulOrderId} (Printful API skipped due to CORS)`);
      } else {
        // Production mode: Create real Printful order
        printfulOrderId = await createPrintfulOrder(orderId, orderData, isProduction);
        
        if (isProduction) {
          console.log(`Production order: Created confirmed Printful order ${printfulOrderId}`);
        } else {
          console.log(`Staging mode: Created draft Printful order ${printfulOrderId} (not confirmed)`);
        }
      }
    } catch (printfulError) {
      console.error('Failed to create Printful order:', printfulError);
      // Don't fail the entire order if Printful fails, but log the error
      // The order can still be processed manually if needed
    }

    // Step 4: Update order status
    const updateData: any = {
      status: 'processing',
      payment_captured_at: new Date().toISOString(),
    };

    if (printfulOrderId) {
      updateData.printful_order_id = printfulOrderId;
    }

    await supabase
      .from('orders')
      .update(updateData)
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

// Confirm a draft Printful order (useful for converting development orders to production)
export async function confirmPrintfulOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the order from database to find the printful_order_id
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('printful_order_id')
      .eq('id', orderId)
      .single();

    if (orderError || !order || !order.printful_order_id) {
      throw new Error('Order not found or no Printful order ID');
    }

    // Check if it's a fake development order
    if (order.printful_order_id.startsWith('dev-fake-')) {
      throw new Error('Cannot confirm fake development order. This order was created before draft mode was implemented.');
    }

    // Confirm the order in Printful
    const confirmedOrder = await printful.confirmOrder(order.printful_order_id);
    
    console.log(`Confirmed Printful order ${order.printful_order_id}:`, confirmedOrder);

    return { success: true };
  } catch (error) {
    console.error('Error confirming Printful order:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to confirm Printful order'
    };
  }
} 