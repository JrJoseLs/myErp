// backend/src/routes/auditRoutes.js

import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { admin } from '../middlewares/roleMiddleware.js';
import { getAuditHistory, getRecentActivity } from '../middlewares/auditMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/v1/audit/recent
 * @desc    Obtener actividad reciente del sistema
 * @access  Private/Admin
 */
router.get('/recent', protect, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const activity = await getRecentActivity(parseInt(limit));
    
    res.json({
      success: true,
      count: activity.length,
      activity,
    });
  } catch (error) {
    console.error('Error al obtener actividad reciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener actividad reciente',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/v1/audit/:tabla/:id
 * @desc    Obtener historial de auditoría de un registro
 * @access  Private/Admin
 */
router.get('/:tabla/:id', protect, admin, async (req, res) => {
  try {
    const { tabla, id } = req.params;
    const history = await getAuditHistory(tabla, parseInt(id));
    
    res.json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial de auditoría',
      error: error.message,
    });
  }
});

export default router;