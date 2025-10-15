// backend/src/controllers/purchaseController.js

import { Purchase, PurchaseDetail, Supplier, Product, User, sequelize } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * @desc    Obtener todas las compras con filtros
 * @route   GET /api/v1/purchases
 * @access  Private/Admin/Inventory
 */
export const getPurchases = async (req, res) => {
  try {
    const {
      proveedor_id,
      estado,
      fecha_desde,
      fecha_hasta,
      page = 1,
      limit = 20,
    } = req.query;

    const where = {};

    if (proveedor_id) where.proveedor_id = proveedor_id;
    if (estado) where.estado = estado;

    if (fecha_desde || fecha_hasta) {
      where.fecha_compra = {};
      if (fecha_desde) where.fecha_compra[Op.gte] = new Date(fecha_desde);
      if (fecha_hasta) where.fecha_compra[Op.lte] = new Date(fecha_hasta);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: purchases } = await Purchase.findAndCountAll({
      where,
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'codigo_proveedor', 'nombre_comercial', 'numero_identificacion'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nombre_completo'],
        },
      ],
      order: [['fecha_compra', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      success: true,
      count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
      purchases,
    });
  } catch (error) {
    console.error('Error al obtener compras:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las compras',
      error: error.message,
    });
  }
};

/**
 * @desc    Obtener una compra por ID con sus detalles
 * @route   GET /api/v1/purchases/:id
 * @access  Private/Admin/Inventory
 */
export const getPurchaseById = async (req, res) => {
  try {
    const { id } = req.params;

    const purchase = await Purchase.findByPk(id, {
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'codigo_proveedor', 'nombre_comercial', 'numero_identificacion', 'tipo_identificacion'],
        },
        {
          model: PurchaseDetail,
          as: 'details',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'codigo', 'nombre', 'unidad_medida'],
            },
          ],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nombre_completo'],
        },
      ],
    });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Compra no encontrada',
      });
    }

    res.json({
      success: true,
      purchase,
    });
  } catch (error) {
    console.error('Error al obtener compra:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la compra',
      error: error.message,
    });
  }
};

/**
 * @desc    Crear una nueva compra
 * @route   POST /api/v1/purchases
 * @access  Private/Admin/Inventory
 */
export const createPurchase = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      proveedor_id,
      ncf_proveedor,
      fecha_compra,
      fecha_vencimiento,
      tipo_compra,
      productos, // Array de { producto_id, cantidad, precio_unitario, itbis_porcentaje }
      notas,
    } = req.body;

    // Validar que el proveedor existe
    const supplier = await Supplier.findByPk(proveedor_id);
    if (!supplier) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado',
      });
    }

    // Validar que hay productos
    if (!productos || productos.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Debe incluir al menos un producto',
      });
    }

    // Generar número de compra
    const lastPurchase = await Purchase.findOne({
      order: [['id', 'DESC']],
      attributes: ['numero_compra'],
    });

    let numero_compra = 'COMP-00001';
    if (lastPurchase && lastPurchase.numero_compra) {
      const lastNumber = parseInt(lastPurchase.numero_compra.split('-')[1]);
      numero_compra = `COMP-${String(lastNumber + 1).padStart(5, '0')}`;
    }

    // Calcular totales
    let subtotal = 0;
    let itbis_total = 0;

    const detalles = [];

    for (const item of productos) {
      const product = await Product.findByPk(item.producto_id, { transaction });
      
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: `Producto con ID ${item.producto_id} no encontrado`,
        });
      }

      const cantidad = parseInt(item.cantidad);
      const precio_unitario = parseFloat(item.precio_unitario);
      const itbis_porcentaje = parseFloat(item.itbis_porcentaje || 18);

      const subtotal_item = cantidad * precio_unitario;
      const itbis_item = subtotal_item * (itbis_porcentaje / 100);
      const total_item = subtotal_item + itbis_item;

      subtotal += subtotal_item;
      itbis_total += itbis_item;

      detalles.push({
        producto_id: item.producto_id,
        cantidad,
        precio_unitario,
        itbis_porcentaje,
        itbis_monto: itbis_item,
        subtotal: subtotal_item,
        total: total_item,
      });

      // Actualizar stock del producto
      product.stock_actual += cantidad;
      
      // Actualizar costo promedio
      const costoTotalAnterior = product.costo_promedio * (product.stock_actual - cantidad);
      const costoNuevaEntrada = precio_unitario * cantidad;
      product.costo_promedio = (costoTotalAnterior + costoNuevaEntrada) / product.stock_actual;
      
      await product.save({ transaction });
    }

    const total = subtotal + itbis_total;

    // Crear la compra
    const purchase = await Purchase.create(
      {
        numero_compra,
        proveedor_id,
        ncf_proveedor: ncf_proveedor || null,
        fecha_compra,
        fecha_vencimiento: tipo_compra === 'credito' ? fecha_vencimiento : null,
        tipo_compra,
        subtotal,
        itbis: itbis_total,
        total,
        estado: 'recibida',
        notas,
        usuario_id: req.user.id,
      },
      { transaction }
    );

    // Crear los detalles
    const detallesConCompraId = detalles.map(det => ({
      ...det,
      compra_id: purchase.id,
    }));

    await PurchaseDetail.bulkCreate(detallesConCompraId, { transaction });

    await transaction.commit();

    // Obtener la compra completa para la respuesta
    const purchaseComplete = await Purchase.findByPk(purchase.id, {
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'nombre_comercial', 'numero_identificacion'],
        },
        {
          model: PurchaseDetail,
          as: 'details',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'codigo', 'nombre'],
            },
          ],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Compra registrada exitosamente',
      purchase: purchaseComplete,
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear compra:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar la compra',
      error: error.message,
    });
  }
};

/**
 * @desc    Actualizar estado de una compra
 * @route   PUT /api/v1/purchases/:id/status
 * @access  Private/Admin
 */
export const updatePurchaseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const purchase = await Purchase.findByPk(id);

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Compra no encontrada',
      });
    }

    purchase.estado = estado;
    await purchase.save();

    res.json({
      success: true,
      message: 'Estado actualizado correctamente',
      purchase,
    });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el estado',
      error: error.message,
    });
  }
};

/**
 * @desc    Eliminar una compra (solo si está pendiente)
 * @route   DELETE /api/v1/purchases/:id
 * @access  Private/Admin
 */
export const deletePurchase = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const purchase = await Purchase.findByPk(id, {
      include: [{ model: PurchaseDetail, as: 'details' }],
      transaction,
    });

    if (!purchase) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Compra no encontrada',
      });
    }

    if (purchase.estado === 'recibida') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar una compra recibida. Debe revertir el inventario primero.',
      });
    }

    // Eliminar detalles
    await PurchaseDetail.destroy({
      where: { compra_id: id },
      transaction,
    });

    // Eliminar compra
    await purchase.destroy({ transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Compra eliminada correctamente',
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al eliminar compra:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la compra',
      error: error.message,
    });
  }
};

export default {
  getPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchaseStatus,
  deletePurchase,
};