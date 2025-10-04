import React from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { FiPackage, FiUsers, FiSettings, FiBarChart } from 'react-icons/fi';

const AdminDashboardPage: React.FC = () => {
  const { isAdmin, isSuperAdmin, adminUser } = useAdmin();

  const adminCards = [
    {
      title: 'Products',
      description: 'Manage product descriptions, pricing, and availability',
      icon: FiPackage,
      href: '/admin/products',
      permission: 'products:read',
      color: 'bg-blue-500',
    },
    {
      title: 'Users',
      description: 'Manage admin users and permissions',
      icon: FiUsers,
      href: '/admin/users',
      permission: 'users:read',
      color: 'bg-green-500',
      superAdminOnly: true,
    },
    {
      title: 'Analytics',
      description: 'View sales and product performance',
      icon: FiBarChart,
      href: '/admin/analytics',
      permission: 'analytics:read',
      color: 'bg-purple-500',
    },
    {
      title: 'Settings',
      description: 'System settings and configuration',
      icon: FiSettings,
      href: '/admin/settings',
      permission: 'settings:read',
      color: 'bg-gray-500',
      superAdminOnly: true,
    },
  ];

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access the admin area.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {adminUser?.id || 'Admin'} 
          {isSuperAdmin && <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Super Admin</span>}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminCards.map((card) => {
          const Icon = card.icon;
          const hasPermission = isSuperAdmin || 
            (card.permission && adminUser?.permissions.includes(card.permission)) ||
            adminUser?.permissions.includes('*');
          
          const canAccess = hasPermission && (!card.superAdminOnly || isSuperAdmin);

          return (
            <div key={card.title} className="relative group">
              <Link
                to={canAccess ? card.href : '#'}
                className={`block p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 ${
                  canAccess 
                    ? 'cursor-pointer hover:border-gray-300' 
                    : 'cursor-not-allowed opacity-50'
                }`}
                onClick={canAccess ? undefined : (e) => e.preventDefault()}
              >
                <div className="flex items-center">
                  <div className={`flex-shrink-0 p-3 rounded-lg ${card.color} text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{card.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{card.description}</p>
                  </div>
                </div>
                {!canAccess && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
                    <span className="text-sm text-gray-500 font-medium">
                      {card.superAdminOnly ? 'Super Admin Only' : 'Access Denied'}
                    </span>
                  </div>
                )}
              </Link>
            </div>
          );
        })}
      </div>

      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/admin/products"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiPackage className="mr-2 h-4 w-4" />
            Manage Products
          </Link>
          
          {isSuperAdmin && (
            <button
              onClick={() => {
                // Trigger Printful sync
                window.location.href = '/admin/products?sync=true';
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiBarChart className="mr-2 h-4 w-4" />
              Sync with Printful
            </button>
          )}
          
          <Link
            to="/shop"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            View Shop
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;