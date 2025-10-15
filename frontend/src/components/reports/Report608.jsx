// frontend/src/components/reports/Report608.jsx - DISEÑO PROFESIONAL
import React, { useState } from 'react';
import { XCircle, Download, Save, Loader, AlertTriangle, FileX, Calendar } from 'lucide-react';
import Button from '../common/Button';
import Notification from '../common/Notification';
import { generateReport608, downloadReportTXT, downloadReportExcel, saveReport } from '../../services/reportService';
import { formatDate } from '../../utils/formatters';

const Report608 = () => {
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
      const data = await generateReport608(mes, año);
      setReportData(data);
      showNotification('✓ Reporte 608 generado exitosamente', 'success');
    } catch (error) {
      showNotification(error.response?.data?.message || '✗ Error al generar reporte', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTXT = async () => {
    try {
      await downloadReportTXT('608', mes, año);
      showNotification('✓ Archivo TXT descargado correctamente', 'success');
    } catch (error) {
      showNotification('✗ Error al descargar archivo TXT', 'error');
    }
  };

  const handleDownloadExcel = async () => {
    try {
      await downloadReportExcel('608', mes, año);
      showNotification('✓ Archivo Excel descargado correctamente', 'success');
    } catch (error) {
      showNotification('✗ Error al descargar archivo Excel', 'error');
    }
  };

  const handleSave = async () => {
    try {
      const result = await saveReport('608', mes, año);
      showNotification(`✓ ${result.message}`, 'success');
    } catch (error) {
      showNotification('✗ Error al guardar reporte en base de datos', 'error');
    }
  };

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const tiposAnulacion = {
    '01': 'Deterioro de factura',
    '02': 'Errores de impresión',
    '03': 'Impresión defectuosa',
    '04': 'Corrección de la información',
  };

  return (
    <div className="space-y-6">
      {notification.message && <Notification message={notification.message} type={notification.type} />}

      {/* Panel de Selección de Período */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
          <div className="flex items-center space-x-3 text-white">
            <XCircle className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Reporte 608 - Cancelaciones</h2>
              <p className="text-red-100 text-sm">Anulaciones de comprobantes fiscales</p>
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
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
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
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              />
            </div>

            <div className="md:col-span-2 flex items-end">
              <Button 
                onClick={handleGenerate} 
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2.5 shadow-lg hover:shadow-xl transition-all"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Generando Reporte...
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 mr-2" />
                    Generar Reporte 608
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
          {/* KPI Card */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-white bg-opacity-20 rounded-xl">
                  <FileX className="w-10 h-10" />
                </div>
                <div>
                  <p className="text-red-100 text-sm font-medium mb-1">Total de Anulaciones</p>
                  <p className="text-5xl font-bold">{reportData.count}</p>
                  <p className="text-red-200 text-sm mt-2">
                    Comprobantes anulados en {meses[mes - 1]} {año}
                  </p>
                </div>
              </div>
              <AlertTriangle className="w-16 h-16 opacity-20" />
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

          {/* Tabla de Datos o Mensaje Vacío */}
          {reportData.data.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Detalle de Anulaciones</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {reportData.count} comprobantes anulados en {meses[mes - 1]} {año}
                </p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        NCF Anulado
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Fecha Comprobante
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Tipo de Anulación
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Motivo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.data.map((row, i) => (
                      <tr key={i} className="hover:bg-red-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 bg-gray-50">
                          {row.ncf}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(row.fecha_comprobante)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {tiposAnulacion[row.tipo_anulacion] || row.tipo_anulacion}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                          {row.motivo || 'Sin especificar'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
                <XCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ¡Excelente! No hay anulaciones
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                No se encontraron facturas anuladas en el período de {meses[mes - 1]} {año}.
                Esto indica una buena gestión de tus comprobantes fiscales.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Report608;