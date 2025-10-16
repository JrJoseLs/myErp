import app from './app.js';
import { connectDatabase } from './config/database.js';
import { appConfig } from './config/config.js';
import dotenv from 'dotenv';

dotenv.config(); // Asegura que las variables de entorno están cargadas

// ✅ Usa el puerto asignado por Railway o el de appConfig
const PORT = process.env.PORT || appConfig.port || 5000;

// ✅ Ruta de verificación (para probar desde Railway o navegador)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    database: process.env.MYSQLDATABASE || 'undefined',
    timestamp: new Date().toISOString(),
  });
});

const startServer = async () => {
  try {
    // 1. Conectar a la Base de Datos
    await connectDatabase();

    // 2. Iniciar el servidor Express
    app.listen(PORT, () => {
      console.log('\n======================================================');
      console.log(`✅ Servidor Express en modo ${appConfig.nodeEnv}`);
      console.log(`📡 Escuchando en el puerto: ${PORT}`);
      console.log(`🔗 Accede a la API en: ${appConfig.apiUrl || 'Railway URL detectada automáticamente'}`);
      console.log('======================================================\n');
    });
  } catch (error) {
    console.error('\n❌ Error fatal al iniciar el servidor:', error.message);
    process.exit(1);
  }
};

// Ejecutar la función de inicio
startServer();
