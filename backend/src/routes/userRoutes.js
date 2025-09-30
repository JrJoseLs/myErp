import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
} from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { admin } from '../middlewares/roleMiddleware.js'; // Usamos el middleware de rol

const router = express.Router();

// Rutas de administración (requieren ser Administrador)
router
  .route('/')
  .get(protect, admin, getUsers) // GET /api/v1/users
  .post(protect, admin, createUser); // POST /api/v1/users

router
  .route('/:id')
  .get(protect, admin, getUserById) // GET /api/v1/users/:id
  .put(protect, admin, updateUser); // PUT /api/v1/users/:id

// Ruta específica para activar/desactivar (mejor que un DELETE)
router.patch('/toggle-status/:id', protect, admin, toggleUserStatus); // PATCH /api/v1/users/toggle-status/:id

export default router;