// backend/src/services/dgiiService.js

import axios from 'axios';

/**
 * Validar RNC con el servicio web de la DGII
 * @param {string} rnc - RNC a validar (sin guiones)
 * @returns {Promise<Object>}
 */
export const validateRNC = async (rnc) => {
  try {
    // Limpiar RNC (remover guiones)
    const cleanRNC = rnc.replace(/[^0-9]/g, '');

    if (cleanRNC.length !== 9 && cleanRNC.length !== 11) {
      return {
        valid: false,
        error: 'RNC debe tener 9 u 11 dígitos',
      };
    }

    // Llamada al API de la DGII (endpoint público)
    // NOTA: La DGII tiene un servicio web público en:
    // https://dgii.gov.do/app/WebApps/ConsultasWeb/consultas/rnc.aspx
    
    const response = await axios.get(
      `https://dgii.gov.do/app/WebApps/ConsultasWeb/consultas/rnc.aspx`,
      {
        params: { rnc: cleanRNC },
        timeout: 10000, // 10 segundos
        headers: {
          'User-Agent': 'ERP-CRM-DO/1.0',
        },
      }
    );

    // Parsear respuesta HTML (la DGII retorna HTML, no JSON)
    const htmlResponse = response.data;
    
    if (htmlResponse.includes('No se encontró')) {
      return {
        valid: false,
        error: 'RNC no encontrado en la DGII',
      };
    }

    // Extraer datos básicos (parsing simple)
    const razonSocial = extractFromHTML(htmlResponse, 'Nombre', '</td>');
    const estado = extractFromHTML(htmlResponse, 'Estado', '</td>');

    return {
      valid: true,
      rnc: cleanRNC,
      razon_social: razonSocial || 'No disponible',
      estado: estado || 'Activo',
      fecha_consulta: new Date(),
    };
  } catch (error) {
    console.error('Error al validar RNC con DGII:', error.message);
    
    return {
      valid: false,
      error: 'Error al conectar con el servicio de la DGII. Intente nuevamente.',
      details: error.message,
    };
  }
};

/**
 * Validar Cédula dominicana
 * @param {string} cedula - Cédula a validar
 * @returns {Object}
 */
export const validateCedula = (cedula) => {
  const cleanCedula = cedula.replace(/[^0-9]/g, '');

  if (cleanCedula.length !== 11) {
    return {
      valid: false,
      error: 'La cédula debe tener 11 dígitos',
    };
  }

  // Validación básica de formato (no todos los dígitos iguales)
  if (/^(\d)\1+$/.test(cleanCedula)) {
    return {
      valid: false,
      error: 'Cédula inválida (formato incorrecto)',
    };
  }

  return {
    valid: true,
    cedula: cleanCedula,
    formatted: formatCedula(cleanCedula),
  };
};

/**
 * Formatear cédula (000-0000000-0)
 * @param {string} cedula 
 * @returns {string}
 */
const formatCedula = (cedula) => {
  const clean = cedula.replace(/\D/g, '');
  if (clean.length !== 11) return cedula;
  return `${clean.slice(0, 3)}-${clean.slice(3, 10)}-${clean.slice(10)}`;
};

/**
 * Formatear RNC (0-00-00000-0 o 000-0000000-0)
 * @param {string} rnc 
 * @returns {string}
 */
export const formatRNC = (rnc) => {
  const clean = rnc.replace(/\D/g, '');
  
  if (clean.length === 9) {
    return `${clean.slice(0, 1)}-${clean.slice(1, 3)}-${clean.slice(3, 8)}-${clean.slice(8)}`;
  } else if (clean.length === 11) {
    return formatCedula(clean);
  }
  
  return rnc;
};

/**
 * Helper para extraer datos de HTML
 * @param {string} html 
 * @param {string} label 
 * @param {string} endTag 
 * @returns {string}
 */
const extractFromHTML = (html, label, endTag) => {
  try {
    const regex = new RegExp(`${label}.*?>([^<]+)${endTag}`, 'i');
    const match = html.match(regex);
    return match ? match[1].trim() : '';
  } catch (error) {
    return '';
  }
};

export default {
  validateRNC,
  validateCedula,
  formatRNC,
  formatCedula,
};