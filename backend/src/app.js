// backend/src/app.js

import express from 'express';
import cors from 'cors';
import { appConfig } from './config/config.js';

// Importar rutas
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';

// Importar middlewares
import { notFound, errorHandler } from './middlewares/errorHandler.js';

const app = express();

// ============================================
// MIDDLEWARES GLOBALES
// ============================================

// Habilitar CORS para peticiones desde el frontend (React/Vite)
app.use(
  cors({
    origin:
      appConfig.nodeEnv === 'development'
        ? '*' // Permitir todos en desarrollo
        : appConfig.apiUrl, // Usar la URL definida en producción
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser para peticiones JSON y x-www-form-urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// RUTAS
// ============================================

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    message: `API ERP/CRM en modo ${appConfig.nodeEnv}`,
    version: '1.0.0',
    status: 'online',
  });
});

// Rutas de la API (v1)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/inventory', inventoryRoutes);

// ============================================
// MANEJO DE ERRORES (Debe ir al final)
// ============================================

// Middleware para manejar rutas no encontradas (404)
app.use(notFound);

// Middleware de manejo de errores general
app.use(errorHandler);

export default app;