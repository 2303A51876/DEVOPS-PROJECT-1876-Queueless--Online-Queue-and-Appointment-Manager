import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { servicesAPI, queueAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  HiUsers,
  HiClock,
  HiCheckCircle,
  HiViewGrid,
  HiPlus,
  HiPencil,
  HiTrash,
  HiChevronRight,
  HiPhone,
  HiCheck,
  HiRefresh,
  HiX,
} from 'react-icons/hi';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

/**
 * Admin Dashboard - Manage services, queues, and view analytics
 */
const AdminDashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceQueue, setServiceQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Service form state
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    serviceName: '',
    description: '',
    maxQueueLimit: 50,
  });

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      const [statsRes, servicesRes] = await Promise.all([
        queueAPI.getAdminStats(),
        servicesAPI.getAll(),
      ]);
      setStats(statsRes.data.data);
      setServices(servicesRes.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch queue for selected service
  const fetchServiceQueue = useCallback(async (serviceId) => {
    try {
      const res = await queueAPI.getServiceQueue(serviceId);
      setServiceQueue(res.data.data);
    } catch (error) {
      toast.error('Failed to load queue data.');
    }
  }, []);

  useEffect(() => {
    if (selectedService) {
      fetchServiceQueue(selectedService._id);
    }
  }, [selectedService, fetchServiceQueue]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      fetchData();
      if (selectedService) {
        fetchServiceQueue(selectedService._id);
      }
    };

    socket.on('queueUpdated', handleUpdate);
    socket.on('nextTokenCalled', handleUpdate);

    return () => {
      socket.off('queueUpdated', handleUpdate);
      socket.off('nextTokenCalled', handleUpdate);
    };
  }, [socket, fetchData, fetchServiceQueue, selectedService]);

  // ========== Service CRUD ==========
  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    setActionLoading('service-form');

    try {
      if (editingService) {
        await servicesAPI.update(editingService._id, serviceForm);
        toast.success('Service updated!');
      } else {
        await servicesAPI.create(serviceForm);
        toast.success('Service created!');
      }
      resetServiceForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setServiceForm({
      serviceName: service.serviceName,
      description: service.description,
      maxQueueLimit: service.maxQueueLimit,
    });
    setShowServiceForm(true);
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Delete this service and all its queue entries?')) return;
    try {
      await servicesAPI.delete(id);
      toast.success('Service deleted.');
      fetchData();
      if (selectedService?._id === id) {
        setSelectedService(null);
        setServiceQueue(null);
      }
    } catch (error) {
      toast.error('Failed to delete service.');
    }
  };

  const resetServiceForm = () => {
    setShowServiceForm(false);
    setEditingService(null);
    setServiceForm({ serviceName: '', description: '', maxQueueLimit: 50 });
  };

  // ========== Queue Actions ==========
  const handleCallNext = async (serviceId) => {
    setActionLoading(`next-${serviceId}`);
    try {
      const res = await queueAPI.callNext({ serviceId });
      toast.success(res.data.message);
      fetchData();
      if (selectedService?._id === serviceId) {
        fetchServiceQueue(serviceId);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to call next.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (serviceId) => {
    setActionLoading(`complete-${serviceId}`);
    try {
      const res = await queueAPI.complete({ serviceId });
      toast.success(res.data.message);
      fetchData();
      if (selectedService?._id === serviceId) {
        fetchServiceQueue(serviceId);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete.');
    } finally {
      setActionLoading(null);
    }
  };

  // ========== Chart Data ==========
  const barChartData = stats?.serviceStats
    ? {
      labels: stats.serviceStats.map((s) => s.serviceName),
      datasets: [
        {
          label: 'Waiting',
          data: stats.serviceStats.map((s) => s.waiting),
          backgroundColor: 'rgba(245, 158, 11, 0.6)',
          borderColor: 'rgba(245, 158, 11, 1)',
          borderWidth: 1,
          borderRadius: 6,
        },
        {
          label: 'Called',
          data: stats.serviceStats.map((s) => s.called),
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
          borderRadius: 6,
        },
        {
          label: 'Completed',
          data: stats.serviceStats.map((s) => s.completed),
          backgroundColor: 'rgba(34, 197, 94, 0.6)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    }
    : null;

  const doughnutData = stats
    ? {
      labels: ['Active Queues', 'Completed'],
      datasets: [
        {
          data: [stats.activeQueues, stats.completedAppointments],
          backgroundColor: ['rgba(59, 130, 246, 0.7)', 'rgba(34, 197, 94, 0.7)'],
          borderColor: ['rgba(59, 130, 246, 1)', 'rgba(34, 197, 94, 1)'],
          borderWidth: 2,
        },
      ],
    }
    : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { family: 'Inter' } },
      },
    },
    scales: {
      x: {
        ticks: { color: '#64748b' },
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
      },
      y: {
        ticks: { color: '#64748b' },
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading admin dashboard..." />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'services', label: 'Services' },
    { id: 'queues', label: 'Queues' },
    { id: 'analytics', label: 'Analytics' },
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Admin <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-dark-400 mt-1">Welcome, {user?.name}. Manage your queue system.</p>
        </div>
        <button
          onClick={fetchData}
          className="btn-secondary !py-2 !px-4 text-sm flex items-center gap-2 w-fit"
          id="admin-refresh"
        >
          <HiRefresh className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-dark-800/30 p-1 rounded-xl overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
              ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
              : 'text-dark-400 hover:text-white'
              }`}
            id={`admin-tab-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========== OVERVIEW TAB ========== */}
      {activeTab === 'overview' && stats && (
        <div className="animate-fade-in space-y-8">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Total Users',
                value: stats.totalUsers,
                icon: <HiUsers className="w-6 h-6" />,
                color: 'from-primary-500 to-blue-600',
                bg: 'bg-primary-500/10',
              },
              {
                label: 'Active Queues',
                value: stats.activeQueues,
                icon: <HiClock className="w-6 h-6" />,
                color: 'from-amber-500 to-orange-600',
                bg: 'bg-amber-500/10',
              },
              {
                label: 'Completed',
                value: stats.completedAppointments,
                icon: <HiCheckCircle className="w-6 h-6" />,
                color: 'from-emerald-500 to-green-600',
                bg: 'bg-emerald-500/10',
              },
              {
                label: 'Services',
                value: stats.totalServices,
                icon: <HiViewGrid className="w-6 h-6" />,
                color: 'from-purple-500 to-violet-600',
                bg: 'bg-purple-500/10',
              },
            ].map((stat, i) => (
              <div key={i} className="stat-card">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}
                  >
                    <div className={`bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
                <p className="text-3xl font-bold text-white mt-3">{stat.value}</p>
                <p className="text-sm text-dark-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions per Service */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.serviceStats.map((service) => (
                <div key={service.serviceId} className="glass-card p-5">
                  <h3 className="text-base font-semibold text-white mb-3">{service.serviceName}</h3>
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <span className="badge-waiting">{service.waiting} waiting</span>
                    <span className="badge-called">{service.called} called</span>
                    <span className="badge-completed">{service.completed} done</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCallNext(service.serviceId)}
                      disabled={actionLoading === `next-${service.serviceId}` || service.waiting === 0}
                      className="btn-primary !py-2 !px-4 text-xs flex items-center gap-1.5 flex-1"
                      id={`call-next-${service.serviceId}`}
                    >
                      <HiPhone className="w-3.5 h-3.5" />
                      Call Next
                    </button>
                    <button
                      onClick={() => handleComplete(service.serviceId)}
                      disabled={actionLoading === `complete-${service.serviceId}` || service.called === 0}
                      className="btn-success !py-2 !px-4 text-xs flex items-center gap-1.5 flex-1"
                      id={`complete-${service.serviceId}`}
                    >
                      <HiCheck className="w-3.5 h-3.5" />
                      Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========== SERVICES TAB ========== */}
      {activeTab === 'services' && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Manage Services</h2>
            <button
              onClick={() => {
                resetServiceForm();
                setShowServiceForm(true);
              }}
              className="btn-primary !py-2 !px-4 text-sm flex items-center gap-2"
              id="add-service-btn"
            >
              <HiPlus className="w-4 h-4" />
              Add Service
            </button>
          </div>

          {/* Service Form Modal */}
          {showServiceForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm">
              <div className="glass-card p-8 w-full max-w-md animate-scale-in glow-blue">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">
                    {editingService ? 'Edit Service' : 'Add New Service'}
                  </h3>
                  <button
                    onClick={resetServiceForm}
                    className="p-1 text-dark-400 hover:text-white transition-colors"
                  >
                    <HiX className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleServiceSubmit} className="space-y-4" id="service-form">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Service Name
                    </label>
                    <input
                      type="text"
                      value={serviceForm.serviceName}
                      onChange={(e) =>
                        setServiceForm({ ...serviceForm, serviceName: e.target.value })
                      }
                      placeholder="e.g., Bank Counter"
                      required
                      className="input-field"
                      id="service-name-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={serviceForm.description}
                      onChange={(e) =>
                        setServiceForm({ ...serviceForm, description: e.target.value })
                      }
                      placeholder="Describe this service..."
                      required
                      rows={3}
                      className="input-field resize-none"
                      id="service-desc-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Max Queue Limit
                    </label>
                    <input
                      type="number"
                      value={serviceForm.maxQueueLimit}
                      onChange={(e) =>
                        setServiceForm({
                          ...serviceForm,
                          maxQueueLimit: parseInt(e.target.value) || 1,
                        })
                      }
                      min={1}
                      max={1000}
                      required
                      className="input-field"
                      id="service-limit-input"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={resetServiceForm}
                      className="btn-secondary flex-1 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading === 'service-form'}
                      className="btn-primary flex-1 text-sm"
                      id="service-submit-btn"
                    >
                      {actionLoading === 'service-form' ? 'Saving...' : editingService ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Services List */}
          {services.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <HiViewGrid className="w-12 h-12 text-dark-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-dark-300">No services yet</h3>
              <p className="text-dark-500 text-sm mt-2">Create your first service to get started.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {services.map((service) => (
                <div key={service._id} className="glass-card-hover p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-base font-semibold text-white">{service.serviceName}</h3>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditService(service)}
                        className="p-2 text-dark-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-all"
                        id={`edit-service-${service._id}`}
                      >
                        <HiPencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteService(service._id)}
                        className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        id={`delete-service-${service._id}`}
                      >
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-dark-400 text-sm mb-4">{service.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-dark-500">
                      Limit: {service.maxQueueLimit} | Active: {service.activeQueueCount}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedService(service);
                        setActiveTab('queues');
                      }}
                      className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors"
                    >
                      View Queue <HiChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========== QUEUES TAB ========== */}
      {activeTab === 'queues' && (
        <div className="animate-fade-in">
          {/* Service Selector */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Queue Management</h2>
            <div className="flex flex-wrap gap-2">
              {services.map((service) => (
                <button
                  key={service._id}
                  onClick={() => {
                    setSelectedService(service);
                    fetchServiceQueue(service._id);
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${selectedService?._id === service._id
                    ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
                    : 'bg-dark-800/30 text-dark-400 border border-dark-700/30 hover:text-white hover:border-dark-600'
                    }`}
                  id={`select-service-${service._id}`}
                >
                  {service.serviceName}
                </button>
              ))}
            </div>
          </div>

          {selectedService && serviceQueue ? (
            <div>
              {/* Queue Actions */}
              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  onClick={() => handleCallNext(selectedService._id)}
                  disabled={actionLoading === `next-${selectedService._id}` || serviceQueue.stats.waitingCount === 0}
                  className="btn-primary !py-2.5 !px-5 text-sm flex items-center gap-2"
                  id="queue-call-next"
                >
                  <HiPhone className="w-4 h-4" />
                  {actionLoading === `next-${selectedService._id}` ? 'Calling...' : 'Call Next Token'}
                </button>
                <button
                  onClick={() => handleComplete(selectedService._id)}
                  disabled={actionLoading === `complete-${selectedService._id}` || serviceQueue.stats.calledCount === 0}
                  className="btn-success !py-2.5 !px-5 text-sm flex items-center gap-2"
                  id="queue-complete"
                >
                  <HiCheckCircle className="w-4 h-4" />
                  {actionLoading === `complete-${selectedService._id}` ? 'Completing...' : 'Mark Complete'}
                </button>
              </div>

              {/* Queue Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'Total', value: serviceQueue.stats.total, color: 'text-dark-200' },
                  { label: 'Waiting', value: serviceQueue.stats.waitingCount, color: 'text-amber-400' },
                  { label: 'Called', value: serviceQueue.stats.calledCount, color: 'text-primary-400' },
                  { label: 'Completed', value: serviceQueue.stats.completedCount, color: 'text-emerald-400' },
                ].map((s, i) => (
                  <div key={i} className="glass-card p-4 text-center">
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-dark-500">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Queue Table */}
              <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full" id="queue-table">
                    <thead>
                      <tr className="border-b border-dark-700/50">
                        <th className="text-left py-3 px-5 text-xs font-semibold text-dark-400 uppercase tracking-wider">Token</th>
                        <th className="text-left py-3 px-5 text-xs font-semibold text-dark-400 uppercase tracking-wider">Name</th>
                        <th className="text-left py-3 px-5 text-xs font-semibold text-dark-400 uppercase tracking-wider">Email</th>
                        <th className="text-left py-3 px-5 text-xs font-semibold text-dark-400 uppercase tracking-wider">Status</th>
                        <th className="text-left py-3 px-5 text-xs font-semibold text-dark-400 uppercase tracking-wider">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serviceQueue.all.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-dark-500 text-sm">
                            No queue entries yet.
                          </td>
                        </tr>
                      ) : (
                        serviceQueue.all.map((entry) => (
                          <tr
                            key={entry._id}
                            className={`border-b border-dark-800/30 transition-colors ${entry.status === 'called' ? 'bg-primary-500/5' : ''
                              }`}
                          >
                            <td className="py-3 px-5">
                              <span className="text-lg font-bold gradient-text">#{entry.tokenNumber}</span>
                            </td>
                            <td className="py-3 px-5 text-sm text-dark-200">{entry.userId?.name}</td>
                            <td className="py-3 px-5 text-sm text-dark-400">{entry.userId?.email}</td>
                            <td className="py-3 px-5">
                              <span
                                className={
                                  entry.status === 'waiting'
                                    ? 'badge-waiting'
                                    : entry.status === 'called'
                                      ? 'badge-called'
                                      : 'badge-completed'
                                }
                              >
                                {entry.status}
                              </span>
                            </td>
                            <td className="py-3 px-5 text-sm text-dark-500">
                              {new Date(entry.createdAt).toLocaleTimeString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 text-center">
              <HiClock className="w-12 h-12 text-dark-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-dark-300">Select a service</h3>
              <p className="text-dark-500 text-sm mt-2">Choose a service above to manage its queue.</p>
            </div>
          )}
        </div>
      )}

      {/* ========== ANALYTICS TAB ========== */}
      {activeTab === 'analytics' && stats && (
        <div className="animate-fade-in space-y-6">
          <h2 className="text-lg font-semibold text-white">Analytics Overview</h2>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            {barChartData && (
              <div className="glass-card p-6">
                <h3 className="text-base font-semibold text-dark-200 mb-4">Queue Status by Service</h3>
                <div className="h-72">
                  <Bar data={barChartData} options={chartOptions} />
                </div>
              </div>
            )}

            {/* Doughnut Chart */}
            {doughnutData && (doughnutData.datasets[0].data[0] > 0 || doughnutData.datasets[0].data[1] > 0) && (
              <div className="glass-card p-6">
                <h3 className="text-base font-semibold text-dark-200 mb-4">Active vs Completed</h3>
                <div className="h-72 flex items-center justify-center">
                  <Doughnut
                    data={doughnutData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          labels: { color: '#94a3b8', font: { family: 'Inter' } },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Service Breakdown Table */}
          <div className="glass-card overflow-hidden">
            <div className="p-5 border-b border-dark-700/50">
              <h3 className="text-base font-semibold text-dark-200">Service Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full" id="analytics-table">
                <thead>
                  <tr className="border-b border-dark-700/50">
                    <th className="text-left py-3 px-5 text-xs font-semibold text-dark-400 uppercase tracking-wider">Service</th>
                    <th className="text-center py-3 px-5 text-xs font-semibold text-dark-400 uppercase tracking-wider">Waiting</th>
                    <th className="text-center py-3 px-5 text-xs font-semibold text-dark-400 uppercase tracking-wider">Called</th>
                    <th className="text-center py-3 px-5 text-xs font-semibold text-dark-400 uppercase tracking-wider">Completed</th>
                    <th className="text-center py-3 px-5 text-xs font-semibold text-dark-400 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.serviceStats.map((service) => (
                    <tr key={service.serviceId} className="border-b border-dark-800/30">
                      <td className="py-3 px-5 text-sm font-medium text-dark-200">{service.serviceName}</td>
                      <td className="py-3 px-5 text-sm text-center text-amber-400">{service.waiting}</td>
                      <td className="py-3 px-5 text-sm text-center text-primary-400">{service.called}</td>
                      <td className="py-3 px-5 text-sm text-center text-emerald-400">{service.completed}</td>
                      <td className="py-3 px-5 text-sm text-center text-dark-200 font-semibold">{service.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
