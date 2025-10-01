// frontend/src/pages/InvoiceDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getInvoiceById, registerPayment } from '../services/invoiceService';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ArrowLeft, DollarSign, LogOut } from 'lucide-react';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Notification from '../components/common/Notification';
import InvoicePrint from '../components/invoices/InvoicePrint';

const InvoiceDetailPage = () => {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Modal de pago
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    monto_pagado: '',
    metodo_pago: 'efectivo',
    referencia: '',
    notas: '',
  });

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const loadInvoice = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getInvoiceById(id);
      setInvoice(data.invoice);
    } catch (err) {
      console.error('Error al cargar factura:', err);
      setError('Error al cargar la factura');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterPayment = async (e) => {
    e.preventDefault();

    try {
      await registerPayment(id, {
        ...paymentData,
        monto_pagado: parseFloat(paymentData.monto_pagado),
      });

      setSuccess('Pago registrado exitosamente');
      setShowPaymentModal(false);
      setPaymentData({
        monto_pagado: '',
        metodo_pago: 'efectivo',
        referencia: '',
        notas: '',
      });
      setTimeout(() => setSuccess(null), 3000);
      loadInvoice();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar el pago');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Cargando factura...</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-red-600">Factura no encontrada</div>
      </div>
    );
  }

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
          <div className="flex items-center space-x-4">
            <Link
              to="/invoices"
              className="flex items-center text-green-600 hover:text-green-800"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver a Facturas
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{user?.nombre_completo}</span>
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

      {/* Información General */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Factura {invoice.numero_factura}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              NCF: <span className="font-semibold text-blue-600">{invoice.ncf || 'Sin NCF'}</span>
            </p>
          </div>
          <div className="text-right">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getEstadoBadge(invoice.estado)}`}>
              {invoice.estado.toUpperCase()}
            </span>
            {invoice.anulada && (
              <div className="mt-2 text-sm text-red-600 font-semibold">
                FACTURA ANULADA
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Información del Cliente</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Nombre:</strong> {invoice.customer?.nombre_comercial}</p>
              <p><strong>RNC/Cédula:</strong> {invoice.customer?.numero_identificacion}</p>
              <p><strong>Teléfono:</strong> {invoice.customer?.telefono || 'N/A'}</p>
              <p><strong>Email:</strong> {invoice.customer?.email || 'N/A'}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Detalles de la Factura</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Fecha de Emisión:</strong> {formatDate(invoice.fecha_emision)}</p>
              {invoice.fecha_vencimiento && (
                <p><strong>Fecha de Vencimiento:</strong> {formatDate(invoice.fecha_vencimiento)}</p>
              )}
              <p><strong>Tipo de Venta:</strong> <span className="uppercase">{invoice.tipo_venta}</span></p>
              <p><strong>Moneda:</strong> {invoice.moneda}</p>
              <p><strong>Vendedor:</strong> {invoice.seller?.nombre_completo || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Productos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Productos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Precio Unit.</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Descuento</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">ITBIS</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoice.details?.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.product?.nombre}</div>
                      <div className="text-sm text-gray-500">{item.product?.codigo}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm">{item.cantidad}</td>
                  <td className="px-6 py-4 text-right text-sm">{formatCurrency(item.precio_unitario)}</td>
                  <td className="px-6 py-4 text-right text-sm">{formatCurrency(item.descuento)}</td>
                  <td className="px-6 py-4 text-center text-sm">
                    {item.itbis_porcentaje > 0 ? `${item.itbis_porcentaje}%` : 'Exento'}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totales y Acciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Totales */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Totales</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold">{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.descuento > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Descuento:</span>
                <span className="font-semibold text-red-600">-{formatCurrency(invoice.descuento)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">ITBIS (18%):</span>
              <span className="font-semibold">{formatCurrency(invoice.itbis)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between text-lg">
              <span className="font-bold text-gray-900">TOTAL:</span>
              <span className="font-bold text-green-600">{formatCurrency(invoice.total)}</span>
            </div>
            {invoice.tipo_venta === 'credito' && (
              <>
                <div className="flex justify-between text-sm border-t pt-3">
                  <span className="text-gray-600">Monto Pagado:</span>
                  <span className="font-semibold text-blue-600">{formatCurrency(invoice.monto_pagado)}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="font-semibold text-gray-900">Balance Pendiente:</span>
                  <span className={`font-bold ${invoice.balance_pendiente > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(invoice.balance_pendiente)}
                  </span>
                </div>
              </>
            )}
          </div>

          {invoice.notas && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-semibold text-gray-700 mb-1">Notas:</p>
              <p className="text-sm text-gray-600">{invoice.notas}</p>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h2>

          {!invoice.anulada && invoice.balance_pendiente > 0 && invoice.tipo_venta === 'credito' && (
            <Button
              onClick={() => setShowPaymentModal(true)}
              className="w-full mb-3 bg-blue-600 hover:bg-blue-700 flex items-center justify-center space-x-2"
            >
              <DollarSign className="w-5 h-5" />
              <span>Registrar Pago</span>
            </Button>
          )}

          <InvoicePrint invoice={invoice} />

          {invoice.anulada && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-semibold text-red-800 mb-2">Factura Anulada</p>
              <p className="text-xs text-red-600 mb-1">
                <strong>Motivo:</strong> {invoice.motivo_anulacion}
              </p>
              <p className="text-xs text-red-600">
                <strong>Fecha:</strong> {formatDate(invoice.fecha_anulacion)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Registro de Pago */}
      {showPaymentModal && (
        <Modal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          title="Registrar Pago"
        >
          <form onSubmit={handleRegisterPayment} className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Balance Pendiente:</strong> {formatCurrency(invoice.balance_pendiente)}
              </p>
            </div>

            <Input
              label="Monto a Pagar"
              name="monto_pagado"
              type="number"
              step="0.01"
              value={paymentData.monto_pagado}
              onChange={handlePaymentChange}
              required
              placeholder="0.00"
            />

            <Select
              label="Método de Pago"
              name="metodo_pago"
              value={paymentData.metodo_pago}
              onChange={handlePaymentChange}
              options={[
                { value: 'efectivo', label: 'Efectivo' },
                { value: 'transferencia', label: 'Transferencia Bancaria' },
                { value: 'cheque', label: 'Cheque' },
                { value: 'tarjeta', label: 'Tarjeta' }
              ]}
              required
            />

            <Input
              label="Referencia/No. de Transacción"
              name="referencia"
              value={paymentData.referencia}
              onChange={handlePaymentChange}
              placeholder="Opcional"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <textarea
                name="notas"
                value={paymentData.notas}
                onChange={handlePaymentChange}
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                placeholder="Información adicional del pago..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                variant="secondary"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Registrar Pago
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default InvoiceDetailPage;