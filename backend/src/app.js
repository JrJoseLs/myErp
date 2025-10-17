import express from 'express';
import cors from 'cors';
import helmet from 'helmet'; // Nuevo: Seguridad (HTTP Headers)
import morgan from 'morgan'; // Nuevo: Logger de peticiones
import { appConfig } from './config/config.js';

// Importar rutas (se mantienen las importaciones individuales)
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

// Importar middlewares (solo errorHandler, se maneja 404 en línea)
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// ============================================
// CONFIGURACIÓN DE CORS
// ============================================

/**
 * Determina los orígenes permitidos para CORS basados en el entorno.
 * Manteniendo la lógica de tu código original (FRONTEND_URL y Vercel).
 */
const getCorsOrigins = () => {
    if (appConfig.nodeEnv === 'development') {
        // En desarrollo, se permite todo. También puedes añadir 'http://localhost:5173'
        return '*';
    }

    // En producción/staging, utiliza FRONTEND_URL si está definido
    const frontendUrl = process.env.FRONTEND_URL;
    if (frontendUrl) {
        // Permite múltiples URLs separadas por coma
        const origins = frontendUrl.split(',').map(url => url.trim());
        console.log('🔒 CORS configurado para:', origins);
        return origins;
    }

    // Fallback: usar los orígenes por defecto de Vercel
    const defaultOrigins = [
        'https://my-erp-nine.vercel.app',
        'https://my-erp-nine-git-main.vercel.app'
    ];
    console.log('⚠️ Usando orígenes por defecto:', defaultOrigins);
    return defaultOrigins;
};

const corsOptions = {
    origin: getCorsOrigins(),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

// ============================================
// MIDDLEWARES GLOBALES
// ============================================

app.use(cors(corsOptions));

// Seguridad: Establece cabeceras HTTP seguras
app.use(helmet());

// Logger: Usa 'dev' en desarrollo y 'combined' en producción
if (appConfig.nodeEnv === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Body parsers: Configuración para manejar JSON y URL-encoded con límite de 10MB
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// RUTAS PRINCIPALES
// ============================================

// Health check / Root endpoint (actualizado al estilo del nuevo snippet)
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🚀 myERP API - República Dominicana',
        version: '1.0.0',
        status: 'online',
        environment: appConfig.nodeEnv,
        timestamp: new Date().toISOString(),
    });
});

// Rutas de la API (v1) - Manteniendo las rutas individuales
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

// 404 - Ruta no encontrada (captura cualquier ruta no manejada)
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    });
});

// Error handler global (último middleware)
app.use(errorHandler);

export default app;
