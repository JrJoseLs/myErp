import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { FileText, Download, Calendar, AlertCircle } from 'lucide-react';
import Button from '../components/common/Button';
import Notification from '../components/common/Notification';

const ReportsPage = () => {
  const { user, logout } = useAuth();
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [año, setAño] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report607, setReport607] = useState(null);

  const generateReport607 = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/reports/607', { params: { mes, año } });
      setReport607(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al generar reporte');
    } finally {
      setLoading(false);
    }
  };

  const downloadTXT = () => {
    // Implementar descarga en formato TXT DGII
    const txtContent = report607.data.map(row => 
      `${row.rnc_cedula}|${row.ncf}|${row.fecha_comprobante}|${row.monto_facturado}|${row.itbis_facturado}`
    ).join('\n');
    
    const blob = new Blob([txtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `607_${mes}_${año}.txt`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes DGII</h1>
          <p className="text-gray-600">Generación de reportes 606, 607 y 608</p>
        </div>
        <button onClick={logout} className="px-4 py-2 bg-red-600 text-white rounded">
          Salir
        </button>
      </div>

      {error && <Notification type="error" message={error} />}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Calendar className="w-6 h-6 text-blue-600 mr-2" />
          Seleccionar Período
        </h2>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Mes</label>
            <select 
              value={mes} 
              onChange={(e) => setMes(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i} value={i + 1}>
                  {new Date(2000, i).toLocaleString('es', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Año</label>
            <input 
              type="number" 
              value={año} 
              onChange={(e) => setAño(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="flex items-end">
            <Button 
              onClick={generateReport607} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Generando...' : 'Generar 607'}
            </Button>
          </div>
        </div>
      </div>

      {report607 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">
              Reporte 607 - {report607.periodo.mes}/{report607.periodo.año}
            </h3>
            <Button onClick={downloadTXT} className="bg-green-600">
              <Download className="w-4 h-4 mr-2" />
              Descargar TXT
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-gray-600">Total Facturas</p>
              <p className="text-2xl font-bold text-blue-600">{report607.count}</p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <p className="text-sm text-gray-600">Monto Facturado</p>
              <p className="text-2xl font-bold text-green-600">
                RD$ {report607.totales.monto_facturado.toLocaleString()}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <p className="text-sm text-gray-600">ITBIS Facturado</p>
              <p className="text-2xl font-bold text-purple-600">
                RD$ {report607.totales.itbis_facturado.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">RNC/Cédula</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">NCF</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Monto</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">ITBIS</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {report607.data.map((row, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2 text-sm">{row.rnc_cedula}</td>
                    <td className="px-4 py-2 text-sm font-mono">{row.ncf}</td>
                    <td className="px-4 py-2 text-sm">{row.fecha_comprobante}</td>
                    <td className="px-4 py-2 text-sm text-right">RD$ {row.monto_facturado}</td>
                    <td className="px-4 py-2 text-sm text-right">RD$ {row.itbis_facturado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;