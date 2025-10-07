// backend/src/scripts/seedConsumidorFinal.js
// Script para asegurar que existe el cliente "Consumidor Final"

import { connectDatabase, closeDatabase } from '../config/database.js';
import { Customer } from '../models/index.js';

const seedConsumidorFinal = async () => {
  console.log('\n========================================');
  console.log('🔧 VERIFICANDO CLIENTE CONSUMIDOR FINAL');
  console.log('========================================\n');

  try {
    await connectDatabase();

    // Buscar si ya existe
    let consumidor = await Customer.findOne({
      where: { codigo_cliente: 'CLI-00000' },
    });

    if (consumidor) {
      console.log('✅ Cliente Consumidor Final ya existe:');
      console.log(`   - ID: ${consumidor.id}`);
      console.log(`   - Código: ${consumidor.codigo_cliente}`);
      console.log(`   - Nombre: ${consumidor.nombre_comercial}`);
    } else {
      console.log('⚠️  Cliente Consumidor Final no encontrado, creando...');
      
      consumidor = await Customer.create({
        codigo_cliente: 'CLI-00000',
        tipo_identificacion: 'CEDULA',
        numero_identificacion: '00000000000',
        nombre_comercial: 'CONSUMIDOR FINAL',
        razon_social: 'CONSUMIDOR FINAL',
        email: null,
        telefono: null,
        celular: null,
        direccion: 'N/A',
        ciudad: 'N/A',
        provincia: 'N/A',
        limite_credito: 0,
        balance_actual: 0,
        dias_credito: 0,
        tipo_cliente: 'contado',
        activo: true,
        notas: 'Cliente genérico para ventas POS sin identificación específica',
      });

      console.log('✅ Cliente Consumidor Final creado exitosamente:');
      console.log(`   - ID: ${consumidor.id}`);
      console.log(`   - Código: ${consumidor.codigo_cliente}`);
      console.log(`   - Nombre: ${consumidor.nombre_comercial}`);
    }

    console.log('\n🎉 Verificación completada correctamente');
  } catch (error) {
    console.error('\n❌ Error durante la verificación:', error.message);
    throw error;
  } finally {
    await closeDatabase();
    console.log('\n========================================');
    console.log('👋 Proceso completado');
    console.log('========================================\n');
    process.exit(0);
  }
};

// Ejecutar
seedConsumidorFinal();