import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
  show: boolean;
  style?: React.CSSProperties;
}

const Toast = ({ message, type = 'success', duration = 3000, onClose, show, style }: ToastProps) => {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FiCheck className="text-green-500" size={20} />;
      case 'error':
        return <FiX className="text-red-500" size={20} />;
      default:
        return <FiCheck className="text-blue-500" size={20} />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed top-4 left-4 z-50 max-w-[calc(100vw-2rem)] sm:max-w-sm"
          initial={{ opacity: 0, x: -50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -50, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={style}
        >
          <div className={`flex items-center p-4 rounded-lg border shadow-lg ${getBgColor()}`}>
            <div className="flex items-center space-x-3">
              {getIcon()}
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {message}
              </span>
              <span className="text-lg">🍅</span>
            </div>
            <button
              onClick={onClose}
              className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <FiX size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast; 