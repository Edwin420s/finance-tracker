import api from './auth';

export const budgetsAPI = {
  getBudgets: () => {
    return api.get('/budgets');
  },
  
  getBudget: (id) => {
    return api.get(`/budgets/${id}`);
  },
  
  createBudget: (budgetData) => {
    return api.post('/budgets', budgetData);
  },
  
  updateBudget: (id, budgetData) => {
    return api.put(`/budgets/${id}`, budgetData);
  },
  
  deleteBudget: (id) => {
    return api.delete(`/budgets/${id}`);
  },
  
  getBudgetAlerts: () => {
    return api.get('/budgets/alerts');
  },
};