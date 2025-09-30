// frontend/src/services/authService.js

import api from './api';

/**
 * Función de inicio de sesión
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} Datos del usuario y token
 */
export const loginUser = async (email, password) => {
  try {
    const { data } = await api.post('/auth/login', { email, password });
    
    // CORRECCIÓN: El backend devuelve la estructura correcta
    // data = { id, nombre_completo, email, rol, permisos, token }
    
    // Guardar token
    localStorage.setItem('userToken', data.token);
    
    // Guardar datos del usuario (sin el token)
    const userData = {
      id: data.id,
      nombre_completo: data.nombre_completo,
      email: data.email,
      rol: data.rol,
      permisos: data.permisos,
    };
    
    localStorage.setItem('userData', JSON.stringify(userData));
    
    return {
      token: data.token,
      user: userData,
    };
  } catch (error) {
    console.error('Error en loginUser:', error);
    const errorMessage = error.response?.data?.message || 'Error de conexión o credenciales inválidas.';
    throw new Error(errorMessage);
  }
};

/**
 * Función de cierre de sesión
 */
export const logoutUser = () => {
  localStorage.removeItem('userToken');
  localStorage.removeItem('userData');
};

/**
 * Obtener usuario desde localStorage
 * @returns {Object|null} Datos del usuario o null
 */
export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return null;
  }
};

/**
 * Obtener token desde localStorage
 * @returns {string|null} Token o null
 */
export const getToken = () => {
  return localStorage.getItem('userToken');
};