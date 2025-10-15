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

// Roles permitidos
const inventoryRoles = restrictTo('Administrador', 'Inventario');
const adminOnly = restrictTo('Administrador');

// Rutas de compras
router.get('/', protect, inventoryRoles, getPurchases);
router.get('/:id', protect, inventoryRoles, getPurchaseById);
router.post('/', protect, inventoryRoles, createPurchase);
router.put('/:id/status', protect, inventoryRoles, updatePurchaseStatus);
router.delete('/:id', protect, adminOnly, deletePurchase);

export default router;