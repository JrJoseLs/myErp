// ============================================
// backend/src/config/database.js
// Funciones de gestión de base de datos para Railway
// ============================================

import dotenv from 'dotenv';
import { sequelize } from '../models/index.js';

dotenv.config();

/**
 * Conectar a la base de datos
 */
export const connectDatabase = async () => {
  try {
    console.log('🚀 Intentando conectar a MySQL...');
    console.log('🔹 ENV:', process.env.NODE_ENV);
    
    // Mostrar info de conexión sin exponer credenciales completas
    if (process.env.MYSQL_URL) {
      console.log('🔹 Usando MYSQL_URL de Railway');
    } else {
      console.log('🔹 DB:', process.env.MYSQLDATABASE || process.env.DB_NAME);
      console.log('🔹 HOST:', process.env.MYSQLHOST || process.env.DB_HOST);
      console.log('🔹 USER:', process.env.MYSQLUSER || process.env.DB_USER);
    }

    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL establecida correctamente');
    
    // Mostrar información de la base de datos
    const dbName = sequelize.getDatabaseName();
    const dialect = sequelize.getDialect();
    console.log(`📊 Base de datos: ${dbName} (${dialect})`);
    
    return true;
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:');
    console.error('📄 Mensaje:', error.message);
    
    // Si hay más detalles en el error original
    if (error.original) {
      console.error('📄 Error original:', error.original.message);
      console.error('📄 Código:', error.original.code);
      console.error('📄 SQL State:', error.original.sqlState);
    }
    
    // Debug info (sin mostrar passwords completas)
    console.error('⚙️ Variables disponibles:', {
      MYSQL_URL: process.env.MYSQL_URL ? '✓ Configurada' : '✗ No configurada',
      MYSQLHOST: process.env.MYSQLHOST || process.env.DB_HOST || '✗',
      MYSQLUSER: process.env.MYSQLUSER || process.env.DB_USER || '✗',
      MYSQLDATABASE: process.env.MYSQLDATABASE || process.env.DB_NAME || '✗',
      MYSQLPORT: process.env.MYSQLPORT || process.env.DB_PORT || '3306',
      NODE_ENV: process.env.NODE_ENV || 'development'
    });
    
    console.error('\n💡 Verifica que:');
    console.error('   1. La base de datos MySQL esté corriendo en Railway');
    console.error('   2. Las variables MYSQL_* estén configuradas correctamente');
    console.error('   3. El servicio backend tenga acceso a las variables de la BD');
    
    process.exit(1);
  }
};

/**
 * Sincronizar modelos con la base de datos
 * @param {boolean} force - Si es true, elimina y recrea las tablas
 * @param {boolean} alter - Si es true, modifica las tablas existentes
 */
export const syncDatabase = async (force = false, alter = false) => {
  if (force) {
    console.log('⚠️ Deshabilitando verificación de FKs para modo FORCE...');
    try {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });
    } catch (error) {
      console.warn('⚠️ No se pudo deshabilitar FOREIGN_KEY_CHECKS:', error.message);
    }
  }

  try {
    if (force) {
      console.log('⚠️ ADVERTENCIA: Eliminando y recreando todas las tablas...');
      console.log('⏳ Este proceso puede tardar unos momentos...');
      await sequelize.sync({ force: true });
      console.log('✅ Base de datos sincronizada (force)');
      console.log('📦 Insertando datos iniciales...');
      await seedInitialData();
    } else if (alter) {
      console.log('📝 Modificando estructura de tablas existentes...');
      await sequelize.sync({ alter: true });
      console.log('✅ Base de datos sincronizada (alter)');
    } else {
      console.log('🔄 Sincronizando modelos...');
      await sequelize.sync();
      console.log('✅ Base de datos sincronizada');
    }
    return true;
  } catch (error) {
    console.error('❌ Error al sincronizar la base de datos:', error.message);
    if (error.original) {
      console.error('📄 Error original:', error.original.message);
    }
    throw error;
  } finally {
    if (force) {
      console.log('✅ Habilitando verificación de FKs...');
      try {
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });
      } catch (error) {
        console.error('⚠️ Error al re-habilitar FOREIGN_KEY_CHECKS:', error.message);
      }
    }
  }
};

/**
 * Insertar datos iniciales en la base de datos
 */
export const seedInitialData = async () => {
  try {
    // Importar modelos
    const models = await import('../models/index.js');
    const { Role, User, NCF, Category } = models;

    console.log('📦 Insertando datos iniciales...');

    // Crear roles
    const roles = await Role.bulkCreate([
      { 
        nombre: 'Administrador', 
        descripcion: 'Acceso total al sistema', 
        permisos: { all: true } 
      },
      { 
        nombre: 'Gerente', 
        descripcion: 'Acceso a dashboard y reportes ejecutivos', 
        permisos: { dashboard: true, reportes: true, finanzas: true } 
      },
      { 
        nombre: 'Vendedor', 
        descripcion: 'Acceso a ventas, facturación y CRM', 
        permisos: { ventas: true, crm: true, clientes: true } 
      },
      { 
        nombre: 'Inventario', 
        descripcion: 'Gestión de productos e inventario', 
        permisos: { inventario: true, productos: true, compras: true } 
      },
      { 
        nombre: 'Contabilidad', 
        descripcion: 'Gestión financiera y contable', 
        permisos: { finanzas: true, contabilidad: true, reportes: true } 
      },
      { 
        nombre: 'RRHH', 
        descripcion: 'Gestión de recursos humanos', 
        permisos: { empleados: true, nomina: true } 
      },
    ]);
    console.log('✅ Roles creados');

    // Crear usuario administrador
    await User.create({
      nombre_completo: 'Administrador Sistema',
      email: 'admin@erp.com',
      password: 'Admin123!',
      rol_id: roles[0].id,
      activo: true,
    });
    console.log('✅ Usuario administrador creado');
    console.log('   📧 Email: admin@erp.com');
    console.log('   🔑 Password: Admin123!');

    // Crear rangos de NCF
    const fechaVencimiento = new Date();
    fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + 1);

    await NCF.bulkCreate([
      { 
        tipo_ncf: 'B01', 
        descripcion_tipo: 'Crédito Fiscal', 
        secuencia_desde: 'B0100000001', 
        secuencia_hasta: 'B0100001000', 
        secuencia_actual: 'B0100000001', 
        fecha_vencimiento: fechaVencimiento, 
        activo: true 
      },
      { 
        tipo_ncf: 'B02', 
        descripcion_tipo: 'Consumo', 
        secuencia_desde: 'B0200000001', 
        secuencia_hasta: 'B0200005000', 
        secuencia_actual: 'B0200000001', 
        fecha_vencimiento: fechaVencimiento, 
        activo: true 
      },
      { 
        tipo_ncf: 'B14', 
        descripcion_tipo: 'Regímenes Especiales', 
        secuencia_desde: 'B1400000001', 
        secuencia_hasta: 'B1400000500', 
        secuencia_actual: 'B1400000001', 
        fecha_vencimiento: fechaVencimiento, 
        activo: true 
      },
    ]);
    console.log('✅ Rangos de NCF creados');

    // Crear categorías
    await Category.bulkCreate([
      { nombre: 'Ferretería', descripcion: 'Productos de ferretería en general' },
      { nombre: 'Herramientas', descripcion: 'Herramientas manuales y eléctricas' },
      { nombre: 'Construcción', descripcion: 'Materiales de construcción' },
      { nombre: 'Electricidad', descripcion: 'Productos eléctricos' },
      { nombre: 'Plomería', descripcion: 'Productos de plomería' },
      { nombre: 'Pintura', descripcion: 'Pinturas y accesorios' },
      { nombre: 'Cerrajería', descripcion: 'Cerraduras y candados' },
    ]);
    console.log('✅ Categorías creadas');

    console.log('🎉 Datos iniciales insertados correctamente');
    console.log('');
  } catch (error) {
    console.error('❌ Error al insertar datos iniciales:', error.message);
    if (error.original) {
      console.error('📄 Error original:', error.original.message);
    }
    throw error;
  }
};

/**
 * Verificar estado de la base de datos
 */
export const checkDatabaseHealth = async () => {
  try {
    await sequelize.authenticate();
    return {
      status: 'healthy',
      message: 'Conexión a base de datos exitosa',
      database: sequelize.getDatabaseName(),
      dialect: sequelize.getDialect(),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: 'Error al conectar con la base de datos',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Cerrar conexión a la base de datos
 */
export const closeDatabase = async () => {
  try {
    await sequelize.close();
    console.log('✅ Conexión a base de datos cerrada');
  } catch (error) {
    console.error('❌ Error al cerrar conexión:', error.message);
  }
};

/**
 * Obtener información de la conexión actual
 */
export const getConnectionInfo = () => {
  try {
    return {
      database: sequelize.getDatabaseName(),
      dialect: sequelize.getDialect(),
      host: sequelize.config.host,
      port: sequelize.config.port,
    };
  } catch (error) {
    return {
      error: 'No se pudo obtener información de conexión',
      message: error.message
    };
  }
};

export { sequelize };

export default {
  sequelize,
  connectDatabase,
  syncDatabase,
  seedInitialData,
  closeDatabase,
  checkDatabaseHealth,
  getConnectionInfo,
};