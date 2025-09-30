// backend/src/routes/productRoutes.js

import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  toggleProductStatus,
} from '../controllers/productController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { restrictTo } from '../middlewares/roleMiddleware.js';
import {
  validateCategory,
  validateProductCreate,
  validateProductUpdate,
  validateId,
} from '../middlewares/validationMiddleware.js';

const router = express.Router();

// Roles permitidos para la gestión de Inventario/Productos
const inventoryOrAdmin = restrictTo('Administrador', 'Inventario');
// Roles permitidos para ver el catálogo
const viewProductsRoles = restrictTo('Administrador', 'Inventario', 'Vendedor');

// ============================================
// RUTAS DE CATEGORIAS
// ============================================

router
  .route('/categories')
  .get(protect, viewProductsRoles, getCategories)
  .post(protect, inventoryOrAdmin, validateCategory, createCategory);

router
  .route('/categories/:id')
  .put(protect, inventoryOrAdmin, validateId, validateCategory, updateCategory);

// ============================================
// RUTAS DE PRODUCTOS
// ============================================

router
  .route('/')
  .get(protect, viewProductsRoles, getProducts)
  .post(protect, inventoryOrAdmin, validateProductCreate, createProduct);

router
  .route('/:id')
  .get(protect, viewProductsRoles, validateId, getProductById)
  .put(protect, inventoryOrAdmin, validateId, validateProductUpdate, updateProduct);

router.patch(
  '/toggle-status/:id',
  protect,
  inventoryOrAdmin,
  validateId,
  toggleProductStatus
);

export default router;