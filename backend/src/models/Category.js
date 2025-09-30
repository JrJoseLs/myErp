import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Category = sequelize.define(
    'Category',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      descripcion: {
        type: DataTypes.TEXT,
      },
      categoria_padre_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: 'categorias',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Category;
};