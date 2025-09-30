import api from './api'; // Asegúrate que './api' ya está configurado para manejar el token

const BASE_URL = '/products';
const CATEGORY_URL = '/products/categories';

// ============================================
// CATEGORIAS
// ============================================

export const getCategories = async () => {
  const { data } = await api.get(CATEGORY_URL);
  return data;
};

export const createCategory = async (categoryData) => {
  const { data } = await api.post(CATEGORY_URL, categoryData);
  return data;
};

export const updateCategory = async (id, categoryData) => {
  const { data } = await api.put(`${CATEGORY_URL}/${id}`, categoryData);
  return data;
};


// ============================================
// PRODUCTOS
// ============================================

export const getProducts = async (filters = {}) => {
  const { data } = await api.get(BASE_URL, { params: filters });
  return data;
};

export const getProductById = async (id) => {
  const { data } = await api.get(`${BASE_URL}/${id}`);
  return data;
};

export const createProduct = async (productData) => {
  const { data } = await api.post(BASE_URL, productData);
  return data;
};

export const updateProduct = async (id, productData) => {
  const { data } = await api.put(`${BASE_URL}/${id}`, productData);
  return data;
};

export const toggleProductStatus = async (id) => {
  const { data } = await api.patch(`${BASE_URL}/toggle-status/${id}`);
  return data;
};