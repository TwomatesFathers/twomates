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

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get session from Supabase
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }
        
        if (mounted) {
          console.log('Initial session check:', session ? 'Session found' : 'No session');
          setSession(session);
          const authUser = session?.user as User || null;
          setUser(authUser);
          
          // Profile creation disabled to prevent loops
          
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session ? 'Session present' : 'No session');
        
        if (mounted) {
          setSession(session);
          const authUser = session?.user as User || null;
          setUser(authUser);
          
          // Temporarily disable profile updates to fix infinite loops
          // TODO: Re-enable profile updates with better logic later
          /*
          if (authUser && event === 'SIGNED_IN' && 
              !profileUpdateInProgress.current && 
              !processedUserIds.current.has(authUser.id)) {
            
            console.log('User signed in for first time, ensuring profile exists');
            profileUpdateInProgress.current = true;
            processedUserIds.current.add(authUser.id);
            
            ensureUserProfile(authUser)
              .then(() => {
                console.log('Profile creation/update completed');
                profileUpdateInProgress.current = false;
              })
              .catch(error => {
                console.error('Error ensuring user profile:', error);
                profileUpdateInProgress.current = false;
              });
          }
          */
          
          // Set loading to false immediately after setting user state
          console.log('Setting loading to false');
          setLoading(false);
        }
      }
    );

    // Cleanup function
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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
    // Clear any existing redirect path to prevent confusion
    sessionStorage.removeItem('redirectAfterAuth');
    
    // Use the configured redirect URI, but ensure it matches the current protocol
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const redirectTo = isDevelopment 
      ? 'http://localhost:5173' 
      : (import.meta.env.VITE_PROVIDER_REDIRECT_URI || window.location.origin);
    
    console.log('Google OAuth redirect URI:', redirectTo);
    
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
    
    // Use the configured redirect URI, but ensure it matches the current protocol
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const redirectTo = isDevelopment 
      ? 'http://localhost:5173' 
      : (import.meta.env.VITE_PROVIDER_REDIRECT_URI || window.location.origin);
    
    console.log('Facebook OAuth redirect URI:', redirectTo);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: redirectTo,
        scopes: 'email',
      }
    });
    return { error };
  };

  // Sign out
  const signOut = async () => {
    try {
      // Clear any stored redirect path
      sessionStorage.removeItem('redirectAfterAuth');
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        throw error;
      }
      
      // Force clear local state
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error in signOut:', error);
      throw error;
    }
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

// Custom hook exported separately for Fast Refresh compatibility
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}