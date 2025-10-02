import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

export const authAPI = {
  login: (email, password) => {
    return api.post('/auth/login', { email, password });
  },
  register: (userData) => {
    return api.post('/auth/register', userData);
  },
  getProfile: (token) => {
    return api.get('/users/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

export default api;