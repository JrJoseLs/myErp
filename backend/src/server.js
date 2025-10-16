import app from './app.js';
import { connectDatabase } from './config/database.js';
import { appConfig } from './config/config.js';
import dotenv from 'dotenv';

dotenv.config(); // Asegura que las variables de entorno están cargadas

// ✅ Usa el puerto asignado por Railway o el de appConfig
const PORT = process.env.PORT || appConfig.port || 5000;

// ✅ Ruta de verificación (para Railway Health Check)
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        environment: process.env.NODE_ENV || 'development',
        port: PORT,
        database: process.env.MYSQLDATABASE || 'undefined',
        timestamp: new Date().toISOString(),
    });
});

const startServer = () => { // Ya no es 'async', el 'await' de la DB se mueve
    try {
        // 1️⃣ Iniciar el servidor Express INMEDIATAMENTE.
        // Esto asegura que Railway reciba una respuesta rápida para el Health Check.
        app.listen(PORT, '0.0.0.0', () => {
            console.log('\n======================================================');
            console.log(`✅ Servidor Express en modo: ${appConfig.nodeEnv || 'development'}`);
            console.log(`📡 Escuchando en el puerto: ${PORT}`);
            console.log(`🔗 Accede a la API en: ${appConfig.apiUrl || 'Railway URL (automática)'}`);
            console.log('======================================================\n');
            
            // 2️⃣ Conectar a la Base de Datos DESPUÉS de que el servidor esté escuchando.
            // Si falla, el servidor sigue vivo para al menos responder errores 500.
            console.log('🚀 Intentando conectar a MySQL (proceso en segundo plano)...');
            connectDatabase()
                .then(() => {
                    console.log('✅ Conexión a MySQL establecida correctamente');
                    console.log(`📊 Base de datos: ${process.env.MYSQLDATABASE || 'mysql'} (mysql)`);
                })
                .catch(error => {
                    // Si falla la DB, solo se registra el error, NO se detiene la aplicación.
                    console.error('\n❌ Error en la conexión a la Base de Datos:', error.message);
                });
        });
    } catch (error) {
        // Este catch maneja errores al iniciar Express, no errores de DB.
        console.error('\n❌ Error fatal al iniciar el servidor Express:', error.message);
        process.exit(1); // Si Express no inicia, cerramos la app
    }
};

// 🚀 Ejecutar la función de inicio
startServer();

// NOTA: Si necesitas que la aplicación NO atienda peticiones sin la DB, 
// puedes usar un middleware para devolver un 503 (Service Unavailable)
// hasta que la promesa de connectDatabase se resuelva.