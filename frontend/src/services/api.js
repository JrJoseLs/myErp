// frontend/src/services/api.js

import axios from 'axios';

// Variable para almacenar la función de logout proporcionada por el contexto de React
let onUnauthorized = () => {};

// Función para que el componente de React registre su función de logout
export const setOnUnauthorizedLogout = (handler) => {
    onUnauthorized = handler;
};

const api = axios.create({
  // baseURL apunta a la raíz de la API de Express (puerto 5000)
  baseURL: 'http://localhost:5000/api/v1', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token JWT a cada solicitud
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
      // Usar el esquema Bearer para JWT
      config.headers['Authorization'] = `Bearer ${token}`;
        // 🚨 DEBUG: Muestra si el token se está adjuntando y su valor
        console.log(`[AXIOS DEBUG] Token adjunto para ${config.url}: ${token.substring(0, 10)}...`); 
    } else {
        console.log(`[AXIOS DEBUG] Sin token en localStorage para ${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores 401 (Sesión expirada/no autorizada)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // 🚨 LLAMADA CLAVE: Llama a la función de logout registrada por useAuth
            console.error("401 Unauthorized - Llamando a la función de logout de React. El token puede ser inválido o no se envió a tiempo.");
            onUnauthorized();
            
            // Ya no es necesario borrar localStorage aquí, React lo hará.
        }
        return Promise.reject(error);
    }
);

export default api;
