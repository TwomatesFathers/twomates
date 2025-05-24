import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthRedirectHandler = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Only run when loading is complete and user is authenticated
    if (!loading && user) {
      const redirectPath = sessionStorage.getItem('redirectAfterAuth');
      
      if (redirectPath && redirectPath !== '/' && redirectPath !== window.location.pathname) {
        // Remove the stored redirect path
        sessionStorage.removeItem('redirectAfterAuth');
        
        // Navigate to the intended destination
        navigate(redirectPath, { replace: true });
      }
    }
  }, [user, loading, navigate]);

  return null; // This component doesn't render anything
};

export default AuthRedirectHandler; 