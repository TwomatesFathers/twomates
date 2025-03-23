import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Product } from '../../lib/supabase';
import { useCart } from '../../context/CartContext';
import { FiShoppingCart } from 'react-icons/fi';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    // Check if sizes array exists and has at least one size
    const defaultSize = product.sizes && product.sizes.length > 0 
      ? product.sizes[0] 
      : 'One Size';
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
        <div className="relative overflow-hidden">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-64 object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Quick add to cart button */}
          <motion.button
            className="absolute bottom-4 right-4 text-white p-3 rounded-full shadow-md transition-transform"
            style={{ backgroundColor: 'var(--primary-color)' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleAddToCart}
            aria-label="Add to cart"
          >
            <FiShoppingCart size={20} />
          </motion.button>

          {/* Out of stock badge */}
          {!product.in_stock && (
            <div className="absolute top-0 left-0 bg-gray-800 text-white text-xs font-bold px-3 py-1">
              Out of Stock
            </div>
          )}

          {/* Featured badge */}
          {product.featured && (
            <div className="absolute top-0 right-0 text-white text-xs font-bold px-3 py-1" 
              style={{ backgroundColor: 'var(--secondary-color)' }}>
              Featured
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 flex-grow flex flex-col bg-white dark:bg-gray-800">
          <h3 className="font-medium text-lg mb-1 text-gray-900 dark:text-white">
            {product.name}
          </h3>
          <p className="text-sm mb-2 line-clamp-2 text-gray-600 dark:text-gray-300">
            {product.description}
          </p>
          <div className="mt-auto flex justify-between items-center">
            <span className="font-bold" style={{ 
              color: 'var(--primary-color)',
            }}>
              {formattedPrice}
            </span>
            <span className="text-xs capitalize text-gray-600 dark:text-gray-400">
              {product.category}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard; 