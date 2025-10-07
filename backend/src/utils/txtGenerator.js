// backend/src/utils/txtGenerator.js

/**
 * Formatear fecha para DGII (YYYYMMDD)
 */
const formatFechaDGII = (fecha) => {
  const d = new Date(fecha);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

/**
 * Formatear monto para DGII (sin decimales, ej: 1000.50 → 100050)
 */
const formatMontoDGII = (monto) => {
  return String(Math.round(parseFloat(monto) * 100)).padStart(12, '0');
};

/**
 * Formatear RNC/Cédula (11 caracteres con ceros a la izquierda)
 */
const formatRncCedula = (numero) => {
  return String(numero).replace(/\D/g, '').padStart(11, '0');
};

/**
 * Generar archivo TXT para Reporte 607 (Ventas)
 * @param {Array} data - Datos del reporte
 * @param {string} rnc - RNC del emisor
 * @param {number} mes - Mes del reporte
 * @param {number} año - Año del reporte
 * @returns {string} - Contenido del archivo TXT
 */
export const generate607TXT = (data, rnc, mes, año) => {
  const lines = [];

  // Encabezado
  const header = [
    '607',
    formatRncCedula(rnc),
    String(año) + String(mes).padStart(2, '0'),
  ].join('|');
  
  lines.push(header);

  // Detalle de cada factura
  data.forEach(row => {
    const line = [
      formatRncCedula(row.rnc_cedula),
      row.tipo_identificacion,
      row.ncf || '',
      row.ncf_modificado || '',
      row.tipo_ingreso,
      formatFechaDGII(row.fecha_comprobante),
      row.fecha_retencion ? formatFechaDGII(row.fecha_retencion) : '',
      formatMontoDGII(row.monto_facturado),
      formatMontoDGII(row.itbis_facturado),
      formatMontoDGII(row.itbis_retenido),
      formatMontoDGII(row.isr_retenido),
      formatMontoDGII(row.impuesto_selectivo),
      formatMontoDGII(row.otros_impuestos),
      formatMontoDGII(row.propina_legal),
    ].join('|');
    
    lines.push(line);
  });

  return lines.join('\r\n');
};

/**
 * Generar archivo TXT para Reporte 606 (Compras)
 * @param {Array} data - Datos del reporte
 * @param {string} rnc - RNC del emisor
 * @param {number} mes - Mes del reporte
 * @param {number} año - Año del reporte
 * @returns {string} - Contenido del archivo TXT
 */
export const generate606TXT = (data, rnc, mes, año) => {
  const lines = [];

  // Encabezado
  const header = [
    '606',
    formatRncCedula(rnc),
    String(año) + String(mes).padStart(2, '0'),
  ].join('|');
  
  lines.push(header);

  // Detalle de cada compra
  data.forEach(row => {
    const line = [
      formatRncCedula(row.rnc_cedula),
      row.tipo_identificacion,
      row.tipo_bienes_servicios,
      row.ncf || '',
      row.ncf_modificado || '',
      formatFechaDGII(row.fecha_comprobante),
      row.fecha_pago ? formatFechaDGII(row.fecha_pago) : '',
      formatMontoDGII(row.monto_facturado),
      formatMontoDGII(row.itbis_facturado),
      formatMontoDGII(row.itbis_retenido),
      formatMontoDGII(row.itbis_sujeto_proporcionalidad),
      formatMontoDGII(row.itbis_llevado_costo),
      formatMontoDGII(row.itbis_compensacion),
    ].join('|');
    
    lines.push(line);
  });

  return lines.join('\r\n');
};

/**
 * Generar archivo TXT para Reporte 608 (Anulaciones)
 * @param {Array} data - Datos del reporte
 * @param {string} rnc - RNC del emisor
 * @param {number} mes - Mes del reporte
 * @param {number} año - Año del reporte
 * @returns {string} - Contenido del archivo TXT
 */
export const generate608TXT = (data, rnc, mes, año) => {
  const lines = [];

  // Encabezado
  const header = [
    '608',
    formatRncCedula(rnc),
    String(año) + String(mes).padStart(2, '0'),
  ].join('|');
  
  lines.push(header);

  // Detalle de cada anulación
  data.forEach(row => {
    const line = [
      row.ncf || '',
      formatFechaDGII(row.fecha_comprobante),
      row.tipo_anulacion,
    ].join('|');
    
    lines.push(line);
  });

  return lines.join('\r\n');
};

export default {
  generate607TXT,
  generate606TXT,
  generate608TXT,
};