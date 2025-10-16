import app from './app.js';
import { connectDatabase } from './config/database.js';
import { appConfig } from './config/config.js';
import dotenv from 'dotenv';

dotenv.config(); // Asegura que las variables de entorno están cargadas

/**
 * 🚨 INSTRUCCIÓN CRÍTICA PARA RAILWAY 🚨
 * * Basado en tus logs anteriores, tu servidor SÓLO está escuchando en el puerto 8080.
 * Para solucionar el error 502, ve al panel de variables de entorno de tu servicio 
 * en Railway y agrega la siguiente variable:
 * * CLAVE: PORT
 * VALOR: 8080
 * * Esto forzará a Railway a usar el puerto que tu aplicación está usando.
 */

// ✅ Usa el puerto asignado por Railway o el de appConfig
// Nota: Usar appConfig.port como fallback fue removido para forzar la depuración,
// si esto no funciona, significa que la variable PORT está siendo forzada a 8080.
const PORT = process.env.PORT || 5000; 

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

const startServer = () => {
    try {
        // 1️⃣ Iniciar el servidor Express INMEDIATAMENTE.
        app.listen(PORT, '0.0.0.0', () => {
            console.log('\n======================================================');
            console.log(`✅ Servidor Express en modo: ${appConfig.nodeEnv || 'development'}`);
            console.log(`📡 Escuchando en el puerto: ${PORT}`);
            // Removida la línea de log conflictiva.
            console.log('======================================================\n');
            
            // 2️⃣ Conectar a la Base de Datos DESPUÉS de que el servidor esté escuchando.
            console.log('🚀 Intentando conectar a MySQL (proceso en segundo plano)...');
            
            // Nota: Aquí se está ejecutando dos veces la conexión a MySQL en tu log anterior. 
            // Esto podría ser causado por la doble ejecución del script. 
            // Esta estructura es correcta si solo se ejecuta una vez.
            connectDatabase()
                .then(() => {
                    console.log('✅ Conexión a MySQL establecida correctamente');
                    console.log(`📊 Base de datos: ${process.env.MYSQLDATABASE || 'mysql'} (mysql)`);
                })
                .catch(error => {
                    console.error('\n❌ Error en la conexión a la Base de Datos:', error.message);
                });
        });
    } catch (error) {
        console.error('\n❌ Error fatal al iniciar el servidor Express:', error.message);
        process.exit(1);
    }
};

// 🚀 Ejecutar la función de inicio
startServer();

// NOTA: Si el error 502 persiste, la causa es que el comando de inicio (npm start) 
// está ejecutando el archivo 'server.js' DOS VECES, o existe un archivo de build antiguo.
// La única solución en el código es la instrucción de Railway arriba.