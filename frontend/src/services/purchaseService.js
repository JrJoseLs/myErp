// // frontend/src/services/purchaseService.js

// import api from './api';

// /**
//  * Obtener todas las compras con filtros
//  */
// export const getPurchases = async (filters = {}) => {
//   const params = new URLSearchParams();
  
//   if (filters.proveedor_id) params.append('proveedor_id', filters.proveedor_id);
//   if (filters.estado) params.append('estado', filters.estado);
//   if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
//   if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
//   if (filters.page) params.append('page', filters.page);
//   if (filters.limit) params.append('limit', filters.limit);

//   const response = await api.get(`/purchases?${params.toString()}`);
//   return response.data;
// };

// /**
//  * Obtener una compra por ID
//  */
// export const getPurchaseById = async (id) => {
//   const response = await api.get(`/purchases/${id}`);
//   return response.data;
// };

// /**
//  * Crear una nueva compra
//  */
// export const createPurchase = async (purchaseData) => {
//   const response = await api.post('/purchases', purchaseData);
//   return response.data;
// };

// /**
//  * Actualizar estado de una compra
//  */
// export const updatePurchaseStatus = async (id, estado) => {
//   const response = await api.put(`/purchases/${id}/status`, { estado });
//   return response.data;
// };

// /**
//  * Eliminar una compra
//  */
// export const deletePurchase = async (id) => {
//   const response = await api.delete(`/purchases/${id}`);
//   return response.data;
// };

// export default {
//   getPurchases,
//   getPurchaseById,
//   createPurchase,
//   updatePurchaseStatus,
//   deletePurchase,
// };

// frontend/src/services/purchaseService.js

import api from './api';

/**
 * Obtener todas las compras con filtros
 */
export const getPurchases = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.proveedor_id) params.append('proveedor_id', filters.proveedor_id);
  if (filters.estado) params.append('estado', filters.estado);
  if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
  if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);

  const response = await api.get(`/purchases?${params.toString()}`);
  return response.data;
};

/**
 * Obtener una compra por ID
 */
export const getPurchaseById = async (id) => {
  const response = await api.get(`/purchases/${id}`);
  return response.data;
};

/**
 * Crear una nueva compra (para movimientos de entrada con proveedor)
 */
export const createPurchase = async (purchaseData) => {
  const response = await api.post('/purchases', purchaseData);
  return response.data;
};

/**
 * Crear entrada de inventario con compra automática
 * Esta función crea tanto el movimiento de inventario como el registro de compra
 */
export const createPurchaseWithMovement = async (movementData) => {
  try {
    // Si tiene proveedor y NCF, crear compra completa
    if (movementData.proveedor_id && movementData.ncf_proveedor) {
      const purchaseData = {
        proveedor_id: movementData.proveedor_id,
        ncf_proveedor: movementData.ncf_proveedor,
        fecha_compra: new Date().toISOString().split('T')[0],
        tipo_compra: 'contado',
        productos: [
          {
            producto_id: movementData.producto_id,
            cantidad: movementData.cantidad,
            precio_unitario: movementData.costo_unitario || 0,
            itbis_porcentaje: 18, // Por defecto 18%
          },
        ],
        notas: movementData.motivo,
      };

      const response = await api.post('/purchases', purchaseData);
      return response.data;
    } else {
      // Si no tiene proveedor, solo crear movimiento de inventario
      const response = await api.post('/inventory/movements', movementData);
      return response.data;
    }
  } catch (error) {
    console.error('Error al crear entrada:', error);
    throw error;
  }
};

/**
 * Actualizar estado de una compra
 */
export const updatePurchaseStatus = async (id, estado) => {
  const response = await api.put(`/purchases/${id}/status`, { estado });
  return response.data;
};

/**
 * Eliminar una compra
 */
export const deletePurchase = async (id) => {
  const response = await api.delete(`/purchases/${id}`);
  return response.data;
};

export default {
  getPurchases,
  getPurchaseById,
  createPurchase,
  createPurchaseWithMovement,
  updatePurchaseStatus,
  deletePurchase,
};