import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor de request para enviar token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('userToken');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// Interceptor de response con manejo de errores
api.interceptors.response.use(
  response => response,
  error => {
    if (!error.response) return Promise.reject({ message: 'No se pudo conectar al servidor', isNetworkError: true });
    if (error.code === 'ECONNABORTED') return Promise.reject({ message: 'La solicitud tardó demasiado', isTimeout: true });
    if (error.response.status === 503) return Promise.reject({ message: 'Servidor temporalmente fuera de servicio', isServiceUnavailable: true });
    if (error.response.status === 500) return Promise.reject({ message: 'Error interno del servidor', isServerError: true });
    return Promise.reject(error);
  }
);

export default api;
