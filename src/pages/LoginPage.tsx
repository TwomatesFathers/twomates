import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiAlertCircle, FiFacebook } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signInWithGoogle, signInWithFacebook, user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to account if user becomes authenticated
  useEffect(() => {
    if (!loading && user) {
      console.log('User authenticated on login page, redirecting to account');
      navigate('/account', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      navigate('/account');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        console.error('Google sign-in error:', error);
        throw error;
      }
      // OAuth flow will handle the redirect, useEffect will catch successful auth
    } catch (err: any) {
      console.error('Google sign-in failed:', err);
      setError(err.message || 'Failed to sign in with Google. Please try again.');
      setIsLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const { error } = await signInWithFacebook();
      if (error) {
        console.error('Facebook sign-in error:', error);
        throw error;
      }
      // Note: Don't navigate here as the OAuth flow will handle the redirect
    } catch (err: any) {
      console.error('Facebook sign-in failed:', err);
      setError(err.message || 'Failed to sign in with Facebook. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card bg-card-light dark:bg-card-dark p-8 shadow-lg rounded-lg"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-display mb-2 text-gray-900 dark:text-white">Welcome Back</h1>
          <p className="text-gray-600 dark:text-gray-300">Sign in to your Twomates account</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-md flex items-start mb-6"
          >
            <FiAlertCircle className="mr-2 mt-1 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block mb-2 font-medium text-gray-700 dark:text-gray-200">Email</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="text-gray-500 dark:text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full pl-10 py-3 pr-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-tomato dark:focus:ring-primary-lightTomato"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block mb-2 font-medium text-gray-700 dark:text-gray-200">Password</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-gray-500 dark:text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full pl-10 py-3 pr-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-tomato dark:focus:ring-primary-lightTomato"
                placeholder="Enter your password"
              />
            </div>
            <div className="mt-1 flex justify-end">
              <Link to="/forgot-password" className="text-sm text-primary-tomato hover:text-primary-darkTomato dark:text-primary-lightTomato dark:hover:text-primary-tomato">
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full primary-btn btn py-3 rounded-md font-medium ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>

          <div className="my-6 flex items-center text-gray-500 dark:text-gray-400">
            <div className="flex-grow border-t border-current"></div>
            <span className="mx-4 text-sm">OR CONTINUE WITH</span>
            <div className="flex-grow border-t border-current"></div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className={`flex items-center justify-center py-3 px-4 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <FcGoogle className="mr-2" size={20} />
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={handleFacebookSignIn}
              disabled={isLoading}
              className={`flex items-center justify-center py-3 px-4 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <FiFacebook className="mr-2 text-[#1877F2]" size={20} />
              <span>Facebook</span>
            </button>
          </div>

          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-primary-tomato hover:text-primary-darkTomato dark:text-primary-lightTomato dark:hover:text-primary-tomato">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage; 