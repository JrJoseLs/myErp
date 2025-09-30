// frontend/src/components/AppLayout.jsx
import React from 'react';
import { Outlet, Navigate, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Eliminando la extensión .jsx para simplificar la resolución
import { LogOut, LayoutDashboard, Truck, Package, DollarSign, Settings } from 'lucide-react';

// Definición de enlaces de navegación y a qué roles tienen acceso
const NAV_LINKS = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['Administrador', 'Vendedor', 'Almacenista', 'Contador'] },
    { name: 'Inventario', path: '/inventory', icon: Package, roles: ['Administrador', 'Almacenista'] },
    { name: 'Ventas', path: '/sales', icon: DollarSign, roles: ['Administrador', 'Vendedor'] },
    { name: 'Proveedores', path: '/providers', icon: Truck, roles: ['Administrador', 'Almacenista'] },
    { name: 'Reportes', path: '/reports', icon: LayoutDashboard, roles: ['Administrador', 'Contador'] },
    { name: 'Configuración', path: '/settings', icon: Settings, roles: ['Administrador'] },
];

const Sidebar = ({ userRole, logout }) => {
    // Filtra los enlaces para mostrar solo los que el rol actual tiene permiso
    const filteredLinks = NAV_LINKS.filter(link => 
        link.roles.includes(userRole)
    );

    return (
        <div className="flex flex-col w-64 bg-indigo-800 text-white min-h-screen p-4 shadow-2xl">
            <h2 className="text-3xl font-bold mb-8 text-indigo-100 border-b border-indigo-700 pb-3">ERP System</h2>
            
            {/* Información del Usuario y Rol */}
            <div className="mb-8 p-3 bg-indigo-700 rounded-lg shadow-inner">
                <p className="text-sm font-semibold">
                    {userRole}
                </p>
                <span className="text-xs text-indigo-200">
                    {/* Muestra el nombre si está disponible */}
                    {/* {user?.nombre || 'Usuario'} */}
                </span>
            </div>

            {/* Navegación Principal */}
            <nav className="flex-grow">
                {filteredLinks.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        // Estilos de NavLink para manejar el estado activo
                        className={({ isActive }) => 
                            `flex items-center space-x-3 p-3 my-1 rounded-lg transition duration-150 ${
                                isActive ? 'bg-indigo-600 font-bold shadow-md' : 'hover:bg-indigo-700'
                            }`
                        }
                    >
                        <link.icon className="w-5 h-5" />
                        <span>{link.name}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Botón de Logout */}
            <button
                onClick={logout}
                className="mt-8 flex items-center justify-center space-x-3 p-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition duration-150"
            >
                <LogOut className="w-5 h-5" />
                <span>Salir</span>
            </button>
        </div>
    );
};

const AppLayout = () => {
    const { isAuthenticated, user, logout } = useAuth();
    
    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    // Obtener el rol del usuario para la barra lateral
    const userRole = user?.rol?.nombre || 'Invitado';

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar userRole={userRole} logout={logout} />
            
            {/* Contenido Principal */}
            <main className="flex-grow p-8">
                {/* El Outlet renderiza el componente de la ruta actual (e.g., InventoryPage) */}
                <Outlet />
            </main>
        </div>
    );
};

export default AppLayout;
