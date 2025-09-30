import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define(
    'NCF',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      tipo_ncf: {
        type: DataTypes.ENUM('B01', 'B02', 'B14', 'B15', 'B16'),
        allowNull: false,
      },
      descripcion_tipo: {
        type: DataTypes.STRING(100),
      },
      secuencia_desde: {
        type: DataTypes.STRING(11),
        allowNull: false,
      },
      secuencia_hasta: {
        type: DataTypes.STRING(11),
        allowNull: false,
      },
      secuencia_actual: {
        type: DataTypes.STRING(11),
        allowNull: false,
      },
      fecha_vencimiento: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      agotado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'ncf',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
};