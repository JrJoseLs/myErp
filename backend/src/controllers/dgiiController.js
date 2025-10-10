// backend/src/controllers/dgiiController.js
// Controlador para validación con DGII

import { validateRNC, validateCedula } from '../services/dgiiService.js';
import { Customer, Supplier } from '../models/index.js';

/**
 * @desc    Validar RNC con la DGII
 * @route   POST /api/v1/dgii/validate-rnc
 * @access  Private
 */
export const validateRNCFromDGII = async (req, res) => {
  try {
    const { rnc } = req.body;

    if (!rnc) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar el RNC a validar',
      });
    }

    const validation = await validateRNC(rnc);

    res.json({
      success: validation.valid,
      data: validation,
    });
  } catch (error) {
    console.error('Error al validar RNC:', error);
    res.status(500).json({
      success: false,
      message: 'Error al validar RNC con la DGII',
      error: error.message,
    });
  }
};

/**
 * @desc    Validar Cédula dominicana
 * @route   POST /api/v1/dgii/validate-cedula
 * @access  Private
 */
export const validateCedulaFromDGII = async (req, res) => {
  try {
    const { cedula } = req.body;

    if (!cedula) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar la cédula a validar',
      });
    }

    const validation = validateCedula(cedula);

    res.json({
      success: validation.valid,
      data: validation,
    });
  } catch (error) {
    console.error('Error al validar cédula:', error);
    res.status(500).json({
      success: false,
      message: 'Error al validar cédula',
      error: error.message,
    });
  }
};

/**
 * @desc    Verificar si RNC/Cédula ya existe en el sistema
 * @route   POST /api/v1/dgii/check-exists
 * @access  Private
 */
export const checkIdentificationExists = async (req, res) => {
  try {
    const { numero_identificacion, tipo } = req.body;

    if (!numero_identificacion) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar el número de identificación',
      });
    }

    let exists = false;
    let entity = null;

    // Buscar en clientes
    const customer = await Customer.findOne({
      where: { numero_identificacion },
      attributes: ['id', 'codigo_cliente', 'nombre_comercial', 'tipo_identificacion'],
    });

    if (customer) {
      exists = true;
      entity = {
        tipo: 'cliente',
        ...customer.toJSON(),
      };
    }

    // Si no está en clientes, buscar en proveedores
    if (!exists && tipo !== 'cliente') {
      const supplier = await Supplier.findOne({
        where: { numero_identificacion },
        attributes: ['id', 'codigo_proveedor', 'nombre_comercial', 'tipo_identificacion'],
      });

      if (supplier) {
        exists = true;
        entity = {
          tipo: 'proveedor',
          ...supplier.toJSON(),
        };
      }
    }

    res.json({
      success: true,
      exists,
      entity,
    });
  } catch (error) {
    console.error('Error al verificar identificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar identificación',
      error: error.message,
    });
  }
};

/**
 * @desc    Validar y crear cliente desde DGII
 * @route   POST /api/v1/dgii/create-customer-from-rnc
 * @access  Private
 */
export const createCustomerFromRNC = async (req, res) => {
  try {
    const { rnc, tipo_identificacion = 'RNC' } = req.body;

    if (!rnc) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar el RNC',
      });
    }

    // Validar con DGII
    const validation = await validateRNC(rnc);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error || 'RNC no válido',
      });
    }

    // Verificar si ya existe
    const exists = await Customer.findOne({
      where: { numero_identificacion: rnc.replace(/\D/g, '') },
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un cliente con ese RNC',
        customer: exists,
      });
    }

    // Generar código de cliente
    const lastCustomer = await Customer.findOne({
      order: [['id', 'DESC']],
      attributes: ['codigo_cliente'],
    });

    let codigo_cliente = 'CLI-00001';
    if (lastCustomer && lastCustomer.codigo_cliente) {
      const lastNumber = parseInt(lastCustomer.codigo_cliente.split('-')[1]);
      codigo_cliente = `CLI-${String(lastNumber + 1).padStart(5, '0')}`;
    }

    // Crear cliente con datos de DGII
    const newCustomer = await Customer.create({
      codigo_cliente,
      tipo_identificacion,
      numero_identificacion: rnc.replace(/\D/g, ''),
      nombre_comercial: validation.razon_social || 'NOMBRE NO DISPONIBLE',
      razon_social: validation.razon_social || 'NOMBRE NO DISPONIBLE',
      tipo_cliente: 'ambos',
      activo: true,
      notas: `Creado automáticamente desde validación DGII. Estado: ${validation.estado}`,
    });

    res.status(201).json({
      success: true,
      message: 'Cliente creado exitosamente desde datos DGII',
      customer: newCustomer,
      dgii_data: validation,
    });
  } catch (error) {
    console.error('Error al crear cliente desde RNC:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear cliente',
      error: error.message,
    });
  }
};