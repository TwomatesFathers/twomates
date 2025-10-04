import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import PayPalProvider from './components/checkout/PayPalProvider';
import AuthRedirectHandler from './components/AuthRedirectHandler';

// Layouts
import Layout from './components/layout/Layout';

// Pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import { withAdminAuth } from './context/AdminContext';

// Create a client for React Query
const queryClient = new QueryClient();

// Create admin-protected components
const ProtectedAdminDashboard = withAdminAuth(AdminDashboardPage);
const ProtectedAdminProducts = withAdminAuth(AdminProductsPage, 'products:read');

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AdminProvider>
            <CartProvider>
              <PayPalProvider>
                <ToastProvider>
                  <Router>
                    <AuthRedirectHandler />
                    <Routes>
                      <Route path="/" element={<Layout />}>
                        <Route index element={<HomePage />} />
                        <Route path="shop" element={<ShopPage />} />
                        <Route path="product/:id" element={<ProductPage />} />
                        <Route path="cart" element={<CartPage />} />
                        <Route path="checkout" element={<CheckoutPage />} />
                        <Route path="login" element={<LoginPage />} />
                        <Route path="register" element={<RegisterPage />} />
                        <Route path="account/*" element={<AccountPage />} />
                        
                        {/* Admin Routes */}
                        <Route path="admin" element={<ProtectedAdminDashboard />} />
                        <Route path="admin/products" element={<ProtectedAdminProducts />} />
                        
                        <Route path="*" element={<NotFoundPage />} />
                      </Route>
                    </Routes>
                  </Router>
                </ToastProvider>
              </PayPalProvider>
            </CartProvider>
          </AdminProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
