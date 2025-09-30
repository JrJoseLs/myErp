// backend/src/middlewares/errorHandler.js

/**
 * Middleware para manejar rutas no encontradas (404)
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Middleware para manejo de errores general
 */
export const errorHandler = (err, req, res, next) => {
  // Determinar el código de estado
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Manejo específico de errores de Sequelize
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    const errors = err.errors.map((e) => e.message);
    return res.status(statusCode).json({
      success: false,
      message: 'Error de validación en la base de datos',
      errors,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    const field = err.errors[0]?.path || 'campo';
    return res.status(statusCode).json({
      success: false,
      message: `Ya existe un registro con ese ${field}`,
      field,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    return res.status(statusCode).json({
      success: false,
      message: 'Error de integridad referencial: verifique las relaciones',
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
  }

  if (err.name === 'SequelizeDatabaseError') {
    statusCode = 500;
    return res.status(statusCode).json({
      success: false,
      message: 'Error en la base de datos',
      error: process.env.NODE_ENV === 'production' ? 'Error interno del servidor' : err.message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
  }

  // Error de JWT (token inválido o expirado)
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    return res.status(statusCode).json({
      success: false,
      message: 'Token inválido',
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    return res.status(statusCode).json({
      success: false,
      message: 'Token expirado',
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
  }

  // Error genérico
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};