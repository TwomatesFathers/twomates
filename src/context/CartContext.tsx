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
          .select('*');
        
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
          setCart(JSON.parse(localCart));
        }
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('cart_items')
          .select('*')
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

    fetchCart();
  }, [user]);

  // Save cart to localStorage when cart changes (for non-logged in users)
  useEffect(() => {
    if (!user && cart.length > 0) {
      localStorage.setItem('twomates_cart', JSON.stringify(cart));
    }
  }, [cart, user]);

  // Calculate total items and price
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cart.reduce((total, item) => {
    const product = products.find(p => p.id === item.product_id);
    return total + (product?.price || 0) * item.quantity;
  }, 0);

  // Add item to cart
  const addToCart = async (productId: number, quantity: number, size: string) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) {
        throw new Error('Product not found');
      }

      // Check if item is already in cart
      const existingItemIndex = cart.findIndex(
        item => item.product_id === productId && item.size === size
      );

      if (existingItemIndex > -1) {
        // Update quantity if item exists
        const newCart = [...cart];
        newCart[existingItemIndex].quantity += quantity;
        
        if (user) {
          const { error } = await supabase
            .from('cart_items')
            .update({ quantity: newCart[existingItemIndex].quantity })
            .eq('id', newCart[existingItemIndex].id);
          
          if (error) throw error;
        }
        
        setCart(newCart);
      } else {
        // Add new item
        const newItem: CartItem = {
          id: uuidv4(),
          user_id: user?.id || 'guest',
          product_id: productId,
          quantity,
          size,
          created_at: new Date().toISOString()
        };

        if (user) {
          const { error } = await supabase
            .from('cart_items')
            .insert(newItem);
          
          if (error) throw error;
        }
        
        setCart([...cart, newItem]);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
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
      localStorage.removeItem('twomates_cart');
    } catch (error) {
      console.error('Error clearing cart:', error);
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