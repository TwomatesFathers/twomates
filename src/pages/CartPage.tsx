import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiTrash2, FiArrowRight, FiMinus, FiPlus } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

const CartPage = () => {
  const { cart, loading, totalItems, totalPrice, updateCartItem, removeFromCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<string[]>([]);
  const { theme } = useTheme();

  // Format price with currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleQuantityUpdate = async (itemId: string, newQuantity: number) => {
    setUpdatingItems(prev => [...prev, itemId]);
    try {
      await updateCartItem(itemId, newQuantity);
    } catch (error) {
      console.error('Failed to update cart item:', error);
    } finally {
      setUpdatingItems(prev => prev.filter(id => id !== itemId));
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setUpdatingItems(prev => [...prev, itemId]);
    try {
      await removeFromCart(itemId);
    } catch (error) {
      console.error('Failed to remove cart item:', error);
      setUpdatingItems(prev => prev.filter(id => id !== itemId));
    }
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
                {cart.map((item) => {
                  const product = item.product;
                  const isUpdating = updatingItems.includes(item.id);
                  
                  if (!product) {
                    return (
                      <div key={item.id} className="p-6 flex items-center">
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Product information unavailable
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className={`ml-auto ${theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'} transition-colors`}
                          aria-label="Remove item"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    );
                  }

                  return (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`p-6 flex flex-col sm:flex-row items-start sm:items-center ${isUpdating ? 'opacity-50' : ''}`}
                    >
                      {/* Product Image */}
                      <div className="w-full sm:w-20 h-20 mb-4 sm:mb-0 sm:mr-6">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded-md"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-image.jpg'; // Fallback image
                          }}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-grow">
                        <Link 
                          to={`/product/${item.product_id}`} 
                          className={`font-medium hover:text-primary-tomato transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                        >
                          {product.name}
                        </Link>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          <p>Size: {item.size}</p>
                          {product.color && (
                            <p>Color: {product.color}</p>
                          )}
                          <p className="mt-1">
                            {formatPrice(product.price)} each
                          </p>
                        </div>
                        <p className="font-semibold text-primary-tomato mt-2">
                          Total: {formatPrice(product.price * item.quantity)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center mt-4 sm:mt-0">
                        <div className="flex items-center mr-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                          <button
                            onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                            disabled={isUpdating || item.quantity <= 1}
                            className={`w-10 h-10 flex items-center justify-center ${
                              theme === 'dark' 
                                ? 'text-gray-300 hover:text-white hover:bg-gray-600 disabled:text-gray-500 disabled:bg-gray-700' 
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:text-gray-400 disabled:bg-gray-50'
                            } transition-all duration-200 disabled:cursor-not-allowed group`}
                            aria-label="Decrease quantity"
                          >
                            <FiMinus size={16} className="group-hover:scale-110 transition-transform" />
                          </button>
                          
                          <div className={`w-12 h-10 flex items-center justify-center font-medium text-sm ${
                            theme === 'dark' 
                              ? 'text-white bg-gray-700 border-x border-gray-600' 
                              : 'text-gray-900 bg-white border-x border-gray-200'
                          }`}>
                            {item.quantity}
                          </div>
                          
                          <button
                            onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                            disabled={isUpdating}
                            className={`w-10 h-10 flex items-center justify-center ${
                              theme === 'dark' 
                                ? 'text-gray-300 hover:text-white hover:bg-gray-600 disabled:text-gray-500 disabled:bg-gray-700' 
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:text-gray-400 disabled:bg-gray-50'
                            } transition-all duration-200 disabled:cursor-not-allowed group`}
                            aria-label="Increase quantity"
                          >
                            <FiPlus size={16} className="group-hover:scale-110 transition-transform" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isUpdating}
                          className={`${theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'} transition-colors disabled:opacity-50`}
                          aria-label="Remove item"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className={`p-6 rounded-lg shadow-md sticky top-24 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
              <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Subtotal ({totalItems} items)</span>
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
                    {totalPrice >= 100 
                      ? 'Free shipping included' 
                      : `Add ${formatPrice(100 - totalPrice)} for free shipping`
                    }
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
                disabled={isCheckingOut || totalItems === 0}
                className={`btn btn-primary w-full flex items-center justify-center ${
                  isCheckingOut || totalItems === 0 ? 'opacity-70 cursor-not-allowed' : ''
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