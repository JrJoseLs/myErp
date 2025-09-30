import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Role = sequelize.define(
    'Role',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      descripcion: {
        type: DataTypes.TEXT,
      },
      permisos: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: 'roles',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Role;
};