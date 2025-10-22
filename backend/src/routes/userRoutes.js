import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
} from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';
// CORRECCIÓN: Importación por defecto
import restrictTo from '../middlewares/roleMiddleware.js'; 
import {
  validateUserCreate,
  validateUserUpdate,
  validateId,
} from '../middlewares/validationMiddleware.js';

const router = express.Router();

// Crear middleware para admin
const admin = restrictTo('Administrador');

// Todas las rutas requieren autenticación y rol de Administrador

router
  .route('/')
  .get(protect, admin, getUsers)
  .post(protect, admin, validateUserCreate, createUser);

router
  .route('/:id')
  .get(protect, admin, validateId, getUserById)
  .put(protect, admin, validateId, validateUserUpdate, updateUser);

router.patch('/toggle-status/:id', protect, admin, validateId, toggleUserStatus);

export default router;