import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase, Product } from '../lib/supabase';
import ProductCard from '../components/shop/ProductCard';

const ShopPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      
      try {
        let query = supabase.from('products').select('*').order('created_at', { ascending: false });
        
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
  }, []);

  return (
    <div className="container-custom py-12">
      {/* Products Grid */}
      <div className="w-full">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            All Products
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {products.length} {products.length === 1 ? 'product' : 'products'}
          </p>
        </div>
        
        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-96 rounded-lg animate-pulse bg-gray-200 dark:bg-gray-800" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center rounded-lg bg-gray-100 dark:bg-gray-800 dark:border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">No products found</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Check back soon for new products!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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