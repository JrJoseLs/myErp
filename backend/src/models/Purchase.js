import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define(
    'Purchase',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      numero_compra: {
        type: DataTypes.STRING(20),
        unique: true,
        allowNull: false,
      },
      proveedor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ncf_proveedor: {
        type: DataTypes.STRING(19),
      },
      fecha_compra: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      fecha_vencimiento: {
        type: DataTypes.DATEONLY,
      },
      tipo_compra: {
        type: DataTypes.ENUM('contado', 'credito'),
        defaultValue: 'contado',
      },
      subtotal: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      itbis: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      total: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      estado: {
        type: DataTypes.ENUM('pendiente', 'recibida', 'cancelada'),
        defaultValue: 'pendiente',
      },
      notas: {
        type: DataTypes.TEXT,
      },
      usuario_id: {
        type: DataTypes.INTEGER,
      },
    },
    {
      tableName: 'compras',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
};