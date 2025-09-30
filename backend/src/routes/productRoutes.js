import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  toggleProductStatus, // Asumiendo que has copiado esta función también
} from '../controllers/productController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { restrictTo } from '../middlewares/roleMiddleware.js'; 

const router = express.Router();

// Roles permitidos para la gestión de Inventario/Productos (Escribir/Crear/Actualizar)
const inventoryOrAdmin = restrictTo('Administrador', 'Inventario'); 
// Roles permitidos para ver el catálogo (Leer)
const viewProductsRoles = restrictTo('Administrador', 'Inventario', 'Vendedor');


// ============================================
// RUTAS DE CATEGORIAS
// ============================================
router
  .route('/categories')
  .get(protect, viewProductsRoles, getCategories) 
  .post(protect, inventoryOrAdmin, createCategory); // Solo Inventario/Admin

router.route('/categories/:id')
    .put(protect, inventoryOrAdmin, updateCategory);


// ============================================
// RUTAS DE PRODUCTOS
// ============================================

router
  .route('/')
  .get(protect, viewProductsRoles, getProducts) 
  .post(protect, inventoryOrAdmin, createProduct); 

router
  .route('/:id')
  .get(protect, viewProductsRoles, getProductById) 
  .put(protect, inventoryOrAdmin, updateProduct); 

router.patch('/toggle-status/:id', protect, inventoryOrAdmin, toggleProductStatus); 

export default router;