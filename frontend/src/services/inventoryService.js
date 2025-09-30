// frontend/src/services/inventoryService.js

import api from './api';

const BASE_URL = '/inventory';

// ============================================
// MOVIMIENTOS DE INVENTARIO
// ============================================

/**
 * Obtener historial de movimientos
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise}
 */
export const getInventoryMovements = async (filters = {}) => {
  try {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== undefined && v !== '')
    );
    
    const { data } = await api.get(`${BASE_URL}/movements`, { params: cleanFilters });
    return data;
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    throw error;
  }
};

/**
 * Obtener movimientos de un producto específico
 * @param {number} productId 
 * @param {number} limit 
 * @returns {Promise}
 */
export const getProductMovements = async (productId, limit = 20) => {
  try {
    const { data } = await api.get(`${BASE_URL}/movements/product/${productId}`, {
      params: { limit }
    });
    return data;
  } catch (error) {
    console.error('Error al obtener movimientos del producto:', error);
    throw error;
  }
};

/**
 * Crear un movimiento de inventario
 * @param {Object} movementData 
 * @returns {Promise}
 */
export const createInventoryMovement = async (movementData) => {
  try {
    const { data } = await api.post(`${BASE_URL}/movements`, movementData);
    return data;
  } catch (error) {
    console.error('Error al crear movimiento:', error);
    throw error;
  }
};

/**
 * Obtener productos con stock bajo
 * @returns {Promise}
 */
export const getLowStockProducts = async () => {
  try {
    const { data } = await api.get(`${BASE_URL}/low-stock`);
    return data;
  } catch (error) {
    console.error('Error al obtener productos con stock bajo:', error);
    throw error;
  }
};

/**
 * Obtener valorización del inventario
 * @param {number} categoryId - Filtro opcional por categoría
 * @returns {Promise}
 */
export const getInventoryValuation = async (categoryId = null) => {
  try {
    const params = categoryId ? { categoria_id: categoryId } : {};
    const { data } = await api.get(`${BASE_URL}/valuation`, { params });
    return data;
  } catch (error) {
    console.error('Error al obtener valorización:', error);
    throw error;
  }
};