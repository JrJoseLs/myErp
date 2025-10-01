// backend/src/controllers/invoiceController.js

import { 
  Invoice, 
  InvoiceDetail, 
  Customer, 
  Product, 
  User,
  NCF,
  AccountsReceivable,
  InventoryMovement,
  sequelize 
} from '../models/index.js';
import { Op } from 'sequelize';

/**
 * @desc    Obtener todas las facturas con filtros
 * @route   GET /api/v1/invoices
 * @access  Private
 */
export const getInvoices = async (req, res) => {
  try {
    const {
      search,
      cliente_id,
      estado,
      tipo_venta,
      fecha_desde,
      fecha_hasta,
      page = 1,
      limit = 50,
    } = req.query;

    const where = {};

    // Búsqueda por número de factura o NCF
    if (search) {
      where[Op.or] = [
        { numero_factura: { [Op.like]: `%${search}%` } },
        { ncf: { [Op.like]: `%${search}%` } },
      ];
    }

    if (cliente_id) where.cliente_id = cliente_id;
    if (estado) where.estado = estado;
    if (tipo_venta) where.tipo_venta = tipo_venta;

    // Filtro de rango de fechas
    if (fecha_desde || fecha_hasta) {
      where.fecha_emision = {};
      if (fecha_desde) where.fecha_emision[Op.gte] = fecha_desde;
      if (fecha_hasta) where.fecha_emision[Op.lte] = fecha_hasta;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: invoices } = await Invoice.findAndCountAll({
      where,
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'nombre_comercial', 'numero_identificacion'],
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'nombre_completo'],
        },
      ],
      order: [['fecha_emision', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      success: true,
      count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
      invoices,
    });
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener facturas',
      error: error.message,
    });
  }
};

/**
 * @desc    Obtener factura por ID con detalles
 * @route   GET /api/v1/invoices/:id
 * @access  Private
 */
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        {
          model: Customer,
          as: 'customer',
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'nombre_completo'],
        },
        {
          model: InvoiceDetail,
          as: 'details',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'codigo', 'nombre', 'unidad_medida'],
            },
          ],
        },
      ],
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada',
      });
    }

    res.json({
      success: true,
      invoice,
    });
  } catch (error) {
    console.error('Error al obtener factura:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la factura',
      error: error.message,
    });
  }
};

/**
 * @desc    Crear nueva factura
 * @route   POST /api/v1/invoices
 * @access  Private
 */
export const createInvoice = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      cliente_id,
      tipo_ncf,
      fecha_emision,
      fecha_vencimiento,
      tipo_venta,
      moneda,
      descuento,
      notas,
      items, // Array de productos
    } = req.body;

    // Validar cliente
    const customer = await Customer.findByPk(cliente_id);
    if (!customer) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado',
      });
    }

    // Validar items
    if (!items || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Debe agregar al menos un producto a la factura',
      });
    }

    // Generar número de factura
    const lastInvoice = await Invoice.findOne({
      order: [['id', 'DESC']],
      attributes: ['numero_factura'],
    });

    let numero_factura = 'FAC-00001';
    if (lastInvoice && lastInvoice.numero_factura) {
      const lastNumber = parseInt(lastInvoice.numero_factura.split('-')[1]);
      numero_factura = `FAC-${String(lastNumber + 1).padStart(5, '0')}`;
    }

    // Obtener NCF si aplica
    let ncf = null;
    if (tipo_ncf) {
      const ncfRange = await NCF.findOne({
        where: {
          tipo_ncf,
          activo: true,
          agotado: false,
        },
        transaction,
      });

      if (!ncfRange) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `No hay rango activo de NCF tipo ${tipo_ncf}`,
        });
      }

      ncf = ncfRange.secuencia_actual;

      // Incrementar NCF
      const prefijo = ncfRange.secuencia_actual.substring(0, 3);
      const numero = parseInt(ncfRange.secuencia_actual.substring(3));
      const siguienteNCF = `${prefijo}${String(numero + 1).padStart(8, '0')}`;

      ncfRange.secuencia_actual = siguienteNCF;
      if (siguienteNCF > ncfRange.secuencia_hasta) {
        ncfRange.agotado = true;
        ncfRange.activo = false;
      }
      await ncfRange.save({ transaction });
    }

    // Calcular totales
    let subtotal = 0;
    let itbis = 0;
    const invoiceDetails = [];

    for (const item of items) {
      const product = await Product.findByPk(item.producto_id, { transaction });

      if (!product) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: `Producto con ID ${item.producto_id} no encontrado`,
        });
      }

      // Validar stock disponible
      if (product.stock_actual < item.cantidad) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente para ${product.nombre}. Disponible: ${product.stock_actual}`,
        });
      }

      const precio_unitario = item.precio_unitario || product.precio_venta;
      const cantidad = parseInt(item.cantidad);
      const descuento_item = parseFloat(item.descuento) || 0;

      const subtotal_item = (precio_unitario * cantidad) - descuento_item;
      
      let itbis_item = 0;
      let itbis_porcentaje = 0;
      
      if (product.itbis_aplicable) {
        itbis_porcentaje = product.tasa_itbis;
        itbis_item = subtotal_item * (itbis_porcentaje / 100);
      }

      const total_item = subtotal_item + itbis_item;

      subtotal += subtotal_item;
      itbis += itbis_item;

      invoiceDetails.push({
        producto_id: product.id,
        cantidad,
        precio_unitario,
        descuento: descuento_item,
        itbis_porcentaje,
        itbis_monto: itbis_item,
        subtotal: subtotal_item,
        total: total_item,
      });
    }

    const descuento_global = parseFloat(descuento) || 0;
    const total = subtotal + itbis - descuento_global;
    const balance_pendiente = tipo_venta === 'credito' ? total : 0;

    // Crear factura
    const invoice = await Invoice.create(
      {
        numero_factura,
        ncf,
        tipo_ncf,
        cliente_id,
        fecha_emision: fecha_emision || new Date(),
        fecha_vencimiento,
        tipo_venta: tipo_venta || 'contado',
        moneda: moneda || 'DOP',
        subtotal,
        descuento: descuento_global,
        itbis,
        total,
        monto_pagado: tipo_venta === 'contado' ? total : 0,
        balance_pendiente,
        estado: tipo_venta === 'contado' ? 'pagada' : 'pendiente',
        notas,
        vendedor_id: req.user.id,
        anulada: false,
      },
      { transaction }
    );

    // Crear detalles de factura
    for (const detail of invoiceDetails) {
      await InvoiceDetail.create(
        {
          factura_id: invoice.id,
          ...detail,
        },
        { transaction }
      );

      // Actualizar stock del producto (salida)
      const product = await Product.findByPk(detail.producto_id, { transaction });
      product.stock_actual -= detail.cantidad;
      await product.save({ transaction });

      // Registrar movimiento de inventario
      await InventoryMovement.create(
        {
          producto_id: detail.producto_id,
          tipo_movimiento: 'salida',
          cantidad: detail.cantidad,
          documento_referencia: numero_factura,
          motivo: `Venta - Factura ${numero_factura}`,
          usuario_id: req.user.id,
          fecha_movimiento: new Date(),
        },
        { transaction }
      );
    }

    // Si es a crédito, crear cuenta por cobrar
    if (tipo_venta === 'credito') {
      await AccountsReceivable.create(
        {
          factura_id: invoice.id,
          cliente_id,
          monto_original: total,
          monto_pagado: 0,
          balance_pendiente: total,
          fecha_vencimiento: fecha_vencimiento || new Date(),
          estado: 'vigente',
        },
        { transaction }
      );

      // Actualizar balance del cliente
      customer.balance_actual += total;
      await customer.save({ transaction });
    }

    await transaction.commit();

    // Obtener factura con relaciones
    const invoiceWithDetails = await Invoice.findByPk(invoice.id, {
      include: [
        {
          model: Customer,
          as: 'customer',
        },
        {
          model: InvoiceDetail,
          as: 'details',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'codigo', 'nombre', 'unidad_medida'],
            },
          ],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Factura creada exitosamente',
      invoice: invoiceWithDetails,
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear factura:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la factura',
      error: error.message,
    });
  }
};

/**
 * @desc    Anular factura
 * @route   PATCH /api/v1/invoices/:id/anular
 * @access  Private
 */
export const anularInvoice = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { motivo_anulacion } = req.body;

    if (!motivo_anulacion) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Debe especificar el motivo de anulación',
      });
    }

    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        {
          model: InvoiceDetail,
          as: 'details',
        },
      ],
      transaction,
    });

    if (!invoice) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada',
      });
    }

    if (invoice.anulada) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'La factura ya está anulada',
      });
    }

    // Reversar stock de productos
    for (const detail of invoice.details) {
      const product = await Product.findByPk(detail.producto_id, { transaction });
      product.stock_actual += detail.cantidad;
      await product.save({ transaction });

      // Registrar movimiento de inventario de reversión
      await InventoryMovement.create(
        {
          producto_id: detail.producto_id,
          tipo_movimiento: 'entrada',
          cantidad: detail.cantidad,
          documento_referencia: invoice.numero_factura,
          motivo: `Anulación de factura ${invoice.numero_factura} - ${motivo_anulacion}`,
          usuario_id: req.user.id,
          fecha_movimiento: new Date(),
        },
        { transaction }
      );
    }

    // Si era a crédito, actualizar balance del cliente
    if (invoice.tipo_venta === 'credito') {
      const customer = await Customer.findByPk(invoice.cliente_id, { transaction });
      customer.balance_actual -= invoice.balance_pendiente;
      await customer.save({ transaction });

      // Actualizar cuenta por cobrar
      const accountReceivable = await AccountsReceivable.findOne({
        where: { factura_id: invoice.id },
        transaction,
      });

      if (accountReceivable) {
        accountReceivable.estado = 'cobrada';
        accountReceivable.balance_pendiente = 0;
        await accountReceivable.save({ transaction });
      }
    }

    // Marcar factura como anulada
    invoice.anulada = true;
    invoice.estado = 'anulada';
    invoice.motivo_anulacion = motivo_anulacion;
    invoice.fecha_anulacion = new Date();
    await invoice.save({ transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Factura anulada exitosamente',
      invoice,
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al anular factura:', error);
    res.status(500).json({
      success: false,
      message: 'Error al anular la factura',
      error: error.message,
    });
  }
};

/**
 * @desc    Registrar pago de factura
 * @route   POST /api/v1/invoices/:id/payments
 * @access  Private
 */
export const registerPayment = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { monto_pagado, metodo_pago, referencia, notas } = req.body;

    const invoice = await Invoice.findByPk(req.params.id, { transaction });

    if (!invoice) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada',
      });
    }

    if (invoice.anulada) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'No se puede registrar pago en una factura anulada',
      });
    }

    const montoPago = parseFloat(monto_pagado);

    if (montoPago <= 0 || montoPago > invoice.balance_pendiente) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Monto de pago inválido',
      });
    }

    // Generar número de recibo
    const Payment = sequelize.models.Payment;
    const lastPayment = await Payment.findOne({
      order: [['id', 'DESC']],
      attributes: ['numero_recibo'],
    });

    let numero_recibo = 'REC-00001';
    if (lastPayment && lastPayment.numero_recibo) {
      const lastNumber = parseInt(lastPayment.numero_recibo.split('-')[1]);
      numero_recibo = `REC-${String(lastNumber + 1).padStart(5, '0')}`;
    }

    // Crear registro de pago
    const payment = await Payment.create(
      {
        factura_id: invoice.id,
        numero_recibo,
        fecha_pago: new Date(),
        monto_pagado: montoPago,
        metodo_pago,
        referencia,
        notas,
        usuario_id: req.user.id,
      },
      { transaction }
    );

    // Actualizar factura
    invoice.monto_pagado += montoPago;
    invoice.balance_pendiente -= montoPago;

    if (invoice.balance_pendiente <= 0) {
      invoice.estado = 'pagada';
    } else {
      invoice.estado = 'parcial';
    }

    await invoice.save({ transaction });

    // Actualizar cuenta por cobrar
    const accountReceivable = await AccountsReceivable.findOne({
      where: { factura_id: invoice.id },
      transaction,
    });

    if (accountReceivable) {
      accountReceivable.monto_pagado += montoPago;
      accountReceivable.balance_pendiente -= montoPago;

      if (accountReceivable.balance_pendiente <= 0) {
        accountReceivable.estado = 'cobrada';
      }

      await accountReceivable.save({ transaction });
    }

    // Actualizar balance del cliente
    const customer = await Customer.findByPk(invoice.cliente_id, { transaction });
    customer.balance_actual -= montoPago;
    await customer.save({ transaction });

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Pago registrado exitosamente',
      payment,
      invoice: {
        id: invoice.id,
        numero_factura: invoice.numero_factura,
        monto_pagado: invoice.monto_pagado,
        balance_pendiente: invoice.balance_pendiente,
        estado: invoice.estado,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al registrar pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar el pago',
      error: error.message,
    });
  }
};

/**
 * @desc    Obtener estadísticas de facturación
 * @route   GET /api/v1/invoices/stats
 * @access  Private
 */
export const getInvoiceStats = async (req, res) => {
  try {
    const { fecha_desde, fecha_hasta } = req.query;

    const where = { anulada: false };

    if (fecha_desde || fecha_hasta) {
      where.fecha_emision = {};
      if (fecha_desde) where.fecha_emision[Op.gte] = fecha_desde;
      if (fecha_hasta) where.fecha_emision[Op.lte] = fecha_hasta;
    }

    const stats = await Invoice.findAll({
      where,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_facturas'],
        [sequelize.fn('SUM', sequelize.col('total')), 'monto_total'],
        [sequelize.fn('SUM', sequelize.col('itbis')), 'itbis_total'],
        [sequelize.fn('SUM', sequelize.col('balance_pendiente')), 'balance_pendiente'],
      ],
      raw: true,
    });

    const porEstado = await Invoice.findAll({
      where,
      attributes: [
        'estado',
        [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad'],
        [sequelize.fn('SUM', sequelize.col('total')), 'monto'],
      ],
      group: ['estado'],
      raw: true,
    });

    res.json({
      success: true,
      stats: stats[0],
      porEstado,
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de facturación',
      error: error.message,
    });
  }
};