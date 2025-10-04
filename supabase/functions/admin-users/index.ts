// @ts-ignore: Deno module resolution
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from '@supabase/supabase-js'

// Declare Deno global for TypeScript
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

// Type definitions
interface AdminUser {
  id: string;
  is_super_admin: boolean;
  permissions: string[];
  created_at: string;
  updated_at: string;
  created_by?: string;
}

interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: any;
  created_at: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Max-Age': '86400',
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200 
    })
  }

  try {
    // Create Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Create regular client for auth verification
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify the JWT token and get user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if user is admin
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (adminError || !adminUser) {
      return new Response(
        JSON.stringify({ error: 'Access denied: Admin privileges required' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check permissions based on action
    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Missing action parameter' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Handle different actions
    switch (action) {
      case 'list-users':
        return await handleListUsers(supabaseAdmin, adminUser)
      
      case 'search-users':
        const query = url.searchParams.get('query')
        if (!query) {
          return new Response(
            JSON.stringify({ error: 'Missing query parameter' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        return await handleSearchUsers(supabaseAdmin, adminUser, query)
      
      case 'add-admin':
        if (req.method !== 'POST') {
          return new Response(
            JSON.stringify({ error: 'Method not allowed' }),
            { 
              status: 405, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        return await handleAddAdmin(req, supabaseAdmin, adminUser)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

  } catch (error) {
    console.error('Error in admin-users function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function handleListUsers(supabaseAdmin: any, adminUser: AdminUser) {
  // Check if user has users:read permission
  if (!adminUser.is_super_admin && !adminUser.permissions.includes('users:read') && !adminUser.permissions.includes('*')) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  try {
    // Get all users from auth
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authError) {
      throw authError
    }

    // Get admin users
    const { data: adminUsers, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('*')

    if (adminError) {
      throw adminError
    }

    // Get profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')

    if (profilesError) {
      throw profilesError
    }

    // Combine the data
    const enrichedAdminUsers = adminUsers?.map((admin: AdminUser) => {
      const profile = profiles?.find((p: Profile) => p.id === admin.id)
      const authUser = authUsers.users?.find((u: AuthUser) => u.id === admin.id)
      
      return {
        ...admin,
        email: authUser?.email,
        full_name: profile?.full_name || authUser?.user_metadata?.full_name,
      }
    }) || []

    return new Response(
      JSON.stringify({ users: enrichedAdminUsers }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in handleListUsers:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch users' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

async function handleSearchUsers(supabaseAdmin: any, adminUser: AdminUser, query: string) {
  // Check if user has users:write permission (needed to add users)
  if (!adminUser.is_super_admin && !adminUser.permissions.includes('users:write') && !adminUser.permissions.includes('*')) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  try {
    // Get existing admin users to exclude them
    const { data: existingAdmins, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('id')

    if (adminError) {
      throw adminError
    }

    const existingAdminIds = existingAdmins?.map((admin: AdminUser) => admin.id) || []

    // Get all users from auth
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authError) {
      throw authError
    }

    // Get profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')

    if (profilesError) {
      throw profilesError
    }

    // Filter and search users
    const searchResults: any[] = []
    const lowerQuery = query.toLowerCase()

    for (const authUser of authUsers.users || []) {
      // Skip if already an admin
      if (existingAdminIds.includes(authUser.id)) continue

      const email = authUser.email || ''
      const profile = profiles?.find((p: Profile) => p.id === authUser.id)
      const fullName = profile?.full_name || authUser.user_metadata?.full_name || ''

      // Check if matches search query
      const matchesQuery = 
        email.toLowerCase().includes(lowerQuery) ||
        fullName.toLowerCase().includes(lowerQuery) ||
        authUser.id.toLowerCase().includes(lowerQuery)

      if (matchesQuery) {
        searchResults.push({
          id: authUser.id,
          email,
          full_name: fullName,
          created_at: authUser.created_at
        })
      }

      // Limit results
      if (searchResults.length >= 10) break
    }

    return new Response(
      JSON.stringify({ users: searchResults }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in handleSearchUsers:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to search users' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

async function handleAddAdmin(req: Request, supabaseAdmin: any, adminUser: AdminUser) {
  // Check if user has users:write permission
  if (!adminUser.is_super_admin && !adminUser.permissions.includes('users:write') && !adminUser.permissions.includes('*')) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  try {
    const body = await req.json()
    const { userId, isSuperAdmin, permissions } = body

    if (!userId || !permissions || !Array.isArray(permissions)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Add user to admin_users table
    const { error } = await supabaseAdmin
      .from('admin_users')
      .insert({
        id: userId,
        is_super_admin: isSuperAdmin || false,
        permissions: isSuperAdmin ? ['*'] : permissions, // Super admins get all permissions
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: adminUser.id
      })

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error: any) {
    console.error('Error in handleAddAdmin:', error)
    
    // Handle duplicate admin error
    if (error?.code === '23505') {
      return new Response(
        JSON.stringify({ error: 'User is already an admin' }),
        { 
          status: 409, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Failed to add admin user' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}