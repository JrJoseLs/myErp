export const appConfig = {
  // Servidor
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  apiUrl: process.env.API_URL || 'http://localhost:5000',

  // Base de datos
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    name: process.env.DB_NAME || 'erp_crm_db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
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
    taxRate: 0.18, // ITBIS 18%
    timezone: 'America/Santo_Domingo',
  },

  // Suscripción
  subscription: {
    checkInterval: process.env.SUBSCRIPTION_CHECK_INTERVAL || 86400000, // 24 horas
  },
};

export default appConfig;