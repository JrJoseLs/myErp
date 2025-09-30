// backend/src/models/User.js

import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';


export default (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre_completo: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      telefono: {
        type: DataTypes.STRING(20),
      },
      cedula: {
        type: DataTypes.STRING(20),
        unique: true,
      },
      rol_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      ultimo_acceso: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: 'usuarios',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      
      // SOLUCIÓN AL ERROR: Definición de Scopes para Sequelize
      scopes: {
        // 1. defaultScope: Excluye el password en todas las consultas (seguridad)
        defaultScope: {
          attributes: { exclude: ['password'] },
        },
        // 2. withPassword: Incluye el password solo cuando se llama explícitamente (para el login)
        withPassword: {
          attributes: { include: ['password'] },
        },
      },

      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed('password')) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
      },
    }
  );

  User.prototype.verifyPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

  return User;
};