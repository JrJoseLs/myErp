// backend/src/services/dashboardService.js
// ✅ CON ES MODULES - VERSIÓN CORREGIDA

import { sequelize } from '../config/database.js';
import {
  Invoice,
  InvoiceDetail,
  Purchase,
  PurchaseDetail,
  AccountsReceivable,
  AccountsPayable,
  Product,
  Inventory,
  User,
  Customer,
  Supplier,
  Payment,
  Employee,
} from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Calcular resumen ejecutivo del dashboard
 */
export const calculateDashboardSummary = async (empresaId, startDate, endDate) => {
  try {
    // Total de ventas
    const ventasData = await Invoice.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total')), 'total_ventas'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad_facturas'],
      ],
      where: {
        empresa_id: empresaId,
        fecha_factura: {
          [Op.between]: [startDate, endDate],
        },
        estado: { [Op.ne]: 'ANULADA' },
      },
      raw: true,
    });

    // Costo de bienes vendidos
    const costoData = await InvoiceDetail.findOne({
      attributes: [
        [
          sequelize.fn('SUM', sequelize.where(
            sequelize.fn('*',
              sequelize.col('cantidad'),
              sequelize.col('costo_unitario')
            ),
            '>'
          )),
          'costo_total',
        ],
      ],
      include: [
        {
          model: Invoice,
          attributes: [],
          where: {
            empresa_id: empresaId,
            fecha_factura: {
              [Op.between]: [startDate, endDate],
            },
            estado: { [Op.ne]: 'ANULADA' },
          },
        },
      ],
      raw: true,
    });

    // Cuentas por cobrar pendientes
    const cuentasCobranza = await AccountsReceivable.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('saldo')), 'total_pendiente'],
      ],
      where: {
        empresa_id: empresaId,
        estado: 'PENDIENTE',
      },
      raw: true,
    });

    // Cuentas por pagar
    const cuentasPago = await AccountsPayable.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('saldo')), 'total_pendiente'],
      ],
      where: {
        empresa_id: empresaId,
        estado: 'PENDIENTE',
      },
      raw: true,
    });

    // Inventario disponible
    const inventario = await Inventory.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('stock_actual')), 'cantidad_total'],
        [
          sequelize.fn('SUM', 
            sequelize.where(
              sequelize.fn('*',
                sequelize.col('stock_actual'),
                sequelize.col('costo_unitario')
              )
            )
          ),
          'valor_total',
        ],
      ],
      where: {
        empresa_id: empresaId,
      },
      raw: true,
    });

    const totalVentas = parseFloat(ventasData?.total_ventas) || 0;
    const costoTotal = parseFloat(costoData?.costo_total) || 0;
    const utilidadBruta = totalVentas - costoTotal;
    const margenBruto = totalVentas > 0 ? (utilidadBruta / totalVentas) * 100 : 0;

    return {
      ventas: {
        total: parseFloat(totalVentas.toFixed(2)),
        cantidad_facturas: ventasData?.cantidad_facturas || 0,
        promedio_por_factura: ventasData?.cantidad_facturas > 0 
          ? parseFloat((totalVentas / ventasData.cantidad_facturas).toFixed(2))
          : 0,
      },
      costos: {
        costo_bienes_vendidos: parseFloat(costoTotal.toFixed(2)),
        utilidad_bruta: parseFloat(utilidadBruta.toFixed(2)),
        margen_bruto_pct: parseFloat(margenBruto.toFixed(2)),
      },
      cuentas_por_cobrar: {
        total: parseFloat((cuentasCobranza?.total_pendiente || 0).toFixed(2)),
      },
      cuentas_por_pagar: {
        total: parseFloat((cuentasPago?.total_pendiente || 0).toFixed(2)),
      },
      inventario: {
        cantidad_items: inventario?.cantidad_total || 0,
        valor_total: parseFloat((inventario?.valor_total || 0).toFixed(2)),
      },
    };
  } catch (error) {
    console.error('Error en calculateDashboardSummary:', error);
    throw error;
  }
};

/**
 * Calcular métricas de ventas
 */
export const calculateSalesMetrics = async (empresaId, startDate, endDate, vendedorId = null) => {
  try {
    const whereClause = {
      empresa_id: empresaId,
      fecha_factura: {
        [Op.between]: [startDate, endDate],
      },
      estado: { [Op.ne]: 'ANULADA' },
    };

    if (vendedorId) {
      whereClause.vendedor_id = vendedorId;
    }

    const data = await Invoice.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total')), 'total'],
        [sequelize.fn('SUM', sequelize.col('subtotal')), 'subtotal'],
        [sequelize.fn('SUM', sequelize.col('itbis')), 'total_itbis'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad'],
        [
          sequelize.fn('AVG', sequelize.col('total')),
          'promedio',
        ],
      ],
      where: whereClause,
      raw: true,
    });

    // Por tipo de venta (contado vs crédito)
    const porTipo = await Invoice.findAll({
      attributes: [
        'tipo_venta',
        [sequelize.fn('SUM', sequelize.col('total')), 'total'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad'],
      ],
      where: whereClause,
      group: ['tipo_venta'],
      raw: true,
    });

    return {
      total: parseFloat((data?.total || 0).toFixed(2)),
      subtotal: parseFloat((data?.subtotal || 0).toFixed(2)),
      itbis: parseFloat((data?.total_itbis || 0).toFixed(2)),
      cantidad_facturas: data?.cantidad || 0,
      promedio_factura: parseFloat((data?.promedio || 0).toFixed(2)),
      por_tipo_venta: porTipo.map((t) => ({
        tipo: t.tipo_venta,
        total: parseFloat(t.total),
        cantidad: t.cantidad,
      })),
    };
  } catch (error) {
    console.error('Error en calculateSalesMetrics:', error);
    throw error;
  }
};

/**
 * Calcular métricas de gastos
 */
export const calculateExpensesMetrics = async (empresaId, startDate, endDate) => {
  try {
    // Costo de bienes vendidos
    const costoVentas = await InvoiceDetail.findOne({
      attributes: [
        [
          sequelize.fn('SUM',
            sequelize.literal(`cantidad * costo_unitario`)
          ),
          'total',
        ],
      ],
      include: [
        {
          model: Invoice,
          attributes: [],
          where: {
            empresa_id: empresaId,
            fecha_factura: {
              [Op.between]: [startDate, endDate],
            },
            estado: { [Op.ne]: 'ANULADA' },
          },
        },
      ],
      raw: true,
    });

    // Compras a proveedores
    const compras = await Purchase.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total')), 'total'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad'],
      ],
      where: {
        empresa_id: empresaId,
        fecha_compra: {
          [Op.between]: [startDate, endDate],
        },
        estado: { [Op.ne]: 'CANCELADA' },
      },
      raw: true,
    });

    return {
      costo_bienes_vendidos: parseFloat((costoVentas?.total || 0).toFixed(2)),
      compras: {
        total: parseFloat((compras?.total || 0).toFixed(2)),
        cantidad_ordenes: compras?.cantidad || 0,
      },
    };
  } catch (error) {
    console.error('Error en calculateExpensesMetrics:', error);
    throw error;
  }
};

/**
 * Calcular análisis de rentabilidad
 */
export const calculateProfitAnalysis = async (empresaId, startDate, endDate) => {
  try {
    // Ventas
    const ventas = await Invoice.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total')), 'total'],
      ],
      where: {
        empresa_id: empresaId,
        fecha_factura: {
          [Op.between]: [startDate, endDate],
        },
        estado: { [Op.ne]: 'ANULADA' },
      },
      raw: true,
    });

    // Costo de ventas
    const costoVentas = await InvoiceDetail.findOne({
      attributes: [
        [
          sequelize.fn('SUM',
            sequelize.literal(`cantidad * costo_unitario`)
          ),
          'total',
        ],
      ],
      include: [
        {
          model: Invoice,
          attributes: [],
          where: {
            empresa_id: empresaId,
            fecha_factura: {
              [Op.between]: [startDate, endDate],
            },
            estado: { [Op.ne]: 'ANULADA' },
          },
        },
      ],
      raw: true,
    });

    const totalVentas = parseFloat(ventas?.total) || 0;
    const totalCosto = parseFloat(costoVentas?.total) || 0;

    const utilidadBruta = totalVentas - totalCosto;
    const margenBruto = totalVentas > 0 ? (utilidadBruta / totalVentas) * 100 : 0;

    return {
      ventas_totales: parseFloat(totalVentas.toFixed(2)),
      costo_ventas: parseFloat(totalCosto.toFixed(2)),
      utilidad_bruta: parseFloat(utilidadBruta.toFixed(2)),
      margen_bruto_pct: parseFloat(margenBruto.toFixed(2)),
      margen_neto_pct: parseFloat(margenBruto.toFixed(2)), // Mismo que bruto para este cálculo
    };
  } catch (error) {
    console.error('Error en calculateProfitAnalysis:', error);
    throw error;
  }
};

/**
 * Calcular flujo de caja
 */
export const calculateCashFlow = async (empresaId, startDate, endDate) => {
  try {
    // Ingresos por ventas
    const ingresos = await Payment.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('monto')), 'total'],
      ],
      where: {
        empresa_id: empresaId,
        fecha_pago: {
          [Op.between]: [startDate, endDate],
        },
        tipo_pago: { [Op.in]: ['EFECTIVO', 'TRANSFERENCIA', 'DEPOSITO'] },
      },
      raw: true,
    });

    // Egresos por compras
    const egresos = await Purchase.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total')), 'total'],
      ],
      where: {
        empresa_id: empresaId,
        fecha_compra: {
          [Op.between]: [startDate, endDate],
        },
        estado: { [Op.ne]: 'CANCELADA' },
      },
      raw: true,
    });

    const totalIngresos = parseFloat(ingresos?.total) || 0;
    const totalEgresos = parseFloat(egresos?.total) || 0;
    const flujoNeto = totalIngresos - totalEgresos;

    return {
      ingresos: parseFloat(totalIngresos.toFixed(2)),
      egresos: parseFloat(totalEgresos.toFixed(2)),
      flujo_neto: parseFloat(flujoNeto.toFixed(2)),
    };
  } catch (error) {
    console.error('Error en calculateCashFlow:', error);
    throw error;
  }
};

/**
 * Calcular análisis de cuentas por cobrar/pagar
 */
export const calculateAccountsAnalysis = async (empresaId, startDate, endDate) => {
  try {
    // Cuentas por cobrar
    const cobrar = await AccountsReceivable.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('saldo')), 'total_pendiente'],
        [
          sequelize.fn('SUM',
            sequelize.where(
              sequelize.col('saldo'),
              Op.gt,
              0
            )
          ),
          'vencidas',
        ],
      ],
      where: {
        empresa_id: empresaId,
        estado: 'PENDIENTE',
      },
      raw: true,
    });

    // Cuentas por pagar
    const pagar = await AccountsPayable.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('saldo')), 'total_pendiente'],
      ],
      where: {
        empresa_id: empresaId,
        estado: 'PENDIENTE',
      },
      raw: true,
    });

    return {
      cuentas_por_cobrar: {
        total: parseFloat((cobrar?.total_pendiente || 0).toFixed(2)),
        vencidas: parseFloat((cobrar?.vencidas || 0).toFixed(2)),
      },
      cuentas_por_pagar: {
        total: parseFloat((pagar?.total_pendiente || 0).toFixed(2)),
      },
    };
  } catch (error) {
    console.error('Error en calculateAccountsAnalysis:', error);
    throw error;
  }
};

/**
 * Calcular análisis de inventario
 */
export const calculateInventoryAnalysis = async (empresaId, startDate, endDate) => {
  try {
    // Total de inventario
    const totalInventario = await Inventory.findOne({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_items'],
        [sequelize.fn('SUM', sequelize.col('stock_actual')), 'stock_total'],
        [
          sequelize.fn('SUM',
            sequelize.literal(`stock_actual * costo_unitario`)
          ),
          'valor_total',
        ],
      ],
      where: {
        empresa_id: empresaId,
      },
      raw: true,
    });

    // Productos con stock bajo
    const stockBajo = await Inventory.findAll({
      attributes: [
        'producto_id',
        'stock_actual',
        'stock_minimo',
      ],
      include: [
        {
          model: Product,
          attributes: ['nombre'],
        },
      ],
      where: {
        empresa_id: empresaId,
        stock_actual: {
          [Op.lte]: sequelize.col('stock_minimo'),
        },
      },
      raw: true,
    });

    // Rotación de inventario (COGS / Average Inventory)
    const ventasData = await InvoiceDetail.findOne({
      attributes: [
        [
          sequelize.fn('SUM',
            sequelize.literal(`cantidad * costo_unitario`)
          ),
          'cogs',
        ],
      ],
      include: [
        {
          model: Invoice,
          attributes: [],
          where: {
            empresa_id: empresaId,
            fecha_factura: {
              [Op.between]: [startDate, endDate],
            },
            estado: { [Op.ne]: 'ANULADA' },
          },
        },
      ],
      raw: true,
    });

    const cogs = parseFloat(ventasData?.cogs) || 0;
    const valorInventario = parseFloat(totalInventario?.valor_total) || 0;
    const rotacion = valorInventario > 0 ? cogs / valorInventario : 0;

    return {
      total_items: totalInventario?.total_items || 0,
      stock_total: totalInventario?.stock_total || 0,
      valor_total: parseFloat((valorInventario).toFixed(2)),
      stock_bajo_count: stockBajo.length,
      rotacion_inventario: parseFloat(rotacion.toFixed(2)),
      dias_promedio_venta: rotacion > 0 ? parseFloat((30 / rotacion).toFixed(2)) : 0,
    };
  } catch (error) {
    console.error('Error en calculateInventoryAnalysis:', error);
    throw error;
  }
};

/**
 * Calcular desempeño de empleados
 */
export const calculateEmployeePerformance = async (empresaId, startDate, endDate, limit = 10) => {
  try {
    const performance = await Invoice.findAll({
      attributes: [
        [sequelize.col('User.id'), 'vendedor_id'],
        [sequelize.col('User.nombre_completo'), 'nombre_vendedor'],
        [sequelize.fn('COUNT', sequelize.col('Invoice.id')), 'cantidad_ventas'],
        [sequelize.fn('SUM', sequelize.col('Invoice.total')), 'total_vendido'],
        [
          sequelize.fn('AVG', sequelize.col('Invoice.total')),
          'promedio_venta',
        ],
      ],
      include: [
        {
          model: User,
          attributes: [],
          where: {
            empresa_id: empresaId,
          },
        },
      ],
      where: {
        empresa_id: empresaId,
        fecha_factura: {
          [Op.between]: [startDate, endDate],
        },
        estado: { [Op.ne]: 'ANULADA' },
      },
      group: ['vendedor_id'],
      order: [[sequelize.fn('SUM', sequelize.col('Invoice.total')), 'DESC']],
      limit,
      subQuery: false,
      raw: true,
    });

    return performance.map((emp) => ({
      vendedor_id: emp.vendedor_id,
      nombre_vendedor: emp.nombre_vendedor,
      cantidad_ventas: emp.cantidad_ventas || 0,
      total_vendido: parseFloat((emp.total_vendido || 0).toFixed(2)),
      promedio_venta: parseFloat((emp.promedio_venta || 0).toFixed(2)),
    }));
  } catch (error) {
    console.error('Error en calculateEmployeePerformance:', error);
    throw error;
  }
};

/**
 * Calcular tendencia de ventas (últimos N días)
 */
export const calculateSalesTrend = async (empresaId, days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trend = await Invoice.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('fecha_factura')), 'fecha'],
        [sequelize.fn('SUM', sequelize.col('total')), 'total'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad_facturas'],
      ],
      where: {
        empresa_id: empresaId,
        fecha_factura: {
          [Op.gte]: startDate,
        },
        estado: { [Op.ne]: 'ANULADA' },
      },
      group: [sequelize.fn('DATE', sequelize.col('fecha_factura'))],
      order: [['fecha_factura', 'ASC']],
      raw: true,
    });

    return trend.map((t) => ({
      fecha: t.fecha,
      total: parseFloat((t.total || 0).toFixed(2)),
      cantidad_facturas: t.cantidad_facturas || 0,
    }));
  } catch (error) {
    console.error('Error en calculateSalesTrend:', error);
    throw error;
  }
};

/**
 * Obtener detalles de ventas para drill-down
 */
export const getSalesDetail = async (empresaId, startDate, endDate, groupBy = 'vendedor', limit = 50) => {
  try {
    let attributes = [];
    let include = [];
    let group = [];

    switch (groupBy) {
      case 'vendedor':
        attributes = [
          [sequelize.col('User.id'), 'id'],
          [sequelize.col('User.nombre_completo'), 'nombre'],
          [sequelize.fn('SUM', sequelize.col('Invoice.total')), 'total'],
          [sequelize.fn('COUNT', sequelize.col('Invoice.id')), 'cantidad'],
        ];
        include = [
          {
            model: User,
            attributes: [],
          },
        ];
        group = ['vendedor_id'];
        break;

      case 'cliente':
        attributes = [
          [sequelize.col('Customer.id'), 'id'],
          [sequelize.col('Customer.nombre_razon_social'), 'nombre'],
          [sequelize.fn('SUM', sequelize.col('Invoice.total')), 'total'],
          [sequelize.fn('COUNT', sequelize.col('Invoice.id')), 'cantidad'],
        ];
        include = [
          {
            model: Customer,
            attributes: [],
          },
        ];
        group = ['cliente_id'];
        break;

      case 'producto':
        // Para producto necesitamos InvoiceDetail
        return await exports.getSalesDetailByProduct(empresaId, startDate, endDate, limit);

      default:
        throw new Error('groupBy no válido');
    }

    const details = await Invoice.findAll({
      attributes,
      include,
      where: {
        empresa_id: empresaId,
        fecha_factura: {
          [Op.between]: [startDate, endDate],
        },
        estado: { [Op.ne]: 'ANULADA' },
      },
      group,
      order: [[sequelize.fn('SUM', sequelize.col('Invoice.total')), 'DESC']],
      limit,
      subQuery: false,
      raw: true,
    });

    return details.map((d) => ({
      id: d.id,
      nombre: d.nombre,
      total: parseFloat((d.total || 0).toFixed(2)),
      cantidad: d.cantidad || 0,
      promedio: parseFloat(((d.total || 0) / (d.cantidad || 1)).toFixed(2)),
    }));
  } catch (error) {
    console.error('Error en getSalesDetail:', error);
    throw error;
  }
};

/**
 * Detalles de ventas por producto
 */
export const getSalesDetailByProduct = async (empresaId, startDate, endDate, limit = 50) => {
  try {
    const details = await InvoiceDetail.findAll({
      attributes: [
        [sequelize.col('Product.id'), 'producto_id'],
        [sequelize.col('Product.nombre'), 'nombre'],
        [sequelize.fn('SUM', sequelize.col('InvoiceDetail.cantidad')), 'cantidad'],
        [sequelize.fn('SUM', sequelize.col('InvoiceDetail.total')), 'total'],
      ],
      include: [
        {
          model: Product,
          attributes: [],
        },
        {
          model: Invoice,
          attributes: [],
          where: {
            empresa_id: empresaId,
            fecha_factura: {
              [Op.between]: [startDate, endDate],
            },
            estado: { [Op.ne]: 'ANULADA' },
          },
        },
      ],
      group: ['producto_id'],
      order: [[sequelize.fn('SUM', sequelize.col('InvoiceDetail.total')), 'DESC']],
      limit,
      subQuery: false,
      raw: true,
    });

    return details.map((d) => ({
      id: d.producto_id,
      nombre: d.nombre,
      cantidad: d.cantidad || 0,
      total: parseFloat((d.total || 0).toFixed(2)),
    }));
  } catch (error) {
    console.error('Error en getSalesDetailByProduct:', error);
    throw error;
  }
};

/**
 * Obtener detalles de gastos para drill-down
 */
export const getExpensesDetail = async (empresaId, startDate, endDate, groupBy = 'categoria', limit = 50) => {
  try {
    // Para gastos usamos Purchase
    const details = await Purchase.findAll({
      attributes: [
        [sequelize.col('Supplier.nombre_razon_social'), 'nombre'],
        [sequelize.fn('SUM', sequelize.col('Purchase.total')), 'total'],
        [sequelize.fn('COUNT', sequelize.col('Purchase.id')), 'cantidad'],
      ],
      include: [
        {
          model: Supplier,
          attributes: [],
        },
      ],
      where: {
        empresa_id: empresaId,
        fecha_compra: {
          [Op.between]: [startDate, endDate],
        },
        estado: { [Op.ne]: 'CANCELADA' },
      },
      group: ['proveedor_id'],
      order: [[sequelize.fn('SUM', sequelize.col('Purchase.total')), 'DESC']],
      limit,
      subQuery: false,
      raw: true,
    });

    return details.map((d) => ({
      nombre: d.nombre,
      total: parseFloat((d.total || 0).toFixed(2)),
      cantidad: d.cantidad || 0,
    }));
  } catch (error) {
    console.error('Error en getExpensesDetail:', error);
    throw error;
  }
};

/**
 * Obtener top productos más vendidos
 */
export const getTopProducts = async (empresaId, startDate, endDate, limit = 10) => {
  try {
    const products = await InvoiceDetail.findAll({
      attributes: [
        [sequelize.col('Product.id'), 'producto_id'],
        [sequelize.col('Product.nombre'), 'nombre'],
        [sequelize.fn('SUM', sequelize.col('InvoiceDetail.cantidad')), 'cantidad'],
        [sequelize.fn('SUM', sequelize.col('InvoiceDetail.total')), 'total'],
      ],
      include: [
        {
          model: Product,
          attributes: [],
        },
        {
          model: Invoice,
          attributes: [],
          where: {
            empresa_id: empresaId,
            fecha_factura: {
              [Op.between]: [startDate, endDate],
            },
            estado: { [Op.ne]: 'ANULADA' },
          },
        },
      ],
      group: ['producto_id'],
      order: [[sequelize.fn('SUM', sequelize.col('InvoiceDetail.cantidad')), 'DESC']],
      limit,
      subQuery: false,
      raw: true,
    });

    return products.map((p) => ({
      id: p.producto_id,
      nombre: p.nombre,
      cantidad_vendida: p.cantidad || 0,
      total_ventas: parseFloat((p.total || 0).toFixed(2)),
    }));
  } catch (error) {
    console.error('Error en getTopProducts:', error);
    throw error;
  }
};

/**
 * Obtener top clientes por ventas
 */
export const getTopCustomers = async (empresaId, startDate, endDate, limit = 10) => {
  try {
    const customers = await Invoice.findAll({
      attributes: [
        [sequelize.col('Customer.id'), 'cliente_id'],
        [sequelize.col('Customer.nombre_razon_social'), 'nombre'],
        [sequelize.fn('COUNT', sequelize.col('Invoice.id')), 'cantidad_compras'],
        [sequelize.fn('SUM', sequelize.col('Invoice.total')), 'total_compras'],
      ],
      include: [
        {
          model: Customer,
          attributes: [],
        },
      ],
      where: {
        empresa_id: empresaId,
        fecha_factura: {
          [Op.between]: [startDate, endDate],
        },
        estado: { [Op.ne]: 'ANULADA' },
      },
      group: ['cliente_id'],
      order: [[sequelize.fn('SUM', sequelize.col('Invoice.total')), 'DESC']],
      limit,
      subQuery: false,
      raw: true,
    });

    return customers.map((c) => ({
      id: c.cliente_id,
      nombre: c.nombre,
      cantidad_compras: c.cantidad_compras || 0,
      total_compras: parseFloat((c.total_compras || 0).toFixed(2)),
      promedio_compra: parseFloat(((c.total_compras || 0) / (c.cantidad_compras || 1)).toFixed(2)),
    }));
  } catch (error) {
    console.error('Error en getTopCustomers:', error);
    throw error;
  }
};

/**
 * Comparación mes actual vs mes anterior
 */
export const calculateComparison = async (empresaId) => {
  try {
    const today = new Date();
    
    // Mes actual
    const mesActualInicio = new Date(today.getFullYear(), today.getMonth(), 1);
    const mesActualFin = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Mes anterior
    const mesAnteriorInicio = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const mesAnteriorFin = new Date(today.getFullYear(), today.getMonth(), 0);

    // Ventas mes actual
    const ventasActual = await Invoice.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total')), 'total'],
      ],
      where: {
        empresa_id: empresaId,
        fecha_factura: {
          [Op.between]: [mesActualInicio, mesActualFin],
        },
        estado: { [Op.ne]: 'ANULADA' },
      },
      raw: true,
    });

    // Ventas mes anterior
    const ventasAnterior = await Invoice.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total')), 'total'],
      ],
      where: {
        empresa_id: empresaId,
        fecha_factura: {
          [Op.between]: [mesAnteriorInicio, mesAnteriorFin],
        },
        estado: { [Op.ne]: 'ANULADA' },
      },
      raw: true,
    });

    const actual = parseFloat(ventasActual?.total) || 0;
    const anterior = parseFloat(ventasAnterior?.total) || 0;
    const variacion = anterior > 0 ? ((actual - anterior) / anterior) * 100 : 0;

    return {
      mes_actual: {
        fecha: mesActualInicio.toISOString().split('T')[0],
        total: parseFloat(actual.toFixed(2)),
      },
      mes_anterior: {
        fecha: mesAnteriorInicio.toISOString().split('T')[0],
        total: parseFloat(anterior.toFixed(2)),
      },
      variacion_pct: parseFloat(variacion.toFixed(2)),
      cambio: actual > anterior ? 'aumento' : 'disminucion',
    };
  } catch (error) {
    console.error('Error en calculateComparison:', error);
    throw error;
  }
};

export default {
  calculateDashboardSummary,
  calculateSalesMetrics,
  calculateExpensesMetrics,
  calculateProfitAnalysis,
  calculateCashFlow,
  calculateAccountsAnalysis,
  calculateInventoryAnalysis,
  calculateEmployeePerformance,
  calculateSalesTrend,
  getSalesDetail,
  getSalesDetailByProduct,
  getExpensesDetail,
  getTopProducts,
  getTopCustomers,
  calculateComparison,
};