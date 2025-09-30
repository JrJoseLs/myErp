// backend/src/middlewares/validationMiddleware.js

/**
 * Middleware de validación de datos para las rutas del API
 */

// ============================================
// VALIDACIONES DE USUARIO
// ============================================

export const validateUserCreate = (req, res, next) => {
  const { nombre_completo, email, password, cedula, rol_id } = req.body;
  const errors = [];

  // Validar nombre completo
  if (!nombre_completo || nombre_completo.trim().length < 3) {
    errors.push('El nombre completo debe tener al menos 3 caracteres');
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('El email no es válido');
  }

  // Validar contraseña
  if (!password || password.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  }

  // Validar cédula (opcional pero si existe debe ser válida)
  if (cedula) {
    const cedulaRegex = /^\d{11}$/;
    if (!cedulaRegex.test(cedula.replace(/-/g, ''))) {
      errors.push('La cédula debe tener 11 dígitos');
    }
  }

  // Validar rol_id
  if (!rol_id || isNaN(rol_id)) {
    errors.push('Debe especificar un rol válido');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Errores de validación', errors });
  }

  next();
};

export const validateUserUpdate = (req, res, next) => {
  const { nombre_completo, email, password, cedula } = req.body;
  const errors = [];

  // Validar nombre completo (si se envía)
  if (nombre_completo && nombre_completo.trim().length < 3) {
    errors.push('El nombre completo debe tener al menos 3 caracteres');
  }

  // Validar email (si se envía)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    errors.push('El email no es válido');
  }

  // Validar contraseña (si se envía)
  if (password && password.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  }

  // Validar cédula (si se envía)
  if (cedula) {
    const cedulaRegex = /^\d{11}$/;
    if (!cedulaRegex.test(cedula.replace(/-/g, ''))) {
      errors.push('La cédula debe tener 11 dígitos');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Errores de validación', errors });
  }

  next();
};

// ============================================
// VALIDACIONES DE CATEGORÍA
// ============================================

export const validateCategory = (req, res, next) => {
  const { nombre } = req.body;
  const errors = [];

  // Validar nombre
  if (!nombre || nombre.trim().length < 2) {
    errors.push('El nombre de la categoría debe tener al menos 2 caracteres');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Errores de validación', errors });
  }

  next();
};

// ============================================
// VALIDACIONES DE PRODUCTO
// ============================================

export const validateProductCreate = (req, res, next) => {
  const { codigo, nombre, categoria_id, precio_compra, precio_venta, tasa_itbis } = req.body;
  const errors = [];

  // Validar código
  if (!codigo || codigo.trim().length < 2) {
    errors.push('El código del producto es obligatorio (mínimo 2 caracteres)');
  }

  // Validar nombre
  if (!nombre || nombre.trim().length < 3) {
    errors.push('El nombre del producto debe tener al menos 3 caracteres');
  }

  // Validar categoría
  if (!categoria_id || isNaN(categoria_id)) {
    errors.push('Debe seleccionar una categoría válida');
  }

  // Validar precio de compra
  if (precio_compra !== undefined && (isNaN(precio_compra) || parseFloat(precio_compra) < 0)) {
    errors.push('El precio de compra debe ser un número válido mayor o igual a 0');
  }

  // Validar precio de venta
  if (precio_venta !== undefined && (isNaN(precio_venta) || parseFloat(precio_venta) < 0)) {
    errors.push('El precio de venta debe ser un número válido mayor o igual a 0');
  }

  // Validar que precio de venta sea mayor que precio de compra
  if (precio_compra && precio_venta && parseFloat(precio_venta) < parseFloat(precio_compra)) {
    errors.push('El precio de venta no puede ser menor que el precio de compra');
  }

  // Validar tasa ITBIS
  if (tasa_itbis !== undefined) {
    const tasa = parseFloat(tasa_itbis);
    if (isNaN(tasa) || tasa < 0 || tasa > 100) {
      errors.push('La tasa de ITBIS debe estar entre 0 y 100');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Errores de validación', errors });
  }

  next();
};

export const validateProductUpdate = (req, res, next) => {
  const { codigo, nombre, precio_compra, precio_venta, tasa_itbis, stock_minimo, stock_maximo } = req.body;
  const errors = [];

  // Validar código (si se envía)
  if (codigo && codigo.trim().length < 2) {
    errors.push('El código del producto debe tener al menos 2 caracteres');
  }

  // Validar nombre (si se envía)
  if (nombre && nombre.trim().length < 3) {
    errors.push('El nombre del producto debe tener al menos 3 caracteres');
  }

  // Validar precio de compra (si se envía)
  if (precio_compra !== undefined && (isNaN(precio_compra) || parseFloat(precio_compra) < 0)) {
    errors.push('El precio de compra debe ser un número válido mayor o igual a 0');
  }

  // Validar precio de venta (si se envía)
  if (precio_venta !== undefined && (isNaN(precio_venta) || parseFloat(precio_venta) < 0)) {
    errors.push('El precio de venta debe ser un número válido mayor o igual a 0');
  }

  // Validar tasa ITBIS (si se envía)
  if (tasa_itbis !== undefined) {
    const tasa = parseFloat(tasa_itbis);
    if (isNaN(tasa) || tasa < 0 || tasa > 100) {
      errors.push('La tasa de ITBIS debe estar entre 0 y 100');
    }
  }

  // Validar stock mínimo y máximo
  if (stock_minimo !== undefined && stock_maximo !== undefined) {
    if (parseInt(stock_minimo) > parseInt(stock_maximo)) {
      errors.push('El stock mínimo no puede ser mayor que el stock máximo');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Errores de validación', errors });
  }

  next();
};

// ============================================
// VALIDACIÓN DE ID EN PARÁMETROS
// ============================================

export const validateId = (req, res, next) => {
  const { id } = req.params;

  if (!id || isNaN(id) || parseInt(id) < 1) {
    return res.status(400).json({ message: 'ID inválido en la URL' });
  }

  next();
};

// ============================================
// VALIDACIÓN DE MOVIMIENTOS DE INVENTARIO
// ============================================

export const validateInventoryMovement = (req, res, next) => {
  const { producto_id, tipo_movimiento, cantidad, motivo } = req.body;
  const errors = [];

  // Validar producto_id
  if (!producto_id || isNaN(producto_id)) {
    errors.push('Debe especificar un producto válido');
  }

  // Validar tipo de movimiento
  const tiposValidos = ['entrada', 'salida', 'ajuste'];
  if (!tipo_movimiento || !tiposValidos.includes(tipo_movimiento)) {
    errors.push('El tipo de movimiento debe ser: entrada, salida o ajuste');
  }

  // Validar cantidad
  if (!cantidad || isNaN(cantidad) || parseInt(cantidad) <= 0) {
    errors.push('La cantidad debe ser un número mayor a 0');
  }

  // Validar motivo
  if (!motivo || motivo.trim().length < 5) {
    errors.push('Debe especificar un motivo válido (mínimo 5 caracteres)');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Errores de validación', errors });
  }

  next();
};