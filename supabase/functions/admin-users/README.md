# Admin Users Edge Function

This Edge Function provides secure admin API access for user management operations that require elevated permissions.

## Features

- **List Admin Users**: Get all admin users with full profile information
- **Search Users**: Search for users to add as admins (excludes existing admins)
- **Add Admin User**: Add a user to the admin_users table with specified permissions

## Deployment

### Prerequisites

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project (run from project root):
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### Deploy the Function

From the project root directory, run:

```bash
supabase functions deploy admin-users
```

### Environment Variables

The function requires these environment variables to be set in your Supabase project:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your service role key (for admin operations)
- `SUPABASE_ANON_KEY` - Your anonymous key (for JWT verification)

These are typically set automatically when you deploy, but you can verify them in your Supabase dashboard under Settings > API.

### Testing the Deployment

After deployment, the function will be available at:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/admin-users
```

You can test it with curl:

```bash
# Test with a valid JWT token
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     "https://YOUR_PROJECT_REF.supabase.co/functions/v1/admin-users?action=list-users"
```

## API Endpoints

### List Admin Users
```
GET /admin-users?action=list-users
Authorization: Bearer JWT_TOKEN
```

### Search Users
```
GET /admin-users?action=search-users&query=SEARCH_TERM
Authorization: Bearer JWT_TOKEN
```

### Add Admin User
```
POST /admin-users?action=add-admin
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "userId": "user-uuid",
  "isSuperAdmin": false,
  "permissions": ["products:read", "products:write"]
}
```

## Security

- All endpoints require a valid JWT token
- Users must be existing admins to access any endpoint
- Specific permissions are checked for each operation:
  - `users:read` or `*` - Required to list admin users
  - `users:write` or `*` - Required to search and add users
- Super admins bypass all permission checks

## Fallback Behavior

The client application includes fallback behavior when the Edge Function is not available:
- Falls back to direct database queries (with limited functionality)
- Gracefully handles missing email information
- Provides clear user feedback about reduced functionality

## Troubleshooting

### Function Not Found (404)
- Ensure the function is deployed: `supabase functions deploy admin-users`
- Check your project is linked: `supabase link --project-ref YOUR_REF`

### CORS Errors
- The function includes proper CORS headers
- Ensure you're using the correct Supabase URL

### Permission Denied (403)
- Verify the user has admin privileges in the `admin_users` table
- Check that the JWT token is valid and not expired
- Ensure the user has the required permissions for the operation

### Environment Variables
- Verify environment variables are set correctly in Supabase dashboard
- The `SUPABASE_SERVICE_ROLE_KEY` is required for admin operations