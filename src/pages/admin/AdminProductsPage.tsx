import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';
import { supabase, Product } from '../../lib/supabase';
import { FiEdit2, FiSave, FiX, FiRefreshCw, FiTrash2, FiStar } from 'react-icons/fi';

interface ProductEditState {
  [key: number]: {
    name: string;
    description: string;
    price: number;
    featured: boolean;
    in_stock: boolean;
  };
}

const AdminProductsPage: React.FC = () => {
  const { hasPermission, isSuperAdmin } = useAdmin();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProducts, setEditingProducts] = useState<Set<number>>(new Set());
  const [editStates, setEditStates] = useState<ProductEditState>({});
  const [syncing, setSyncing] = useState(false);

  const canRead = hasPermission('products:read');
  const canWrite = hasPermission('products:write');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      showToast('Error loading products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (product: Product) => {
    if (!canWrite) return;
    
    setEditingProducts(prev => new Set([...prev, product.id]));
    setEditStates(prev => ({
      ...prev,
      [product.id]: {
        name: product.name,
        description: product.description,
        price: product.price,
        featured: product.featured,
        in_stock: product.in_stock,
      }
    }));
  };

  const cancelEditing = (productId: number) => {
    setEditingProducts(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
    setEditStates(prev => {
      const newState = { ...prev };
      delete newState[productId];
      return newState;
    });
  };

  const saveProduct = async (productId: number) => {
    if (!canWrite) return;

    const editState = editStates[productId];
    if (!editState) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: editState.name,
          description: editState.description,
          price: editState.price,
          featured: editState.featured,
          in_stock: editState.in_stock,
        })
        .eq('id', productId);

      if (error) throw error;

      showToast('Product updated successfully', 'success');
      cancelEditing(productId);
      await fetchProducts(); // Refresh the list
    } catch (error) {
      console.error('Error updating product:', error);
      showToast('Error updating product', 'error');
    }
  };

  const updateEditState = (productId: number, field: string, value: any) => {
    setEditStates(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  };

  const syncWithPrintful = async () => {
    if (!isSuperAdmin) return;
    
    try {
      setSyncing(true);
      showToast('Starting Printful sync...', 'info');
      
      // Here you would call your sync script or API endpoint
      // For now, we'll just simulate it
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await fetchProducts();
      showToast('Printful sync completed', 'success');
    } catch (error) {
      console.error('Error syncing with Printful:', error);
      showToast('Error syncing with Printful', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const deleteProduct = async (productId: number) => {
    if (!canWrite) return;
    
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      showToast('Product deleted successfully', 'success');
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      showToast('Error deleting product', 'error');
    }
  };

  useEffect(() => {
    if (canRead) {
      fetchProducts();
    }
  }, [canRead]);

  if (!canRead) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to view products.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600 mt-2">Manage your product catalog and descriptions</p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={syncWithPrintful}
            disabled={syncing}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <FiRefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync with Printful'}
          </button>
        )}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {products.map((product) => {
            const isEditing = editingProducts.has(product.id);
            const editState = editStates[product.id];

            return (
              <li key={product.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-3">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-16 w-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editState?.name || ''}
                            onChange={(e) => updateEditState(product.id, 'name', e.target.value)}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Product name"
                          />
                        ) : (
                          <h3 className="text-lg font-medium text-gray-900 flex items-center">
                            {product.name}
                            {product.featured && <FiStar className="ml-2 h-4 w-4 text-yellow-500" />}
                          </h3>
                        )}
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-500">
                            {product.size} • {product.color}
                          </span>
                          <span className="text-sm font-medium text-green-600">
                            ${isEditing ? editState?.price || 0 : product.price}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            (isEditing ? editState?.in_stock : product.in_stock)
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {(isEditing ? editState?.in_stock : product.in_stock) ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      {isEditing ? (
                        <div className="space-y-3">
                          <textarea
                            value={editState?.description || ''}
                            onChange={(e) => updateEditState(product.id, 'description', e.target.value)}
                            rows={3}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Product description"
                          />
                          <div className="flex items-center space-x-4">
                            <input
                              type="number"
                              step="0.01"
                              value={editState?.price || 0}
                              onChange={(e) => updateEditState(product.id, 'price', parseFloat(e.target.value) || 0)}
                              className="block w-24 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="Price"
                            />
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={editState?.featured || false}
                                onChange={(e) => updateEditState(product.id, 'featured', e.target.checked)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">Featured</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={editState?.in_stock || false}
                                onChange={(e) => updateEditState(product.id, 'in_stock', e.target.checked)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">In Stock</span>
                            </label>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">{product.description}</p>
                      )}
                    </div>

                    {product.admin_edited && (
                      <div className="mt-2 text-xs text-blue-600">
                        ✓ Modified by admin {product.last_edited_at && new Date(product.last_edited_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0 ml-4">
                    {canWrite && (
                      <div className="flex items-center space-x-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => saveProduct(product.id)}
                              className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-green-600 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <FiSave className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => cancelEditing(product.id)}
                              className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-gray-600 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                              <FiX className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(product)}
                              className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              <FiEdit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteProduct(product.id)}
                              className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-red-600 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Sync with Printful to import your products.</p>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;