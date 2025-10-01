import api from './api';

export const getNCFRanges = async () => {
  try {
    const { data } = await api.get('/ncf');
    return data;
  } catch (error) {
    console.error('Error al obtener rangos NCF:', error);
    throw error;
  }
};

export const getNextNCF = async (tipo) => {
  try {
    const { data } = await api.get(`/ncf/next/${tipo}`);
    return data;
  } catch (error) {
    console.error('Error al obtener siguiente NCF:', error);
    throw error;
  }
};

export const createNCFRange = async (rangeData) => {
  try {
    const { data } = await api.post('/ncf', rangeData);
    return data;
  } catch (error) {
    console.error('Error al crear rango NCF:', error);
    throw error;
  }
};