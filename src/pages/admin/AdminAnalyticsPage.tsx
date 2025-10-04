import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';
import { supabase } from '../../lib/supabase';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiPackage, FiUsers, FiShoppingCart, FiEye } from 'react-icons/fi';

interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  ordersChange: string;
  revenueChange: string;
  productsChange: string;
  usersChange: string;
  recentOrders: Array<{
    id: string;
    total: number;
    status: string;
    created_at: string;
  }>;
  topProducts: Array<{
    id: number;
    name: string;
    total_sold: number;
    revenue: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
}

const AdminAnalyticsPage: React.FC = () => {
  const { hasPermission } = useAdmin();
  const { showToast } = useToast();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const canRead = hasPermission('analytics:read');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch total orders and revenue
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, total, status, created_at');

      if (ordersError) throw ordersError;

      // Fetch total products (grouped by name to avoid counting each size/color variant)
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, size, color');

      if (productsError) throw productsError;

      // Fetch total users from profiles (now reliable after our fix)
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, created_at');

      if (usersError) throw usersError;

      // Calculate totals
      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;
      
      // Count unique products by name (not by size/color variants)
      const uniqueProductNames = new Set(products?.map(p => p.name) || []);
      const totalProducts = uniqueProductNames.size;
      
      // Use profiles count (now accurate after our fix)
      const totalUsers = users?.length || 0;

      // Calculate historical comparison (last 30 days vs previous 30 days)
      const currentTime = new Date();
      const thirtyDaysAgo = new Date(currentTime.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(currentTime.getTime() - 60 * 24 * 60 * 60 * 1000);

      // Current period (last 30 days)
      const currentPeriodOrders = orders?.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= thirtyDaysAgo;
      }) || [];

      // Previous period (30-60 days ago)
      const previousPeriodOrders = orders?.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= sixtyDaysAgo && orderDate < thirtyDaysAgo;
      }) || [];

      // Calculate changes
      const currentOrdersCount = currentPeriodOrders.length;
      const previousOrdersCount = previousPeriodOrders.length;
      const currentRevenue = currentPeriodOrders.reduce((sum, order) => sum + Number(order.total), 0);
      const previousRevenue = previousPeriodOrders.reduce((sum, order) => sum + Number(order.total), 0);

      // Calculate percentage changes
      const calculatePercentageChange = (current: number, previous: number): string => {
        if (previous === 0) {
          return current > 0 ? '+100%' : '0%';
        }
        const change = ((current - previous) / previous) * 100;
        const sign = change >= 0 ? '+' : '';
        return `${sign}${Math.round(change)}%`;
      };

      const ordersChange = calculatePercentageChange(currentOrdersCount, previousOrdersCount);
      const revenueChange = calculatePercentageChange(currentRevenue, previousRevenue);
      
      // Calculate user growth (new users in last 30 days vs previous 30 days)
      const currentPeriodUsers = users?.filter(user => {
        const userDate = new Date(user.created_at);
        return userDate >= thirtyDaysAgo;
      }) || [];

      const previousPeriodUsers = users?.filter(user => {
        const userDate = new Date(user.created_at);
        return userDate >= sixtyDaysAgo && userDate < thirtyDaysAgo;
      }) || [];

      const usersChange = calculatePercentageChange(currentPeriodUsers.length, previousPeriodUsers.length);
      const productsChange = '0%'; // Products don't change frequently, could be enhanced later

      // Get recent orders (sorted by created_at descending)
      const recentOrders = orders
        ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        ?.slice(0, 10) || [];

      // Calculate top products based on unique product names (not variants)
      // Group products by name to avoid showing each size/color combination separately
      const productsByName = new Map();
      products?.forEach(product => {
        if (!productsByName.has(product.name)) {
          productsByName.set(product.name, {
            id: product.id,
            name: product.name,
            total_sold: 0, // Will be calculated from order_items when available
            revenue: 0, // Will be calculated from order_items when available
          });
        }
      });
      
      const topProducts = Array.from(productsByName.values()).slice(0, 5);

      // Calculate real monthly revenue from orders
      const monthlyRevenue = [];
      const currentDate = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);
        
        const monthOrders = orders?.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= date && orderDate < nextDate;
        }) || [];
        
        const monthRevenue = monthOrders.reduce((sum, order) => sum + Number(order.total), 0);
        
        monthlyRevenue.push({
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          revenue: monthRevenue,
          orders: monthOrders.length,
        });
      }

      setAnalytics({
        totalOrders,
        totalRevenue,
        totalProducts,
        totalUsers,
        ordersChange,
        revenueChange,
        productsChange,
        usersChange,
        recentOrders,
        topProducts,
        monthlyRevenue,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      showToast('Error loading analytics data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canRead) {
      fetchAnalytics();
    }
  }, [canRead]);

  if (!canRead) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">You don't have permission to view analytics.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
            ))}
          </div>
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading analytics...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Orders',
      value: analytics?.totalOrders || 0,
      icon: FiShoppingCart,
      color: 'bg-blue-500',
      change: analytics?.ordersChange || '0%',
    },
    {
      title: 'Total Revenue',
      value: `$${(analytics?.totalRevenue || 0).toFixed(2)}`,
      icon: FiDollarSign,
      color: 'bg-green-500',
      change: analytics?.revenueChange || '0%',
    },
    {
      title: 'Products',
      value: analytics?.totalProducts || 0,
      icon: FiPackage,
      color: 'bg-purple-500',
      change: analytics?.productsChange || '0%',
    },
    {
      title: 'Users',
      value: analytics?.totalUsers || 0,
      icon: FiUsers,
      color: 'bg-orange-500',
      change: analytics?.usersChange || '0%',
    },
  ];

  // Helper function to determine trend direction and color
  const getTrendInfo = (change: string) => {
    if (change === '0%') {
      return {
        icon: FiDollarSign,
        color: 'text-gray-500 dark:text-gray-400',
        bgColor: 'bg-gray-100 dark:bg-gray-700',
      };
    }
    
    const isPositive = change.startsWith('+');
    return {
      icon: isPositive ? FiTrendingUp : FiTrendingDown,
      color: isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
      bgColor: isPositive ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20',
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Track your store's performance and insights</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const trendInfo = getTrendInfo(stat.change);
          const TrendIcon = trendInfo.icon;
          
          return (
            <div key={stat.title} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                  {stat.change !== '0%' && (
                    <p className={`text-sm ${trendInfo.color} flex items-center mt-1`}>
                      <TrendIcon className="h-4 w-4 mr-1" />
                      {stat.change} vs last 30 days
                    </p>
                  )}
                  {stat.change === '0%' && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      No change vs last 30 days
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Orders</h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {analytics?.recentOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Order #{order.id.slice(-8)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    ${Number(order.total).toFixed(2)}
                  </p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.status === 'completed' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                      : order.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {(!analytics?.recentOrders || analytics.recentOrders.length === 0) && (
            <div className="px-6 py-8 text-center">
              <FiEye className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No orders yet</p>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Available Products</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Sales data will appear here once orders are placed</p>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {analytics?.topProducts.slice(0, 5).map((product) => (
              <div key={product.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {product.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Multiple variants available
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {product.total_sold} sold
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ${product.revenue.toFixed(2)} revenue
                  </p>
                </div>
              </div>
            ))}
          </div>
          {(!analytics?.topProducts || analytics.topProducts.length === 0) && (
            <div className="px-6 py-8 text-center">
              <FiPackage className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No products available</p>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Monthly Revenue</h3>
        </div>
        <div className="p-6">
          <div className="flex items-end justify-between gap-4 h-40">
            {analytics?.monthlyRevenue.map((month) => {
              const maxRevenue = Math.max(...(analytics?.monthlyRevenue.map(m => m.revenue) || [1]));
              const barHeight = maxRevenue > 0 ? (month.revenue / maxRevenue) * 120 : 0;
              
              return (
                <div key={month.month} className="flex flex-col items-center flex-1">
                  <div className="flex flex-col justify-end h-32 w-full">
                    <div 
                      className="bg-indigo-500 rounded-t w-8 mx-auto transition-all duration-300 hover:bg-indigo-600" 
                      style={{ height: `${barHeight}px`, minHeight: month.revenue > 0 ? '4px' : '0px' }}
                      title={`$${month.revenue} revenue, ${month.orders} orders`}
                    ></div>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{month.month}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">${month.revenue}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{month.orders} orders</p>
                  </div>
                </div>
              );
            })}
          </div>
          {(!analytics?.monthlyRevenue || analytics.monthlyRevenue.every(m => m.revenue === 0)) && (
            <div className="text-center py-8">
              <FiTrendingUp className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No revenue data yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;