import app from './app.js';
import { connectDatabase } from './config/database.js';
import { appConfig } from './config/config.js';
import dotenv from 'dotenv';

dotenv.config(); // Asegurar que las variables de entorno están cargadas

const PORT = appConfig.port;

const startServer = async () => {
  try {
    // 1. Conectar a la Base de Datos
    // La función connectDatabase ya se encarga de llamar a sequelize.authenticate()
    await connectDatabase();

    // 2. Iniciar el servidor Express
    app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`✅ Servidor Express en modo ${appConfig.nodeEnv}`);
      console.log(`📡 Escuchando en el puerto: ${PORT}`);
      console.log(`🔗 Accede a la API en: ${appConfig.apiUrl}`);
      console.log(`======================================================\n`);
    });
  } catch (error) {
    console.error('\n❌ Error fatal al iniciar el servidor:', error.message);
    process.exit(1); // Salir con código de error
  }
};

// Ejecutar la función de inicio
startServer();