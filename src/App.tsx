import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { AuthComponent } from './components/AuthComponent';
import DashboardComponent from './components/DashboardComponent';
import HistoryComponent from './components/HistoryComponent';

/**
 * ProtectedRoute Component
 * 
 * Wrapper component that protects routes requiring authentication.
 * Redirects to /login if user is not authenticated.
 * 
 * Requirements: 1.1, 1.4
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Render protected content
  return <>{children}</>;
}

/**
 * App Component
 * 
 * Main application component that configures routing and authentication.
 * 
 * Routes:
 * - /login: Authentication page (redirects to /dashboard if already authenticated)
 * - /dashboard: Main dashboard (protected)
 * - /history: History view (protected)
 * - /: Redirects to /dashboard
 * 
 * Requirements: 1.2, 1.4
 */
function App() {
  const { user, loading } = useAuth();

  // Show loading state during initial authentication check
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Inicializando aplicación...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Login Route - Redirect to dashboard if already authenticated */}
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <AuthComponent />
            )
          }
        />

        {/* Protected Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardComponent />
            </ProtectedRoute>
          }
        />

        {/* Protected History Route */}
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryComponent />
            </ProtectedRoute>
          }
        />

        {/* Root Route - Redirect to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Catch-all Route - Redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
