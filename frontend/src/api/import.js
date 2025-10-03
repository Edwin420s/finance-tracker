import api from './auth';

export const importAPI = {
  getCSVHeaders: (formData) => {
    return api.post('/import/headers', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  importTransactions: (formData) => {
    return api.post('/import/transactions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  getTemplates: () => {
    return api.get('/import/templates');
  },
  
  downloadTemplate: (type) => {
    return api.get(`/import/template/${type}`, {
      responseType: 'blob'
    });
  },
};