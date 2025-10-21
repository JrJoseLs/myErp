// // frontend/src/pages/Purchases.jsx - NUEVA PÁGINA

// import React, { useState, useEffect } from 'react';
// import { Plus, ShoppingCart, AlertCircle, FileText, Calendar } from 'lucide-react';
// import Modal from '../components/common/Modal';
// import Button from '../components/common/Button';
// import Notification from '../components/common/Notification';
// import { getPurchases, createPurchase } from '../services/purchaseService';
// import { getSuppliers } from '../services/supplierService';
// import { getProducts } from '../services/productService';
// import { formatCurrency, formatDate } from '../utils/formatters';
// import PurchaseForm from '../components/purchases/PurchaseForm';

// const PurchasesPage = () => {
//   const [purchases, setPurchases] = useState([]);
//   const [suppliers, setSuppliers] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [notification, setNotification] = useState({ message: '', type: '' });

//   useEffect(() => {
//     loadData();
//   }, []);

//   const loadData = async () => {
//     setLoading(true);
//     try {
//       const [purchasesData, suppliersData, productsData] = await Promise.all([
//         getPurchases(),
//         getSuppliers({ activo: true }),
//         getProducts({ activo: true }),
//       ]);

//       setPurchases(purchasesData.purchases || []);
//       setSuppliers(suppliersData.suppliers || []);
//       setProducts(productsData.products || []);
//     } catch (error) {
//       console.error('Error al cargar datos:', error);
//       showNotification('Error al cargar datos', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const showNotification = (message, type = 'info') => {
//     setNotification({ message, type });
//     setTimeout(() => setNotification({ message: '', type: '' }), 5000);
//   };

//   const handleCreate = () => {
//     setShowModal(true);
//   };

//   const handleSave = async (purchaseData) => {
//     try {
//       await createPurchase(purchaseData);
//       showNotification('✓ Compra registrada exitosamente. Inventario actualizado.', 'success');
//       setShowModal(false);
//       loadData();
//     } catch (error) {
//       console.error('Error al crear compra:', error);
//       showNotification(
//         error.response?.data?.message || '✗ Error al registrar compra',
//         'error'
//       );
//     }
//   };

//   const stats = {
//     total: purchases.length,
//     recibidas: purchases.filter(p => p.estado === 'recibida').length,
//     pendientes: purchases.filter(p => p.estado === 'pendiente').length,
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
//       {notification.message && (
//         <Notification message={notification.message} type={notification.type} />
//       )}

//       {/* Header */}
//       <div className="mb-8">
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center space-x-4">
//             <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
//               <ShoppingCart className="w-8 h-8 text-white" />
//             </div>
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">
//                 Gestión de Compras
//               </h1>
//               <p className="text-sm text-gray-500 mt-1">
//                 Registra compras con NCF para el Reporte 606 (DGII)
//               </p>
//             </div>
//           </div>

//           <Button
//             onClick={handleCreate}
//             className="flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-lg"
//           >
//             <Plus className="w-5 h-5" />
//             <span>Nueva Compra</span>
//           </Button>
//         </div>

//         {/* Alerta Importante */}
//         <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg mb-6">
//           <div className="flex items-start">
//             <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
//             <div className="text-sm text-amber-800">
//               <p className="font-semibold mb-1">⚠️ Requisitos para Reporte 606</p>
//               <ul className="list-disc list-inside space-y-1 ml-2">
//                 <li><strong>NCF del proveedor es OBLIGATORIO</strong></li>
//                 <li>El proveedor debe tener RNC o Cédula registrada</li>
//                 <li>El inventario se actualiza automáticamente al crear la compra</li>
//                 <li>Todas las compras con NCF aparecerán en el Reporte 606</li>
//               </ul>
//             </div>
//           </div>
//         </div>

//         {/* Stats */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//           <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600 mb-1">Total Compras</p>
//                 <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
//               </div>
//               <FileText className="w-10 h-10 text-orange-500 opacity-50" />
//             </div>
//           </div>

//           <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600 mb-1">Recibidas</p>
//                 <p className="text-3xl font-bold text-green-600">{stats.recibidas}</p>
//               </div>
//               <ShoppingCart className="w-10 h-10 text-green-500 opacity-50" />
//             </div>
//           </div>

//           <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600 mb-1">Pendientes</p>
//                 <p className="text-3xl font-bold text-yellow-600">{stats.pendientes}</p>
//               </div>
//               <Calendar className="w-10 h-10 text-yellow-500 opacity-50" />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Tabla de Compras */}
//       <div className="bg-white rounded-xl shadow-md overflow-hidden">
//         <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
//           <h3 className="text-lg font-bold text-gray-900">Historial de Compras</h3>
//         </div>

//         {loading ? (
//           <div className="p-8 text-center text-gray-500">Cargando compras...</div>
//         ) : purchases.length === 0 ? (
//           <div className="p-12 text-center">
//             <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-xl font-semibold text-gray-900 mb-2">
//               No hay compras registradas
//             </h3>
//             <p className="text-gray-600 mb-4">
//               Comienza registrando tu primera compra con NCF
//             </p>
//             <Button onClick={handleCreate}>
//               <Plus className="w-4 h-4 mr-2 inline" />
//               Nueva Compra
//             </Button>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
//                     Número
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
//                     Proveedor
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
//                     NCF
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
//                     Fecha
//                   </th>
//                   <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase">
//                     Total
//                   </th>
//                   <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">
//                     Estado
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {purchases.map((purchase) => (
//                   <tr key={purchase.id} className="hover:bg-gray-50">
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-gray-900">
//                       {purchase.numero_compra}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {purchase.supplier?.nombre_comercial}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-mono bg-orange-50 text-orange-800">
//                       {purchase.ncf_proveedor || 'SIN NCF'}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                       {formatDate(purchase.fecha_compra)}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-right text-gray-900">
//                       {formatCurrency(purchase.total)}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-center">
//                       <span
//                         className={`px-2 py-1 text-xs font-semibold rounded-full ${
//                           purchase.estado === 'recibida'
//                             ? 'bg-green-100 text-green-800'
//                             : purchase.estado === 'pendiente'
//                             ? 'bg-yellow-100 text-yellow-800'
//                             : 'bg-red-100 text-red-800'
//                         }`}
//                       >
//                         {purchase.estado.toUpperCase()}
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Modal de Formulario */}
//       {showModal && (
//         <Modal
//           isOpen={showModal}
//           onClose={() => setShowModal(false)}
//           title="Registrar Nueva Compra"
//           size="large"
//         >
//           <PurchaseForm
//             suppliers={suppliers}
//             products={products}
//             onSave={handleSave}
//             onCancel={() => setShowModal(false)}
//           />
//         </Modal>
//       )}
//     </div>
//   );
// };

// export default PurchasesPage;

// frontend/src/pages/Purchases.jsx - NUEVA PÁGINA
import React, { useState, useEffect } from 'react';
import { Plus, ShoppingCart, Package, Calendar, FileText } from 'lucide-react';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Notification from '../components/common/Notification';
import { getPurchases } from '../services/purchaseService';
import PurchaseForm from '../components/purchases/PurchaseForm';
import PurchaseList from '../components/purchases/PurchaseList';

const PurchasesPage = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    setLoading(true);
    try {
      const data = await getPurchases();
      setPurchases(data.purchases || []);
    } catch (error) {
      showNotification('Error al cargar compras', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 5000);
  };

  const handleCreate = () => {
    setShowModal(true);
  };

  const handleSave = async () => {
    setShowModal(false);
    loadPurchases();
    showNotification('✓ Compra registrada exitosamente', 'success');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {notification.message && (
        <Notification message={notification.message} type={notification.type} />
      )}

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Compras</h1>
              <p className="text-sm text-gray-500">Gestiona tus compras a proveedores</p>
            </div>
          </div>

          <Button
            onClick={handleCreate}
            className="flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-red-600"
          >
            <Plus className="w-5 h-5" />
            <span>Nueva Compra</span>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Listado de Compras</h2>
        {loading ? (
          <div className="text-center py-12">Cargando...</div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No hay compras registradas
          </div>
        ) : (
          <PurchaseList purchases={purchases} />
        )}
      </div>

      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Nueva Compra"
          size="large"
        >
          <PurchaseForm
            onSave={handleSave}
            onCancel={() => setShowModal(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default PurchasesPage;