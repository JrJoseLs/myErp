import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { sequelize } from '../models/index.js';

dotenv.config();

/**
 * Determinar la URL de conexión
 * Si existe MYSQL_URL (entorno Railway), se usa esa.
 * Si no, usa MYSQL_PUBLIC_URL (para entorno local).
 */
const dbUrl = process.env.MYSQL_URL || process.env.MYSQL_PUBLIC_URL;

/**
 * Instancia de Sequelize (por si no viene de models/index)
 */
const connection = sequelize || new Sequelize(dbUrl, {
	dialect: 'mysql',
	logging: false,
});

/**
 * Conectar a la base de datos
 */
export const connectDatabase = async () => {
	try {
		console.log('🚀 Intentando conectar a MySQL...');
		console.log('🔹 HOST:', process.env.MYSQL_HOST || process.env.MYSQLHOST);
		console.log('🔹 DB:', process.env.MYSQL_DATABASE);
		console.log('🔹 USER:', process.env.MYSQL_USER || process.env.MYSQLUSER);

		await connection.authenticate();
		console.log('✅ Conexión a MySQL establecida correctamente');
		return true;
	} catch (error) {
		console.error('❌ Error al conectar a la base de datos:');
		console.error('📄 Mensaje:', error.message);
		console.error('📜 Stack:', error.stack);
		console.error('⚙️ Variables actuales:', {
			MYSQL_URL: process.env.MYSQL_URL,
			MYSQL_PUBLIC_URL: process.env.MYSQL_PUBLIC_URL,
			MYSQL_HOST: process.env.MYSQL_HOST || process.env.MYSQLHOST,
			MYSQL_USER: process.env.MYSQL_USER || process.env.MYSQLUSER,
			MYSQL_DATABASE: process.env.MYSQL_DATABASE,
		});
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
			await connection.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });
		} catch (error) {
			console.warn('Advertencia: No se pudo deshabilitar FOREIGN_KEY_CHECKS.', error.message);
		}
	}

	try {
		if (force) {
			console.log('⚠️ ADVERTENCIA: Eliminando y recreando todas las tablas...');
			await connection.sync({ force: true });
			console.log('✅ Base de datos sincronizada (force)');
			await seedInitialData();
		} else if (alter) {
			console.log('📝 Modificando estructura de tablas existentes...');
			await connection.sync({ alter: true });
			console.log('✅ Base de datos sincronizada (alter)');
		} else {
			await connection.sync();
			console.log('✅ Base de datos sincronizada');
		}
		return true;
	} catch (error) {
		console.error('❌ Error al sincronizar la base de datos:', error.message);
		throw error;
	} finally {
		if (force) {
			console.log('✅ Habilitando verificación de FKs...');
			try {
				await connection.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });
			} catch (error) {
				console.error('Error al re-habilitar FOREIGN_KEY_CHECKS:', error.message);
			}
		}
	}
};

/**
 * Insertar datos iniciales en la base de datos
 */
export const seedInitialData = async () => {
	try {
		const { Role, User, NCF, Category } = await import('../models/index.js');

		console.log('📦 Insertando datos iniciales...');

		const roles = await Role.bulkCreate([
			{ nombre: 'Administrador', descripcion: 'Acceso total al sistema', permisos: { all: true } },
			{ nombre: 'Gerente', descripcion: 'Acceso a dashboard y reportes ejecutivos', permisos: { dashboard: true, reportes: true, finanzas: true } },
			{ nombre: 'Vendedor', descripcion: 'Acceso a ventas, facturación y CRM', permisos: { ventas: true, crm: true, clientes: true } },
			{ nombre: 'Inventario', descripcion: 'Gestión de productos e inventario', permisos: { inventario: true, productos: true, compras: true } },
			{ nombre: 'Contabilidad', descripcion: 'Gestión financiera y contable', permisos: { finanzas: true, contabilidad: true, reportes: true } },
			{ nombre: 'RRHH', descripcion: 'Gestión de recursos humanos', permisos: { empleados: true, nomina: true } },
		]);

		console.log('✅ Roles creados');

		await User.create({
			nombre_completo: 'Administrador Sistema',
			email: 'admin@erp.com',
			password: 'Admin123!',
			rol_id: roles[0].id,
			activo: true,
		});
		console.log('✅ Usuario administrador creado (admin@erp.com / Admin123!)');

		const fechaVencimiento = new Date();
		fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + 1);

		await NCF.bulkCreate([
			{ tipo_ncf: 'B01', descripcion_tipo: 'Crédito Fiscal', secuencia_desde: 'B0100000001', secuencia_hasta: 'B0100001000', secuencia_actual: 'B0100000001', fecha_vencimiento: fechaVencimiento, activo: true },
			{ tipo_ncf: 'B02', descripcion_tipo: 'Consumo', secuencia_desde: 'B0200000001', secuencia_hasta: 'B0200005000', secuencia_actual: 'B0200000001', fecha_vencimiento: fechaVencimiento, activo: true },
			{ tipo_ncf: 'B14', descripcion_tipo: 'Regímenes Especiales', secuencia_desde: 'B1400000001', secuencia_hasta: 'B1400000500', secuencia_actual: 'B1400000001', fecha_vencimiento: fechaVencimiento, activo: true },
		]);
		console.log('✅ Rangos de NCF creados');

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
	} catch (error) {
		console.error('❌ Error al insertar datos iniciales:', error.message);
		throw error;
	}
};

/**
 * Cerrar conexión a la base de datos
 */
export const closeDatabase = async () => {
	try {
		await connection.close();
		console.log('✅ Conexión a base de datos cerrada');
	} catch (error) {
		console.error('❌ Error al cerrar conexión:', error.message);
	}
};

/**
 * Verificar estado de la base de datos
 */
export const checkDatabaseHealth = async () => {
	try {
		await connection.authenticate();
		return {
			status: 'healthy',
			database: process.env.MYSQL_DATABASE,
			host: process.env.MYSQL_HOST || process.env.MYSQLHOST,
			dialect: connection.getDialect(),
		};
	} catch (error) {
		return {
			status: 'unhealthy',
			error: error.message,
		};
	}
};

export default {
	connectDatabase,
	syncDatabase,
	seedInitialData,
	closeDatabase,
	checkDatabaseHealth,
};
