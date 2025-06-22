import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const api = axios.create({
  baseURL: 'https://kmdiscova.id.vn/',
});

let hasRedirectedToWelcome = false; // to avoid repeated redirects

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');

    if (token) {
      config.headers.Authorization = `Token ${token}`;

      // Redirect to welcome only once
      if (!hasRedirectedToWelcome && router?.replace) {
        hasRedirectedToWelcome = true;
        setTimeout(() => {
          router.replace('/welcome');
        }, 0); // Delay to avoid interfering with request
      }

    } else {
      console.warn('⚠️ No access token found');

      // Optional: redirect to login if no token
      // if (!router.canGoBack?.()) {
      //   router.replace('/login');
      // }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
