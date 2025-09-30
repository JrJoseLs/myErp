// backend/src/utils/validators.js

/**
 * Validadores personalizados para el ERP/CRM
 */

/**
 * Validar email
 * @param {string} email - Email a validar
 * @returns {boolean} - true si es válido
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validar cédula dominicana (11 dígitos)
 * @param {string} cedula - Cédula a validar
 * @returns {object} - { valid: boolean, message: string }
 */
export const validateCedula = (cedula) => {
  if (!cedula) {
    return { valid: false, message: 'La cédula es requerida' };
  }

  const clean = cedula.replace(/\D/g, '');

  if (clean.length !== 11) {
    return { valid: false, message: 'La cédula debe tener 11 dígitos' };
  }

  // Validación básica de dígitos (no todos iguales)
  if (/^(\d)\1+$/.test(clean)) {
    return { valid: false, message: 'Cédula inválida' };
  }

  return { valid: true, message: 'Cédula válida' };
};

/**
 * Validar RNC dominicano (9 u 11 dígitos)
 * @param {string} rnc - RNC a validar
 * @returns {object} - { valid: boolean, message: string }
 */
export const validateRNC = (rnc) => {
  if (!rnc) {
    return { valid: false, message: 'El RNC es requerido' };
  }

  const clean = rnc.replace(/\D/g, '');

  if (clean.length !== 9 && clean.length !== 11) {
    return { valid: false, message: 'El RNC debe tener 9 u 11 dígitos' };
  }

  // Validación básica de dígitos (no todos iguales)
  if (/^(\d)\1+$/.test(clean)) {
    return { valid: false, message: 'RNC inválido' };
  }

  return { valid: true, message: 'RNC válido' };
};

/**
 * Validar NCF (Número de Comprobante Fiscal)
 * @param {string} ncf - NCF a validar
 * @param {string} tipo - Tipo de NCF esperado (opcional)
 * @returns {object} - { valid: boolean, message: string, tipo: string }
 */
export const validateNCF = (ncf, tipo = null) => {
  if (!ncf) {
    return { valid: false, message: 'El NCF es requerido' };
  }

  // Formato estándar: B01XXXXXXXX (letra + 2 dígitos + 8 dígitos = 11 caracteres)
  const ncfRegex = /^([A-Z])(\d{2})(\d{8})$/;
  const match = ncf.match(ncfRegex);

  if (!match) {
    return {
      valid: false,
      message: 'Formato de NCF inválido. Debe ser: LetraDigitosDigitos (ej: B0100000001)',
    };
  }

  const [, serie, tipoNCF, secuencia] = match;
  const tipoCompleto = `${serie}${tipoNCF}`;

  // Validar tipos válidos de NCF
  const tiposValidos = ['B01', 'B02', 'B14', 'B15', 'B16', 'E31', 'E32', 'E33', 'E34', 'E41', 'E43', 'E44', 'E45', 'E46', 'E47'];

  if (!tiposValidos.includes(tipoCompleto)) {
    return {
      valid: false,
      message: `Tipo de NCF "${tipoCompleto}" no es válido`,
      tipo: tipoCompleto,
    };
  }

  // Si se especificó un tipo, validar que coincida
  if (tipo && tipoCompleto !== tipo) {
    return {
      valid: false,
      message: `Se esperaba NCF tipo "${tipo}", pero se recibió "${tipoCompleto}"`,
      tipo: tipoCompleto,
    };
  }

  return {
    valid: true,
    message: 'NCF válido',
    tipo: tipoCompleto,
    secuencia: parseInt(secuencia),
  };
};

/**
 * Validar teléfono dominicano (10 dígitos)
 * @param {string} phone - Teléfono a validar
 * @returns {object} - { valid: boolean, message: string }
 */
export const validatePhone = (phone) => {
  if (!phone) {
    return { valid: false, message: 'El teléfono es requerido' };
  }

  const clean = phone.replace(/\D/g, '');

  if (clean.length !== 10) {
    return { valid: false, message: 'El teléfono debe tener 10 dígitos' };
  }

  // Validar que comience con código de área válido (809, 829, 849)
  const codigosArea = ['809', '829', '849'];
  const codigoArea = clean.substring(0, 3);

  if (!codigosArea.includes(codigoArea)) {
    return {
      valid: false,
      message: 'Código de área inválido. Debe ser 809, 829 o 849',
    };
  }

  return { valid: true, message: 'Teléfono válido' };
};

/**
 * Validar contraseña segura
 * @param {string} password - Contraseña a validar
 * @returns {object} - { valid: boolean, message: string, strength: string }
 */
export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, message: 'La contraseña es requerida', strength: 'none' };
  }

  if (password.length < 6) {
    return {
      valid: false,
      message: 'La contraseña debe tener al menos 6 caracteres',
      strength: 'weak',
    };
  }

  let strength = 'weak';
  let score = 0;

  // Verificar longitud
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Verificar mayúsculas
  if (/[A-Z]/.test(password)) score++;

  // Verificar minúsculas
  if (/[a-z]/.test(password)) score++;

  // Verificar números
  if (/\d/.test(password)) score++;

  // Verificar caracteres especiales
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

  if (score >= 5) strength = 'strong';
  else if (score >= 3) strength = 'medium';

  return {
    valid: true,
    message: 'Contraseña válida',
    strength,
    score,
  };
};

/**
 * Validar rango de fechas
 * @param {Date|string} startDate - Fecha de inicio
 * @param {Date|string} endDate - Fecha de fin
 * @returns {object} - { valid: boolean, message: string }
 */
export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return { valid: false, message: 'Ambas fechas son requeridas' };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, message: 'Formato de fecha inválido' };
  }

  if (start > end) {
    return {
      valid: false,
      message: 'La fecha de inicio no puede ser mayor que la fecha de fin',
    };
  }

  return { valid: true, message: 'Rango de fechas válido' };
};

/**
 * Validar monto monetario
 * @param {number|string} amount - Monto a validar
 * @param {number} min - Monto mínimo permitido
 * @param {number} max - Monto máximo permitido
 * @returns {object} - { valid: boolean, message: string }
 */
export const validateAmount = (amount, min = 0, max = Infinity) => {
  if (amount === null || amount === undefined || amount === '') {
    return { valid: false, message: 'El monto es requerido' };
  }

  const numAmount = parseFloat(amount);

  if (isNaN(numAmount)) {
    return { valid: false, message: 'El monto debe ser un número válido' };
  }

  if (numAmount < min) {
    return {
      valid: false,
      message: `El monto no puede ser menor a ${min}`,
    };
  }

  if (numAmount > max) {
    return {
      valid: false,
      message: `El monto no puede ser mayor a ${max}`,
    };
  }

  return { valid: true, message: 'Monto válido' };
};

/**
 * Validar código de producto
 * @param {string} code - Código a validar
 * @returns {object} - { valid: boolean, message: string }
 */
export const validateProductCode = (code) => {
  if (!code) {
    return { valid: false, message: 'El código es requerido' };
  }

  if (code.length < 2 || code.length > 50) {
    return {
      valid: false,
      message: 'El código debe tener entre 2 y 50 caracteres',
    };
  }

  // Permitir letras, números, guiones y guiones bajos
  const codeRegex = /^[A-Za-z0-9_-]+$/;

  if (!codeRegex.test(code)) {
    return {
      valid: false,
      message: 'El código solo puede contener letras, números, guiones y guiones bajos',
    };
  }

  return { valid: true, message: 'Código válido' };
};

/**
 * Validar porcentaje
 * @param {number|string} percentage - Porcentaje a validar
 * @param {number} min - Valor mínimo (default 0)
 * @param {number} max - Valor máximo (default 100)
 * @returns {object} - { valid: boolean, message: string }
 */
export const validatePercentage = (percentage, min = 0, max = 100) => {
  if (percentage === null || percentage === undefined || percentage === '') {
    return { valid: false, message: 'El porcentaje es requerido' };
  }

  const numPercentage = parseFloat(percentage);

  if (isNaN(numPercentage)) {
    return { valid: false, message: 'El porcentaje debe ser un número válido' };
  }

  if (numPercentage < min || numPercentage > max) {
    return {
      valid: false,
      message: `El porcentaje debe estar entre ${min} y ${max}`,
    };
  }

  return { valid: true, message: 'Porcentaje válido' };
};

/**
 * Sanitizar string (remover caracteres especiales peligrosos)
 * @param {string} str - String a sanitizar
 * @returns {string} - String sanitizado
 */
export const sanitizeString = (str) => {
  if (!str) return '';

  return str
    .trim()
    .replace(/[<>]/g, '') // Remover < y >
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+=/gi, ''); // Remover event handlers
};

/**
 * Validar stock
 * @param {number} stock - Cantidad de stock
 * @param {number} stockMin - Stock mínimo
 * @param {number} stockMax - Stock máximo
 * @returns {object} - { valid: boolean, message: string, alert: string }
 */
export const validateStock = (stock, stockMin = 0, stockMax = Infinity) => {
  const numStock = parseInt(stock);

  if (isNaN(numStock) || numStock < 0) {
    return {
      valid: false,
      message: 'El stock debe ser un número mayor o igual a 0',
      alert: null,
    };
  }

  let alert = null;

  if (numStock <= stockMin) {
    alert = 'stock_bajo';
  } else if (numStock >= stockMax) {
    alert = 'stock_alto';
  }

  return {
    valid: true,
    message: 'Stock válido',
    alert,
  };
};

export default {
  isValidEmail,
  validateCedula,
  validateRNC,
  validateNCF,
  validatePhone,
  validatePassword,
  validateDateRange,
  validateAmount,
  validateProductCode,
  validatePercentage,
  sanitizeString,
  validateStock,
};