// frontend/src/pages/InventoryMovements.jsx

import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogOut, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import StockMovements from '../components/inventory/StockMovements';

const InventoryMovementsPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link
              to="/inventory"
              className="flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver a Inventario
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{user?.nombre_completo}</span>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold">
              {user?.rol}
            </span>
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <LogOut className="w-4 h-4" />
              <span>Salir</span>
            </button>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Movimientos de Inventario</h1>
      </div>

      {/* Contenido */}
      <StockMovements />
    </div>
  );
};

export default InventoryMovementsPage;