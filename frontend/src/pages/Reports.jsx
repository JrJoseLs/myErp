// frontend/src/pages/Reports.jsx - DISEÑO PROFESIONAL MEJORADO
import React, { useState } from 'react';
import { FileText, ShoppingCart, XCircle, Calendar, Building2, TrendingUp, AlertTriangle } from 'lucide-react';
import Report607 from '../components/reports/Report607';
import Report606 from '../components/reports/Report606';
import Report608 from '../components/reports/Report608';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('607');

  const tabs = [
    {
      id: '607',
      label: 'Reporte 607',
      subtitle: 'Ingresos y Ventas',
      icon: <TrendingUp className="w-6 h-6" />,
      gradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-600',
      description: 'Reporte de ingresos por operaciones (facturas de venta emitidas)',
    },
    {
      id: '606',
      label: 'Reporte 606',
      subtitle: 'Compras y Gastos',
      icon: <ShoppingCart className="w-6 h-6" />,
      gradient: 'from-orange-500 to-orange-600',
      bgLight: 'bg-orange-50',
      borderColor: 'border-orange-500',
      textColor: 'text-orange-600',
      description: 'Reporte de compras, gastos y costos de bienes y servicios adquiridos',
    },
    {
      id: '608',
      label: 'Reporte 608',
      subtitle: 'Cancelaciones',
      icon: <XCircle className="w-6 h-6" />,
      gradient: 'from-red-500 to-red-600',
      bgLight: 'bg-red-50',
      borderColor: 'border-red-500',
      textColor: 'text-red-600',
      description: 'Reporte de anulaciones y cancelaciones de comprobantes fiscales',
    },
  ];

  const currentTab = tabs.find((t) => t.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Principal */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Reportes DGII</h1>
                <p className="text-sm text-gray-500 mt-1 flex items-center">
                  <Building2 className="w-4 h-4 mr-1" />
                  Dirección General de Impuestos Internos • República Dominicana
                </p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div className="text-sm">
                <div className="font-semibold text-blue-900">Período Actual</div>
                <div className="text-blue-600">
                  {new Date().toLocaleDateString('es-DO', { month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Alert de Información */}
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-r-lg shadow-sm">
          <div className="p-5">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-bold text-blue-900 mb-2">
                  Información Importante sobre Reportes Fiscales
                </h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• <strong>Vencimiento:</strong> Los reportes deben presentarse antes del día 15 del mes siguiente</p>
                  <p>• <strong>Formato TXT:</strong> Archivo oficial listo para enviar a la plataforma de la DGII</p>
                  <p>• <strong>Formato Excel:</strong> Para análisis interno y auditorías</p>
                  <p>• <strong>Validación:</strong> Verifica que todos los NCF estén correctamente registrados</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de Reportes - Estilo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative group text-left p-6 rounded-xl transition-all duration-300
                  ${isActive 
                    ? `bg-gradient-to-br ${tab.gradient} text-white shadow-xl scale-105` 
                    : 'bg-white hover:shadow-lg hover:scale-102 border-2 border-gray-200'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`
                    p-3 rounded-lg transition-colors
                    ${isActive ? 'bg-white bg-opacity-20' : tab.bgLight}
                  `}>
                    <div className={isActive ? 'text-white' : tab.textColor}>
                      {tab.icon}
                    </div>
                  </div>
                  
                  {isActive && (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-75"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-150"></div>
                    </div>
                  )}
                </div>

                <h3 className={`text-xl font-bold mb-1 ${isActive ? 'text-white' : 'text-gray-900'}`}>
                  {tab.label}
                </h3>
                <p className={`text-sm mb-3 ${isActive ? 'text-white text-opacity-90' : 'text-gray-500'}`}>
                  {tab.subtitle}
                </p>
                <p className={`text-xs leading-relaxed ${isActive ? 'text-white text-opacity-80' : 'text-gray-600'}`}>
                  {tab.description}
                </p>

                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white opacity-50 rounded-b-xl"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Contenido del Reporte Activo */}
        <div className="transition-all duration-500 ease-in-out">
          {activeTab === '607' && <Report607 />}
          {activeTab === '606' && <Report606 />}
          {activeTab === '608' && <Report608 />}
        </div>

        {/* Footer con Tips */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">Formato TXT</h4>
                <p className="text-xs text-gray-600">
                  Compatible con el sistema oficial de la DGII para envío directo
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">Historial</h4>
                <p className="text-xs text-gray-600">
                  Guarda los reportes en BD para mantener registro histórico
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">Análisis</h4>
                <p className="text-xs text-gray-600">
                  Exporta a Excel para realizar análisis detallados de datos
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;