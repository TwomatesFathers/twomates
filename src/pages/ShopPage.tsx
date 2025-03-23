import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import { supabase, Product } from '../lib/supabase';
import ProductCard from '../components/shop/ProductCard';
import { useTheme } from '../context/ThemeContext';

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const { theme } = useTheme();
  
  // Filters
  const categoryParam = searchParams.get('category') || '';
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [sortBy, setSortBy] = useState('newest');
  
  // Available categories
  const categories = ['tshirts', 'hoodies', 'accessories'];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      
      try {
        let query = supabase.from('products').select('*');
        
        // Apply category filter
        if (categoryParam) {
          query = query.eq('category', categoryParam);
        }
        
        // Apply price filter
        query = query.gte('price', priceRange[0]).lte('price', priceRange[1]);
        
        // Apply sorting
        switch (sortBy) {
          case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
          case 'price-low':
            query = query.order('price', { ascending: true });
            break;
          case 'price-high':
            query = query.order('price', { ascending: false });
            break;
          default:
            query = query.order('created_at', { ascending: false });
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        // Use mock products if there's an error
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [categoryParam, priceRange, sortBy]);
  
  const handleCategoryClick = (category: string) => {
    if (categoryParam === category) {
      // If clicking the active category, clear the filter
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
    
    // Close mobile filter if open
    if (filterOpen) setFilterOpen(false);
  };
  
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value);
  };
  
  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newValue = Number(event.target.value);
    const newPriceRange = [...priceRange] as [number, number];
    newPriceRange[index] = newValue;
    setPriceRange(newPriceRange);
  };
  
  const resetFilters = () => {
    setPriceRange([0, 200]);
    setSortBy('newest');
    searchParams.delete('category');
    setSearchParams(searchParams);
  };
  
  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <div className="container-custom py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Mobile Filter Button */}
        <div className="md:hidden">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center justify-between w-full py-3 px-4 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-white"
          >
            <span className="flex items-center">
              <FiFilter className="mr-2" />
              Filters
            </span>
            {filterOpen ? <FiX /> : <FiChevronDown />}
          </button>
        </div>
        
        {/* Sidebar Filters */}
        <div 
          className={`${
            filterOpen ? 'block' : 'hidden md:block'
          } w-full md:w-64 flex-shrink-0`}
        >
          <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
            <div className="mb-8">
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    searchParams.delete('category');
                    setSearchParams(searchParams);
                  }}
                  className={`block px-3 py-2 rounded-md w-full text-left ${
                    !categoryParam 
                      ? 'bg-primary-tomato text-white' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  All Products
                </button>
                
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    className={`block px-3 py-2 rounded-md w-full text-left ${
                      categoryParam === category 
                        ? 'bg-primary-tomato text-white' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {capitalizeFirstLetter(category)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Price Range</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">Min</label>
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => handlePriceChange(e, 0)}
                      min="0"
                      max={priceRange[1]}
                      className="w-full px-3 py-2 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">Max</label>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => handlePriceChange(e, 1)}
                      min={priceRange[0]}
                      className="w-full px-3 py-2 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={priceRange[1]}
                    onChange={(e) => handlePriceChange(e, 1)}
                    className="w-full accent-primary-tomato"
                  />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Sort By</h3>
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="w-full px-3 py-2 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            <button
              onClick={resetFilters}
              className="w-full py-2 px-4 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Reset Filters
            </button>
          </div>
        </div>
        
        {/* Products Grid */}
        <div className="flex-grow">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {categoryParam 
                ? `${capitalizeFirstLetter(categoryParam)}`
                : 'All Products'
              }
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {products.length} {products.length === 1 ? 'product' : 'products'}
            </p>
          </div>
          
          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-12 text-center bg-gray-100 dark:bg-gray-800 rounded-lg dark:border dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">No products found</h2>
              <p className="mb-6 text-gray-600 dark:text-gray-300">
                Try adjusting your filters or browse all products
              </p>
              <button 
                onClick={resetFilters}
                className="px-6 py-3 bg-primary-tomato text-white rounded-md hover:bg-primary-darkTomato transition-colors"
              >
                View All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Mock products for backup
const mockProducts: Product[] = [
  {
    id: 1,
    created_at: new Date().toISOString(),
    name: 'Twomates Classic Tee',
    description: 'Our flagship t-shirt with the iconic Twomates logo.',
    price: 29.99,
    image_url: 'https://via.placeholder.com/400x500?text=Twomates+Tee',
    category: 'tshirts',
    featured: true,
    in_stock: true,
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 2,
    created_at: new Date().toISOString(),
    name: 'Tomato Friends Hoodie',
    description: 'Stay cozy with our premium hoodie featuring the tomato mascots.',
    price: 59.99,
    image_url: 'https://via.placeholder.com/400x500?text=Twomates+Hoodie',
    category: 'hoodies',
    featured: true,
    in_stock: true,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 3,
    created_at: new Date().toISOString(),
    name: 'Twomates Cap',
    description: 'A stylish cap with embroidered tomato mascots.',
    price: 24.99,
    image_url: 'https://via.placeholder.com/400x500?text=Twomates+Cap',
    category: 'accessories',
    featured: true,
    in_stock: true,
    sizes: ['One Size'],
  },
  {
    id: 4,
    created_at: new Date().toISOString(),
    name: 'Tomato Pals Socks',
    description: 'Colorful socks with our cute tomato characters.',
    price: 12.99,
    image_url: 'https://via.placeholder.com/400x500?text=Twomates+Socks',
    category: 'accessories',
    featured: true,
    in_stock: true,
    sizes: ['S', 'M', 'L'],
  },
  {
    id: 5,
    created_at: new Date().toISOString(),
    name: 'Twomates Graphic Tee',
    description: 'Bold graphic tee with our signature tomato design.',
    price: 34.99,
    image_url: 'https://via.placeholder.com/400x500?text=Graphic+Tee',
    category: 'tshirts',
    featured: false,
    in_stock: true,
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 6,
    created_at: new Date().toISOString(),
    name: 'Vintage Tomato Sweatshirt',
    description: 'Retro-styled sweatshirt for a classic casual look.',
    price: 49.99,
    image_url: 'https://via.placeholder.com/400x500?text=Vintage+Sweatshirt',
    category: 'hoodies',
    featured: false,
    in_stock: true,
    sizes: ['S', 'M', 'L'],
  },
];

export default ShopPage; 