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

// frontend/src/pages/POS.jsx - Punto de Venta Rápido

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getProducts } from '../services/productService';
import { getConsumidorFinal } from '../services/customerService';
import { createInvoice } from '../services/invoiceService';
import { formatCurrency } from '../utils/formatters';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  DollarSign, 
  Search,
  LogOut,
  Printer
} from 'lucide-react';
import Button from '../components/common/Button';
import Notification from '../components/common/Notification';

const POSPage = () => {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [lastInvoice, setLastInvoice] = useState(null);
  const searchInputRef = useRef(null);
  
  // ✅ Estado para el ID del consumidor final
  const [consumidorFinalId, setConsumidorFinalId] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    initializePOS();
  }, []);

  const initializePOS = async () => {
    setIsInitializing(true);
    try {
      // Cargar cliente Consumidor Final y productos en paralelo
      const [id, productsData] = await Promise.all([
        getConsumidorFinal(),
        getProducts({ activo: true, limit: 100 })
      ]);
      
      setConsumidorFinalId(id);
      setProducts(productsData.products || []);
      
      // Focus automático en búsqueda
      searchInputRef.current?.focus();
    } catch (err) {
      console.error('Error al inicializar POS:', err);
      setError(err.message || 'Error al inicializar el punto de venta. Verifique que el cliente CONSUMIDOR FINAL esté configurado.');
    } finally {
      setIsInitializing(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.codigo.toLowerCase().includes(search.toLowerCase()) ||
    p.nombre.toLowerCase().includes(search.toLowerCase())
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
    
    // Limpiar búsqueda y hacer focus
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

    if (!consumidorFinalId) {
      setError('Cliente Consumidor Final no configurado. Contacte al administrador.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const invoiceData = {
        cliente_id: consumidorFinalId,
        tipo_ncf: 'B02', // Consumo
        fecha_emision: new Date().toISOString().split('T')[0],
        tipo_venta,
        moneda: 'DOP',
        descuento: 0,
        notas: 'Venta realizada desde Punto de Venta (POS)',
        items: cart.map(item => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
          descuento: item.descuento,
        })),
      };

      const result = await createInvoice(invoiceData);
      
      setSuccess('✅ Venta registrada exitosamente');
      setLastInvoice(result.invoice);
      setCart([]);
      setTimeout(() => setSuccess(null), 3000);
      
      // Recargar productos para actualizar stock
      await initializePOS();
    } catch (err) {
      console.error('Error al crear venta:', err);
      
      // Manejo de errores específicos
      if (err.isNetworkError) {
        setError('❌ Sin conexión al servidor. Verifique su red.');
      } else if (err.isTimeout) {
        setError('❌ La operación tardó demasiado. Intente nuevamente.');
      } else {
        setError(err.response?.data?.message || 'Error al registrar la venta');
      }
    } finally {
      setLoading(false);
      searchInputRef.current?.focus();
    }
  };

  const totals = calculateTotals();

  // Atajos de teclado
  useEffect(() => {
    const handleKeyPress = (e) => {
      // F1: Cobrar (Efectivo)
      if (e.key === 'F1') {
        e.preventDefault();
        handleCheckout('contado');
      }
      // F2: Limpiar carrito
      if (e.key === 'F2') {
        e.preventDefault();
        setCart([]);
      }
      // ESC: Limpiar búsqueda
      if (e.key === 'Escape') {
        setSearch('');
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [cart]);

  // Mostrar pantalla de carga mientras se inicializa
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Iniciando Punto de Venta...</p>
        </div>
      </div>
    );
  }

  // Mostrar error crítico si no se pudo inicializar
  if (!consumidorFinalId && !isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error de Configuración</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={initializePOS}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
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
              <p className="text-sm text-gray-600">{user?.nombre_completo}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Salir</span>
            </button>
          </div>
        </div>

        {/* Notificaciones */}
        {error && <Notification type="error" message={error} />}
        {success && <Notification type="success" message={success} />}

        {/* Buscador */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar por código o nombre (ESC para limpiar)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className