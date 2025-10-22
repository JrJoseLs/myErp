import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { appConfig } from './config/config.js';

// Importar rutas
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import ncfRoutes from './routes/ncfRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import posRoutes from './routes/posRoutes.js';
import dgiiRoutes from './routes/dgiiRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

// Importar middlewares
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

const getCorsOrigins = () => {
    if (appConfig.nodeEnv === 'development') {
        return '*';
    }

    const frontendUrl = process.env.FRONTEND_URL;
    if (frontendUrl) {
        const origins = frontendUrl.split(',').map(url => url.trim());
        console.log('🔒 CORS configurado para:', origins);
        return origins;
    }

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

app.use(cors(corsOptions));
app.use(helmet());

if (appConfig.nodeEnv === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

// Rutas de la API (v1)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/suppliers', supplierRoutes);
app.use('/api/v1/purchases', purchaseRoutes);
app.use('/api/v1/ncf', ncfRoutes);
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/pos', posRoutes);
app.use('/api/v1/dgii', dgiiRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// 404 - Ruta no encontrada
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    });
});

// Error handler global
app.use(errorHandler);

export default app;