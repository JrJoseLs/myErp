// backend/src/controllers/inventoryController.js
// VERSIÓN COMPLETA: Con soporte para proveedores formales E informales

import { Product, InventoryMovement, Category, User, Purchase, PurchaseDetail, Supplier, sequelize } from '../models/index.js';
import { Op } from 'sequelize';

// ... (funciones getInventoryMovements, getProductMovements sin cambios)

/**
 * @desc    Registrar movimiento de inventario con soporte para proveedores formales e informales
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
      // Campos de compra
      es_compra,
      tipo_proveedor, // 'formal' | 'informal'
      proveedor_id,
      ncf_proveedor,
      fecha_compra,
      // Campos para proveedor informal
      proveedor_informal_nombre,
      proveedor_informal_cedula,
    } = req.body;

    // Validar que el producto existe
    const product = await Product.findByPk(producto_id, { transaction });

    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Validaciones para compra
    if (es_compra && tipo_movimiento === 'entrada') {
      if (tipo_proveedor === 'formal') {
        // Validar proveedor formal
        if (!proveedor_id || !ncf_proveedor) {
          await transaction.rollback();
          return res.status(400).json({
            message: 'Para proveedor formal se requiere proveedor_id y NCF',
          });
        }

        const supplier = await Supplier.findByPk(proveedor_id, { transaction });
        if (!supplier) {
          await transaction.rollback();
          return res.status(404).json({ message: 'Proveedor no encontrado' });
        }
      } else if (tipo_proveedor === 'informal') {
        // Validar proveedor informal
        if (!proveedor_informal_nombre || !proveedor_informal_cedula) {
          await transaction.rollback();
          return res.status(400).json({
            message: 'Para proveedor informal se requiere nombre y cédula',
          });
        }

        // Validar formato de cédula (básico)
        const cedula = proveedor_informal_cedula.replace(/-/g, '');
        if (cedula.length !== 11 || !/^\d+$/.test(cedula)) {
          await transaction.rollback();
          return res.status(400).json({
            message: 'La cédula debe tener 11 dígitos numéricos',
          });
        }
      } else {
        await transaction.rollback();
        return res.status(400).json({
          message: 'tipo_proveedor debe ser "formal" o "informal"',
        });
      }
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

    // Calcular nuevo stock
    let nuevoStock = product.stock_actual;

    switch (tipo_movimiento) {
      case 'entrada':
        nuevoStock += parseInt(cantidad);
        break;
      case 'salida':
        nuevoStock -= parseInt(cantidad);
        break;
      case 'ajuste':
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

    // 🆕 CREAR COMPRA (formal o informal)
    let purchase = null;
    if (es_compra && tipo_movimiento === 'entrada') {
      // Generar número de compra
      const lastPurchase = await Purchase.findOne({
        order: [['id', 'DESC']],
        attributes: ['numero_compra'],
        transaction,
      });

      let numero_compra = 'COMP-00001';
      if (lastPurchase && lastPurchase.numero_compra) {
        const lastNumber = parseInt(lastPurchase.numero_compra.split('-')[1]);
        numero_compra = `COMP-${String(lastNumber + 1).padStart(5, '0')}`;
      }

      const cantidad_int = parseInt(cantidad);
      const precio_unit = parseFloat(costo_unitario) || product.precio_compra;
      const itbis_porcentaje = 18;
      
      const subtotal = cantidad_int * precio_unit;
      const itbis = subtotal * (itbis_porcentaje / 100);
      const total = subtotal + itbis;

      let supplier_id = null;
      let ncf_final = null;
      let notas_compra = '';

      if (tipo_proveedor === 'formal') {
        // 🟢 PROVEEDOR FORMAL (con RNC)
        supplier_id = parseInt(proveedor_id);
        ncf_final = ncf_proveedor;
        notas_compra = `Compra formal desde movimiento de inventario: ${motivo}`;
      } else if (tipo_proveedor === 'informal') {
        // 🟡 PROVEEDOR INFORMAL (sin RNC, con cédula)
        
        // 1. Buscar o crear proveedor informal en tabla proveedores
        const cedulaSinGuiones = proveedor_informal_cedula.replace(/-/g, '');
        
        let supplierInformal = await Supplier.findOne({
          where: { numero_identificacion: cedulaSinGuiones },
          transaction,
        });

        if (!supplierInformal) {
          // Crear proveedor informal
          const lastSupplier = await Supplier.findOne({
            order: [['id', 'DESC']],
            attributes: ['codigo_proveedor'],
            transaction,
          });

          let codigo_proveedor = 'PROV-00001';
          if (lastSupplier && lastSupplier.codigo_proveedor) {
            const lastNum = parseInt(lastSupplier.codigo_proveedor.split('-')[1]);
            codigo_proveedor = `PROV-${String(lastNum + 1).padStart(5, '0')}`;
          }

          supplierInformal = await Supplier.create(
            {
              codigo_proveedor,
              tipo_identificacion: 'CEDULA',
              numero_identificacion: cedulaSinGuiones,
              nombre_comercial: proveedor_informal_nombre,
              razon_social: proveedor_informal_nombre,
              email: null,
              telefono: null,
              direccion: null,
              ciudad: null,
              provincia: null,
              activo: true,
              notas: '⚠️ Proveedor informal (sin RNC) - Creado automáticamente',
            },
            { transaction }
          );
        }

        supplier_id = supplierInformal.id;

        // 2. Generar NCF E41 o B11 (formato: E4100000001 o B1100000001)
        // Buscar último NCF E41/B11 generado
        const lastE41 = await Purchase.findOne({
          where: {
            ncf_proveedor: {
              [Op.like]: 'E41%',
            },
          },
          order: [['id', 'DESC']],
          attributes: ['ncf_proveedor'],
          transaction,
        });

        let secuencia = 1;
        if (lastE41 && lastE41.ncf_proveedor) {
          const lastSecuencia = parseInt(lastE41.ncf_proveedor.substring(3));
          secuencia = lastSecuencia + 1;
        }

        ncf_final = `E41${String(secuencia).padStart(8, '0')}`;

        // 3. Calcular retenciones según normativa DGII
        const itbis_retencion = itbis * 0.75; // 75% del ITBIS se retiene
        const isr_retencion = subtotal * 0.10; // 10% de retención de ISR (ejemplo)

        notas_compra = `⚠️ PROVEEDOR INFORMAL - NCF E41 generado automáticamente
Proveedor: ${proveedor_informal_nombre}
Cédula: ${proveedor_informal_cedula}
Retención ITBIS (75%): RD${itbis_retencion.toFixed(2)}
Retención ISR (10%): RD${isr_retencion.toFixed(2)}
Motivo: ${motivo}`;
      }

      // Crear compra
      purchase = await Purchase.create(
        {
          numero_compra,
          proveedor_id: supplier_id,
          ncf_proveedor: ncf_final,
          fecha_compra: fecha_compra || new Date().toISOString().split('T')[0],
          fecha_vencimiento: null,
          tipo_compra: 'contado',
          subtotal,
          itbis,
          total,
          estado: 'recibida',
          notas: notas_compra,
          usuario_id: req.user.id,
        },
        { transaction }
      );

      // Crear detalle de compra
      await PurchaseDetail.create(
        {
          compra_id: purchase.id,
          producto_id: parseInt(producto_id),
          cantidad: cantidad_int,
          precio_unitario: precio_unit,
          itbis_porcentaje,
          itbis_monto: itbis,
          subtotal,
          total,
        },
        { transaction }
      );
    }

    await transaction.commit();

    // Obtener el movimiento con las relaciones
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

    const response = {
      success: true,
      message: es_compra && tipo_movimiento === 'entrada' 
        ? tipo_proveedor === 'informal'
          ? '✓ Movimiento registrado y compra a proveedor informal creada (NCF E41 generado)'
          : '✓ Movimiento registrado y compra creada para Reporte 606'
        : 'Movimiento de inventario registrado exitosamente',
      movement: movementWithDetails,
    };

    if (purchase) {
      response.purchase = {
        id: purchase.id,
        numero_compra: purchase.numero_compra,
        total: purchase.total,
        ncf_proveedor: purchase.ncf_proveedor,
        tipo_proveedor: tipo_proveedor,
      };
    }

    res.status(201).json(response);
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
        [sequelize.literal('stock_actual - stock_minimo'), 'ASC'],
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

    const where = {};

    if (producto_id) where.producto_id = producto_id;
    if (tipo_movimiento) where.tipo_movimiento = tipo_movimiento;

    if (fecha_desde || fecha_hasta) {
      where.fecha_movimiento = {};
      if (fecha_desde) where.fecha_movimiento[Op.gte] = new Date(fecha_desde);
      if (fecha_hasta) where.fecha_movimiento[Op.lte] = new Date(fecha_hasta);
    }

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