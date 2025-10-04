import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useAdmin } from '../../context/AdminContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import Logo from '../ui/Logo';
import AnimatedCartIcon from '../ui/AnimatedCartIcon';
import { FiUser, FiMenu, FiX, FiSun, FiMoon } from 'react-icons/fi';

const Header = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { totalItems, itemAddedTrigger } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [rotationState, setRotationState] = useState(0);

  const handleToggleTheme = () => {
    toggleTheme();
    setIsAnimating(true);
    // Update rotation by adding 360 degrees each time
    setRotationState(prev => prev + 360);
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
    <header className="bg-white shadow-sm dark:bg-gray-900 dark:shadow-gray-950 sticky top-0 z-50 transition-colors duration-300">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-text-light hover:text-primary-tomato dark:text-white dark:hover:text-primary-lightTomato transition-colors font-medium">
              Home
            </Link>
            <Link to="/shop" className="text-text-light hover:text-primary-tomato dark:text-white dark:hover:text-primary-lightTomato transition-colors font-medium">
              Shop
            </Link>
            <Link to="/about" className="text-text-light hover:text-primary-tomato dark:text-white dark:hover:text-primary-lightTomato transition-colors font-medium">
              About
            </Link>
            <Link to="/contact" className="text-text-light hover:text-primary-tomato dark:text-white dark:hover:text-primary-lightTomato transition-colors font-medium">
              Contact
            </Link>
            {isAdmin && (
              <Link 
                to="/admin" 
                className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 dark:from-purple-500 dark:to-indigo-500 dark:hover:from-purple-600 dark:hover:to-indigo-600 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
              >
                Admin Panel
              </Link>
            )}
          </nav>

          {/* User, Cart Icons, and Theme Toggle */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <motion.button
              onClick={handleToggleTheme}
              className={`rounded-full p-2 ${isAnimating ? 'theme-switch' : ''} bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-gray-800 dark:text-yellow-300 dark:hover:bg-gray-700 transition-all duration-300`}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: rotationState }}
                transition={{ duration: 0.5 }}
              >
                {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
              </motion.div>
            </motion.button>
            
            <Link 
              to="/cart"
              className="relative text-text-light hover:text-primary-tomato dark:text-white dark:hover:text-primary-lightTomato p-2 transition-colors"
            >
              <AnimatedCartIcon totalItems={totalItems} itemAddedTrigger={itemAddedTrigger} />
            </Link>
            <Link 
              to={user ? "/account" : "/login"}
              className="text-text-light hover:text-primary-tomato dark:text-white dark:hover:text-primary-lightTomato p-2 transition-colors"
            >
              <FiUser size={24} />
            </Link>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-text-light hover:text-primary-tomato dark:text-white dark:hover:text-primary-lightTomato p-2 transition-colors"
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
              <nav className="flex flex-col py-4 space-y-4 bg-white dark:bg-gray-900">
                <Link 
                  to="/" 
                  className="text-text-light hover:text-primary-tomato dark:text-white dark:hover:text-primary-lightTomato transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  to="/shop" 
                  className="text-text-light hover:text-primary-tomato dark:text-white dark:hover:text-primary-lightTomato transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Shop
                </Link>
                <Link 
                  to="/about" 
                  className="text-text-light hover:text-primary-tomato dark:text-white dark:hover:text-primary-lightTomato transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
                <Link 
                  to="/contact" 
                  className="text-text-light hover:text-primary-tomato dark:text-white dark:hover:text-primary-lightTomato transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}

                {/* Mobile Theme Toggle */}
                <div className="flex items-center pt-2">
                  <span className="text-gray-600 dark:text-gray-300 mr-2">Theme:</span>
                  <button
                    onClick={handleToggleTheme}
                    className={`rounded-full p-2 ${isAnimating ? 'theme-switch' : ''} bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-gray-800 dark:text-yellow-300 dark:hover:bg-gray-700 transition-all duration-300 flex items-center`}
                    aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                  >
                    <motion.div
                      initial={{ rotate: 0 }}
                      animate={{ rotate: rotationState }}
                      transition={{ duration: 0.5 }}
                      className="flex items-center justify-center"
                    >
                      {theme === 'light' ? <FiMoon size={16} /> : <FiSun size={16} />}
                    </motion.div>
                    <span className="ml-2">
                      {theme === 'light' ? 'Dark' : 'Light'}
                    </span>
                  </button>
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