import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router'; // If you want to redirect user

const api = axios.create({
  baseURL: 'https://kmdiscova.id.vn/',
});

// Add request interceptor
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');

    if (!token) {
      console.warn('⚠️ No access token found');

      // ✅ OPTION 1: Redirect to login screen
      // Only if you are not already there, to avoid infinite loops
      if (!router?.canGoBack?.()) {
        router.replace('/login');
      }

      // ✅ OPTION 2: Prevent request from continuing (optional)
      // return Promise.reject(new Error('No access token'));

      // ✅ OPTION 3: Still send the request without token (fallback)
      return config;
    }

    // ✅ If token exists, attach it
    config.headers.Authorization = `Token ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
