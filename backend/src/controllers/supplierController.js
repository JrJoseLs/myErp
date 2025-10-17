// backend/src/controllers/supplierController.js
import { Supplier } from '../models/index.js';
import { Op } from 'sequelize';
import { validateRNC } from '../services/dgiiService.js';

/**
 * @desc    Obtener todos los proveedores
 * @route   GET /api/v1/suppliers
 * @access  Private
 */
export const getSuppliers = async (req, res) => {
  try {
    const { activo, search, page = 1, limit = 20 } = req.query;

    const where = {};

    if (activo !== undefined) {
      where.activo = activo === 'true';
    }

    if (search) {
      where[Op.or] = [
        { nombre_comercial: { [Op.like]: `%${search}%` } },
        { razon_social: { [Op.like]: `%${search}%` } },
        { numero_identificacion: { [Op.like]: `%${search}%` } },
        { codigo_proveedor: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: suppliers } = await Supplier.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      success: true,
      count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
      suppliers,
    });
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener proveedores',
      error: error.message,
    });
  }
};

/**
 * @desc    Obtener un proveedor por ID
 * @route   GET /api/v1/suppliers/:id
 * @access  Private
 */
export const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;

    const supplier = await Supplier.findByPk(id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado',
      });
    }

    res.json({
      success: true,
      supplier,
    });
  } catch (error) {
    console.error('Error al obtener proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener proveedor',
      error: error.message,
    });
  }
};

/**
 * @desc    Crear un nuevo proveedor
 * @route   POST /api/v1/suppliers
 * @access  Private/Admin
 */
export const createSupplier = async (req, res) => {
  try {
    const {
      tipo_identificacion,
      numero_identificacion,
      nombre_comercial,
      razon_social,
      email,
      telefono,
      celular,
      direccion,
      ciudad,
      provincia,
      contacto_nombre,
      contacto_telefono,
      dias_pago,
      notas,
    } = req.body;

    // Validar que no exista ya
    const exists = await Supplier.findOne({
      where: { numero_identificacion },
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un proveedor con ese RNC/Cédula',
      });
    }

    // Validar con DGII si es RNC
    if (tipo_identificacion === 'RNC') {
      const validation = await validateRNC(numero_identificacion);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: 'RNC no válido según la DGII',
          validation,
        });
      }
    }

    // Generar código de proveedor
    const lastSupplier = await Supplier.findOne({
      order: [['id', 'DESC']],
      attributes: ['codigo_proveedor'],
    });

    let codigo_proveedor = 'PROV-00001';
    if (lastSupplier && lastSupplier.codigo_proveedor) {
      const lastNumber = parseInt(lastSupplier.codigo_proveedor.split('-')[1]);
      codigo_proveedor = `PROV-${String(lastNumber + 1).padStart(5, '0')}`;
    }

    // Crear proveedor
    const supplier = await Supplier.create({
      codigo_proveedor,
      tipo_identificacion,
      numero_identificacion: numero_identificacion.replace(/\D/g, ''),
      nombre_comercial,
      razon_social: razon_social || nombre_comercial,
      email,
      telefono,
      celular,
      direccion,
      ciudad,
      provincia,
      contacto_nombre,
      contacto_telefono,
      dias_pago: dias_pago || 30,
      notas,
      activo: true,
    });

    res.status(201).json({
      success: true,
      message: 'Proveedor creado exitosamente',
      supplier,
    });
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear proveedor',
      error: error.message,
    });
  }
};

/**
 * @desc    Actualizar un proveedor
 * @route   PUT /api/v1/suppliers/:id
 * @access  Private/Admin
 */
export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const supplier = await Supplier.findByPk(id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado',
      });
    }

    // Si cambia el RNC, verificar que no exista
    if (updateData.numero_identificacion && updateData.numero_identificacion !== supplier.numero_identificacion) {
      const exists = await Supplier.findOne({
        where: {
          numero_identificacion: updateData.numero_identificacion,
          id: { [Op.ne]: id },
        },
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe otro proveedor con ese RNC/Cédula',
        });
      }
    }

    await supplier.update(updateData);

    res.json({
      success: true,
      message: 'Proveedor actualizado exitosamente',
      supplier,
    });
  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar proveedor',
      error: error.message,
    });
  }
};

/**
 * @desc    Eliminar (desactivar) un proveedor
 * @route   DELETE /api/v1/suppliers/:id
 * @access  Private/Admin
 */
export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const supplier = await Supplier.findByPk(id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado',
      });
    }

    // Desactivar en lugar de eliminar
    await supplier.update({ activo: false });

    res.json({
      success: true,
      message: 'Proveedor desactivado exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar proveedor',
      error: error.message,
    });
  }
};

export default {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};