// backend/src/controllers/reportController.js - VERSIÓN COMPLETA MEJORADA

import { 
  generateReport607,
  generateReport606,
  generateReport608,
  saveReport607,
  saveReport606,
  saveReport608,
} from '../services/reportService.js';
import { 
  generate607TXT,
  generate606TXT,
  generate608TXT 
} from '../utils/txtGenerator.js';
import {
  export607ToExcel,
  export606ToExcel,
  export608ToExcel,
} from '../services/excelService.js';

/**
 * @desc    Generar Reporte 607 (Ventas)
 * @route   GET /api/v1/reports/607
 * @access  Private/Admin/Contabilidad
 */
export const getReport607 = async (req, res) => {
  try {
    const { mes, año, format } = req.query;

    if (!mes || !año) {
      return res.status(400).json({
        success: false,
        message: 'Debe especificar mes y año (ej: ?mes=1&año=2025)',
      });
    }

    const report = await generateReport607(parseInt(mes), parseInt(año));

    // Calcular totales
    const totales = report.reduce(
      (acc, row) => {
        acc.cantidad_registros += 1;
        acc.monto_facturado += parseFloat(row.monto_facturado);
        acc.itbis_facturado += parseFloat(row.itbis_facturado);
        return acc;
      },
      { cantidad_registros: 0, monto_facturado: 0, itbis_facturado: 0 }
    );

    // Formato TXT para DGII
    if (format === 'txt') {
      const txtContent = generate607TXT(
        report, 
        process.env.COMPANY_RNC || '000000000', 
        parseInt(mes), 
        parseInt(año)
      );

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="607_${año}${String(mes).padStart(2, '0')}.txt"`);
      return res.send(txtContent);
    }

    // Formato Excel
    if (format === 'excel') {
      const filePath = await export607ToExcel(report, parseInt(mes), parseInt(año));
      
      res.download(filePath, `607_${año}${String(mes).padStart(2, '0')}.xlsx`, (err) => {
        if (err) {
          console.error('Error al descargar archivo:', err);
          res.status(500).json({
            success: false,
            message: 'Error al generar archivo Excel',
          });
        }
      });
      return;
    }

    // Respuesta JSON por defecto
    res.json({
      success: true,
      periodo: { mes: parseInt(mes), año: parseInt(año) },
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
    const { mes, año, format } = req.query;

    if (!mes || !año) {
      return res.status(400).json({
        success: false,
        message: 'Debe especificar mes y año (ej: ?mes=1&año=2025)',
      });
    }

    const report = await generateReport606(parseInt(mes), parseInt(año));

    const totales = report.reduce(
      (acc, row) => {
        acc.cantidad_registros += 1;
        acc.monto_facturado += parseFloat(row.monto_facturado);
        acc.itbis_facturado += parseFloat(row.itbis_facturado);
        return acc;
      },
      { cantidad_registros: 0, monto_facturado: 0, itbis_facturado: 0 }
    );

    // Formato TXT
    if (format === 'txt') {
      const txtContent = generate606TXT(
        report, 
        process.env.COMPANY_RNC || '000000000', 
        parseInt(mes), 
        parseInt(año)
      );

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="606_${año}${String(mes).padStart(2, '0')}.txt"`);
      return res.send(txtContent);
    }

    // Formato Excel
    if (format === 'excel') {
      const filePath = await export606ToExcel(report, parseInt(mes), parseInt(año));
      
      res.download(filePath, `606_${año}${String(mes).padStart(2, '0')}.xlsx`, (err) => {
        if (err) {
          console.error('Error al descargar archivo:', err);
          res.status(500).json({
            success: false,
            message: 'Error al generar archivo Excel',
          });
        }
      });
      return;
    }

    res.json({
      success: true,
      periodo: { mes: parseInt(mes), año: parseInt(año) },
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
    const { mes, año, format } = req.query;

    if (!mes || !año) {
      return res.status(400).json({
        success: false,
        message: 'Debe especificar mes y año',
      });
    }

    const report = await generateReport608(parseInt(mes), parseInt(año));

    // Formato TXT
    if (format === 'txt') {
      const txtContent = generate608TXT(
        report, 
        process.env.COMPANY_RNC || '000000000', 
        parseInt(mes), 
        parseInt(año)
      );

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="608_${año}${String(mes).padStart(2, '0')}.txt"`);
      return res.send(txtContent);
    }

    // Formato Excel
    if (format === 'excel') {
      const filePath = await export608ToExcel(report, parseInt(mes), parseInt(año));
      
      res.download(filePath, `608_${año}${String(mes).padStart(2, '0')}.xlsx`, (err) => {
        if (err) {
          res.status(500).json({
            success: false,
            message: 'Error al generar archivo Excel',
          });
        }
      });
      return;
    }

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

/**
 * @desc    Obtener resumen de reportes disponibles
 * @route   GET /api/v1/reports/summary
 * @access  Private/Admin/Contabilidad
 */
export const getReportsSummary = async (req, res) => {
  try {
    const { año } = req.query;

    if (!año) {
      return res.status(400).json({
        success: false,
        message: 'Debe especificar el año',
      });
    }

    const { Report606, Report607, Report608 } = await import('../models/index.js');

    // Obtener meses con reportes guardados
    const report607Summary = await Report607.findAll({
      where: { año_reporte: parseInt(año) },
      attributes: [
        'mes_reporte',
        [Report607.sequelize.fn('COUNT', Report607.sequelize.col('id')), 'cantidad'],
        [Report607.sequelize.fn('SUM', Report607.sequelize.col('monto_facturado')), 'total_monto'],
        [Report607.sequelize.fn('SUM', Report607.sequelize.col('itbis_facturado')), 'total_itbis'],
      ],
      group: ['mes_reporte'],
      raw: true,
    });

    const report606Summary = await Report606.findAll({
      where: { año_reporte: parseInt(año) },
      attributes: [
        'mes_reporte',
        [Report606.sequelize.fn('COUNT', Report606.sequelize.col('id')), 'cantidad'],
        [Report606.sequelize.fn('SUM', Report606.sequelize.col('monto_facturado')), 'total_monto'],
        [Report606.sequelize.fn('SUM', Report606.sequelize.col('itbis_facturado')), 'total_itbis'],
      ],
      group: ['mes_reporte'],
      raw: true,
    });

    const report608Summary = await Report608.findAll({
      where: { año_reporte: parseInt(año) },
      attributes: [
        'mes_reporte',
        [Report608.sequelize.fn('COUNT', Report608.sequelize.col('id')), 'cantidad'],
      ],
      group: ['mes_reporte'],
      raw: true,
    });

    res.json({
      success: true,
      año: parseInt(año),
      report607: report607Summary,
      report606: report606Summary,
      report608: report608Summary,
    });
  } catch (error) {
    console.error('Error al obtener resumen de reportes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener resumen de reportes',
      error: error.message,
    });
  }
};

/**
 * ✅ NUEVO: Validar NCF de un proveedor con DGII
 * @route   POST /api/v1/reports/validate-ncf
 * @access  Private
 */
export const validateNCF = async (req, res) => {
  try {
    const { ncf, rnc_proveedor } = req.body;

    if (!ncf || !rnc_proveedor) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar NCF y RNC del proveedor',
      });
    }

    // Aquí podrías integrar con API de DGII cuando esté disponible
    // Por ahora, validación local
    const { validateNCF: validateNCFUtil } = await import('../utils/validators.js');
    const validation = validateNCFUtil(ncf);

    res.json({
      success: validation.valid,
      ncf,
      rnc_proveedor,
      ...validation,
    });
  } catch (error) {
    console.error('Error al validar NCF:', error);
    res.status(500).json({
      success: false,
      message: 'Error al validar NCF',
      error: error.message,
    });
  }
};