import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';
import { FiInstagram, FiTwitter, FiFacebook } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700 transition-colors duration-300">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="col-span-1 md:col-span-1">
            <Logo />
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Twomates - Fun, creative clothing crafted by friends with passion.
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

          {/* Shop Links */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-light dark:text-text-dark">Shop</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/shop" className="text-gray-600 hover:text-primary-tomato dark:text-gray-300 dark:hover:text-primary-lightTomato transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/shop?category=tshirts" className="text-gray-600 hover:text-primary-tomato dark:text-gray-300 dark:hover:text-primary-lightTomato transition-colors">
                  T-Shirts
                </Link>
              </li>
              <li>
                <Link to="/shop?category=hoodies" className="text-gray-600 hover:text-primary-tomato dark:text-gray-300 dark:hover:text-primary-lightTomato transition-colors">
                  Hoodies
                </Link>
              </li>
              <li>
                <Link to="/shop?category=accessories" className="text-gray-600 hover:text-primary-tomato dark:text-gray-300 dark:hover:text-primary-lightTomato transition-colors">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-light dark:text-text-dark">Company</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/about" className="text-gray-600 hover:text-primary-tomato dark:text-gray-300 dark:hover:text-primary-lightTomato transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-primary-tomato dark:text-gray-300 dark:hover:text-primary-lightTomato transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-primary-tomato dark:text-gray-300 dark:hover:text-primary-lightTomato transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-primary-tomato dark:text-gray-300 dark:hover:text-primary-lightTomato transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-light dark:text-text-dark">Support</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-primary-tomato dark:text-gray-300 dark:hover:text-primary-lightTomato transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-600 hover:text-primary-tomato dark:text-gray-300 dark:hover:text-primary-lightTomato transition-colors">
                  Shipping Information
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-gray-600 hover:text-primary-tomato dark:text-gray-300 dark:hover:text-primary-lightTomato transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-primary-tomato dark:text-gray-300 dark:hover:text-primary-lightTomato transition-colors">
                  Get Help
                </Link>
              </li>
            </ul>
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