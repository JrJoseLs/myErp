// frontend/src/pages/Inventory.jsx

import React, { useState, useEffect } from 'react';
// Asegurando que la ruta se resuelve correctamente desde pages/
import api from '../services/api.js';
import { useAuth } from '../hooks/useAuth.jsx'; 

const InventoryPage = () => {
    const { user, logout } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            // Llama al endpoint protegido del backend
            const response = await api.get('/products'); 
            setProducts(response.data);
            console.log("Datos de productos cargados:", response.data.length);
        } catch (err) {
            console.error("Error al cargar inventario:", err);
            
            // Si el error 401 NO fue capturado a tiempo por el interceptor, 
            // lo manejamos aquí manualmente (aunque el interceptor ya debería forzar el logout)
            if (err.response && err.response.status === 401) {
                // Si el 401 ocurre aquí, la redirección es inminente.
                setError("Sesión expirada o no autorizada. Redirigiendo...");
            } else {
                setError(`Error al cargar datos: ${err.message}. Revise su backend.`);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Asegúrate de que el usuario está presente antes de intentar cargar datos
        if (user) {
            fetchProducts();
        }
    }, [user]);

    // Lógica para el badge del rol
    const userRole = user?.rol?.nombre || 'Invitado';
    const roleColor = userRole === 'Administrador' ? 'bg-indigo-500' : 
                      userRole === 'Almacenista' ? 'bg-green-500' : 
                      'bg-gray-500';

    // Estilos Tailwind CSS para una interfaz simple y centrada
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
                <h1 className="text-3xl font-extrabold text-indigo-700">
                    Módulo de Inventario
                </h1>
                <div className="flex items-center space-x-4">
                    <span className="text-gray-600 font-medium">
                        Bienvenido, {user?.nombre || 'Usuario'} 
                    </span>
                    {/* INSERCIÓN: Badge de Rol para mostrar la parte del software */}
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full text-white ${roleColor}`}>
                        {userRole.toUpperCase()}
                    </span>
                    <button 
                        onClick={logout} 
                        className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-150"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-2xl">
                {loading && (
                    <div className="text-center py-10 text-lg text-indigo-500">
                        Cargando productos...
                    </div>
                )}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Error:</strong>
                        <span className="block sm:inline ml-2">{error}</span>
                    </div>
                )}
                
                {!loading && !error && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nombre del Producto
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Stock
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Precio Venta
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {products.length > 0 ? (
                                    products.map((product) => (
                                        <tr key={product.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.name || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.stock || 0}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${product.price?.toFixed(2) || '0.00'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                            No hay productos cargados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
};

export default InventoryPage;
