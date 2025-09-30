// frontend/src/hooks/useAuth.jsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { loginUser, logoutUser, getCurrentUser, getToken } from '../services/authService';

// Crear el Contexto
const AuthContext = createContext();

// Hook de Consumo
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

// Proveedor del Contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Función de logout
  const logout = useCallback(() => {
    logoutUser();
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    delete api.defaults.headers.common['Authorization'];
    navigate('/login', { replace: true });
  }, [navigate]);

  // Cargar sesión desde localStorage al montar
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const savedToken = getToken();
        const savedUser = getCurrentUser();

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(savedUser);
          setIsAuthenticated(true);
          api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        }
      } catch (error) {
        console.error('Error al inicializar autenticación:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [logout]);

  // Configurar interceptor de Axios
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (
          error.response &&
          error.response.status === 401 &&
          error.config.url !== '/auth/login'
        ) {
          console.warn('401 Unauthorized - Sesión expirada');
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [logout]);

  // Función de login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await loginUser(email, password);

      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

      // Redirigir según rol
      const userRole = data.user?.rol;
      let defaultPath = '/';

      switch (userRole) {
        case 'Administrador':
        case 'Gerente':
          defaultPath = '/';
          break;
        case 'Vendedor':
          defaultPath = '/sales';
          break;
        case 'Inventario':
          defaultPath = '/inventory';
          break;
        case 'Contabilidad':
          defaultPath = '/accounting';
          break;
        default:
          defaultPath = '/';
      }

      navigate(defaultPath, { replace: true });
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};