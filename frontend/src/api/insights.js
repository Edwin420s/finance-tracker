import api from './auth';

export const insightsAPI = {
  getInsights: () => {
    return api.get('/insights');
  },
  
  getForecast: () => {
    return api.get('/insights/forecast');
  },
};