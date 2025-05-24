import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Product } from '../../lib/supabase';
import { useCart } from '../../context/CartContext';
import { FiShoppingCart } from 'react-icons/fi';

interface ProductCardProps {
  product: Product;
  showCartButton?: boolean;
}

const ProductCard = ({ product, showCartButton = true }: ProductCardProps) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    // Use the product's size or available_sizes, with fallback
    const defaultSize = product.available_sizes && product.available_sizes.length > 0 
      ? product.available_sizes[0] 
      : product.size || 'One Size';
    addToCart(product.id, 1, defaultSize);
  };

  // Format price with currency
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(product.price);

  return (
    <Link to={`/product/${product.id}`} className="group">
      <div className="card h-full flex flex-col transition-all duration-300 hover:shadow-lg bg-white dark:bg-gray-800 dark:border dark:border-gray-700 dark:hover:shadow-gray-700 hover:shadow-gray-300 shadow-sm">
        {/* Product Image */}
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-64 sm:h-72 md:h-64 lg:h-72 object-cover object-center transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Quick add to cart button - only show if showCartButton is true */}
          {showCartButton && (
            <motion.button
              className="absolute bottom-3 right-3 text-white p-2 sm:p-3 rounded-full shadow-md transition-transform"
              style={{ backgroundColor: 'var(--primary-color)' }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToCart}
              aria-label="Add to cart"
            >
              <FiShoppingCart size={16} className="sm:w-5 sm:h-5" />
            </motion.button>
          )}

          {/* Out of stock badge */}
          {!product.in_stock && (
            <div className="absolute top-2 left-2 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded">
              Out of Stock
            </div>
          )}

          {/* Featured badge */}
          {product.featured && (
            <div className="absolute top-2 right-2 text-white text-xs font-bold px-2 py-1 rounded" 
              style={{ backgroundColor: 'var(--secondary-color)' }}>
              Featured
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-3 sm:p-4 flex-grow flex flex-col bg-white dark:bg-gray-800">
          <h3 className="font-medium text-base sm:text-lg mb-1 text-gray-900 dark:text-white line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs sm:text-sm mb-2 line-clamp-2 text-gray-600 dark:text-gray-300">
            {product.description}
          </p>
          <div className="mt-auto flex justify-between items-center">
            <span className="font-bold text-sm sm:text-base" style={{ 
              color: 'var(--primary-color)',
            }}>
              {formattedPrice}
            </span>
            <span className="text-xs capitalize text-gray-600 dark:text-gray-400">
              {product.category}
            </span>
          </div>
          
          {/* Available sizes indicator */}
          {product.available_sizes && product.available_sizes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {product.available_sizes.slice(0, 4).map((size, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                >
                  {size}
                </span>
              ))}
              {product.available_sizes.length > 4 && (
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                  +{product.available_sizes.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard; 