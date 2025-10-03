import api from './auth';

export const receiptAPI = {
  uploadReceipt: (formData) => {
    return api.post('/receipts/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  getReceipt: (receiptId) => {
    return api.get(`/receipts/${receiptId}`);
  },
  
  deleteReceipt: (receiptId) => {
    return api.delete(`/receipts/${receiptId}`);
  },
  
  attachToTransaction: (receiptId, transactionId) => {
    return api.put(`/receipts/${receiptId}/attach`, { transactionId });
  },
};