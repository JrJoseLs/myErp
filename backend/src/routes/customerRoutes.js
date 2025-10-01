import express from 'express';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  toggleCustomerStatus,
  generateCustomerCode,
} from '../controllers/customerController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { restrictTo } from '../middlewares/roleMiddleware.js';

const router = express.Router();

const allowedRoles = restrictTo('Administrador', 'Vendedor', 'Contabilidad');

router.get('/', protect, allowedRoles, getCustomers);
router.get('/generate-code', protect, allowedRoles, generateCustomerCode);
router.get('/:id', protect, allowedRoles, getCustomerById);
router.post('/', protect, allowedRoles, createCustomer);
router.put('/:id', protect, allowedRoles, updateCustomer);
router.patch('/toggle-status/:id', protect, allowedRoles, toggleCustomerStatus);

export default router;