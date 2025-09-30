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