// frontend/src/utils/pdfExporter.js

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency, formatDate } from './formatters';

/**
 * Exportar factura individual a PDF
 * @param {Object} invoice - Datos de la factura
 */
export const exportInvoiceToPDF = (invoice) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // ====================================
  // ENCABEZADO - Información de la Empresa
  // ====================================
  doc.setFillColor(26, 86, 219); // Azul
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('TU FERRETERÍA S.R.L.', pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('RNC: 131-XXXXX-X | Tel: (809) 123-4567', pageWidth / 2, 22, { align: 'center' });
  doc.text('Av. Principal #456, Santo Domingo, R.D.', pageWidth / 2, 27, { align: 'center' });
  doc.text('ventas@tuferreteria.com', pageWidth / 2, 32, { align: 'center' });

  // ====================================
  // TÍTULO - FACTURA
  // ====================================
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURA DE VENTA', pageWidth / 2, 45, { align: 'center' });

  // ====================================
  // INFORMACIÓN DE FACTURA (Izquierda)
  // ====================================
  let yPos = 55;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMACIÓN DE FACTURA', 14, yPos);
  
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  const invoiceInfo = [
    ['Factura No.:', invoice.numero_factura],
    ['NCF:', invoice.ncf || 'N/A'],
    ['Fecha Emisión:', formatDate(invoice.fecha_emision)],
    ['Tipo de Venta:', invoice.tipo_venta.toUpperCase()],
  ];

  if (invoice.fecha_vencimiento) {
    invoiceInfo.push(['Vencimiento:', formatDate(invoice.fecha_vencimiento)]);
  }

  invoiceInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 14, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 50, yPos);
    yPos += 5;
  });

  // ====================================
  // INFORMACIÓN DEL CLIENTE (Derecha)
  // ====================================
  yPos = 55;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMACIÓN DEL CLIENTE', pageWidth - 90, yPos);
  
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  const customerInfo = [
    ['Cliente:', invoice.customer?.nombre_comercial || 'N/A'],
    ['RNC/Cédula:', invoice.customer?.numero_identificacion || 'N/A'],
    ['Teléfono:', invoice.customer?.telefono || 'N/A'],
    ['Email:', invoice.customer?.email || 'N/A'],
  ];

  customerInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, pageWidth - 90, yPos);
    doc.setFont('helvetica', 'normal');
    const maxWidth = 85;
    const splitValue = doc.splitTextToSize(value, maxWidth);
    doc.text(splitValue, pageWidth - 50, yPos);
    yPos += 5 * splitValue.length;
  });

  // ====================================
  // TABLA DE PRODUCTOS
  // ====================================
  const tableStartY = Math.max(yPos + 10, 95);

  const tableData = invoice.details?.map((item) => {
    const subtotal = (item.precio_unitario * item.cantidad) - item.descuento;
    const total = subtotal + item.itbis_monto;

    return [
      item.product?.codigo || 'N/A',
      item.product?.nombre || 'N/A',
      item.cantidad.toString(),
      formatCurrency(item.precio_unitario),
      item.itbis_porcentaje > 0 ? `${item.itbis_porcentaje}%` : 'Exento',
      formatCurrency(subtotal),
      formatCurrency(total),
    ];
  }) || [];

  doc.autoTable({
    startY: tableStartY,
    head: [['Código', 'Descripción', 'Cant.', 'Precio', 'ITBIS', 'Subtotal', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [26, 86, 219],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 60 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 15, halign: 'center' },
      5: { cellWidth: 25, halign: 'right' },
      6: { cellWidth: 25, halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  });

  // ====================================
  // NOTAS (Si existen)
  // ====================================
  let finalY = doc.lastAutoTable.finalY + 10;

  if (invoice.notas) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Notas:', 14, finalY);
    doc.setFont('helvetica', 'normal');
    
    const notasLines = doc.splitTextToSize(invoice.notas, pageWidth - 28);
    doc.text(notasLines, 14, finalY + 5);
    finalY += 5 + (notasLines.length * 5);
  }

  // ====================================
  // TOTALES
  // ====================================
  const totalsX = pageWidth - 70;
  finalY += 10;

  const totalsData = [
    ['Subtotal:', formatCurrency(invoice.subtotal)],
  ];

  if (invoice.descuento > 0) {
    totalsData.push(['Descuento:', `-${formatCurrency(invoice.descuento)}`]);
  }

  totalsData.push(['ITBIS (18%):', formatCurrency(invoice.itbis)]);

  totalsData.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(label, totalsX, finalY);
    doc.text(value, pageWidth - 14, finalY, { align: 'right' });
    finalY += 5;
  });

  // Total Final
  finalY += 2;
  doc.setDrawColor(0, 0, 0);
  doc.line(totalsX - 5, finalY - 2, pageWidth - 14, finalY - 2);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', totalsX, finalY + 3);
  doc.text(formatCurrency(invoice.total), pageWidth - 14, finalY + 3, { align: 'right' });

  // Balance Pendiente (si aplica)
  if (invoice.tipo_venta === 'credito' && invoice.balance_pendiente > 0) {
    finalY += 8;
    doc.setTextColor(220, 38, 38);
    doc.text('Balance Pendiente:', totalsX, finalY);
    doc.text(formatCurrency(invoice.balance_pendiente), pageWidth - 14, finalY, { align: 'right' });
    doc.setTextColor(0, 0, 0);
  }

  // ====================================
  // PIE DE PÁGINA
  // ====================================
  const footerY = pageHeight - 25;
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  
  doc.text(
    'Esta factura es un comprobante fiscal válido para fines tributarios según la DGII.',
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );
  
  doc.text(
    'Gracias por su preferencia. Para consultas comuníquese al (809) 123-4567',
    pageWidth / 2,
    footerY + 5,
    { align: 'center' }
  );

  // ====================================
  // GUARDAR PDF
  // ====================================
  const fileName = `Factura_${invoice.numero_factura}_${formatDate(invoice.fecha_emision)}.pdf`;
  doc.save(fileName);
};

/**
 * Exportar lista de facturas a PDF (reporte)
 * @param {Array} invoices - Array de facturas
 * @param {Object} filters - Filtros aplicados
 */
export const exportInvoiceListToPDF = (invoices, filters = {}) => {
  const doc = new jsPDF('landscape');
  const pageWidth = doc.internal.pageSize.width;

  // Título
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('REPORTE DE FACTURAS', pageWidth / 2, 15, { align: 'center' });

  // Filtros aplicados
  let yPos = 25;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  if (filters.fecha_desde || filters.fecha_hasta) {
    const periodo = `Período: ${filters.fecha_desde || 'Inicio'} - ${filters.fecha_hasta || 'Hoy'}`;
    doc.text(periodo, 14, yPos);
    yPos += 5;
  }

  if (filters.estado) {
    doc.text(`Estado: ${filters.estado.toUpperCase()}`, 14, yPos);
    yPos += 5;
  }

  // Tabla de facturas
  const tableData = invoices.map((inv) => [
    inv.numero_factura,
    inv.ncf || 'N/A',
    formatDate(inv.fecha_emision),
    inv.customer?.nombre_comercial || 'N/A',
    inv.tipo_venta.toUpperCase(),
    formatCurrency(inv.total),
    inv.balance_pendiente > 0 ? formatCurrency(inv.balance_pendiente) : '-',
    inv.estado.toUpperCase(),
  ]);

  doc.autoTable({
    startY: yPos + 5,
    head: [['Factura', 'NCF', 'Fecha', 'Cliente', 'Tipo', 'Total', 'Balance', 'Estado']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [26, 86, 219],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7,
    },
    margin: { left: 14, right: 14 },
  });

  // Totales
  const totalFacturado = invoices.reduce((sum, inv) => sum + parseFloat(inv.total), 0);
  const totalPendiente = invoices.reduce((sum, inv) => sum + parseFloat(inv.balance_pendiente), 0);

  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Facturado: ${formatCurrency(totalFacturado)}`, pageWidth - 80, finalY);
  doc.text(`Total Pendiente: ${formatCurrency(totalPendiente)}`, pageWidth - 80, finalY + 6);

  // Guardar
  const fecha = new Date().toLocaleDateString('es-DO').replace(/\//g, '-');
  doc.save(`Reporte_Facturas_${fecha}.pdf`);
};

export default {
  exportInvoiceToPDF,
  exportInvoiceListToPDF,
};