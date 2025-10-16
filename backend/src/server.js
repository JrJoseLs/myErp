import app from './app.js';
import { connectDatabase, syncDatabase } from './config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Ruta de verificación (Health Check)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: NODE_ENV,
    port: PORT,
    database: process.env.MYSQLDATABASE || 'undefined',
    timestamp: new Date().toISOString(),
  });
});

const startServer = async () => {
  try {
    // 1️⃣ Conectar a la base de datos
    await connectDatabase();

    // 2️⃣ Sincronizar modelos en dev o con flag
    if (NODE_ENV === 'development' || process.env.SYNC_DB === 'true') {
      console.log(`⚙️ Entorno ${NODE_ENV}: sincronizando DB...`);
      await syncDatabase(false, true);
    }

    // 3️⃣ Iniciar servidor Express
    app.listen(PORT, '0.0.0.0', () => {
      console.log('\n======================================================');
      console.log(`✅ Servidor Express en modo: ${NODE_ENV}`);
      console.log(`📡 Escuchando en el puerto: ${PORT}`);
      console.log('======================================================\n');
    });

  } catch (error) {
    console.error('\n❌ ERROR FATAL: El servidor no pudo iniciar.', error.message);
    process.exit(1);
  }
};

startServer();
