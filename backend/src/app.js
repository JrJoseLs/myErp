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

// Middlewares
import { notFound, errorHandler } from './middlewares/errorHandler.js';

const app = express();

// CORS
app.use(cors({
  origin: appConfig.nodeEnv === 'development' ? '*' : appConfig.apiUrl,
  methods: ['GET','POST','PUT','PATCH','DELETE'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.get('/', (req, res) => {
  res.json({ message: `API ERP/CRM en modo ${appConfig.nodeEnv}`, version: '1.0.0', status: 'online' });
});

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

// Manejo de errores
app.use(notFound);
app.use(errorHandler);

export default app;
