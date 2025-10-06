// // frontend/src/pages/POS.jsx - Punto de Venta Rápido

// import React, { useState, useEffect, useRef } from 'react';
// import { useAuth } from '../hooks/useAuth';
// import { getProducts } from '../services/productService';
// import { createInvoice } from '../services/invoiceService';
// import { formatCurrency } from '../utils/formatters';
// import { 
//   ShoppingCart, 
//   Plus, 
//   Minus, 
//   Trash2, 
//   DollarSign, 
//   CreditCard,
//   Search,
//   LogOut,
//   Printer
// } from 'lucide-react';
// import Button from '../components/common/Button';
// import Notification from '../components/common/Notification';

// const POSPage = () => {
//   const { user, logout } = useAuth();
//   const [products, setProducts] = useState([]);
//   const [cart, setCart] = useState([]);
//   const [search, setSearch] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);
//   const [lastInvoice, setLastInvoice] = useState(null);
//   const searchInputRef = useRef(null);

//   // ID del cliente "Consumidor Final" (ajustar según tu DB)
//   const CONSUMIDOR_FINAL_ID = 1;

//   useEffect(() => {
//     loadProducts();
//     // Focus automático en búsqueda
//     searchInputRef.current?.focus();
//   }, []);

//   const loadProducts = async () => {
//     try {
//       const data = await getProducts({ activo: true, limit: 100 });
//       setProducts(data.products || []);
//     } catch (err) {
//       setError('Error al cargar productos');
//     }
//   };

//   const filteredProducts = products.filter(p => 
//     p.codigo.toLowerCase().includes(search.toLowerCase()) ||
//     p.nombre.toLowerCase().includes(search.toLowerCase())
//   );

//   const addToCart = (product) => {
//     const existingItem = cart.find(item => item.producto_id === product.id);
    
//     if (existingItem) {
//       if (existingItem.cantidad < product.stock_actual) {
//         setCart(cart.map(item => 
//           item.producto_id === product.id 
//             ? { ...item, cantidad: item.cantidad + 1 }
//             : item
//         ));
//       } else {
//         setError(`Stock máximo: ${product.stock_actual}`);
//         setTimeout(() => setError(null), 2000);
//       }
//     } else {
//       if (product.stock_actual > 0) {
//         setCart([...cart, {
//           producto_id: product.id,
//           product: product,
//           cantidad: 1,
//           precio_unitario: product.precio_venta,
//           descuento: 0,
//         }]);
//       } else {
//         setError('Producto sin stock');
//         setTimeout(() => setError(null), 2000);
//       }
//     }
    
//     // Limpiar búsqueda y hacer focus
//     setSearch('');
//     searchInputRef.current?.focus();
//   };

//   const updateQuantity = (productId, change) => {
//     setCart(cart.map(item => {
//       if (item.producto_id === productId) {
//         const newQty = item.cantidad + change;
//         if (newQty <= 0) return null;
//         if (newQty > item.product.stock_actual) {
//           setError(`Stock máximo: ${item.product.stock_actual}`);
//           setTimeout(() => setError(null), 2000);
//           return item;
//         }
//         return { ...item, cantidad: newQty };
//       }
//       return item;
//     }).filter(Boolean));
//   };

//   const removeFromCart = (productId) => {
//     setCart(cart.filter(item => item.producto_id !== productId));
//   };

//   const calculateTotals = () => {
//     let subtotal = 0;
//     let itbis = 0;

//     cart.forEach(item => {
//       const subtotal_item = item.precio_unitario * item.cantidad;
//       subtotal += subtotal_item;

//       if (item.product.itbis_aplicable) {
//         itbis += subtotal_item * (item.product.tasa_itbis / 100);
//       }
//     });

//     return { subtotal, itbis, total: subtotal + itbis };
//   };

//   const handleCheckout = async (tipo_venta = 'contado') => {
//     if (cart.length === 0) {
//       setError('El carrito está vacío');
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const invoiceData = {
//         cliente_id: CONSUMIDOR_FINAL_ID,
//         tipo_ncf: 'B02', // Consumo
//         fecha_emision: new Date().toISOString().split('T')[0],
//         tipo_venta,
//         moneda: 'DOP',
//         descuento: 0,
//         notas: 'Venta POS',
//         items: cart.map(item => ({
//           producto_id: item.producto_id,
//           cantidad: item.cantidad,
//           precio_unitario: item.precio_unitario,
//           descuento: item.descuento,
//         })),
//       };

//       const result = await createInvoice(invoiceData);
      
//       setSuccess('Venta registrada exitosamente');
//       setLastInvoice(result.invoice);
//       setCart([]);
//       setTimeout(() => setSuccess(null), 3000);
      
//       // Recargar productos para actualizar stock
//       loadProducts();
//     } catch (err) {
//       console.error('Error al crear venta:', err);
//       setError(err.response?.data?.message || 'Error al registrar la venta');
//     } finally {
//       setLoading(false);
//       searchInputRef.current?.focus();
//     }
//   };

//   const totals = calculateTotals();

//   // Atajos de teclado
//   useEffect(() => {
//     const handleKeyPress = (e) => {
//       // F1: Cobrar (Efectivo)
//       if (e.key === 'F1') {
//         e.preventDefault();
//         handleCheckout('contado');
//       }
//       // F2: Limpiar carrito
//       if (e.key === 'F2') {
//         e.preventDefault();
//         setCart([]);
//       }
//       // ESC: Limpiar búsqueda
//       if (e.key === 'Escape') {
//         setSearch('');
//         searchInputRef.current?.focus();
//       }
//     };

//     window.addEventListener('keydown', handleKeyPress);
//     return () => window.removeEventListener('keydown', handleKeyPress);
//   }, [cart]);

//   return (
//     <div className="min-h-screen bg-gray-50 flex">
//       {/* Panel Izquierdo - Productos */}
//       <div className="flex-1 p-4 overflow-y-auto">
//         {/* Header */}
//         <div className="bg-white rounded-lg shadow-md p-4 mb-4">
//           <div className="flex justify-between items-center">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">Punto de Venta</h1>
//               <p className="text-sm text-gray-600">{user?.nombre_completo}</p>
//             </div>
//             <button
//               onClick={logout}
//               className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
//             >
//               <LogOut className="w-4 h-4" />
//               <span className="text-sm">Salir</span>
//             </button>
//           </div>
//         </div>

//         {/* Notificaciones */}
//         {error && <Notification type="error" message={error} />}
//         {success && <Notification type="success" message={success} />}

//         {/* Buscador */}
//         <div className="bg-white rounded-lg shadow-md p-4 mb-4">
//           <div className="relative">
//             <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
//             <input
//               ref={searchInputRef}
//               type="text"
//               placeholder="Buscar por código o nombre (ESC para limpiar)..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border text-lg"
//               autoFocus
//             />
//           </div>
//         </div>

//         {/* Grid de Productos */}
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
//           {filteredProducts.map(product => (
//             <button
//               key={product.id}
//               onClick={() => addToCart(product)}
//               disabled={product.stock_actual === 0}
//               className={`bg-white rounded-lg shadow-md p-4 text-left hover:shadow-lg transition ${
//                 product.stock_actual === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
//               }`}
//             >
//               <p className="text-xs text-gray-500 mb-1">{product.codigo}</p>
//               <p className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
//                 {product.nombre}
//               </p>
//               <div className="flex justify-between items-center">
//                 <span className="text-lg font-bold text-green-600">
//                   {formatCurrency(product.precio_venta)}
//                 </span>
//                 <span className={`text-xs px-2 py-1 rounded ${
//                   product.stock_actual <= product.stock_minimo 
//                     ? 'bg-red-100 text-red-800' 
//                     : 'bg-green-100 text-green-800'
//                 }`}>
//                   Stock: {product.stock_actual}
//                 </span>
//               </div>
//             </button>
//           ))}
//         </div>

//         {filteredProducts.length === 0 && (
//           <div className="text-center py-12 text-gray-500">
//             <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
//             <p>No se encontraron productos</p>
//           </div>
//         )}
//       </div>

//       {/* Panel Derecho - Carrito */}
//       <div className="w-96 bg-white shadow-xl flex flex-col">
//         {/* Carrito Header */}
//         <div className="p-4 border-b">
//           <div className="flex items-center justify-between">
//             <h2 className="text-xl font-bold text-gray-900 flex items-center">
//               <ShoppingCart className="w-6 h-6 mr-2 text-blue-600" />
//               Carrito
//             </h2>
//             <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
//               {cart.length} items
//             </span>
//           </div>
//         </div>

//         {/* Items del Carrito */}
//         <div className="flex-1 overflow-y-auto p-4 space-y-3">
//           {cart.length === 0 ? (
//             <div className="text-center py-12 text-gray-400">
//               <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-30" />
//               <p>Carrito vacío</p>
//               <p className="text-sm">Agrega productos para comenzar</p>
//             </div>
//           ) : (
//             cart.map((item, index) => (
//               <div key={index} className="bg-gray-50 rounded-lg p-3">
//                 <div className="flex justify-between items-start mb-2">
//                   <div className="flex-1">
//                     <p className="font-semibold text-gray-900 text-sm">
//                       {item.product.nombre}
//                     </p>
//                     <p className="text-xs text-gray-500">{item.product.codigo}</p>
//                   </div>
//                   <button
//                     onClick={() => removeFromCart(item.producto_id)}
//                     className="text-red-600 hover:text-red-800 ml-2"
//                   >
//                     <Trash2 className="w-4 h-4" />
//                   </button>
//                 </div>
                
//                 <div className="flex justify-between items-center">
//                   <div className="flex items-center space-x-2">
//                     <button
//                       onClick={() => updateQuantity(item.producto_id, -1)}
//                       className="bg-white border border-gray-300 rounded p-1 hover:bg-gray-100"
//                     >
//                       <Minus className="w-4 h-4" />
//                     </button>
//                     <span className="w-12 text-center font-semibold">
//                       {item.cantidad}
//                     </span>
//                     <button
//                       onClick={() => updateQuantity(item.producto_id, 1)}
//                       className="bg-white border border-gray-300 rounded p-1 hover:bg-gray-100"
//                     >
//                       <Plus className="w-4 h-4" />
//                     </button>
//                   </div>
//                   <span className="font-bold text-gray-900">
//                     {formatCurrency(item.precio_unitario * item.cantidad)}
//                   </span>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>

//         {/* Totales */}
//         {cart.length > 0 && (
//           <div className="border-t p-4 space-y-2">
//             <div className="flex justify-between text-sm">
//               <span className="text-gray-600">Subtotal:</span>
//               <span className="font-semibold">{formatCurrency(totals.subtotal)}</span>
//             </div>
//             <div className="flex justify-between text-sm">
//               <span className="text-gray-600">ITBIS (18%):</span>
//               <span className="font-semibold">{formatCurrency(totals.itbis)}</span>
//             </div>
//             <div className="flex justify-between text-xl font-bold border-t pt-2">
//               <span>TOTAL:</span>
//               <span className="text-green-600">{formatCurrency(totals.total)}</span>
//             </div>
//           </div>
//         )}

//         {/* Botones de Acción */}
//         <div className="border-t p-4 space-y-2">
//           <Button
//             onClick={() => handleCheckout('contado')}
//             disabled={cart.length === 0 || loading}
//             className="w-full bg-green-600 hover:bg-green-700 text-lg py-3 flex items-center justify-center space-x-2"
//           >
//             <DollarSign className="w-5 h-5" />
//             <span>{loading ? 'Procesando...' : 'Cobrar (F1)'}</span>
//           </Button>
          
//           <Button
//             onClick={() => setCart([])}
//             disabled={cart.length === 0}
//             variant="secondary"
//             className="w-full flex items-center justify-center space-x-2"
//           >
//             <Trash2 className="w-5 h-5" />
//             <span>Limpiar (F2)</span>
//           </Button>

//           {lastInvoice && (
//             <button
//               onClick={() => window.open(`/invoices/${lastInvoice.id}`, '_blank')}
//               className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
//             >
//               <Printer className="w-4 h-4" />
//               <span>Imprimir Última Venta</span>
//             </button>
//           )}
//         </div>

//         {/* Atajos de Teclado */}
//         <div className="border-t p-3 bg-gray-50">
//           <p className="text-xs text-gray-600 text-center">
//             <strong>Atajos:</strong> F1=Cobrar | F2=Limpiar | ESC=Buscar
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default POSPage;

import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCart, Plus, Minus, Trash2, DollarSign, Search,
  LogOut, Printer, User, UserPlus, X, Package
} from 'lucide-react';

// Simulación de datos (reemplazar con tus servicios reales)
const mockProducts = [
  { id: 1, codigo: 'PROD-001', nombre: 'Martillo 16oz', precio_venta: 350, stock_actual: 50, itbis_aplicable: true, tasa_itbis: 18, unidad_medida: 'UND' },
  { id: 2, codigo: 'PROD-002', nombre: 'Destornillador Plano', precio_venta: 180, stock_actual: 75, itbis_aplicable: true, tasa_itbis: 18, unidad_medida: 'UND' },
  { id: 3, codigo: 'PROD-003', nombre: 'Clavos 3"', precio_venta: 65, stock_actual: 200, itbis_aplicable: true, tasa_itbis: 18, unidad_medida: 'LB' },
];

const mockCustomers = [
  { id: 1, codigo_cliente: 'CLI-00000', nombre_comercial: 'CONSUMIDOR FINAL', numero_identificacion: '00000000000', tipo_identificacion: 'CEDULA' },
  { id: 2, codigo_cliente: 'CLI-00001', nombre_comercial: 'Juan Pérez', numero_identificacion: '00112345678', tipo_identificacion: 'CEDULA' },
  { id: 3, codigo_cliente: 'CLI-00002', nombre_comercial: 'Constructora ABC', numero_identificacion: '131234567', tipo_identificacion: 'RNC' },
];

const formatCurrency = (amount) => {
  return `RD$ ${parseFloat(amount).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const POSMejorado = () => {
  const [products] = useState(mockProducts);
  const [customers] = useState(mockCustomers);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(mockCustomers[0]); // Consumidor Final por defecto
  
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
    searchInputRef.current?.focus();
  }, []);

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
        if (newQty > item.product.stock_actual) return item;
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

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    alert(`Venta procesada:\nCliente: ${selectedCustomer.nombre_comercial}\nTotal: ${formatCurrency(totals.total)}`);
    setCart([]);
    searchInputRef.current?.focus();
  };

  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(false);
    setCustomerSearch('');
    searchInputRef.current?.focus();
  };

  const handleCreateCustomer = () => {
    if (!newCustomer.nombre_comercial || !newCustomer.numero_identificacion) {
      alert('Complete todos los campos');
      return;
    }

    const customer = {
      id: customers.length + 1,
      codigo_cliente: `CLI-${String(customers.length).padStart(5, '0')}`,
      ...newCustomer
    };

    alert(`Cliente creado: ${customer.nombre_comercial}`);
    setSelectedCustomer(customer);
    setShowNewCustomerModal(false);
    setNewCustomer({ nombre_comercial: '', numero_identificacion: '', tipo_identificacion: 'CEDULA' });
    searchInputRef.current?.focus();
  };

  const totals = calculateTotals();

  // Atajos de teclado
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'F1') {
        e.preventDefault();
        handleCheckout();
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Panel Izquierdo - Productos */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Punto de Venta</h1>
              <p className="text-sm text-gray-600">Usuario Demo</p>
            </div>
            <button className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
              <LogOut className="w-4 h-4" />
              <span>Salir</span>
            </button>
          </div>
        </div>

        {/* Cliente Seleccionado */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Cliente:</p>
                <p className="font-semibold text-gray-900">{selectedCustomer.nombre_comercial}</p>
                <p className="text-xs text-gray-500">{selectedCustomer.numero_identificacion}</p>
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
                product.stock_actual === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <p className="text-xs text-gray-500 mb-1">{product.codigo}</p>
              <p className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">{product.nombre}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-green-600">{formatCurrency(product.precio_venta)}</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  product.stock_actual <= 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  Stock: {product.stock_actual}
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
                    <p className="font-semibold text-gray-900 text-sm">{item.product.nombre}</p>
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
                    <span className="w-12 text-center font-semibold">{item.cantidad}</span>
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
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-lg py-3 rounded-lg flex items-center justify-center space-x-2 font-semibold"
          >
            <DollarSign className="w-5 h-5" />
            <span>Cobrar (F1)</span>
          </button>
          
          <button
            onClick={() => setCart([])}
            disabled={cart.length === 0}
            className="w-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 py-2 rounded-lg flex items-center justify-center space-x-2"
          >
            <Trash2 className="w-5 h-5" />
            <span>Limpiar (F2)</span>
          </button>
        </div>

        <div className="border-t p-3 bg-gray-50">
          <p className="text-xs text-gray-600 text-center">
            <strong>Atajos:</strong> F1=Cobrar | F2=Limpiar | F3=Cliente | F4=Nuevo Cliente | ESC=Buscar
          </p>
        </div>
      </div>

      {/* Modal Selector de Cliente */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold">Seleccionar Cliente</h3>
              <button onClick={() => setShowCustomerModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 border-b">
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full p-2 border rounded"
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {filteredCustomers.map(customer => (
                <button
                  key={customer.id}
                  onClick={() => selectCustomer(customer)}
                  className="w-full p-3 mb-2 border rounded hover:bg-blue-50 text-left"
                >
                  <p className="font-semibold">{customer.nombre_comercial}</p>
                  <p className="text-sm text-gray-600">
                    {customer.codigo_cliente} | {customer.tipo_identificacion}: {customer.numero_identificacion}
                  </p>
                </button>
              ))}
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
              <button onClick={() => setShowNewCustomerModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre / Razón Social *</label>
                <input
                  type="text"
                  value={newCustomer.nombre_comercial}
                  onChange={(e) => setNewCustomer({...newCustomer, nombre_comercial: e.target.value})}
                  className="w-full p-2 border rounded"
                  placeholder="Juan Pérez"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <select
                  value={newCustomer.tipo_identificacion}
                  onChange={(e) => setNewCustomer({...newCustomer, tipo_identificacion: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="CEDULA">Cédula</option>
                  <option value="RNC">RNC</option>
                  <option value="PASAPORTE">Pasaporte</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Número *</label>
                <input
                  type="text"
                  value={newCustomer.numero_identificacion}
                  onChange={(e) => setNewCustomer({...newCustomer, numero_identificacion: e.target.value})}
                  className="w-full p-2 border rounded"
                  placeholder={newCustomer.tipo_identificacion === 'CEDULA' ? '000-0000000-0' : '0-00-00000-0'}
                />
              </div>
            </div>

            <div className="p-4 border-t flex space-x-2">
              <button
                onClick={() => setShowNewCustomerModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateCustomer}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
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

export default POSMejorado;