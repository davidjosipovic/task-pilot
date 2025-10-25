import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar: React.FC = () => {
  const { token, logout } = useAuth();
  const { isDark, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-slate-900 dark:to-slate-800 text-white shadow-lg transition duration-200">
      <div className="px-4 sm:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="font-bold text-xl sm:text-2xl flex-1">
            <Link 
              to="/dashboard" 
              className="hover:text-blue-200 dark:hover:text-blue-300 transition duration-200 flex items-center gap-2"
              onClick={closeMenu}
            >
              <span className="text-2xl sm:text-3xl">📋</span>
              <span>TaskPilot</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
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

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleDarkMode}
              className="text-xl px-3 py-2 rounded-lg hover:bg-blue-500/30 dark:hover:bg-slate-700 transition duration-200"
              title={isDark ? 'Light Mode' : 'Dark Mode'}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-2xl px-3 py-2 rounded-lg hover:bg-blue-500/30 dark:hover:bg-slate-700 transition duration-200"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-2 space-y-2 border-t border-blue-500/30 dark:border-slate-700 pt-4">
            {token ? (
              <>
                <Link 
                  to="/dashboard" 
                  onClick={closeMenu}
                  className="block hover:text-blue-200 dark:hover:text-blue-300 transition duration-200 font-medium px-4 py-3 rounded-lg hover:bg-blue-500/30 dark:hover:bg-slate-700"
                >
                  📊 Dashboard
                </Link>
                <Link 
                  to="/archive" 
                  onClick={closeMenu}
                  className="block hover:text-blue-200 dark:hover:text-blue-300 transition duration-200 font-medium px-4 py-3 rounded-lg hover:bg-blue-500/30 dark:hover:bg-slate-700"
                >
                  📦 Archive
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="w-full text-left bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 px-4 py-3 rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-slate-600 transition duration-200 shadow-md"
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  onClick={closeMenu}
                  className="block hover:text-blue-200 dark:hover:text-blue-300 transition duration-200 font-medium px-4 py-3 rounded-lg hover:bg-blue-500/30 dark:hover:bg-slate-700"
                >
                  🔑 Login
                </Link>
                <Link 
                  to="/register" 
                  onClick={closeMenu}
                  className="block bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 px-4 py-3 rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-slate-600 transition duration-200 shadow-md"
                >
                  ✍️ Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
