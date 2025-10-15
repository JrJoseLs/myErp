// frontend/src/components/reports/ReportExporter.jsx
import React from 'react';
import { Download, FileText, Table as TableIcon } from 'lucide-react';
import Button from '../common/Button';

/**
 * Componente para exportar reportes en diferentes formatos
 */
const ReportExporter = ({ onExportTXT, onExportExcel, disabled = false, className = '' }) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <Button 
        onClick={onExportTXT} 
        variant="secondary" 
        size="sm"
        disabled={disabled}
        className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
      >
        <FileText className="w-4 h-4 mr-2" />
        Formato TXT (DGII)
      </Button>

      <Button 
        onClick={onExportExcel} 
        variant="secondary" 
        size="sm"
        disabled={disabled}
        className="bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
      >
        <TableIcon className="w-4 h-4 mr-2" />
        Formato Excel
      </Button>
    </div>
  );
};

/**
 * Componente individual para botón de exportación
 */
export const ExportButton = ({ onClick, format = 'txt', label, disabled = false }) => {
  const configs = {
    txt: {
      icon: <FileText className="w-4 h-4 mr-2" />,
      label: label || 'Descargar TXT',
      className: 'bg-blue-600 hover:bg-blue-700',
    },
    excel: {
      icon: <TableIcon className="w-4 h-4 mr-2" />,
      label: label || 'Descargar Excel',
      className: 'bg-green-600 hover:bg-green-700',
    },
  };

  const config = configs[format] || configs.txt;

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={`${config.className} text-white`}
      size="sm"
    >
      {config.icon}
      {config.label}
    </Button>
  );
};

export default ReportExporter;