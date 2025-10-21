// ============================================
// ARCHIVO 1: backend/src/models/Report606.js
// ============================================
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define(
    'Report606',
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
      rnc_cedula: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      tipo_identificacion: {
        type: DataTypes.ENUM('1', '2', '3'),
        allowNull: false,
      },
      tipo_bienes_servicios: {
        type: DataTypes.STRING(2),
        allowNull: false,
      },
      ncf: {
        type: DataTypes.STRING(19),
        allowNull: false,
      },
      ncf_modificado: {
        type: DataTypes.STRING(19),
      },
      fecha_comprobante: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      fecha_pago: {
        type: DataTypes.DATEONLY,
      },
      monto_facturado: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      itbis_facturado: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      itbis_retenido: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      itbis_sujeto_proporcionalidad: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      itbis_llevado_costo: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      itbis_compensacion: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      mes_reporte: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      año_reporte: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      enviado_dgii: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      fecha_envio: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: 'reporte_606',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    }
  );
};
