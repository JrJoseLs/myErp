import api from './api';

export const getInvoices = async (filters = {}) => {
  try {
    const { data } = await api.get('/invoices', { params: filters });
    return data;
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    throw error;
  }
};

export const getInvoiceById = async (id) => {
  try {
    const { data } = await api.get(`/invoices/${id}`);
    return data;
  } catch (error) {
    console.error('Error al obtener factura:', error);
    throw error;
  }
};

export const createInvoice = async (invoiceData) => {
  try {
    const { data } = await api.post('/invoices', invoiceData);
    return data;
  } catch (error) {
    console.error('Error al crear factura:', error);
    throw error;
  }
};

export const anularInvoice = async (id, motivo) => {
  try {
    const { data } = await api.patch(`/invoices/${id}/anular`, { motivo_anulacion: motivo });
    return data;
  } catch (error) {
    console.error('Error al anular factura:', error);
    throw error;
  }
};

export const registerPayment = async (id, paymentData) => {
  try {
    const { data } = await api.post(`/invoices/${id}/payments`, paymentData);
    return data;
  } catch (error) {
    console.error('Error al registrar pago:', error);
    throw error;
  }
};

export const getInvoiceStats = async (filters = {}) => {
  try {
    const { data } = await api.get('/invoices/stats', { params: filters });
    return data;
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw error;
  }
};