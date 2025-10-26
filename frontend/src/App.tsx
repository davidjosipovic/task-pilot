
import { useMemo, lazy, Suspense } from 'react';
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  from,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { ApolloProvider } from '@apollo/client/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load pages for code splitting
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Project = lazy(() => import('./pages/Project'));
const Archive = lazy(() => import('./pages/Archive'));
const Templates = lazy(() => import('./pages/Templates'));

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
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/project/:id" element={<Project />} />
              <Route path="/project/:projectId/templates" element={<Templates />} />
              <Route path="/archive" element={<Archive />} />
            </Route>
            <Route path="*" element={<Login />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ApolloProvider>
  );
};

const App: React.FC = () => (
  <ErrorBoundary>
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
