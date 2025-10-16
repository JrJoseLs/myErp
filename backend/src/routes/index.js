// backend/src/routes/index.js

import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import productRoutes from './productRoutes.js';
import customerRoutes from './customerRoutes.js';
import supplierRoutes from './supplierRoutes.js';
import inventoryRoutes from './inventoryRoutes.js';
import purchaseRoutes from './purchaseRoutes.js';
import invoiceRoutes from './invoiceRoutes.js';
import posRoutes from './posRoutes.js';
import ncfRoutes from './ncfRoutes.js';
import reportRoutes from './reportRoutes.js';
import dgiiRoutes from './dgiiRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import accountingRoutes from './accountingRoutes.js';
import employeeRoutes from './employeeRoutes.js';
import payrollRoutes from './payrollRoutes.js';

export default (app) => {
  // Autenticación y usuarios
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', userRoutes);

  // Productos e inventario
  app.use('/api/v1/products', productRoutes);
  app.use('/api/v1/inventory', inventoryRoutes);

  // Clientes y proveedores
  app.use('/api/v1/customers', customerRoutes);
  app.use('/api/v1/suppliers', supplierRoutes);

  // Compras y ventas
  app.use('/api/v1/purchases', purchaseRoutes); // ✅ CRÍTICO PARA EL 606
  app.use('/api/v1/invoices', invoiceRoutes);
  app.use('/api/v1/pos', posRoutes);

  // NCF y DGII
  app.use('/api/v1/ncf', ncfRoutes);
  app.use('/api/v1/reports', reportRoutes);
  app.use('/api/v1/dgii', dgiiRoutes);

  // Dashboard y contabilidad
  app.use('/api/v1/dashboard', dashboardRoutes);
  app.use('/api/v1/accounting', accountingRoutes);

  // Recursos humanos
  app.use('/api/v1/employees', employeeRoutes);
  app.use('/api/v1/payroll', payrollRoutes);
};