// backend/src/routes/index.js

import authRoutes from './authRoutes.js';
import productRoutes from './productRoutes.js'; // Asegúrate de importar

export default (app) => {
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/products', productRoutes); // 👈 ¡Debe ser products!
  // ... otras rutas ...
};