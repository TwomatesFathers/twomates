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
  const [variants, setVariants] = useState<Product[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        if (!id) throw new Error('Product ID is required');
        
        // First, get the specific product/variant that was clicked
        const { data: mainProduct, error: mainError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
          
        if (mainError) throw mainError;
        if (!mainProduct) throw new Error('Product not found');
        
        setProduct(mainProduct);
        
        // Then fetch all variants for this product group
        const { data: allVariants, error: variantsError } = await supabase
          .from('products')
          .select('*')
          .eq('printful_product_id', mainProduct.printful_product_id)
          .eq('in_stock', true) // Only show in-stock variants
          .order('size');
          
        if (variantsError) throw variantsError;
        
        const variantsList = allVariants || [];
        setVariants(variantsList);
        
        // Set the main product as the initially selected variant
        setSelectedVariant(mainProduct);
        setSelectedSize(mainProduct.size || '');
      } catch (error: any) {
        console.error('Error fetching product:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);
  
  const handleSizeSelect = (size: string) => {
    // Find the variant with the selected size
    const variant = variants.find(v => v.size === size);
    if (variant) {
      setSelectedVariant(variant);
      setSelectedSize(size);
    }
  };
  
  const handleAddToCart = () => {
    if (!selectedVariant || !selectedSize) return;
    
    // Add the specific variant to cart
    addToCart(selectedVariant.id, quantity, selectedSize);
    
    // Show success message or redirect to cart
    navigate('/cart');
  };
  
  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };
  
  const decrementQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  // Get unique sizes and sort them properly
  const getAvailableSizes = () => {
    const sizes = variants
      .map(variant => variant.size)
      .filter(size => size && size.trim() !== '') // Filter out empty/null sizes
      .filter((size, index, array) => array.indexOf(size) === index); // Remove duplicates
    
    // Sort sizes properly (S, M, L, XL, XXL, etc.)
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', 'XXXL', '3XL'];
    
    return sizes.sort((a, b) => {
      const aIndex = sizeOrder.indexOf(a);
      const bIndex = sizeOrder.indexOf(b);
      
      // If both sizes are in our standard order, sort by that
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      
      // If only one is in standard order, prioritize it
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      // For non-standard sizes, sort alphabetically
      return a.localeCompare(b);
    });
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
  
  // Use selected variant for display, fallback to main product
  const displayProduct = selectedVariant || product;
  const availableSizes = getAvailableSizes();
  
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
              src={displayProduct.image_url}
              alt={displayProduct.name}
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
          <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{displayProduct.name}</h1>
          <div className="mb-4">
            <span className="text-2xl font-semibold text-primary-tomato">{formatPrice(displayProduct.price)}</span>
            {selectedVariant && selectedSize && (
              <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Size: {selectedSize} • Color: {selectedVariant.color}
              </div>
            )}
          </div>
          
          <div className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <p>{displayProduct.description}</p>
          </div>
          
          {/* Size Selection */}
          {availableSizes.length > 0 && (
            <div className="mb-6">
              <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>Size</h3>
              <div className="flex flex-wrap gap-3">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSizeSelect(size)}
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
            disabled={!selectedSize || !displayProduct.in_stock}
            className={`px-6 py-3 rounded-md flex items-center justify-center w-full ${
              !selectedSize || !displayProduct.in_stock
                ? theme === 'dark' ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-primary-tomato hover:bg-primary-darkTomato text-white'
            } transition-colors`}
          >
            <FiShoppingCart className="mr-2" size={20} />
            {!displayProduct.in_stock ? 'Out of Stock' : 'Add to Cart'}
          </button>
          
          {/* Additional Info */}
          <div className="mt-8 space-y-4">
            <div>
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>Category</h3>
              <p className={`capitalize ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{displayProduct.category}</p>
            </div>
            <div>
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>Availability</h3>
              <p className={`${displayProduct.in_stock ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {displayProduct.in_stock ? 'In Stock' : 'Out of Stock'}
              </p>
            </div>
            {availableSizes.length > 1 && (
              <div>
                <h3 className={`font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>Available Sizes</h3>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {availableSizes.join(', ')}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductPage; 