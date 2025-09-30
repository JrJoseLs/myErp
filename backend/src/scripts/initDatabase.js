import { connectDatabase, syncDatabase, closeDatabase } from '../config/database.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

const initDatabase = async () => {
  console.log('\n========================================');
  console.log('🚀 INICIALIZACIÓN DE BASE DE DATOS');
  console.log('========================================\n');

  try {
    // Conectar a la base de datos
    await connectDatabase();

    console.log('\n📋 Opciones de sincronización:\n');
    console.log('1. Sincronización normal (sin cambios destructivos)');
    console.log('2. Sincronización con alter (modifica tablas existentes)');
    console.log('3. Sincronización force (ELIMINA todas las tablas y las recrea)');
    console.log('4. Solo verificar conexión\n');

    const option = await askQuestion('Selecciona una opción (1-4): ');

    switch (option.trim()) {
      case '1':
        console.log('\n📝 Sincronizando base de datos (modo normal)...\n');
        await syncDatabase(false, false);
        console.log('\n✅ Base de datos lista para usar!');
        break;

      case '2':
        const confirmAlter = await askQuestion(
          '\n⚠️  Esto modificará las tablas existentes. ¿Continuar? (si/no): '
        );
        if (confirmAlter.toLowerCase() === 'si') {
          console.log('\n📝 Sincronizando base de datos (modo alter)...\n');
          await syncDatabase(false, true);
          console.log('\n✅ Base de datos actualizada!');
        } else {
          console.log('\n❌ Operación cancelada');
        }
        break;

      case '3':
        const confirmForce = await askQuestion(
          '\n⚠️  ADVERTENCIA: Esto ELIMINARÁ todas las tablas y datos. ¿Estás seguro? (si/no): '
        );
        if (confirmForce.toLowerCase() === 'si') {
          const doubleConfirm = await askQuestion(
            '⚠️  ¿REALMENTE estás seguro? Escribe "CONFIRMAR" para continuar: '
          );
          if (doubleConfirm === 'CONFIRMAR') {
            console.log('\n🔥 Eliminando y recreando tablas...\n');
            await syncDatabase(true, false);
            console.log('\n✅ Base de datos recreada con datos iniciales!');
            console.log('\n🔑 Credenciales de acceso:');
            console.log('   Email: admin@erp.com');
            console.log('   Password: Admin123!');
          } else {
            console.log('\n❌ Operación cancelada');
          }
        } else {
          console.log('\n❌ Operación cancelada');
        }
        break;

      case '4':
        console.log('\n✅ Conexión verificada correctamente');
        break;

      default:
        console.log('\n❌ Opción no válida');
    }
  } catch (error) {
    console.error('\n❌ Error durante la inicialización:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await closeDatabase();
    console.log('\n========================================');
    console.log('👋 Proceso completado');
    console.log('========================================\n');
    process.exit(0);
  }
};

// Ejecutar
initDatabase();