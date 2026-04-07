import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useState } from 'react';
import { HiMenu, HiX, HiStatusOnline, HiStatusOffline } from 'react-icons/hi';

/**
 * Navbar - Main navigation with responsive mobile menu
 * Shows different links based on auth state and role
 */
const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isActive(path)
      ? 'bg-primary-500/10 text-primary-400'
      : 'text-dark-300 hover:text-white hover:bg-dark-700/50'
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" id="nav-logo">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm group-hover:shadow-lg group-hover:shadow-primary-500/25 transition-all duration-300">
              Q
            </div>
            <span className="text-lg font-bold text-white flex items-center gap-1">
              Queue<span className="gradient-text">Less</span>
              <span className="hidden sm:inline text-xs mt-1 text-dark-400 font-normal">by Thulasi Shylasri</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/" className={navLinkClass('/')} id="nav-home">
              Home
            </Link>

            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <Link to="/admin-dashboard" className={navLinkClass('/admin-dashboard')} id="nav-admin">
                    Admin Dashboard
                  </Link>
                ) : (
                  <Link to="/user-dashboard" className={navLinkClass('/user-dashboard')} id="nav-dashboard">
                    User Dashboard
                  </Link>
                )}

                {/* Connection Status */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dark-800/50 border border-dark-700/50">
                  {connected ? (
                    <>
                      <HiStatusOnline className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs text-emerald-400">Live</span>
                    </>
                  ) : (
                    <>
                      <HiStatusOffline className="w-3.5 h-3.5 text-dark-400" />
                      <span className="text-xs text-dark-400">Offline</span>
                    </>
                  )}
                </div>

                {/* User info & logout */}
                <div className="flex items-center gap-3 ml-2 pl-4 border-l border-dark-700/50">
                  <div className="text-right">
                    <p className="text-xs text-dark-400">
                      {isAdmin ? 'Admin' : 'User'}
                    </p>
                    <p className="text-sm font-medium text-dark-200">{user?.name}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-300"
                    id="nav-logout"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className={navLinkClass('/login')} id="nav-login">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm !py-2 !px-5"
                  id="nav-register"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-dark-300 hover:text-white"
            id="nav-mobile-toggle"
          >
            {mobileOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-dark-900/95 backdrop-blur-xl border-b border-dark-800/50 animate-slide-down">
          <div className="px-4 py-4 space-y-2">
            <Link
              to="/"
              className={`block ${navLinkClass('/')}`}
              onClick={() => setMobileOpen(false)}
            >
              Home
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to={isAdmin ? '/admin-dashboard' : '/user-dashboard'}
                  className={`block ${navLinkClass(isAdmin ? '/admin-dashboard' : '/user-dashboard')}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {isAdmin ? 'Admin Dashboard' : 'User Dashboard'}
                </Link>
                <div className="pt-2 border-t border-dark-700/50">
                  <p className="text-sm text-dark-400 px-4 py-1">
                    Signed in as <span className="text-dark-200 font-medium">{user?.name}</span>
                  </p>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`block ${navLinkClass('/login')}`}
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block btn-primary text-center text-sm !py-2"
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
