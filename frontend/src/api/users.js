import api from './auth';

export const usersAPI = {
  getProfile: () => {
    return api.get('/users/profile');
  },
};