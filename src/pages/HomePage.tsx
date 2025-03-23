import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase, Product } from '../lib/supabase';
import ProductCard from '../components/shop/ProductCard';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setLoading(true);
      try {
        // Fetch featured products from Supabase
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('featured', true)
          .limit(4);

        if (error) throw error;
        setFeaturedProducts(data || []);
      } catch (error) {
        console.error('Error fetching featured products:', error);
        // Use mock data if there's an error
        setFeaturedProducts(mockProducts as Product[]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-primary-lightTomato to-primary-tomato dark:bg-gray-900 text-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl md:text-6xl font-bold font-display mb-6">
                  Wear Your <span className="text-secondary-green">Creativity</span>
                </h1>
                <p className="text-lg mb-8">
                  Unique designs created by friends. Express yourself with our fun, colorful clothing.
                </p>
                <div className="flex space-x-4">
                  <Link to="/shop" className="btn btn-secondary">
                    Shop Now
                  </Link>
                  <Link to="/about" className="our-story-btn btn">
                    Our Story
                  </Link>
                </div>
              </motion.div>
            </div>
            <div className="hidden md:flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative"
              >
                {/* Twomates Logo */}
                <motion.svg 
                  width="500" 
                  height="300" 
                  viewBox="0 0 767 321" 
                  xmlns="http://www.w3.org/2000/svg"
                  animate={{ 
                    y: [0, -10, 0],
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                  className="dark:drop-shadow-none drop-shadow-md"
                >
                  <image  
                    width="761" 
                    height="311" 
                    href="/Twomates.svg"
                    className="brightness-110 dark:brightness-150 dark:drop-shadow-[0_0_4px_rgba(255,255,255,0.6)]"
                  />
                </motion.svg>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container-custom">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold font-display mb-4 text-gray-900 dark:text-white">
                Featured Products
              </h2>
              <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300">
                Check out our most popular items, loved by customers worldwide.
              </p>
            </motion.div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <motion.div 
                className="w-16 h-16 border-4 border-primary-tomato border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map(product => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link 
              to="/shop" 
              className="view-all-products-btn inline-flex items-center px-6 py-3 font-medium rounded-md"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="order-2 md:order-1"
            >
              <h2 className="text-3xl font-bold font-display mb-4 text-gray-900 dark:text-white">
                Our Story
              </h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                Twomates started when two friends with a passion for art and fashion decided to create clothing that's as unique as the friendship that inspired it.
              </p>
              <p className="mb-6 text-gray-700 dark:text-gray-300">
                Every design tells a story of creativity, fun, and the joy of collaboration. When you wear our clothes, you become part of that story.
              </p>
              <Link 
                to="/about" 
                className="inline-flex items-center font-medium text-primary-tomato hover:text-primary-darkTomato dark:text-primary-tomato dark:hover:text-primary-lightTomato"
              >
                Learn more about us
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="order-1 md:order-2"
            >
              <div className="rounded-lg overflow-hidden shadow-lg bg-gray-50 dark:bg-gray-800">
                <img 
                  src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                  alt="Two friends designing clothes" 
                  className="w-full h-auto"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold font-display mb-4 text-gray-900 dark:text-white">
              Join Our Newsletter
            </h2>
            <p className="mb-8 text-gray-700 dark:text-gray-300">
              Subscribe to get special offers, free giveaways, and exclusive deals.
            </p>
            <form className="flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-grow px-4 py-3 rounded-md bg-white border-gray-300 text-gray-900 focus:ring-primary-tomato focus:border-primary-tomato dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400 dark:focus:ring-primary-tomato dark:focus:border-primary-tomato"
                required 
              />
              <button 
                type="submit" 
                className="btn btn-primary px-6 py-3 whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

// Update mock products to match the Product type
const mockProducts: Product[] = [
  {
    id: 1,
    name: "Classic Tomato Tee",
    price: 29.99,
    description: "Our signature t-shirt with the friendly tomato mascot.",
    image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80",
    category: "t-shirts",
    featured: true,
    in_stock: true,
    sizes: ["S", "M", "L", "XL"],
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Tomato Friends Hoodie",
    price: 49.99,
    description: "Stay cozy with our premium hoodie featuring the tomato friends.",
    image_url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    category: "hoodies",
    featured: true,
    in_stock: true,
    sizes: ["S", "M", "L", "XL", "XXL"],
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Tomato Cap",
    price: 24.99,
    description: "A stylish cap with our signature tomato embroidered on the front.",
    image_url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    category: "accessories",
    featured: true,
    in_stock: true,
    sizes: ["One Size"],
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    name: "Limited Edition Graphic Tee",
    price: 34.99,
    description: "A limited edition t-shirt with a unique tomato-inspired graphic design.",
    image_url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    category: "t-shirts",
    featured: true,
    in_stock: true,
    sizes: ["S", "M", "L", "XL"],
    created_at: new Date().toISOString(),
  },
];

export default HomePage; 