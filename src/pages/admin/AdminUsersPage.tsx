import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';
import { supabase } from '../../lib/supabase';
import { FiEdit2, FiSave, FiX, FiTrash2, FiUserPlus, FiShield, FiUser } from 'react-icons/fi';

interface AdminUser {
  id: string;
  email?: string;
  full_name?: string;
  created_at: string;
  is_super_admin: boolean;
  permissions: string[];
  created_by?: string;
  updated_at: string;
}

interface EditState {
  [key: string]: {
    is_super_admin: boolean;
    permissions: string[];
  };
}

const AdminUsersPage: React.FC = () => {
  const { hasPermission, isSuperAdmin } = useAdmin();
  const { showToast } = useToast();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUsers, setEditingUsers] = useState<Set<string>>(new Set());
  const [editStates, setEditStates] = useState<EditState>({});

  const canRead = hasPermission('users:read');
  const canWrite = hasPermission('users:write');

  const availablePermissions = [
    'products:read',
    'products:write',
    'users:read',
    'users:write',
    'analytics:read',
    '*'
  ];

  const fetchAdminUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch admin users with their auth data
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (adminError) throw adminError;

      // Get user emails and names from auth.users
      const userIds = adminData?.map(user => user.id) || [];
      const { data: authData, error: authError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      if (authError) {
        console.warn('Could not fetch user profiles:', authError);
      }

      // Get emails from auth.users (requires RLS bypass or service role)
      const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers();
      
      // Combine the data
      const enrichedAdminUsers = adminData?.map(admin => {
        const profile = authData?.find(p => p.id === admin.id);
        const authUser = authUsersError ? null : authUsers.users?.find(u => u.id === admin.id);
        
        return {
          ...admin,
          email: authUser?.email,
          full_name: profile?.full_name || authUser?.user_metadata?.full_name,
        };
      }) || [];

      setAdminUsers(enrichedAdminUsers);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      showToast('Error loading admin users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canRead) {
      fetchAdminUsers();
    }
  }, [canRead]);

  const startEditing = (user: AdminUser) => {
    if (!canWrite) return;
    
    setEditingUsers(prev => new Set([...prev, user.id]));
    setEditStates(prev => ({
      ...prev,
      [user.id]: {
        is_super_admin: user.is_super_admin,
        permissions: [...user.permissions],
      }
    }));
  };

  const cancelEditing = (userId: string) => {
    setEditingUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
    setEditStates(prev => {
      const newState = { ...prev };
      delete newState[userId];
      return newState;
    });
  };

  const saveUser = async (userId: string) => {
    if (!canWrite) return;

    const editState = editStates[userId];
    if (!editState) return;

    try {
      const { error } = await supabase
        .from('admin_users')
        .update({
          is_super_admin: editState.is_super_admin,
          permissions: editState.permissions,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;

      await fetchAdminUsers();
      cancelEditing(userId);
      showToast('User updated successfully', 'success');
    } catch (error) {
      console.error('Error updating user:', error);
      showToast('Error updating user', 'error');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!canWrite) return;
    
    if (!confirm('Are you sure you want to remove this admin user? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      await fetchAdminUsers();
      showToast('Admin user removed successfully', 'success');
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast('Error removing admin user', 'error');
    }
  };

  const updateEditState = (userId: string, field: string, value: any) => {
    setEditStates(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: value
      }
    }));
  };

  const togglePermission = (userId: string, permission: string) => {
    const editState = editStates[userId];
    if (!editState) return;

    const currentPermissions = editState.permissions;
    const hasPermission = currentPermissions.includes(permission);

    let newPermissions;
    if (hasPermission) {
      newPermissions = currentPermissions.filter(p => p !== permission);
    } else {
      newPermissions = [...currentPermissions, permission];
    }

    updateEditState(userId, 'permissions', newPermissions);
  };

  if (!canRead) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">You don't have permission to view admin users.</p>
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
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
            ))}
          </div>
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading admin users...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Users</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage admin users and their permissions</p>
        </div>
        {canWrite && (
          <button
            onClick={() => showToast('Add user functionality coming soon', 'info')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiUserPlus className="mr-2 h-4 w-4" />
            Add Admin User
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {adminUsers.map((user) => {
            const isEditing = editingUsers.has(user.id);
            const editState = editStates[user.id];

            return (
              <li key={user.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                        {user.is_super_admin ? (
                          <FiShield className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        ) : (
                          <FiUser className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.full_name || user.email || 'Unknown User'}
                        </p>
                        {user.is_super_admin && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">
                            Super Admin
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      
                      {isEditing ? (
                        <div className="mt-2 space-y-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={editState?.is_super_admin || false}
                              onChange={(e) => updateEditState(user.id, 'is_super_admin', e.target.checked)}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Super Admin</span>
                          </label>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Permissions:</p>
                            <div className="flex flex-wrap gap-2">
                              {availablePermissions.map((permission) => (
                                <button
                                  key={permission}
                                  onClick={() => togglePermission(user.id, permission)}
                                  className={`px-2 py-1 text-xs rounded-full border ${
                                    editState?.permissions.includes(permission)
                                      ? 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-800 dark:text-indigo-100 dark:border-indigo-600'
                                      : 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                                  }`}
                                >
                                  {permission}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-1">
                          <div className="flex flex-wrap gap-1">
                            {user.permissions.map((permission) => (
                              <span
                                key={permission}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                              >
                                {permission}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {canWrite && (
                    <div className="flex items-center space-x-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => saveUser(user.id)}
                            className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-green-600 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-800 dark:text-green-100 dark:hover:bg-green-700"
                          >
                            <FiSave className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => cancelEditing(user.id)}
                            className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-gray-600 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                          >
                            <FiX className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditing(user)}
                            className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-800 dark:text-indigo-100 dark:hover:bg-indigo-700"
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-red-600 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-800 dark:text-red-100 dark:hover:bg-red-700"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {adminUsers.length === 0 && (
        <div className="text-center py-12">
          <FiUser className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No admin users</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by adding an admin user.</p>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;