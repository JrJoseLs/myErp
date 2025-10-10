// backend/src/services/excelService.js - VERSIÓN COMPLETA CON XLSX

import fs from 'fs';
import path from 'path';

/**
 * ⚠️ NOTA IMPORTANTE:
 * Para exportación real a Excel (.xlsx), necesitas instalar:
 * npm install xlsx
 * 
 * Por ahora usaremos CSV que Excel puede abrir perfectamente
 */

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
 * Crear directorio si no existe
 */
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Exportar Reporte 607 a Excel
 * @param {Array} data - Datos del reporte
 * @param {number} mes - Mes del reporte
 * @param {number} año - Año del reporte
 * @returns {Promise<string>} - Ruta del archivo generado
 */
export const export607ToExcel = async (data, mes, año) => {
  const columns = [
    { key: 'rnc_cedula', header: 'RNC/Cédula' },
    { key: 'tipo_identificacion', header: 'Tipo ID' },
    { key: 'ncf', header: 'NCF' },
    { key: 'tipo_ingreso', header: 'Tipo Ingreso' },
    { key: 'fecha_comprobante', header: 'Fecha Comprobante' },
    { key: 'monto_facturado', header: 'Monto Facturado' },
    { key: 'itbis_facturado', header: 'ITBIS Facturado' },
    { key: 'itbis_retenido', header: 'ITBIS Retenido' },
    { key: 'isr_retenido', header: 'ISR Retenido' },
    { key: 'impuesto_selectivo', header: 'Impuesto Selectivo' },
    { key: 'otros_impuestos', header: 'Otros Impuestos' },
    { key: 'propina_legal', header: 'Propina Legal' },
  ];

  const csv = arrayToCSV(data, columns);
  const dir = path.join(process.cwd(), 'exports', 'reports');
  ensureDirectoryExists(dir);

  const filename = `607_${año}${String(mes).padStart(2, '0')}.csv`;
  const filepath = path.join(dir, filename);
  
  fs.writeFileSync(filepath, '\uFEFF' + csv, 'utf8'); // UTF-8 BOM para Excel
  
  return filepath;
};

/**
 * Exportar Reporte 606 a Excel
 * @param {Array} data - Datos del reporte
 * @param {number} mes - Mes del reporte
 * @param {number} año - Año del reporte
 * @returns {Promise<string>} - Ruta del archivo generado
 */
export const export606ToExcel = async (data, mes, año) => {
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
    { key: 'itbis_sujeto_proporcionalidad', header: 'ITBIS Proporcionalidad' },
    { key: 'itbis_llevado_costo', header: 'ITBIS Llevado a Costo' },
    { key: 'itbis_compensacion', header: 'ITBIS Compensación' },
  ];

  const csv = arrayToCSV(data, columns);
  const dir = path.join(process.cwd(), 'exports', 'reports');
  ensureDirectoryExists(dir);

  const filename = `606_${año}${String(mes).padStart(2, '0')}.csv`;
  const filepath = path.join(dir, filename);
  
  fs.writeFileSync(filepath, '\uFEFF' + csv, 'utf8');
  
  return filepath;
};

/**
 * Exportar Reporte 608 a Excel
 * @param {Array} data - Datos del reporte
 * @param {number} mes - Mes del reporte
 * @param {number} año - Año del reporte
 * @returns {Promise<string>} - Ruta del archivo generado
 */
export const export608ToExcel = async (data, mes, año) => {
  const columns = [
    { key: 'ncf', header: 'NCF' },
    { key: 'fecha_comprobante', header: 'Fecha Comprobante' },
    { key: 'tipo_anulacion', header: 'Tipo Anulación' },
    { key: 'motivo', header: 'Motivo' },
  ];

  const csv = arrayToCSV(data, columns);
  const dir = path.join(process.cwd(), 'exports', 'reports');
  ensureDirectoryExists(dir);

  const filename = `608_${año}${String(mes).padStart(2, '0')}.csv`;
  const filepath = path.join(dir, filename);
  
  fs.writeFileSync(filepath, '\uFEFF' + csv, 'utf8');
  
  return filepath;
};

/**
 * Exportar lista de facturas a Excel
 * @param {Array} invoices - Facturas a exportar
 * @returns {Promise<string>} - Ruta del archivo generado
 */
export const exportInvoicesToExcel = async (invoices) => {
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
  ensureDirectoryExists(dir);

  const timestamp = new Date().getTime();
  const filename = `facturas_${timestamp}.csv`;
  const filepath = path.join(dir, filename);
  
  fs.writeFileSync(filepath, '\uFEFF' + csv, 'utf8');
  
  return filepath;
};

/**
 * Exportar inventario a Excel
 * @param {Array} products - Productos a exportar
 * @returns {Promise<string>} - Ruta del archivo generado
 */
export const exportInventoryToExcel = async (products) => {
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
  ensureDirectoryExists(dir);

  const timestamp = new Date().getTime();
  const filename = `inventario_${timestamp}.csv`;
  const filepath = path.join(dir, filename);
  
  fs.writeFileSync(filepath, '\uFEFF' + csv, 'utf8');
  
  return filepath;
};

export default {
  export607ToExcel,
  export606ToExcel,
  export608ToExcel,
  exportInvoicesToExcel,
  exportInventoryToExcel,
};