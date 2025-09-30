import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define(
    'Budget',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      año: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      mes: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      departamento: {
        type: DataTypes.STRING(100),
      },
      categoria: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      monto_presupuestado: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      monto_ejecutado: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      porcentaje_ejecutado: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
      },
      notas: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: 'presupuestos',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
};