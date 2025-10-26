import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children }) => {
  const { isDark, toggleDarkMode } = useTheme();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 transition duration-200">
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleDarkMode}
          className="text-2xl px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition duration-200"
          title={isDark ? 'Light Mode' : 'Dark Mode'}
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>
      <div className="bg-white dark:bg-slate-800 p-10 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">TaskPilot</h1>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">{title}</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">{subtitle}</p>
        </div>

        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
