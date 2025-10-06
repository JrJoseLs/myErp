// config/businessTypes.js
export const BUSINESS_CONFIGS = {
  FERRETERIA: {
    modules: ['inventory', 'pos', 'invoices', 'customers'],
    posFeatures: {
      showStock: true,
      allowBackorder: false,
      defaultNCF: 'B02'
    }
  },
  RESTAURANTE: {
    modules: ['pos', 'menu', 'tables'],
    posFeatures: {
      showStock: false,
      allowModifiers: true,
      defaultNCF: 'B02'
    }
  },
  FARMACIA: {
    modules: ['inventory', 'pos', 'prescriptions'],
    posFeatures: {
      showStock: true,
      requireBatch: true,
      checkExpiry: true,
      defaultNCF: 'B02'
    }
  }
};