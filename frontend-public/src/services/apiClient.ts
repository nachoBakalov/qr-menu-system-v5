import axios from 'axios';

// Base URL от environment или fallback към localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Public API client (no authentication needed)
export const publicApiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/public`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor за logging
publicApiClient.interceptors.request.use(
  (config) => {
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor за error handling
publicApiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      message: error.message,
    });
    
    // Handle common errors
    if (error.response?.status === 404) {
      throw new Error('Менюто не е намерено');
    } else if (error.response?.status >= 500) {
      throw new Error('Сървърна грешка. Моля, опитайте отново по-късно.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Заявката изтече. Моля, проверете интернет връзката си.');
    }
    
    return Promise.reject(error);
  }
);

export default publicApiClient;