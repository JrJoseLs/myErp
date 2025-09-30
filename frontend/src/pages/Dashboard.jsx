// frontend/src/pages/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { 
  Package, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Users,
  FileText,
  LogOut
} from 'lucide-react';
import { getLowStockProducts, getInventoryValuation } from '../services/inventoryService';
import { formatCurrency, formatNumber } from '../utils/formatters';

const DashboardCard = ({ title, value, icon: Icon, color, link }) => (
  <Link to={link || '#'} className="block">
    <div className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <Icon className={`w-12 h-12 ${color.replace('border-', 'text-')}`} />
      </div>
    </div>
  </Link>
);

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    lowStockCount: 0,
    inventoryValue: 0,
    totalProducts: 0,
  });
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [lowStock, valuation] = await Promise.all([
        getLowStockProducts(),
        getInventoryValuation(),
      ]);

      setStats({
        lowStockCount: lowStock.count || 0,
        inventoryValue: valuation.totales?.total_costo || 0,
        totalProducts: valuation.totales?.total_productos || 0,
      });

      setLowStockProducts((lowStock.products || []).slice(0, 5));
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Bienvenido, {user?.nombre_completo}</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold">
              {user?.rol}
            </span>
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Productos Totales"
          value={formatNumber(stats.totalProducts)}
          icon={Package}
          color="border-blue-500"
          link="/inventory"
        />
        <DashboardCard
          title="Valor del Inventario"
          value={formatCurrency(stats.inventoryValue)}
          icon={DollarSign}
          color="border-green-500"
          link="/inventory"
        />
        <DashboardCard
          title="Stock Bajo"
          value={formatNumber(stats.lowStockCount)}
          icon={AlertTriangle}
          color="border-yellow-500"
          link="/inventory"
        />
        <DashboardCard
          title="Ventas del Mes"
          value="RD$ 0.00"
          icon={TrendingUp}
          color="border-purple-500"
          link="/sales"
        />
      </div>

      {/* Contenido Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productos con Stock Bajo */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
              Productos con Stock Bajo
            </h2>
            <Link
              to="/inventory"
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Ver todos →
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Cargando...</div>
          ) : lowStockProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay productos con stock bajo
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div>
                    <p className="font-medium text-gray-900">{product.nombre}</p>
                    <p className="text-sm text-gray-500">{product.codigo}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-red-600">
                      {formatNumber(product.stock_actual)} {product.unidad_medida}
                    </p>
                    <p className="text-xs text-gray-500">
                      Mín: {formatNumber(product.stock_minimo)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Accesos Rápidos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Accesos Rápidos</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/inventory"
              className="flex flex-col items-center justify-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition"
            >
              <Package className="w-8 h-8 text-indigo-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Inventario</span>
            </Link>
            <Link
              to="/sales"
              className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition"
            >
              <DollarSign className="w-8 h-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Ventas</span>
            </Link>
            <Link
              to="/providers"
              className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
            >
              <Users className="w-8 h-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Proveedores</span>
            </Link>
            <Link
              to="/reports"
              className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
            >
              <FileText className="w-8 h-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Reportes</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Actividad Reciente (Placeholder) */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Actividad Reciente</h2>
        <div className="text-center py-8 text-gray-500">
          <p>Esta sección mostrará la actividad reciente del sistema</p>
          <p className="text-sm mt-2">(Ventas, movimientos de inventario, etc.)</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;