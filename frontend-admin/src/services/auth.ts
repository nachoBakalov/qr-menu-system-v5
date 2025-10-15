import { apiClient } from './api';
import type { LoginRequest, AuthResponse } from '../types/api';

export const authService = {
  // Login user
  login: async (credentials: LoginRequest) => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    if (response.data.success && response.data.data) {
      // Store token and user info in localStorage
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get auth token
  getToken: () => {
    return localStorage.getItem('token');
  },
};