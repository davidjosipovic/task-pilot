import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar: React.FC = () => {
  const { token, logout } = useAuth();
  const { isDark, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-slate-900 dark:to-slate-800 text-white px-8 py-4 flex justify-between items-center shadow-lg transition duration-200">
      <div className="font-bold text-2xl">
        <Link to="/dashboard" className="hover:text-blue-200 dark:hover:text-blue-300 transition duration-200 flex items-center gap-2">
          <span className="text-3xl">📋</span>
          TaskPilot
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {token ? (
          <>
            <Link 
              to="/dashboard" 
              className="hover:text-blue-200 dark:hover:text-blue-300 transition duration-200 font-medium px-4 py-2 rounded-lg hover:bg-blue-500/30 dark:hover:bg-slate-700"
            >
              Dashboard
            </Link>
            <Link 
              to="/archive" 
              className="hover:text-blue-200 dark:hover:text-blue-300 transition duration-200 font-medium px-4 py-2 rounded-lg hover:bg-blue-500/30 dark:hover:bg-slate-700"
            >
              📦 Archive
            </Link>
            <button
              onClick={toggleDarkMode}
              className="text-xl px-4 py-2 rounded-lg hover:bg-blue-500/30 dark:hover:bg-slate-700 transition duration-200"
              title={isDark ? 'Light Mode' : 'Dark Mode'}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <button 
              onClick={handleLogout} 
              className="bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 px-5 py-2 rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-slate-600 transition duration-200 shadow-md hover:shadow-lg"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link 
              to="/login" 
              className="hover:text-blue-200 dark:hover:text-blue-300 transition duration-200 font-medium px-4 py-2 rounded-lg hover:bg-blue-500/30 dark:hover:bg-slate-700"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 px-5 py-2 rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-slate-600 transition duration-200 shadow-md hover:shadow-lg"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
