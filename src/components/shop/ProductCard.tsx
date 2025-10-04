import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Product } from '../../lib/supabase';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { FiShoppingCart } from 'react-icons/fi';

interface ProductCardProps {
  product: Product;
  showCartButton?: boolean;
}

const ProductCard = ({ product, showCartButton = true }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { showToast } = useToast();

  // Function to sort sizes from small to large
  const sortSizes = (sizes: string[]): string[] => {
    const sizeOrder: { [key: string]: number } = {
      'XXS': 1, 'XS': 2, 'S': 3, 'M': 4, 'L': 5, 'XL': 6, 'XXL': 7, 'XXXL': 8,
      '2XS': 1, '3XS': 0,
      '2XL': 7, '3XL': 8, '4XL': 9, '5XL': 10,
      'One Size': 999, 'OS': 999, 'Free Size': 999
    };

    return [...sizes].sort((a, b) => {
      const aUpper = a.toUpperCase();
      const bUpper = b.toUpperCase();
      
      // Check if both sizes are in the predefined order
      if (sizeOrder[aUpper] !== undefined && sizeOrder[bUpper] !== undefined) {
        return sizeOrder[aUpper] - sizeOrder[bUpper];
      }
      
      // Check if both are numeric
      const aNum = parseFloat(a);
      const bNum = parseFloat(b);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      
      // If one is in predefined order and other is not
      if (sizeOrder[aUpper] !== undefined) return -1;
      if (sizeOrder[bUpper] !== undefined) return 1;
      
      // If one is numeric and other is not
      if (!isNaN(aNum)) return -1;
      if (!isNaN(bNum)) return 1;
      
      // Default alphabetical sort
      return a.localeCompare(b);
    });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    // Use the product's size or available_sizes, with fallback
    const defaultSize = product.available_sizes && product.available_sizes.length > 0 
      ? product.available_sizes[0] 
      : product.size || 'One Size';
    addToCart(product.id, 1, defaultSize);
    showToast('Item added to cart successfully!');
  };

  // Format price with currency
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(product.price);

  // Sort available sizes
  const sortedSizes = product.available_sizes ? sortSizes(product.available_sizes) : [];

  return (
    <Link to={`/product/${product.id}`} className="group">
      <div className="card h-full flex flex-col transition-all duration-300 hover:shadow-lg bg-white dark:bg-gray-800 dark:border dark:border-gray-700 dark:hover:shadow-gray-700 hover:shadow-gray-300 shadow-sm">
        {/* Product Image */}
        <div className="relative overflow-hidden rounded-t-lg bg-white dark:bg-white">
          <div className="p-2 sm:p-3">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-60 sm:h-68 md:h-60 lg:h-68 object-contain object-center transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
          
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
          </div>
          
          {/* Available sizes indicator */}
          {sortedSizes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {sortedSizes.slice(0, 4).map((size, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                >
                  {size}
                </span>
              ))}
              {sortedSizes.length > 4 && (
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                  +{sortedSizes.length - 4} more
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