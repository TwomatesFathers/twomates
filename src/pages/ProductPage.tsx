import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiShoppingCart } from 'react-icons/fi';
import { supabase, Product } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { theme } = useTheme();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        if (!id) throw new Error('Product ID is required');
        
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        if (!data) throw new Error('Product not found');
        
        setProduct(data);
        
        // Set the first size as default
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
      } catch (error: any) {
        console.error('Error fetching product:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);
  
  const handleAddToCart = () => {
    if (!product || !selectedSize) return;
    
    addToCart(product.id, quantity, selectedSize);
    
    // Show success message or redirect to cart
    navigate('/cart');
  };
  
  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };
  
  const decrementQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };
  
  // Format price with currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };
  
  if (loading) {
    return (
      <div className="container-custom py-16 flex justify-center">
        <motion.div 
          className="w-16 h-16 border-4 border-primary-tomato border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="container-custom py-16 text-center">
        <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-red-300 border border-red-900' : 'bg-red-50 text-red-800'}`}>
          <h2 className="text-xl font-bold mb-4">Error</h2>
          <p>{error || 'Product not found'}</p>
          <button
            onClick={() => navigate('/shop')}
            className={`mt-6 px-4 py-2 rounded-md hover:bg-primary-darkTomato transition-colors ${
              theme === 'dark' ? 'bg-primary-tomato text-white' : 'bg-primary-tomato text-white'
            }`}
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container-custom py-12">
      {/* Back button */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 ${theme === 'dark' ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
        >
          <FiArrowLeft className="mr-2" />
          Back
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Product Image */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`rounded-lg overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
          >
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-auto object-cover"
            />
          </motion.div>
        </div>
        
        {/* Product Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{product.name}</h1>
          <div className="mb-4">
            <span className="text-2xl font-semibold text-primary-tomato">{formatPrice(product.price)}</span>
          </div>
          
          <div className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <p>{product.description}</p>
          </div>
          
          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>Size</h3>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-md border ${
                      selectedSize === size
                        ? 'border-primary-tomato bg-primary-tomato text-white'
                        : theme === 'dark'
                          ? 'border-gray-600 text-gray-300 hover:border-gray-400 hover:bg-gray-700'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    } transition-colors`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Quantity Selector */}
          <div className="mb-8">
            <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>Quantity</h3>
            <div className="flex items-center">
              <button
                onClick={decrementQuantity}
                className={`px-3 py-1 rounded-l-md ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white hover:bg-gray-600 border border-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } transition-colors`}
              >
                -
              </button>
              <div className={`px-4 py-1 ${
                theme === 'dark'
                  ? 'bg-gray-800 text-white border-y border-gray-600'
                  : 'bg-white text-gray-900 border-y border-gray-200'
              }`}>
                {quantity}
              </div>
              <button
                onClick={incrementQuantity}
                className={`px-3 py-1 rounded-r-md ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white hover:bg-gray-600 border border-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } transition-colors`}
              >
                +
              </button>
            </div>
          </div>
          
          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!selectedSize}
            className={`px-6 py-3 rounded-md flex items-center justify-center w-full ${
              !selectedSize
                ? theme === 'dark' ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-primary-tomato hover:bg-primary-darkTomato text-white'
            } transition-colors`}
          >
            <FiShoppingCart className="mr-2" size={20} />
            Add to Cart
          </button>
          
          {/* Additional Info */}
          <div className={`mt-8 pt-8 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="grid grid-cols-2 gap-4">
              <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Shipping</h4>
                <p className="text-sm">Free shipping on orders over $50</p>
              </div>
              <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Returns</h4>
                <p className="text-sm">Easy 30-day returns</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductPage; 