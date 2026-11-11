import api from './axios';

export const authApi = {
  register: async ({ name, email, password }) => {
    const response = await api.post('/api/auth/register', { name, email, password });
    return response.data;
  },

  login: async ({ email, password }) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },
};

export default authApi;
