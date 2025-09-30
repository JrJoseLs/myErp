// frontend/src/services/authService.js

import api from './api'; 

/**
 * Función que maneja la lógica de inicio de sesión.
 * Llama a la API y guarda el token y los datos del usuario en localStorage.
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} Datos de respuesta del usuario y token.
 */
export const loginUser = async (email, password) => {
  try {
    // La llamada se hace a http://localhost:5000/api/v1/auth/login
    const { data } = await api.post('/auth/login', { email, password });
    
    // Guardar el token y datos en el almacenamiento local
    localStorage.setItem('userToken', data.token);
    localStorage.setItem('userData', JSON.stringify(data.user)); 
    
    return data;
  } catch (error) {
    // Lanzar el mensaje de error del backend
    throw error.response?.data || { message: 'Error de conexión o credenciales inválidas.' };
  }
};


/**
 * Función que limpia los datos de sesión de localStorage.
 */
export const logoutUser = () => {
  // Limpiar el almacenamiento local
  localStorage.removeItem('userToken');
  localStorage.removeItem('userData');
  // La limpieza del encabezado de Axios se maneja en useAuth.jsx
};
