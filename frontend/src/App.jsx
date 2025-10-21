// // frontend/src/App.jsx

// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
// } from 'react-router-dom';
// import { AuthProvider, useAuth } from './hooks/useAuth';

// // Páginas
// import LoginPage from './pages/Login';
// import DashboardPage from './pages/Dashboard';
// import InventoryPage from './pages/Inventory';
// import CustomersPage from './pages/Customers';
// import InvoicesPage from './pages/Invoices';
// import CreateInvoicePage from './pages/CreateInvoice';
// import InvoiceDetailPage from './pages/InvoiceDetail';
// import SalesPage from './pages/Sales';
// import ProvidersPage from './pages/Providers';
// import ReportsPage from './pages/Reports';
// import SettingsPage from './pages/Settings';
// import POSPage from './pages/POS';
// import Suppliers from './pages/Suppliers';

// // Componente de ruta protegida
// const ProtectedRoute = ({ children }) => {
//   const { user, loading } = useAuth();

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="text-lg text-indigo-600">Cargando sesión...</div>
//       </div>
//     );
//   }

//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// };

// function App() {
//   return (
//     <Router>
//       <AuthProvider>
//         <Routes>
//           {/* Ruta Pública */}
//           <Route path="/login" element={<LoginPage />} />

//           {/* Rutas Protegidas */}
//           <Route
//             path="/"
//             element={
//               <ProtectedRoute>
//                 <DashboardPage />
//               </ProtectedRoute>
//             }
//           />

//           {/* Inventario */}
//           <Route
//             path="/inventory"
//             element={
//               <ProtectedRoute>
//                 <InventoryPage />
//               </ProtectedRoute>
//             }
//           />

//           {/* Clientes */}
//           <Route
//             path="/customers"
//             element={
//               <ProtectedRoute>
//                 <CustomersPage />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/suppliers"
//             element={
//               <ProtectedRoute>
//                 <Suppliers />
//               </ProtectedRoute>
//             }
//           />

//           {/* Facturas */}
//           <Route
//             path="/invoices"
//             element={
//               <ProtectedRoute>
//                 <InvoicesPage />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/invoices/create"
//             element={
//               <ProtectedRoute>
//                 <CreateInvoicePage />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/invoices/:id"
//             element={
//               <ProtectedRoute>
//                 <InvoiceDetailPage />
//               </ProtectedRoute>
//             }
//           />

//           {/* Otras rutas */}
//           <Route
//             path="/sales"
//             element={
//               <ProtectedRoute>
//                 <SalesPage />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/providers"
//             element={
//               <ProtectedRoute>
//                 <ProvidersPage />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/reports"
//             element={
//               <ProtectedRoute>
//                 <ReportsPage />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/settings"
//             element={
//               <ProtectedRoute>
//                 <SettingsPage />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/pos"
//             element={
//               <ProtectedRoute>
//                 <POSPage />
//               </ProtectedRoute>
//             }
//           />
//           {/* Ruta 404 */}
//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Routes>
//       </AuthProvider>
//     </Router>
//   );
// }

// export default App;
// frontend/src/App.jsx - ACTUALIZADO CON PURCHASES

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';

// Páginas
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import InventoryPage from './pages/Inventory';
import CustomersPage from './pages/Customers';
import InvoicesPage from './pages/Invoices';
import CreateInvoicePage from './pages/CreateInvoice';
import InvoiceDetailPage from './pages/InvoiceDetail';
import SalesPage from './pages/Sales';
import ProvidersPage from './pages/Providers';
import ReportsPage from './pages/Reports';
import SettingsPage from './pages/Settings';
import POSPage from './pages/POS';
import SuppliersPage from './pages/Suppliers';
import PurchasesPage from './pages/Purchases'; // ← NUEVA IMPORTACIÓN

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg text-indigo-600">Cargando sesión...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Dashboard */}
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          
          {/* Inventario */}
          <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />

          {/* Clientes */}
          <Route path="/customers" element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} />
          
          {/* Proveedores */}
          <Route path="/suppliers" element={<ProtectedRoute><SuppliersPage /></ProtectedRoute>} />
          
          {/* ← NUEVA RUTA DE COMPRAS */}
          <Route path="/purchases" element={<ProtectedRoute><PurchasesPage /></ProtectedRoute>} />

          {/* Facturas */}
          <Route path="/invoices" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
          <Route path="/invoices/create" element={<ProtectedRoute><CreateInvoicePage /></ProtectedRoute>} />
          <Route path="/invoices/:id" element={<ProtectedRoute><InvoiceDetailPage /></ProtectedRoute>} />

          {/* Otras rutas */}
          <Route path="/sales" element={<ProtectedRoute><SalesPage /></ProtectedRoute>} />
          <Route path="/providers" element={<ProtectedRoute><ProvidersPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/pos" element={<ProtectedRoute><POSPage /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;