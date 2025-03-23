import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import Logo from '../components/ui/Logo';

const NotFoundPage = () => {
  const { theme } = useTheme();
  
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-6xl font-bold font-display text-primary-tomato mb-6">404</h1>
        <h2 className={`text-3xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Page Not Found</h2>
        <p className={`max-w-md mx-auto mb-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Oops! It seems we couldn't find the page you're looking for.
        </p>
        
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Logo className="scale-150 mb-4" />
        </div>
        
        <Link 
          to="/"
          className={`inline-flex items-center px-6 py-3 rounded-md font-medium ${
            theme === 'dark' 
              ? 'bg-primary-tomato hover:bg-primary-darkTomato' 
              : 'bg-primary-tomato hover:bg-primary-darkTomato'
          } text-white transition-colors`}
        >
          <FiArrowLeft className="mr-2" />
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFoundPage; 