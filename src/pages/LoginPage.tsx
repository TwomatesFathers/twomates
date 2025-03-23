import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiMail, FiLock, FiAlertCircle, FiFacebook } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signInWithGoogle, signInWithFacebook } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

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
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google. Please try again.');
    }
  };

  const handleFacebookSignIn = async () => {
    setError(null);
    try {
      const { error } = await signInWithFacebook();
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Facebook. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card p-8"
      >
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold font-display mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Welcome Back</h1>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Sign in to your Twomates account</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className={`${theme === 'dark' ? 'bg-red-900/20 border-red-800 text-red-300' : 'bg-red-50 border-red-200 text-red-700'} border px-4 py-3 rounded-md flex items-start mb-6`}
          >
            <FiAlertCircle className="mr-2 mt-1 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className={`block mb-2 font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Email</label>
            <div className={`relative rounded-md shadow-sm ${theme === 'dark' ? 'bg-gray-800' : ''}`}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`block w-full pl-10 py-3 pr-3 rounded-md focus:outline-none focus:ring-2 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:ring-primary-lightTomato' 
                    : 'border-gray-300 text-gray-900 placeholder:text-gray-500 focus:ring-primary-tomato'
                }`}
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="password" className={`block mb-2 font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Password</label>
            <div className={`relative rounded-md shadow-sm ${theme === 'dark' ? 'bg-gray-800' : ''}`}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`block w-full pl-10 py-3 pr-3 rounded-md focus:outline-none focus:ring-2 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:ring-primary-lightTomato' 
                    : 'border-gray-300 text-gray-900 placeholder:text-gray-500 focus:ring-primary-tomato'
                }`}
                placeholder="Enter your password"
              />
            </div>
            <div className="mt-1 flex justify-end">
              <Link to="/forgot-password" className={`text-sm ${theme === 'dark' ? 'text-primary-lightTomato hover:text-primary-tomato' : 'text-primary-tomato hover:text-primary-darkTomato'}`}>
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

          <div className={`my-6 flex items-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="flex-grow border-t border-current"></div>
            <span className="mx-4 text-sm">OR CONTINUE WITH</span>
            <div className="flex-grow border-t border-current"></div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className={`flex items-center justify-center py-3 px-4 rounded-md ${
                theme === 'dark' 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FcGoogle className="mr-2" size={20} />
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={handleFacebookSignIn}
              className={`flex items-center justify-center py-3 px-4 rounded-md ${
                theme === 'dark' 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FiFacebook className="mr-2 text-[#1877F2]" size={20} />
              <span>Facebook</span>
            </button>
          </div>

          <div className="text-center">
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
              Don't have an account?{' '}
              <Link to="/register" className={`font-medium ${theme === 'dark' ? 'text-primary-lightTomato hover:text-primary-tomato' : 'text-primary-tomato hover:text-primary-darkTomato'}`}>
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