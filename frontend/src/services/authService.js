import api, { clearAuthTokens } from './api';

const authService = {
  async register(data) {
    const response = await api.post('/auth/register/', data);
    if (response.data.tokens?.access) {
      localStorage.setItem('access_token', response.data.tokens.access);
      localStorage.setItem('refresh_token', response.data.tokens.refresh);
    }
    return response.data;
  },

  async login(data) {
    const response = await api.post('/auth/login/', data);
    const { access, refresh } = response.data.tokens;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    return response.data;
  },

  async logout() {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/auth/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      // Logout endpoint might fail; we still clear tokens
      console.warn('Logout API call failed:', error.message);
    } finally {
      clearAuthTokens();
    }
  },

  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('No refresh token available');
    const response = await api.post('/auth/refresh/', { refresh: refreshToken });
    const { access } = response.data;
    localStorage.setItem('access_token', access);
    return response.data;
  },

  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password/', { email });
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/accounts/profile/');
    return response.data;
  },

  async updateProfile(data) {
    const isFormData = data instanceof FormData;
    const response = await api.patch('/accounts/profile/', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  async deleteAccount() {
    const response = await api.delete('/accounts/profile/');
    clearAuthTokens();
    return response.data;
  },

  async changePassword(data) {
    const response = await api.post('/accounts/change-password/', data);
    return response.data;
  },

  async getMe() {
    const response = await api.get('/accounts/me/');
    return response.data;
  },
};

export default authService;
