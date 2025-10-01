// backend/src/controllers/customerController.js

import { Customer } from '../models/index.js';
import { Op } from 'sequelize';

const EXCLUDE_FIELDS = ['created_at', 'updated_at'];

/**
 * @desc    Obtener todos los clientes con filtros
 * @route   GET /api/v1/customers
 * @access  Private
 */
export const getCustomers = async (req, res) => {
  try {
    const {
      search,
      tipo_cliente,
      activo,
      page = 1,
      limit = 50,
    } = req.query;

    const where = {};

    // Búsqueda por nombre, código o identificación
    if (search) {
      where[Op.or] = [
        { codigo_cliente: { [Op.like]: `%${search}%` } },
        { nombre_comercial: { [Op.like]: `%${search}%` } },
        { numero_identificacion: { [Op.like]: `%${search}%` } },
      ];
    }

    if (tipo_cliente) where.tipo_cliente = tipo_cliente;
    if (activo !== undefined) where.activo = activo === 'true';

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: customers } = await Customer.findAndCountAll({
      where,
      attributes: { exclude: EXCLUDE_FIELDS },
      order: [['nombre_comercial', 'ASC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      success: true,
      count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
      customers,
    });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener clientes',
      error: error.message,
    });
  }
};

/**
 * @desc    Obtener cliente por ID
 * @route   GET /api/v1/customers/:id
 * @access  Private
 */
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id, {
      attributes: { exclude: EXCLUDE_FIELDS },
    });

    if (customer) {
      res.json({
        success: true,
        customer,
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Cliente no encontrado',
      });
    }
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el cliente',
      error: error.message,
    });
  }
};

/**
 * @desc    Crear cliente
 * @route   POST /api/v1/customers
 * @access  Private
 */
export const createCustomer = async (req, res) => {
  const {
    codigo_cliente,
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
    limite_credito,
    dias_credito,
    tipo_cliente,
    notas,
  } = req.body;

  try {
    // Validar que no exista el código de cliente
    const customerExists = await Customer.findOne({
      where: {
        [Op.or]: [
          { codigo_cliente },
          { numero_identificacion },
        ],
      },
    });

    if (customerExists) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un cliente con ese código o número de identificación',
      });
    }

    const newCustomer = await Customer.create({
      codigo_cliente,
      tipo_identificacion,
      numero_identificacion,
      nombre_comercial,
      razon_social: razon_social || nombre_comercial,
      email,
      telefono,
      celular,
      direccion,
      ciudad,
      provincia,
      limite_credito: limite_credito || 0,
      balance_actual: 0,
      dias_credito: dias_credito || 0,
      tipo_cliente: tipo_cliente || 'contado',
      activo: true,
      notas,
    });

    res.status(201).json({
      success: true,
      message: 'Cliente creado exitosamente',
      customer: newCustomer,
    });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el cliente',
      error: error.message,
    });
  }
};

/**
 * @desc    Actualizar cliente
 * @route   PUT /api/v1/customers/:id
 * @access  Private
 */
export const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado',
      });
    }

    // Validar duplicados (excluyendo el actual)
    if (req.body.numero_identificacion && req.body.numero_identificacion !== customer.numero_identificacion) {
      const exists = await Customer.findOne({
        where: {
          numero_identificacion: req.body.numero_identificacion,
          id: { [Op.not]: req.params.id },
        },
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe otro cliente con ese número de identificación',
        });
      }
    }

    // Actualizar campos
    await customer.update(req.body);

    res.json({
      success: true,
      message: 'Cliente actualizado exitosamente',
      customer,
    });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el cliente',
      error: error.message,
    });
  }
};

/**
 * @desc    Alternar estado activo/inactivo
 * @route   PATCH /api/v1/customers/toggle-status/:id
 * @access  Private
 */
export const toggleCustomerStatus = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado',
      });
    }

    customer.activo = !customer.activo;
    await customer.save();

    res.json({
      success: true,
      message: `Cliente ${customer.activo ? 'activado' : 'desactivado'} correctamente`,
      customer,
    });
  } catch (error) {
    console.error('Error al cambiar estado del cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar el estado del cliente',
      error: error.message,
    });
  }
};

/**
 * @desc    Generar código de cliente automático
 * @route   GET /api/v1/customers/generate-code
 * @access  Private
 */
export const generateCustomerCode = async (req, res) => {
  try {
    // Obtener el último código
    const lastCustomer = await Customer.findOne({
      order: [['id', 'DESC']],
      attributes: ['codigo_cliente'],
    });

    let newCode = 'CLI-00001';

    if (lastCustomer && lastCustomer.codigo_cliente) {
      // Extraer el número del último código
      const lastNumber = parseInt(lastCustomer.codigo_cliente.split('-')[1]);
      const nextNumber = lastNumber + 1;
      newCode = `CLI-${String(nextNumber).padStart(5, '0')}`;
    }

    res.json({
      success: true,
      codigo: newCode,
    });
  } catch (error) {
    console.error('Error al generar código:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar código de cliente',
      error: error.message,
    });
  }
};