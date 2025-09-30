// Manejo de rutas no encontradas (404)
export const notFound = (req, res, next) => {
  const error = new Error(`No Encontrado - ${req.originalUrl}`);
  res.status(404);
  next(error); // Pasa el error al siguiente middleware (errorHandler)
};

// Manejo de errores general
export const errorHandler = (err, req, res, next) => {
  // A veces Express devuelve 200 aunque haya error, se corrige
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  res.json({
    message: err.message,
    // Solo mostrar el stacktrace en modo desarrollo
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};