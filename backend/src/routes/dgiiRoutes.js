// backend/src/routes/dgiiRoutes.js

import express from 'express';
import {
  validateRNCFromDGII,
  validateCedulaFromDGII,
  checkIdentificationExists,
  createCustomerFromRNC,
} from '../controllers/dgiiController.js';
import { protect } from '../middlewares/authMiddleware.js';
import restrictTo from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Roles permitidos para validación DGII
const allowedRoles = restrictTo('Administrador', 'Vendedor', 'Contabilidad');

// Validación de RNC/Cédula
router.post('/validate-rnc', protect, allowedRoles, validateRNCFromDGII);
router.post('/validate-cedula', protect, allowedRoles, validateCedulaFromDGII);

// Verificar existencia
router.post('/check-exists', protect, allowedRoles, checkIdentificationExists);

// Crear cliente desde RNC
router.post('/create-customer-from-rnc', protect, allowedRoles, createCustomerFromRNC);

export default router;