// backend/src/routes/customerRoutes.js - VERSIÓN CORREGIDA

import express from 'express';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  toggleCustomerStatus,
  generateCustomerCode,
  getConsumidorFinal, // ✅ NUEVO
} from '../controllers/customerController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { restrictTo } from '../middlewares/roleMiddleware.js';

const router = express.Router();

const allowedRoles = restrictTo('Administrador', 'Vendedor', 'Contabilidad');

// ✅ IMPORTANTE: Rutas específicas ANTES de rutas con parámetros
router.get('/generate-code', protect, allowedRoles, generateCustomerCode);
router.get('/consumidor-final', protect, allowedRoles, getConsumidorFinal); // ✅ NUEVA RUTA

// Rutas generales
router.get('/', protect, allowedRoles, getCustomers);
router.get('/:id', protect, allowedRoles, getCustomerById);
router.post('/', protect, allowedRoles, createCustomer);
router.put('/:id', protect, allowedRoles, updateCustomer);
router.patch('/toggle-status/:id', protect, allowedRoles, toggleCustomerStatus);

export default router;