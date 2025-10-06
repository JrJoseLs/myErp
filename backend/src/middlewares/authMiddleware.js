// // backend/src/middlewares/authMiddleware.js

// import jwt from 'jsonwebtoken';
// import { User, Role } from '../models/index.js';
// import { appConfig } from '../config/config.js';

// /**
//  * Middleware de protección de rutas con JWT
//  * Verifica el token y adjunta el usuario completo (con rol) a req.user
//  */
// export const protect = async (req, res, next) => {
//   let token;

//   // 1. Verificar si existe el token en los headers (Bearer Token)
//   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//     try {
//       // Extraer el token
//       token = req.headers.authorization.split(' ')[1];

//       // 2. Verificar el token y obtener el payload
//       const decoded = jwt.verify(token, appConfig.jwt.secret);

//       // 3. Buscar el usuario en la DB con su rol y adjuntarlo al request
//       req.user = await User.findByPk(decoded.id, {
//         attributes: { exclude: ['password'] },
//         include: [
//           {
//             model: Role,
//             as: 'role',
//             attributes: ['id', 'nombre', 'permisos'],
//           },
//         ],
//       });

//       if (!req.user) {
//         return res.status(401).json({
//           success: false,
//           message: 'Usuario no encontrado. Token inválido.',
//         });
//       }

//       // 4. Verificar que el usuario esté activo
//       if (!req.user.activo) {
//         return res.status(401).json({
//           success: false,
//           message: 'Su cuenta está inactiva. Contacte al administrador.',
//         });
//       }

//       // 5. Continuar con la siguiente función (ruta protegida)
//       next();
//     } catch (error) {
//       console.error('Error en autenticación:', error.message);

//       // Manejo específico de errores de JWT
//       if (error.name === 'TokenExpiredError') {
//         return res.status(401).json({
//           success: false,
//           message: 'Token expirado. Por favor, inicie sesión nuevamente.',
//         });
//       }

//       if (error.name === 'JsonWebTokenError') {
//         return res.status(401).json({
//           success: false,
//           message: 'Token inválido. Autenticación fallida.',
//         });
//       }

//       // Error genérico
//       res.status(401).json({
//         success: false,
//         message: 'No autorizado, el token ha fallado',
//       });
//     }
//   } else {
//     // No hay token en los headers
//     return res.status(401).json({
//       success: false,
//       message: 'No autorizado, no se proporcionó token de acceso',
//     });
//   }
// };

// backend/src/middlewares/auditMiddleware.js
import { sequelize } from '../models/index.js';

/**
 * Obtener historial de auditoría de un registro específico
 * @param {string} tabla - Nombre de la tabla
 * @param {number} registroId - ID del registro
 * @returns {Promise<Array>}
 */
export const getAuditHistory = async (tabla, registroId) => {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        a.id,
        a.tabla,
        a.ac
        cion,
        a.registro_id,
        a.datos_anteriores,
        a.datos_nuevos,
        a.ip_address,
        a.user_agent,
        a.created_at,
        u.nombre_completo as usuario_nombre
      FROM auditoria a
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.tabla = :tabla 
      AND a.registro_id = :registroId
      ORDER BY a.created_at DESC
      LIMIT 50
    `, {
      replacements: { tabla, registroId },
      type: sequelize.QueryTypes.SELECT,
    });

    return results;
  } catch (error) {
    console.error('Error al obtener historial de auditoría:', error);
    throw error;
  }
};

/**
 * Obtener actividad reciente del sistema
 * @param {number} limit - Cantidad de registros a obtener
 * @returns {Promise<Array>}
 */
export const getRecentActivity = async (limit = 20) => {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        a.id,
        a.tabla,
        a.accion,
        a.registro_id,
        a.created_at,
        u.nombre_completo,
        u.email
      FROM auditoria a
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      ORDER BY a.created_at DESC
      LIMIT :limit
    `, {
      replacements: { limit },
      type: sequelize.QueryTypes.SELECT,
    });

    return results;
  } catch (error) {
    console.error('Error al obtener actividad reciente:', error);
    throw error;
  }
};

/**
 * Middleware para registrar auditoría automática
 * @param {string} tabla - Nombre de la tabla
 * @param {string} accion - Acción realizada (CREATE, UPDATE, DELETE, etc.)
 */
export const logAudit = (tabla, accion) => {
  return async (req, res, next) => {
    const originalSend = res.send;

    res.send = function (data) {
      // Solo registrar si la operación fue exitosa (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const registro_id = req.params.id || req.body.id || null;
        
        if (registro_id && req.user) {
          sequelize.query(`
            INSERT INTO auditoria (
              tabla, 
              accion, 
              registro_id, 
              usuario_id, 
              datos_nuevos, 
              ip_address, 
              user_agent
            )
            VALUES (
              :tabla, 
              :accion, 
              :registro_id, 
              :usuario_id, 
              :datos_nuevos, 
              :ip_address, 
              :user_agent
            )
          `, {
            replacements: {
              tabla,
              accion,
              registro_id,
              usuario_id: req.user.id,
              datos_nuevos: JSON.stringify(req.body),
              ip_address: req.ip || req.connection.remoteAddress,
              user_agent: req.get('user-agent') || 'Unknown',
            },
          }).catch(err => console.error('Error en auditoría:', err));
        }
      }

      originalSend.call(this, data);
    };

    next();
  };
};

export default {
  getAuditHistory,
  getRecentActivity,
  logAudit,
};