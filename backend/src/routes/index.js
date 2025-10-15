// backend/src/routes/index.js

import authRoutes from './authRoutes.js';
import productRoutes from './productRoutes.js';
import purchaseRoutes from './purchaseRoutes.js';


export default (app) => {
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/products', productRoutes);
  app.use('/api/v1/purchases', purchaseRoutes); // ✅ Ruta para compras agregada
  // ... otras rutas ...
};
