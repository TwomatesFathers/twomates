import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiShoppingBag, FiLogOut, FiSettings, FiMapPin } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Profile Component
const Profile = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    fullName: user?.full_name || '',
    email: user?.email || '',
  });

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
    <div className={`p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
      <h2 className={`text-2xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>My Profile</h2>

      {!isEditing ? (
        <div>
          <div className="mb-6">
            <h3 className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Full Name</h3>
            <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{profile.fullName || 'Not set'}</p>
          </div>

          <div className="mb-6">
            <h3 className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Email Address</h3>
            <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{profile.email}</p>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className={`btn ${theme === 'dark' ? 'bg-primary-tomato hover:bg-primary-darkTomato text-white' : 'btn-primary'}`}
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="fullName" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={profile.fullName}
              onChange={handleChange}
              className={`w-full rounded-md focus:border-primary-tomato focus:ring focus:ring-primary-tomato focus:ring-opacity-50 ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="email" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              className={`w-full rounded-md focus:border-primary-tomato focus:ring focus:ring-primary-tomato focus:ring-opacity-50 ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              disabled
            />
            <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Email cannot be changed</p>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className={`btn ${theme === 'dark' ? 'bg-primary-tomato hover:bg-primary-darkTomato text-white' : 'btn-primary'}`}
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className={`btn ${
                theme === 'dark'
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
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
  const { theme } = useTheme();
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
    <div className={`p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
      <h2 className={`text-2xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>My Orders</h2>

      {mockOrders.length > 0 ? (
        <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
          {mockOrders.map((order) => (
            <div key={order.id} className="py-4">
              <div className="flex flex-col sm:flex-row justify-between mb-2">
                <div>
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Order #{order.id}</span>
                  <span className={`text-sm ml-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date(order.date).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    theme === 'dark' 
                      ? order.status === 'Delivered' 
                        ? 'bg-green-900 text-green-200' 
                        : order.status === 'Shipped' 
                          ? 'bg-blue-900 text-blue-200' 
                          : 'bg-yellow-900 text-yellow-200'
                      : order.status === 'Delivered' 
                        ? 'bg-green-100 text-green-800' 
                        : order.status === 'Shipped' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {order.items} {order.items === 1 ? 'item' : 'items'} · ${order.total.toFixed(2)}
                </div>
                <Link 
                  to={`/account/orders/${order.id}`}
                  className={theme === 'dark' ? 'text-primary-lightTomato hover:text-primary-tomato text-sm font-medium' : 'text-primary-tomato hover:text-primary-darkTomato text-sm font-medium'}
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <FiShoppingBag className={`mx-auto h-12 w-12 mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-lg font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No orders yet</h3>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-6`}>
            When you place orders, they will appear here.
          </p>
          <Link to="/shop" className={`btn ${theme === 'dark' ? 'bg-primary-tomato hover:bg-primary-darkTomato text-white' : 'btn-primary'}`}>
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
};

// Addresses Component
const Addresses = () => {
  const { theme } = useTheme();
  // In a real app, we would fetch addresses from the database
  const [addresses, setAddresses] = useState([
    {
      id: '1',
      name: 'Home',
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94103',
      isDefault: true,
    }
  ]);

  return (
    <div className={`p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
      <h2 className={`text-2xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>My Addresses</h2>

      {addresses.length > 0 ? (
        <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
          {addresses.map((address) => (
            <div key={address.id} className="py-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center mb-1">
                    <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{address.name}</h3>
                    {address.isDefault && (
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                        theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                      }`}>
                        Default
                      </span>
                    )}
                  </div>
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {address.street}
                  </p>
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {address.city}, {address.state} {address.zip}
                  </p>
                </div>
                <div className="space-x-2">
                  <button className={`text-sm px-3 py-1 rounded ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}>
                    Edit
                  </button>
                  <button className={`text-sm px-3 py-1 rounded ${
                    theme === 'dark'
                      ? 'bg-red-900 text-red-200 hover:bg-red-800'
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <FiMapPin className={`mx-auto h-12 w-12 mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-lg font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No addresses saved</h3>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-6`}>
            Add your first shipping address to speed up checkout.
          </p>
          <button className={`btn ${theme === 'dark' ? 'bg-primary-tomato hover:bg-primary-darkTomato text-white' : 'btn-primary'}`}>
            Add Address
          </button>
        </div>
      )}
    </div>
  );
};

// Settings Component
const Settings = () => {
  const { theme } = useTheme();
  
  return (
    <div className={`p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
      <h2 className={`text-2xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Account Settings</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className={`text-lg font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Email Preferences</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="orderUpdates"
                className="h-4 w-4 rounded border-gray-300 text-primary-tomato focus:ring-primary-tomato"
              />
              <label htmlFor="orderUpdates" className={`ml-2 block text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Order updates and shipping notifications
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="promos"
                className="h-4 w-4 rounded border-gray-300 text-primary-tomato focus:ring-primary-tomato"
              />
              <label htmlFor="promos" className={`ml-2 block text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Promotions and new product announcements
              </label>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className={`text-lg font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Password</h3>
          <button className="btn btn-primary">Change Password</button>
        </div>
        
        <div>
          <h3 className={`text-lg font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Danger Zone</h3>
          <button className={`px-4 py-2 rounded-md ${
            theme === 'dark'
              ? 'bg-red-900 text-white hover:bg-red-800'
              : 'bg-red-100 text-red-800 hover:bg-red-200'
          }`}>
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Account Page Component
const AccountPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  
  // If not signed in, redirect to login page
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  // Determine active tab based on the path
  const activeTab = location.pathname === '/account' ? 'profile' : 
                    location.pathname.includes('/orders') ? 'orders' :
                    location.pathname.includes('/addresses') ? 'addresses' :
                    location.pathname.includes('/settings') ? 'settings' : '';
  
  if (!user) return null;
  
  return (
    <div className="container-custom py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className={`text-3xl font-bold mb-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>My Account</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className={`rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'} p-4`}>
              <div className={`mb-4 pb-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user.email}</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Member since {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              
              <nav className="space-y-1">
                <Link 
                  to="/account"
                  className={`flex items-center px-4 py-2 rounded-md ${
                    activeTab === 'profile' 
                      ? 'bg-primary-tomato text-white' 
                      : theme === 'dark'
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FiUser className="mr-3" />
                  Profile
                </Link>
                <Link 
                  to="/account/orders"
                  className={`flex items-center px-4 py-2 rounded-md ${
                    activeTab === 'orders' 
                      ? 'bg-primary-tomato text-white' 
                      : theme === 'dark'
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FiShoppingBag className="mr-3" />
                  Orders
                </Link>
                <Link 
                  to="/account/addresses"
                  className={`flex items-center px-4 py-2 rounded-md ${
                    activeTab === 'addresses' 
                      ? 'bg-primary-tomato text-white' 
                      : theme === 'dark'
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FiMapPin className="mr-3" />
                  Addresses
                </Link>
                <Link 
                  to="/account/settings"
                  className={`flex items-center px-4 py-2 rounded-md ${
                    activeTab === 'settings' 
                      ? 'bg-primary-tomato text-white' 
                      : theme === 'dark'
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FiSettings className="mr-3" />
                  Settings
                </Link>
                
                <button 
                  onClick={handleSignOut}
                  className={`flex items-center px-4 py-2 rounded-md w-full text-left ${
                    theme === 'dark'
                      ? 'text-red-400 hover:bg-red-900 hover:bg-opacity-30'
                      : 'text-red-600 hover:bg-red-50'
                  }`}
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