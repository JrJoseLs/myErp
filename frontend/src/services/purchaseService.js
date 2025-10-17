// frontend/src/services/purchaseService.js - NUEVO ARCHIVO

import api from './api';

const BASE_URL = '/purchases';

/**
 * Obtener todas las compras con filtros
 */
export const getPurchases = async (filters = {}) => {
  try {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== undefined && v !== '')
    );
    
    const { data } = await api.get(BASE_URL, { params: cleanFilters });
    return data;
  } catch (error) {
    console.error('Error al obtener compras:', error);
    throw error;
  }
};

/**
 * Obtener una compra por ID
 */
export const getPurchaseById = async (id) => {
  try {
    const { data } = await api.get(`${BASE_URL}/${id}`);
    return data;
  } catch (error) {
    console.error('Error al obtener compra:', error);
    throw error;
  }
};

/**
 * Crear compra con movimiento de inventario (para Reporte 606)
 * Esta función se usa cuando registras una entrada de inventario con proveedor
 */
export const createPurchaseWithMovement = async (purchaseData) => {
  try {
    // Estructura de datos esperada por el backend
    const payload = {
      proveedor_id: purchaseData.proveedor_id,
      ncf_proveedor: purchaseData.ncf_proveedor,
      fecha_compra: new Date().toISOString().split('T')[0],
      tipo_compra: 'contado',
      productos: [
        {
          producto_id: purchaseData.producto_id,
          cantidad: purchaseData.cantidad,
          precio_unitario: purchaseData.costo_unitario,
          itbis_porcentaje: 18, // Por defecto 18%
        }
      ],
      notas: purchaseData.motivo || 'Compra registrada desde movimiento de inventario',
    };

    const { data } = await api.post(BASE_URL, payload);
    return data;
  } catch (error) {
    console.error('Error al crear compra:', error);
    throw error;
  }
};

/**
 * Crear una compra normal (múltiples productos)
 */
export const createPurchase = async (purchaseData) => {
  try {
    const { data } = await api.post(BASE_URL, purchaseData);
    return data;
  } catch (error) {
    console.error('Error al crear compra:', error);
    throw error;
  }
};

/**
 * Actualizar estado de una compra
 */
export const updatePurchaseStatus = async (id, estado) => {
  try {
    const { data } = await api.put(`${BASE_URL}/${id}/status`, { estado });
    return data;
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    throw error;
  }
};

/**
 * Eliminar una compra
 */
export const deletePurchase = async (id) => {
  try {
    const { data } = await api.delete(`${BASE_URL}/${id}`);
    return data;
  } catch (error) {
    console.error('Error al eliminar compra:', error);
    throw error;
  }
};

export default {
  getPurchases,
  getPurchaseById,
  createPurchase,
  createPurchaseWithMovement,
  updatePurchaseStatus,
  deletePurchase,
};