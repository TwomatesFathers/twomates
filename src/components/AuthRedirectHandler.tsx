import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthRedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Handle OAuth callback with hash parameters (Google, Facebook, etc.)
    if (location.hash && location.hash.includes('access_token')) {
      // This is an OAuth callback, wait for Supabase to process it
      return;
    }

    // Only run when loading is complete and user is authenticated
    if (!loading && user) {
      const redirectPath = sessionStorage.getItem('redirectAfterAuth');
      
      if (redirectPath && redirectPath !== '/' && redirectPath !== window.location.pathname) {
        // Remove the stored redirect path
        sessionStorage.removeItem('redirectAfterAuth');
        
        // Navigate to the intended destination
        navigate(redirectPath, { replace: true });
      } else if (location.pathname === '/') {
        // If user is on home page after login, redirect to account
        navigate('/account', { replace: true });
      }
    }
  }, [user, loading, navigate, location]);

  return null; // This component doesn't render anything
};

export default AuthRedirectHandler; 