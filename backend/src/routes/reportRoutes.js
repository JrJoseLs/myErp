// backend/src/routes/reportRoutes.js

import express from 'express';
import {
  getReport607,
  getReport606,
  getReport608,
  saveReport607Data,
  saveReport606Data,
  saveReport608Data,
} from '../controllers/reportController.js';
import { protect } from '../middlewares/authMiddleware.js';
import restrictTo from '../middlewares/roleMiddleware.js'; // ✅ CORRECCIÓN APLICADA

const router = express.Router();

// Roles permitidos: Administrador y Contabilidad
const allowedRoles = restrictTo('Administrador', 'Contabilidad', 'Gerente');

// Reporte 607 (Ventas)
router.get('/607', protect, allowedRoles, getReport607);
router.post('/607/save', protect, allowedRoles, saveReport607Data);

// Reporte 606 (Compras)
router.get('/606', protect, allowedRoles, getReport606);
router.post('/606/save', protect, allowedRoles, saveReport606Data);

// Reporte 608 (Anulaciones)
router.get('/608', protect, allowedRoles, getReport608);
router.post('/608/save', protect, allowedRoles, saveReport608Data);

export default router;