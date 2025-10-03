import api from './auth';

export const exportAPI = {
  exportData: (exportData) => {
    return api.post('/export/transactions', exportData, {
      responseType: 'blob'
    });
  },
  
  exportReport: (reportData) => {
    return api.post('/export/report', reportData, {
      responseType: 'blob'
    });
  },
};