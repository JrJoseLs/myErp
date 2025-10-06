// // frontend/src/services/api.js

// import axios from 'axios';

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Interceptor de request - agregar token
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('userToken');
//     if (token) {
//       config.headers['Authorization'] = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Nota: El interceptor de response se maneja en useAuth.jsx
// // para tener acceso a la función de logout de React

// export default api;

// frontend/src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  timeout: 30000, // 30 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de request - agregar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de response mejorado con manejo de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejo de errores de red
    if (!error.response) {
      console.error('Error de red o servidor no disponible');
      return Promise.reject({
        message: 'No se pudo conectar con el servidor. Verifique su conexión a internet.',
        isNetworkError: true,
      });
    }

    // Manejo de timeout
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        message: 'La solicitud tardó demasiado tiempo. Por favor, intente nuevamente.',
        isTimeout: true,
      });
    }

    // Manejo de errores HTTP específicos
    if (error.response.status === 503) {
      return Promise.reject({
        message: 'El servidor está temporalmente fuera de servicio. Intente más tarde.',
        isServiceUnavailable: true,
      });
    }

    // Manejo de error 500
    if (error.response.status === 500) {
      return Promise.reject({
        message: 'Error interno del servidor. Contacte al administrador.',
        isServerError: true,
      });
    }

    return Promise.reject(error);
  }
);

export default api;