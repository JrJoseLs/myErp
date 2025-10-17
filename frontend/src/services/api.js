import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('userToken');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// Interceptor response
api.interceptors.response.use(
  res => res,
  err => {
    if (!err.response) return Promise.reject({ message: 'No se pudo conectar al servidor', isNetworkError: true });
    if (err.code === 'ECONNABORTED') return Promise.reject({ message: 'La solicitud tardó demasiado', isTimeout: true });
    if (err.response.status === 503) return Promise.reject({ message: 'Servidor temporalmente fuera de servicio', isServiceUnavailable: true });
    if (err.response.status === 500) return Promise.reject({ message: 'Error interno del servidor', isServerError: true });
    return Promise.reject(err);
  }
);

export default api;
