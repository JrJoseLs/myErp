/**
 * Script para generar todos los archivos de modelos Sequelize
 * Ejecutar con: node generateModels.js
 * Colocar este archivo en la raíz del proyecto backend
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modelsDir = path.join(__dirname, 'src', 'models');

// Asegurar que existe el directorio
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

const models = {
  'Role.js': `import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Role = sequelize.define(
    'Role',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      descripcion: {
        type: DataTypes.TEXT,
      },
      permisos: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: 'roles',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Role;
};`,

  'User.js': `import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';

export default (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre_completo: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      telefono: {
        type: DataTypes.STRING(20),
      },
      cedula: {
        type: DataTypes.STRING(20),
        unique: true,
      },
      rol_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      ultimo_acceso: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: 'usuarios',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed('password')) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
      },
    }
  );

  User.prototype.verifyPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

  return User;
};`,

  'Employee.js': `import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define(
    'Employee',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      usuario_id: {
        type: DataTypes.INTEGER,
        unique: true,
      },
      codigo_empleado: {
        type: DataTypes.STRING(20),
        unique: true,
        allowNull: false,
      },
      nombre_completo: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      cedula: {
        type: DataTypes.STRING(20),
        unique: true,
        allowNull: false,
      },
      fecha_nacimiento: {
        type: DataTypes.DATEONLY,
      },
      direccion: {
        type: DataTypes.TEXT,
      },
      telefono: {
        type: DataTypes.STRING(20),
      },
      email: {
        type: DataTypes.STRING(100),
      },
      cargo: {
        type: DataTypes.STRING(100),
      },
      departamento: {
        type: DataTypes.STRING(100),
      },
      salario: {
        type: DataTypes.DECIMAL(12, 2),
      },
      fecha_ingreso: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      estado: {
        type: DataTypes.ENUM('activo', 'inactivo', 'suspendido'),
        defaultValue: 'activo',
      },
    },
    {
      tableName: 'empleados',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
};`,

  'Customer.js': `import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define(
    'Customer',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      codigo_cliente: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      tipo_identificacion: {
        type: DataTypes.ENUM('RNC', 'CEDULA', 'PASAPORTE'),
        allowNull: false,
      },
      numero_identificacion: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      nombre_comercial: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      razon_social: {
        type: DataTypes.STRING(200),
      },
      email: {
        type: DataTypes.STRING(100),
        validate: { isEmail: true },
      },
      telefono: {
        type: DataTypes.STRING(20),
      },
      celular: {
        type: DataTypes.STRING(20),
      },
      direccion: {
        type: DataTypes.TEXT,
      },
      ciudad: {
        type: DataTypes.STRING(100),
      },
      provincia: {
        type: DataTypes.STRING(100),
      },
      limite_credito: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      balance_actual: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      dias_credito: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      tipo_cliente: {
        type: DataTypes.ENUM('contado', 'credito', 'ambos'),
        defaultValue: 'contado',
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      notas: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: 'clientes',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
};`,

  'Supplier.js': `import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define(
    'Supplier',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      codigo_proveedor: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      tipo_identificacion: {
        type: DataTypes.ENUM('RNC', 'CEDULA'),
        allowNull: false,
      },
      numero_identificacion: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      nombre_comercial: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      razon_social: {
        type: DataTypes.STRING(200),
      },
      email: {
        type: DataTypes.STRING(100),
      },
      telefono: {
        type: DataTypes.STRING(20),
      },
      celular: {
        type: DataTypes.STRING(20),
      },
      direccion: {
        type: DataTypes.TEXT,
      },
      ciudad: {
        type: DataTypes.STRING(100),
      },
      provincia: {
        type: DataTypes.STRING(100),
      },
      contacto_nombre: {
        type: DataTypes.STRING(150),
      },
      contacto_telefono: {
        type: DataTypes.STRING(20),
      },
      dias_pago: {
        type: DataTypes.INTEGER,
        defaultValue: 30,
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      notas: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: 'proveedores',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
};`,

  'Category.js': `import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define(
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
};`,

  'Product.js': `import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define(
    'Product',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      codigo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      nombre: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.TEXT,
      },
      categoria_id: {
        type: DataTypes.INTEGER,
      },
      unidad_medida: {
        type: DataTypes.ENUM('UND', 'KG', 'LB', 'LT', 'GAL', 'MT', 'CAJA', 'PAQUETE'),
        defaultValue: 'UND',
      },
      precio_compra: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      precio_venta: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      precio_mayorista: {
        type: DataTypes.DECIMAL(12, 2),
      },
      itbis_aplicable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      tasa_itbis: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 18.0,
      },
      stock_actual: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      stock_minimo: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      stock_maximo: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      costo_promedio: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      imagen_url: {
        type: DataTypes.STRING(255),
      },
    },
    {
      tableName: 'productos',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
};`,

  'InventoryMovement.js': `import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define(
    'InventoryMovement',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      producto_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tipo_movimiento: {
        type: DataTypes.ENUM('entrada', 'salida', 'ajuste'),
        allowNull: false,
      },
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      costo_unitario: {
        type: DataTypes.DECIMAL(12, 2),
      },
      documento_referencia: {
        type: DataTypes.STRING(50),
      },
      motivo: {
        type: DataTypes.STRING(200),
      },
      usuario_id: {
        type: DataTypes.INTEGER,
      },
      fecha_movimiento: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'movimientos_inventario',
      timestamps: false,
    }
  );
};`,

  'NCF.js': `import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define(
    'NCF',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      tipo_ncf: {
        type: DataTypes.ENUM('B01', 'B02', 'B14', 'B15', 'B16'),
        allowNull: false,
      },
      descripcion_tipo: {
        type: DataTypes.STRING(100),
      },
      secuencia_desde: {
        type: DataTypes.STRING(11),
        allowNull: false,
      },
      secuencia_hasta: {
        type: DataTypes.STRING(11),
        allowNull: false,
      },
      secuencia_actual: {
        type: DataTypes.STRING(11),
        allowNull: false,
      },
      fecha_vencimiento: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      agotado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'ncf',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
};`,

  'Invoice.js': `import { DataTypes } from 'sequelize';

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
};`,

  'InvoiceDetail.js': `import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define(
    'InvoiceDetail',
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
      producto_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      precio_unitario: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      descuento: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      itbis_porcentaje: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 18.0,
      },
      itbis_monto: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      subtotal: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      total: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
    },
    {
      tableName: 'detalle_facturas',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    }
  );
};`,

  'Payment.js': `import { DataTypes } from 'sequelize';

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
};`,

  'Purchase.js': `import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define(
    'Purchase',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      numero_compra: {
        type: DataTypes.STRING(20),
        unique: true,
        allowNull: false,
      },
      proveedor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ncf_proveedor: {
        type: DataTypes.STRING(19),
      },
      fecha_compra: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      fecha_vencimiento: {
        type: DataTypes.DATEONLY,
      },
      tipo_compra: {
        type: DataTypes.ENUM('contado', 'credito'),
        defaultValue: 'contado',
      },
      subtotal: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
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
      estado: {
        type: DataTypes.ENUM('pendiente', 'recibida', 'cancelada'),
        defaultValue: 'pendiente',
      },
      notas: {
        type: DataTypes.TEXT,
      },
      usuario_id: {
        type: DataTypes.INTEGER,
      },
    },
    {
      tableName: 'compras',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
};`,

  'PurchaseDetail.js': `import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define(
    'PurchaseDetail',
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
      producto_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      precio_unitario: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      itbis_porcentaje: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 18.0,
      },
      itbis_monto: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      subtotal: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      total: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
    },
    {
      tableName: 'detalle_compras',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    }
  );
};`,

  'AccountsReceivable.js': `import { DataTypes } from 'sequelize';

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
};`,

  'AccountsPayable.js': `import { DataTypes } from 'sequelize';

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
};`,

  'Payroll.js': `import { DataTypes } from 'sequelize';

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
};`,

  'Asset.js': `import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define(
    'Asset',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      codigo: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false,
      },
      nombre: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.TEXT,
      },
      categoria: {
        type: DataTypes.ENUM('edificio', 'vehiculo', 'maquinaria', 'equipo', 'mueble', 'tecnologia'),
        allowNull: false,
      },
      valor_compra: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      fecha_compra: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      vida_util_años: {
        type: DataTypes.INTEGER,
      },
      depreciacion_anual: {
        type: DataTypes.DECIMAL(12, 2),
      },
      depreciacion_acumulada: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      valor_residual: {
        type: DataTypes.DECIMAL(12, 2),
      },
      estado: {
        type: DataTypes.ENUM('activo', 'en_reparacion', 'dado_de_baja'),
        defaultValue: 'activo',
      },
      ubicacion: {
        type: DataTypes.STRING(200),
      },
      responsable_id: {
        type: DataTypes.INTEGER,
      },
    },
    {
      tableName: 'activos',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
};`,

  'Budget.js': `import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define(
    'Budget',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      año: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      mes: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      departamento: {
        type: DataTypes.STRING(100),
      },
      categoria: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      monto_presupuestado: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      monto_ejecutado: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      porcentaje_ejecutado: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
      },
      notas: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: 'presupuestos',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
};`,

  'Subscription.js': `import { DataTypes } from 'sequelize';

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
};`,

  'Report606.js': `import { DataTypes } from 'sequelize';

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
};`,

  'Report607.js': `import { DataTypes } from 'sequelize';

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
};`,

  'Report608.js': `import { DataTypes } from 'sequelize';

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
};`,
};

// Crear todos los archivos
console.log('🚀 Generando archivos de modelos...\n');

Object.keys(models).forEach((filename) => {
  const filepath = path.join(modelsDir, filename);
  fs.writeFileSync(filepath, models[filename], 'utf8');
  console.log(`✅ ${filename} creado`);
});

console.log('\n✨ ¡Todos los modelos han sido generados exitosamente!');
console.log('\n📝 Archivos creados en: backend/src/models/');
console.log('\n🔄 Ahora ejecuta: npm run db:init');