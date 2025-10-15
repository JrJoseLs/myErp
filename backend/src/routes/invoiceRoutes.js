// backend/src/routes/invoiceRoutes.js
import express from 'express';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  anularInvoice,
  registerPayment,
  getInvoiceStats,
} from '../controllers/invoiceController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { restrictTo } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Roles permitidos para ver facturas
const viewRoles = restrictTo('Administrador', 'Vendedor', 'Contabilidad', 'Gerente');

// Roles para crear facturas
const createRoles = restrictTo('Administrador', 'Vendedor');

// Solo administradores pueden anular
const adminOnly = restrictTo('Administrador');

// Rutas
router.get('/stats', protect, viewRoles, getInvoiceStats);
router.get('/', protect, viewRoles, getInvoices);
router.get('/:id', protect, viewRoles, getInvoiceById);
router.post('/', protect, createRoles, createInvoice);
router.patch('/:id/anular', protect, adminOnly, anularInvoice);
router.post('/:id/payments', protect, viewRoles, registerPayment);

export default router;