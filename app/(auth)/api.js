import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'https://kmdiscova.id.vn', // Adjust this if needed
});

// Add request interceptor to include token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    console.log("Token : ",token);
    if (token) {
      config.headers.Authorization = `Token ${token}`; // Or 'Bearer' depending on backend
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);



export default api;
