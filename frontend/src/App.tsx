
import React, { useMemo } from 'react';
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  from,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { ApolloProvider } from '@apollo/client/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Project from './pages/Project';
import Archive from './pages/Archive';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

const AppContent: React.FC = () => {
  const { token } = useAuth();

  // Create a new Apollo Client instance whenever token changes
  const client = useMemo(() => {
    const httpLink = new HttpLink({
      uri: import.meta.env.VITE_API_URL || 'http://localhost:4000/graphql',
      credentials: 'include',
    });

    const authLink = setContext((_, { headers }) => {
      return {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : '',
        }
      }
    });

    return new ApolloClient({
      link: from([authLink, httpLink]),
      cache: new InMemoryCache({
        typePolicies: {
          Query: {
            fields: {
              getProjects: {
                merge(_existing = [], incoming) {
                  return incoming;
                },
              },
              getArchivedProjects: {
                merge(_existing = [], incoming) {
                  return incoming;
                },
              },
            },
          },
        },
      }),
    });
  }, [token]); // Recreate client when token changes

  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/project/:id" element={<Project />} />
            <Route path="/archive" element={<Archive />} />
          </Route>
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </ApolloProvider>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </ThemeProvider>
);

export default App;
