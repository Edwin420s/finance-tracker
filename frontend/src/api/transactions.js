import api from './auth';

export const transactionsAPI = {
  getTransactions: (params = {}) => {
    return api.get('/transactions', { params });
  },
  
  getTransaction: (id) => {
    return api.get(`/transactions/${id}`);
  },
  
  createTransaction: (transactionData) => {
    return api.post('/transactions', transactionData);
  },
  
  updateTransaction: (id, transactionData) => {
    return api.put(`/transactions/${id}`, transactionData);
  },
  
  deleteTransaction: (id) => {
    return api.delete(`/transactions/${id}`);
  },
  
  getTransactionStats: (params = {}) => {
    return api.get('/transactions/stats/summary', { params });
  },
};