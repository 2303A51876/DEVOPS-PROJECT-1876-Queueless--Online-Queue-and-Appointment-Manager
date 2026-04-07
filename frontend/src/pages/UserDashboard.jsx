import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { servicesAPI, queueAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  HiTicket,
  HiClock,
  HiStatusOnline,
  HiCheckCircle,
  HiRefresh,
  HiExclamation,
} from 'react-icons/hi';

/**
 * User Dashboard - View services, join queues, track position in real-time
 */
const UserDashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [services, setServices] = useState([]);
  const [queueStatus, setQueueStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);
  const [activeTab, setActiveTab] = useState('services');

  // Fetch services and queue status
  const fetchData = useCallback(async () => {
    try {
      const [servicesRes, statusRes] = await Promise.all([
        servicesAPI.getAll(),
        queueAPI.getStatus(),
      ]);
      setServices(servicesRes.data.data);
      setQueueStatus(statusRes.data.data);
    } catch (error) {
      toast.error('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Socket.io real-time listeners
  useEffect(() => {
    if (!socket) return;

    const handleQueueUpdated = (data) => {
      console.log('Queue updated:', data);
      fetchData(); // Refresh data on any queue update
    };

    const handleNextTokenCalled = (data) => {
      console.log('Next token called:', data);
      // Check if this notification is for the current user
      if (data.userId === user?._id) {
        toast.success(`🎉 Your token #${data.tokenNumber} has been called for ${data.serviceName}!`, {
          duration: 8000,
          style: {
            background: '#065f46',
            color: '#d1fae5',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          },
        });
      }
      fetchData();
    };

    socket.on('queueUpdated', handleQueueUpdated);
    socket.on('nextTokenCalled', handleNextTokenCalled);

    return () => {
      socket.off('queueUpdated', handleQueueUpdated);
      socket.off('nextTokenCalled', handleNextTokenCalled);
    };
  }, [socket, fetchData, user]);

  // Join a queue
  const handleJoinQueue = async (serviceId) => {
    setJoining(serviceId);
    try {
      const res = await queueAPI.join({ serviceId });
      toast.success(res.data.message);
      fetchData();
      setActiveTab('status');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join queue.');
    } finally {
      setJoining(null);
    }
  };

  // Check if user is already in a queue for a service
  const isInQueue = (serviceId) => {
    return queueStatus.some((entry) => entry.serviceId?._id === serviceId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold text-white">
          Welcome back, <span className="gradient-text">{user?.name}</span>
        </h1>
        <p className="text-dark-400 mt-2">Manage your queues and track your position in real-time.</p>
      </div>

      {/* Active Queue Alert */}
      {queueStatus.length > 0 && (
        <div className="mb-6 glass-card p-4 border-l-4 border-primary-500 animate-fade-in">
          <div className="flex items-center gap-3">
            <HiStatusOnline className="w-5 h-5 text-primary-400 animate-pulse" />
            <p className="text-dark-200 text-sm">
              You have <span className="text-primary-400 font-semibold">{queueStatus.length}</span> active
              queue{queueStatus.length > 1 ? 's' : ''}. Updates are live!
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-dark-800/30 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('services')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === 'services'
              ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
              : 'text-dark-400 hover:text-white'
            }`}
          id="tab-services"
        >
          Available Services
        </button>
        <button
          onClick={() => setActiveTab('status')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${activeTab === 'status'
              ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
              : 'text-dark-400 hover:text-white'
            }`}
          id="tab-status"
        >
          My Queue Status
          {queueStatus.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">
              {queueStatus.length}
            </span>
          )}
        </button>
      </div>

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="animate-fade-in">
          {services.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <HiExclamation className="w-12 h-12 text-dark-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-dark-300">No services available</h3>
              <p className="text-dark-500 text-sm mt-2">
                Check back later for available services.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((service) => (
                <div key={service._id} className="glass-card-hover p-6 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/10 to-purple-500/10 border border-primary-500/20 flex items-center justify-center">
                      <HiTicket className="w-5 h-5 text-primary-400" />
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-dark-700/50 border border-dark-600/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-xs text-dark-300">
                        {service.activeQueueCount}/{service.maxQueueLimit}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2">{service.serviceName}</h3>
                  <p className="text-dark-400 text-sm mb-6 flex-1">{service.description}</p>

                  {isInQueue(service._id) ? (
                    <button
                      disabled
                      className="w-full px-4 py-3 rounded-xl text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-not-allowed"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <HiCheckCircle className="w-4 h-4" />
                        Already in Queue
                      </div>
                    </button>
                  ) : service.activeQueueCount >= service.maxQueueLimit ? (
                    <button
                      disabled
                      className="w-full px-4 py-3 rounded-xl text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20 cursor-not-allowed"
                    >
                      Queue Full
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoinQueue(service._id)}
                      disabled={joining === service._id}
                      className="btn-primary w-full text-sm !py-3"
                      id={`join-queue-${service._id}`}
                    >
                      {joining === service._id ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          Joining...
                        </div>
                      ) : (
                        'Join Queue'
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Queue Status Tab */}
      {activeTab === 'status' && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-dark-200">Live Queue Status</h2>
            <button
              onClick={fetchData}
              className="btn-secondary !py-2 !px-4 text-sm flex items-center gap-2"
              id="refresh-status"
            >
              <HiRefresh className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {queueStatus.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <HiClock className="w-12 h-12 text-dark-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-dark-300">No active queues</h3>
              <p className="text-dark-500 text-sm mt-2">
                Join a service queue to see your status here.
              </p>
              <button
                onClick={() => setActiveTab('services')}
                className="btn-primary mt-6 text-sm"
              >
                Browse Services
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {queueStatus.map((entry) => (
                <div
                  key={entry._id}
                  className={`glass-card p-6 border-l-4 transition-all duration-500 ${entry.status === 'called'
                      ? 'border-emerald-500 glow-green'
                      : 'border-primary-500'
                    }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-white">
                          {entry.serviceId?.serviceName}
                        </h3>
                        <span
                          className={
                            entry.status === 'called' ? 'badge-called' : 'badge-waiting'
                          }
                        >
                          {entry.status === 'called' ? '🔔 Called!' : '⏳ Waiting'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-dark-500 mb-1">Your Token</p>
                          <p className="text-2xl font-bold gradient-text">#{entry.tokenNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-dark-500 mb-1">Position</p>
                          <p className="text-2xl font-bold text-white">
                            {entry.status === 'called' ? (
                              <span className="text-emerald-400">Now!</span>
                            ) : (
                              `#${entry.position}`
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-dark-500 mb-1">Currently Serving</p>
                          <p className="text-2xl font-bold text-dark-300">
                            {entry.currentServingToken
                              ? `#${entry.currentServingToken}`
                              : '—'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {entry.status === 'called' && (
                      <div className="sm:text-right">
                        <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 animate-pulse">
                          <HiStatusOnline className="w-5 h-5 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">It's Your Turn!</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Position progress bar */}
                  {entry.status === 'waiting' && entry.position > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-dark-500 mb-1.5">
                        <span>{entry.position} ahead of you</span>
                        <span>Almost there!</span>
                      </div>
                      <div className="w-full h-1.5 bg-dark-700/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full transition-all duration-1000"
                          style={{
                            width: `${Math.max(10, 100 - entry.position * 10)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
