// api.js or axiosInstance.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://kmdiscova.id.vn/', // base path
});

export default api;
