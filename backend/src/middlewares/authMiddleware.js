// backend/src/middlewares/authMiddleware.js

import jwt from 'jsonwebtoken';
import { User, Role } from '../models/index.js';
import { appConfig } from '../config/config.js';

/**
 * Middleware de protección de rutas con JWT
 * Verifica el token y adjunta el usuario completo (con rol) a req.user
 */
export const protect = async (req, res, next) => {
  let token;

  // 1. Verificar si existe el token en los headers (Bearer Token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extraer el token
      token = req.headers.authorization.split(' ')[1];

      // 2. Verificar el token y obtener el payload
      const decoded = jwt.verify(token, appConfig.jwt.secret);

      // 3. Buscar el usuario en la DB con su rol y adjuntarlo al request
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: Role,
            as: 'role',
            attributes: ['id', 'nombre', 'permisos'],
          },
        ],
      });

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no encontrado. Token inválido.',
        });
      }

      // 4. Verificar que el usuario esté activo
      if (!req.user.activo) {
        return res.status(401).json({
          success: false,
          message: 'Su cuenta está inactiva. Contacte al administrador.',
        });
      }

      // 5. Continuar con la siguiente función (ruta protegida)
      next();
    } catch (error) {
      console.error('Error en autenticación:', error.message);

      // Manejo específico de errores de JWT
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expirado. Por favor, inicie sesión nuevamente.',
        });
      }

      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Token inválido. Autenticación fallida.',
        });
      }

      // Error genérico
      res.status(401).json({
        success: false,
        message: 'No autorizado, el token ha fallado',
      });
    }
  } else {
    // No hay token en los headers
    return res.status(401).json({
      success: false,
      message: 'No autorizado, no se proporcionó token de acceso',
    });

    
  }
};




// backend/src/middlewares/auditMiddleware.js

// import { DataTypes } from 'sequelize';
// import { sequelize } from '../models/index.js';


/**
 * Modelo de AuditLog (se crea dinámicamente)
 */
// let AuditLog;

// const initAuditLog = () => {
//   if (!AuditLog) {
//     AuditLog = sequelize.define(
//       'AuditLog',
//       {
//         id: {
//           type: DataTypes.INTEGER,
//           primaryKey: true,
//           autoIncrement: true,
//         },
//         usuario_id: {
//           type: DataTypes.INTEGER,
//           allowNull: true,
//         },
//         usuario_nombre: {
//           type: DataTypes.STRING(150),
//         },
//         accion: {
//           type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'),
//           allowNull: false,
//         },
//         tabla: {
//           type: DataTypes.STRING(100),
//           allowNull: false,
//         },
//         registro_id: {
//           type: DataTypes.INTEGER,
//           allowNull: true,
//         },
//         datos_anteriores: {
//           type: DataTypes.JSON,
//         },
//         datos_nuevos: {
//           type: DataTypes.JSON,
//         },
//         ip_address: {
//           type: DataTypes.STRING(45),
//         },
//         user_agent: {
//           type: DataTypes.TEXT,
//         },
//         descripcion: {
//           type: DataTypes.TEXT,
//         },
//       },
//       {
//         tableName: 'audit_logs',
//         timestamps: true,
//         createdAt: 'created_at',
//         updatedAt: false,
//       }
//     );
//   }
//   return AuditLog;
// };

// /**
//  * Registrar un evento de auditoría
//  * @param {Object} data - Datos del evento
//  */
// export const logAuditEvent = async (data) => {
//   try {
//     const AuditLogModel = initAuditLog();
    
//     await AuditLogModel.create({
//       usuario_id: data.usuario_id || null,
//       usuario_nombre: data.usuario_nombre || 'Sistema',
//       accion: data.accion,
//       tabla: data.tabla,
//       registro_id: data.registro_id || null,
//       datos_anteriores: data.datos_anteriores || null,
//       datos_nuevos: data.datos_nuevos || null,
//       ip_address: data.ip_address || null,
//       user_agent: data.user_agent || null,
//       descripcion: data.descripcion || null,
//     });
//   } catch (error) {
//     console.error('Error al registrar auditoría:', error.message);
//     // No lanzar error para no interrumpir la operación principal
//   }
// };

// /**
//  * Middleware para auditar automáticamente las operaciones
//  */
// export const auditMiddleware = (accion, tabla) => {
//   return async (req, res, next) => {
//     // Guardar el método original de res.json
//     const originalJson = res.json.bind(res);

//     // Sobrescribir res.json para capturar la respuesta
//     res.json = function (data) {
//       // Solo auditar si la operación fue exitosa
//       if (data.success !== false && res.statusCode < 400) {
//         const auditData = {
//           usuario_id: req.user?.id,
//           usuario_nombre: req.user?.nombre_completo || 'Desconocido',
//           accion,
//           tabla,
//           registro_id: data.id || data.user?.id || data.product?.id || null,
//           datos_nuevos: data,
//           ip_address: req.ip || req.connection.remoteAddress,
//           user_agent: req.headers['user-agent'],
//           descripcion: `${accion} en ${tabla}`,
//         };

//         logAuditEvent(auditData).catch(err => {
//           console.error('Error en auditoría:', err);
//         });
//       }

//       // Llamar al método original
//       return originalJson(data);
//     };

//     next();
//   };
// };

// /**
//  * Obtener historial de auditoría de un registro específico
//  * @param {string} tabla - Nombre de la tabla
//  * @param {number} registro_id - ID del registro
//  * @returns {Promise<Array>}
//  */
// export const getAuditHistory = async (tabla, registro_id) => {
//   try {
//     const AuditLogModel = initAuditLog();
    
//     const history = await AuditLogModel.findAll({
//       where: {
//         tabla,
//         registro_id,
//       },
//       order: [['created_at', 'DESC']],
//       limit: 50,
//     });

//     return history;
//   } catch (error) {
//     console.error('Error al obtener historial de auditoría:', error);
//     return [];
//   }
// };

// /**
//  * Obtener actividad reciente del sistema
//  * @param {number} limit - Cantidad de registros
//  * @returns {Promise<Array>}
//  */
// export const getRecentActivity = async (limit = 20) => {
//   try {
//     const AuditLogModel = initAuditLog();
    
//     const activity = await AuditLogModel.findAll({
//       order: [['created_at', 'DESC']],
//       limit,
//     });

//     return activity;
//   } catch (error) {
//     console.error('Error al obtener actividad reciente:', error);
//     return [];
//   }
// };

// /**
//  * Sincronizar tabla de auditoría (llamar en initDatabase)
//  */
// export const syncAuditLog = async () => {
//   try {
//     const AuditLogModel = initAuditLog();
//     await AuditLogModel.sync({ alter: true });
//     console.log('✅ Tabla de auditoría sincronizada');
//   } catch (error) {
//     console.error('❌ Error al sincronizar tabla de auditoría:', error.message);
//   }
// };

// export default {
//   logAuditEvent,
//   auditMiddleware,
//   getAuditHistory,
//   getRecentActivity,
//   syncAuditLog,
// };