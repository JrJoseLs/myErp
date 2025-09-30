import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define(
    'AccountsReceivable',
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
      cliente_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      monto_original: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      monto_pagado: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      balance_pendiente: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      fecha_vencimiento: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      dias_vencido: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      estado: {
        type: DataTypes.ENUM('vigente', 'vencida', 'cobrada'),
        defaultValue: 'vigente',
      },
    },
    {
      tableName: 'cuentas_por_cobrar',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
};