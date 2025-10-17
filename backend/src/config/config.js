// backend/src/config/config.js - CONFIGURADO PARA RAILWAY

export const appConfig = {
  // Servidor
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  apiUrl: process.env.API_URL || 'http://localhost:5000',

  // Base de datos - USANDO LAS VARIABLES DE RAILWAY
  database: {
    host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
    port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
    name: process.env.MYSQLDATABASE || process.env.DB_NAME || 'erp_crm_db',
    user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || 'root',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'change_this_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // DGII
  dgii: {
    apiUrl: process.env.DGII_API_URL || 'https://dgii.gov.do/api',
    apiKey: process.env.DGII_API_KEY || '',
  },

  // Email
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
  },

  // Uploads
  upload: {
    maxSize: process.env.MAX_FILE_SIZE || 5242880, // 5MB
    path: process.env.UPLOAD_PATH || './uploads',
  },

  // República Dominicana
  country: {
    currency: 'DOP',
    taxRate: 0.18, // ITBIS
    timezone: 'America/Santo_Domingo',
  },

  // Company Info (para reportes)
  company: {
    rnc: process.env.COMPANY_RNC || '000000000',
    name: process.env.COMPANY_NAME || 'Mi Empresa SRL',
    address: process.env.COMPANY_ADDRESS || 'Calle Principal #123',
    phone: process.env.COMPANY_PHONE || '809-555-1234',
  },
};

// Log de configuración en desarrollo
if (appConfig.nodeEnv === 'development') {
  console.log('📋 Configuración cargada:');
  console.log('  - Ambiente:', appConfig.nodeEnv);
  console.log('  - Puerto:', appConfig.port);
  console.log('  - Base de datos:', `${appConfig.database.host}:${appConfig.database.port}/${appConfig.database.name}`);
}

export default appConfig;