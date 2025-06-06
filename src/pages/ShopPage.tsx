import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import { supabase, Product } from '../lib/supabase';
import ProductCard from '../components/shop/ProductCard';

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  
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
        
        // Group variants by printful_product_id and show only one product per group
        const productGroups = new Map();
        
        (data || []).forEach(product => {
          const groupKey = product.printful_product_id || `standalone_${product.id}`;
          
          if (!productGroups.has(groupKey)) {
            // Use this product as the representative for the group
            const groupProduct = {
              ...product,
              // Collect all available sizes for this product group
              available_sizes: [product.size].filter(Boolean)
            };
            productGroups.set(groupKey, groupProduct);
          } else {
            // Add this variant's size to the existing group
            const existingGroup = productGroups.get(groupKey);
            if (product.size && !existingGroup.available_sizes.includes(product.size)) {
              existingGroup.available_sizes.push(product.size);
            }
            
            // Use the variant with the lowest price as the representative
            if (product.price < existingGroup.price) {
              productGroups.set(groupKey, {
                ...product,
                available_sizes: existingGroup.available_sizes
              });
            }
          }
        });
        
        // Convert map to array and sort available_sizes
        const groupedProducts = Array.from(productGroups.values()).map(product => ({
          ...product,
          available_sizes: product.available_sizes.sort()
        }));
        
        setProducts(groupedProducts);
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
            className="flex items-center justify-between w-full py-3 px-4 rounded-md bg-white text-gray-700 border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-700"
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
          <div className="p-6 rounded-lg bg-white border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    searchParams.delete('category');
                    setSearchParams(searchParams);
                  }}
                  className={`block px-3 py-2 rounded-md w-full text-left ${
                    !categoryParam 
                      ? 'primary-btn' 
                      : 'text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
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
                        ? 'primary-btn' 
                        : 'text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
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
                      className="w-full px-3 py-2 rounded-md bg-white border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">Max</label>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => handlePriceChange(e, 1)}
                      min={priceRange[0]}
                      className="w-full px-3 py-2 rounded-md bg-white border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                className="w-full px-3 py-2 rounded-md bg-white border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            <button
              onClick={resetFilters}
              className="w-full py-2 px-4 rounded-md bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
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
                <div key={i} className="h-96 rounded-lg animate-pulse bg-gray-200 dark:bg-gray-800" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-12 text-center rounded-lg bg-gray-100 dark:bg-gray-800 dark:border dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">No products found</h2>
              <p className="mb-6 text-gray-600 dark:text-gray-300">
                Try adjusting your filters or browse all products
              </p>
              <button 
                onClick={resetFilters}
                className="px-6 py-3 rounded-md primary-btn transition-colors"
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

// Mock products for backup - realistic products that might exist in Printful
const mockProducts: Product[] = [
  {
    id: 1,
    created_at: new Date().toISOString(),
    name: 'twomates',
    description: 'Classic twomates design on premium fabric',
    price: 24.99,
    image_url: 'https://files.cdn.printful.com/files/abc/abc123_preview.png',
    category: 'tshirts',
    featured: true,
    in_stock: true,
    printful_product_id: '285441734',
    printful_variant_id: '11537425430',
    sku: 'TWT-3001C-S-WHT',
    external_id: 'twomates-tee-s-white',
    size: 'S',
    color: 'White',
    availability_status: 'active',
    available_sizes: ['S', 'M', 'L', 'XL', '2XL'],
  },
  {
    id: 2,
    created_at: new Date().toISOString(),
    name: 'twomates',
    description: 'Premium hoodie with iconic twomates branding',
    price: 39.99,
    image_url: 'https://files.cdn.printful.com/files/def/def456_preview.png',
    category: 'hoodies',
    featured: true,
    in_stock: true,
    printful_product_id: '285441735',
    printful_variant_id: '11537425431',
    sku: 'TWT-18500-M-BLK',
    external_id: 'twomates-hoodie-m-black',
    size: 'M',
    color: 'Black',
    availability_status: 'active',
    available_sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
  },
  {
    id: 3,
    created_at: new Date().toISOString(),
    name: 'twomates',
    description: 'Vintage-style twomates design on soft cotton blend',
    price: 27.99,
    image_url: 'https://files.cdn.printful.com/files/ghi/ghi789_preview.png',
    category: 'tshirts',
    featured: false,
    in_stock: true,
    printful_product_id: '285441736',
    printful_variant_id: '11537425432',
    sku: 'TWT-64000-L-GRY',
    external_id: 'twomates-vintage-l-grey',
    size: 'L',
    color: 'Sport Grey',
    availability_status: 'active',
    available_sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 4,
    created_at: new Date().toISOString(),
    name: 'twomates',
    description: 'Cozy sweatshirt perfect for casual wear',
    price: 34.99,
    image_url: 'https://files.cdn.printful.com/files/jkl/jkl012_preview.png',
    category: 'hoodies',
    featured: false,
    in_stock: true,
    printful_product_id: '285441737',
    printful_variant_id: '11537425433',
    sku: 'TWT-18000-XL-NVY',
    external_id: 'twomates-sweatshirt-xl-navy',
    size: 'XL',
    color: 'Navy',
    availability_status: 'active',
    available_sizes: ['M', 'L', 'XL', '2XL'],
  },
  {
    id: 5,
    created_at: new Date().toISOString(),
    name: 'twomates',
    description: 'Long sleeve tee with minimalist twomates logo',
    price: 29.99,
    image_url: 'https://files.cdn.printful.com/files/mno/mno345_preview.png',
    category: 'tshirts',
    featured: true,
    in_stock: true,
    printful_product_id: '285441738',
    printful_variant_id: '11537425434',
    sku: 'TWT-5400-M-BLK',
    external_id: 'twomates-longsleeve-m-black',
    size: 'M',
    color: 'Black',
    availability_status: 'active',
    available_sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 6,
    created_at: new Date().toISOString(),
    name: 'twomates',
    description: 'Premium tank top with bold twomates graphics',
    price: 22.99,
    image_url: 'https://files.cdn.printful.com/files/pqr/pqr678_preview.png',
    category: 'tshirts',
    featured: false,
    in_stock: true,
    printful_product_id: '285441739',
    printful_variant_id: '11537425435',
    sku: 'TWT-2408-L-WHT',
    external_id: 'twomates-tank-l-white',
    size: 'L',
    color: 'White',
    availability_status: 'active',
    available_sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 7,
    created_at: new Date().toISOString(),
    name: 'twomates',
    description: 'Zip-up hoodie with embroidered twomates logo',
    price: 44.99,
    image_url: 'https://files.cdn.printful.com/files/stu/stu901_preview.png',
    category: 'hoodies',
    featured: true,
    in_stock: true,
    printful_product_id: '285441740',
    printful_variant_id: '11537425436',
    sku: 'TWT-18600-M-CHR',
    external_id: 'twomates-zip-hoodie-m-charcoal',
    size: 'M',
    color: 'Charcoal',
    availability_status: 'active',
    available_sizes: ['S', 'M', 'L', 'XL', '2XL'],
  },
  {
    id: 8,
    created_at: new Date().toISOString(),
    name: 'twomates',
    description: 'Organic cotton tee with sustainable twomates print',
    price: 26.99,
    image_url: 'https://files.cdn.printful.com/files/vwx/vwx234_preview.png',
    category: 'tshirts',
    featured: false,
    in_stock: true,
    printful_product_id: '285441741',
    printful_variant_id: '11537425437',
    sku: 'TWT-4001-S-GRN',
    external_id: 'twomates-organic-s-green',
    size: 'S',
    color: 'Forest Green',
    availability_status: 'active',
    available_sizes: ['S', 'M', 'L', 'XL'],
  },
];

export default ShopPage; 