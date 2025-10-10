// backend/src/routes/posRoutes.js

import express from 'express';
import {
  searchProducts,
  getProductByBarcode,
  createPOSSale,
  getDailySales,
  closeRegister,
} from '../controllers/posController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { restrictTo } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Roles permitidos: Administrador, Vendedor
const allowedRoles = restrictTo('Administrador', 'Vendedor');

// Búsqueda de productos
router.get('/products/search', protect, allowedRoles, searchProducts);
router.get('/products/barcode/:codigo', protect, allowedRoles, getProductByBarcode);

// Crear venta
router.post('/sale', protect, allowedRoles, createPOSSale);

// Ventas del día
router.get('/daily-sales', protect, allowedRoles, getDailySales);

// Cierre de caja
router.post('/close-register', protect, allowedRoles, closeRegister);

export default router;