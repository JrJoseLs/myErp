import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define(
    'PurchaseDetail',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      compra_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      producto_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      precio_unitario: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      itbis_porcentaje: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 18.0,
      },
      itbis_monto: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      subtotal: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      total: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
    },
    {
      tableName: 'detalle_compras',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    }
  );
};