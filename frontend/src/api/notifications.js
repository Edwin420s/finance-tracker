import api from './auth';

export const notificationsAPI = {
  getNotifications: (params = {}) => {
    return api.get('/notifications', { params });
  },
  
  markAsRead: (id) => {
    return api.put(`/notifications/${id}/read`);
  },
  
  markAllAsRead: () => {
    return api.put('/notifications/read-all');
  },
  
  deleteNotification: (id) => {
    return api.delete(`/notifications/${id}`);
  },
  
  getPreferences: () => {
    return api.get('/notifications/preferences');
  },
  
  updatePreferences: (preferences) => {
    return api.put('/notifications/preferences', preferences);
  },
};