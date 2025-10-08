// import api from './api';

// export const getCustomers = async (filters = {}) => {
//   try {
//     const { data } = await api.get('/customers', { params: filters });
//     return data;
//   } catch (error) {
//     console.error('Error al obtener clientes:', error);
//     throw error;
//   }
// };

// export const getCustomerById = async (id) => {
//   try {
//     const { data } = await api.get(`/customers/${id}`);
//     return data;
//   } catch (error) {
//     console.error('Error al obtener cliente:', error);
//     throw error;
//   }
// };

// export const createCustomer = async (customerData) => {
//   try {
//     const { data } = await api.post('/customers', customerData);
//     return data;
//   } catch (error) {
//     console.error('Error al crear cliente:', error);
//     throw error;
//   }
// };

// export const updateCustomer = async (id, customerData) => {
//   try {
//     const { data } = await api.put(`/customers/${id}`, customerData);
//     return data;
//   } catch (error) {
//     console.error('Error al actualizar cliente:', error);
//     throw error;
//   }
// };

// export const toggleCustomerStatus = async (id) => {
//   try {
//     const { data } = await api.patch(`/customers/toggle-status/${id}`);
//     return data;
//   } catch (error) {
//     console.error('Error al cambiar estado del cliente:', error);
//     throw error;
//   }
// };

// export const generateCustomerCode = async () => {
//   try {
//     const { data } = await api.get('/customers/generate-code');
//     return data;
//   } catch (error) {
//     console.error('Error al generar código:', error);
//     throw error;
//   }
// };

// frontend/src/services/customerService.js - VERSIÓN CORREGIDA

import api from './api';

export const getCustomers = async (filters = {}) => {
  try {
    const { data } = await api.get('/customers', { params: filters });
    return data;
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    throw error;
  }
};

export const getCustomerById = async (id) => {
  try {
    const { data } = await api.get(`/customers/${id}`);
    return data;
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    throw error;
  }
};

export const createCustomer = async (customerData) => {
  try {
    const { data } = await api.post('/customers', customerData);
    return data;
  } catch (error) {
    console.error('Error al crear cliente:', error);
    throw error;
  }
};

export const updateCustomer = async (id, customerData) => {
  try {
    const { data } = await api.put(`/customers/${id}`, customerData);
    return data;
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    throw error;
  }
};

export const toggleCustomerStatus = async (id) => {
  try {
    const { data } = await api.patch(`/customers/toggle-status/${id}`);
    return data;
  } catch (error) {
    console.error('Error al cambiar estado del cliente:', error);
    throw error;
  }
};

export const generateCustomerCode = async () => {
  try {
    const { data } = await api.get('/customers/generate-code');
    return data;
  } catch (error) {
    console.error('Error al generar código:', error);
    throw error;
  }
};

/**
 * Obtener o crear cliente "Consumidor Final"
 * @returns {Promise<number>} ID del cliente consumidor final
 */
export const getConsumidorFinal = async () => {
  try {
    const { data } = await api.get('/customers/consumidor-final');
    if (data.success && data.customer) {
      return data.customer.id;
    }
    throw new Error('No se pudo obtener el cliente Consumidor Final');
  } catch (error) {
    throw new Error('Configure el cliente CLI-00000 como Consumidor Final');
  }
};

/**
 * ✅ NUEVA: Verificar si existe el cliente Consumidor Final
 * @returns {Promise<boolean>}
 */
export const verifyConsumidorFinal = async () => {
  try {
    await getConsumidorFinal();
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * ✅ NUEVA: Crear cliente rápido desde POS
 * @param {Object} customerData - Datos mínimos del cliente
 * @returns {Promise<Object>} Cliente creado
 */
export const createQuickCustomer = async (customerData) => {
  try {
    // Generar código automático
    const codeData = await generateCustomerCode();
    
    const quickData = {
      codigo_cliente: codeData.codigo,
      tipo_identificacion: customerData.tipo_identificacion || 'CEDULA',
      numero_identificacion: customerData.numero_identificacion,
      nombre_comercial: customerData.nombre_comercial,
      razon_social: customerData.nombre_comercial,
      tipo_cliente: 'contado',
      activo: true,
      notas: 'Cliente creado desde POS',
    };
    
    const { data } = await api.post('/customers', quickData);
    return data.customer;
  } catch (error) {
    console.error('Error al crear cliente rápido:', error);
    throw error;
  }
};