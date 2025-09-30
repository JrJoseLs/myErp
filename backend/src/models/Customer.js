import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define(
    'Customer',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      codigo_cliente: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      tipo_identificacion: {
        type: DataTypes.ENUM('RNC', 'CEDULA', 'PASAPORTE'),
        allowNull: false,
      },
      numero_identificacion: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      nombre_comercial: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      razon_social: {
        type: DataTypes.STRING(200),
      },
      email: {
        type: DataTypes.STRING(100),
        validate: { isEmail: true },
      },
      telefono: {
        type: DataTypes.STRING(20),
      },
      celular: {
        type: DataTypes.STRING(20),
      },
      direccion: {
        type: DataTypes.TEXT,
      },
      ciudad: {
        type: DataTypes.STRING(100),
      },
      provincia: {
        type: DataTypes.STRING(100),
      },
      limite_credito: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      balance_actual: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      dias_credito: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      tipo_cliente: {
        type: DataTypes.ENUM('contado', 'credito', 'ambos'),
        defaultValue: 'contado',
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      notas: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: 'clientes',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
};