// backend/src/services/reportService.js

import { 
  Invoice, 
  InvoiceDetail,
  Purchase,
  PurchaseDetail,
  Customer, 
  Supplier,
  Product,
  Report606,
  Report607,
  Report608,
  sequelize 
} from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Generar Reporte 607 (Ventas)
 * @param {number} mes - Mes del reporte (1-12)
 * @param {number} año - Año del reporte
 * @returns {Promise<Array>}
 */
export const generateReport607 = async (mes, año) => {
  try {
    // Calcular rango de fechas
    const fechaInicio = new Date(año, mes - 1, 1);
    const fechaFin = new Date(año, mes, 0);

    // Obtener facturas del período
    const invoices = await Invoice.findAll({
      where: {
        fecha_emision: {
          [Op.between]: [fechaInicio, fechaFin],
        },
        anulada: false,
        ncf: { [Op.not]: null },
      },
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['numero_identificacion', 'tipo_identificacion'],
        },
      ],
      order: [['fecha_emision', 'ASC']],
    });

    // Transformar a formato 607
    const report607Data = invoices.map(invoice => {
      // Tipo de identificación: 1=RNC, 2=Cédula, 3=Pasaporte
      let tipoIdentificacion = '2'; // Por defecto Cédula
      if (invoice.customer.tipo_identificacion === 'RNC') tipoIdentificacion = '1';
      if (invoice.customer.tipo_identificacion === 'PASAPORTE') tipoIdentificacion = '3';

      // Tipo de ingreso: 01=Ingresos por operaciones, 02=Ingresos financieros, etc.
      const tipoIngreso = '01'; // Asumimos operaciones normales

      return {
        id: invoice.id,
        rnc_cedula: invoice.customer.numero_identificacion.replace(/\D/g, ''),
        tipo_identificacion: tipoIdentificacion,
        ncf: invoice.ncf,
        ncf_modificado: null,
        tipo_ingreso: tipoIngreso,
        fecha_comprobante: invoice.fecha_emision,
        fecha_retencion: null,
        monto_facturado: parseFloat(invoice.subtotal),
        itbis_facturado: parseFloat(invoice.itbis),
        itbis_retenido: 0.00,
        isr_retenido: 0.00,
        impuesto_selectivo: 0.00,
        otros_impuestos: 0.00,
        propina_legal: 0.00,
      };
    });

    return report607Data;
  } catch (error) {
    console.error('Error al generar reporte 607:', error);
    throw error;
  }
};

/**
 * Generar Reporte 606 (Compras)
 * @param {number} mes - Mes del reporte (1-12)
 * @param {number} año - Año del reporte
 * @returns {Promise<Array>}
 */
export const generateReport606 = async (mes, año) => {
  try {
    const fechaInicio = new Date(año, mes - 1, 1);
    const fechaFin = new Date(año, mes, 0);

    const purchases = await Purchase.findAll({
      where: {
        fecha_compra: {
          [Op.between]: [fechaInicio, fechaFin],
        },
        estado: { [Op.not]: 'cancelada' },
        ncf_proveedor: { [Op.not]: null },
      },
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['numero_identificacion', 'tipo_identificacion'],
        },
      ],
      order: [['fecha_compra', 'ASC']],
    });

    const report606Data = purchases.map(purchase => {
      let tipoIdentificacion = '1'; // RNC por defecto para proveedores
      if (purchase.supplier.tipo_identificacion === 'CEDULA') tipoIdentificacion = '2';

      // Tipo de bienes/servicios: 01=Gastos de personal, 02=Gastos por trabajos, etc.
      const tipoBienesServicios = '02'; // Asumimos compras de bienes

      return {
        id: purchase.id,
        rnc_cedula: purchase.supplier.numero_identificacion.replace(/\D/g, ''),
        tipo_identificacion: tipoIdentificacion,
        tipo_bienes_servicios: tipoBienesServicios,
        ncf: purchase.ncf_proveedor,
        ncf_modificado: null,
        fecha_comprobante: purchase.fecha_compra,
        fecha_pago: purchase.fecha_compra, // Simplificado
        monto_facturado: parseFloat(purchase.subtotal),
        itbis_facturado: parseFloat(purchase.itbis),
        itbis_retenido: 0.00,
        itbis_sujeto_proporcionalidad: 0.00,
        itbis_llevado_costo: 0.00,
        itbis_compensacion: 0.00,
      };
    });

    return report606Data;
  } catch (error) {
    console.error('Error al generar reporte 606:', error);
    throw error;
  }
};

/**
 * Generar Reporte 608 (Anulaciones)
 * @param {number} mes - Mes del reporte (1-12)
 * @param {number} año - Año del reporte
 * @returns {Promise<Array>}
 */
export const generateReport608 = async (mes, año) => {
  try {
    const fechaInicio = new Date(año, mes - 1, 1);
    const fechaFin = new Date(año, mes, 0);

    const invoicesAnuladas = await Invoice.findAll({
      where: {
        fecha_anulacion: {
          [Op.between]: [fechaInicio, fechaFin],
        },
        anulada: true,
        ncf: { [Op.not]: null },
      },
      order: [['fecha_anulacion', 'ASC']],
    });

    const report608Data = invoicesAnuladas.map(invoice => {
      // Tipo de anulación:
      // 01=Deterioro de la factura, 02=Errores de impresión,
      // 03=Impresión defectuosa, 04=Corrección de la información
      const tipoAnulacion = '04'; // Asumimos corrección

      return {
        id: invoice.id,
        ncf: invoice.ncf,
        fecha_comprobante: invoice.fecha_emision,
        tipo_anulacion: tipoAnulacion,
        fecha_anulacion: invoice.fecha_anulacion,
        motivo: invoice.motivo_anulacion,
      };
    });

    return report608Data;
  } catch (error) {
    console.error('Error al generar reporte 608:', error);
    throw error;
  }
};

/**
 * Guardar Reporte 607 en base de datos
 */
export const saveReport607 = async (mes, año) => {
  const transaction = await sequelize.transaction();
  
  try {
    const reportData = await generateReport607(mes, año);

    // Eliminar registros existentes del mismo período
    await Report607.destroy({
      where: { mes_reporte: mes, año_reporte: año },
      transaction,
    });

    // Insertar nuevos registros
    const records = reportData.map(data => ({
      factura_id: data.id,
      rnc_cedula: data.rnc_cedula,
      tipo_identificacion: data.tipo_identificacion,
      ncf: data.ncf,
      ncf_modificado: data.ncf_modificado,
      tipo_ingreso: data.tipo_ingreso,
      fecha_comprobante: data.fecha_comprobante,
      fecha_retencion: data.fecha_retencion,
      monto_facturado: data.monto_facturado,
      itbis_facturado: data.itbis_facturado,
      itbis_retenido: data.itbis_retenido,
      isr_retenido: data.isr_retenido,
      impuesto_selectivo: data.impuesto_selectivo,
      otros_impuestos: data.otros_impuestos,
      propina_legal: data.propina_legal,
      mes_reporte: mes,
      año_reporte: año,
      enviado_dgii: false,
    }));

    await Report607.bulkCreate(records, { transaction });
    await transaction.commit();

    return { success: true, count: records.length };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Guardar Reporte 606 en base de datos
 */
export const saveReport606 = async (mes, año) => {
  const transaction = await sequelize.transaction();
  
  try {
    const reportData = await generateReport606(mes, año);

    await Report606.destroy({
      where: { mes_reporte: mes, año_reporte: año },
      transaction,
    });

    const records = reportData.map(data => ({
      compra_id: data.id,
      rnc_cedula: data.rnc_cedula,
      tipo_identificacion: data.tipo_identificacion,
      tipo_bienes_servicios: data.tipo_bienes_servicios,
      ncf: data.ncf,
      ncf_modificado: data.ncf_modificado,
      fecha_comprobante: data.fecha_comprobante,
      fecha_pago: data.fecha_pago,
      monto_facturado: data.monto_facturado,
      itbis_facturado: data.itbis_facturado,
      itbis_retenido: data.itbis_retenido,
      itbis_sujeto_proporcionalidad: data.itbis_sujeto_proporcionalidad,
      itbis_llevado_costo: data.itbis_llevado_costo,
      itbis_compensacion: data.itbis_compensacion,
      mes_reporte: mes,
      año_reporte: año,
      enviado_dgii: false,
    }));

    await Report606.bulkCreate(records, { transaction });
    await transaction.commit();

    return { success: true, count: records.length };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Guardar Reporte 608 en base de datos
 */
export const saveReport608 = async (mes, año) => {
  const transaction = await sequelize.transaction();
  
  try {
    const reportData = await generateReport608(mes, año);

    await Report608.destroy({
      where: { mes_reporte: mes, año_reporte: año },
      transaction,
    });

    const records = reportData.map(data => ({
      factura_id: data.id,
      ncf: data.ncf,
      fecha_comprobante: data.fecha_comprobante,
      tipo_anulacion: data.tipo_anulacion,
      mes_reporte: mes,
      año_reporte: año,
      enviado_dgii: false,
    }));

    await Report608.bulkCreate(records, { transaction });
    await transaction.commit();

    return { success: true, count: records.length };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export default {
  generateReport607,
  generateReport606,
  generateReport608,
  saveReport607,
  saveReport606,
  saveReport608,
};