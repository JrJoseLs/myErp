// backend/src/routes/dashboardRoutes.js
// ✅ CON ES MODULES - VERSIÓN CORREGIDA

import express from 'express';
import dashboardController from '../controllers/dashboardController.js';
import { protect } from '../middlewares/authMiddleware.js';
import restrictTo from '../middlewares/roleMiddleware.js';

const router = express.Router();

/**
 * Todas las rutas requieren autenticación
 * Solo roles: GERENTE, ADMIN, DUEÑO pueden acceder
 */
router.use(protect);
router.use(restrictTo('GERENTE', 'ADMIN', 'DUEÑO', 'CONTADOR'));

/**
 * GET /dashboard/summary
 * Resumen ejecutivo: ventas, costos, margen, cuentas
 */
router.get('/summary', dashboardController.getDashboardSummary);

/**
 * GET /dashboard/sales-metrics
 * Métricas de ventas
 * Query params: startDate, endDate, vendedor_id (opcional)
 */
router.get('/sales-metrics', dashboardController.getSalesMetrics);

/**
 * GET /dashboard/expenses-metrics
 * Métricas de gastos
 * Query params: startDate, endDate
 */
router.get('/expenses-metrics', dashboardController.getExpensesMetrics);

/**
 * GET /dashboard/profit-analysis
 * Análisis de rentabilidad
 * Query params: startDate, endDate
 */
router.get('/profit-analysis', dashboardController.getProfitAnalysis);

/**
 * GET /dashboard/cash-flow
 * Flujo de caja
 * Query params: startDate, endDate
 */
router.get('/cash-flow', dashboardController.getCashFlow);

/**
 * GET /dashboard/accounts
 * Análisis de cuentas por cobrar/pagar
 * Query params: startDate, endDate
 */
router.get('/accounts', dashboardController.getAccountsAnalysis);

/**
 * GET /dashboard/inventory-analysis
 * Análisis de inventario
 * Query params: startDate, endDate
 */
router.get('/inventory-analysis', dashboardController.getInventoryAnalysis);

/**
 * GET /dashboard/employee-performance
 * Desempeño de empleados
 * Query params: startDate, endDate, limit
 */
router.get('/employee-performance', dashboardController.getEmployeePerformance);

/**
 * GET /dashboard/sales-trend
 * Tendencia de ventas (últimos N días)
 * Query params: days (default 30)
 */
router.get('/sales-trend', dashboardController.getSalesTrend);

/**
 * GET /dashboard/sales-detail
 * Detalles de ventas para drill-down
 * Query params: startDate, endDate, groupBy (vendedor|cliente|producto), limit
 */
router.get('/sales-detail', dashboardController.getSalesDetail);

/**
 * GET /dashboard/expenses-detail
 * Detalles de gastos para drill-down
 * Query params: startDate, endDate, groupBy, limit
 */
router.get('/expenses-detail', dashboardController.getExpensesDetail);

/**
 * GET /dashboard/top-products
 * Top 10 productos más vendidos
 * Query params: startDate, endDate, limit
 */
router.get('/top-products', dashboardController.getTopProducts);

/**
 * GET /dashboard/top-customers
 * Top 10 clientes por ventas
 * Query params: startDate, endDate, limit
 */
router.get('/top-customers', dashboardController.getTopCustomers);

/**
 * GET /dashboard/comparison
 * Comparación mes actual vs mes anterior
 */
router.get('/comparison', dashboardController.getComparison);

// ✅ EXPORT DEFAULT (no module.exports)
export default router;