import express from 'express';
import {
  getNCFRanges,
  getNextNCF,
  consumeNCF,
  createNCFRange,
  deactivateNCFRange,
} from '../controllers/ncfController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { admin, restrictTo } from '../middlewares/roleMiddleware.js';

const router = express.Router();

const allowedRoles = restrictTo('Administrador', 'Vendedor', 'Contabilidad');

router.get('/', protect, allowedRoles, getNCFRanges);
router.get('/next/:tipo', protect, allowedRoles, getNextNCF);
router.post('/consume/:tipo', protect, allowedRoles, consumeNCF);
router.post('/', protect, admin, createNCFRange);
router.patch('/:id/deactivate', protect, admin, deactivateNCFRange);

export default router;