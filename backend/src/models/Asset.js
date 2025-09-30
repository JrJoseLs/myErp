import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define(
    'Asset',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      codigo: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false,
      },
      nombre: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.TEXT,
      },
      categoria: {
        type: DataTypes.ENUM('edificio', 'vehiculo', 'maquinaria', 'equipo', 'mueble', 'tecnologia'),
        allowNull: false,
      },
      valor_compra: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      fecha_compra: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      vida_util_años: {
        type: DataTypes.INTEGER,
      },
      depreciacion_anual: {
        type: DataTypes.DECIMAL(12, 2),
      },
      depreciacion_acumulada: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      valor_residual: {
        type: DataTypes.DECIMAL(12, 2),
      },
      estado: {
        type: DataTypes.ENUM('activo', 'en_reparacion', 'dado_de_baja'),
        defaultValue: 'activo',
      },
      ubicacion: {
        type: DataTypes.STRING(200),
      },
      responsable_id: {
        type: DataTypes.INTEGER,
      },
    },
    {
      tableName: 'activos',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
};