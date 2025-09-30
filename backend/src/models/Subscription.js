import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define(
    'Subscription',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      empresa_nombre: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      empresa_rnc: {
        type: DataTypes.STRING(20),
        unique: true,
        allowNull: false,
      },
      plan: {
        type: DataTypes.ENUM('basico', 'profesional', 'empresarial'),
        allowNull: false,
      },
      usuarios_permitidos: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      fecha_inicio: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      fecha_vencimiento: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      estado: {
        type: DataTypes.ENUM('activa', 'vencida', 'suspendida', 'cancelada'),
        defaultValue: 'activa',
      },
      monto_mensual: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
    },
    {
      tableName: 'suscripciones',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
};