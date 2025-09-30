import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define(
    'Employee',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      usuario_id: {
        type: DataTypes.INTEGER,
        unique: true,
      },
      codigo_empleado: {
        type: DataTypes.STRING(20),
        unique: true,
        allowNull: false,
      },
      nombre_completo: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      cedula: {
        type: DataTypes.STRING(20),
        unique: true,
        allowNull: false,
      },
      fecha_nacimiento: {
        type: DataTypes.DATEONLY,
      },
      direccion: {
        type: DataTypes.TEXT,
      },
      telefono: {
        type: DataTypes.STRING(20),
      },
      email: {
        type: DataTypes.STRING(100),
      },
      cargo: {
        type: DataTypes.STRING(100),
      },
      departamento: {
        type: DataTypes.STRING(100),
      },
      salario: {
        type: DataTypes.DECIMAL(12, 2),
      },
      fecha_ingreso: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      estado: {
        type: DataTypes.ENUM('activo', 'inactivo', 'suspendido'),
        defaultValue: 'activo',
      },
    },
    {
      tableName: 'empleados',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
};