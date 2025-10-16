// frontend/src/services/supplierService.js

import api from './api';

/**
 * Obtener todos los proveedores con filtros
 */
export const getSuppliers = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.search) params.append('search', filters.search);
  if (filters.activo !== undefined) params.append('activo', filters.activo);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);

  const response = await api.get(`/suppliers?${params.toString()}`);
  return response.data;
};

/**
 * Obtener un proveedor por ID
 */
export const getSupplierById = async (id) => {
  const response = await api.get(`/suppliers/${id}`);
  return response.data;
};

/**
 * Crear un nuevo proveedor
 */
export const createSupplier = async (supplierData) => {
  const response = await api.post('/suppliers', supplierData);
  return response.data;
};

/**
 * Actualizar un proveedor
 */
export const updateSupplier = async (id, supplierData) => {
  const response = await api.put(`/suppliers/${id}`, supplierData);
  return response.data;
};

/**
 * Cambiar estado de un proveedor
 */
export const toggleSupplierStatus = async (id) => {
  const response = await api.patch(`/suppliers/${id}/toggle-status`);
  return response.data;
};

export default {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  toggleSupplierStatus,
};