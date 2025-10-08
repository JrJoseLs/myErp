// frontend/src/pages/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Package, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Users,
  FileText,
  LogOut,
  Plus,
  Edit,
  Trash2,
  XCircle,
  LogIn,
  ShoppingCart // ✅ CORRECCIÓN 1: Se agrega la importación de ShoppingCart
} from 'lucide-react';
import { getLowStockProducts, getInventoryValuation } from '../services/inventoryService';
import { formatCurrency, formatNumber, formatDateTime, formatDate } from '../utils/formatters';

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
  const [ncfAlerts, setNcfAlerts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    checkNCFStatus();
    loadRecentActivity();
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

  const checkNCFStatus = async () => {
    try {
      const { data } = await api.get('/ncf/alerts');
      if (data.requiere_accion) {
        setNcfAlerts(data.alerts);
      }
    } catch (error) {
      console.error('Error al verificar NCF:', error);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const { data } = await api.get('/audit/recent', { params: { limit: 10 } });
      setRecentActivity(data.activity || []);
    } catch (error) {
      console.error('Error al cargar actividad reciente:', error);
    }
  };

  const getActivityIcon = (accion) => {
    const icons = {
      CREATE: <Plus className="w-5 h-5 text-green-500" />,
      UPDATE: <Edit className="w-5 h-5 text-blue-500" />,
      DELETE: <Trash2 className="w-5 h-5 text-red-500" />,
      ANULAR: <XCircle className="w-5 h-5 text-orange-500" />,
      LOGIN: <LogIn className="w-5 h-5 text-indigo-500" />,
    };
    return icons[accion] || <FileText className="w-5 h-5 text-gray-500" />;
  };

  const getActivityDescription = (activity) => {
    const actions = {
      CREATE: 'creó',
      UPDATE: 'actualizó',
      DELETE: 'eliminó',
      ANULAR: 'anuló',
      LOGIN: 'inició sesión',
    };
    
    const action = actions[activity.accion] || 'modificó';
    const tabla = activity.tabla.replace('_', ' ');
    
    return `${action} ${tabla} #${activity.registro_id}`;
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

      {/* Alertas de NCF */}
      {ncfAlerts.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg shadow-md">
          <div className="flex">
            <AlertTriangle className="h-6 w-6 text-yellow-400 mt-1" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">
                ⚠️ Alertas de NCF - Requiere Atención
              </h3>
              <div className="mt-2 text-sm text-yellow-700 space-y-2">
                {ncfAlerts.map((alert, index) => (
                  <div 
                    key={index} 
                    className={`p-2 rounded ${alert.critico ? 'bg-red-100 border border-red-300' : 'bg-yellow-100'}`}
                  >
                    <p className={alert.critico ? 'font-bold text-red-700' : 'font-semibold'}>
                      {alert.critico && '🚨 '} 
                      {alert.tipo_ncf} - {alert.descripcion}
                    </p>
                    <p className="text-xs mt-1">
                      📊 Disponibles: <strong>{alert.disponibles}</strong> de {alert.total} 
                      ({alert.porcentaje}%)
                    </p>
                    <p className="text-xs">
                      📅 Vence: {formatDate(alert.fecha_vencimiento)}
                    </p>
                    {alert.critico && (
                      <p className="text-xs mt-1 font-bold text-red-600">
                        ⚠️ CRÍTICO: Solicite nuevo rango a la DGII inmediatamente
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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
          link="/invoices"
        />
        {/* Nota: El valor de Ventas del Mes está fijo en RD$ 0.00. Es un placeholder. */}
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
              to="/invoices"
              className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition"
            >
              <DollarSign className="w-8 h-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Facturas</span>
            </Link>
            <Link
              to="/customers"
              className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
            >
              <Users className="w-8 h-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Clientes</span>
            </Link>
            {/* ✅ CORRECCIÓN 2: Enlaces separados y estructura de Punto de Venta corregida */}
            <Link 
              to="/pos"
              className="flex flex-col items-center justify-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition"
            >
              <ShoppingCart className="w-8 h-8 text-red-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Punto de Venta</span>
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

      {/* Actividad Reciente */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 text-purple-600 mr-2" />
          Actividad Reciente del Sistema
        </h2>
        
        {recentActivity.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No hay actividad reciente registrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-start p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.accion)}
                </div>
                <div className="ml-3 flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.nombre_completo || 'Usuario desconocido'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {getActivityDescription(activity)}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDateTime(activity.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;