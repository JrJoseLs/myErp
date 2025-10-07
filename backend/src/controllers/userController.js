import { User, Role } from '../models/index.js';
import { Op } from 'sequelize';
//import bcrypt from 'bcrypt';
import bcrypt from 'bcryptjs';


const USER_EXCLUDE_FIELDS = ['password', 'created_at', 'updated_at'];

// @desc    Obtener todos los usuarios
// @route   GET /api/v1/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: USER_EXCLUDE_FIELDS },
      include: [
        {
          model: Role,
          as: 'role', // Asegúrate de que este alias coincida con tu models/index.js
          attributes: ['id', 'nombre', 'descripcion'],
        },
      ],
      order: [['id', 'ASC']],
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la lista de usuarios', error: error.message });
  }
};

// @desc    Obtener usuario por ID
// @route   GET /api/v1/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: USER_EXCLUDE_FIELDS },
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'nombre', 'descripcion'],
        },
      ],
    });

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el usuario', error: error.message });
  }
};

// @desc    Crear un nuevo usuario
// @route   POST /api/v1/users
// @access  Private/Admin
export const createUser = async (req, res) => {
  const { nombre_completo, email, password, telefono, cedula, rol_id } = req.body;

  try {
    // 1. Validar que el email y cédula no existan
    const userExists = await User.findOne({ 
      where: { 
        [Op.or]: [{ email }, { cedula }] 
      }
    });

    if (userExists) {
      return res.status(400).json({ 
        message: 'Ya existe un usuario con ese email o cédula.',
        error_field: userExists.email === email ? 'email' : 'cedula'
      });
    }

    // 2. Crear el usuario (el hook de Sequelize encripta el password)
    const newUser = await User.create({
      nombre_completo,
      email,
      password,
      telefono,
      cedula,
      rol_id,
      activo: true, // Por defecto activo
    });

    // 3. Incluir el rol para la respuesta
    const userWithRole = await User.findByPk(newUser.id, {
      attributes: { exclude: USER_EXCLUDE_FIELDS },
      include: [{ model: Role, as: 'role', attributes: ['id', 'nombre'] }],
    });

    res.status(201).json({ 
      message: 'Usuario creado exitosamente',
      user: userWithRole
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el usuario', error: error.message });
  }
};

// @desc    Actualizar un usuario
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  const { nombre_completo, email, password, telefono, cedula, rol_id, activo } = req.body;

  try {
    const user = await User.findByPk(req.params.id, { 
        attributes: { exclude: USER_EXCLUDE_FIELDS } 
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // 1. Validar duplicados de email/cédula (excluyendo el usuario actual)
    const duplicateCheck = await User.findOne({
      where: {
        [Op.and]: [
          { id: { [Op.not]: req.params.id } }, // Excluir el ID actual
          { [Op.or]: [{ email }, { cedula }] },
        ],
      },
    });

    if (duplicateCheck) {
      return res.status(400).json({ message: 'Otro usuario ya tiene ese email o cédula.' });
    }
    
    // 2. Actualizar los campos
    user.nombre_completo = nombre_completo || user.nombre_completo;
    user.email = email || user.email;
    user.telefono = telefono !== undefined ? telefono : user.telefono;
    user.cedula = cedula !== undefined ? cedula : user.cedula;
    user.rol_id = rol_id || user.rol_id;
    user.activo = activo !== undefined ? activo : user.activo;

    // Si se envía una contraseña, el hook de Sequelize la hasheará
    if (password) {
      user.password = password;
    }

    await user.save();

    // 3. Obtener el usuario actualizado con el rol para la respuesta
    const userUpdated = await User.findByPk(req.params.id, {
        attributes: { exclude: USER_EXCLUDE_FIELDS },
        include: [{ model: Role, as: 'role', attributes: ['id', 'nombre'] }],
    });

    res.json({
        message: 'Usuario actualizado exitosamente',
        user: userUpdated
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el usuario', error: error.message });
  }
};

// @desc    Alternar estado activo/inactivo (Soft-delete/Deactivate)
// @route   PATCH /api/v1/users/toggle-status/:id
// @access  Private/Admin
export const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        // No permitir desactivar al usuario que está realizando la solicitud (por seguridad)
        if (req.user.id == req.params.id) {
            return res.status(400).json({ message: 'No puedes cambiar tu propio estado activo desde esta ruta' });
        }

        // Alternar el estado activo
        user.activo = !user.activo;
        await user.save();

        res.json({ 
            message: `Usuario ${user.activo ? 'activado' : 'desactivado'} correctamente`,
            id: user.id,
            activo: user.activo
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al alternar el estado del usuario', error: error.message });
    }
};