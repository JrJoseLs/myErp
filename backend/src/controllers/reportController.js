// backend/src/controllers/reportController.js

import {
  generateReport607,
  generateReport606,
  generateReport608,
  saveReport607,
  saveReport606,
  saveReport608,
} from '../services/reportService.js';

/**
 * @desc    Generar Reporte 607 (Ventas)
 * @route   GET /api/v1/reports/607
 * @access  Private/Admin/Contabilidad
 */
export const getReport607 = async (req, res) => {
  try {
    const { mes, año } = req.query;

    if (!mes || !año) {
      return res.status(400).json({
        success: false,
        message: 'Debe especificar mes y año',
      });
    }

    const report = await generateReport607(parseInt(mes), parseInt(año));

    // Calcular totales
    const totales = report.reduce(
      (acc, row) => {
        acc.monto_facturado += parseFloat(row.monto_facturado);
        acc.itbis_facturado += parseFloat(row.itbis_facturado);
        return acc;
      },
      { monto_facturado: 0, itbis_facturado: 0 }
    );

    res.json({
      success: true,
      periodo: { mes: parseInt(mes), año: parseInt(año) },
      count: report.length,
      totales,
      data: report,
    });
  } catch (error) {
    console.error('Error al generar reporte 607:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el reporte 607',
      error: error.message,
    });
  }
};

/**
 * @desc    Generar Reporte 606 (Compras)
 * @route   GET /api/v1/reports/606
 * @access  Private/Admin/Contabilidad
 */
export const getReport606 = async (req, res) => {
  try {
    const { mes, año } = req.query;

    if (!mes || !año) {
      return res.status(400).json({
        success: false,
        message: 'Debe especificar mes y año',
      });
    }

    const report = await generateReport606(parseInt(mes), parseInt(año));

    const totales = report.reduce(
      (acc, row) => {
        acc.monto_facturado += parseFloat(row.monto_facturado);
        acc.itbis_facturado += parseFloat(row.itbis_facturado);
        return acc;
      },
      { monto_facturado: 0, itbis_facturado: 0 }
    );

    res.json({
      success: true,
      periodo: { mes: parseInt(mes), año: parseInt(año) },
      count: report.length,
      totales,
      data: report,
    });
  } catch (error) {
    console.error('Error al generar reporte 606:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el reporte 606',
      error: error.message,
    });
  }
};

/**
 * @desc    Generar Reporte 608 (Anulaciones)
 * @route   GET /api/v1/reports/608
 * @access  Private/Admin/Contabilidad
 */
export const getReport608 = async (req, res) => {
  try {
    const { mes, año } = req.query;

    if (!mes || !año) {
      return res.status(400).json({
        success: false,
        message: 'Debe especificar mes y año',
      });
    }

    const report = await generateReport608(parseInt(mes), parseInt(año));

    res.json({
      success: true,
      periodo: { mes: parseInt(mes), año: parseInt(año) },
      count: report.length,
      data: report,
    });
  } catch (error) {
    console.error('Error al generar reporte 608:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el reporte 608',
      error: error.message,
    });
  }
};

/**
 * @desc    Guardar Reporte 607 en base de datos
 * @route   POST /api/v1/reports/607/save
 * @access  Private/Admin/Contabilidad
 */
export const saveReport607Data = async (req, res) => {
  try {
    const { mes, año } = req.body;

    if (!mes || !año) {
      return res.status(400).json({
        success: false,
        message: 'Debe especificar mes y año',
      });
    }

    const result = await saveReport607(parseInt(mes), parseInt(año));

    res.json({
      success: true,
      message: `Reporte 607 guardado: ${result.count} registros`,
      ...result,
    });
  } catch (error) {
    console.error('Error al guardar reporte 607:', error);
    res.status(500).json({
      success: false,
      message: 'Error al guardar el reporte 607',
      error: error.message,
    });
  }
};

/**
 * @desc    Guardar Reporte 606 en base de datos
 * @route   POST /api/v1/reports/606/save
 * @access  Private/Admin/Contabilidad
 */
export const saveReport606Data = async (req, res) => {
  try {
    const { mes, año } = req.body;

    if (!mes || !año) {
      return res.status(400).json({
        success: false,
        message: 'Debe especificar mes y año',
      });
    }

    const result = await saveReport606(parseInt(mes), parseInt(año));

    res.json({
      success: true,
      message: `Reporte 606 guardado: ${result.count} registros`,
      ...result,
    });
  } catch (error) {
    console.error('Error al guardar reporte 606:', error);
    res.status(500).json({
      success: false,
      message: 'Error al guardar el reporte 606',
      error: error.message,
    });
  }
};

/**
 * @desc    Guardar Reporte 608 en base de datos
 * @route   POST /api/v1/reports/608/save
 * @access  Private/Admin/Contabilidad
 */
export const saveReport608Data = async (req, res) => {
  try {
    const { mes, año } = req.body;

    if (!mes || !año) {
      return res.status(400).json({
        success: false,
        message: 'Debe especificar mes y año',
      });
    }

    const result = await saveReport608(parseInt(mes), parseInt(año));

    res.json({
      success: true,
      message: `Reporte 608 guardado: ${result.count} registros`,
      ...result,
    });
  } catch (error) {
    console.error('Error al guardar reporte 608:', error);
    res.status(500).json({
      success: false,
      message: 'Error al guardar el reporte 608',
      error: error.message,
    });
  }
};