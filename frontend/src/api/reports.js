import api from './auth';

export const reportsAPI = {
  getReports: (params = {}) => {
    return api.get('/reports', { params });
  },
  
  exportReports: (data) => {
    return api.post('/reports/export', data, {
      responseType: 'blob'
    });
  },
};