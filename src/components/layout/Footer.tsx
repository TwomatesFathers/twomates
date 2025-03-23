import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';
import { FiInstagram, FiTwitter, FiFacebook } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { theme } = useTheme();

  return (
    <footer className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t transition-colors duration-300`}>
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="col-span-1 md:col-span-1">
            <Logo />
            <p className={`mt-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Twomates - Fun, creative clothing crafted by friends with passion.
            </p>
            <div className="flex mt-6 space-x-4">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`${theme === 'dark' ? 'text-gray-300 hover:text-primary-lightTomato' : 'text-gray-500 hover:text-primary-tomato'} transition-colors`}
                aria-label="Instagram"
              >
                <FiInstagram size={20} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`${theme === 'dark' ? 'text-gray-300 hover:text-primary-lightTomato' : 'text-gray-500 hover:text-primary-tomato'} transition-colors`}
                aria-label="Twitter"
              >
                <FiTwitter size={20} />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`${theme === 'dark' ? 'text-gray-300 hover:text-primary-lightTomato' : 'text-gray-500 hover:text-primary-tomato'} transition-colors`}
                aria-label="Facebook"
              >
                <FiFacebook size={20} />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div className="col-span-1">
            <h3 className={`text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-text-dark' : 'text-text-light'}`}>Shop</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/shop" className={`${theme === 'dark' ? 'text-gray-300 hover:text-primary-lightTomato' : 'text-gray-600 hover:text-primary-tomato'} transition-colors`}>
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/shop?category=tshirts" className={`${theme === 'dark' ? 'text-gray-300 hover:text-primary-lightTomato' : 'text-gray-600 hover:text-primary-tomato'} transition-colors`}>
                  T-Shirts
                </Link>
              </li>
              <li>
                <Link to="/shop?category=hoodies" className={`${theme === 'dark' ? 'text-gray-300 hover:text-primary-lightTomato' : 'text-gray-600 hover:text-primary-tomato'} transition-colors`}>
                  Hoodies
                </Link>
              </li>
              <li>
                <Link to="/shop?category=accessories" className={`${theme === 'dark' ? 'text-gray-300 hover:text-primary-lightTomato' : 'text-gray-600 hover:text-primary-tomato'} transition-colors`}>
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="col-span-1">
            <h3 className={`text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-text-dark' : 'text-text-light'}`}>Company</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/about" className={`${theme === 'dark' ? 'text-gray-300 hover:text-primary-lightTomato' : 'text-gray-600 hover:text-primary-tomato'} transition-colors`}>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className={`${theme === 'dark' ? 'text-gray-300 hover:text-primary-lightTomato' : 'text-gray-600 hover:text-primary-tomato'} transition-colors`}>
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/terms" className={`${theme === 'dark' ? 'text-gray-300 hover:text-primary-lightTomato' : 'text-gray-600 hover:text-primary-tomato'} transition-colors`}>
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className={`${theme === 'dark' ? 'text-gray-300 hover:text-primary-lightTomato' : 'text-gray-600 hover:text-primary-tomato'} transition-colors`}>
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="col-span-1">
            <h3 className={`text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-text-dark' : 'text-text-light'}`}>Support</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/faq" className={`${theme === 'dark' ? 'text-gray-300 hover:text-primary-lightTomato' : 'text-gray-600 hover:text-primary-tomato'} transition-colors`}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/shipping" className={`${theme === 'dark' ? 'text-gray-300 hover:text-primary-lightTomato' : 'text-gray-600 hover:text-primary-tomato'} transition-colors`}>
                  Shipping Information
                </Link>
              </li>
              <li>
                <Link to="/returns" className={`${theme === 'dark' ? 'text-gray-300 hover:text-primary-lightTomato' : 'text-gray-600 hover:text-primary-tomato'} transition-colors`}>
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link to="/contact" className={`${theme === 'dark' ? 'text-gray-300 hover:text-primary-lightTomato' : 'text-gray-600 hover:text-primary-tomato'} transition-colors`}>
                  Get Help
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Copyright */}
        <div className={`${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} border-t mt-10 pt-8 flex flex-col md:flex-row justify-between items-center`}>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>&copy; {currentYear} Twomates. All rights reserved.</p>
          <div className="mt-4 md:mt-0">
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Made with ❤️ by mates</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 