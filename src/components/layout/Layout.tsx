import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import { useTheme } from '../../context/ThemeContext';
import { useEffect } from 'react';

const Layout = () => {
  const { theme } = useTheme();
  
  useEffect(() => {
    // Ensure document class is synced with theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-gray-900 text-text-light dark:text-white">
      <Header />
      <motion.main 
        className="flex-grow"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Outlet />
      </motion.main>
      <Footer />
    </div>
  );
};

export default Layout; 