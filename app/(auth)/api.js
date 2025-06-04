// api.js or axiosInstance.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://kmdiscova.id.vn/', // base path
});

export default api;
