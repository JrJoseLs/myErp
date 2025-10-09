import { sequelize } from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Conectar a la base de datos
 */
export const connectDatabase = async () => {
	try {
		console.log('🚀 Intentando conectar a MySQL...');
		console.log('🔹 HOST:', process.env.MYSQLHOST);
		console.log('🔹 DB:', process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE);
		console.log('🔹 USER:', process.env.MYSQLUSER);

		await sequelize.authenticate();
		console.log('✅ Conexión a MySQL establecida correctamente');
		return true;
	} catch (error) {
		console.error('❌ Error al conectar a la base de datos:');
		console.error('📄 Mensaje:', error.message);
		console.error('📜 Stack:', error.stack);
		console.error('⚙️ Variables actuales:', {
			MYSQL_URL: process.env.MYSQL_URL,
			MYSQLHOST: process.env.MYSQLHOST,
			MYSQLUSER: process.env.MYSQLUSER,
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
	// --- INICIO DE LA CORRECCIÓN ---
	if (force) {
		console.log('⚠️ Deshabilitando verificación de FKs para modo FORCE...');
		try {
			// Comando para MySQL/MariaDB: permite eliminar tablas con FKs
			await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });
		} catch (error) {
			console.warn('Advertencia: No se pudo deshabilitar FOREIGN_KEY_CHECKS.', error.message);
		}
	}
	// --- FIN DE LA CORRECCIÓN ---

	try {
		if (force) {
			console.log('⚠️  ADVERTENCIA: Eliminando y recreando todas las tablas...');
			await sequelize.sync({ force: true });
			console.log('✅ Base de datos sincronizada (force)');

			// Insertar datos iniciales
			await seedInitialData();
		} else if (alter) {
			console.log('📝 Modificando estructura de tablas existentes...');
			await sequelize.sync({ alter: true });
			console.log('✅ Base de datos sincronizada (alter)');
		} else {
			await sequelize.sync();
			console.log('✅ Base de datos sincronizada');
		}
		return true;
	} catch (error) {
		console.error('❌ Error al sincronizar la base de datos:', error.message);
		throw error;
	} finally {
		// --- INICIO DEL CÓDIGO FINAL ---
		if (force) {
			console.log('✅ Habilitando verificación de FKs...');
			try {
				// Comando para MySQL/MariaDB: restablece la verificación
				await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });
			} catch (error) {
				console.error('Error al re-habilitar FOREIGN_KEY_CHECKS:', error.message);
			}
		}
		// --- FIN DEL CÓDIGO FINAL ---
	}
};

/**
 * Insertar datos iniciales en la base de datos
 */
export const seedInitialData = async () => {
	try {
		const { Role, User, NCF, Category } = await import('../models/index.js');

		console.log('📦 Insertando datos iniciales...');

		// Crear roles
		const roles = await Role.bulkCreate([
			{
				nombre: 'Administrador',
				descripcion: 'Acceso total al sistema',
				permisos: { all: true },
			},
			{
				nombre: 'Gerente',
				descripcion: 'Acceso a dashboard y reportes ejecutivos',
				permisos: { dashboard: true, reportes: true, finanzas: true },
			},
			{
				nombre: 'Vendedor',
				descripcion: 'Acceso a ventas, facturación y CRM',
				permisos: { ventas: true, crm: true, clientes: true },
			},
			{
				nombre: 'Inventario',
				descripcion: 'Gestión de productos e inventario',
				permisos: { inventario: true, productos: true, compras: true },
			},
			{
				nombre: 'Contabilidad',
				descripcion: 'Gestión financiera y contable',
				permisos: { finanzas: true, contabilidad: true, reportes: true },
			},
			{
				nombre: 'RRHH',
				descripcion: 'Gestión de recursos humanos',
				permisos: { empleados: true, nomina: true },
			},
		]);

		console.log('✅ Roles creados');

		// Crear usuario administrador
		// Password: Admin123!
		await User.create({
			nombre_completo: 'Administrador Sistema',
			email: 'admin@erp.com',
			password: 'Admin123!',
			rol_id: roles[0].id,
			activo: true,
		});

		console.log('✅ Usuario administrador creado (admin@erp.com / Admin123!)');

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
				activo: true,
			},
			{
				tipo_ncf: 'B02',
				descripcion_tipo: 'Consumo',
				secuencia_desde: 'B0200000001',
				secuencia_hasta: 'B0200005000',
				secuencia_actual: 'B0200000001',
				fecha_vencimiento: fechaVencimiento,
				activo: true,
			},
			{
				tipo_ncf: 'B14',
				descripcion_tipo: 'Regímenes Especiales',
				secuencia_desde: 'B1400000001',
				secuencia_hasta: 'B1400000500',
				secuencia_actual: 'B1400000001',
				fecha_vencimiento: fechaVencimiento,
				activo: true,
			},
		]);

		console.log('✅ Rangos de NCF creados');

		// Crear categorías de productos
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
		await sequelize.close();
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
		await sequelize.authenticate();
		return {
			status: 'healthy',
			database: process.env.DB_NAME,
			host: process.env.DB_HOST,
			dialect: sequelize.getDialect(),
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