import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_API_BASE}/api`,
  withCredentials: true,
});

export default api;
