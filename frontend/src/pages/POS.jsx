// frontend/src/pages/POS.jsx - VERSIÓN CORREGIDA Y MEJORADA

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getProducts } from '../services/productService';
import { 
  getCustomers, 
  getConsumidorFinal, 
  createQuickCustomer 
} from '../services/customerService';
import { createInvoice } from '../services/invoiceService';
import { getNextNCF } from '../services/ncfService';
import { formatCurrency } from '../utils/formatters';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  DollarSign,
  Search,
  LogOut,
  Printer,
  User,
  UserPlus,
  X,
  Package,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Button from '../components/common/Button';
import Notification from '../components/common/Notification';

const POSPage = () => {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [consumidorFinalId, setConsumidorFinalId] = useState(null);
  
  // Estados de carga y notificaciones
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [lastInvoice, setLastInvoice] = useState(null);
  const [ncfAvailable, setNcfAvailable] = useState(true);
  
  // Modales
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  
  // Nuevo cliente
  const [newCustomer, setNewCustomer] = useState({
    nombre_comercial: '',
    numero_identificacion: '',
    tipo_identificacion: 'CEDULA'
  });

  const searchInputRef = useRef(null);

  useEffect(() => {
    initializePOS();
  }, []);

  const initializePOS = async () => {
    setLoading(true);
    try {
      // 1. Cargar Consumidor Final
      const consumidorId = await getConsumidorFinal();
      setConsumidorFinalId(consumidorId);

      // 2. Cargar clientes
      const customersData = await getCustomers({ activo: true });
      setCustomers(customersData.customers || []);
      
      // 3. Establecer Consumidor Final como predeterminado
      const consumidor = customersData.customers.find(c => c.id === consumidorId);
      setSelectedCustomer(consumidor);

      // 4. Cargar productos
      const productsData = await getProducts({ activo: true });
      setProducts(productsData.products || []);

      // 5. Verificar disponibilidad de NCF
      await checkNCFAvailability();

      searchInputRef.current?.focus();
    } catch (err) {
      console.error('Error al inicializar POS:', err);
      setError(err.message || 'Error al inicializar el punto de venta');
    } finally {
      setLoading(false);
    }
  };

  const checkNCFAvailability = async () => {
    try {
      const ncfData = await getNextNCF('B02');
      if (ncfData.disponibles < 10) {
        setError(`⚠️ Quedan solo ${ncfData.disponibles} NCF disponibles. Solicite nuevos rangos.`);
      }
      setNcfAvailable(ncfData.disponibles > 0);
    } catch (err) {
      console.error('Error al verificar NCF:', err);
      setNcfAvailable(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.codigo.toLowerCase().includes(search.toLowerCase()) ||
    p.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCustomers = customers.filter(c =>
    c.codigo_cliente.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.nombre_comercial.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.numero_identificacion.includes(customerSearch)
  );

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.producto_id === product.id);
    
    if (existingItem) {
      if (existingItem.cantidad < product.stock_actual) {
        setCart(cart.map(item => 
          item.producto_id === product.id 
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        ));
      } else {
        setError(`Stock máximo: ${product.stock_actual}`);
        setTimeout(() => setError(null), 2000);
      }
    } else {
      if (product.stock_actual > 0) {
        setCart([...cart, {
          producto_id: product.id,
          product: product,
          cantidad: 1,
          precio_unitario: product.precio_venta,
          descuento: 0,
        }]);
      } else {
        setError('Producto sin stock');
        setTimeout(() => setError(null), 2000);
      }
    }
    
    setSearch('');
    searchInputRef.current?.focus();
  };

  const updateQuantity = (productId, change) => {
    setCart(cart.map(item => {
      if (item.producto_id === productId) {
        const newQty = item.cantidad + change;
        if (newQty <= 0) return null;
        if (newQty > item.product.stock_actual) {
          setError(`Stock máximo: ${item.product.stock_actual}`);
          setTimeout(() => setError(null), 2000);
          return item;
        }
        return { ...item, cantidad: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.producto_id !== productId));
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let itbis = 0;

    cart.forEach(item => {
      const subtotal_item = item.precio_unitario * item.cantidad;
      subtotal += subtotal_item;
      if (item.product.itbis_aplicable) {
        itbis += subtotal_item * (item.product.tasa_itbis / 100);
      }
    });

    return { subtotal, itbis, total: subtotal + itbis };
  };

  const handleCheckout = async (tipo_venta = 'contado') => {
    if (cart.length === 0) {
      setError('El carrito está vacío');
      return;
    }

    if (!selectedCustomer) {
      setError('Debe seleccionar un cliente');
      return;
    }

    if (!ncfAvailable) {
      setError('No hay NCF disponibles. No se puede procesar la venta.');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const invoiceData = {
        cliente_id: selectedCustomer.id,
        tipo_ncf: 'B02', // Consumo
        fecha_emision: new Date().toISOString().split('T')[0],
        tipo_venta,
        moneda: 'DOP',
        descuento: 0,
        notas: `Venta POS - Usuario: ${user?.nombre_completo}`,
        items: cart.map(item => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
          descuento: item.descuento,
        })),
      };

      const result = await createInvoice(invoiceData);
      
      setSuccess(`✅ Venta #${result.invoice.numero_factura} registrada exitosamente`);
      setLastInvoice(result.invoice);
      setCart([]);
      
      // Restablecer al Consumidor Final si no lo era
      if (selectedCustomer.id !== consumidorFinalId) {
        const consumidor = customers.find(c => c.id === consumidorFinalId);
        setSelectedCustomer(consumidor);
      }
      
      setTimeout(() => setSuccess(null), 5000);
      
      // Recargar productos para actualizar stock
      const productsData = await getProducts({ activo: true });
      setProducts(productsData.products || []);
      
      // Verificar NCF después de cada venta
      await checkNCFAvailability();
      
    } catch (err) {
      console.error('Error al crear venta:', err);
      setError(err.response?.data?.message || 'Error al registrar la venta');
    } finally {
      setProcessing(false);
      searchInputRef.current?.focus();
    }
  };

  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(false);
    setCustomerSearch('');
    searchInputRef.current?.focus();
  };

  const handleCreateCustomer = async () => {
    if (!newCustomer.nombre_comercial || !newCustomer.numero_identificacion) {
      setError('Complete todos los campos obligatorios');
      return;
    }

    try {
      const customer = await createQuickCustomer(newCustomer);
      
      // Actualizar lista de clientes
      const customersData = await getCustomers({ activo: true });
      setCustomers(customersData.customers || []);
      
      setSelectedCustomer(customer);
      setSuccess(`Cliente ${customer.nombre_comercial} creado exitosamente`);
      setTimeout(() => setSuccess(null), 3000);
      
      setShowNewCustomerModal(false);
      setNewCustomer({ 
        nombre_comercial: '', 
        numero_identificacion: '', 
        tipo_identificacion: 'CEDULA' 
      });
      searchInputRef.current?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear cliente');
    }
  };

  const totals = calculateTotals();

  // Atajos de teclado
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'F1') {
        e.preventDefault();
        handleCheckout('contado');
      }
      if (e.key === 'F2') {
        e.preventDefault();
        setCart([]);
      }
      if (e.key === 'F3') {
        e.preventDefault();
        setShowCustomerModal(true);
      }
      if (e.key === 'F4') {
        e.preventDefault();
        setShowNewCustomerModal(true);
      }
      if (e.key === 'Escape') {
        setSearch('');
        setShowCustomerModal(false);
        setShowNewCustomerModal(false);
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [cart, selectedCustomer]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-gray-600">Cargando Punto de Venta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Panel Izquierdo - Productos */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Punto de Venta</h1>
              <p className="text-sm text-gray-600">{user?.nombre_completo} - {user?.rol}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Salir</span>
            </button>
          </div>
        </div>

        {/* Notificaciones */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded-r-lg">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <p className="ml-3 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4 rounded-r-lg">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <p className="ml-3 text-sm text-green-700">{success}</p>
            </div>
          </div>
        )}

        {/* Cliente Seleccionado */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Cliente:</p>
                <p className="font-semibold text-gray-900">
                  {selectedCustomer?.nombre_comercial || 'Sin seleccionar'}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedCustomer?.numero_identificacion || ''}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowCustomerModal(true)}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Cambiar (F3)
              </button>
              <button
                onClick={() => setShowNewCustomerModal(true)}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center space-x-1"
              >
                <UserPlus className="w-4 h-4" />
                <span>Nuevo (F4)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Buscador */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar producto por código o nombre (ESC para limpiar)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border text-lg"
            />
          </div>
        </div>

        {/* Grid Productos */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              disabled={product.stock_actual === 0}
              className={`bg-white rounded-lg shadow-md p-4 text-left hover:shadow-lg transition ${
                product.stock_actual === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-2 hover:border-blue-500'
              }`}
            >
              <p className="text-xs text-gray-500 mb-1">{product.codigo}</p>
              <p className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
                {product.nombre}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(product.precio_venta)}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  product.stock_actual === 0 
                    ? 'bg-red-100 text-red-800'
                    : product.stock_actual <= product.stock_minimo 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {product.stock_actual} {product.unidad_medida}
                </span>
              </div>
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No se encontraron productos</p>
          </div>
        )}
      </div>

      {/* Panel Derecho - Carrito */}
      <div className="w-96 bg-white shadow-xl flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <ShoppingCart className="w-6 h-6 mr-2 text-blue-600" />
              Carrito
            </h2>
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {cart.length} items
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Carrito vacío</p>
              <p className="text-sm">Agrega productos para comenzar</p>
            </div>
          ) : (
            cart.map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">
                      {item.product.nombre}
                    </p>
                    <p className="text-xs text-gray-500">{item.product.codigo}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.producto_id)}
                    className="text-red-600 hover:text-red-800 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.producto_id, -1)}
                      className="bg-white border border-gray-300 rounded p-1 hover:bg-gray-100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-semibold">
                      {item.cantidad}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.producto_id, 1)}
                      className="bg-white border border-gray-300 rounded p-1 hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(item.precio_unitario * item.cantidad)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold">{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">ITBIS (18%):</span>
              <span className="font-semibold">{formatCurrency(totals.itbis)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold border-t pt-2">
              <span>TOTAL:</span>
              <span className="text-green-600">{formatCurrency(totals.total)}</span>
            </div>
          </div>
        )}

        <div className="border-t p-4 space-y-2">
          <Button
            onClick={() => handleCheckout('contado')}
            disabled={cart.length === 0 || processing || !ncfAvailable}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-lg py-3 flex items-center justify-center space-x-2 font-semibold"
          >
            <DollarSign className="w-5 h-5" />
            <span>{processing ? 'Procesando...' : 'Cobrar (F1)'}</span>
          </Button>
          
          <Button
            onClick={() => setCart([])}
            disabled={cart.length === 0}
            variant="secondary"
            className="w-full flex items-center justify-center space-x-2"
          >
            <Trash2 className="w-5 h-5" />
            <span>Limpiar (F2)</span>
          </Button>

          {lastInvoice && (
            <button
              onClick={() => window.open(`/invoices/${lastInvoice.id}`, '_blank')}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Ver Última Venta</span>
            </button>
          )}
        </div>

        <div className="border-t p-3 bg-gray-50">
          <p className="text-xs text-gray-600 text-center">
            <strong>Atajos:</strong> F1=Cobrar | F2=Limpiar | F3=Cliente | F4=Nuevo | ESC=Buscar
          </p>
        </div>
      </div>

      {/* Modal Selector de Cliente */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold">Seleccionar Cliente</h3>
              <button 
                onClick={() => setShowCustomerModal(false)} 
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 border-b">
              <input
                type="text"
                placeholder="Buscar cliente por nombre, código o identificación..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full p-2 border rounded"
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <User className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>No se encontraron clientes</p>
                </div>
              ) : (
                filteredCustomers.map(customer => (
                  <button
                    key={customer.id}
                    onClick={() => selectCustomer(customer)}
                    className={`w-full p-3 mb-2 border rounded hover:bg-blue-50 text-left transition ${
                      selectedCustomer?.id === customer.id ? 'bg-blue-100 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">{customer.nombre_comercial}</p>
                        <p className="text-sm text-gray-600">
                          {customer.codigo_cliente} | {customer.tipo_identificacion}: {customer.numero_identificacion}
                        </p>
                      </div>
                      {customer.id === consumidorFinalId && (
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                          Por defecto
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Cliente */}
      {showNewCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold">Nuevo Cliente Rápido</h3>
              <button 
                onClick={() => setShowNewCustomerModal(false)} 
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nombre / Razón Social <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCustomer.nombre_comercial}
                  onChange={(e) => setNewCustomer({...newCustomer, nombre_comercial: e.target.value})}
                  className="w-full p-2 border rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Juan Pérez"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Identificación</label>
                <select
                  value={newCustomer.tipo_identificacion}
                  onChange={(e) => setNewCustomer({...newCustomer, tipo_identificacion: e.target.value})}
                  className="w-full p-2 border rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="CEDULA">Cédula</option>
                  <option value="RNC">RNC</option>
                  <option value="PASAPORTE">Pasaporte</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Número <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCustomer.numero_identificacion}
                  onChange={(e) => setNewCustomer({...newCustomer, numero_identificacion: e.target.value})}
                  className="w-full p-2 border rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder={
                    newCustomer.tipo_identificacion === 'CEDULA' 
                      ? '000-0000000-0' 
                      : newCustomer.tipo_identificacion === 'RNC'
                      ? '0-00-00000-0'
                      : 'Número de pasaporte'
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  {newCustomer.tipo_identificacion === 'CEDULA' && '11 dígitos sin guiones'}
                  {newCustomer.tipo_identificacion === 'RNC' && '9 u 11 dígitos sin guiones'}
                </p>
              </div>
            </div>

            <div className="p-4 border-t flex space-x-2">
              <button
                onClick={() => setShowNewCustomerModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateCustomer}
                disabled={!newCustomer.nombre_comercial || !newCustomer.numero_identificacion}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                Crear Cliente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSPage;