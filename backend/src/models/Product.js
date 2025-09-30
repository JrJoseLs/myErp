import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Product = sequelize.define(
    'Product',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      codigo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      nombre: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.TEXT,
      },
      categoria_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      unidad_medida: {
        type: DataTypes.ENUM('UND', 'KG', 'LB', 'LT', 'GAL', 'MT', 'CAJA', 'PAQUETE'),
        defaultValue: 'UND',
      },
      precio_compra: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      precio_venta: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      precio_mayorista: {
        type: DataTypes.DECIMAL(12, 2),
      },
      itbis_aplicable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      tasa_itbis: {
        // DECIMAL(5,2) para manejar tasas como 18.00, 0.00, o diferenciadas (8.00)
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 18.00,
      },
      stock_actual: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      stock_minimo: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      stock_maximo: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      costo_promedio: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      imagen_url: {
        type: DataTypes.STRING(255),
      },
    },
    {
      tableName: 'productos',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        { fields: ['codigo'], name: 'idx_codigo' },
        { fields: ['nombre'], name: 'idx_nombre' },
      ],
    }
  );

  return Product;
};