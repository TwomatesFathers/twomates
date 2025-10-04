import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface AdminUser {
  id: string;
  is_super_admin: boolean;
  permissions: string[];
  created_at: string;
}

interface AdminContextType {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  adminUser: AdminUser | null;
  loading: boolean;
  hasPermission: (permission: string) => boolean;
  checkAdminStatus: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setAdminUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Check if user is in admin_users table
      const { data: adminData, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle(); // Use maybeSingle to avoid errors when no record exists

      if (error) {
        console.error('Error checking admin status:', error);
        // Don't fail completely, just set as non-admin and continue
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setAdminUser(null);
      } else if (adminData) {
        setIsAdmin(true);
        setIsSuperAdmin(adminData.is_super_admin);
        setAdminUser(adminData);
      } else {
        // Check user metadata for admin flag (fallback)
        const isAdminFromMetadata = user.user_metadata?.is_admin === true ||
                                   user.user_metadata?.is_admin === 'true';
        const isSuperAdminFromMetadata = user.user_metadata?.is_super_admin === true || 
                                        user.user_metadata?.is_super_admin === 'true';
        
        setIsAdmin(isAdminFromMetadata);
        setIsSuperAdmin(isSuperAdminFromMetadata);
        setAdminUser(null);
      }
    } catch (error) {
      console.error('Error in checkAdminStatus:', error);
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setAdminUser(null);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!isAdmin) return false;
    if (isSuperAdmin) return true; // Super admins have all permissions
    if (!adminUser) return false;
    
    return adminUser.permissions.includes(permission) || adminUser.permissions.includes('*');
  };

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const value: AdminContextType = {
    isAdmin,
    isSuperAdmin,
    adminUser,
    loading,
    hasPermission,
    checkAdminStatus,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

// Custom hook exported at the end for Fast Refresh compatibility
export function useAdmin(): AdminContextType {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}

// Higher-order component for admin route protection
export const withAdminAuth = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission?: string
) => {
  return (props: P) => {
    const { isAdmin, hasPermission, loading } = useAdmin();

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    if (!isAdmin || (requiredPermission && !hasPermission(requiredPermission))) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to view this page.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};