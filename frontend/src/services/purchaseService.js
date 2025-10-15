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
 * Crear una nueva compra
 */
export const createPurchase = async (purchaseData) => {
  const response = await api.post('/purchases', purchaseData);
  return response.data;
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
  updatePurchaseStatus,
  deletePurchase,
};