import api from './auth';

export const goalsAPI = {
  getGoals: () => {
    return api.get('/goals');
  },
  
  getGoal: (id) => {
    return api.get(`/goals/${id}`);
  },
  
  createGoal: (goalData) => {
    return api.post('/goals', goalData);
  },
  
  updateGoal: (id, goalData) => {
    return api.put(`/goals/${id}`, goalData);
  },
  
  deleteGoal: (id) => {
    return api.delete(`/goals/${id}`);
  },
  
  updateGoalProgress: (id, amount) => {
    return api.put(`/goals/${id}/progress`, { amount });
  },
};