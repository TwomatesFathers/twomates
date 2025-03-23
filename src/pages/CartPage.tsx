import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiTrash2, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

const CartPage = () => {
  const { cart, loading, totalItems, totalPrice, updateCartItem, removeFromCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { theme } = useTheme();

  // Format price with currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="container-custom py-12">
        <h1 className={`text-3xl font-bold mb-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Your Cart</h1>
        <div className={`p-8 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'} animate-pulse`}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`flex items-center py-4 ${i !== 2 ? `border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}` : ''}`}>
              <div className={`w-20 h-20 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} rounded-md mr-4`}></div>
              <div className="flex-grow">
                <div className={`h-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} rounded w-3/4 mb-2`}></div>
                <div className={`h-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} rounded w-1/2`}></div>
              </div>
              <div className={`w-20 h-8 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} rounded-md`}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container-custom py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-6">
            <FiShoppingBag size={60} className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} />
          </div>
          <h1 className={`text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Your Cart is Empty</h1>
          <p className={`mb-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Looks like you haven't added any products to your cart yet.
          </p>
          <Link to="/shop" className="btn btn-primary">
            Continue Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className={`text-3xl font-bold mb-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Your Cart</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="md:col-span-2">
            <div className={`rounded-lg shadow-md overflow-hidden ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
              <div className={`p-6 border-b ${
                theme === 'dark' 
                  ? 'bg-gray-850 border-gray-700' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex justify-between items-center">
                  <h2 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
                  </h2>
                </div>
              </div>

              <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {cart.map((item) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-6 flex flex-col sm:flex-row items-start sm:items-center"
                  >
                    {/* Product Image */}
                    <div className="w-full sm:w-20 h-20 mb-4 sm:mb-0 sm:mr-6">
                      <img
                        src={item.product?.image_url}
                        alt={item.product?.name}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-grow">
                      <Link 
                        to={`/product/${item.product_id}`} 
                        className={`font-medium hover:text-primary-tomato transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                      >
                        {item.product?.name}
                      </Link>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Size: {item.size}
                      </p>
                      <p className="font-semibold text-primary-tomato">
                        {formatPrice((item.product?.price || 0) * item.quantity)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center mt-4 sm:mt-0">
                      <div className="flex items-center mr-4">
                        <button
                          onClick={() => updateCartItem(item.id, item.quantity - 1)}
                          className={`px-2 py-1 border rounded-l-md ${
                            theme === 'dark' 
                              ? 'border-gray-600 bg-gray-700 text-white hover:bg-gray-600' 
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          -
                        </button>
                        <span className={`w-8 text-center border-y ${
                          theme === 'dark' 
                            ? 'border-gray-600 bg-gray-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartItem(item.id, item.quantity + 1)}
                          className={`px-2 py-1 border rounded-r-md ${
                            theme === 'dark' 
                              ? 'border-gray-600 bg-gray-700 text-white hover:bg-gray-600' 
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className={`${theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'} transition-colors`}
                        aria-label="Remove item"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className={`p-6 rounded-lg shadow-md sticky top-24 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
              <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Subtotal</span>
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatPrice(totalPrice)}</span>
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
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {totalPrice >= 100 ? 'Free shipping on orders over $100' : `$${(100 - totalPrice).toFixed(2)} away from free shipping`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCheckingOut(true);
                  // Simulate a delay before navigating
                  setTimeout(() => {
                    window.location.href = '/checkout';
                  }, 500);
                }}
                disabled={isCheckingOut}
                className={`btn btn-primary w-full flex items-center justify-center ${
                  isCheckingOut ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isCheckingOut ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    Proceed to Checkout <FiArrowRight className="ml-2" />
                  </>
                )}
              </button>

              <div className="mt-6">
                <Link
                  to="/shop"
                  className={`text-center block w-full ${theme === 'dark' ? 'text-primary-lightTomato hover:text-primary-tomato' : 'text-primary-tomato hover:text-primary-darkTomato'} transition-colors`}
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CartPage; 