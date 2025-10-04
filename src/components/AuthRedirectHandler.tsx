import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthRedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);
  const processedRef = useRef(false);

  useEffect(() => {
    console.log('AuthRedirectHandler mounted, location:', location.pathname, 'hash:', location.hash);
    
    // CRITICAL: Only process if we actually have an OAuth callback hash
    if (!location.hash || !location.hash.includes('access_token')) {
      // No OAuth callback, don't do anything
      return;
    }
    
    // Prevent double processing
    if (processedRef.current) {
      return;
    }
    
    console.log('OAuth callback detected');
    processedRef.current = true;
    setIsProcessingOAuth(true);
    
    // Check if we were marked as the original tab BEFORE OAuth redirect
    // Use a more unique key to avoid conflicts
    const originalTabId = sessionStorage.getItem('twomates_original_tab_id');
    const myTabId = sessionStorage.getItem('twomates_my_tab_id');
    
    console.log('Tab IDs - Original:', originalTabId, 'My tab:', myTabId);
    
    // If we don't have a tab ID yet, this is definitely a new OAuth tab
    if (!myTabId) {
      console.log('No tab ID found - this is a new OAuth tab');
      handleOAuthInNewTab();
    } else if (originalTabId === myTabId) {
      console.log('This is the original tab with OAuth callback');
      handleOAuthInMainTab();
    } else {
      console.log('This is a different tab than the original');
      handleOAuthInNewTab();
    }
  }, [location.hash]); // Remove user and loading from dependencies

  const handleOAuthInNewTab = () => {
    console.log('Handling OAuth in new tab');
    
    // Prevent this tab from being marked as main
    sessionStorage.setItem('twomates_is_oauth_tab', 'true');
    
    // Wait a bit for Supabase to process the tokens
    setTimeout(() => {
      // Get current theme preference
      const isDarkMode = document.documentElement.classList.contains('dark') || 
                       window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Show success message with proper styling
      document.body.innerHTML = `
        <div class="${isDarkMode ? 'dark' : ''}">
          <div class="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-200">
            <div class="max-w-md w-full mx-4">
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                <!-- Success Icon -->
                <div class="w-16 h-16 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                
                <!-- Title -->
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Login Successful!
                </h1>
                
                <!-- Description -->
                <p class="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  Welcome to TwoMates! You can now close this tab and return to your main window.
                </p>
                
                  <!-- Buttons -->
                  <div class="space-y-4">
                    <button 
                      onclick="
                        try {
                          window.close();
                        } catch(e) {
                          // If window.close() fails, show helpful message
                          this.innerText = 'Please close this tab manually';
                          this.disabled = true;
                          this.classList.add('opacity-50', 'cursor-not-allowed');
                        }
                      " 
                      class="w-full bg-primary-tomato hover:bg-primary-darkTomato text-white font-medium py-3 px-6 rounded-md transition-colors duration-200 shadow-sm hover:shadow-md"
                    >
                      Close This Tab
                    </button>
                    
                    <button
                      onclick="
                        // Try to focus the opener window if it exists
                        if (window.opener && !window.opener.closed) {
                          try {
                            window.opener.focus();
                            window.opener.location.href = '/account';
                            // Show success message
                            this.innerText = 'Redirected! Close this tab manually';
                            this.disabled = true;
                            this.classList.add('opacity-50', 'cursor-not-allowed');
                          } catch(e) {
                            this.innerText = 'Please close this tab and return to TwoMates';
                            this.disabled = true;
                            this.classList.add('opacity-50', 'cursor-not-allowed');
                          }
                        } else {
                          // No opener window found
                          this.innerText = 'Please close this tab and return to TwoMates';
                          this.disabled = true;
                          this.classList.add('opacity-50', 'cursor-not-allowed');
                        }
                      "
                      class="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-3 px-6 rounded-md transition-colors duration-200"
                    >
                      Continue to Account
                    </button>
                  </div>                <!-- Additional Help Text -->
                <div class="mt-6 text-sm text-gray-500 dark:text-gray-400">
                  <p>Close this tab manually to return to TwoMates.</p>
                  <p>Your login was successful!</p>
                </div>
                
                <!-- Footer -->
                <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <div class="flex items-center justify-center space-x-2">
                    <img src="/twomates.png" alt="TwoMates" class="w-6 h-6" />
                    <span class="text-sm text-gray-500 dark:text-gray-400 font-medium">TwoMates</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <style>
          /* Add any missing CSS custom properties */
          :root {
            --color-primary-tomato: #ef4444;
            --color-primary-darkTomato: #dc2626;
          }
          
          .bg-primary-tomato {
            background-color: var(--color-primary-tomato, #ef4444);
          }
          
          .hover\\:bg-primary-darkTomato:hover {
            background-color: var(--color-primary-darkTomato, #dc2626);
          }
          
          /* Ensure dark mode styles work */
          .dark .dark\\:bg-gray-900 {
            background-color: rgb(17 24 39);
          }
          
          .dark .dark\\:bg-gray-800 {
            background-color: rgb(31 41 55);
          }
          
          .dark .dark\\:bg-gray-700 {
            background-color: rgb(55 65 81);
          }
          
          .dark .dark\\:bg-gray-600 {
            background-color: rgb(75 85 99);
          }
          
          .dark .dark\\:border-gray-700 {
            border-color: rgb(55 65 81);
          }
          
          .dark .dark\\:border-gray-600 {
            border-color: rgb(75 85 99);
          }
          
          .dark .dark\\:text-white {
            color: rgb(255 255 255);
          }
          
          .dark .dark\\:text-gray-200 {
            color: rgb(229 231 235);
          }
          
          .dark .dark\\:text-gray-300 {
            color: rgb(209 213 219);
          }
          
          .dark .dark\\:text-gray-400 {
            color: rgb(156 163 175);
          }
          
          .dark .dark\\:hover\\:bg-gray-600:hover {
            background-color: rgb(75 85 99);
          }
        </style>
        
        <script>
          // Prevent any navigation in this tab
          window.addEventListener('beforeunload', function(e) {
            // Don't navigate away from success page
            if (window.location.pathname !== '/' || !window.location.hash.includes('access_token')) {
              e.preventDefault();
              e.returnValue = '';
              return false;
            }
          });
        </script>
      `;
      
      // Notify the main tab that OAuth is complete
      localStorage.setItem('oauth_complete', 'true');
      localStorage.setItem('oauth_timestamp', Date.now().toString());
      
      // Don't try to auto-close the tab as it causes errors in modern browsers
    }, 2000);
  };

  const handleOAuthInMainTab = () => {
    console.log('OAuth callback in main tab');
    
    // Check if user is already authenticated
    if (user && !loading) {
      // User is already authenticated, just redirect
      console.log('User already authenticated during OAuth callback, redirecting immediately');
      window.history.replaceState({}, document.title, window.location.pathname);
      navigate('/account', { replace: true });
      setIsProcessingOAuth(false);
    } else {
      // User not yet authenticated, wait for auth to complete
      console.log('Waiting for auth to complete...');
      
      // Give Supabase 3 seconds to process the tokens
      setTimeout(() => {
        console.log('Auth processing complete, navigating to account');
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate('/account', { replace: true });
        setIsProcessingOAuth(false);
      }, 3000);
    }
  };

  // Mark this tab with a unique ID on initial load
  useEffect(() => {
    // Skip if this is already marked as an OAuth tab
    if (sessionStorage.getItem('twomates_is_oauth_tab') === 'true') {
      return;
    }
    
    // Generate or get tab ID
    let myTabId = sessionStorage.getItem('twomates_my_tab_id');
    if (!myTabId) {
      myTabId = Date.now().toString() + Math.random().toString(36);
      sessionStorage.setItem('twomates_my_tab_id', myTabId);
    }
    
    // If no original tab is set and we're not in an OAuth callback, mark as original
    if (!location.hash || !location.hash.includes('access_token')) {
      const originalTabId = sessionStorage.getItem('twomates_original_tab_id');
      if (!originalTabId) {
        sessionStorage.setItem('twomates_original_tab_id', myTabId);
        console.log('Marked as original tab:', myTabId);
      }
    }
  }, []);

  // Check for OAuth completion from another tab
  useEffect(() => {
    if (location.hash && location.hash.includes('access_token')) {
      // Skip if we're processing OAuth
      return;
    }
    
    // Skip if this is an OAuth tab
    if (sessionStorage.getItem('twomates_is_oauth_tab') === 'true') {
      return;
    }

    const checkInterval = setInterval(() => {
      const oauthComplete = localStorage.getItem('oauth_complete');
      const oauthTimestamp = localStorage.getItem('oauth_timestamp');
      
      if (oauthComplete && oauthTimestamp) {
        const timestamp = parseInt(oauthTimestamp);
        if (Date.now() - timestamp < 10000) {
          console.log('OAuth completion detected from another tab');
          localStorage.removeItem('oauth_complete');
          localStorage.removeItem('oauth_timestamp');
          
          // Force a page reload to ensure auth state is fresh
          window.location.href = '/account';
        }
      }
    }, 500);
    
    // Clean up after 10 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
    }, 10000);
    
    return () => clearInterval(checkInterval);
  }, [location.hash]);


  if (isProcessingOAuth) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-tomato mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Completing sign in...</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Please wait...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthRedirectHandler;