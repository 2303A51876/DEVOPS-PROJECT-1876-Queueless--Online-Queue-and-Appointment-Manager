import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';

/**
 * App - Root application component with routing
 * Routes:
 *   /login → Login page
 *   /register → Register page
 *   /user-dashboard → User Dashboard (protected, user role)
 *   /admin-dashboard → Admin Dashboard (protected, admin role)
 */
const App = () => {
  const { loading, isAuthenticated, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950 bg-mesh">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-dark-400 font-medium">Loading QueueLess...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 bg-mesh flex flex-col">
      <Navbar />
      <main className="pt-16 flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to={isAdmin ? '/admin-dashboard' : '/user-dashboard'} replace />
              ) : (
                <Login />
              )
            }
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? (
                <Navigate to={isAdmin ? '/admin-dashboard' : '/user-dashboard'} replace />
              ) : (
                <Register />
              )
            }
          />
          <Route
            path="/user-dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          {/* Legacy route redirects */}
          <Route path="/dashboard" element={<Navigate to="/user-dashboard" replace />} />
          <Route path="/admin" element={<Navigate to="/admin-dashboard" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="py-6 mt-8 border-t border-dark-800/50 bg-dark-950/80">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-dark-400">
            QueueLess by <span className="font-semibold text-dark-200">Thulasi Shylasri</span> &copy; {new Date().getFullYear()} - Professional Online Queue & Appointment Manager
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
