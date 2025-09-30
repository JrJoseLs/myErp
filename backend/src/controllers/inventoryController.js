// backend/src/controllers/inventoryController.js

import { Product, InventoryMovement, Category, User } from '../models/index.js';
import { sequelize } from '../models/index.js';
import { Op } from 'sequelize';

// ============================================
// OBTENER TODOS LOS MOVIMIENTOS DE INVENTARIO
// ============================================

/**
 * @desc    Obtener historial de movimientos de inventario con filtros
 * @route   GET /api/v1/inventory/movements
 * @access  Private/Inventory/Admin
 */
export const getInventoryMovements = async (req, res) => {
  try {
    const {
      producto_id,
      tipo_movimiento,
      fecha_desde,
      fecha_hasta,
      page = 1,
      limit = 50,
    } = req.query;

    // Construir filtros dinámicos
    const where = {};

    if (producto_id) where.producto_id = producto_id;
    if (tipo_movimiento) where.tipo_movimiento = tipo_movimiento;

    // Filtro de rango de fechas
    if (fecha_desde || fecha_hasta) {
      where.fecha_movimiento = {};
      if (fecha_desde) where.fecha_movimiento[Op.gte] = new Date(fecha_desde);
      if (fecha_hasta) where.fecha_movimiento[Op.lte] = new Date(fecha_hasta);
    }

    // Paginación
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: movements } = await InventoryMovement.findAndCountAll({
      where,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'codigo', 'nombre', 'unidad_medida'],
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['nombre'],
            },
          ],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nombre_completo'],
        },
      ],
      order: [['fecha_movimiento', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      success: true,
      count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
      data: movements,
    });
  } catch (error) {
    console.error('Error al obtener movimientos de inventario:', error);
    res.status(500).json({
      message: 'Error al obtener el historial de inventario',
      error: error.message,
    });
  }
};

// ============================================
// OBTENER MOVIMIENTOS DE UN PRODUCTO ESPECÍFICO
// ============================================

/**
 * @desc    Obtener historial de movimientos de un producto
 * @route   GET /api/v1/inventory/movements/product/:id
 * @access  Private/Inventory/Admin
 */
export const getProductMovements = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20 } = req.query;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const movements = await InventoryMovement.findAll({
      where: { producto_id: id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nombre_completo'],
        },
      ],
      order: [['fecha_movimiento', 'DESC']],
      limit: parseInt(limit),
    });

    res.json({
      success: true,
      product: {
        id: product.id,
        codigo: product.codigo,
        nombre: product.nombre,
        stock_actual: product.stock_actual,
      },
      movements,
    });
  } catch (error) {
    console.error('Error al obtener movimientos del producto:', error);
    res.status(500).json({
      message: 'Error al obtener movimientos del producto',
      error: error.message,
    });
  }
};

// ============================================
// CREAR MOVIMIENTO DE INVENTARIO (ENTRADA/SALIDA/AJUSTE)
// ============================================

/**
 * @desc    Registrar un movimiento de inventario
 * @route   POST /api/v1/inventory/movements
 * @access  Private/Inventory/Admin
 */
export const createInventoryMovement = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      producto_id,
      tipo_movimiento,
      cantidad,
      costo_unitario,
      documento_referencia,
      motivo,
    } = req.body;

    // Validar que el producto existe
    const product = await Product.findByPk(producto_id, { transaction });

    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Validar stock disponible para salidas
    if (tipo_movimiento === 'salida' && product.stock_actual < parseInt(cantidad)) {
      await transaction.rollback();
      return res.status(400).json({
        message: 'Stock insuficiente',
        stock_actual: product.stock_actual,
        cantidad_solicitada: cantidad,
      });
    }

    // Calcular nuevo stock según el tipo de movimiento
    let nuevoStock = product.stock_actual;

    switch (tipo_movimiento) {
      case 'entrada':
        nuevoStock += parseInt(cantidad);
        break;
      case 'salida':
        nuevoStock -= parseInt(cantidad);
        break;
      case 'ajuste':
        // En ajuste, la cantidad puede ser positiva o negativa
        nuevoStock = parseInt(cantidad);
        break;
      default:
        await transaction.rollback();
        return res.status(400).json({ message: 'Tipo de movimiento inválido' });
    }

    // Actualizar costo promedio si es entrada con costo_unitario
    if (tipo_movimiento === 'entrada' && costo_unitario) {
      const costoTotalAnterior = product.costo_promedio * product.stock_actual;
      const costoNuevaEntrada = parseFloat(costo_unitario) * parseInt(cantidad);
      const nuevoStockTotal = product.stock_actual + parseInt(cantidad);

      product.costo_promedio = (costoTotalAnterior + costoNuevaEntrada) / nuevoStockTotal;
    }

    // Actualizar stock del producto
    product.stock_actual = nuevoStock;
    await product.save({ transaction });

    // Registrar el movimiento
    const movement = await InventoryMovement.create(
      {
        producto_id,
        tipo_movimiento,
        cantidad: parseInt(cantidad),
        costo_unitario: costo_unitario ? parseFloat(costo_unitario) : product.precio_compra,
        documento_referencia,
        motivo,
        usuario_id: req.user.id,
        fecha_movimiento: new Date(),
      },
      { transaction }
    );

    await transaction.commit();

    // Obtener el movimiento con las relaciones para la respuesta
    const movementWithDetails = await InventoryMovement.findByPk(movement.id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'codigo', 'nombre', 'stock_actual'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nombre_completo'],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Movimiento de inventario registrado exitosamente',
      movement: movementWithDetails,
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear movimiento de inventario:', error);
    res.status(500).json({
      message: 'Error al registrar el movimiento de inventario',
      error: error.message,
    });
  }
};

// ============================================
// OBTENER PRODUCTOS CON STOCK BAJO
// ============================================

/**
 * @desc    Obtener productos con stock por debajo del mínimo
 * @route   GET /api/v1/inventory/low-stock
 * @access  Private/Inventory/Admin
 */
export const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        stock_actual: {
          [Op.lte]: sequelize.col('stock_minimo'),
        },
        activo: true,
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'nombre'],
        },
      ],
      order: [
        [sequelize.literal('stock_actual - stock_minimo'), 'ASC'], // Los más críticos primero
      ],
    });

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('Error al obtener productos con stock bajo:', error);
    res.status(500).json({
      message: 'Error al obtener productos con stock bajo',
      error: error.message,
    });
  }
};

// ============================================
// REPORTE DE VALORIZACIÓN DE INVENTARIO
// ============================================

/**
 * @desc    Obtener valorización del inventario
 * @route   GET /api/v1/inventory/valuation
 * @access  Private/Admin/Accounting
 */
export const getInventoryValuation = async (req, res) => {
  try {
    const { categoria_id } = req.query;

    const where = { activo: true };
    if (categoria_id) where.categoria_id = categoria_id;

    const products = await Product.findAll({
      where,
      attributes: [
        'id',
        'codigo',
        'nombre',
        'stock_actual',
        'costo_promedio',
        'precio_venta',
        [sequelize.literal('stock_actual * costo_promedio'), 'valor_costo'],
        [sequelize.literal('stock_actual * precio_venta'), 'valor_venta'],
      ],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['nombre'],
        },
      ],
      order: [['nombre', 'ASC']],
    });

    // Calcular totales
    const totales = products.reduce(
      (acc, product) => {
        const valorCosto = product.stock_actual * parseFloat(product.costo_promedio);
        const valorVenta = product.stock_actual * parseFloat(product.precio_venta);

        acc.total_costo += valorCosto;
        acc.total_venta += valorVenta;
        acc.total_productos += 1;
        acc.total_unidades += product.stock_actual;

        return acc;
      },
      {
        total_costo: 0,
        total_venta: 0,
        total_productos: 0,
        total_unidades: 0,
      }
    );

    totales.margen_potencial = totales.total_venta - totales.total_costo;
    totales.margen_porcentaje =
      totales.total_costo > 0
        ? ((totales.margen_potencial / totales.total_costo) * 100).toFixed(2)
        : 0;

    res.json({
      success: true,
      totales,
      productos: products,
    });
  } catch (error) {
    console.error('Error al obtener valorización de inventario:', error);
    res.status(500).json({
      message: 'Error al calcular la valorización del inventario',
      error: error.message,
    });
  }
};