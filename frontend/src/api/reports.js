import api from './auth';

export const reportsAPI = {
  getSummaryReport: (params = {}) => {
    return api.get('/reports/summary', { params });
  },
  
  exportTransactions: (params = {}) => {
    return api.get('/reports/export', { params });
  },
};