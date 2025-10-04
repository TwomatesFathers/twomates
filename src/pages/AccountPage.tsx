import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiShoppingBag, FiLogOut, FiSettings, FiMapPin } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

// Profile Component
const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    fullName: user?.full_name || user?.user_metadata?.full_name || '',
    email: user?.email || '',
    avatarUrl: user?.avatar_url || user?.user_metadata?.avatar_url || '',
  });

  useEffect(() => {
    // Update profile when user data changes (e.g., after social login)
    if (user) {
      setProfile({
        fullName: user.full_name || user?.user_metadata?.full_name || '',
        email: user.email || '',
        avatarUrl: user.avatar_url || user?.user_metadata?.avatar_url || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would update the user profile here
    setIsEditing(false);
  };

  return (
    <div className="p-6 rounded-lg shadow-md bg-white dark:bg-gray-800 dark:border dark:border-gray-700">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">My Profile</h2>

      {!isEditing ? (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile Image */}
          <div className="flex-shrink-0 flex flex-col items-center">
            {profile.avatarUrl ? (
              <img 
                src={profile.avatarUrl} 
                alt="Profile" 
                className="w-24 h-24 rounded-full object-cover border-2 border-primary-tomato" 
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500 text-4xl border-2 border-primary-tomato">
                {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </div>

          <div className="flex-grow">
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-1 text-gray-500 dark:text-gray-400">Full Name</h3>
              <p className="text-gray-900 dark:text-white">{profile.fullName || 'Not set'}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium mb-1 text-gray-500 dark:text-gray-400">Email Address</h3>
              <p className="text-gray-900 dark:text-white">{profile.email}</p>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="btn px-4 py-2 rounded-md font-medium primary-btn shadow-sm"
            >
              Edit Profile
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="fullName" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={profile.fullName}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:border-primary-tomato focus:ring focus:ring-primary-tomato focus:ring-opacity-50 bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:border-primary-tomato focus:ring focus:ring-primary-tomato focus:ring-opacity-50 bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              disabled
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Email cannot be changed</p>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="btn px-4 py-2 rounded-md font-medium primary-btn shadow-sm"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn px-4 py-2 rounded-md font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 shadow-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

// Orders Component
const Orders = () => {
  // In a real app, we would fetch orders from the database
  const mockOrders = [
    {
      id: '123456',
      date: '2023-12-15',
      status: 'Delivered',
      total: 89.97,
      items: 3,
    },
    {
      id: '789012',
      date: '2023-11-28',
      status: 'Shipped',
      total: 124.50,
      items: 2,
    },
    {
      id: '345678',
      date: '2023-10-05',
      status: 'Delivered',
      total: 54.99,
      items: 1,
    }
  ];

  return (
    <div className="p-6 rounded-lg shadow-md bg-white dark:bg-gray-800 dark:border dark:border-gray-700">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">My Orders</h2>

      {mockOrders.length > 0 ? (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {mockOrders.map((order) => (
            <div key={order.id} className="py-4">
              <div className="flex flex-col sm:flex-row justify-between mb-2">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">Order #{order.id}</span>
                  <span className="text-sm ml-2 text-gray-500 dark:text-gray-400">
                    {new Date(order.date).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    order.status === 'Delivered' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : order.status === 'Shipped' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {order.items} {order.items === 1 ? 'item' : 'items'} · ${order.total.toFixed(2)}
                </div>
                <Link 
                  to={`/account/orders/${order.id}`}
                  className="text-primary-tomato hover:text-primary-darkTomato text-sm font-medium dark:text-primary-lightTomato dark:hover:text-primary-tomato"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <FiShoppingBag className="mx-auto h-12 w-12 mb-4 text-gray-400 dark:text-gray-600" />
          <h3 className="text-lg font-medium mb-1 text-gray-900 dark:text-white">No orders yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            When you place orders, they will appear here.
          </p>
          <Link to="/shop" className="btn px-4 py-2 rounded-md font-medium bg-primary-tomato hover:bg-primary-darkTomato text-white dark:bg-primary-tomato dark:hover:bg-primary-darkTomato dark:text-white shadow-sm">
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
};

// Addresses Component
const Addresses = () => {
  // In a real app, we would fetch addresses from the database
  const addresses = [
    {
      id: '1',
      name: 'Home',
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94103',
      isDefault: true,
    }
  ];

  return (
    <div className="p-6 rounded-lg shadow-md bg-white dark:bg-gray-800 dark:border dark:border-gray-700">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">My Addresses</h2>

      {addresses.length > 0 ? (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {addresses.map((address) => (
            <div key={address.id} className="py-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center mb-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{address.name}</h3>
                    {address.isDefault && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {address.street}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    {address.city}, {address.state} {address.zip}
                  </p>
                </div>
                <div className="space-x-2">
                  <button className="text-sm px-4 py-2 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 shadow-sm font-medium">
                    Edit
                  </button>
                  <button className="text-sm px-4 py-2 rounded-md shadow-sm font-medium danger-btn">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <FiMapPin className="mx-auto h-12 w-12 mb-4 text-gray-400 dark:text-gray-600" />
          <h3 className="text-lg font-medium mb-1 text-gray-900 dark:text-white">No addresses saved</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Add your first shipping address to speed up checkout.
          </p>
          <button className="btn px-4 py-2 rounded-md font-medium primary-btn shadow-sm">
            Add Address
          </button>
        </div>
      )}
    </div>
  );
};

// Settings Component
const Settings = () => {
  return (
    <div className="p-6 rounded-lg shadow-md bg-white dark:bg-gray-800 dark:border dark:border-gray-700">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Account Settings</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">Email Preferences</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="orderUpdates"
                className="h-4 w-4 rounded border-gray-300 text-primary-tomato focus:ring-primary-tomato"
              />
              <label htmlFor="orderUpdates" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Order updates and shipping notifications
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="promos"
                className="h-4 w-4 rounded border-gray-300 text-primary-tomato focus:ring-primary-tomato"
              />
              <label htmlFor="promos" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Promotions and new product announcements
              </label>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">Password</h3>
          <button className="btn px-4 py-2 rounded-md font-medium primary-btn shadow-sm">
            Change Password
          </button>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">Danger Zone</h3>
          <button className="px-4 py-2 rounded-md shadow-sm font-medium danger-btn">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Account Page Component
const AccountPage = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Debug logging
  useEffect(() => {
    console.log('AccountPage render - loading:', loading, 'user:', !!user, 'pathname:', location.pathname);
  }, [loading, user, location.pathname]);
  
  // If not signed in and not loading, redirect to login page
  useEffect(() => {
    if (!loading && !user) {
      console.log('No user found, redirecting to login');
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);
  
  const handleSignOut = async () => {
    try {
      await signOut();
      // Navigate to home page after successful sign out
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Failed to sign out:', error);
      // Still navigate away even if there's an error
      navigate('/', { replace: true });
    }
  };
  
  // Determine active tab based on the path
  const activeTab = location.pathname === '/account' ? 'profile' : 
                    location.pathname.includes('/orders') ? 'orders' :
                    location.pathname.includes('/addresses') ? 'addresses' :
                    location.pathname.includes('/settings') ? 'settings' : '';
  
  // Show loading state only when actually loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-tomato mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading account...</p>
        </div>
      </div>
    );
  }
  
  // If no user after loading is complete, this will trigger the redirect useEffect above
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">Redirecting to login...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container-custom py-12 bg-white dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">My Account</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="rounded-lg shadow-md bg-white dark:bg-gray-800 dark:border dark:border-gray-700 p-4">
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                {user.avatar_url || user.user_metadata?.avatar_url ? (
                  <div className="flex items-center mb-3">
                    <img 
                      src={user.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || ''} 
                      alt="Profile" 
                      className="w-10 h-10 rounded-full mr-3 object-cover" 
                    />
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email}
                    </p>
                  </div>
                ) : (
                  <p className="font-medium text-gray-900 dark:text-white">
                    {user.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email}
                  </p>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Member since {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              
              <nav className="space-y-1">
                <Link 
                  to="/account"
                  className={`flex items-center px-4 py-2 rounded-md font-medium ${
                    activeTab === 'profile' 
                      ? 'bg-primary-tomato text-white shadow-sm dark:bg-primary-tomato dark:text-white' 
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <FiUser className="mr-3" />
                  Profile
                </Link>
                <Link 
                  to="/account/orders"
                  className={`flex items-center px-4 py-2 rounded-md font-medium ${
                    activeTab === 'orders' 
                      ? 'bg-primary-tomato text-white shadow-sm dark:bg-primary-tomato dark:text-white' 
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <FiShoppingBag className="mr-3" />
                  Orders
                </Link>
                <Link 
                  to="/account/addresses"
                  className={`flex items-center px-4 py-2 rounded-md font-medium ${
                    activeTab === 'addresses' 
                      ? 'bg-primary-tomato text-white shadow-sm dark:bg-primary-tomato dark:text-white' 
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <FiMapPin className="mr-3" />
                  Addresses
                </Link>
                <Link 
                  to="/account/settings"
                  className={`flex items-center px-4 py-2 rounded-md font-medium ${
                    activeTab === 'settings' 
                      ? 'bg-primary-tomato text-white shadow-sm dark:bg-primary-tomato dark:text-white' 
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <FiSettings className="mr-3" />
                  Settings
                </Link>
                
                <button 
                  onClick={handleSignOut}
                  className="flex items-center px-4 py-2 rounded-md w-full text-left font-medium text-red-600 hover:bg-red-50 bg-white dark:bg-transparent dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                >
                  <FiLogOut className="mr-3" />
                  Sign Out
                </button>
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-3">
            <Routes>
              <Route index element={<Profile />} />
              <Route path="orders" element={<Orders />} />
              <Route path="addresses" element={<Addresses />} />
              <Route path="settings" element={<Settings />} />
            </Routes>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AccountPage; 