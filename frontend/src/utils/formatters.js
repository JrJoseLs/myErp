// frontend/src/utils/formatters.js

/**
 * Formatear moneda en pesos dominicanos
 * @param {number} amount 
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  if (isNaN(amount) || amount === null || amount === undefined) return 'RD$ 0.00';
  
  return `RD$ ${parseFloat(amount).toLocaleString('es-DO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Formatear número
 * @param {number} number 
 * @param {number} decimals 
 * @returns {string}
 */
export const formatNumber = (number, decimals = 0) => {
  if (isNaN(number)) return '0';
  
  return parseFloat(number).toLocaleString('es-DO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Formatear fecha
 * @param {string|Date} date 
 * @returns {string}
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
 * Formatear fecha y hora
 * @param {string|Date} date 
 * @returns {string}
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  return d.toLocaleString('es-DO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Calcular ITBIS
 * @param {number} amount 
 * @param {number} rate 
 * @returns {object}
 */
export const calculateITBIS = (amount, rate = 18) => {
  const subtotal = parseFloat(amount) || 0;
  const itbis = subtotal * (rate / 100);
  const total = subtotal + itbis;
  
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    itbis: parseFloat(itbis.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
  };
};

/**
 * Obtener badge de stock
 * @param {number} actual 
 * @param {number} minimo 
 * @returns {object}
 */
export const getStockBadge = (actual, minimo) => {
  if (actual <= 0) {
    return { text: 'Agotado', color: 'bg-red-500' };
  } else if (actual <= minimo) {
    return { text: 'Stock Bajo', color: 'bg-yellow-500' };
  } else {
    return { text: 'Disponible', color: 'bg-green-500' };
  }
};