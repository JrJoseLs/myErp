import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define(
    'Payroll',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      empleado_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      periodo: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      fecha_inicio: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      fecha_fin: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      salario_base: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      bonificaciones: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      horas_extra: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      deducciones: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      seguro_social: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      afp: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      isr: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      salario_neto: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      estado: {
        type: DataTypes.ENUM('borrador', 'aprobada', 'pagada'),
        defaultValue: 'borrador',
      },
      fecha_pago: {
        type: DataTypes.DATEONLY,
      },
    },
    {
      tableName: 'nomina',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    }
  );
};