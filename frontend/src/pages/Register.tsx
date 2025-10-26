import { useState, useEffect } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Notification, useNotification } from '../components/Notification';
import AuthLayout from '../components/AuthLayout';
import LoadingSpinner from '../components/LoadingSpinner';

const REGISTER_USER = gql`
  mutation RegisterUser($name: String!, $email: String!, $password: String!) {
    registerUser(name: $name, email: $email, password: $password) {
      token
      user { id name email }
    }
  }
`;

interface User {
  id: string;
  name: string;
  email: string;
}

interface RegisterUserData {
  registerUser: {
    token: string;
    user: User;
  };
}

interface RegisterUserVars {
  name: string;
  email: string;
  password: string;
}

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registerUser, { loading, error }] = useMutation<RegisterUserData, RegisterUserVars>(REGISTER_USER);
  const navigate = useNavigate();
  const { setToken, token } = useAuth();
  const { notification, showNotification, dismissNotification } = useNotification();

  // Redirect if already logged in
  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await registerUser({ variables: { name, email, password } });
      if (res.data?.registerUser?.token) {
        const token = res.data.registerUser.token;
        localStorage.setItem('token', token);
        setToken(token);
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      showNotification('error', message);
    }
  };

  if (loading) {
    return (
      <AuthLayout title="Create Account" subtitle="Start managing your projects today">
        <LoadingSpinner message="Creating account..." />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create Account" subtitle="Start managing your projects today">
      <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
            <input
              className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
            <input
              className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
            <input
              className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              type="password"
              placeholder="Create a strong password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg text-sm">
              {error.message}
            </div>
          )}

          <button 
            className="w-full bg-blue-600 dark:bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition duration-200 shadow-md hover:shadow-lg" 
            type="submit"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
        {notification && (
          <Notification 
            {...notification} 
            onDismiss={dismissNotification}
          />
        )}
    </AuthLayout>
  );
};

export default Register;
