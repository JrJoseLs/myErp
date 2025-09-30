import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { appConfig } from '../config/config.js';

export const protect = async (req, res, next) => {
  let token;

  // 1. Verificar si existe el token en los headers (Bearer Token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extraer el token
      token = req.headers.authorization.split(' ')[1];

      // 2. Verificar el token y obtener el payload
      const decoded = jwt.verify(token, appConfig.jwt.secret);

      // 3. Buscar el usuario en la DB y adjuntarlo al request (req.user)
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] },
      });

      if (!req.user) {
        return res.status(401).json({ message: 'Usuario no encontrado. Token inválido.' });
      }

      // 4. Continuar con la siguiente función (ruta protegida)
      next();
    } catch (error) {
      console.error(error);
      // Error de expiración de token o firma inválida
      res.status(401).json({ message: 'No autorizado, el token ha fallado o expirado' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'No autorizado, no hay token' });
  }
};