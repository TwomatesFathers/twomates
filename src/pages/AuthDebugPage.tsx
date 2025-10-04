import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const AuthDebugPage = () => {
  const { user, session, loading } = useAuth();

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Debug</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold">Loading State:</h2>
          <p>{loading ? 'True (Loading...)' : 'False (Not loading)'}</p>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold">User:</h2>
          <pre className="whitespace-pre-wrap text-sm">
            {user ? JSON.stringify(user, null, 2) : 'null'}
          </pre>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold">Session:</h2>
          <pre className="whitespace-pre-wrap text-sm">
            {session ? JSON.stringify(session, null, 2) : 'null'}
          </pre>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold">Current URL:</h2>
          <p>{window.location.href}</p>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold">Session Storage:</h2>
          <p>redirectAfterAuth: {sessionStorage.getItem('redirectAfterAuth') || 'null'}</p>
        </div>
        
        <div className="bg-blue-100 p-4 rounded">
          <h2 className="font-bold mb-2">Test Navigation:</h2>
          <div className="space-x-4">
            <Link 
              to="/account" 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Go to Account Page
            </Link>
            <Link 
              to="/" 
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Go to Home Page
            </Link>
            <Link 
              to="/login" 
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Go to Login Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthDebugPage;