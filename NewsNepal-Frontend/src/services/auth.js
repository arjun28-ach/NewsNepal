import api from '../api';

export const authService = {
  async login(credentials) {
    try {
      const { data } = await api.post('/accounts/login/', credentials);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  async signup(userData) {
    try {
      const { data } = await api.post('/accounts/signup/', userData);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Signup failed');
    }
  },

  async logout() {
    try {
      const { data } = await api.post('/accounts/logout/');
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Logout failed');
    }
  },

  async checkAuth() {
    try {
      const { data } = await api.get('/accounts/status/');
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Auth check failed');
    }
  },

  async forgotPassword(email) {
    try {
      const { data } = await api.post('/accounts/forgot-password/', { email });
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send reset email');
    }
  },

  async resetPassword(token, password) {
    try {
      const { data } = await api.post('/accounts/reset-password/', { token, password });
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to reset password');
    }
  },

  async changePassword(currentPassword, newPassword) {
    try {
      const { data } = await api.post('/accounts/change-password/', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to change password');
    }
  },

  async deleteAccount() {
    try {
      const { data } = await api.post('/accounts/delete/');
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete account');
    }
  }
}; 