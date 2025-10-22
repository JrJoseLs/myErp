import express from 'express';

import {
  registerUser,
  loginUser,
  getUserProfile,
} from '../controllers/authController.js';
// ¡CORRECCIÓN APLICADA AQUÍ!
import { protect } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

// Rutas de autenticación
router.post('/register', registerUser); // Crear usuario (usado en el setup inicial)
router.post('/login', loginUser);

// Rutas protegidas
router.get('/profile', protect, getUserProfile); // Requiere JWT

export default router;