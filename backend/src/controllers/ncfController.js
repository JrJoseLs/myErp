// backend/src/controllers/ncfController.js

import { NCF } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * @desc    Obtener todos los rangos de NCF
 * @route   GET /api/v1/ncf
 * @access  Private/Admin
 */
export const getNCFRanges = async (req, res) => {
  try {
    const ranges = await NCF.findAll({
      order: [['tipo_ncf', 'ASC']],
    });

    // Calcular rangos disponibles
    const rangesWithStats = ranges.map(range => {
      const desde = parseInt(range.secuencia_desde.substring(3));
      const hasta = parseInt(range.secuencia_hasta.substring(3));
      const actual = parseInt(range.secuencia_actual.substring(3));
      
      const total = hasta - desde + 1;
      const usados = actual - desde;
      const disponibles = hasta - actual + 1;
      const porcentajeUsado = ((usados / total) * 100).toFixed(2);

      return {
        ...range.toJSON(),
        stats: {
          total,
          usados,
          disponibles,
          porcentajeUsado: parseFloat(porcentajeUsado),
        },
      };
    });

    res.json({
      success: true,
      ranges: rangesWithStats,
    });
  } catch (error) {
    console.error('Error al obtener rangos NCF:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener rangos de NCF',
      error: error.message,
    });
  }
};

/**
 * @desc    Obtener siguiente NCF disponible
 * @route   GET /api/v1/ncf/next/:tipo
 * @access  Private
 */
export const getNextNCF = async (req, res) => {
  try {
    const { tipo } = req.params;

    const range = await NCF.findOne({
      where: {
        tipo_ncf: tipo,
        activo: true,
        agotado: false,
      },
    });

    if (!range) {
      return res.status(404).json({
        success: false,
        message: `No hay rango activo para NCF tipo ${tipo}`,
      });
    }

    // Verificar si está agotado
    if (range.secuencia_actual > range.secuencia_hasta) {
      range.agotado = true;
      range.activo = false;
      await range.save();

      return res.status(400).json({
        success: false,
        message: 'El rango de NCF está agotado. Por favor, solicite un nuevo rango a la DGII',
        agotado: true,
      });
    }

    // Verificar si está próximo a agotarse (menos del 10%)
    const desde = parseInt(range.secuencia_desde.substring(3));
    const hasta = parseInt(range.secuencia_hasta.substring(3));
    const actual = parseInt(range.secuencia_actual.substring(3));
    const disponibles = hasta - actual + 1;
    const total = hasta - desde + 1;
    const porcentaje = (disponibles / total) * 100;

    res.json({
      success: true,
      ncf: range.secuencia_actual,
      alerta: porcentaje < 10,
      disponibles,
      mensaje: porcentaje < 10 ? 'Advertencia: Quedan menos del 10% de NCF disponibles' : null,
    });
  } catch (error) {
    console.error('Error al obtener siguiente NCF:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener siguiente NCF',
      error: error.message,
    });
  }
};

/**
 * @desc    Consumir (usar) un NCF
 * @route   POST /api/v1/ncf/consume/:tipo
 * @access  Private
 */
export const consumeNCF = async (req, res) => {
  try {
    const { tipo } = req.params;

    const range = await NCF.findOne({
      where: {
        tipo_ncf: tipo,
        activo: true,
        agotado: false,
      },
    });

    if (!range) {
      return res.status(404).json({
        success: false,
        message: `No hay rango activo para NCF tipo ${tipo}`,
      });
    }

    const ncfUsado = range.secuencia_actual;

    // Incrementar secuencia
    const prefijo = range.secuencia_actual.substring(0, 3);
    const numero = parseInt(range.secuencia_actual.substring(3));
    const siguienteNumero = numero + 1;
    const siguienteNCF = `${prefijo}${String(siguienteNumero).padStart(8, '0')}`;

    range.secuencia_actual = siguienteNCF;

    // Verificar si se agotó
    if (siguienteNCF > range.secuencia_hasta) {
      range.agotado = true;
      range.activo = false;
    }

    await range.save();

    res.json({
      success: true,
      ncf: ncfUsado,
      siguiente: siguienteNCF,
      agotado: range.agotado,
    });
  } catch (error) {
    console.error('Error al consumir NCF:', error);
    res.status(500).json({
      success: false,
      message: 'Error al consumir NCF',
      error: error.message,
    });
  }
};

/**
 * @desc    Crear nuevo rango de NCF
 * @route   POST /api/v1/ncf
 * @access  Private/Admin
 */
export const createNCFRange = async (req, res) => {
  const {
    tipo_ncf,
    descripcion_tipo,
    secuencia_desde,
    secuencia_hasta,
    fecha_vencimiento,
  } = req.body;

  try {
    // Validar formato de NCF
    const ncfRegex = /^[A-Z]\d{10}$/;
    if (!ncfRegex.test(secuencia_desde) || !ncfRegex.test(secuencia_hasta)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de NCF inválido. Debe ser: LetraDigitos (ej: B0100000001)',
      });
    }

    // Validar que desde sea menor que hasta
    const desde = parseInt(secuencia_desde.substring(3));
    const hasta = parseInt(secuencia_hasta.substring(3));

    if (desde >= hasta) {
      return res.status(400).json({
        success: false,
        message: 'La secuencia desde debe ser menor que la secuencia hasta',
      });
    }

    const newRange = await NCF.create({
      tipo_ncf,
      descripcion_tipo,
      secuencia_desde,
      secuencia_hasta,
      secuencia_actual: secuencia_desde,
      fecha_vencimiento,
      activo: true,
      agotado: false,
    });

    res.status(201).json({
      success: true,
      message: 'Rango de NCF creado exitosamente',
      range: newRange,
    });
  } catch (error) {
    console.error('Error al crear rango NCF:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear rango de NCF',
      error: error.message,
    });
  }
};

/**
 * @desc    Desactivar rango de NCF
 * @route   PATCH /api/v1/ncf/:id/deactivate
 * @access  Private/Admin
 */
export const deactivateNCFRange = async (req, res) => {
  try {
    const range = await NCF.findByPk(req.params.id);

    if (!range) {
      return res.status(404).json({
        success: false,
        message: 'Rango de NCF no encontrado',
      });
    }

    range.activo = false;
    await range.save();

    res.json({
      success: true,
      message: 'Rango de NCF desactivado correctamente',
      range,
    });
  } catch (error) {
    console.error('Error al desactivar rango NCF:', error);
    res.status(500).json({
      success: false,
      message: 'Error al desactivar rango de NCF',
      error: error.message,
    });
  }
};