import api from './auth';

export const categoriesAPI = {
  getCategories: (params = {}) => {
    return api.get('/categories', { params });
  },
  
  createCategory: (categoryData) => {
    return api.post('/categories', categoryData);
  },
  
  updateCategory: (id, categoryData) => {
    return api.put(`/categories/${id}`, categoryData);
  },
  
  deleteCategory: (id) => {
    return api.delete(`/categories/${id}`);
  },
  
  getCategoryStats: (params = {}) => {
    return api.get('/categories/stats', { params });
  },
};