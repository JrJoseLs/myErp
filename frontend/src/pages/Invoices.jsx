// frontend/src/pages/Invoices.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getInvoices, anularInvoice } from '../services/invoiceService';
import { formatCurrency, formatDate } from '../utils/formatters';
import { FileText, Search, Plus, Eye, XCircle, LogOut, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import Notification from '../components/common/Notification';
import Modal from '../components/common/Modal';

const InvoicesPage = () => {
  const { user, logout } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Filtros
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [tipoVentaFilter, setTipoVentaFilter] = useState('');
  
  // Modal anulación
  const [showAnularModal, setShowAnularModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [motivoAnulacion, setMotivoAnulacion] = useState('');

  useEffect(() => {
    loadInvoices();
  }, [search, estadoFilter, tipoVentaFilter]);

  const loadInvoices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const filters = {
        search: search || undefined,
        estado: estadoFilter || undefined,
        tipo_venta: tipoVentaFilter || undefined,
      };
      
      const data = await getInvoices(filters);
      setInvoices(data.invoices || []);
    } catch (err) {
      console.error('Error al cargar facturas:', err);
      setError('Error al cargar las facturas');
    } finally {
      setLoading(false);
    }
  };

  const handleAnular = (invoice) => {
    setSelectedInvoice(invoice);
    setShowAnularModal(true);
    setMotivoAnulacion('');
  };

  const confirmAnular = async () => {
    if (!motivoAnulacion.trim()) {
      setError('Debe especificar el motivo de anulación');
      return;
    }

    try {
      await anularInvoice(selectedInvoice.id, motivoAnulacion);
      setSuccess('Factura anulada exitosamente');
      setShowAnularModal(false);
      setSelectedInvoice(null);
      setMotivoAnulacion('');
      setTimeout(() => setSuccess(null), 3000);
      loadInvoices();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al anular la factura');
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      pagada: 'bg-green-100 text-green-800',
      parcial: 'bg-blue-100 text-blue-800',
      vencida: 'bg-red-100 text-red-800',
      anulada: 'bg-gray-100 text-gray-800',
    };
    return badges[estado] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <FileText className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Facturas</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/invoices/create"
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="w-5 h-5" />
              <span>Nueva Factura</span>
            </Link>
            <span className="text-sm text-gray-600">{user?.nombre_completo}</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
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
      </div>

      {/* Notificaciones */}
      {error && <Notification type="error" message={error} />}
      {success && <Notification type="success" message={success} />}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por número o NCF..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 border"
            />
          </div>
          
          <Select
            label=""
            name="estado"
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
            options={[
              { value: '', label: 'Todos los estados' },
              { value: 'pendiente', label: 'Pendiente' },
              { value: 'pagada', label: 'Pagada' },
              { value: 'parcial', label: 'Parcial' },
              { value: 'vencida', label: 'Vencida' },
              { value: 'anulada', label: 'Anulada' }
            ]}
          />
          
          <Select
            label=""
            name="tipo_venta"
            value={tipoVentaFilter}
            onChange={(e) => setTipoVentaFilter(e.target.value)}
            options={[
              { value: '', label: 'Todos los tipos' },
              { value: 'contado', label: 'Contado' },
              { value: 'credito', label: 'Crédito' }
            ]}
          />
        </div>
      </div>

      {/* Tabla de Facturas */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando facturas...</div>
        ) : invoices.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No se encontraron facturas</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Factura</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NCF</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className={`hover:bg-gray-50 ${invoice.anulada ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.numero_factura}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.ncf || 'Sin NCF'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.customer?.nombre_comercial}
                        </div>
                        <div className="text-sm text-gray-500">
                          {invoice.customer?.numero_identificacion}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invoice.fecha_emision)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        invoice.tipo_venta === 'contado' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {invoice.tipo_venta.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                      {formatCurrency(invoice.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span className={invoice.balance_pendiente > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                        {formatCurrency(invoice.balance_pendiente)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoBadge(invoice.estado)}`}>
                        {invoice.estado.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm space-x-2">
                      <Link
                        to={`/invoices/${invoice.id}`}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Link>
                      {!invoice.anulada && invoice.estado !== 'anulada' && (
                        <button
                          onClick={() => handleAnular(invoice)}
                          className="text-red-600 hover:text-red-900 inline-flex items-center ml-3"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Anular
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Anulación */}
      {showAnularModal && (
        <Modal
          isOpen={showAnularModal}
          onClose={() => setShowAnularModal(false)}
          title="Anular Factura"
        >
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Advertencia:</strong> Esta acción revertirá el inventario y no se puede deshacer.
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Factura:</strong> {selectedInvoice?.numero_factura}
              </p>
              <p className="text-sm text-gray-700 mb-2">
                <strong>NCF:</strong> {selectedInvoice?.ncf || 'Sin NCF'}
              </p>
              <p className="text-sm text-gray-700 mb-4">
                <strong>Total:</strong> {formatCurrency(selectedInvoice?.total)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo de Anulación <span className="text-red-500">*</span>
              </label>
              <textarea
                value={motivoAnulacion}
                onChange={(e) => setMotivoAnulacion(e.target.value)}
                rows={4}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2 border"
                placeholder="Explique el motivo de la anulación..."
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                onClick={() => setShowAnularModal(false)}
                variant="secondary"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={confirmAnular}
                className="bg-red-600 hover:bg-red-700"
              >
                Confirmar Anulación
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default InvoicesPage;