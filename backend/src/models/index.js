// ============================================
// backend/src/models/index.js
// Configuración principal de Sequelize - Compatible con Railway
// ============================================

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Importar todos los modelos
import RoleModel from './Role.js';
import UserModel from './User.js';
import EmployeeModel from './Employee.js';
import CustomerModel from './Customer.js';
import SupplierModel from './Supplier.js';
import CategoryModel from './Category.js';
import ProductModel from './Product.js';
import InventoryModel from './Inventory.js'; // ✅ AGREGADO
import InventoryMovementModel from './InventoryMovement.js';
import NCFModel from './NCF.js';
import InvoiceModel from './Invoice.js';
import InvoiceDetailModel from './InvoiceDetail.js';
import PaymentModel from './Payment.js';
import PurchaseModel from './Purchase.js';
import PurchaseDetailModel from './PurchaseDetail.js';
import AccountsReceivableModel from './AccountsReceivable.js';
import AccountsPayableModel from './AccountsPayable.js';
import PayrollModel from './Payroll.js';
import AssetModel from './Asset.js';
import BudgetModel from './Budget.js';
import SubscriptionModel from './Subscription.js';
import Report606Model from './Report606.js';
import Report607Model from './Report607.js';
import Report608Model from './Report608.js';

dotenv.config();

// ============================================
// CONFIGURACIÓN DE SEQUELIZE PARA RAILWAY
// ============================================

const isProduction = process.env.NODE_ENV === 'production';
let sequelize;

// Railway puede usar MYSQL_URL, DATABASE_URL o variables individuales
const connectionString = process.env.MYSQL_URL || process.env.DATABASE_URL;

if (connectionString) {
  // Railway proporciona MYSQL_URL o DATABASE_URL (formato: mysql://user:pass@host:port/db)
  console.log('🔗 Conectando con connection string de Railway');
  sequelize = new Sequelize(connectionString, {
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: isProduction ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {},
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    timezone: '-04:00',
  });
} else if (process.env.MYSQL_HOST || process.env.MYSQLHOST) {
  // Usar variables individuales (Railway también las proporciona)
  console.log('🔗 Conectando con variables individuales de Railway');
  const dbHost = process.env.MYSQL_HOST || process.env.MYSQLHOST || process.env.DB_HOST;
  const dbPort = process.env.MYSQL_PORT || process.env.MYSQLPORT || process.env.DB_PORT || 3306;
  const dbName = process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || process.env.DB_NAME;
  const dbUser = process.env.MYSQL_USER || process.env.MYSQLUSER || process.env.DB_USER;
  const dbPass = process.env.MYSQL_PASSWORD || process.env.MYSQLPASSWORD || process.env.DB_PASSWORD;

  console.log('🔹 HOST:', dbHost);
  console.log('🔹 PORT:', dbPort);
  console.log('🔹 DB:', dbName);
  console.log('🔹 USER:', dbUser);

  sequelize = new Sequelize(dbName, dbUser, dbPass, {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: isProduction ? {
      ssl: {
        require: false
      }
    } : {},
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    timezone: '-04:00',
  });
} else {
  // Fallback para desarrollo local
  console.log('🔗 Conectando con variables individuales (desarrollo local)');
  sequelize = new Sequelize(
    process.env.DB_NAME || process.env.MYSQLDATABASE || 'erp_crm_db',
    process.env.DB_USER || process.env.MYSQLUSER || 'root',
    process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
    {
      host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
      port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
      dialect: 'mysql',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      timezone: '-04:00',
    }
  );
}

// ============================================
// INICIALIZAR MODELOS
// ============================================

const Role = RoleModel(sequelize);
const User = UserModel(sequelize);
const Employee = EmployeeModel(sequelize);
const Customer = CustomerModel(sequelize);
const Supplier = SupplierModel(sequelize);
const Category = CategoryModel(sequelize);
const Product = ProductModel(sequelize);
const Inventory = InventoryModel(sequelize); // ✅ AGREGADO
const InventoryMovement = InventoryMovementModel(sequelize);
const NCF = NCFModel(sequelize);
const Invoice = InvoiceModel(sequelize);
const InvoiceDetail = InvoiceDetailModel(sequelize);
const Payment = PaymentModel(sequelize);
const Purchase = PurchaseModel(sequelize);
const PurchaseDetail = PurchaseDetailModel(sequelize);
const AccountsReceivable = AccountsReceivableModel(sequelize);
const AccountsPayable = AccountsPayableModel(sequelize);
const Payroll = PayrollModel(sequelize);
const Asset = AssetModel(sequelize);
const Budget = BudgetModel(sequelize);
const Subscription = SubscriptionModel(sequelize);
const Report606 = Report606Model(sequelize);
const Report607 = Report607Model(sequelize);
const Report608 = Report608Model(sequelize);

// ============================================
// DEFINIR RELACIONES
// ============================================

// Usuario - Rol (N:1)
User.belongsTo(Role, { foreignKey: 'rol_id', as: 'role' });
Role.hasMany(User, { foreignKey: 'rol_id', as: 'users' });

// Empleado - Usuario (1:1)
Employee.belongsTo(User, { foreignKey: 'usuario_id', as: 'user' });
User.hasOne(Employee, { foreignKey: 'usuario_id', as: 'employee' });

// Producto - Categoría (N:1)
Product.belongsTo(Category, { foreignKey: 'categoria_id', as: 'category' });
Category.hasMany(Product, { foreignKey: 'categoria_id', as: 'products' });

// Categoría - Categoría Padre (Autorreferencia)
Category.belongsTo(Category, { foreignKey: 'categoria_padre_id', as: 'parentCategory' });
Category.hasMany(Category, { foreignKey: 'categoria_padre_id', as: 'subcategories' });

// Inventario - Producto (N:1)
Inventory.belongsTo(Product, { foreignKey: 'producto_id', as: 'product' });
Product.hasOne(Inventory, { foreignKey: 'producto_id', as: 'inventory' }); // ✅ AGREGADO

// Movimiento Inventario - Producto (N:1)
InventoryMovement.belongsTo(Product, { foreignKey: 'producto_id', as: 'product' });
Product.hasMany(InventoryMovement, { foreignKey: 'producto_id', as: 'movements' });

// Movimiento Inventario - Usuario (N:1)
InventoryMovement.belongsTo(User, { foreignKey: 'usuario_id', as: 'user' });
User.hasMany(InventoryMovement, { foreignKey: 'usuario_id', as: 'inventoryMovements' });

// Factura - Cliente (N:1)
Invoice.belongsTo(Customer, { foreignKey: 'cliente_id', as: 'customer' });
Customer.hasMany(Invoice, { foreignKey: 'cliente_id', as: 'invoices' });

// Factura - Vendedor (N:1)
Invoice.belongsTo(User, { foreignKey: 'vendedor_id', as: 'seller' });
User.hasMany(Invoice, { foreignKey: 'vendedor_id', as: 'sales' });

// Detalle Factura - Factura (N:1)
InvoiceDetail.belongsTo(Invoice, { foreignKey: 'factura_id', as: 'invoice' });
Invoice.hasMany(InvoiceDetail, { foreignKey: 'factura_id', as: 'details' });

// Detalle Factura - Producto (N:1)
InvoiceDetail.belongsTo(Product, { foreignKey: 'producto_id', as: 'product' });
Product.hasMany(InvoiceDetail, { foreignKey: 'producto_id', as: 'invoiceDetails' });

// Pago - Factura (N:1)
Payment.belongsTo(Invoice, { foreignKey: 'factura_id', as: 'invoice' });
Invoice.hasMany(Payment, { foreignKey: 'factura_id', as: 'payments' });

// Pago - Usuario (N:1)
Payment.belongsTo(User, { foreignKey: 'usuario_id', as: 'user' });
User.hasMany(Payment, { foreignKey: 'usuario_id', as: 'payments' });

// Compra - Proveedor (N:1)
Purchase.belongsTo(Supplier, { foreignKey: 'proveedor_id', as: 'supplier' });
Supplier.hasMany(Purchase, { foreignKey: 'proveedor_id', as: 'purchases' });

// Compra - Usuario (N:1)
Purchase.belongsTo(User, { foreignKey: 'usuario_id', as: 'user' });
User.hasMany(Purchase, { foreignKey: 'usuario_id', as: 'purchases' });

// Detalle Compra - Compra (N:1)
PurchaseDetail.belongsTo(Purchase, { foreignKey: 'compra_id', as: 'purchase' });
Purchase.hasMany(PurchaseDetail, { foreignKey: 'compra_id', as: 'details' });

// Detalle Compra - Producto (N:1)
PurchaseDetail.belongsTo(Product, { foreignKey: 'producto_id', as: 'product' });
Product.hasMany(PurchaseDetail, { foreignKey: 'producto_id', as: 'purchaseDetails' });

// Cuentas por Cobrar - Factura (N:1)
AccountsReceivable.belongsTo(Invoice, { foreignKey: 'factura_id', as: 'invoice' });
Invoice.hasOne(AccountsReceivable, { foreignKey: 'factura_id', as: 'accountReceivable' });

// Cuentas por Cobrar - Cliente (N:1)
AccountsReceivable.belongsTo(Customer, { foreignKey: 'cliente_id', as: 'customer' });
Customer.hasMany(AccountsReceivable, { foreignKey: 'cliente_id', as: 'accountsReceivable' });

// Cuentas por Pagar - Compra (N:1)
AccountsPayable.belongsTo(Purchase, { foreignKey: 'compra_id', as: 'purchase' });
Purchase.hasOne(AccountsPayable, { foreignKey: 'compra_id', as: 'accountPayable' });

// Cuentas por Pagar - Proveedor (N:1)
AccountsPayable.belongsTo(Supplier, { foreignKey: 'proveedor_id', as: 'supplier' });
Supplier.hasMany(AccountsPayable, { foreignKey: 'proveedor_id', as: 'accountsPayable' });

// Nómina - Empleado (N:1)
Payroll.belongsTo(Employee, { foreignKey: 'empleado_id', as: 'employee' });
Employee.hasMany(Payroll, { foreignKey: 'empleado_id', as: 'payrolls' });

// Activo - Responsable (N:1)
Asset.belongsTo(Employee, { foreignKey: 'responsable_id', as: 'responsible' });
Employee.hasMany(Asset, { foreignKey: 'responsable_id', as: 'assets' });

// Reportes DGII - Compra/Factura
Report606.belongsTo(Purchase, { foreignKey: 'compra_id', as: 'purchase' });
Purchase.hasOne(Report606, { foreignKey: 'compra_id', as: 'report606' });

Report607.belongsTo(Invoice, { foreignKey: 'factura_id', as: 'invoice' });
Invoice.hasOne(Report607, { foreignKey: 'factura_id', as: 'report607' });

Report608.belongsTo(Invoice, { foreignKey: 'factura_id', as: 'invoice' });
Invoice.hasOne(Report608, { foreignKey: 'factura_id', as: 'report608' });

// ============================================
// EXPORTAR TODO
// ============================================

export {
  sequelize,
  Role,
  User,
  Employee,
  Customer,
  Supplier,
  Category,
  Product,
  Inventory, // ✅ AGREGADO
  InventoryMovement,
  NCF,
  Invoice,
  InvoiceDetail,
  Payment,
  Purchase,
  PurchaseDetail,
  AccountsReceivable,
  AccountsPayable,
  Payroll,
  Asset,
  Budget,
  Subscription,
  Report606,
  Report607,
  Report608,
};

export default sequelize;