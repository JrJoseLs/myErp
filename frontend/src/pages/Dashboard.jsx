// frontend/src/pages/Dashboard.jsx

import React from 'react';
import Layout from '../components/layout/Layout.jsx';
import { useAuth } from '../hooks/useAuth';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  
  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-3xl font-bold mb-4">Bienvenido, {user?.nombre || user?.email}</h1>
        <p>Tu rol: {user?.rol || 'No definido'}</p>
        
        <div className="mt-8">
            <h2 className="text-2xl mb-3">Accesos Rápidos</h2>
            <ul className="list-disc ml-5 space-y-2">
                <li><a href="/inventory" className="text-blue-600 hover:underline">Ir a Gestión de Inventario</a></li>
                {/* Agrega más enlaces aquí */}
            </ul>
        </div>

        <button 
            onClick={logout} 
            className="mt-10 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
            Cerrar Sesión
        </button>
      </div>
    </Layout>
  );
};

export default DashboardPage;