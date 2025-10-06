// frontend/src/services/customerService.js
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
 * Obtener el cliente "Consumidor Final" para POS
 * @returns {Promise<number>} ID del cliente consumidor final
 */
export const getConsumidorFinal = async () => {
  try {
    const { data } = await api.get('/customers', { 
      params: { 
        search: 'CLI-00000',
        limit: 1 
      } 
    });
    
    if (data.customers && data.customers.length > 0) {
      return data.customers[0].id;
    }
    
    throw new Error('Cliente Consumidor Final no encontrado. Configure el cliente con código CLI-00000');
  } catch (error) {
    console.error('Error al obtener Consumidor Final:', error);
    throw error;
  }
};

/**
 * Verificar si el cliente Consumidor Final existe
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