import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define(
    'Inventory',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      empresa_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      producto_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: 'unique_producto_empresa', // Combinación única
      },
      stock_actual: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      stock_minimo: {
        type: DataTypes.INTEGER,
        defaultValue: 10,
        allowNull: false,
      },
      stock_maximo: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      costo_unitario: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      precio_venta: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },
      unidad_medida: {
        type: DataTypes.STRING(20),
        defaultValue: 'UND',
      },
      ubicacion: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      lote: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      fecha_vencimiento: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      fecha_actualizacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW,
      },
    },
    {
      tableName: 'inventario',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
};