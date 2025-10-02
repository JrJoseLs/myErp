// frontend/src/components/invoices/InvoicePrint.jsx

import React, { useRef } from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Printer, Download } from 'lucide-react';
import Button from '../common/Button';
import { exportInvoiceToPDF } from '../../utils/pdfExporter';

const InvoicePrint = ({ invoice }) => {
  const printRef = useRef();

  const handlePrint = () => {
    const printContent = printRef.current;
    const windowPrint = window.open('', '', 'width=800,height=600');
    
    windowPrint.document.write(`
      <html>
        <head>
          <title>Factura ${invoice.numero_factura}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; font-size: 12px; }
            .invoice-container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 15px; }
            .company-info { text-align: center; margin-bottom: 10px; }
            .company-name { font-size: 20px; font-weight: bold; margin-bottom: 5px; }
            .company-details { font-size: 11px; color: #555; }
            .invoice-title { text-align: center; font-size: 16px; font-weight: bold; margin: 15px 0; }
            .info-section { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .info-box { width: 48%; }
            .info-row { margin-bottom: 5px; }
            .info-label { font-weight: bold; display: inline-block; width: 120px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background-color: #f0f0f0; padding: 8px; text-align: left; border: 1px solid #ddd; font-weight: bold; }
            td { padding: 8px; border: 1px solid #ddd; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .totals-section { margin-top: 20px; float: right; width: 300px; }
            .total-row { display: flex; justify-content: space-between; padding: 5px 0; }
            .total-row.final { border-top: 2px solid #000; margin-top: 10px; padding-top: 10px; font-size: 14px; font-weight: bold; }
            .footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 15px; font-size: 10px; text-align: center; color: #666; }
            .signature-section { margin-top: 50px; display: flex; justify-content: space-around; }
            .signature-box { text-align: center; width: 200px; }
            .signature-line { border-top: 1px solid #000; margin-top: 50px; padding-top: 5px; }
            @media print {
              button { display: none; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            window.onload = function() { 
              window.print(); 
              window.onafterprint = function() { window.close(); }
            }
          </script>
        </body>
      </html>
    `);
    
    windowPrint.document.close();
  };

  if (!invoice) return null;

  const calcularSubtotalItem = (item) => {
    return (item.precio_unitario * item.cantidad) - item.descuento;
  };

  return (
    <div>
      <div className="mb-4 no-print flex space-x-3">
        <Button onClick={handlePrint} className="flex items-center space-x-2">
          <Printer className="w-5 h-5" />
          <span>Imprimir Factura</span>
        </Button>
        
        <Button 
          onClick={() => exportInvoiceToPDF(invoice)} 
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
        >
          <Download className="w-5 h-5" />
          <span>Descargar PDF</span>
        </Button>
      </div>

      <div ref={printRef} className="bg-white p-8 rounded-lg shadow-lg">
        {/* Header - Información de la Empresa */}
        <div className="header">
          <div className="company-info">
            <div className="company-name">TU FERRETERÍA S.R.L.</div>
            <div className="company-details">
              RNC: 131-XXXXX-X | Teléfono: (809) 123-4567<br />
              Dirección: Av. Principal #456, Santo Domingo, República Dominicana<br />
              Email: ventas@tuferreteria.com
            </div>
          </div>
        </div>

        {/* Título */}
        <div className="invoice-title">
          FACTURA DE VENTA
        </div>

        {/* Información de Factura y Cliente */}
        <div className="info-section">
          <div className="info-box">
            <div className="info-row">
              <span className="info-label">Cliente:</span>
              <span>{invoice.customer?.nombre_comercial}</span>
            </div>
            <div className="info-row">
              <span className="info-label">RNC/Cédula:</span>
              <span>{invoice.customer?.numero_identificacion}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Dirección:</span>
              <span>{invoice.customer?.direccion || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Teléfono:</span>
              <span>{invoice.customer?.telefono || 'N/A'}</span>
            </div>
          </div>

          <div className="info-box">
            <div className="info-row">
              <span className="info-label">Factura No.:</span>
              <span style={{fontWeight: 'bold'}}>{invoice.numero_factura}</span>
            </div>
            <div className="info-row">
              <span className="info-label">NCF:</span>
              <span style={{fontWeight: 'bold', color: '#0066cc', fontSize: '14px', letterSpacing: '1px'}}>
                {invoice.ncf || 'N/A'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Fecha:</span>
              <span>{formatDate(invoice.fecha_emision)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Tipo de Venta:</span>
              <span style={{textTransform: 'uppercase'}}>{invoice.tipo_venta}</span>
            </div>
            {invoice.fecha_vencimiento && (
              <div className="info-row">
                <span className="info-label">Vencimiento:</span>
                <span>{formatDate(invoice.fecha_vencimiento)}</span>
              </div>
            )}
            <div className="info-row">
              <span className="info-label">Vendedor:</span>
              <span>{invoice.seller?.nombre_completo || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Tabla de Productos */}
        <table>
          <thead>
            <tr>
              <th style={{width: '10%'}}>Código</th>
              <th style={{width: '35%'}}>Descripción</th>
              <th className="text-center" style={{width: '10%'}}>Cant.</th>
              <th className="text-right" style={{width: '12%'}}>Precio</th>
              <th className="text-center" style={{width: '10%'}}>ITBIS</th>
              <th className="text-right" style={{width: '12%'}}>Subtotal</th>
              <th className="text-right" style={{width: '11%'}}>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.details?.map((item, index) => {
              const subtotal = calcularSubtotalItem(item);
              const total = subtotal + item.itbis_monto;
              
              return (
                <tr key={index}>
                  <td>{item.product?.codigo}</td>
                  <td>
                    {item.product?.nombre}
                    {item.descuento > 0 && (
                      <div style={{fontSize: '10px', color: '#666'}}>
                        Desc: {formatCurrency(item.descuento)}
                      </div>
                    )}
                  </td>
                  <td className="text-center">{item.cantidad}</td>
                  <td className="text-right">{formatCurrency(item.precio_unitario)}</td>
                  <td className="text-center">
                    {item.itbis_porcentaje > 0 ? `${item.itbis_porcentaje}%` : 'Exento'}
                  </td>
                  <td className="text-right">{formatCurrency(subtotal)}</td>
                  <td className="text-right">{formatCurrency(total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Notas */}
        {invoice.notas && (
          <div style={{margin: '20px 0', padding: '10px', backgroundColor: '#f9f9f9', borderLeft: '3px solid #0066cc'}}>
            <strong>Notas:</strong> {invoice.notas}
          </div>
        )}

        {/* Totales */}
        <div className="totals-section">
          <div className="total-row">
            <span>Subtotal:</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>
          {invoice.descuento > 0 && (
            <div className="total-row">
              <span>Descuento:</span>
              <span>-{formatCurrency(invoice.descuento)}</span>
            </div>
          )}
          <div className="total-row">
            <span>ITBIS (18%):</span>
            <span>{formatCurrency(invoice.itbis)}</span>
          </div>
          <div className="total-row final">
            <span>TOTAL A PAGAR:</span>
            <span>{formatCurrency(invoice.total)}</span>
          </div>
          {invoice.tipo_venta === 'credito' && invoice.balance_pendiente > 0 && (
            <div className="total-row" style={{color: '#dc2626', marginTop: '5px'}}>
              <span>Balance Pendiente:</span>
              <span>{formatCurrency(invoice.balance_pendiente)}</span>
            </div>
          )}
        </div>

        <div style={{clear: 'both'}}></div>

        {/* Firmas */}
        <div className="signature-section">
          <div className="signature-box">
            <div className="signature-line">Firma del Cliente</div>
          </div>
          <div className="signature-box">
            <div className="signature-line">Firma Autorizada</div>
          </div>
        </div>

        {/* Footer */}
        <div className="footer">
          <p>Esta factura es un comprobante fiscal válido para fines tributarios según la DGII.</p>
          <p>Gracias por su preferencia. Para cualquier consulta comuníquese al (809) 123-4567</p>
          <p style={{marginTop: '10px'}}>
            <strong>IMPORTANTE:</strong> Esta factura debe conservarse por 10 años según lo establece la ley tributaria.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoicePrint;