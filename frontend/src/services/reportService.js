// frontend/src/services/reportService.js

import api from './api';

/**
 * Generar Reporte 607 (Ventas)
 * @param {number} mes - Mes del reporte (1-12)
 * @param {number} año - Año del reporte
 * @returns {Promise}
 */
export const generateReport607 = async (mes, año) => {
  const response = await api.get('/reports/607', {
    params: { mes, año },
  });
  return response.data;
};

/**
 * Generar Reporte 606 (Compras)
 * @param {number} mes - Mes del reporte (1-12)
 * @param {number} año - Año del reporte
 * @returns {Promise}
 */
export const generateReport606 = async (mes, año) => {
  const response = await api.get('/reports/606', {
    params: { mes, año },
  });
  return response.data;
};

/**
 * Generar Reporte 608 (Anulaciones)
 * @param {number} mes - Mes del reporte (1-12)
 * @param {number} año - Año del reporte
 * @returns {Promise}
 */
export const generateReport608 = async (mes, año) => {
  const response = await api.get('/reports/608', {
    params: { mes, año },
  });
  return response.data;
};

/**
 * Descargar reporte en formato TXT
 * @param {string} tipo - Tipo de reporte (606, 607, 608)
 * @param {number} mes - Mes del reporte
 * @param {number} año - Año del reporte
 */
export const downloadReportTXT = async (tipo, mes, año) => {
  const response = await api.get(`/reports/${tipo}`, {
    params: { mes, año, format: 'txt' },
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${tipo}_${año}${String(mes).padStart(2, '0')}.txt`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

/**
 * Descargar reporte en formato Excel
 * @param {string} tipo - Tipo de reporte (606, 607, 608)
 * @param {number} mes - Mes del reporte
 * @param {number} año - Año del reporte
 */
export const downloadReportExcel = async (tipo, mes, año) => {
  const response = await api.get(`/reports/${tipo}`, {
    params: { mes, año, format: 'excel' },
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${tipo}_${año}${String(mes).padStart(2, '0')}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

/**
 * Guardar reporte en base de datos
 * @param {string} tipo - Tipo de reporte (606, 607, 608)
 * @param {number} mes - Mes del reporte
 * @param {number} año - Año del reporte
 */
export const saveReport = async (tipo, mes, año) => {
  const response = await api.post(`/reports/${tipo}/save`, { mes, año });
  return response.data;
};

export default {
  generateReport607,
  generateReport606,
  generateReport608,
  downloadReportTXT,
  downloadReportExcel,
  saveReport,
};