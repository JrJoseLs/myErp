import app from './app.js';
import { connectDatabase, syncDatabase } from './config/database.js'; // Importar syncDatabase
import { appConfig } from './config/config.js';
import dotenv from 'dotenv';

dotenv.config();

// ✅ Usar el puerto asignado por Railway o el de appConfig (5000 en dev)
const PORT = process.env.PORT || 5000; 
const NODE_ENV = process.env.NODE_ENV || 'development';

// ----------------------------------------------------
// ✅ RUTA DE VERIFICACIÓN (HEALTH CHECK)
// ----------------------------------------------------
// Esta ruta responde instantáneamente y es vital para Railway.
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        environment: NODE_ENV,
        port: PORT,
        database: process.env.MYSQLDATABASE || 'undefined',
        timestamp: new Date().toISOString(),
    });
});
// ----------------------------------------------------

const startServer = async () => {
    try {
        // 1️⃣ Conectar a la Base de Datos PRIMERO (sincrónico)
        // Hacemos que la conexión a DB sea el paso de bloqueo inicial.
        // Si falla, el proceso debe salir (process.exit(1)).
        // Esto asegura que si Railway recibe una petición, la DB ya esté conectada.
        await connectDatabase(); 

        // 2️⃣ Sincronizar modelos SOLO EN DESARROLLO O CON FLAG
        if (NODE_ENV === 'development' || process.env.SYNC_DB === 'true') {
            // Nota: En producción, usa migraciones, no sequelize.sync()
            console.log(`\n⚙️ Entorno ${NODE_ENV}. Iniciando sincronización de DB...`);
            await syncDatabase(false, true); // force=false, alter=true
        } else {
            console.log('🔄 Sincronización de modelos omitida en producción. Se asume que se usaron migraciones.');
        }

        // 3️⃣ Iniciar el servidor Express
        app.listen(PORT, '0.0.0.0', () => {
            console.log('\n======================================================');
            console.log(`✅ Servidor Express en modo: ${NODE_ENV}`);
            console.log(`📡 Escuchando en el puerto: ${PORT}`);
            console.log('======================================================\n');
        });

    } catch (error) {
        console.error('\n❌ ERROR FATAL: El servidor no pudo iniciar.', error.message);
        // El proceso se cerrará aquí si connectDatabase falla.
        process.exit(1);
    }
};

// 🚀 Ejecutar la función de inicio
startServer();
