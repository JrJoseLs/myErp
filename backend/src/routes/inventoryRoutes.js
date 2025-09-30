// backend/src/routes/inventoryRoutes.js

import express from 'express';
import {
  getInventoryMovements,
  getProductMovements,
  createInventoryMovement,
  getLowStockProducts,
  getInventoryValuation,
} from '../controllers/inventoryController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { restrictTo } from '../middlewares/roleMiddleware.js';
import { validateInventoryMovement, validateId } from '../middlewares/validationMiddleware.js';

const router = express.Router();

// Roles permitidos para gestión de inventario
const inventoryRoles = restrictTo('Administrador', 'Inventario');
const inventoryOrAccounting = restrictTo('Administrador', 'Inventario', 'Contabilidad');

// ============================================
// RUTAS DE MOVIMIENTOS DE INVENTARIO
// ============================================

// Obtener historial de movimientos con filtros
router.get('/movements', protect, inventoryRoles, getInventoryMovements);

// Obtener movimientos de un producto específico
router.get('/movements/product/:id', protect, inventoryRoles, validateId, getProductMovements);

// Registrar un nuevo movimiento (entrada/salida/ajuste)
router.post('/movements', protect, inventoryRoles, validateInventoryMovement, createInventoryMovement);

// ============================================
// RUTAS DE REPORTES DE INVENTARIO
// ============================================

// Productos con stock bajo
router.get('/low-stock', protect, inventoryRoles, getLowStockProducts);

// Valorización del inventario
router.get('/valuation', protect, inventoryOrAccounting, getInventoryValuation);

export default router;