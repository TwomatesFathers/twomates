import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../layout/Header';
import Footer from '../layout/Footer';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 dark:bg-gray-900 dark:text-white overflow-x-hidden no-horizontal-overflow">
      <Header />
      <motion.main 
        className="flex-grow overflow-x-hidden no-horizontal-overflow"
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