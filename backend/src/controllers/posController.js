// backend/src/controllers/posController.js
// Punto de Venta - Interfaz rápida para ventas

import {
  Invoice,
  InvoiceDetail,
  Customer,
  Product,
  User,
  NCF,
  AccountsReceivable,
  InventoryMovement,
  Payment,
  sequelize,
} from '../models/index.js';
import { Op } from 'sequelize';

/**
 * @desc    Buscar productos para POS (búsqueda rápida)
 * @route   GET /api/v1/pos/products/search
 * @access  Private
 */
export const searchProducts = async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Debe ingresar al menos 2 caracteres para buscar',
      });
    }

    const products = await Product.findAll({
      where: {
        activo: true,
        [Op.or]: [
          { codigo: { [Op.like]: `%${query}%` } },
          { nombre: { [Op.like]: `%${query}%` } },
        ],
      },
      attributes: [
        'id',
        'codigo',
        'nombre',
        'precio_venta',
        'stock_actual',
        'itbis_aplicable',
        'tasa_itbis',
        'unidad_medida',
      ],
      limit: parseInt(limit),
      order: [['nombre', 'ASC']],
    });

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error('Error en búsqueda de productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar productos',
      error: error.message,
    });
  }
};

/**
 * @desc    Obtener producto por código de barras
 * @route   GET /api/v1/pos/products/barcode/:codigo
 * @access  Private
 */
export const getProductByBarcode = async (req, res) => {
  try {
    const { codigo } = req.params;

    const product = await Product.findOne({
      where: {
        codigo,
        activo: true,
      },
      attributes: [
        'id',
        'codigo',
        'nombre',
        'precio_venta',
        'stock_actual',
        'itbis_aplicable',
        'tasa_itbis',
        'unidad_medida',
      ],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
    }

    if (product.stock_actual <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Producto sin stock disponible',
        product,
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Error al buscar producto por código:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar producto',
      error: error.message,
    });
  }
};

/**
 * @desc    Crear venta rápida (POS)
 * @route   POST /api/v1/pos/sale
 * @access  Private
 */
export const createPOSSale = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      cliente_id,
      items,
      tipo_ncf = 'B02', // Por defecto B02 (Consumo)
      tipo_venta = 'contado',
      metodo_pago = 'efectivo',
      monto_recibido,
      descuento = 0,
      notas,
    } = req.body;

    // Validar items
    if (!items || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Debe agregar al menos un producto',
      });
    }

    // Validar cliente
    const customer = await Customer.findByPk(cliente_id);
    if (!customer) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado',
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

    // Obtener NCF
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

    // Validar vencimiento NCF
    const hoy = new Date();
    const vencimiento = new Date(ncfRange.fecha_vencimiento);
    if (hoy > vencimiento) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `El rango de NCF tipo ${tipo_ncf} está vencido`,
      });
    }

    const ncf = ncfRange.secuencia_actual;

    // Calcular totales
    let subtotal = 0;
    let itbis = 0;
    const invoiceDetails = [];

    for (const item of items) {
      const product = await Product.findByPk(item.producto_id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!product) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: `Producto con ID ${item.producto_id} no encontrado`,
        });
      }

      if (product.stock_actual < item.cantidad) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente para ${product.nombre}`,
          disponible: product.stock_actual,
          solicitado: item.cantidad,
        });
      }

      const precio_unitario = item.precio_unitario || product.precio_venta;
      const cantidad = parseInt(item.cantidad);
      const descuento_item = parseFloat(item.descuento) || 0;

      const subtotal_item = precio_unitario * cantidad - descuento_item;

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

    // Validar monto recibido en contado
    if (tipo_venta === 'contado') {
      if (!monto_recibido || parseFloat(monto_recibido) < total) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Monto recibido insuficiente',
          total,
          recibido: monto_recibido,
        });
      }
    }

    const balance_pendiente = tipo_venta === 'credito' ? total : 0;

    // Crear factura
    const invoice = await Invoice.create(
      {
        numero_factura,
        ncf,
        tipo_ncf,
        cliente_id,
        fecha_emision: new Date(),
        tipo_venta,
        moneda: 'DOP',
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

    // Crear detalles y actualizar inventario
    for (const detail of invoiceDetails) {
      await InvoiceDetail.create(
        {
          factura_id: invoice.id,
          ...detail,
        },
        { transaction }
      );

      // Actualizar stock
      const product = await Product.findByPk(detail.producto_id, { transaction });
      product.stock_actual -= detail.cantidad;
      await product.save({ transaction });

      // Registrar movimiento
      await InventoryMovement.create(
        {
          producto_id: detail.producto_id,
          tipo_movimiento: 'salida',
          cantidad: detail.cantidad,
          documento_referencia: numero_factura,
          motivo: `Venta POS - ${numero_factura}`,
          usuario_id: req.user.id,
          fecha_movimiento: new Date(),
        },
        { transaction }
      );
    }

    // Registrar pago si es contado
    if (tipo_venta === 'contado') {
      const lastPayment = await Payment.findOne({
        order: [['id', 'DESC']],
        attributes: ['numero_recibo'],
      });

      let numero_recibo = 'REC-00001';
      if (lastPayment && lastPayment.numero_recibo) {
        const lastNumber = parseInt(lastPayment.numero_recibo.split('-')[1]);
        numero_recibo = `REC-${String(lastNumber + 1).padStart(5, '0')}`;
      }

      await Payment.create(
        {
          factura_id: invoice.id,
          numero_recibo,
          fecha_pago: new Date(),
          monto_pagado: total,
          metodo_pago,
          referencia: `Pago POS - ${numero_factura}`,
          usuario_id: req.user.id,
        },
        { transaction }
      );
    }

    // Si es a crédito, crear cuenta por cobrar
    if (tipo_venta === 'credito') {
      const fechaVencimiento = new Date();
      fechaVencimiento.setDate(fechaVencimiento.getDate() + (customer.dias_credito || 30));

      await AccountsReceivable.create(
        {
          factura_id: invoice.id,
          cliente_id,
          monto_original: total,
          monto_pagado: 0,
          balance_pendiente: total,
          fecha_vencimiento: fechaVencimiento,
          estado: 'vigente',
        },
        { transaction }
      );

      customer.balance_actual += total;
      await customer.save({ transaction });
    }

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

    await transaction.commit();

    // Calcular cambio
    const cambio = tipo_venta === 'contado' ? parseFloat(monto_recibido) - total : 0;

    // Obtener factura completa
    const invoiceComplete = await Invoice.findByPk(invoice.id, {
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['nombre_comercial', 'numero_identificacion'],
        },
        {
          model: InvoiceDetail,
          as: 'details',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['codigo', 'nombre', 'unidad_medida'],
            },
          ],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Venta registrada exitosamente',
      invoice: invoiceComplete,
      cambio: cambio.toFixed(2),
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error en venta POS:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la venta',
      error: error.message,
    });
  }
};

/**
 * @desc    Obtener ventas del día (para cierre de caja)
 * @route   GET /api/v1/pos/daily-sales
 * @access  Private
 */
export const getDailySales = async (req, res) => {
  try {
    const { fecha } = req.query;
    const targetDate = fecha ? new Date(fecha) : new Date();
    
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const invoices = await Invoice.findAll({
      where: {
        fecha_emision: {
          [Op.between]: [startOfDay, endOfDay],
        },
        anulada: false,
        vendedor_id: req.user.id, // Solo del vendedor actual
      },
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['nombre_comercial'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    // Calcular totales
    const totales = invoices.reduce(
      (acc, inv) => {
        acc.cantidad_facturas += 1;
        acc.total_ventas += parseFloat(inv.total);
        acc.total_itbis += parseFloat(inv.itbis);
        
        if (inv.tipo_venta === 'contado') {
          acc.ventas_contado += parseFloat(inv.total);
        } else {
          acc.ventas_credito += parseFloat(inv.total);
        }

        return acc;
      },
      {
        cantidad_facturas: 0,
        total_ventas: 0,
        total_itbis: 0,
        ventas_contado: 0,
        ventas_credito: 0,
      }
    );

    res.json({
      success: true,
      fecha: targetDate.toISOString().split('T')[0],
      totales,
      facturas: invoices,
    });
  } catch (error) {
    console.error('Error al obtener ventas del día:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ventas del día',
      error: error.message,
    });
  }
};

/**
 * @desc    Cerrar caja (resumen del día)
 * @route   POST /api/v1/pos/close-register
 * @access  Private
 */
export const closeRegister = async (req, res) => {
  try {
    const { efectivo_contado, notas } = req.body;

    // Obtener ventas del día
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const invoices = await Invoice.findAll({
      where: {
        fecha_emision: {
          [Op.between]: [startOfDay, endOfDay],
        },
        anulada: false,
        vendedor_id: req.user.id,
      },
    });

    const payments = await Payment.findAll({
      where: {
        fecha_pago: {
          [Op.between]: [startOfDay, endOfDay],
        },
        usuario_id: req.user.id,
      },
    });

    // Calcular totales por método de pago
    const totalesPorMetodo = payments.reduce((acc, pago) => {
      const metodo = pago.metodo_pago;
      if (!acc[metodo]) acc[metodo] = 0;
      acc[metodo] += parseFloat(pago.monto_pagado);
      return acc;
    }, {});

    const totalVentas = invoices.reduce((sum, inv) => sum + parseFloat(inv.total), 0);
    const totalEfectivoSistema = totalesPorMetodo.efectivo || 0;
    const diferencia = parseFloat(efectivo_contado || 0) - totalEfectivoSistema;

    res.json({
      success: true,
      fecha: new Date().toISOString().split('T')[0],
      resumen: {
        total_facturas: invoices.length,
        total_ventas: totalVentas.toFixed(2),
        por_metodo: totalesPorMetodo,
        efectivo_sistema: totalEfectivoSistema.toFixed(2),
        efectivo_contado: parseFloat(efectivo_contado || 0).toFixed(2),
        diferencia: diferencia.toFixed(2),
      },
      notas,
    });
  } catch (error) {
    console.error('Error al cerrar caja:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cerrar caja',
      error: error.message,
    });
  }
};