// backend/src/middlewares/roleMiddleware.js

/**
 * Middleware para restringir el acceso a roles específicos
 */
const restrictTo = (...roleNames) => {
  return (req, res, next) => {
    // 1. Obtener el nombre del rol del usuario autenticado (adjuntado por authMiddleware)
    const userRole = req.user && req.user.role && req.user.role.nombre;
    
    if (!userRole) {
      return res.status(403).json({ 
        message: 'Acceso denegado. No se pudo verificar el rol del usuario.' 
      });
    }

    // 2. Verificar si el rol del usuario está incluido en los roles permitidos
    if (!roleNames.includes(userRole)) {
      return res.status(403).json({ 
        message: `Acceso denegado. Se requiere uno de los siguientes roles: ${roleNames.join(', ')}` 
      });
    }
    
    // Si el rol está permitido, continuar
    next();
  };
};

/**
 * Middleware específico para administradores
 */
const admin = restrictTo('Administrador');

/**
 * Middleware que permite múltiples roles
 */
const allowRoles = (...roleNames) => {
  return (req, res, next) => {
    const userRole = req.user && req.user.role && req.user.role.nombre;
    
    if (!userRole || !roleNames.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Rol insuficiente.',
      });
    }
    
    next();
  };
};

// ✅ EXPORT DEFAULT
export default restrictTo;