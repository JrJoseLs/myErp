import { connectDatabase, closeDatabase } from '../config/database.js';
import {
  Customer,
  Supplier,
  Product,
  Category,
} from '../models/index.js';

const seedTestData = async () => {
  console.log('\n========================================');
  console.log('🌱 POBLANDO DATOS DE PRUEBA');
  console.log('========================================\n');

  try {
    await connectDatabase();

    // Obtener categorías
    const categories = await Category.findAll();
    const ferreteriaCategory = categories.find(c => c.nombre === 'Ferretería');
    const herramientasCategory = categories.find(c => c.nombre === 'Herramientas');

    // Crear clientes de prueba
    console.log('👥 Creando clientes...');
    await Customer.bulkCreate([
      {
        codigo_cliente: 'CLI-001',
        tipo_identificacion: 'CEDULA',
        numero_identificacion: '00112345678',
        nombre_comercial: 'Juan Pérez',
        razon_social: 'Juan Pérez',
        email: 'juan.perez@email.com',
        telefono: '809-555-1234',
        direccion: 'Calle Principal #123',
        ciudad: 'Santo Domingo',
        provincia: 'Distrito Nacional',
        tipo_cliente: 'contado',
        activo: true,
      },
      {
        codigo_cliente: 'CLI-002',
        tipo_identificacion: 'RNC',
        numero_identificacion: '131234567',
        nombre_comercial: 'Constructora ABC',
        razon_social: 'Constructora ABC SRL',
        email: 'info@constructoraabc.com',
        telefono: '809-555-5678',
        direccion: 'Av. Winston Churchill #456',
        ciudad: 'Santo Domingo',
        provincia: 'Distrito Nacional',
        limite_credito: 100000,
        dias_credito: 30,
        tipo_cliente: 'credito',
        activo: true,
      },
      {
        codigo_cliente: 'CLI-003',
        tipo_identificacion: 'CEDULA',
        numero_identificacion: '40298765432',
        nombre_comercial: 'María Rodríguez',
        razon_social: 'María Rodríguez',
        email: 'maria.rodriguez@email.com',
        telefono: '829-555-9999',
        direccion: 'Calle Segunda #789',
        ciudad: 'Santiago',
        provincia: 'Santiago',
        tipo_cliente: 'ambos',
        activo: true,
      },
    ]);
    console.log('✅ Clientes creados');

    // Crear proveedores de prueba
    console.log('🏭 Creando proveedores...');
    await Supplier.bulkCreate([
      {
        codigo_proveedor: 'PROV-001',
        tipo_identificacion: 'RNC',
        numero_identificacion: '101234567',
        nombre_comercial: 'Ferretería Nacional',
        razon_social: 'Ferretería Nacional SRL',
        email: 'ventas@ferreterianacional.com',
        telefono: '809-555-1111',
        direccion: 'Zona Industrial Herrera',
        ciudad: 'Santo Domingo',
        provincia: 'Distrito Nacional',
        contacto_nombre: 'Roberto Gómez',
        contacto_telefono: '809-555-1112',
        dias_pago: 30,
        activo: true,
      },
      {
        codigo_proveedor: 'PROV-002',
        tipo_identificacion: 'RNC',
        numero_identificacion: '102345678',
        nombre_comercial: 'Distribuidora Herramientas RD',
        razon_social: 'Distribuidora Herramientas RD SAS',
        email: 'info@herramientasrd.com',
        telefono: '809-555-2222',
        direccion: 'Av. Duarte Km 10',
        ciudad: 'Santo Domingo Norte',
        provincia: 'Santo Domingo',
        contacto_nombre: 'Ana García',
        contacto_telefono: '809-555-2223',
        dias_pago: 15,
        activo: true,
      },
    ]);
    console.log('✅ Proveedores creados');

    // Crear productos de prueba
    console.log('📦 Creando productos...');
    await Product.bulkCreate([
      {
        codigo: 'PROD-001',
        nombre: 'Martillo 16oz',
        descripcion: 'Martillo de acero con mango de madera',
        categoria_id: herramientasCategory?.id,
        unidad_medida: 'UND',
        precio_compra: 250.0,
        precio_venta: 350.0,
        precio_mayorista: 320.0,
        itbis_aplicable: true,
        tasa_itbis: 18.0,
        stock_actual: 50,
        stock_minimo: 10,
        stock_maximo: 100,
        activo: true,
      },
      {
        codigo: 'PROD-002',
        nombre: 'Destornillador Plano 6"',
        descripcion: 'Destornillador plano profesional',
        categoria_id: herramientasCategory?.id,
        unidad_medida: 'UND',
        precio_compra: 120.0,
        precio_venta: 180.0,
        itbis_aplicable: true,
        tasa_itbis: 18.0,
        stock_actual: 75,
        stock_minimo: 15,
        stock_maximo: 150,
        activo: true,
      },
      {
        codigo: 'PROD-003',
        nombre: 'Clavos 3" (Libra)',
        descripcion: 'Clavos de acero galvanizado',
        categoria_id: ferreteriaCategory?.id,
        unidad_medida: 'LB',
        precio_compra: 45.0,
        precio_venta: 65.0,
        itbis_aplicable: true,
        tasa_itbis: 18.0,
        stock_actual: 200,
        stock_minimo: 50,
        stock_maximo: 500,
        activo: true,
      },
      {
        codigo: 'PROD-004',
        nombre: 'Tornillos 1/4" x 2" (Caja 100u)',
        descripcion: 'Tornillos de acero inoxidable',
        categoria_id: ferreteriaCategory?.id,
        unidad_medida: 'CAJA',
        precio_compra: 85.0,
        precio_venta: 125.0,
        itbis_aplicable: true,
        tasa_itbis: 18.0,
        stock_actual: 40,
        stock_minimo: 10,
        stock_maximo: 80,
        activo: true,
      },
      {
        codigo: 'PROD-005',
        nombre: 'Taladro Eléctrico 1/2"',
        descripcion: 'Taladro profesional 800W',
        categoria_id: herramientasCategory?.id,
        unidad_medida: 'UND',
        precio_compra: 2500.0,
        precio_venta: 3500.0,
        precio_mayorista: 3200.0,
        itbis_aplicable: true,
        tasa_itbis: 18.0,
        stock_actual: 15,
        stock_minimo: 5,
        stock_maximo: 30,
        activo: true,
      },
    ]);
    console.log('✅ Productos creados');

    console.log('\n✅ Datos de prueba insertados correctamente');
    console.log('\n📊 Resumen:');
    console.log('   - 3 Clientes');
    console.log('   - 2 Proveedores');
    console.log('   - 5 Productos');
  } catch (error) {
    console.error('\n❌ Error al poblar datos:', error.message);
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
seedTestData();