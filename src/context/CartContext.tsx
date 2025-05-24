import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Product, CartItem } from '../lib/supabase';

interface CartContextType {
  cart: CartItem[];
  products: Product[];
  loading: boolean;
  totalItems: number;
  totalPrice: number;
  addToCart: (productId: number, quantity: number, size: string) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('in_stock', true); // Only fetch in-stock products for cart operations
        
        if (error) {
          throw error;
        }

        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  // Load cart from Supabase when user changes
  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        // If no user is logged in, check localStorage
        const localCart = localStorage.getItem('twomates_cart');
        if (localCart) {
          try {
            const parsedCart = JSON.parse(localCart);
            // Validate cart items and attach product data
            const validatedCart = await Promise.all(
              parsedCart.map(async (item: CartItem) => {
                const product = products.find(p => p.id === item.product_id);
                return {
                  ...item,
                  product: product || null
                };
              })
            );
            setCart(validatedCart.filter(item => item.product)); // Only keep items with valid products
          } catch (error) {
            console.error('Error parsing local cart:', error);
            localStorage.removeItem('twomates_cart');
          }
        }
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch cart items with product data
        const { data, error } = await supabase
          .from('cart_items')
          .select(`
            *,
            product:products(*)
          `)
          .eq('user_id', user.id);

        if (error) {
          throw error;
        }

        setCart(data || []);
      } catch (error) {
        console.error('Error fetching cart:', error);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch cart after products are loaded
    if (products.length > 0 || user) {
      fetchCart();
    }
  }, [user, products]);

  // Save cart to localStorage when cart changes (for non-logged in users)
  useEffect(() => {
    if (!user && cart.length > 0) {
      // Save without product data to avoid circular references
      const cartToSave = cart.map(({ product, ...item }) => item);
      localStorage.setItem('twomates_cart', JSON.stringify(cartToSave));
    }
  }, [cart, user]);

  // Calculate total items and price
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cart.reduce((total, item) => {
    const product = item.product || products.find(p => p.id === item.product_id);
    return total + (product?.price || 0) * item.quantity;
  }, 0);

  // Add item to cart
  const addToCart = async (productId: number, quantity: number, size: string) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) {
        throw new Error('Product not found');
      }

      if (!product.in_stock) {
        throw new Error('Product is out of stock');
      }

      // Check if item with same product and size is already in cart
      const existingItemIndex = cart.findIndex(
        item => item.product_id === productId && item.size === size
      );

      if (existingItemIndex > -1) {
        // Update quantity if item exists
        const newQuantity = cart[existingItemIndex].quantity + quantity;
        await updateCartItem(cart[existingItemIndex].id, newQuantity);
      } else {
        // Add new item
        const newItem: CartItem = {
          id: uuidv4(),
          user_id: user?.id || 'guest',
          product_id: productId,
          quantity,
          size,
          created_at: new Date().toISOString(),
          product: product
        };

        if (user) {
          // For logged-in users, save to database
          const { data, error } = await supabase
            .from('cart_items')
            .insert({
              id: newItem.id,
              user_id: newItem.user_id,
              product_id: newItem.product_id,
              quantity: newItem.quantity,
              size: newItem.size,
              created_at: newItem.created_at
            })
            .select(`
              *,
              product:products(*)
            `)
            .single();
          
          if (error) throw error;
          
          setCart([...cart, data]);
        } else {
          // For guests, just add to local state
          setCart([...cart, newItem]);
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error; // Re-throw so components can handle the error
    }
  };

  // Update cart item quantity
  const updateCartItem = async (itemId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        return removeFromCart(itemId);
      }

      const updatedCart = cart.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      );

      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', itemId);
        
        if (error) throw error;
      }
      
      setCart(updatedCart);
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId: string) => {
    try {
      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', itemId);
        
        if (error) throw error;
      }
      
      setCart(cart.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);
        
        if (error) throw error;
      }
      
      setCart([]);
      if (!user) {
        localStorage.removeItem('twomates_cart');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        products,
        loading,
        totalItems,
        totalPrice,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 