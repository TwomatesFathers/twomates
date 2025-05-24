import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Product } from '../../lib/supabase';
import ProductCard from '../shop/ProductCard';

interface ProductCarouselProps {
  products: Product[];
}

const ProductCarousel = ({ products }: ProductCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full">
      {/* Desktop Grid - Hidden on mobile */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <ProductCard product={product} showCartButton={false} />
          </motion.div>
        ))}
      </div>

      {/* Mobile Carousel - Visible only on mobile */}
      <div className="md:hidden relative overflow-hidden">
        {/* Carousel Container */}
        <div
          ref={containerRef}
          className="relative h-auto"
        >
          <motion.div
            className="flex"
            animate={{
              x: `${-currentIndex * 100}%`,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDrag={(e, { offset }) => {
              setDragOffset(offset.x);
            }}
            onDragEnd={(e, { offset, velocity }) => {
              const swipeThreshold = 50;
              const swipeVelocityThreshold = 500;

              if (
                offset.x > swipeThreshold ||
                velocity.x > swipeVelocityThreshold
              ) {
                prevSlide();
              } else if (
                offset.x < -swipeThreshold ||
                velocity.x < -swipeVelocityThreshold
              ) {
                nextSlide();
              }
              setDragOffset(0);
            }}
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                className="w-full flex-shrink-0 px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="max-w-sm mx-auto">
                  <ProductCard product={product} showCartButton={false} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Navigation Arrows */}
        {products.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 backdrop-blur-sm"
              aria-label="Previous product"
            >
              <FiChevronLeft className="w-5 h-5 text-gray-800 dark:text-white" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 backdrop-blur-sm"
              aria-label="Next product"
            >
              <FiChevronRight className="w-5 h-5 text-gray-800 dark:text-white" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {products.length > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            {products.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? 'bg-primary-tomato dark:bg-primary-lightTomato w-8'
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
                aria-label={`Go to product ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Progress Bar */}
        <div className="mt-4 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary-tomato dark:bg-primary-lightTomato rounded-full"
            initial={{ width: "0%" }}
            animate={{
              width: `${((currentIndex + 1) / products.length) * 100}%`,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductCarousel; 