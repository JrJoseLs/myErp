// frontend/src/services/productService.js
import api from './api';

const BASE_URL = '/products';

/**
 * Obtener todos los productos con filtros
 */
export const getProducts = async (filters = {}) => {
  try {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== undefined && v !== '')
    );
    
    const { data } = await api.get(BASE_URL, { params: cleanFilters });
    return data;
  } catch (error) {
    console.error('Error al obtener productos:', error);
    throw error;
  }
};

/**
 * Obtener un producto por ID
 */
export const getProductById = async (id) => {
  try {
    const { data } = await api.get(`${BASE_URL}/${id}`);
    return data;
  } catch (error) {
    console.error('Error al obtener producto:', error);
    throw error;
  }
};

/**
 * Buscar productos por código o nombre
 */
export const searchProducts = async (query) => {
  try {
    const { data } = await api.get(`${BASE_URL}/search`, {
      params: { q: query }
    });
    return data;
  } catch (error) {
    console.error('Error al buscar productos:', error);
    throw error;
  }
};

/**
 * Crear un nuevo producto
 */
export const createProduct = async (productData) => {
  try {
    const { data } = await api.post(BASE_URL, productData);
    return data;
  } catch (error) {
    console.error('Error al crear producto:', error);
    throw error;
  }
};

/**
 * Actualizar un producto
 */
export const updateProduct = async (id, productData) => {
  try {
    const { data } = await api.put(`${BASE_URL}/${id}`, productData);
    return data;
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    throw error;
  }
};

/**
 * Eliminar un producto
 */
export const deleteProduct = async (id) => {
  try {
    const { data } = await api.delete(`${BASE_URL}/${id}`);
    return data;
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    throw error;
  }
};

export default {
  getProducts,
  getProductById,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};