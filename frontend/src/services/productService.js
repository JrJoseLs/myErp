// frontend/src/services/productService.js

import api from './api';

const BASE_URL = '/products';
const CATEGORY_URL = '/products/categories';

// ============================================
// CATEGORIAS
// ============================================

export const getCategories = async () => {
  try {
    const { data } = await api.get(CATEGORY_URL);
    return data;
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    throw error;
  }
};

export const createCategory = async (categoryData) => {
  try {
    const { data } = await api.post(CATEGORY_URL, categoryData);
    return data;
  } catch (error) {
    console.error('Error al crear categoría:', error);
    throw error;
  }
};

export const updateCategory = async (id, categoryData) => {
  try {
    const { data } = await api.put(`${CATEGORY_URL}/${id}`, categoryData);
    return data;
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    throw error;
  }
};

// ============================================
// PRODUCTOS
// ============================================

export const getProducts = async (filters = {}) => {
  try {
    // Limpiar filtros undefined
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

export const getProductById = async (id) => {
  try {
    const { data } = await api.get(`${BASE_URL}/${id}`);
    return data;
  } catch (error) {
    console.error('Error al obtener producto:', error);
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    const { data } = await api.post(BASE_URL, productData);
    return data;
  } catch (error) {
    console.error('Error al crear producto:', error);
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const { data } = await api.put(`${BASE_URL}/${id}`, productData);
    return data;
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    throw error;
  }
};

export const toggleProductStatus = async (id) => {
  try {
    const { data } = await api.patch(`${BASE_URL}/toggle-status/${id}`);
    return data;
  } catch (error) {
    console.error('Error al cambiar estado del producto:', error);
    throw error;
  }
};