// backend/src/config/database.js
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import path from 'path';
import fs from 'fs';

dotenv.config();

// Configuración de Sequelize
export const sequelize = new Sequelize(
  process.env.MYSQLDATABASE || process.env.DB_NAME,
  process.env.MYSQLUSER || process.env.DB_USER,
  process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
  {
    host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
    port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false, // cambiar a console.log para debug
  }
);

/**
 * Conectar a la base de datos
 */
export const connectDatabase = async () => {
  try {
    console.log('🚀 Intentando conectar a MySQL...');
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL establecida correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error.message);
    process.exit(1);
  }
};

/**
 * Sincronizar modelos con la base de datos
 * @param {boolean} force - Si true, elimina y recrea tablas
 * @param {boolean} alter - Si true, ajusta tablas existentes
 */
export const syncDatabase = async (force = false, alter = false) => {
  try {
    await sequelize.sync({ force, alter });
    console.log('✅ Base de datos sincronizada');
  } catch (error) {
    console.error('❌ Error al sincronizar la base de datos:', error.message);
    throw error;
  }
};

/**
 * Insertar datos iniciales
 */
export const seedInitialData = async () => {
  try {
    const models = await import('../models/index.js');
    const { Role, User, NCF, Category } = models;

    console.log('📦 Insertando datos iniciales...');
    const roles = await Role.bulkCreate([
      { nombre: 'Administrador', descripcion: 'Acceso total', permisos: { all: true } },
      { nombre: 'Gerente', descripcion: 'Dashboard y reportes', permisos: { dashboard: true, reportes: true, finanzas: true } },
      { nombre: 'Vendedor', descripcion: 'Ventas y CRM', permisos: { ventas: true, crm: true, clientes: true } },
      { nombre: 'Inventario', descripcion: 'Productos e inventario', permisos: { inventario: true, productos: true, compras: true } },
      { nombre: 'Contabilidad', descripcion: 'Finanzas y contabilidad', permisos: { finanzas: true, contabilidad: true, reportes: true } },
      { nombre: 'RRHH', descripcion: 'Recursos Humanos', permisos: { empleados: true, nomina: true } },
    ]);

    await User.create({
      nombre_completo: 'Administrador Sistema',
      email: 'admin@erp.com',
      password: 'Admin123!',
      rol_id: roles[0].id,
      activo: true,
    });

    const fechaVencimiento = new Date();
    fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + 1);

    await NCF.bulkCreate([
      { tipo_ncf: 'B01', descripcion_tipo: 'Crédito Fiscal', secuencia_desde: 'B0100000001', secuencia_hasta: 'B0100001000', secuencia_actual: 'B0100000001', fecha_vencimiento: fechaVencimiento, activo: true },
      { tipo_ncf: 'B02', descripcion_tipo: 'Consumo', secuencia_desde: 'B0200000001', secuencia_hasta: 'B0200005000', secuencia_actual: 'B0200000001', fecha_vencimiento: fechaVencimiento, activo: true },
      { tipo_ncf: 'B14', descripcion_tipo: 'Regímenes Especiales', secuencia_desde: 'B1400000001', secuencia_hasta: 'B1400000500', secuencia_actual: 'B1400000001', fecha_vencimiento: fechaVencimiento, activo: true },
    ]);

    await Category.bulkCreate([
      { nombre: 'Ferretería', descripcion: 'Productos de ferretería' },
      { nombre: 'Herramientas', descripcion: 'Herramientas manuales y eléctricas' },
      { nombre: 'Construcción', descripcion: 'Materiales de construcción' },
      { nombre: 'Electricidad', descripcion: 'Productos eléctricos' },
      { nombre: 'Plomería', descripcion: 'Productos de plomería' },
      { nombre: 'Pintura', descripcion: 'Pinturas y accesorios' },
      { nombre: 'Cerrajería', descripcion: 'Cerraduras y candados' },
    ]);

    console.log('🎉 Datos iniciales insertados correctamente');
  } catch (error) {
    console.error('❌ Error al insertar datos iniciales:', error.message);
    throw error;
  }
};

/**
 * Cerrar conexión
 */
export const closeDatabase = async () => {
  try {
    await sequelize.close();
    console.log('✅ Conexión cerrada');
  } catch (error) {
    console.error('❌ Error cerrando conexión:', error.message);
  }
};

export default {
  sequelize,
  connectDatabase,
  syncDatabase,
  seedInitialData,
  closeDatabase,
};
