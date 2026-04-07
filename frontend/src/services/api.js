import axios from 'axios';

// Create axios instance with base configuration
const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on auth pages
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ========== Auth API ==========
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
};

// ========== Services API ==========
export const servicesAPI = {
  getAll: () => API.get('/services'),
  create: (data) => API.post('/services', data),
  update: (id, data) => API.put(`/services/${id}`, data),
  delete: (id) => API.delete(`/services/${id}`),
};

// ========== Queue API ==========
export const queueAPI = {
  join: (data) => API.post('/queue/join', data),
  getStatus: () => API.get('/queue/status'),
  getServiceQueue: (serviceId) => API.get(`/queue/${serviceId}`),
  callNext: (data) => API.put('/queue/next', data),
  complete: (data) => API.put('/queue/complete', data),
  getAdminStats: () => API.get('/queue/admin/stats'),
};

export default API;
