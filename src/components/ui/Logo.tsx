import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const Logo = ({ className = '' }: { className?: string }) => {
  const { theme } = useTheme();
  
  return (
    <div className={`flex items-center ${className}`}>
      <motion.div 
        className="flex items-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Twomates SVG Logo */}
        <motion.svg 
          width="80" 
          height="40" 
          viewBox="0 0 767 321" 
          xmlns="http://www.w3.org/2000/svg"
          className="mr-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <image  
            width="761" 
            height="311" 
            href="/Twomates.svg"
            style={{ 
              filter: theme === 'dark' 
                ? 'brightness(1.5) drop-shadow(0 0 4px rgba(255, 255, 255, 0.6))' 
                : 'none' 
            }}
          />
        </motion.svg>
        
        {/* Brand name - hidden since it's included in the SVG */}
        <div className="sr-only">Twomates</div>
      </motion.div>
    </div>
  );
};

export default Logo; 