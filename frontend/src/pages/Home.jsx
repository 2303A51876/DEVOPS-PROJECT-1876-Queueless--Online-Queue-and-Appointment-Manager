import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiClock,
  HiStatusOnline,
  HiShieldCheck,
  HiChartBar,
  HiLightningBolt,
  HiUserGroup,
  HiArrowRight,
} from 'react-icons/hi';

/**
 * Home Page - Landing page with hero, features, and CTA
 */
const Home = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  const features = [
    {
      icon: <HiClock className="w-7 h-7" />,
      title: 'Join Queues Online',
      description: 'Skip physical lines. Join any queue from anywhere with just a few taps.',
      color: 'from-primary-500 to-blue-600',
      glow: 'group-hover:shadow-primary-500/20',
    },
    {
      icon: <HiStatusOnline className="w-7 h-7" />,
      title: 'Real-Time Tracking',
      description: 'Watch your position update live. Know exactly when your turn is coming.',
      color: 'from-emerald-500 to-green-600',
      glow: 'group-hover:shadow-emerald-500/20',
    },
    {
      icon: <HiLightningBolt className="w-7 h-7" />,
      title: 'Instant Notifications',
      description: 'Get alerted the moment your turn is near. Never miss your slot.',
      color: 'from-amber-500 to-orange-600',
      glow: 'group-hover:shadow-amber-500/20',
    },
    {
      icon: <HiShieldCheck className="w-7 h-7" />,
      title: 'Secure & Reliable',
      description: 'JWT authentication, encrypted data, and role-based access control.',
      color: 'from-purple-500 to-violet-600',
      glow: 'group-hover:shadow-purple-500/20',
    },
    {
      icon: <HiChartBar className="w-7 h-7" />,
      title: 'Admin Analytics',
      description: 'Comprehensive dashboard with real-time stats and service management.',
      color: 'from-rose-500 to-pink-600',
      glow: 'group-hover:shadow-rose-500/20',
    },
    {
      icon: <HiUserGroup className="w-7 h-7" />,
      title: 'Multi-Service Support',
      description: 'Manage multiple services simultaneously. Each with its own queue.',
      color: 'from-cyan-500 to-teal-600',
      glow: 'group-hover:shadow-cyan-500/20',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Users Served' },
    { value: '99.9%', label: 'Uptime' },
    { value: '<1s', label: 'Update Speed' },
    { value: '50+', label: 'Services' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-8 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-medium text-primary-300">
                Real-time queue management system
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 animate-slide-up">
              <span className="text-white">Stop Waiting.</span>
              <br />
              <span className="gradient-text">Start Living.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-dark-300 max-w-2xl mx-auto mb-10 animate-slide-up leading-relaxed"
              style={{ animationDelay: '0.1s' }}>
              QueueLess eliminates the frustration of physical queues. Join online,
              track in real-time, and get notified when it's your turn.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up"
              style={{ animationDelay: '0.2s' }}>
              {isAuthenticated ? (
                <Link
                  to={isAdmin ? '/admin-dashboard' : '/user-dashboard'}
                  className="btn-primary text-base flex items-center gap-2 !px-8 !py-4"
                  id="hero-dashboard-btn"
                >
                  Go to Dashboard
                  <HiArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn-primary text-base flex items-center gap-2 !px-8 !py-4"
                    id="hero-register-btn"
                  >
                    Get Started Free
                    <HiArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="btn-secondary text-base !px-8 !py-4"
                    id="hero-login-btn"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto animate-fade-in"
            style={{ animationDelay: '0.4s' }}>
            {stats.map((stat, index) => (
              <div key={index} className="glass-card p-5 text-center">
                <p className="text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</p>
                <p className="text-sm text-dark-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative" id="features-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need to{' '}
              <span className="gradient-text">manage queues</span>
            </h2>
            <p className="text-dark-400 text-lg max-w-2xl mx-auto">
              A complete solution for both users and administrators, powered by
              real-time technology.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group glass-card-hover p-7 transition-all duration-500 ${feature.glow}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform duration-300`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How it <span className="gradient-text">works</span>
            </h2>
            <p className="text-dark-400 text-lg">Three simple steps to skip the queue</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                title: 'Choose a Service',
                desc: 'Browse available services and pick the one you need.',
              },
              {
                step: '02',
                title: 'Join the Queue',
                desc: 'Get your token number instantly. No physical presence needed.',
              },
              {
                step: '03',
                title: 'Track & Arrive',
                desc: 'Monitor real-time updates and arrive just when it\'s your turn.',
              },
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/10 to-purple-500/10 border border-primary-500/20 flex items-center justify-center mx-auto mb-5 group-hover:border-primary-500/40 transition-all duration-300">
                  <span className="text-xl font-bold gradient-text">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-dark-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-12 text-center relative overflow-hidden glow-blue">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-purple-500/5" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to go QueueLess?
              </h2>
              <p className="text-dark-300 text-lg mb-8 max-w-lg mx-auto">
                Join thousands of users who've already eliminated waiting time from their lives.
              </p>
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="btn-primary text-base inline-flex items-center gap-2 !px-8 !py-4"
                  id="cta-register-btn"
                >
                  Create Free Account
                  <HiArrowRight className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-800/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                Q
              </div>
              <span className="text-sm font-semibold text-dark-300">
                QueueLess
              </span>
            </div>
            <p className="text-sm text-dark-500">
              © {new Date().getFullYear()} QueueLess. Built with ❤️ for better queue management.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
