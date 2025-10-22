import { sequelize } from '../config/database.js';
import {
  Invoice,
  InvoiceDetail,
  AccountsReceivable,
  AccountsPayable,
  Product,
  Inventory,
  User,
  Payment,
  Employee,
  Payroll,
  Purchase,
  PurchaseDetail,
  Customer,
  Supplier,
} from '../models/index.js';
import dashboardService from '../services/dashboardService.js';
import { Op } from 'sequelize';

const getDashboardSummary = async (req, res) => {
  try {
    const { empresa_id } = req;
    const { startDate, endDate } = req.query;

    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const start = startDate ? new Date(startDate) : monthStart;
    const end = endDate ? new Date(endDate) : monthEnd;

    const summary = await dashboardService.calculateDashboardSummary(
      empresa_id,
      start,
      end
    );

    res.json({
      success: true,
      data: {
        periodo: {
          inicio: start.toISOString().split('T')[0],
          fin: end.toISOString().split('T')[0],
        },
        ...summary,
      },
    });
  } catch (error) {
    console.error('Error en getDashboardSummary:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener resumen del dashboard',
      error: error.message,
    });
  }
};

const getSalesMetrics = async (req, res) => {
  try {
    const { empresa_id } = req;
    const { startDate, endDate, vendedor_id } = req.query;

    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const start = startDate ? new Date(startDate) : monthStart;
    const end = endDate ? new Date(endDate) : monthEnd;

    const metrics = await dashboardService.calculateSalesMetrics(
      empresa_id,
      start,
      end,
      vendedor_id
    );

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('Error en getSalesMetrics:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener métricas de ventas',
      error: error.message,
    });
  }
};

const getExpensesMetrics = async (req, res) => {
  try {
    const { empresa_id } = req;
    const { startDate, endDate } = req.query;

    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const start = startDate ? new Date(startDate) : monthStart;
    const end = endDate ? new Date(endDate) : monthEnd;

    const metrics = await dashboardService.calculateExpensesMetrics(
      empresa_id,
      start,
      end
    );

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('Error en getExpensesMetrics:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener métricas de gastos',
      error: error.message,
    });
  }
};

const getProfitAnalysis = async (req, res) => {
  try {
    const { empresa_id } = req;
    const { startDate, endDate } = req.query;

    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const start = startDate ? new Date(startDate) : monthStart;
    const end = endDate ? new Date(endDate) : monthEnd;

    const profit = await dashboardService.calculateProfitAnalysis(
      empresa_id,
      start,
      end
    );

    res.json({
      success: true,
      data: profit,
    });
  } catch (error) {
    console.error('Error en getProfitAnalysis:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener análisis de ganancias',
      error: error.message,
    });
  }
};

const getCashFlow = async (req, res) => {
  try {
    const { empresa_id } = req;
    const { startDate, endDate } = req.query;

    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const start = startDate ? new Date(startDate) : monthStart;
    const end = endDate ? new Date(endDate) : monthEnd;

    const cashFlow = await dashboardService.calculateCashFlow(
      empresa_id,
      start,
      end
    );

    res.json({
      success: true,
      data: cashFlow,
    });
  } catch (error) {
    console.error('Error en getCashFlow:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener flujo de caja',
      error: error.message,
    });
  }
};

const getAccountsAnalysis = async (req, res) => {
  try {
    const { empresa_id } = req;
    const { startDate, endDate } = req.query;

    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const start = startDate ? new Date(startDate) : monthStart;
    const end = endDate ? new Date(endDate) : monthEnd;

    const accounts = await dashboardService.calculateAccountsAnalysis(
      empresa_id,
      start,
      end
    );

    res.json({
      success: true,
      data: accounts,
    });
  } catch (error) {
    console.error('Error en getAccountsAnalysis:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener análisis de cuentas',
      error: error.message,
    });
  }
};

const getInventoryAnalysis = async (req, res) => {
  try {
    const { empresa_id } = req;
    const { startDate, endDate } = req.query;

    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const start = startDate ? new Date(startDate) : monthStart;
    const end = endDate ? new Date(endDate) : monthEnd;

    const inventory = await dashboardService.calculateInventoryAnalysis(
      empresa_id,
      start,
      end
    );

    res.json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    console.error('Error en getInventoryAnalysis:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener análisis de inventario',
      error: error.message,
    });
  }
};

const getEmployeePerformance = async (req, res) => {
  try {
    const { empresa_id } = req;
    const { startDate, endDate, limit = 10 } = req.query;

    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const start = startDate ? new Date(startDate) : monthStart;
    const end = endDate ? new Date(endDate) : monthEnd;

    const performance = await dashboardService.calculateEmployeePerformance(
      empresa_id,
      start,
      end,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: performance,
    });
  } catch (error) {
    console.error('Error en getEmployeePerformance:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener desempeño de empleados',
      error: error.message,
    });
  }
};

const getSalesTrend = async (req, res) => {
  try {
    const { empresa_id } = req;
    const { days = 30 } = req.query;

    const trend = await dashboardService.calculateSalesTrend(
      empresa_id,
      parseInt(days)
    );

    res.json({
      success: true,
      data: trend,
    });
  } catch (error) {
    console.error('Error en getSalesTrend:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tendencia de ventas',
      error: error.message,
    });
  }
};

const getSalesDetail = async (req, res) => {
  try {
    const { empresa_id } = req;
    const { startDate, endDate, groupBy = 'vendedor', limit = 50 } = req.query;

    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const start = startDate ? new Date(startDate) : monthStart;
    const end = endDate ? new Date(endDate) : monthEnd;

    const details = await dashboardService.getSalesDetail(
      empresa_id,
      start,
      end,
      groupBy,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: details,
    });
  } catch (error) {
    console.error('Error en getSalesDetail:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener detalles de ventas',
      error: error.message,
    });
  }
};

const getExpensesDetail = async (req, res) => {
  try {
    const { empresa_id } = req;
    const { startDate, endDate, groupBy = 'categoria', limit = 50 } = req.query;

    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const start = startDate ? new Date(startDate) : monthStart;
    const end = endDate ? new Date(endDate) : monthEnd;

    const details = await dashboardService.getExpensesDetail(
      empresa_id,
      start,
      end,
      groupBy,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: details,
    });
  } catch (error) {
    console.error('Error en getExpensesDetail:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener detalles de gastos',
      error: error.message,
    });
  }
};

const getTopProducts = async (req, res) => {
  try {
    const { empresa_id } = req;
    const { startDate, endDate, limit = 10 } = req.query;

    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const start = startDate ? new Date(startDate) : monthStart;
    const end = endDate ? new Date(endDate) : monthEnd;

    const topProducts = await dashboardService.getTopProducts(
      empresa_id,
      start,
      end,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: topProducts,
    });
  } catch (error) {
    console.error('Error en getTopProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos top',
      error: error.message,
    });
  }
};

const getTopCustomers = async (req, res) => {
  try {
    const { empresa_id } = req;
    const { startDate, endDate, limit = 10 } = req.query;

    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const start = startDate ? new Date(startDate) : monthStart;
    const end = endDate ? new Date(endDate) : monthEnd;

    const topCustomers = await dashboardService.getTopCustomers(
      empresa_id,
      start,
      end,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: topCustomers,
    });
  } catch (error) {
    console.error('Error en getTopCustomers:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener clientes top',
      error: error.message,
    });
  }
};

const getComparison = async (req, res) => {
  try {
    const { empresa_id } = req;

    const comparison = await dashboardService.calculateComparison(empresa_id);

    res.json({
      success: true,
      data: comparison,
    });
  } catch (error) {
    console.error('Error en getComparison:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener comparación de períodos',
      error: error.message,
    });
  }
};

export default {
  getDashboardSummary,
  getSalesMetrics,
  getExpensesMetrics,
  getProfitAnalysis,
  getCashFlow,
  getAccountsAnalysis,
  getInventoryAnalysis,
  getEmployeePerformance,
  getSalesTrend,
  getSalesDetail,
  getExpensesDetail,
  getTopProducts,
  getTopCustomers,
  getComparison,
};