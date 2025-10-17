// frontend/src/services/supplierService.js
import api from './api';

const BASE_URL = '/suppliers';

/**
 * Obtener todos los proveedores con filtros
 */
export const getSuppliers = async (filters = {}) => {
  try {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== undefined && v !== '')
    );
    
    const { data } = await api.get(BASE_URL, { params: cleanFilters });
    return data;
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    throw error;
  }
};

/**
 * Obtener un proveedor por ID
 */
export const getSupplierById = async (id) => {
  try {
    const { data } = await api.get(`${BASE_URL}/${id}`);
    return data;
  } catch (error) {
    console.error('Error al obtener proveedor:', error);
    throw error;
  }
};

/**
 * Crear un nuevo proveedor
 */
export const createSupplier = async (supplierData) => {
  try {
    const { data } = await api.post(BASE_URL, supplierData);
    return data;
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    throw error;
  }
};

/**
 * Actualizar un proveedor
 */
export const updateSupplier = async (id, supplierData) => {
  try {
    const { data } = await api.put(`${BASE_URL}/${id}`, supplierData);
    return data;
  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    throw error;
  }
};

/**
 * Eliminar un proveedor
 */
export const deleteSupplier = async (id) => {
  try {
    const { data } = await api.delete(`${BASE_URL}/${id}`);
    return data;
  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    throw error;
  }
};

export default {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};