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

const allowedRoles = restrictTo('Administrador', 'Vendedor', 'Contabilidad');

router.get('/stats', protect, allowedRoles, getInvoiceStats);
router.get('/', protect, allowedRoles, getInvoices);
router.get('/:id', protect, allowedRoles, getInvoiceById);
router.post('/', protect, allowedRoles, createInvoice);
router.patch('/:id/anular', protect, allowedRoles, anularInvoice);
router.post('/:id/payments', protect, allowedRoles, registerPayment);

export default router;