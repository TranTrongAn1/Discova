import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BASE_URL = 'https://kmdiscova.id.vn';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    let token = await AsyncStorage.getItem('access_token');
    
    // Clean up token if it exists
    if (token) {
      token = token.trim();
      // Remove any quotes if they exist
      if (token.startsWith('"') && token.endsWith('"')) {
        token = token.slice(1, -1);
      }
      if (token.startsWith("'") && token.endsWith("'")) {
        token = token.slice(1, -1);
      }
    }
    
    console.log('API Request - URL:', config.url);
    console.log('API Request - Token exists:', !!token);
    console.log('API Request - Token value:', token ? token.substring(0, 20) + '...' : 'null');
    console.log('API Request - Token length:', token ? token.length : 0);
    console.log('API Request - Full token:', token);
    
    if (token && token.length > 0) {
      config.headers.Authorization = `Token ${token}`;
      console.log('API Request - Authorization header set');
      console.log('API Request - Full Authorization header:', config.headers.Authorization);
      console.log('API Request - All headers:', config.headers);
    } else {
      console.log('API Request - No valid token found, request will be sent without auth');
    }
    return config;
  },
  (error) => {
    console.log('API Request - Interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors - don't auto-clear tokens
api.interceptors.response.use(
  (response) => {
    console.log('API Response - Success:', response.config.url, response.status);
    return response;
  },
  async (error) => {
    console.log('API Response - Error:', error.config?.url, error.response?.status, error.response?.data);
    // Don't automatically clear tokens on 401 - let components handle it
    if (error.response?.status === 401) {
      console.log('API: 401 error detected, but not clearing tokens automatically');
    }
    return Promise.reject(error);
  }
);

// Helper function to clear tokens when needed
export const clearTokens = async () => {
  await AsyncStorage.removeItem('access_token');
  await AsyncStorage.removeItem('user_type');
  await AsyncStorage.removeItem('user_id');
};

// User status checking
export const checkUserStatus = async () => {
  try {
    const response = await api.get('/api/auth/me/');
    return response.data;
  } catch (error) {
    console.error('Error checking user status:', error);
    throw error;
  }
};

// Check if psychologist profile exists and is complete
export const checkPsychologistProfile = async () => {
  try {
    const response = await api.get('/api/psychologists/profile/profile/');
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null; // Profile doesn't exist
    }
    throw error;
  }
};

// Check psychologist profile completeness
export const checkProfileCompleteness = async () => {
  try {
    const response = await api.get('/api/psychologists/profile/completeness/');
    return response.data;
  } catch (error) {
    console.error('Error checking profile completeness:', error);
    throw error;
  }
};

export default api;
