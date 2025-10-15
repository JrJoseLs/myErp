// ============================================
// Script de inicialización para Railway
// Ejecutar: node src/scripts/initRailway.js
// ============================================

import dotenv from 'dotenv';
import { connectDatabase, syncDatabase, checkDatabaseHealth } from '../config/database.js';

dotenv.config();

const initRailway = async () => {
  console.log('🚀 Iniciando configuración para Railway...\n');
  
  try {
    // 1. Verificar variables de entorno
    console.log('📋 Verificando variables de entorno...');
    const requiredVars = ['MYSQL_URL', 'JWT_SECRET', 'NODE_ENV'];
    const missingVars = requiredVars.filter(v => !process.env[v]);
    
    if (missingVars.length > 0) {
      console.warn('⚠️  Variables faltantes:', missingVars.join(', '));
    } else {
      console.log('✅ Todas las variables requeridas están configuradas');
    }
    console.log('');

    // 2. Conectar a la base de datos
    console.log('🔌 Conectando a la base de datos...');
    await connectDatabase();
    console.log('');

    // 3. Verificar salud de la base de datos
    console.log('🏥 Verificando salud de la base de datos...');
    const health = await checkDatabaseHealth();
    console.log('Estado:', health.status);
    console.log('Base de datos:', health.database);
    console.log('Dialect:', health.dialect);
    console.log('');

    // 4. Preguntar si quiere sincronizar
    console.log('⚠️  IMPORTANTE: ¿Deseas sincronizar las tablas?');
    console.log('   - sync: Crea tablas si no existen (recomendado para primera vez)');
    console.log('   - force: BORRA todas las tablas y las recrea (¡CUIDADO!)');
    console.log('   - skip: Omitir sincronización');
    console.log('');
    
    const syncMode = process.argv[2] || 'sync';
    
    if (syncMode === 'force') {
      console.log('🔥 Modo FORCE: Recreando todas las tablas...');
      await syncDatabase(true, false);
    } else if (syncMode === 'sync') {
      console.log('📋 Modo SYNC: Creando tablas faltantes...');
      await syncDatabase(false, false);
      
      // Verificar si hay datos
      const { User } = await import('../models/index.js');
      const userCount = await User.count();
      
      if (userCount === 0) {
        console.log('📦 No hay usuarios, insertando datos iniciales...');
        const { seedInitialData } = await import('../config/database.js');
        await seedInitialData();
      } else {
        console.log(`✅ Base de datos ya tiene ${userCount} usuario(s)`);
      }
    } else {
      console.log('⏭️  Omitiendo sincronización');
    }
    
    console.log('');
    console.log('🎉 ¡Configuración completada exitosamente!');
    console.log('');
    console.log('📝 Próximos pasos:');
    console.log('   1. Verifica que el servidor esté corriendo: npm start');
    console.log('   2. Prueba el endpoint de salud: /health');
    console.log('   3. Inicia sesión con: admin@erp.com / Admin123!');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Error durante la inicialización:', error.message);
    console.error('');
    
    if (error.original) {
      console.error('Detalles del error:', error.original.message);
    }
    
    process.exit(1);
  }
};

// Ejecutar
initRailway();