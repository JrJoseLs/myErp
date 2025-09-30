import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define(
    'InventoryMovement',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      producto_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tipo_movimiento: {
        type: DataTypes.ENUM('entrada', 'salida', 'ajuste'),
        allowNull: false,
      },
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      costo_unitario: {
        type: DataTypes.DECIMAL(12, 2),
      },
      documento_referencia: {
        type: DataTypes.STRING(50),
      },
      motivo: {
        type: DataTypes.STRING(200),
      },
      usuario_id: {
        type: DataTypes.INTEGER,
      },
      fecha_movimiento: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'movimientos_inventario',
      timestamps: false,
    }
  );
};