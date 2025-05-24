import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase, Product } from "../lib/supabase";
import ProductCarousel from "../components/ui/ProductCarousel";
import tomatoImage from "../assets/tomato.jpeg";

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        // First try to fetch featured products from Supabase
        let { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("featured", true)
          .limit(4);

        if (error) throw error;

        // If no featured products, fall back to recent products
        if (!data || data.length === 0) {
          const { data: recentData, error: recentError } = await supabase
            .from("products")
            .select("*")
            .eq("in_stock", true)
            .order("created_at", { ascending: false })
            .limit(4);

          if (recentError) throw recentError;
          data = recentData || [];
        }

        // Group products by printful_product_id to avoid showing duplicate variants
        const productGroups = new Map();
        (data || []).forEach(product => {
          const groupKey = product.printful_product_id || `standalone_${product.id}`;
          
          if (!productGroups.has(groupKey)) {
            productGroups.set(groupKey, {
              ...product,
              available_sizes: [product.size].filter(Boolean)
            });
          } else {
            const existingGroup = productGroups.get(groupKey);
            
            // Accumulate all sizes from all variants
            const allSizes = [...existingGroup.available_sizes];
            if (product.size && !allSizes.includes(product.size)) {
              allSizes.push(product.size);
            }
            
            // Use the variant with the lowest price as the representative
            if (product.price < existingGroup.price) {
              productGroups.set(groupKey, {
                ...product,
                available_sizes: allSizes
              });
            } else {
              // Keep the existing product but update the sizes
              productGroups.set(groupKey, {
                ...existingGroup,
                available_sizes: allSizes
              });
            }
          }
        });

        // Convert map to array and sort available_sizes
        let groupedProducts = Array.from(productGroups.values()).map(product => ({
          ...product,
          available_sizes: product.available_sizes.sort()
        }));

        // If we have fewer than 4 unique product groups, add individual variants to reach 4 items
        if (groupedProducts.length < 4) {
          const usedProductIds = new Set(groupedProducts.map(p => p.id));
          const additionalVariants = (data || [])
            .filter(product => !usedProductIds.has(product.id))
            .map(product => ({
              ...product,
              available_sizes: [product.size].filter(Boolean)
            }))
            .slice(0, 4 - groupedProducts.length);
          
          groupedProducts = [...groupedProducts, ...additionalVariants];
        }

        setFeaturedProducts(groupedProducts.slice(0, 4));
      } catch (error) {
        console.error("Error fetching featured products:", error);
        setError("Unable to load featured products. Please try again later.");
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section
        className="py-16 md:py-12 bg-gradient-to-r from-primary-lightTomato to-primary-tomato dark:bg-gray-900 text-white"
      >
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl md:text-6xl font-bold font-display mb-6">
                  <span className="">Twomates</span>
                </h1>
                <p className="text-md">
                  Unique designs <br />
                </p>
                <p className="text-md">
                  by two mates <br />
                </p>
              </motion.div>
            </div>
            <div className="flex justify-center my-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative"
              >
                {/* Twomates Logo */}
                <motion.svg
                  width="220"
                  height="90"
                  viewBox="0 0 767 321"
                  xmlns="http://www.w3.org/2000/svg"
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
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
            <div className="flex-1 flex justify-center">
              <Link to="/shop" className="btn btn-secondary">
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll down to mate Section */}
      <section className="py-32 bg-[color:var(--secondary-color)] dark:bg-gray-800">
        <div className="container-custom">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold font-display my-4 text-gray-900 dark:text-white">
                Scroll down ..
              </h2>
              <p className="text-4xl font-bold font-display mt-64 max-w-2xl mx-auto text-gray-900 dark:text-white">
                mate
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container-custom">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold font-display mb-4 text-gray-900 dark:text-white">
                Choose your mates
              </h2>
            
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
          ) : error ? (
            <div className="flex flex-col justify-center items-center h-64 text-center">
              <p className="text-red-500 dark:text-red-400 mb-4 text-lg">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary"
              >
                Try Again
              </button>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="flex justify-center items-center h-64 text-center">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No products available at the moment.
              </p>
            </div>
          ) : (
            <ProductCarousel products={featuredProducts} />
          )}

          <div className="text-center mt-12">
            <Link
              to="/shop"
              className="text-black btn-primary inline-flex items-center px-6 py-3 font-medium rounded-md"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-gray-300 dark:bg-gray-900">
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
                Is not up to us to define
              </p>
              <Link
                to="/about"
                className="inline-flex items-center font-medium text-primary-tomato hover:text-primary-darkTomato dark:text-primary-tomato dark:hover:text-primary-lightTomato"
              >
                Learn why
                <svg
                  className="ml-2 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  ></path>
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
                  src={tomatoImage}
                  alt="Two mates designing clothes"
                  className="w-full h-auto"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
