// frontend/src/components/reports/Report606.jsx - DISEÑO PROFESIONAL
import React, { useState } from 'react';
import { ShoppingCart, Download, Save, Loader, ChevronRight, DollarSign, FileText, Calendar } from 'lucide-react';
import Button from '../common/Button';
import Notification from '../common/Notification';
import { generateReport606, downloadReportTXT, downloadReportExcel, saveReport } from '../../services/reportService';
import { formatCurrency, formatDate } from '../../utils/formatters';

const Report606 = () => {
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [año, setAño] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 5000);
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await generateReport606(mes, año);
      setReportData(data);
      showNotification('✓ Reporte 606 generado exitosamente', 'success');
    } catch (error) {
      showNotification(error.response?.data?.message || '✗ Error al generar reporte', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTXT = async () => {
    try {
      await downloadReportTXT('606', mes, año);
      showNotification('✓ Archivo TXT descargado correctamente', 'success');
    } catch (error) {
      showNotification('✗ Error al descargar archivo TXT', 'error');
    }
  };

  const handleDownloadExcel = async () => {
    try {
      await downloadReportExcel('606', mes, año);
      showNotification('✓ Archivo Excel descargado correctamente', 'success');
    } catch (error) {
      showNotification('✗ Error al descargar archivo Excel', 'error');
    }
  };

  const handleSave = async () => {
    try {
      const result = await saveReport('606', mes, año);
      showNotification(`✓ ${result.message}`, 'success');
    } catch (error) {
      showNotification('✗ Error al guardar reporte en base de datos', 'error');
    }
  };

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className="space-y-6">
      {notification.message && <Notification message={notification.message} type={notification.type} />}

      {/* Panel de Selección de Período */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
          <div className="flex items-center space-x-3 text-white">
            <ShoppingCart className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Reporte 606 - Compras y Gastos</h2>
              <p className="text-orange-100 text-sm">Facturas de compra recibidas de proveedores</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Mes del Reporte
              </label>
              <select
                value={mes}
                onChange={(e) => setMes(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              >
                {meses.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Año</label>
              <input
                type="number"
                value={año}
                onChange={(e) => setAño(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              />
            </div>

            <div className="md:col-span-2 flex items-end">
              <Button 
                onClick={handleGenerate} 
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-2.5 shadow-lg hover:shadow-xl transition-all"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Generando Reporte...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Generar Reporte 606
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Resultados del Reporte */}
      {reportData && (
        <>
          {/* KPIs Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                  <FileText className="w-7 h-7" />
                </div>
                <ChevronRight className="w-5 h-5 opacity-50" />
              </div>
              <p className="text-orange-100 text-sm font-medium mb-1">Total de Compras</p>
              <p className="text-4xl font-bold">{reportData.data.length}</p>
              <p className="text-orange-200 text-xs mt-2">Facturas recibidas</p>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                  <DollarSign className="w-7 h-7" />
                </div>
                <ChevronRight className="w-5 h-5 opacity-50" />
              </div>
              <p className="text-red-100 text-sm font-medium mb-1">Monto Total</p>
              <p className="text-3xl font-bold">{formatCurrency(reportData.totales.monto_facturado)}</p>
              <p className="text-red-200 text-xs mt-2">Gastos del período</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                  <ShoppingCart className="w-7 h-7" />
                </div>
                <ChevronRight className="w-5 h-5 opacity-50" />
              </div>
              <p className="text-indigo-100 text-sm font-medium mb-1">ITBIS Pagado</p>
              <p className="text-3xl font-bold">{formatCurrency(reportData.totales.itbis_facturado)}</p>
              <p className="text-indigo-200 text-xs mt-2">Impuesto deducible</p>
            </div>
          </div>

          {/* Panel de Acciones */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Exportar y Guardar Reporte</h3>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={handleDownloadTXT}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 shadow-md hover:shadow-lg transition-all"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar TXT (DGII)
              </Button>
              <Button 
                onClick={handleDownloadExcel}
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2.5 shadow-md hover:shadow-lg transition-all"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar Excel
              </Button>
              <Button 
                onClick={handleSave}
                className="bg-gray-700 hover:bg-gray-800 text-white font-medium px-6 py-2.5 shadow-md hover:shadow-lg transition-all"
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar en Base de Datos
              </Button>
            </div>
          </div>

          {/* Tabla de Datos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Detalle de Compras</h3>
              <p className="text-sm text-gray-600 mt-1">
                {reportData.data.length} registros encontrados para {meses[mes - 1]} {año}
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      RNC/Cédula
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Tipo ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      NCF
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      F. Comprobante
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      F. Pago
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                      ITBIS
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.data.map((row, i) => (
                    <tr key={i} className="hover:bg-orange-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {row.rnc_cedula}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                          {row.tipo_identificacion === '1' ? 'RNC' : 'Cédula'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 bg-gray-50">
                        {row.ncf}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(row.fecha_comprobante)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(row.fecha_pago)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-right text-red-600">
                        {formatCurrency(row.monto_facturado)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-right text-indigo-600">
                        {formatCurrency(row.itbis_facturado)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Report606;