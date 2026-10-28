import axios from 'axios';

// Create API client
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ecothread_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Interceptor to handle expired or unauthorized sessions
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      const url = error.config?.url || '';
      // Do not clear on normal login/register credential check failures
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        const hadToken = localStorage.getItem('ecothread_token');
        if (hadToken) {
          localStorage.removeItem('ecothread_token');
          sessionStorage.removeItem('ecothread_token');
          window.dispatchEvent(new CustomEvent('ecothread_auth_expired', {
            detail: { status: error.response.status }
          }));
        }
      }
    }
    return Promise.reject(error);
  }
);

// Centralized API calls
export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  googleLogin: (data) => api.post('/auth/google', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const pickupApi = {
  schedulePickup: (data) => api.post('/pickups', data),
  getPickups: () => api.get('/pickups'),
  getPickupById: (id) => api.get(`/pickups/${id}`),
  updateStatus: (id, data) => api.patch(`/pickups/${id}/status`, data),
  cancelPickup: (id, reason) => api.patch(`/pickups/${id}/cancel`, { reason }),
  reschedulePickup: (id, data) => api.patch(`/pickups/${id}/reschedule`, data),
  
  // New NGO donation workflow
  getAvailableDonations: () => api.get('/pickups/available'),
  getAcceptedDonations: () => api.get('/pickups/accepted'),
  acceptDonation: (id, notes) => api.post(`/pickups/${id}/accept`, { notes }),
  declineDonation: (id, reason) => api.post(`/pickups/${id}/decline`, { reason }),
  
  // Real stats
  getDonorStats: () => api.get('/pickups/stats/donor'),
  getNgoStats: () => api.get('/pickups/stats/ngo'),
};

export const catalogApi = {
  getCatalog: (params) => api.get('/catalog', { params }),
  getItemDetails: (id) => api.get(`/catalog/${id}`),
  submitDonorItem: (data) => api.post('/catalog/submit-donor-item', data),
};

export const adminApi = {
  getAllInventory: () => api.get('/admin/inventory'),
  gradeItem: (data) => api.post('/admin/inventory/grade', data),
  getInventoryStats: () => api.get('/admin/inventory/stats'),
  getBeneficiaries: () => api.get('/admin/beneficiaries'),
  adjustCredits: (beneficiaryId, data) => api.post(`/admin/beneficiaries/${beneficiaryId}/credits`, data),
  getSustainabilityReport: () => api.get('/admin/reports/sustainability'),
  downloadSustainabilityCsv: async () => {
    const response = await api.get('/admin/reports/sustainability/csv', {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'EcoThread_ESG_Sustainability_Report.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export const orderApi = {
  checkout: (data) => api.post('/orders/checkout', data),
  getOrders: () => api.get('/orders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status?status=${status}`),
};

export const invoiceApi = {
  getMyInvoices: () => api.get('/invoices/my'),
  getInvoiceByPickup: (pickupId) => api.get(`/invoices/pickup/${pickupId}`),
  verifyCertificate: (invoiceNumber) => api.get(`/invoices/verify/${encodeURIComponent(invoiceNumber)}`),
  getPdfDownloadUrl: (id) => `/api/invoices/download/${id}`,
  downloadPdf: async (id, filename = '80G_Receipt.pdf') => {
    const response = await api.get(`/api/invoices/download/${id}`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export const impactApi = {
  getStats: () => api.get('/impact/stats'),
  getDonorImpact: () => api.get('/impact/donor'),
};

export const ngoApi = {
  getNearbyNgos: (lat = 28.5458, lng = 77.1926, neededType = '') =>
    api.get('/ngos', { params: { lat, lng, neededType } }),
  getNgoById: (id, lat = 28.5458, lng = 77.1926) =>
    api.get(`/ngos/${id}`, { params: { lat, lng } }),
};

export const aiApi = {
  assessGarment: (data) => api.post('/ai/assess-garment', data),
};

export const passportApi = {
  getAllPassports: () => api.get('/passports'),
  getPassportById: (id) => api.get(`/passports/${id}`),
  createPassport: (data) => api.post('/passports', data),
  updateStage: (id, data) => api.patch(`/passports/${id}/stage`, data),
};

export const campusApi = {
  getStats: () => api.get('/campus/stats'),
};

export const trackingApi = {
  getLiveTelemetry: (params = {}) => api.get('/tracking/live-telemetry', { params }),
};

export default api;
