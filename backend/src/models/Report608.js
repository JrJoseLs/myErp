import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define(
    'Report608',
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
      ncf: {
        type: DataTypes.STRING(19),
        allowNull: false,
      },
      fecha_comprobante: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      tipo_anulacion: {
        type: DataTypes.ENUM('01', '02', '03', '04'),
        allowNull: false,
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
      tableName: 'reporte_608',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    }
  );
};