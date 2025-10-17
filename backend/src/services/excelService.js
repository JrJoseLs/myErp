// backend/src/services/excelService.js
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

const EXPORTS_DIR = path.join(process.cwd(), 'exports', 'reports');

// Crear directorio si no existe
if (!fs.existsSync(EXPORTS_DIR)) {
  fs.mkdirSync(EXPORTS_DIR, { recursive: true });
}

/**
 * Exportar Reporte 607 a Excel
 */
export const export607ToExcel = async (reportData, mes, año) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Reporte 607');

  // Título
  worksheet.mergeCells('A1:I1');
  worksheet.getCell('A1').value = `REPORTE 607 - ${mes}/${año}`;
  worksheet.getCell('A1').font = { bold: true, size: 16 };
  worksheet.getCell('A1').alignment = { horizontal: 'center' };

  // Headers
  worksheet.addRow([
    'RNC/Cédula',
    'Tipo ID',
    'NCF',
    'Tipo Ingreso',
    'Fecha Comprobante',
    'Monto Facturado',
    'ITBIS Facturado',
    'ITBIS Retenido',
    'Propina Legal',
  ]);

  const headerRow = worksheet.getRow(2);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };
  headerRow.font = { color: { argb: 'FFFFFFFF' }, bold: true };

  // Datos
  reportData.forEach(row => {
    worksheet.addRow([
      row.rnc_cedula,
      row.tipo_identificacion === '1' ? 'RNC' : 'Cédula',
      row.ncf,
      row.tipo_ingreso,
      new Date(row.fecha_comprobante).toLocaleDateString('es-DO'),
      parseFloat(row.monto_facturado),
      parseFloat(row.itbis_facturado),
      parseFloat(row.itbis_retenido || 0),
      parseFloat(row.propina_legal || 0),
    ]);
  });

  // Formato de columnas
  worksheet.getColumn(6).numFmt = '"RD$"#,##0.00';
  worksheet.getColumn(7).numFmt = '"RD$"#,##0.00';
  worksheet.getColumn(8).numFmt = '"RD$"#,##0.00';
  worksheet.getColumn(9).numFmt = '"RD$"#,##0.00';

  // Ajustar ancho de columnas
  worksheet.columns.forEach(column => {
    column.width = 15;
  });

  // Guardar archivo
  const fileName = `607_${año}${String(mes).padStart(2, '0')}.xlsx`;
  const filePath = path.join(EXPORTS_DIR, fileName);

  await workbook.xlsx.writeFile(filePath);
  return filePath;
};

/**
 * Exportar Reporte 606 a Excel
 */
export const export606ToExcel = async (reportData, mes, año) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Reporte 606');

  // Título
  worksheet.mergeCells('A1:J1');
  worksheet.getCell('A1').value = `REPORTE 606 - COMPRAS - ${mes}/${año}`;
  worksheet.getCell('A1').font = { bold: true, size: 16 };
  worksheet.getCell('A1').alignment = { horizontal: 'center' };

  // Headers
  worksheet.addRow([
    'RNC/Cédula',
    'Tipo ID',
    'Tipo Bien/Servicio',
    'NCF',
    'Fecha Comprobante',
    'Fecha Pago',
    'Monto Facturado',
    'ITBIS Facturado',
    'ITBIS Retenido',
    'ITBIS Proporcionalidad',
  ]);

  const headerRow = worksheet.getRow(2);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFED7D31' },
  };
  headerRow.font = { color: { argb: 'FFFFFFFF' }, bold: true };

  // Datos
  reportData.forEach(row => {
    worksheet.addRow([
      row.rnc_cedula,
      row.tipo_identificacion === '1' ? 'RNC' : 'Cédula',
      row.tipo_bienes_servicios,
      row.ncf,
      new Date(row.fecha_comprobante).toLocaleDateString('es-DO'),
      new Date(row.fecha_pago).toLocaleDateString('es-DO'),
      parseFloat(row.monto_facturado),
      parseFloat(row.itbis_facturado),
      parseFloat(row.itbis_retenido || 0),
      parseFloat(row.itbis_sujeto_proporcionalidad || 0),
    ]);
  });

  // Formato de columnas
  worksheet.getColumn(7).numFmt = '"RD$"#,##0.00';
  worksheet.getColumn(8).numFmt = '"RD$"#,##0.00';
  worksheet.getColumn(9).numFmt = '"RD$"#,##0.00';
  worksheet.getColumn(10).numFmt = '"RD$"#,##0.00';

  // Ajustar ancho
  worksheet.columns.forEach(column => {
    column.width = 15;
  });

  // Guardar
  const fileName = `606_${año}${String(mes).padStart(2, '0')}.xlsx`;
  const filePath = path.join(EXPORTS_DIR, fileName);

  await workbook.xlsx.writeFile(filePath);
  return filePath;
};

/**
 * Exportar Reporte 608 a Excel
 */
export const export608ToExcel = async (reportData, mes, año) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Reporte 608');

  // Título
  worksheet.mergeCells('A1:D1');
  worksheet.getCell('A1').value = `REPORTE 608 - ANULACIONES - ${mes}/${año}`;
  worksheet.getCell('A1').font = { bold: true, size: 16 };
  worksheet.getCell('A1').alignment = { horizontal: 'center' };

  // Headers
  worksheet.addRow([
    'NCF',
    'Fecha Comprobante',
    'Tipo Anulación',
    'Motivo',
  ]);

  const headerRow = worksheet.getRow(2);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE74C3C' },
  };
  headerRow.font = { color: { argb: 'FFFFFFFF' }, bold: true };

  // Datos
  const tiposAnulacion = {
    '01': 'Deterioro de factura',
    '02': 'Errores de impresión',
    '03': 'Impresión defectuosa',
    '04': 'Corrección de la información',
  };

  reportData.forEach(row => {
    worksheet.addRow([
      row.ncf,
      new Date(row.fecha_comprobante).toLocaleDateString('es-DO'),
      tiposAnulacion[row.tipo_anulacion] || row.tipo_anulacion,
      row.motivo || 'Sin especificar',
    ]);
  });

  // Ajustar ancho
  worksheet.getColumn(1).width = 20;
  worksheet.getColumn(2).width = 15;
  worksheet.getColumn(3).width = 30;
  worksheet.getColumn(4).width = 40;

  // Guardar
  const fileName = `608_${año}${String(mes).padStart(2, '0')}.xlsx`;
  const filePath = path.join(EXPORTS_DIR, fileName);

  await workbook.xlsx.writeFile(filePath);
  return filePath;
};

export default {
  export607ToExcel,
  export606ToExcel,
  export608ToExcel,
};