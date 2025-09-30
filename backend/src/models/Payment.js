import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define(
    'Payment',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      factura_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      numero_recibo: {
        type: DataTypes.STRING(20),
        unique: true,
        allowNull: false,
      },
      fecha_pago: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      monto_pagado: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      metodo_pago: {
        type: DataTypes.ENUM('efectivo', 'transferencia', 'cheque', 'tarjeta'),
        allowNull: false,
      },
      referencia: {
        type: DataTypes.STRING(100),
      },
      notas: {
        type: DataTypes.TEXT,
      },
      usuario_id: {
        type: DataTypes.INTEGER,
      },
    },
    {
      tableName: 'pagos',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    }
  );
};