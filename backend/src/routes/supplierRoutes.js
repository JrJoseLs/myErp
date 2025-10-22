// backend/src/routes/supplierRoutes.js

import express from 'express';
import {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '../controllers/supplierController.js';
import { protect } from '../middlewares/authMiddleware.js';
import restrictTo from '../middlewares/roleMiddleware.js'; // ✅ CORRECCIÓN APLICADA

const router = express.Router();

// Roles permitidos para gestión de proveedores
const supplierRoles = restrictTo('Administrador', 'Inventario', 'Contabilidad');

// ============================================
// RUTAS DE PROVEEDORES
// ============================================

// Obtener todos los proveedores
router.get('/', protect, supplierRoles, getSuppliers);

// Obtener un proveedor por ID
router.get('/:id', protect, supplierRoles, getSupplierById);

// Crear un nuevo proveedor
router.post('/', protect, supplierRoles, createSupplier);

// Actualizar un proveedor
router.put('/:id', protect, supplierRoles, updateSupplier);

// Eliminar (desactivar) un proveedor
router.delete('/:id', protect, supplierRoles, deleteSupplier);

export default router;