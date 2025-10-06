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

export const getCustomerById = async id => {
  try {
    const { data } = await api.get(`/customers/${id}`);
    return data;
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    throw error;
  }
};

export const createCustomer = async customerData => {
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

export const toggleCustomerStatus = async id => {
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

// --- FUNCIÓN AÑADIDA PARA CORREGIR EL ERROR DE EXPORTACIÓN ---
/**
 * Busca el ID del cliente designado como 'Consumidor Final'.
 *
 * NOTA: Debes asegurarte de que tu endpoint '/customers/consumidor-final'
 * exista y devuelva el ID o el objeto del cliente esperado.
 */
export const getConsumidorFinal = async () => {
  try {
    // ASUNCIÓN: Tu backend tiene un endpoint para obtener el cliente por defecto.
    const { data } = await api.get('/customers/consumidor-final');
    // ASUNCIÓN: El endpoint devuelve un objeto con la estructura { id: '...' }
    // o simplemente el ID directamente. Aquí se retorna `data.id` o `data`.
    return data.id || data;
  } catch (error) {
    console.error('Error al obtener el ID de Consumidor Final:', error); // Este error será capturado en POS.jsx para mostrar el mensaje de configuración.
    throw new Error(
      'No se pudo obtener el ID del Consumidor Final. Verifique la configuración del servidor.'
    );
  }
};
