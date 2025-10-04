import Logo from '../ui/Logo';
import { FiInstagram, FiTwitter, FiFacebook } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700 transition-colors duration-300">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1">
          {/* Logo and About */}
          <div className="col-span-1">
            <Logo />
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Twomates - Fun, creative clothing crafted by mates with passion.
            </p>
            <div className="flex mt-6 space-x-4">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-primary-tomato dark:text-gray-300 dark:hover:text-primary-lightTomato transition-colors"
                aria-label="Instagram"
              >
                <FiInstagram size={20} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-primary-tomato dark:text-gray-300 dark:hover:text-primary-lightTomato transition-colors"
                aria-label="Twitter"
              >
                <FiTwitter size={20} />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-primary-tomato dark:text-gray-300 dark:hover:text-primary-lightTomato transition-colors"
                aria-label="Facebook"
              >
                <FiFacebook size={20} />
              </a>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">&copy; {currentYear} Twomates. All rights reserved.</p>
          <div className="mt-4 md:mt-0">
            <p className="text-sm text-gray-500 dark:text-gray-400">Made with ❤️ by mates</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 