// backend/src/routes/purchaseRoutes.js

import express from 'express';
import {
  getPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchaseStatus,
  deletePurchase,
} from '../controllers/purchaseController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { restrictTo } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Roles permitidos para gestión de compras
const purchaseRoles = restrictTo('Administrador', 'Inventario', 'Contabilidad');

// ============================================
// RUTAS DE COMPRAS
// ============================================

// Obtener todas las compras
router.get('/', protect, purchaseRoles, getPurchases);

// Obtener una compra por ID
router.get('/:id', protect, purchaseRoles, getPurchaseById);

// Crear una nueva compra
router.post('/', protect, purchaseRoles, createPurchase);

// Actualizar estado de una compra
router.put('/:id/status', protect, purchaseRoles, updatePurchaseStatus);

// Eliminar una compra
router.delete('/:id', protect, purchaseRoles, deletePurchase);

export default router;