import React, { useState, useEffect } from 'react';
import { FiX, FiSearch, FiUserPlus, FiShield, FiUser } from 'react-icons/fi';
import { AdminUserService } from '../../lib/adminUserService';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';

interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
}

interface AddAdminUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddAdminUserModal: React.FC<AddAdminUserModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['products:read']);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availablePermissions = [
    'products:read',
    'products:write',
    'users:read',
    'users:write',
    'analytics:read',
    '*'
  ];

  const permissionDescriptions: { [key: string]: string } = {
    'products:read': 'View products',
    'products:write': 'Edit products',
    'users:read': 'View admin users',
    'users:write': 'Manage admin users',
    'analytics:read': 'View analytics',
    '*': 'All permissions'
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setSelectedUser(null);
      setIsSuperAdmin(false);
      setSelectedPermissions(['products:read']);
    }
  }, [isOpen]);

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Try the admin service first
      try {
        const users = await AdminUserService.searchUsers(query);
        setSearchResults(users);
        return;
      } catch (edgeFunctionError) {
        console.warn('Edge function not available, falling back to simple search:', edgeFunctionError);
      }

      // Fallback: Search in profiles only (without checking existing admins or getting emails)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .or(`full_name.ilike.%${query}%`)
        .limit(10);

      if (profilesError) throw profilesError;

      // Convert profiles to User format
      const users = profiles?.map(profile => ({
        id: profile.id,
        email: 'Email not available (requires Edge Function)',
        full_name: profile.full_name || 'No name',
        created_at: new Date().toISOString()
      })) || [];

      setSearchResults(users);
    } catch (error) {
      console.error('Error searching users:', error);
      showToast('Error searching users', 'error');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  const togglePermission = (permission: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permission)) {
        return prev.filter(p => p !== permission);
      } else {
        return [...prev, permission];
      }
    });
  };

  const handleSubmit = async () => {
    if (!selectedUser) {
      showToast('Please select a user', 'error');
      return;
    }

    if (selectedPermissions.length === 0) {
      showToast('Please select at least one permission', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // Try the admin service first
      try {
        await AdminUserService.addAdminUser(
          selectedUser.id,
          isSuperAdmin,
          selectedPermissions
        );
        showToast('Admin user added successfully', 'success');
        onSuccess();
        onClose();
        return;
      } catch (edgeFunctionError) {
        console.warn('Edge function not available, falling back to direct database access:', edgeFunctionError);
      }

      // Fallback: Direct database insert
      const { error } = await supabase
        .from('admin_users')
        .insert({
          id: selectedUser.id,
          is_super_admin: isSuperAdmin,
          permissions: selectedPermissions,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      showToast('Admin user added successfully', 'success');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error adding admin user:', error);
      if (error.code === '23505' || error.message?.includes('already an admin')) {
        showToast('User is already an admin', 'error');
      } else {
        showToast('Error adding admin user', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Add Admin User
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* User Search */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search for User
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by email, name, or ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Search Results */}
            {searchQuery && (
              <div className="mt-2 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 max-h-48 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-600 border-b border-gray-200 dark:border-gray-600 last:border-b-0 ${
                        selectedUser?.id === user.id ? 'bg-indigo-50 dark:bg-indigo-900' : ''
                      }`}
                    >
                      <div className="flex items-center">
                        <FiUser className="h-4 w-4 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.full_name || 'No name'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No users found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected User */}
          {selectedUser && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Selected User
              </h3>
              <div className="flex items-center">
                <FiUser className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedUser.full_name || 'No name'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedUser.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Super Admin Toggle */}
          {selectedUser && (
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isSuperAdmin}
                  onChange={(e) => setIsSuperAdmin(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center">
                  <FiShield className="h-4 w-4 mr-1" />
                  Super Admin (has all permissions)
                </span>
              </label>
            </div>
          )}

          {/* Permissions */}
          {selectedUser && !isSuperAdmin && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Permissions
              </h3>
              <div className="space-y-2">
                {availablePermissions.map((permission) => (
                  <label key={permission} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(permission)}
                      onChange={() => togglePermission(permission)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">{permission}</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-2">
                        - {permissionDescriptions[permission]}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedUser || isSubmitting}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Adding...
              </>
            ) : (
              <>
                <FiUserPlus className="h-4 w-4 mr-2" />
                Add Admin User
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAdminUserModal;