// backend/src/controllers/authController.js

import jwt from 'jsonwebtoken';
import { User, Role } from '../models/index.js';
import { appConfig } from '../config/config.js';

// Función helper para generar el JWT
const generateToken = (id) => {
  return jwt.sign({ id }, appConfig.jwt.secret, {
    expiresIn: appConfig.jwt.expiresIn, // e.g., '7d'
  });
};

// @desc 	Registrar un nuevo usuario
// @route 	POST /api/auth/register
// @access 	Public (solo para setup o restringido por un middleware posterior)
export const registerUser = async (req, res) => {
  const { nombre_completo, email, password, telefono, cedula, rol_id } = req.body;

  try {
    // Nota: El scope 'withPassword' aquí no es necesario y puede ser confuso.
    // Usar findOne() sin scope es suficiente, ya que el password no se devuelve por defecto.
    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      return res.status(400).json({ message: 'El usuario ya existe con ese correo electrónico' });
    }

    // El hook beforeCreate encripta la contraseña
    const newUser = await User.create({
      nombre_completo,
      email,
      password,
      telefono,
      cedula,
      rol_id,
      activo: true,
    });

    if (newUser) {
      res.status(201).json({
        id: newUser.id,
        nombre_completo: newUser.nombre_completo,
        email: newUser.email,
        rol_id: newUser.rol_id,
        token: generateToken(newUser.id),
      });
    } else {
      res.status(400).json({ message: 'Datos de usuario inválidos' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar el usuario', error: error.message });
  }
};

// @desc 	Autenticar un usuario y obtener token
// @route 	POST /api/auth/login
// @access 	Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar usuario incluyendo la contraseña (con scope: withPassword)
    const user = await User.scope('withPassword').findOne({
      where: { email },
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['nombre', 'permisos'],
        },
      ],
    });

    // Verificar existencia, contraseña (con bcrypt) y estado activo
    // >>>>>>>>> CORRECCIÓN APLICADA AQUÍ <<<<<<<<<<
    if (user && (await user.verifyPassword(password))) { 
      if (!user.activo) {
        return res.status(401).json({ message: 'Su cuenta está inactiva. Contacte al administrador.' });
      }

      // Actualizar último acceso y enviar respuesta con JWT
      await user.update({ ultimo_acceso: new Date() });
      
      res.json({
        id: user.id,
        nombre_completo: user.nombre_completo,
        email: user.email,
        rol: user.role.nombre,
        permisos: user.role.permisos,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Credenciales inválidas (email o contraseña incorrectos)' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el inicio de sesión', error: error.message });
  }
};

// @desc 	Obtener datos del usuario logueado (perfil)
// @route 	GET /api/auth/profile
// @access 	Private (requiere token)
export const getUserProfile = async (req, res) => {
  try {
    // req.user viene del authMiddleware.js
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['nombre', 'permisos'],
        },
      ],
    });

    if (user) {
      res.json({
        id: user.id,
        nombre_completo: user.nombre_completo,
        email: user.email,
        telefono: user.telefono,
        cedula: user.cedula,
        activo: user.activo,
        ultimo_acceso: user.ultimo_acceso,
        created_at: user.created_at,
        rol: user.role.nombre,
        permisos: user.role.permisos,
      });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener perfil', error: error.message });
  }

};