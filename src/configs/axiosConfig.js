// admin/src/configs/axiosConfig.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.API_ADMIN_URL, // adjust if your backend is on another origin
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
