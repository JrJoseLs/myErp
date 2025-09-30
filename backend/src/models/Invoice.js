import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define(
    'Invoice',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      numero_factura: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      ncf: {
        type: DataTypes.STRING(19),
        unique: true,
      },
      tipo_ncf: {
        type: DataTypes.ENUM('B01', 'B02', 'B14', 'B15', 'B16'),
      },
      cliente_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      fecha_emision: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      fecha_vencimiento: {
        type: DataTypes.DATEONLY,
      },
      tipo_venta: {
        type: DataTypes.ENUM('contado', 'credito'),
        defaultValue: 'contado',
      },
      moneda: {
        type: DataTypes.ENUM('DOP', 'USD'),
        defaultValue: 'DOP',
      },
      subtotal: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      descuento: {
        type: DataTypes.DECIMAL(12, 2),
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
      monto_pagado: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      balance_pendiente: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      estado: {
        type: DataTypes.ENUM('pendiente', 'pagada', 'parcial', 'vencida', 'anulada'),
        defaultValue: 'pendiente',
      },
      notas: {
        type: DataTypes.TEXT,
      },
      vendedor_id: {
        type: DataTypes.INTEGER,
      },
      anulada: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      motivo_anulacion: {
        type: DataTypes.TEXT,
      },
      fecha_anulacion: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: 'facturas',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
};