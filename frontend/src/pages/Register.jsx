import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiUser, HiMail, HiLockClosed, HiArrowRight, HiShieldCheck } from 'react-icons/hi';

/**
 * Register Page — Public user registration only.
 * Admin accounts cannot be created through the UI.
 * Role is always 'user' — enforced by backend as well.
 */
const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'user', // Always user — admin cannot register via UI
      });
      toast.success(`Welcome, ${user.name}! Account created.`);
      navigate('/user-dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary-500/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="w-full max-w-md relative animate-scale-in">
        <div className="glass-card p-8 sm:p-10 glow-purple">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-primary-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-5 shadow-lg shadow-purple-500/25">
              Q
            </div>
            <h1 className="text-2xl font-bold text-white" id="register-heading">Create Account</h1>
            <p className="text-dark-400 mt-2 text-sm">Join QueueLess and skip the lines</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" id="register-form">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Full Name</label>
              <div className="relative">
                <HiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                  minLength={2}
                  className="input-field !pl-12"
                  id="register-name"
                  autoComplete="name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Email Address</label>
              <div className="relative">
                <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="input-field !pl-12"
                  id="register-email"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                  className="input-field !pl-12"
                  id="register-password"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Confirm Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  required
                  minLength={6}
                  className="input-field !pl-12"
                  id="register-confirm-password"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 !py-3.5 text-base font-semibold !mt-6"
              id="register-submit"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  Create Account
                  <HiArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Security Note */}
          <div className="flex items-center justify-center gap-2 mt-5 text-dark-500 text-xs">
            <HiShieldCheck className="w-4 h-4" />
            <span>Your data is encrypted and secure</span>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-dark-700/50" />
            <span className="text-xs text-dark-500">Already a member?</span>
            <div className="flex-1 h-px bg-dark-700/50" />
          </div>

          <Link
            to="/login"
            className="block w-full text-center px-6 py-3 rounded-xl border border-dark-700/50 text-dark-300 hover:text-white hover:border-primary-500/30 hover:bg-primary-500/5 transition-all duration-300 text-sm font-medium"
            id="register-login-link"
          >
            Sign in to your account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
