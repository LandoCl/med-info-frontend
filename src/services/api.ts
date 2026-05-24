import axios from "axios";

// Normalizar la URL base para asegurar que siempre termine en "/api" de manera limpia
let baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
if (baseUrl && !baseUrl.endsWith('/api') && !baseUrl.endsWith('/api/')) {
  // Quitar barra final si existe y añadir /api
  baseUrl = baseUrl.replace(/\/$/, '') + '/api';
}

const api = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    // Si la URL del endpoint empieza con "/", la removemos temporalmente.
    // Esto evita que Axios descarte el path "/api" del baseURL al resolver la URL relativa.
    if (config.url && config.url.startsWith('/')) {
      config.url = config.url.substring(1);
    }
    
    const token = localStorage.getItem("qr_medico_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
