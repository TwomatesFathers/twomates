import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import Logo from '../ui/Logo';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiSun, FiMoon } from 'react-icons/fi';

const Header = () => {
  const { user } = useAuth();
  const { totalItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggleTheme = () => {
    toggleTheme();
    setIsAnimating(true);
  };

  useEffect(() => {
    if (isAnimating) {
      const timeout = setTimeout(() => {
        setIsAnimating(false);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isAnimating]);

  return (
    <header className={`${theme === 'dark' ? 'bg-gray-900 shadow-gray-950' : 'bg-white shadow-sm'} sticky top-0 z-50 transition-colors duration-300`}>
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`${theme === 'dark' ? 'text-white hover:text-primary-lightTomato' : 'text-text-light hover:text-primary-tomato'} transition-colors font-medium`}>
              Home
            </Link>
            <Link to="/shop" className={`${theme === 'dark' ? 'text-white hover:text-primary-lightTomato' : 'text-text-light hover:text-primary-tomato'} transition-colors font-medium`}>
              Shop
            </Link>
            <Link to="/about" className={`${theme === 'dark' ? 'text-white hover:text-primary-lightTomato' : 'text-text-light hover:text-primary-tomato'} transition-colors font-medium`}>
              About
            </Link>
            <Link to="/contact" className={`${theme === 'dark' ? 'text-white hover:text-primary-lightTomato' : 'text-text-light hover:text-primary-tomato'} transition-colors font-medium`}>
              Contact
            </Link>
          </nav>

          {/* User, Cart Icons, and Theme Toggle */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <motion.button
              onClick={handleToggleTheme}
              className={`rounded-full p-2 ${isAnimating ? 'theme-switch' : ''} ${
                theme === 'dark' 
                  ? 'bg-gray-800 text-yellow-300 hover:bg-gray-700' 
                  : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
              } transition-all duration-300`}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: isAnimating ? 360 : 0 }}
                transition={{ duration: 0.5 }}
              >
                {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
              </motion.div>
            </motion.button>
            
            <Link 
              to="/cart"
              className={`relative ${theme === 'dark' ? 'text-white hover:text-primary-lightTomato' : 'text-text-light hover:text-primary-tomato'} p-2 transition-colors`}
            >
              <FiShoppingCart size={24} />
              {totalItems > 0 && (
                <motion.div 
                  className="absolute -top-1 -right-1 bg-primary-tomato text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                >
                  {totalItems}
                </motion.div>
              )}
            </Link>
            <Link 
              to={user ? "/account" : "/login"}
              className={`${theme === 'dark' ? 'text-white hover:text-primary-lightTomato' : 'text-text-light hover:text-primary-tomato'} p-2 transition-colors`}
            >
              <FiUser size={24} />
            </Link>
            
            {/* Mobile Menu Button */}
            <button 
              className={`md:hidden ${theme === 'dark' ? 'text-white hover:text-primary-lightTomato' : 'text-text-light hover:text-primary-tomato'} p-2 transition-colors`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <nav className={`flex flex-col py-4 space-y-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                <Link 
                  to="/" 
                  className={`${theme === 'dark' ? 'text-white hover:text-primary-lightTomato' : 'text-text-light hover:text-primary-tomato'} transition-colors font-medium`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  to="/shop" 
                  className={`${theme === 'dark' ? 'text-white hover:text-primary-lightTomato' : 'text-text-light hover:text-primary-tomato'} transition-colors font-medium`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Shop
                </Link>
                <Link 
                  to="/about" 
                  className={`${theme === 'dark' ? 'text-white hover:text-primary-lightTomato' : 'text-text-light hover:text-primary-tomato'} transition-colors font-medium`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
                <Link 
                  to="/contact" 
                  className={`${theme === 'dark' ? 'text-white hover:text-primary-lightTomato' : 'text-text-light hover:text-primary-tomato'} transition-colors font-medium`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>

                {/* Mobile Theme Toggle */}
                <div className="flex items-center pt-2">
                  <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mr-2`}>Theme:</span>
                  <motion.button
                    onClick={handleToggleTheme}
                    className={`rounded-full p-2 ${isAnimating ? 'theme-switch' : ''} ${
                      theme === 'dark' 
                        ? 'bg-gray-800 text-yellow-300 hover:bg-gray-700' 
                        : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                    } transition-all duration-300`}
                    aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      initial={{ rotate: 0 }}
                      animate={{ rotate: isAnimating ? 360 : 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      {theme === 'light' ? (
                        <span className="flex items-center"><FiMoon size={16} /><span className="ml-2">Dark</span></span>
                      ) : (
                        <span className="flex items-center"><FiSun size={16} /><span className="ml-2">Light</span></span>
                      )}
                    </motion.div>
                  </motion.button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header; 