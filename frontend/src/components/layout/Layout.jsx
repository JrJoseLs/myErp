// frontend/src/components/layout/Layout.jsx

import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const Layout = ({ children }) => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar/Menú de Navegación simple */}
      <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col justify-between">
        <div>
            <h1 className="text-2xl font-bold mb-6">ERP/CRM</h1>
            <nav>
                <ul>
                    <li className="mb-2"><a href="/" className="hover:text-blue-400">Dashboard</a></li>
                    <li className="mb-2"><a href="/inventory" className="hover:text-blue-400">Inventario</a></li>
                    <li className="mb-2"><a href="/customers" className="hover:text-blue-400">Clientes</a></li>
                    {/* Más enlaces aquí */}
                </ul>
            </nav>
        </div>
        <button onClick={logout} className="p-2 bg-red-700 rounded hover:bg-red-600">
            Salir
        </button>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        <header className="bg-white shadow p-4 text-right">
            <p className="text-sm">Usuario Logueado</p>
        </header>
        <div className="p-6">
            {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;