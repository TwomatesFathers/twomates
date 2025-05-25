import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, Product } from "../lib/supabase";
import ProductCarousel from "../components/ui/ProductCarousel";

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0);

  // Array of logo designs to cycle through
  const logoDesigns = [
    { src: "/twomates.png", alt: "Twomates PNG", size: "w-full h-full lg:w-full lg:h-full xl:w-full xl:h-full" },
    { src: "/rocket.png", alt: "Rocket Design", size: "w-full h-full lg:w-full lg:h-full xl:w-full xl:h-full" },
    { src: "/splat.png", alt: "Splat Design", size: "w-full h-full lg:w-full lg:h-full xl:w-full xl:h-full" },
    { src: "/komsaa.png", alt: "Komsaa Design", size: "w-3/4 h-3/4 lg:w-5/6 lg:h-5/6 xl:w-full xl:h-full" },
    { src: "/hest.png", alt: "Hest Design", size: "w-5/6 h-5/6 lg:w-full lg:h-full xl:w-full xl:h-full" },
    { src: "/villrede.png", alt: "Villrede Design", size: "w-4/5 h-4/5 lg:w-5/6 lg:h-5/6 xl:w-full xl:h-full" },
    { src: "/umoden.png", alt: "Umoden Design", size: "w-3/4 h-3/4 lg:w-5/6 lg:h-5/6 xl:w-full xl:h-full" },
  ];

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLogoIndex((prev) => (prev + 1) % logoDesigns.length);
    }, 5000); // Change every 5 seconds (increased from 3)

    return () => clearInterval(interval);
  }, [logoDesigns.length]);

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
          .eq("in_stock", true)
          .limit(20); // Fetch more to have enough for grouping

        if (error) throw error;

        // If no featured products, fall back to recent products
        if (!data || data.length === 0) {
          const { data: recentData, error: recentError } = await supabase
            .from("products")
            .select("*")
            .eq("in_stock", true)
            .order("created_at", { ascending: false })
            .limit(20); // Fetch more to have enough for grouping

          if (recentError) throw recentError;
          data = recentData || [];
        }

        // Group products by printful_product_id to get unique base products
        const productGroups = new Map<string, Product>();

        (data || []).forEach((product) => {
          const groupKey =
            product.printful_product_id || `standalone_${product.id}`;

          if (!productGroups.has(groupKey)) {
            // First variant of this product - use it as the representative
            productGroups.set(groupKey, {
              ...product,
              available_sizes: [product.size].filter(Boolean),
            });
          } else {
            // Additional variant - update the representative product
            const existingProduct = productGroups.get(groupKey)!;

            // Collect all unique sizes
            const existingSizes = existingProduct.available_sizes || [];
            const allSizes = new Set(
              [...existingSizes, product.size].filter(Boolean)
            );

            // Choose the variant with the best attributes as representative
            // Priority: featured > in_stock > lowest price > first variant
            let shouldUpdate = false;

            if (!existingProduct.featured && product.featured) {
              shouldUpdate = true;
            } else if (existingProduct.featured === product.featured) {
              if (!existingProduct.in_stock && product.in_stock) {
                shouldUpdate = true;
              } else if (existingProduct.in_stock === product.in_stock) {
                if (product.price < existingProduct.price) {
                  shouldUpdate = true;
                }
              }
            }

            if (shouldUpdate) {
              productGroups.set(groupKey, {
                ...product,
                available_sizes: Array.from(allSizes).sort(),
              });
            } else {
              // Keep existing representative but update sizes
              productGroups.set(groupKey, {
                ...existingProduct,
                available_sizes: Array.from(allSizes).sort(),
              });
            }
          }
        });

        // Convert to array and take first 4 unique products
        const uniqueProducts = Array.from(productGroups.values()).slice(0, 4);

        setFeaturedProducts(uniqueProducts);
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
      <section className="py-16 md:py-20 lg:py-24 xl:py-32 bg-gradient-to-r from-primary-lightTomato to-primary-tomato dark:bg-gray-900 text-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[60vh] lg:min-h-[70vh]">
            {/* Left: Text Content */}
            <div className="lg:col-span-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="lg:ml-16 xl:ml-20"
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold font-display mb-6">
                  <span className="">Twomates</span>
                </h1>
                <p className="text-lg md:text-xl lg:text-2xl mb-2">
                  Unique designs <br />
                </p>
                <p className="text-lg md:text-xl lg:text-2xl mb-8">
                  by two mates <br />
                </p>
                {/* Shop Now Button - Centered on mobile, left-aligned on desktop */}
                <div className="flex justify-center lg:justify-start">
                  <Link
                    to="/shop"
                    className="btn btn-secondary text-lg px-8 py-4"
                  >
                    Shop Now
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Right: Logo Carousel */}
            <div className="lg:col-span-1 flex justify-center my-8 lg:my-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative w-[28rem] h-56 md:w-[32rem] md:h-64 lg:w-[40rem] lg:h-80 xl:w-[44rem] xl:h-88"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentLogoIndex}
                    initial={{ 
                      opacity: 0, 
                      scale: 0.8,
                      rotateY: -90,
                      z: -100
                    }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      rotateY: 0,
                      z: 0,
                      y: [0, -10, 0]
                    }}
                    exit={{ 
                      opacity: 0, 
                      scale: 1.2,
                      rotateY: 90,
                      z: 100
                    }}
                    transition={{
                      opacity: { duration: 0.5 },
                      scale: { duration: 0.5 },
                      rotateY: { duration: 0.6, ease: "easeInOut" },
                      z: { duration: 0.6, ease: "easeInOut" },
                      y: { 
                        duration: 4, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: 0.6
                      }
                    }}
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ perspective: "1000px" }}
                  >
                    <img
                      src={logoDesigns[currentLogoIndex].src}
                      alt={logoDesigns[currentLogoIndex].alt}
                      className={`${logoDesigns[currentLogoIndex].size} object-contain brightness-110 dark:brightness-150 dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] drop-shadow-lg`}
                    />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll down to mate Section - Unnecessarily Long */}
      <section className="py-16 md:py-20 lg:py-24 bg-[color:var(--secondary-color)] dark:bg-[color:var(--secondary-color)]">
        <div className="container-custom">
          {/* Step 1: Scroll down */}
          <div className="text-center min-h-[80vh] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display text-gray-900 dark:text-white">
                Scroll down ..
              </h2>
            </motion.div>
          </div>

          {/* Step 2: A little more */}
          <div className="text-center min-h-[80vh] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display text-gray-900 dark:text-white">
                a little more
              </h2>
            </motion.div>
          </div>

          {/* Step 2.5: ap ap, hold up */}
          <div className="text-center min-h-[80vh] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col items-center"
            >
              <img
                src="/stop.png"
                alt="Hold up"
                className="w-40 h-40 md:w-52 md:h-52 lg:w-64 lg:h-64 mb-6 object-contain brightness-100 dark:brightness-125"
              />
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display text-gray-900 dark:text-white">
                ap ap, hold up
              </h2>
            </motion.div>
          </div>

          {/* Step 3: Almost there */}
          <div className="text-center min-h-[80vh] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display text-gray-900 dark:text-white">
                almost there
              </h2>
            </motion.div>
          </div>

          {/* Step 4: A little bit further */}
          <div className="text-center min-h-[80vh] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display text-gray-900 dark:text-white">
                a little bit further
              </h2>
            </motion.div>
          </div>

          {/* Step 4.5: wait... */}
          <div className="text-center min-h-[80vh] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col items-center"
            >
              <img
                src="/wait.png"
                alt="Wait"
                className="w-40 h-40 md:w-52 md:h-52 lg:w-64 lg:h-64 mb-6 object-contain brightness-100 dark:brightness-125"
              />
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display text-gray-900 dark:text-white">
                wait...
              </h2>
            </motion.div>
          </div>

          {/* Step 5: Just a little bittle further */}
          <div className="text-center min-h-[80vh] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display text-gray-900 dark:text-white">
                just a little bittle further
              </h2>
            </motion.div>
          </div>

          {/* Step 5.5: okay move on */}
          <div className="text-center min-h-[80vh] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col items-center"
            >
              <img
                src="/go.png"
                alt="Move on"
                className="w-40 h-40 md:w-52 md:h-52 lg:w-64 lg:h-64 mb-6 object-contain brightness-100 dark:brightness-125"
              />
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display text-gray-900 dark:text-white">
                okay move on
              </h2>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 md:py-20 lg:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container-custom">
          <div className="text-center mb-12 lg:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold font-display mb-4 text-gray-900 dark:text-white">
                Choose your mates
              </h2>
            </motion.div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64 lg:h-80">
              <motion.div
                className="w-16 h-16 lg:w-20 lg:h-20 border-4 border-primary-tomato border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          ) : error ? (
            <div className="flex flex-col justify-center items-center h-64 lg:h-80 text-center">
              <p className="text-red-500 dark:text-red-400 mb-4 text-lg lg:text-xl">
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary text-lg px-6 py-3"
              >
                Try Again
              </button>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="flex justify-center items-center h-64 lg:h-80 text-center">
              <p className="text-gray-600 dark:text-gray-400 text-lg lg:text-xl">
                No products available at the moment.
              </p>
            </div>
          ) : (
            <ProductCarousel products={featuredProducts} />
          )}

          <div className="text-center mt-12 lg:mt-16">
            <Link
              to="/shop"
              className="text-black btn-primary inline-flex items-center px-8 py-4 font-medium rounded-md text-lg"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 md:py-20 lg:py-24 bg-gray-300 dark:bg-gray-900">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display mb-6 text-gray-900 dark:text-white">
                Our Story
              </h2>
              <p className="mb-8 text-lg md:text-xl lg:text-2xl text-gray-700 dark:text-gray-300">
                Is not up to us to define
              </p>
              <Link
                to="/about"
                className="inline-flex items-center font-medium text-lg md:text-xl text-primary-tomato hover:text-primary-darkTomato dark:text-primary-tomato dark:hover:text-primary-lightTomato transition-colors duration-200"
              >
                Learn why
                <svg
                  className="ml-2 w-6 h-6 lg:w-7 lg:h-7"
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
              className="order-1 lg:order-2"
            >
              <div className="rounded-lg overflow-hidden shadow-lg bg-gray-50 dark:bg-gray-800 max-w-lg mx-auto lg:max-w-none">
                <img
                  src="/tomato.jpeg"
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
