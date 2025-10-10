// backend/src/scripts/testPOS.js
// Script para probar el módulo POS

import { connectDatabase, closeDatabase } from '../config/database.js';
import { Product, Customer } from '../models/index.js';

const testPOS = async () => {
  console.log('\n========================================');
  console.log('🧪 PRUEBA DEL MÓDULO POS');
  console.log('========================================\n');

  try {
    await connectDatabase();

    // Verificar productos disponibles
    console.log('📦 Verificando productos disponibles...');
    const products = await Product.findAll({
      where: { activo: true },
      attributes: ['id', 'codigo', 'nombre', 'precio_venta', 'stock_actual'],
      limit: 5,
    });

    console.log(`   ✅ Productos encontrados: ${products.length}`);
    products.forEach(p => {
      console.log(`      - ${p.codigo}: ${p.nombre} | RD$ ${p.precio_venta} | Stock: ${p.stock_actual}`);
    });

    // Verificar cliente Consumidor Final
    console.log('\n👤 Verificando cliente Consumidor Final...');
    const consumidor = await Customer.findOne({
      where: { codigo_cliente: 'CLI-00000' },
    });

    if (consumidor) {
      console.log(`   ✅ Cliente encontrado: ${consumidor.nombre_comercial} (ID: ${consumidor.id})`);
    } else {
      console.log('   ⚠️  Cliente Consumidor Final no encontrado');
      console.log('   💡 Ejecuta: npm run seed:consumidor');
    }

    // Verificar otros clientes
    const otrosClientes = await Customer.findAll({
      where: { activo: true },
      attributes: ['id', 'codigo_cliente', 'nombre_comercial'],
      limit: 3,
    });

    console.log(`\n👥 Otros clientes disponibles: ${otrosClientes.length}`);
    otrosClientes.forEach(c => {
      console.log(`      - ${c.codigo_cliente}: ${c.nombre_comercial}`);
    });

    console.log('\n✅ Verificaciones completadas');
    console.log('\n💡 Endpoints disponibles:');
    console.log('   GET  /api/v1/pos/products/search?query=martillo');
    console.log('   GET  /api/v1/pos/products/barcode/PROD-001');
    console.log('   POST /api/v1/pos/sale');
    console.log('   GET  /api/v1/pos/daily-sales');
    console.log('   POST /api/v1/pos/close-register');

    console.log('\n📝 Ejemplo de venta POS:');
    console.log(JSON.stringify({
      cliente_id: consumidor?.id || 1,
      items: [
        {
          producto_id: products[0]?.id || 1,
          cantidad: 2,
          precio_unitario: products[0]?.precio_venta || 100,
          descuento: 0
        }
      ],
      tipo_ncf: 'B02',
      tipo_venta: 'contado',
      metodo_pago: 'efectivo',
      monto_recibido: 500,
      descuento: 0,
      notas: 'Venta de prueba POS'
    }, null, 2));

  } catch (error) {
    console.error('\n❌ Error durante la prueba:', error.message);
    console.error(error.stack);
  } finally {
    await closeDatabase();
    console.log('\n========================================');
    console.log('👋 Prueba finalizada');
    console.log('========================================\n');
    process.exit(0);
  }
};

// Ejecutar
testPOS();