import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define(
    'Report607',
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
      rnc_cedula: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      tipo_identificacion: {
        type: DataTypes.ENUM('1', '2', '3'),
        allowNull: false,
      },
      ncf: {
        type: DataTypes.STRING(19),
        allowNull: false,
      },
      ncf_modificado: {
        type: DataTypes.STRING(19),
      },
      tipo_ingreso: {
        type: DataTypes.STRING(2),
        allowNull: false,
      },
      fecha_comprobante: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      fecha_retencion: {
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
      isr_retenido: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      impuesto_selectivo: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      otros_impuestos: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      propina_legal: {
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
      tableName: 'reporte_607',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    }
  );
};