// frontend/src/pages/CreateInvoice.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getCustomers } from '../services/customerService';
import { getProducts } from '../services/productService';
import { getNextNCF } from '../services/ncfService';
import { createInvoice } from '../services/invoiceService';
import { formatCurrency, calculateITBIS } from '../utils/formatters';
import { ShoppingCart, Plus, Trash2, AlertCircle, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';
import Select from '../components/common/Select';  // ✅ CORREGIDO
import Input from '../components/common/Input';
import Notification from '../components/common/Notification';

const CreateInvoicePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [ncfAlert, setNcfAlert] = useState(null);

  // Datos de factura
  const [formData, setFormData] = useState({
    cliente_id: '',
    tipo_ncf: 'B02',
    fecha_emision: new Date().toISOString().split('T')[0],
    fecha_vencimiento: '',
    tipo_venta: 'contado',
    moneda: 'DOP',
    descuento: '0',
    notas: '',
  });

  // Items de factura
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    producto_id: '',
    cantidad: '1',
    precio_unitario: '',
    descuento: '0',
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (formData.tipo_ncf) {
      checkNCFAvailability();
    }
  }, [formData.tipo_ncf]);

  useEffect(() => {
    if (formData.tipo_venta === 'credito' && formData.cliente_id) {
      // Calcular fecha de vencimiento automática
      const customer = customers.find(c => c.id === parseInt(formData.cliente_id));
      if (customer && customer.dias_credito) {
        const fechaVencimiento = new Date();
        fechaVencimiento.setDate(fechaVencimiento.getDate() + customer.dias_credito);
        setFormData(prev => ({
          ...prev,
          fecha_vencimiento: fechaVencimiento.toISOString().split('T')[0],
        }));
      }
    }
  }, [formData.tipo_venta, formData.cliente_id, customers]);

  const loadInitialData = async () => {
    try {
      const [customersData, productsData] = await Promise.all([
        getCustomers({ activo: true }),
        getProducts({ activo: true }),
      ]);

      setCustomers(customersData.customers || []);
      setProducts(productsData.products || []);
    } catch (err) {
      setError('Error al cargar datos iniciales');
    }
  };

  const checkNCFAvailability = async () => {
    try {
      const ncfData = await getNextNCF(formData.tipo_ncf);
      if (ncfData.alerta) {
        setNcfAlert(ncfData.mensaje);
      } else {
        setNcfAlert(null);
      }
    } catch (err) {
      setError('Error al verificar disponibilidad de NCF');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'producto_id') {
      const product = products.find(p => p.id === parseInt(value));
      setCurrentItem(prev => ({
        ...prev,
        producto_id: value,
        precio_unitario: product ? product.precio_venta : '',
      }));
    } else {
      setCurrentItem(prev => ({ ...prev, [name]: value }));
    }
  };

  const addItem = () => {
    if (!currentItem.producto_id || !currentItem.cantidad || !currentItem.precio_unitario) {
      setError('Complete todos los campos del producto');
      return;
    }

    const product = products.find(p => p.id === parseInt(currentItem.producto_id));
    
    if (parseInt(currentItem.cantidad) > product.stock_actual) {
      setError(`Stock insuficiente. Disponible: ${product.stock_actual}`);
      return;
    }

    const newItem = {
      ...currentItem,
      product,
      cantidad: parseInt(currentItem.cantidad),
      precio_unitario: parseFloat(currentItem.precio_unitario),
      descuento: parseFloat(currentItem.descuento) || 0,
    };

    setItems([...items, newItem]);
    setCurrentItem({
      producto_id: '',
      cantidad: '1',
      precio_unitario: '',
      descuento: '0',
    });
    setError(null);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let itbis = 0;

    items.forEach(item => {
      const subtotal_item = (item.precio_unitario * item.cantidad) - item.descuento;
      subtotal += subtotal_item;

      if (item.product.itbis_aplicable) {
        const itbis_item = subtotal_item * (item.product.tasa_itbis / 100);
        itbis += itbis_item;
      }
    });

    const descuento_global = parseFloat(formData.descuento) || 0;
    const total = subtotal + itbis - descuento_global;

    return { subtotal, itbis, descuento_global, total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      setError('Debe agregar al menos un producto');
      return;
    }

    if (!formData.cliente_id) {
      setError('Debe seleccionar un cliente');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const invoiceData = {
        ...formData,
        items: items.map(item => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
          descuento: item.descuento,
        })),
      };

      const result = await createInvoice(invoiceData);
      
      setSuccess('Factura creada exitosamente');
      setTimeout(() => {
        navigate(`/invoices/${result.invoice.id}`);
      }, 2000);
    } catch (err) {
      console.error('Error al crear factura:', err);
      setError(err.response?.data?.message || 'Error al crear la factura');
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <Link
            to="/invoices"
            className="flex items-center text-green-600 hover:text-green-800"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver a Facturas
          </Link>
        </div>
        <div className="flex items-center space-x-3 mt-4">
          <ShoppingCart className="w-8 h-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900">Nueva Factura</h1>
        </div>
      </div>

      {/* Notificaciones */}
      {error && <Notification type="error" message={error} />}
      {success && <Notification type="success" message={success} />}
      {ncfAlert && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{ncfAlert}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información General */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Información General</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Select
                label="Cliente"
                name="cliente_id"
                value={formData.cliente_id}
                onChange={handleFormChange}
                options={[
                  { value: '', label: 'Seleccione un cliente' },
                  ...customers.map(c => ({
                    value: c.id,
                    label: `${c.codigo_cliente} - ${c.nombre_comercial}`,
                  }))
                ]}
                required
              />
            </div>
            <Select
              label="Tipo de Venta"
              name="tipo_venta"
              value={formData.tipo_venta}
              onChange={handleFormChange}
              options={[
                { value: 'contado', label: 'Contado' },
                { value: 'credito', label: 'Crédito' }
              ]}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Select
              label="Tipo de NCF"
              name="tipo_ncf"
              value={formData.tipo_ncf}
              onChange={handleFormChange}
              options={[
                { value: 'B01', label: 'B01 - Crédito Fiscal' },
                { value: 'B02', label: 'B02 - Consumo' },
                { value: 'B14', label: 'B14 - Regímenes Especiales' }
              ]}
              required
            />
            <Input
              label="Fecha de Emisión"
              name="fecha_emision"
              type="date"
              value={formData.fecha_emision}
              onChange={handleFormChange}
              required
            />
            {formData.tipo_venta === 'credito' && (
              <Input
                label="Fecha de Vencimiento"
                name="fecha_vencimiento"
                type="date"
                value={formData.fecha_vencimiento}
                onChange={handleFormChange}
                required
              />
            )}
          </div>
        </div>

        {/* Agregar Productos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Productos</h2>
          
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-5">
              <Select
                label="Producto"
                name="producto_id"
                value={currentItem.producto_id}
                onChange={handleItemChange}
                options={[
                  { value: '', label: 'Seleccione un producto' },
                  ...products.map(p => ({
                    value: p.id,
                    label: `${p.codigo} - ${p.nombre} (Stock: ${p.stock_actual})`,
                  }))
                ]}
              />
            </div>
            <div className="col-span-2">
              <Input
                label="Cantidad"
                name="cantidad"
                type="number"
                min="1"
                value={currentItem.cantidad}
                onChange={handleItemChange}
              />
            </div>
            <div className="col-span-2">
              <Input
                label="Precio"
                name="precio_unitario"
                type="number"
                step="0.01"
                value={currentItem.precio_unitario}
                onChange={handleItemChange}
              />
            </div>
            <div className="col-span-2">
              <Input
                label="Descuento"
                name="descuento"
                type="number"
                step="0.01"
                value={currentItem.descuento}
                onChange={handleItemChange}
              />
            </div>
            <div className="col-span-1 flex items-end">
              <Button
                type="button"
                onClick={addItem}
                className="w-full"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Lista de Items */}
          {items.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Cant.</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Precio</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Desc.</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">ITBIS</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Acción</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item, index) => {
                    const subtotal_item = (item.precio_unitario * item.cantidad) - item.descuento;
                    const itbis_item = item.product.itbis_aplicable 
                      ? subtotal_item * (item.product.tasa_itbis / 100) 
                      : 0;
                    
                    return (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          <div>
                            <div className="font-medium">{item.product.nombre}</div>
                            <div className="text-gray-500 text-xs">{item.product.codigo}</div>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-sm text-center">{item.cantidad}</td>
                        <td className="px-4 py-2 text-sm text-right">{formatCurrency(item.precio_unitario)}</td>
                        <td className="px-4 py-2 text-sm text-right">{formatCurrency(item.descuento)}</td>
                        <td className="px-4 py-2 text-sm text-center">
                          {item.product.itbis_aplicable ? `${item.product.tasa_itbis}%` : 'Exento'}
                        </td>
                        <td className="px-4 py-2 text-sm text-right font-semibold">
                          {formatCurrency(subtotal_item + itbis_item)}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Totales */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="max-w-md ml-auto space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold">{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">ITBIS (18%):</span>
              <span className="font-semibold">{formatCurrency(totals.itbis)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Descuento Global:</span>
              <input
                type="number"
                name="descuento"
                step="0.01"
                value={formData.descuento}
                onChange={handleFormChange}
                className="w-32 rounded-md border-gray-300 text-right p-1 border text-sm"
              />
            </div>
            <div className="border-t pt-3 flex justify-between text-lg">
              <span className="font-bold text-gray-900">TOTAL:</span>
              <span className="font-bold text-green-600">{formatCurrency(totals.total)}</span>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas
            </label>
            <textarea
              name="notas"
              value={formData.notas}
              onChange={handleFormChange}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
              placeholder="Información adicional de la factura..."
            />
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-end space-x-4">
          <Link to="/invoices">
            <Button type="button" variant="secondary">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading || items.length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Creando Factura...' : 'Crear Factura'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoicePage;