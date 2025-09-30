import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define(
    'AccountsPayable',
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
      proveedor_id: {
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
        type: DataTypes.ENUM('vigente', 'vencida', 'pagada'),
        defaultValue: 'vigente',
      },
    },
    {
      tableName: 'cuentas_por_pagar',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
};