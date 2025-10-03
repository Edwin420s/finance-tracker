import api from './auth';

export const usersAPI = {
  getProfile: () => {
    return api.get('/users/profile');
  },
  
  updateProfile: (profileData) => {
    return api.put('/users/profile', profileData);
  },
  
  updatePreferences: (preferences) => {
    return api.put('/users/preferences', { preferences });
  },
  
  getDashboardStats: () => {
    return api.get('/users/dashboard');
  },
  
  deleteAccount: () => {
    return api.delete('/users/account');
  },
};