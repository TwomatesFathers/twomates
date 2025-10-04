import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

// Types
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any | null }>;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signInWithGoogle: () => Promise<{ error: any | null }>;
  signInWithFacebook: () => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to create or update user profile
  const ensureUserProfile = async (authUser: User) => {
    try {
      // First check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authUser.id)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no rows

      if (checkError) {
        console.error('Error checking user profile:', checkError);
        return;
      }

      if (existingProfile) {
        // Profile exists, try to update it with minimal data
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || '',
            avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || '',
            updated_at: new Date().toISOString(),
          })
          .eq('id', authUser.id);

        if (updateError) {
          console.error('Error updating user profile:', updateError);
        } else {
          console.log('User profile updated for:', authUser.id);
        }
      } else {
        // Profile doesn't exist, create it with minimal required data
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.id,
            // Only include fields that definitely exist in the table
            created_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error('Error creating user profile:', insertError);
        } else {
          console.log('User profile created for:', authUser.id);
        }
      }
    } catch (error) {
      console.error('Error in ensureUserProfile:', error);
    }
  };

  useEffect(() => {
    // Get session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      const authUser = session?.user as User || null;
      setUser(authUser);
      
      // Create/update profile when session is loaded
      if (authUser) {
        ensureUserProfile(authUser);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        const authUser = session?.user as User || null;
        setUser(authUser);
        
        // Create/update profile when user signs in
        if (authUser && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          await ensureUserProfile(authUser);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Sign up with email and password
  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    // Save the current location before redirecting
    const currentPath = window.location.pathname + window.location.search;
    sessionStorage.setItem('redirectAfterAuth', currentPath);
    
    // Use the configured redirect URI or fallback to origin
    const redirectTo = import.meta.env.VITE_PROVIDER_REDIRECT_URI || window.location.origin;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    });
    return { error };
  };

  // Sign in with Facebook
  const signInWithFacebook = async () => {
    // Save the current location before redirecting
    const currentPath = window.location.pathname + window.location.search;
    sessionStorage.setItem('redirectAfterAuth', currentPath);
    
    // Use simple base URL for now to debug the user agent issue
    const callbackUrl = import.meta.env.VITE_PROVIDER_REDIRECT_URI || window.location.origin;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: callbackUrl
      }
    });
    return { error };
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signInWithFacebook,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 