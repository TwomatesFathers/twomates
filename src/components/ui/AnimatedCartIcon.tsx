import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AnimatedCartIconProps {
  totalItems: number;
  size?: number;
  className?: string;
  itemAddedTrigger?: number;
}

const AnimatedCartIcon = ({ totalItems, size = 24, className = '', itemAddedTrigger = 0 }: AnimatedCartIconProps) => {
  const [previousItems, setPreviousItems] = useState(totalItems);
  const [showAddAnimation, setShowAddAnimation] = useState(false);

  useEffect(() => {
    if (totalItems > previousItems || itemAddedTrigger > 0) {
      setShowAddAnimation(true);
      setTimeout(() => setShowAddAnimation(false), 600);
    }
    setPreviousItems(totalItems);
  }, [totalItems, previousItems, itemAddedTrigger]);

  // Calculate how many tomatoes to show (allow more tomatoes to fill the cart)
  const tomatoCount = Math.min(totalItems, 6); // Show up to 6 tomatoes
  const tomatoes = Array.from({ length: tomatoCount }, (_, i) => i);

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Cart outline */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="relative z-10"
      >
        <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" />
        <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" />
        <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" />
      </svg>

      {/* Tomatoes inside cart */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ left: '8%' }}>
        <div className="relative" style={{ width: size * 0.5, height: size * 0.4 }}>
          <AnimatePresence>
            {tomatoes.map((index) => (
              <motion.div
                key={`tomato-${index}`}
                className="absolute"
                style={{
                  width: size * 0.18,
                  height: size * 0.18,
                  left: `${15 + (index % 3) * 30}%`,
                  bottom: `${Math.floor(index / 3) * 45 + 5}%`,
                }}
                initial={{ 
                  scale: 0, 
                  y: 0,
                  opacity: 0,
                  rotate: 0
                }}
                animate={{ 
                  scale: 1, 
                  y: 0,
                  opacity: 1,
                  rotate: 0
                }}
                exit={{ 
                  scale: 0, 
                  opacity: 0,
                  transition: { duration: 0.2 }
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 20,
                  delay: index * 0.1
                }}
              >
                {/* Tomato emoji/icon */}
                <div 
                  className="w-full h-full rounded-full flex items-center justify-center text-red-500"
                  style={{ fontSize: size * 0.15 }}
                >
                  🍅
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Add animation effect */}
      <AnimatePresence>
        {showAddAnimation && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.2, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Ripple effect */}
            <motion.div
              className="absolute inset-0 border-2 border-primary-tomato rounded-full"
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
            
            {/* Flying tomato animation */}
            <motion.div
              className="absolute"
              style={{
                top: '10%',
                left: '60%',
                fontSize: size * 0.16,
              }}
              initial={{ 
                x: '-50%', 
                y: '-60%', 
                scale: 0,
                rotate: 0
              }}
              animate={{ 
                x: ['-50%', '-10%', '-30%'],
                y: ['-60%', '-10%', '40%'],
                scale: [0, 1.1, 0.9],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 0.7,
                times: [0, 0.5, 1],
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              🍅
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Item count badge */}
      {totalItems > 0 && (
        <motion.div 
          className="absolute -top-2 -right-2 bg-primary-tomato text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-xs font-bold z-20 px-1"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          key={totalItems} // Re-animate when count changes
        >
          <motion.span
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 10 }}
            className="text-[11px] leading-none font-bold"
          >
            {totalItems > 99 ? '99+' : totalItems}
          </motion.span>
        </motion.div>
      )}
    </div>
  );
};

export default AnimatedCartIcon; 