import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';
import { supabase, Product } from '../../lib/supabase';
import { FiEdit2, FiSave, FiX, FiRefreshCw, FiTrash2, FiStar, FiChevronDown, FiChevronUp, FiPackage } from 'react-icons/fi';

interface ProductGroup {
  name: string;
  baseProduct: Product;
  variants: Product[];
  totalVariants: number;
}

interface GroupEditState {
  [key: string]: {
    description: string;
  };
}

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
  const [groupedProducts, setGroupedProducts] = useState<ProductGroup[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [editingGroups, setEditingGroups] = useState<Set<string>>(new Set());
  const [groupEditStates, setGroupEditStates] = useState<GroupEditState>({});
  const [loading, setLoading] = useState(true);
  const [editingProducts, setEditingProducts] = useState<Set<number>>(new Set());
  const [editStates, setEditStates] = useState<ProductEditState>({});
  const [syncing, setSyncing] = useState(false);

  const canRead = hasPermission('products:read');
  const canWrite = hasPermission('products:write');

  const groupProductsByName = (products: Product[]): ProductGroup[] => {
    const groups = new Map<string, Product[]>();
    
    products.forEach(product => {
      const key = product.name.toLowerCase().trim();
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(product);
    });

    return Array.from(groups.entries()).map(([name, variants]) => {
      // Sort variants by size order (S, M, L, XL, etc.)
      const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'];
      variants.sort((a, b) => {
        const aIndex = sizeOrder.indexOf(a.size || '');
        const bIndex = sizeOrder.indexOf(b.size || '');
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }
        return (a.size || '').localeCompare(b.size || '');
      });

      return {
        name: variants[0].name,
        baseProduct: variants[0],
        variants,
        totalVariants: variants.length,
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  };

  const toggleGroupExpanded = (groupName: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  const startEditingGroup = (group: ProductGroup) => {
    if (!canWrite) return;
    
    setEditingGroups(prev => new Set([...prev, group.name]));
    setGroupEditStates(prev => ({
      ...prev,
      [group.name]: {
        description: group.baseProduct.description || '',
      }
    }));
  };

  const cancelEditingGroup = (groupName: string) => {
    setEditingGroups(prev => {
      const newSet = new Set(prev);
      newSet.delete(groupName);
      return newSet;
    });
    setGroupEditStates(prev => {
      const newState = { ...prev };
      delete newState[groupName];
      return newState;
    });
  };

  const saveGroupDescription = async (group: ProductGroup) => {
    if (!canWrite) return;

    const editState = groupEditStates[group.name];
    if (!editState) return;

    try {
      // Update all variants in the group
      const updatePromises = group.variants.map(variant => 
        supabase
          .from('products')
          .update({
            description: editState.description,
            admin_edited: true,
            last_edited_at: new Date().toISOString(),
          })
          .eq('id', variant.id)
      );

      const results = await Promise.all(updatePromises);
      const hasError = results.some(result => result.error);

      if (hasError) {
        throw new Error('Some variants failed to update');
      }

      showToast(`Updated description for all ${group.totalVariants} variants`, 'success');
      cancelEditingGroup(group.name);
      await fetchProducts(); // Refresh the list
    } catch (error) {
      console.error('Error updating group description:', error);
      showToast('Error updating group description', 'error');
    }
  };

  const updateGroupEditState = (groupName: string, field: string, value: any) => {
    setGroupEditStates(prev => ({
      ...prev,
      [groupName]: {
        ...prev[groupName],
        [field]: value
      }
    }));
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
      setGroupedProducts(groupProductsByName(data || []));
    } catch (error) {
      console.error('Error fetching products:', error);
      showToast('Error loading products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canRead) {
      fetchProducts();
    }
  }, [canRead]);

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
          admin_edited: true,
          last_edited_at: new Date().toISOString(),
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h2>
        <p className="text-gray-600 dark:text-gray-400">You don't have permission to view products.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Product Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your product catalog and descriptions</p>
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

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {groupedProducts.map((group) => {
            const isExpanded = expandedGroups.has(group.name);
            const isEditingGroup = editingGroups.has(group.name);
            const groupEditState = groupEditStates[group.name];
            const baseProduct = group.baseProduct;
            
            return (
              <li key={group.name} className="px-6 py-4">
                {/* Group Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-3">
                      <img
                        src={baseProduct.image_url}
                        alt={baseProduct.name}
                        className="h-16 w-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                            {baseProduct.name}
                            {baseProduct.featured && <FiStar className="ml-2 h-4 w-4 text-yellow-500" />}
                            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                              {group.totalVariants} variant{group.totalVariants !== 1 ? 's' : ''}
                            </span>
                            {baseProduct.admin_edited && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                                ✓ Edited
                              </span>
                            )}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {canWrite && !isEditingGroup && (
                              <button
                                onClick={() => startEditingGroup(group)}
                                className="inline-flex items-center p-1 border border-transparent rounded-md text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none"
                                title="Edit description"
                              >
                                <FiEdit2 className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => toggleGroupExpanded(group.name)}
                              className="ml-4 inline-flex items-center p-1 border border-transparent rounded-md text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                            >
                              {isExpanded ? (
                                <FiChevronUp className="h-5 w-5" />
                              ) : (
                                <FiChevronDown className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Price range: ${Math.min(...group.variants.map(v => v.price)).toFixed(2)} - ${Math.max(...group.variants.map(v => v.price)).toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Sizes: {group.variants.map(v => v.size).filter(Boolean).join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      {isEditingGroup ? (
                        <div className="space-y-3">
                          <textarea
                            value={groupEditState?.description || ''}
                            onChange={(e) => updateGroupEditState(group.name, 'description', e.target.value)}
                            rows={4}
                            className="block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Product description for all variants"
                          />
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => saveGroupDescription(group)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              <FiSave className="mr-2 h-4 w-4" />
                              Save Description
                            </button>
                            <button
                              onClick={() => cancelEditingGroup(group.name)}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              <FiX className="mr-2 h-4 w-4" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{baseProduct.description}</p>
                      )}
                    </div>

                    {baseProduct.admin_edited && (
                      <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                        ✓ Modified by admin {baseProduct.last_edited_at && new Date(baseProduct.last_edited_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Variants */}
                {isExpanded && (
                  <div className="mt-4 pl-4 border-l-2 border-gray-200 dark:border-gray-600">
                    <div className="space-y-4">
                      {group.variants.map((variant) => {
                        const isEditing = editingProducts.has(variant.id);
                        const editState = editStates[variant.id];

                        return (
                          <div key={variant.id} className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-4 mb-2">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editState?.name || ''}
                                    onChange={(e) => updateEditState(variant.id, 'name', e.target.value)}
                                    className="block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Product name"
                                  />
                                ) : (
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {variant.size} • {variant.color}
                                  </span>
                                )}
                                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                  ${isEditing ? editState?.price || 0 : variant.price}
                                </span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  (isEditing ? editState?.in_stock : variant.in_stock)
                                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                    : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                }`}>
                                  {(isEditing ? editState?.in_stock : variant.in_stock) ? 'In Stock' : 'Out of Stock'}
                                </span>
                              </div>

                              {isEditing && (
                                <div className="space-y-3">
                                  <textarea
                                    value={editState?.description || ''}
                                    onChange={(e) => updateEditState(variant.id, 'description', e.target.value)}
                                    rows={3}
                                    className="block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Product description"
                                  />
                                  <div className="flex items-center space-x-4">
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={editState?.price || 0}
                                      onChange={(e) => updateEditState(variant.id, 'price', parseFloat(e.target.value) || 0)}
                                      className="block w-24 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                      placeholder="Price"
                                    />
                                    <label className="flex items-center">
                                      <input
                                        type="checkbox"
                                        checked={editState?.featured || false}
                                        onChange={(e) => updateEditState(variant.id, 'featured', e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                                      />
                                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Featured</span>
                                    </label>
                                    <label className="flex items-center">
                                      <input
                                        type="checkbox"
                                        checked={editState?.in_stock || false}
                                        onChange={(e) => updateEditState(variant.id, 'in_stock', e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                                      />
                                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">In Stock</span>
                                    </label>
                                  </div>
                                </div>
                              )}
                            </div>

                            {canWrite && (
                              <div className="flex items-center space-x-2 ml-4">
                                {isEditing ? (
                                  <>
                                    <button
                                      onClick={() => saveProduct(variant.id)}
                                      className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-green-600 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-800 dark:text-green-100 dark:hover:bg-green-700"
                                    >
                                      <FiSave className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => cancelEditing(variant.id)}
                                      className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-gray-600 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                                    >
                                      <FiX className="h-4 w-4" />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => startEditing(variant)}
                                      className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-800 dark:text-indigo-100 dark:hover:bg-indigo-700"
                                    >
                                      <FiEdit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => deleteProduct(variant.id)}
                                      className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-red-600 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-800 dark:text-red-100 dark:hover:bg-red-700"
                                    >
                                      <FiTrash2 className="h-4 w-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {groupedProducts.length === 0 && (
        <div className="text-center py-12">
          <FiPackage className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No products found</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Sync with Printful to import your products.</p>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;