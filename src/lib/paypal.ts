import axios from 'axios';

// PayPal API Types
export interface PayPalOrder {
  id: string;
  status: string;
  intent: string;
  purchase_units: PayPalPurchaseUnit[];
  create_time: string;
  update_time: string;
  links: PayPalLink[];
  payer?: PayPalPayer;
}

export interface PayPalPurchaseUnit {
  amount: {
    currency_code: string;
    value: string;
    breakdown?: {
      item_total: {
        currency_code: string;
        value: string;
      };
      shipping?: {
        currency_code: string;
        value: string;
      };
    };
  };
  items?: PayPalItem[];
  shipping?: {
    name: {
      full_name: string;
    };
    address: {
      address_line_1: string;
      address_line_2?: string;
      admin_area_2: string; // city
      admin_area_1?: string; // state
      postal_code: string;
      country_code: string;
    };
  };
}

export interface PayPalItem {
  name: string;
  quantity: string;
  unit_amount: {
    currency_code: string;
    value: string;
  };
  sku?: string;
  description?: string;
}

export interface PayPalLink {
  href: string;
  rel: string;
  method: string;
}

export interface PayPalPayer {
  name?: {
    given_name: string;
    surname: string;
  };
  email_address?: string;
  address?: {
    country_code: string;
  };
}

// PayPal Client for server-side operations
class PayPalClient {
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;
  private accessToken?: string;
  private tokenExpiry?: number;

  constructor(clientId: string, clientSecret: string, environment: 'sandbox' | 'production' = 'sandbox') {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.baseUrl = environment === 'sandbox' 
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com';
  }

  // Get access token for PayPal API
  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      if (!this.clientId || !this.clientSecret) {
        throw new Error('PayPal client ID and secret are required');
      }
      
      // Use browser-compatible base64 encoding instead of Buffer
      const auth = btoa(`${this.clientId}:${this.clientSecret}`);
      
      const response = await axios.post(
        `${this.baseUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiry to 80% of the actual expiry to be safe
      this.tokenExpiry = Date.now() + (response.data.expires_in * 800);
      
      if (!this.accessToken) {
        throw new Error('Failed to get access token from PayPal');
      }
      
      return this.accessToken;
    } catch (error) {
      console.error('Error getting PayPal access token:', error);
      throw error;
    }
  }

  // Create a PayPal order
  async createOrder(orderData: Partial<PayPalOrder>): Promise<PayPalOrder> {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await axios.post(
        `${this.baseUrl}/v2/checkout/orders`,
        orderData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'PayPal-Request-Id': `order-${Date.now()}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      throw error;
    }
  }

  // Capture a PayPal order
  async captureOrder(orderId: string): Promise<PayPalOrder> {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await axios.post(
        `${this.baseUrl}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error capturing PayPal order:', error);
      throw error;
    }
  }

  // Get order details
  async getOrder(orderId: string): Promise<PayPalOrder> {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await axios.get(
        `${this.baseUrl}/v2/checkout/orders/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting PayPal order:', error);
      throw error;
    }
  }
}

// Environment variables
const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || '';
const paypalClientSecret = import.meta.env.VITE_PAYPAL_CLIENT_SECRET || '';
const paypalEnvironment = (import.meta.env.VITE_PAYPAL_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production';

// Initialize PayPal client (only if credentials are available)
export const paypal = paypalClientId && paypalClientSecret 
  ? new PayPalClient(paypalClientId, paypalClientSecret, paypalEnvironment)
  : null;

export default paypal; 