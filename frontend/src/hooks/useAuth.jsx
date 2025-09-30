// frontend/src/hooks/useAuth.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js'; // Importamos la instancia de Axios
import { loginUser, logoutUser } from '../services/authService.js';

// 1. Crear el Contexto
const AuthContext = createContext();

// 2. Hook de Consumo
export const useAuth = () => useContext(AuthContext);

// 3. Proveedor del Contexto
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => {
        // Inicializar token de manera segura
        try {
            return localStorage.getItem('userToken');
        } catch (e) {
            console.error("Error reading userToken from localStorage:", e);
            return null;
        }
    });
    const [isAuthenticated, setIsAuthenticated] = useState(!!token);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // -----------------------------------------------------------
    // EFECTO CRÍTICO: Sincroniza el estado del token con Axios y Auth
    // -----------------------------------------------------------
    useEffect(() => {
        setIsAuthenticated(!!token);

        if (token) {
            // CRÍTICO: Asegura que Axios tenga el token al inicio
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            // Limpia el header si no hay token
            delete api.defaults.headers.common['Authorization'];
        }
    }, [token]);

    // -----------------------------------------------------------
    // FUNCIÓN LOGOUT (Callback para usar en Interceptor)
    // -----------------------------------------------------------
    const logout = useCallback(() => {
        logoutUser(); // Lógica de limpieza en localStorage
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        navigate('/login', { replace: true });
    }, [navigate]);

    // -----------------------------------------------------------
    // CONFIGURACIÓN del INTERCEPTOR de Axios
    // -----------------------------------------------------------
    useEffect(() => {
        // El interceptor se registra una sola vez
        const interceptor = api.interceptors.response.use(
            (response) => response,
            (error) => {
                // Verificar si el error es 401 y no es la ruta de login
                if (error.response && error.response.status === 401 && error.config.url !== '/auth/login') {
                    console.warn("401 Unauthorized detectado. Forzando cierre de sesión.");
                    // Llama a la función de logout para limpiar la sesión y redirigir
                    logout(); 
                }
                return Promise.reject(error);
            }
        );

        // Limpieza: Remover el interceptor al desmontar
        return () => {
            api.interceptors.response.eject(interceptor);
        };
    }, [logout]);

    // -----------------------------------------------------------
    // FUNCIÓN DE LOGIN (Con redirección por Rol)
    // -----------------------------------------------------------
    const login = async (email, password) => {
        setLoading(true);
        try {
            const data = await loginUser(email, password);
            
            // 1. Actualizar el estado
            setToken(data.token);
            setUser(data.user);

            // 2. LÓGICA DE REDIRECCIÓN BASADA EN ROL (CRÍTICO para evitar el loop)
            const userRole = data.user?.rol?.nombre; 
            let defaultPath = '/';

            switch (userRole) {
                case 'Administrador':
                    defaultPath = '/'; // Dashboard/Home
                    break;
                case 'Vendedor':
                    defaultPath = '/sales'; 
                    break;
                case 'Almacenista':
                    defaultPath = '/inventory';
                    break;
                default:
                    defaultPath = '/';
                    break;
            }

            // 3. Redirigir INMEDIATAMENTE después del éxito
            // Esto es crucial para romper el ciclo de login
            navigate(defaultPath, { replace: true });

        } catch (error) {
            console.error("Fallo el intento de Login:", error);
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

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
