// backend/src/app.js - CONFIGURADO PARA TU PROYECTO

import express from 'express';
import cors from 'cors';
import { appConfig } from './config/config.js';

// Importar rutas
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import ncfRoutes from './routes/ncfRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import posRoutes from './routes/posRoutes.js';
import dgiiRoutes from './routes/dgiiRoutes.js';

// Importar middlewares
import { notFound, errorHandler } from './middlewares/errorHandler.js';

const app = express();

// ============================================
// CONFIGURACIÓN DE CORS
// ============================================

const allowedOrigins = () => {
  if (appConfig.nodeEnv === 'development') {
    return '*'; // En desarrollo permite todo
  }
  
  // En producción, usar FRONTEND_URL
  const frontendUrl = process.env.FRONTEND_URL;
  if (frontendUrl) {
    // Permite múltiples URLs separadas por coma
    const origins = frontendUrl.split(',').map(url => url.trim());
    console.log('🔒 CORS configurado para:', origins);
    return origins;
  }
  
  // Fallback: permite tu frontend de Vercel
  const defaultOrigins = [
    'https://my-erp-nine.vercel.app',
    'https://my-erp-nine-git-main.vercel.app'
  ];
  console.log('⚠️  Usando orígenes por defecto:', defaultOrigins);
  return defaultOrigins;
};

// ============================================
// MIDDLEWARES GLOBALES
// ============================================

app.use(
  cors({
    origin: allowedOrigins(),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de requests en desarrollo
if (appConfig.nodeEnv === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// RUTAS
// ============================================

app.get('/', (req, res) => {
  res.json({
    message: `API ERP/CRM en modo ${appConfig.nodeEnv}`,
    version: '1.0.0',
    status: 'online',
    etapa: 'Etapa 6 - Reportes DGII + POS',
    timestamp: new Date().toISOString(),
    cors: appConfig.nodeEnv === 'development' ? 'permitido para todos' : 'configurado para Vercel',
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    uptime: process.uptime(),
    environment: appConfig.nodeEnv,
    database: 'MySQL Railway',
    frontend: 'Vercel'
  });
});

// Endpoint de prueba de CORS
app.get('/api/v1/test', (req, res) => {
  res.json({
    message: 'CORS está funcionando correctamente! 🎉',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin || 'No origin header',
  });
});

// Rutas de la API (v1)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/ncf', ncfRoutes);
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/pos', posRoutes);
app.use('/api/v1/dgii', dgiiRoutes);

// ============================================
// MANEJO DE ERRORES
// ============================================

app.use(notFound);
app.use(errorHandler);

export default app;