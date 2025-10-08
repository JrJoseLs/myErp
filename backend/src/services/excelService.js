// backend/src/services/excelService.js
// Servicio para exportar reportes a Excel (CSV)

import fs from 'fs';
import path from 'path';

/**
 * Convertir array de objetos a CSV
 * @param {Array} data - Datos a convertir
 * @param {Array} columns - Columnas a incluir {key, header}
 * @returns {string} - Contenido CSV
 */
const arrayToCSV = (data, columns) => {
  if (!data || data.length === 0) {
    return '';
  }

  // Encabezados
  const headers = columns.map(col => `"${col.header}"`).join(',');
  
  // Filas
  const rows = data.map(row => {
    return columns.map(col => {
      let value = row[col.key];
      
      // Formatear valores
      if (value === null || value === undefined) {
        value = '';
      } else if (typeof value === 'number') {
        value = value.toFixed(2);
      } else {
        value = String(value).replace(/"/g, '""'); // Escapar comillas
      }
      
      return `"${value}"`;
    }).join(',');
  }).join('\n');

  return `${headers}\n${rows}`;
};

/**
 * Exportar Reporte 607 a CSV
 * @param {Array} data - Datos del reporte
 * @param {number} mes - Mes del reporte
 * @param {number} año - Año del reporte
 * @returns {string} - Ruta del archivo generado
 */
export const export607ToCSV = (data, mes, año) => {
  const columns = [
    { key: 'rnc_cedula', header: 'RNC/Cédula' },
    { key: 'tipo_identificacion', header: 'Tipo ID' },
    { key: 'ncf', header: 'NCF' },
    { key: 'tipo_ingreso', header: 'Tipo Ingreso' },
    { key: 'fecha_comprobante', header: 'Fecha' },
    { key: 'monto_facturado', header: 'Monto Facturado' },
    { key: 'itbis_facturado', header: 'ITBIS Facturado' },
    { key: 'itbis_retenido', header: 'ITBIS Retenido' },
    { key: 'isr_retenido', header: 'ISR Retenido' },
  ];

  const csv = arrayToCSV(data, columns);
  const dir = path.join(process.cwd(), 'exports', 'reports');
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filename = `607_${año}${String(mes).padStart(2, '0')}.csv`;
  const filepath = path.join(dir, filename);
  
  fs.writeFileSync(filepath, csv, 'utf8');
  
  return filepath;
};

/**
 * Exportar Reporte 606 a CSV
 * @param {Array} data - Datos del reporte
 * @param {number} mes - Mes del reporte
 * @param {number} año - Año del reporte
 * @returns {string} - Ruta del archivo generado
 */
export const export606ToCSV = (data, mes, año) => {
  const columns = [
    { key: 'rnc_cedula', header: 'RNC/Cédula' },
    { key: 'tipo_identificacion', header: 'Tipo ID' },
    { key: 'tipo_bienes_servicios', header: 'Tipo Bienes/Servicios' },
    { key: 'ncf', header: 'NCF' },
    { key: 'fecha_comprobante', header: 'Fecha Comprobante' },
    { key: 'fecha_pago', header: 'Fecha Pago' },
    { key: 'monto_facturado', header: 'Monto Facturado' },
    { key: 'itbis_facturado', header: 'ITBIS Facturado' },
    { key: 'itbis_retenido', header: 'ITBIS Retenido' },
  ];

  const csv = arrayToCSV(data, columns);
  const dir = path.join(process.cwd(), 'exports', 'reports');
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filename = `606_${año}${String(mes).padStart(2, '0')}.csv`;
  const filepath = path.join(dir, filename);
  
  fs.writeFileSync(filepath, csv, 'utf8');
  
  return filepath;
};

/**
 * Exportar Reporte 608 a CSV
 * @param {Array} data - Datos del reporte
 * @param {number} mes - Mes del reporte
 * @param {number} año - Año del reporte
 * @returns {string} - Ruta del archivo generado
 */
export const export608ToCSV = (data, mes, año) => {
  const columns = [
    { key: 'ncf', header: 'NCF' },
    { key: 'fecha_comprobante', header: 'Fecha Comprobante' },
    { key: 'tipo_anulacion', header: 'Tipo Anulación' },
    { key: 'motivo', header: 'Motivo' },
  ];

  const csv = arrayToCSV(data, columns);
  const dir = path.join(process.cwd(), 'exports', 'reports');
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filename = `608_${año}${String(mes).padStart(2, '0')}.csv`;
  const filepath = path.join(dir, filename);
  
  fs.writeFileSync(filepath, csv, 'utf8');
  
  return filepath;
};

/**
 * Exportar lista de facturas a CSV
 * @param {Array} invoices - Facturas a exportar
 * @returns {string} - Ruta del archivo generado
 */
export const exportInvoicesToCSV = (invoices) => {
  const columns = [
    { key: 'numero_factura', header: 'Número Factura' },
    { key: 'ncf', header: 'NCF' },
    { key: 'fecha_emision', header: 'Fecha Emisión' },
    { key: 'cliente', header: 'Cliente' },
    { key: 'subtotal', header: 'Subtotal' },
    { key: 'itbis', header: 'ITBIS' },
    { key: 'total', header: 'Total' },
    { key: 'estado', header: 'Estado' },
  ];

  const csv = arrayToCSV(invoices, columns);
  const dir = path.join(process.cwd(), 'exports', 'invoices');
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const timestamp = new Date().getTime();
  const filename = `facturas_${timestamp}.csv`;
  const filepath = path.join(dir, filename);
  
  fs.writeFileSync(filepath, csv, 'utf8');
  
  return filepath;
};

/**
 * Exportar inventario a CSV
 * @param {Array} products - Productos a exportar
 * @returns {string} - Ruta del archivo generado
 */
export const exportInventoryToCSV = (products) => {
  const columns = [
    { key: 'codigo', header: 'Código' },
    { key: 'nombre', header: 'Nombre' },
    { key: 'categoria', header: 'Categoría' },
    { key: 'stock_actual', header: 'Stock Actual' },
    { key: 'stock_minimo', header: 'Stock Mínimo' },
    { key: 'precio_compra', header: 'Precio Compra' },
    { key: 'precio_venta', header: 'Precio Venta' },
    { key: 'valor_inventario', header: 'Valor Total' },
  ];

  const csv = arrayToCSV(products, columns);
  const dir = path.join(process.cwd(), 'exports', 'inventory');
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const timestamp = new Date().getTime();
  const filename = `inventario_${timestamp}.csv`;
  const filepath = path.join(dir, filename);
  
  fs.writeFileSync(filepath, csv, 'utf8');
  
  return filepath;
};

export default {
  export607ToCSV,
  export606ToCSV,
  export608ToCSV,
  exportInvoicesToCSV,
  exportInventoryToCSV,
};