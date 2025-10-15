import axios from 'axios';
import type { AxiosResponse, AxiosError } from 'axios';
import type { ApiResponse } from '../types/api';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response;
  },
  (error: AxiosError<ApiResponse>) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Generic API methods
export const apiClient = {
  get: <T>(url: string) => api.get<ApiResponse<T>>(url),
  post: <T>(url: string, data?: any) => api.post<ApiResponse<T>>(url, data),
  put: <T>(url: string, data?: any) => api.put<ApiResponse<T>>(url, data),
  delete: <T>(url: string) => api.delete<ApiResponse<T>>(url),
};

export default api;