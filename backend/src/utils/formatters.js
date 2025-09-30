// backend/src/utils/formatters.js

/**
 * Utilidades de formateo para República Dominicana
 */

/**
 * Formatear moneda en pesos dominicanos (DOP)
 * @param {number} amount - Monto a formatear
 * @returns {string} - Monto formateado (ej: "RD$ 1,234.56")
 */
export const formatCurrencyDOP = (amount) => {
  if (isNaN(amount)) return 'RD$ 0.00';

  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(amount)
    .replace('DOP', 'RD$');
};

/**
 * Formatear moneda en dólares (USD)
 * @param {number} amount - Monto a formatear
 * @returns {string} - Monto formateado (ej: "US$ 1,234.56")
 */
export const formatCurrencyUSD = (amount) => {
  if (isNaN(amount)) return 'US$ 0.00';

  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formatear número con separadores de miles
 * @param {number} number - Número a formatear
 * @param {number} decimals - Cantidad de decimales
 * @returns {string} - Número formateado
 */
export const formatNumber = (number, decimals = 2) => {
  if (isNaN(number)) return '0.00';

  return new Intl.NumberFormat('es-DO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
};

/**
 * Formatear cédula dominicana (formato: 000-0000000-0)
 * @param {string} cedula - Cédula sin formato
 * @returns {string} - Cédula formateada
 */
export const formatCedula = (cedula) => {
  if (!cedula) return '';

  // Remover cualquier carácter que no sea número
  const clean = cedula.replace(/\D/g, '');

  // Validar longitud
  if (clean.length !== 11) return cedula;

  // Formatear: 000-0000000-0
  return `${clean.slice(0, 3)}-${clean.slice(3, 10)}-${clean.slice(10)}`;
};

/**
 * Formatear RNC dominicano (formato: 0-00-00000-0)
 * @param {string} rnc - RNC sin formato
 * @returns {string} - RNC formateado
 */
export const formatRNC = (rnc) => {
  if (!rnc) return '';

  // Remover cualquier carácter que no sea número
  const clean = rnc.replace(/\D/g, '');

  // Validar longitud (RNC tiene 9 u 11 dígitos)
  if (clean.length === 9) {
    // Formato: 0-00-00000-0
    return `${clean.slice(0, 1)}-${clean.slice(1, 3)}-${clean.slice(3, 8)}-${clean.slice(8)}`;
  } else if (clean.length === 11) {
    // Para RNC de 11 dígitos (personas físicas)
    return formatCedula(clean);
  }

  return rnc;
};

/**
 * Formatear teléfono dominicano (formato: (809) 000-0000)
 * @param {string} phone - Teléfono sin formato
 * @returns {string} - Teléfono formateado
 */
export const formatPhone = (phone) => {
  if (!phone) return '';

  // Remover cualquier carácter que no sea número
  const clean = phone.replace(/\D/g, '');

  // Validar longitud (10 dígitos)
  if (clean.length !== 10) return phone;

  // Formatear: (809) 000-0000
  return `(${clean.slice(0, 3)}) ${clean.slice(3, 6)}-${clean.slice(6)}`;
};

/**
 * Formatear fecha en formato DD/MM/YYYY
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} - Fecha formateada
 */
export const formatDate = (date) => {
  if (!date) return '';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Formatear fecha y hora en formato DD/MM/YYYY HH:MM AM/PM
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} - Fecha y hora formateadas
 */
export const formatDateTime = (date) => {
  if (!date) return '';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  return new Intl.DateTimeFormat('es-DO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(d);
};

/**
 * Calcular ITBIS sobre un monto
 * @param {number} amount - Monto base
 * @param {number} rate - Tasa de ITBIS (por defecto 18%)
 * @returns {object} - { subtotal, itbis, total }
 */
export const calculateITBIS = (amount, rate = 18) => {
  const subtotal = parseFloat(amount) || 0;
  const itbis = subtotal * (rate / 100);
  const total = subtotal + itbis;

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    itbis: parseFloat(itbis.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
    tasa: rate,
  };
};

/**
 * Calcular el monto sin ITBIS (extraer el ITBIS del total)
 * @param {number} totalWithITBIS - Monto total con ITBIS incluido
 * @param {number} rate - Tasa de ITBIS (por defecto 18%)
 * @returns {object} - { subtotal, itbis, total }
 */
export const extractITBIS = (totalWithITBIS, rate = 18) => {
  const total = parseFloat(totalWithITBIS) || 0;
  const subtotal = total / (1 + rate / 100);
  const itbis = total - subtotal;

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    itbis: parseFloat(itbis.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
    tasa: rate,
  };
};

/**
 * Validar formato de cédula dominicana
 * @param {string} cedula - Cédula a validar
 * @returns {boolean} - true si es válida
 */
export const isValidCedula = (cedula) => {
  if (!cedula) return false;

  const clean = cedula.replace(/\D/g, '');
  return clean.length === 11;
};

/**
 * Validar formato de RNC dominicano
 * @param {string} rnc - RNC a validar
 * @returns {boolean} - true si es válido
 */
export const isValidRNC = (rnc) => {
  if (!rnc) return false;

  const clean = rnc.replace(/\D/g, '');
  return clean.length === 9 || clean.length === 11;
};

/**
 * Validar NCF (Número de Comprobante Fiscal)
 * @param {string} ncf - NCF a validar
 * @returns {boolean} - true si es válido
 */
export const isValidNCF = (ncf) => {
  if (!ncf) return false;

  // Formato: B01XXXXXXXX (11 caracteres) o E31XXXXXXXX, etc.
  const ncfRegex = /^[A-Z]\d{2}\d{8}$/;
  return ncfRegex.test(ncf);
};

/**
 * Generar código de producto automático
 * @param {string} prefix - Prefijo (ej: "PROD")
 * @param {number} lastNumber - Último número usado
 * @returns {string} - Código generado (ej: "PROD-00001")
 */
export const generateProductCode = (prefix = 'PROD', lastNumber = 0) => {
  const nextNumber = lastNumber + 1;
  const paddedNumber = String(nextNumber).padStart(5, '0');
  return `${prefix}-${paddedNumber}`;
};

export default {
  formatCurrencyDOP,
  formatCurrencyUSD,
  formatNumber,
  formatCedula,
  formatRNC,
  formatPhone,
  formatDate,
  formatDateTime,
  calculateITBIS,
  extractITBIS,
  isValidCedula,
  isValidRNC,
  isValidNCF,
  generateProductCode,
};