import { supabase } from './supabase';

interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
}

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

export class AdminUserService {
  private static getEdgeFunctionUrl(): string {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    return `${supabaseUrl}/functions/v1/admin-users`;
  }

  private static async getAuthHeaders(): Promise<HeadersInit> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('No valid session found');
    }

    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };
  }

  static async listAdminUsers(): Promise<AdminUser[]> {
    try {
      const headers = await this.getAuthHeaders();
      const url = `${this.getEdgeFunctionUrl()}?action=list-users`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch admin users');
      }

      const data = await response.json();
      return data.users;
    } catch (error) {
      console.error('Error fetching admin users:', error);
      throw error;
    }
  }

  static async searchUsers(query: string): Promise<User[]> {
    try {
      const headers = await this.getAuthHeaders();
      const url = `${this.getEdgeFunctionUrl()}?action=search-users&query=${encodeURIComponent(query)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to search users');
      }

      const data = await response.json();
      return data.users;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  static async addAdminUser(
    userId: string, 
    isSuperAdmin: boolean, 
    permissions: string[]
  ): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const url = `${this.getEdgeFunctionUrl()}?action=add-admin`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId,
          isSuperAdmin,
          permissions,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add admin user');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error('Failed to add admin user');
      }
    } catch (error) {
      console.error('Error adding admin user:', error);
      throw error;
    }
  }
}