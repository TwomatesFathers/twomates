import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCheck } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { createOrder, type OrderData } from '../lib/orderService';
import PayPalButton from '../components/checkout/PayPalButton';

// Shipping step component
const ShippingStep = ({ 
  shippingDetails, 
  onShippingChange, 
  onSubmit, 
  isProcessing, 
  error, 
  theme, 
  onNavigateToCart 
}: {
  shippingDetails: any;
  onShippingChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isProcessing: boolean;
  error: string | null;
  theme: string;
  onNavigateToCart: () => void;
}) => (
  <div>
    <h2 className={`text-2xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Shipping Information</h2>
    
    {error && (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-800 text-sm">{error}</p>
      </div>
    )}
    
    <form onSubmit={onSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label htmlFor="fullName" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={shippingDetails.fullName}
            onChange={onShippingChange}
            required
            className={`w-full px-4 py-2 rounded-md focus:ring focus:ring-primary-tomato focus:ring-opacity-50 ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'border-gray-300 text-gray-900'
            }`}
          />
        </div>
        
        <div className="md:col-span-2">
          <label htmlFor="email" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={shippingDetails.email}
            onChange={onShippingChange}
            required
            className={`w-full px-4 py-2 rounded-md focus:ring focus:ring-primary-tomato focus:ring-opacity-50 ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'border-gray-300 text-gray-900'
            }`}
          />
        </div>
        
        <div className="md:col-span-2">
          <label htmlFor="phone" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={shippingDetails.phone}
            onChange={onShippingChange}
            placeholder="+47 123 45 678"
            required
            className={`w-full px-4 py-2 rounded-md focus:ring focus:ring-primary-tomato focus:ring-opacity-50 ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'border-gray-300 text-gray-900'
            }`}
          />
        </div>
        
        <div className="md:col-span-2">
          <label htmlFor="address" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Street Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={shippingDetails.address}
            onChange={onShippingChange}
            required
            className={`w-full px-4 py-2 rounded-md focus:ring focus:ring-primary-tomato focus:ring-opacity-50 ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'border-gray-300 text-gray-900'
            }`}
          />
        </div>
        
        <div>
          <label htmlFor="city" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={shippingDetails.city}
            onChange={onShippingChange}
            required
            className={`w-full px-4 py-2 rounded-md focus:ring focus:ring-primary-tomato focus:ring-opacity-50 ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'border-gray-300 text-gray-900'
            }`}
          />
        </div>
        
        <div>
          <label htmlFor="postalCode" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Postal Code
          </label>
          <input
            type="text"
            id="postalCode"
            name="postalCode"
            value={shippingDetails.postalCode}
            onChange={onShippingChange}
            required
            className={`w-full px-4 py-2 rounded-md focus:ring focus:ring-primary-tomato focus:ring-opacity-50 ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'border-gray-300 text-gray-900'
            }`}
          />
        </div>

        <div>
          <label htmlFor="state" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            State/Province (Optional)
          </label>
          <input
            type="text"
            id="state"
            name="state"
            value={shippingDetails.state}
            onChange={onShippingChange}
            className={`w-full px-4 py-2 rounded-md focus:ring focus:ring-primary-tomato focus:ring-opacity-50 ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'border-gray-300 text-gray-900'
            }`}
          />
        </div>
        
        <div>
          <label htmlFor="country" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Country
          </label>
          <select
            id="country"
            name="country"
            value={shippingDetails.country}
            onChange={onShippingChange}
            required
            className={`w-full px-4 py-2 rounded-md focus:ring focus:ring-primary-tomato focus:ring-opacity-50 ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'border-gray-300 text-gray-900'
            }`}
          >
            <option value="Norway">Norway</option>
            <option value="Sweden">Sweden</option>
            <option value="Denmark">Denmark</option>
            <option value="Finland">Finland</option>
            <option value="Iceland">Iceland</option>
          </select>
        </div>
      </div>
      
      <div className="mt-8 flex justify-between items-center">
        <button
          type="button"
          onClick={onNavigateToCart}
          className={`flex items-center px-4 py-2 rounded-md ${
            theme === 'dark'
              ? 'bg-gray-700 text-white hover:bg-gray-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <FiArrowLeft className="mr-2" /> Back to Cart
        </button>
        
        <button
          type="submit"
          disabled={isProcessing}
          className={`btn btn-primary ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isProcessing ? 'Creating Order...' : 'Continue to Payment'}
        </button>
      </div>
    </form>
  </div>
);

// Payment step component
const PaymentStep = ({ 
  error, 
  totalPrice, 
  shippingCost, 
  finalTotal, 
  formatPrice, 
  orderResult, 
  isProcessing, 
  onPaymentSuccess, 
  onPaymentError, 
  onBackToShipping, 
  theme 
}: {
  error: string | null;
  totalPrice: number;
  shippingCost: number;
  finalTotal: number;
  formatPrice: (price: number) => string;
  orderResult: any;
  isProcessing: boolean;
  onPaymentSuccess: (orderId: string, paypalOrderId: string, printfulOrderId?: string) => void;
  onPaymentError: (error: string) => void;
  onBackToShipping: () => void;
  theme: string;
}) => (
  <div>
    <h2 className={`text-2xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Payment</h2>
    
    {error && (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-800 text-sm">{error}</p>
      </div>
    )}
    
    <div className="mb-6">
      <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Order Summary
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Subtotal</span>
          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {formatPrice(totalPrice)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Shipping</span>
          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
          </span>
        </div>
        <div className={`border-t pt-2 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex justify-between font-semibold">
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Total</span>
            <span className="text-primary-tomato">
              {formatPrice(finalTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>

    {orderResult?.orderId && orderResult?.paypalOrderId ? (
      <div className="mb-6">
        <PayPalButton
          orderId={orderResult.orderId}
          paypalOrderId={orderResult.paypalOrderId}
          amount={finalTotal.toFixed(2)}
          onSuccess={onPaymentSuccess}
          onError={onPaymentError}
          disabled={isProcessing}
        />
      </div>
    ) : (
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-yellow-800 text-sm">
          Please complete the shipping information first to proceed with payment.
        </p>
      </div>
    )}
    
    <div className="flex justify-between items-center">
      <button
        type="button"
        onClick={onBackToShipping}
        className={`flex items-center px-4 py-2 rounded-md ${
          theme === 'dark'
            ? 'bg-gray-700 text-white hover:bg-gray-600'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        <FiArrowLeft className="mr-2" /> Back to Shipping
      </button>
    </div>
  </div>
);

// Confirmation step component
const ConfirmationStep = ({ 
  shippingDetails, 
  orderResult, 
  onNavigateHome, 
  onNavigateShop, 
  theme,
  isDevMode 
}: {
  shippingDetails: any;
  orderResult: any;
  onNavigateHome: () => void;
  onNavigateShop: () => void;
  theme: string;
  isDevMode: boolean;
}) => (
  <div className="text-center py-8">
    <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${
      theme === 'dark' ? 'bg-green-800' : 'bg-green-100'
    }`}>
      <FiCheck className={`w-8 h-8 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
    </div>
    
    <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {isDevMode ? 'Test Order Confirmed!' : 'Order Confirmed!'}
    </h2>
    
    <p className={`mb-4 max-w-md mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
      {isDevMode 
        ? `This is a test order in development mode. We've sent a confirmation email to ${shippingDetails.email}.`
        : `Thank you for your purchase. We've sent a confirmation email to ${shippingDetails.email}.`
      }
    </p>

    {isDevMode && (
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md max-w-md mx-auto">
        <p className="text-yellow-800 text-sm">
          <strong>Development Mode:</strong> This is a test order. A draft Printful order was created but won't be processed until confirmed.
        </p>
      </div>
    )}

    {orderResult && (
      <div className={`mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Order Details
        </h3>
        <div className="space-y-1 text-sm">
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
            Order ID: <span className="font-mono">{orderResult.orderId}</span>
          </p>
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
            PayPal Transaction: <span className="font-mono">{orderResult.paypalOrderId}</span>
          </p>
          {orderResult.printfulOrderId && (
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
              {isDevMode ? 'Mock Printful' : 'Printful'} Order: <span className="font-mono">{orderResult.printfulOrderId}</span>
            </p>
          )}
        </div>
      </div>
    )}
    
    <p className={`mb-8 max-w-md mx-auto text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
      {isDevMode 
        ? 'In production, your order would be automatically confirmed and processed. You can track order status in your account.'
        : 'Your order will be processed and shipped soon. You can track your order status in your account.'
      }
    </p>
    
    <div className="flex flex-col sm:flex-row justify-center gap-4">
      <button
        onClick={onNavigateHome}
        className="btn btn-primary"
      >
        Return to Home
      </button>
      
      <button
        onClick={onNavigateShop}
        className={`px-4 py-2 rounded-md ${
          theme === 'dark'
            ? 'bg-gray-700 text-white hover:bg-gray-600'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        Continue Shopping
      </button>
    </div>
  </div>
);

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, totalPrice, clearCart, loading } = useCart();
  const { theme } = useTheme();
  
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Confirmation
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderResult, setOrderResult] = useState<{ orderId?: string; paypalOrderId?: string; printfulOrderId?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [shippingDetails, setShippingDetails] = useState({
    fullName: user?.full_name || '',
    email: user?.email || '',
    phone: '+47 ', // Default Norwegian phone prefix
    address: '',
    city: '',
    postalCode: '',
    country: 'Norway', // Default to Norway for Norwegian users
    state: '',
  });
  
  // Check if we're in development mode
  const isDevMode = (import.meta.env.VITE_PAYPAL_ENVIRONMENT || 'sandbox') === 'sandbox';
  
  // Check if cart is empty and redirect if needed (only after loading is complete)
  useEffect(() => {
    if (!loading && cart.length === 0 && step !== 3) {
      navigate('/cart');
    }
  }, [cart.length, step, navigate, loading]);
  
  // Calculate shipping cost
  const shippingCost = totalPrice >= 100 ? 0 : 10;
  const finalTotal = totalPrice + shippingCost;
  
  // Show loading spinner while cart is loading
  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-tomato"></div>
            <span className={`ml-3 text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Loading checkout...
            </span>
          </div>
        </div>
      </div>
    );
  }
  
  // Format price with currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };
  
  // Handle shipping form submission
  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);
    
    try {
      // Create order data
      const orderData: OrderData = {
        items: cart,
        shippingAddress: {
          fullName: shippingDetails.fullName,
          email: shippingDetails.email,
          phone: shippingDetails.phone,
          address: shippingDetails.address,
          city: shippingDetails.city,
          postalCode: shippingDetails.postalCode,
          country: shippingDetails.country,
          state: shippingDetails.state,
        },
        subtotal: totalPrice,
        shipping: shippingCost,
        total: finalTotal,
        userId: user?.id,
      };

      // Create order and PayPal order
      const result = await createOrder(orderData);
      
      if (result.success && result.orderId && result.paypalOrderId) {
        setOrderResult({
          orderId: result.orderId,
          paypalOrderId: result.paypalOrderId,
        });
        setStep(2);
        window.scrollTo(0, 0);
      } else {
        setError(result.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      setError(error instanceof Error ? error.message : 'Failed to create order');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle successful payment
  const handlePaymentSuccess = (orderId: string, paypalOrderId: string, printfulOrderId?: string) => {
    setOrderResult({
      orderId,
      paypalOrderId,
      printfulOrderId,
    });
    setStep(3);
    clearCart();
    window.scrollTo(0, 0);
  };

  // Handle payment error
  const handlePaymentError = (error: string) => {
    setError(error);
  };
  
  // Handle shipping form input changes
  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingDetails(prev => ({ ...prev, [name]: value }));
  };
  
  return (
    <div className="container-custom py-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Development Mode Indicator */}
        {isDevMode && (
          <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Development Mode:</strong> PayPal sandbox enabled. Printful orders will be created as drafts (not processed).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Checkout Steps */}
        {step !== 3 && (
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-md mx-auto">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                  step >= 1
                    ? 'bg-primary-tomato text-white' 
                    : theme === 'dark'
                      ? 'bg-gray-700 text-gray-400'
                      : 'bg-gray-200 text-gray-500'
                }`}>
                  1
                </div>
                <span className={`text-sm ${
                  step >= 1
                    ? theme === 'dark' ? 'text-white' : 'text-gray-900' 
                    : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>Shipping</span>
              </div>
              
              <div className={`flex-grow h-0.5 mx-4 ${
                step >= 2
                  ? 'bg-primary-tomato' 
                  : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
              }`}></div>
              
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                  step >= 2
                    ? 'bg-primary-tomato text-white' 
                    : theme === 'dark'
                      ? 'bg-gray-700 text-gray-400'
                      : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
                <span className={`text-sm ${
                  step >= 2
                    ? theme === 'dark' ? 'text-white' : 'text-gray-900' 
                    : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>Payment</span>
              </div>
              
              <div className={`flex-grow h-0.5 mx-4 ${
                step >= 3
                  ? 'bg-primary-tomato' 
                  : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
              }`}></div>
              
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                  step >= 3
                    ? 'bg-primary-tomato text-white' 
                    : theme === 'dark'
                      ? 'bg-gray-700 text-gray-400'
                      : 'bg-gray-200 text-gray-500'
                }`}>
                  3
                </div>
                <span className={`text-sm ${
                  step >= 3
                    ? theme === 'dark' ? 'text-white' : 'text-gray-900' 
                    : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>Confirmation</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Checkout Form */}
          <div className="md:col-span-2">
            <div className={`p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              {step === 1 && <ShippingStep
                shippingDetails={shippingDetails}
                onShippingChange={handleShippingChange}
                onSubmit={handleShippingSubmit}
                isProcessing={isProcessing}
                error={error}
                theme={theme}
                onNavigateToCart={() => navigate('/cart')}
              />}
              {step === 2 && <PaymentStep
                error={error}
                totalPrice={totalPrice}
                shippingCost={shippingCost}
                finalTotal={finalTotal}
                formatPrice={formatPrice}
                orderResult={orderResult}
                isProcessing={isProcessing}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                onBackToShipping={() => setStep(1)}
                theme={theme}
              />}
              {step === 3 && <ConfirmationStep
                shippingDetails={shippingDetails}
                orderResult={orderResult}
                onNavigateHome={() => navigate('/')}
                onNavigateShop={() => navigate('/shop')}
                theme={theme}
                isDevMode={isDevMode}
              />}
            </div>
          </div>
          
          {/* Order Summary */}
          {step !== 3 && (
            <div className="md:col-span-1">
              <div className={`p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Order Summary</h2>
                
                <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {cart.map((item) => (
                    <div key={item.id} className="py-4 flex items-start">
                      <div className="w-12 h-12 rounded-md overflow-hidden mr-4">
                        <img 
                          src={item.product?.image_url} 
                          alt={item.product?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-grow">
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {item.product?.name}
                        </p>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Size: {item.size} · Qty: {item.quantity}
                        </div>
                      </div>
                      <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatPrice((item.product?.price || 0) * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4 mt-6">
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Subtotal</span>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Shipping</span>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
                    </span>
                  </div>
                  <div className={`border-t pt-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex justify-between font-semibold">
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Total</span>
                      <span className="text-primary-tomato">
                        {formatPrice(finalTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CheckoutPage; 