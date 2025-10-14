import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';

describe('Navbar Component', () => {
  const mockLogout = vi.fn();
  const mockSetToken = vi.fn();

  const renderWithAuth = (token: string | null) => {
    return render(
      <AuthContext.Provider value={{ token, setToken: mockSetToken, logout: mockLogout }}>
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      </AuthContext.Provider>
    );
  };

  it('renders TaskPilot brand', () => {
    renderWithAuth(null);
    expect(screen.getByText('TaskPilot')).toBeInTheDocument();
  });

  it('shows Login and Register links when not authenticated', () => {
    renderWithAuth(null);
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('shows Dashboard and Logout when authenticated', () => {
    renderWithAuth('fake-token');
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
    expect(screen.queryByText('Register')).not.toBeInTheDocument();
  });

  it('has correct links to routes', () => {
    renderWithAuth(null);
    
    const loginLink = screen.getByText('Login').closest('a');
    const registerLink = screen.getByText('Register').closest('a');
    
    expect(loginLink).toHaveAttribute('href', '/login');
    expect(registerLink).toHaveAttribute('href', '/register');
  });
});
