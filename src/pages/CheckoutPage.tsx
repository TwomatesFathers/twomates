import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCheck } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, totalPrice, clearCart } = useCart();
  const { theme } = useTheme();
  
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Confirmation
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form states
  const [shippingDetails, setShippingDetails] = useState({
    fullName: user?.full_name || '',
    email: user?.email || '',
    address: '',
    city: '',
    postalCode: '',
    country: 'United States',
  });
  
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvc: '',
  });
  
  // Format price with currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };
  
  // Handle shipping form submission
  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
    window.scrollTo(0, 0);
  };
  
  // Handle payment form submission
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setStep(3);
      // Clear cart after successful checkout
      clearCart();
      window.scrollTo(0, 0);
    }, 2000);
  };
  
  // Handle shipping form input changes
  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingDetails(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle payment form input changes
  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    
    // Format card number
    if (name === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
    }
    
    // Format expiry date
    if (name === 'expiry') {
      value = value.replace(/\//g, '');
      if (value.length > 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
      }
    }
    
    setPaymentDetails(prev => ({ ...prev, [name]: value }));
  };
  
  // Check if cart is empty and redirect if needed
  if (cart.length === 0 && step !== 3) {
    navigate('/cart');
    return null;
  }
  
  // Shipping step UI
  const ShippingStep = () => (
    <div>
      <h2 className={`text-2xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Shipping Information</h2>
      
      <form onSubmit={handleShippingSubmit}>
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
              onChange={handleShippingChange}
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
              onChange={handleShippingChange}
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
              onChange={handleShippingChange}
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
              onChange={handleShippingChange}
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
              onChange={handleShippingChange}
              required
              className={`w-full px-4 py-2 rounded-md focus:ring focus:ring-primary-tomato focus:ring-opacity-50 ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'border-gray-300 text-gray-900'
              }`}
            />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="country" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Country
            </label>
            <select
              id="country"
              name="country"
              value={shippingDetails.country}
              onChange={handleShippingChange}
              required
              className={`w-full px-4 py-2 rounded-md focus:ring focus:ring-primary-tomato focus:ring-opacity-50 ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'border-gray-300 text-gray-900'
              }`}
            >
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Australia">Australia</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="Japan">Japan</option>
            </select>
          </div>
        </div>
        
        <div className="mt-8 flex justify-between items-center">
          <button
            type="button"
            onClick={() => navigate('/cart')}
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
            className="btn btn-primary"
          >
            Continue to Payment
          </button>
        </div>
      </form>
    </div>
  );
  
  // Payment step UI
  const PaymentStep = () => (
    <div>
      <h2 className={`text-2xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Payment Information</h2>
      
      <form onSubmit={handlePaymentSubmit}>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="cardName" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Name on Card
            </label>
            <input
              type="text"
              id="cardName"
              name="cardName"
              value={paymentDetails.cardName}
              onChange={handlePaymentChange}
              required
              className={`w-full px-4 py-2 rounded-md focus:ring focus:ring-primary-tomato focus:ring-opacity-50 ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'border-gray-300 text-gray-900'
              }`}
            />
          </div>
          
          <div>
            <label htmlFor="cardNumber" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Card Number
            </label>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              value={paymentDetails.cardNumber}
              onChange={handlePaymentChange}
              required
              placeholder="0000 0000 0000 0000"
              maxLength={19}
              className={`w-full px-4 py-2 rounded-md focus:ring focus:ring-primary-tomato focus:ring-opacity-50 ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-500'
                  : 'border-gray-300 text-gray-900 placeholder:text-gray-400'
              }`}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="expiry" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Expiry Date
              </label>
              <input
                type="text"
                id="expiry"
                name="expiry"
                value={paymentDetails.expiry}
                onChange={handlePaymentChange}
                required
                placeholder="MM/YY"
                maxLength={5}
                className={`w-full px-4 py-2 rounded-md focus:ring focus:ring-primary-tomato focus:ring-opacity-50 ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-500'
                    : 'border-gray-300 text-gray-900 placeholder:text-gray-400'
                }`}
              />
            </div>
            
            <div>
              <label htmlFor="cvc" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                CVC
              </label>
              <input
                type="text"
                id="cvc"
                name="cvc"
                value={paymentDetails.cvc}
                onChange={handlePaymentChange}
                required
                placeholder="123"
                maxLength={3}
                className={`w-full px-4 py-2 rounded-md focus:ring focus:ring-primary-tomato focus:ring-opacity-50 ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-500'
                    : 'border-gray-300 text-gray-900 placeholder:text-gray-400'
                }`}
              />
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-between items-center">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex items-center px-4 py-2 rounded-md ${
              theme === 'dark'
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FiArrowLeft className="mr-2" /> Back to Shipping
          </button>
          
          <button
            type="submit"
            disabled={isProcessing}
            className={`btn btn-primary ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isProcessing ? 'Processing...' : 'Complete Order'}
          </button>
        </div>
      </form>
    </div>
  );
  
  // Confirmation step UI
  const ConfirmationStep = () => (
    <div className="text-center py-8">
      <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${
        theme === 'dark' ? 'bg-green-800' : 'bg-green-100'
      }`}>
        <FiCheck className={`w-8 h-8 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
      </div>
      
      <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Order Confirmed!
      </h2>
      
      <p className={`mb-8 max-w-md mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
        Thank you for your purchase. We've sent a confirmation email to {shippingDetails.email}.
        Your order will be processed and shipped soon.
      </p>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="btn btn-primary"
        >
          Return to Home
        </button>
        
        <button
          onClick={() => navigate('/shop')}
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
  
  return (
    <div className="container-custom py-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
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
              {step === 1 && <ShippingStep />}
              {step === 2 && <PaymentStep />}
              {step === 3 && <ConfirmationStep />}
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
                      {totalPrice >= 100 ? 'Free' : formatPrice(10)}
                    </span>
                  </div>
                  <div className={`border-t pt-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex justify-between font-semibold">
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Total</span>
                      <span className="text-primary-tomato">
                        {formatPrice(totalPrice >= 100 ? totalPrice : totalPrice + 10)}
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