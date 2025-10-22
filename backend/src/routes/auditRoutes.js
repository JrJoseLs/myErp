// backend/src/routes/auditRoutes.js

import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
// ✅ CORRECCIÓN: Ahora solo importa restrictTo, y admin se define localmente
import restrictTo from '../middlewares/roleMiddleware.js'; 
import { getAuditHistory, getRecentActivity } from '../middlewares/auditMiddleware.js';

const router = express.Router();

const admin = restrictTo('Administrador'); // ✅ DEFINICIÓN LOCAL DE ADMIN

/**
 * @route   GET /api/v1/audit/recent
 * @desc    Obtener actividad reciente del sistema
 * @access  Private/Admin
 */
router.get('/recent', protect, async (req, res) => {
// ... (resto del código)
});

/**
 * @route   GET /api/v1/audit/:tabla/:id
 * @desc    Obtener historial de auditoría de un registro
 * @access  Private/Admin
 */
router.get('/:tabla/:id', protect, admin, async (req, res) => {
// ... (resto del código)
});

export default router;