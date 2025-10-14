import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 flex justify-between items-center shadow-lg">
      <div className="font-bold text-2xl">
        <Link to="/dashboard" className="hover:text-blue-200 transition duration-200 flex items-center gap-2">
          <span className="text-3xl">📋</span>
          TaskPilot
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {token ? (
          <>
            <Link 
              to="/dashboard" 
              className="hover:text-blue-200 transition duration-200 font-medium px-4 py-2 rounded-lg hover:bg-blue-500/30"
            >
              Dashboard
            </Link>
            <button 
              onClick={handleLogout} 
              className="bg-white text-blue-600 px-5 py-2 rounded-lg font-semibold hover:bg-blue-50 transition duration-200 shadow-md hover:shadow-lg"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link 
              to="/login" 
              className="hover:text-blue-200 transition duration-200 font-medium px-4 py-2 rounded-lg hover:bg-blue-500/30"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="bg-white text-blue-600 px-5 py-2 rounded-lg font-semibold hover:bg-blue-50 transition duration-200 shadow-md hover:shadow-lg"
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
