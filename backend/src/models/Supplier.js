import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define(
    'Supplier',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      codigo_proveedor: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      tipo_identificacion: {
        type: DataTypes.ENUM('RNC', 'CEDULA'),
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
      contacto_nombre: {
        type: DataTypes.STRING(150),
      },
      contacto_telefono: {
        type: DataTypes.STRING(20),
      },
      dias_pago: {
        type: DataTypes.INTEGER,
        defaultValue: 30,
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
      tableName: 'proveedores',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
};