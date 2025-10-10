# 🚀 ERP/CRM Backend - República Dominicana

Backend completo para sistema ERP/CRM adaptado a las regulaciones dominicanas (DGII, NCF, ITBIS).

## 📋 Características Implementadas

### ✅ Etapa 1-5 (Base)
- ✅ Autenticación JWT
- ✅ Gestión de Usuarios y Roles
- ✅ CRUD Productos e Inventario
- ✅ Gestión de Clientes
- ✅ Control de NCF (DGII)
- ✅ Facturación con ITBIS

### ✅ Etapa 6 (Reportes DGII) - **COMPLETADA**
- ✅ Reporte 607 (Ventas)
- ✅ Reporte 606 (Compras)
- ✅ Reporte 608 (Anulaciones)
- ✅ Exportación TXT (formato DGII)
- ✅ Exportación Excel/CSV
- ✅ Guardado en base de datos
- ✅ Resumen de reportes por año

### 🆕 Módulo POS (Punto de Venta) - **NUEVO**
- ✅ Búsqueda rápida de productos
- ✅ Lectura de código de barras
- ✅ Venta rápida con NCF automático
- ✅ Ventas de contado/crédito
- ✅ Cierre de caja
- ✅ Resumen de ventas del día

---

## 🛠️ Tecnologías

- **Node.js** 18+
- **Express** 4.18
- **MySQL** 8.0
- **Sequelize** 6.35 (ORM)
- **JWT** para autenticación
- **bcryptjs** para encriptación

---

## 📦 Instalación

```bash
# Clonar repositorio
git clone <tu-repo>
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales

# Inicializar base de datos
npm run init-db
# Selecciona opción 3 (force) para crear todo desde cero

# Poblar datos de prueba
npm run seed

# Crear cliente "Consumidor Final"
npm run seed:consumidor

# Iniciar servidor
npm run dev
```

---

## 🔧 Variables de Entorno (.env)

```env
# Server
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=erp_crm_db
DB_USER=root
DB_PASSWORD=tu_password

# JWT
JWT_SECRET=tu_secreto_super_seguro
JWT_EXPIRES_IN=7d

# Company (para reportes DGII)
COMPANY_RNC=000000000
COMPANY_NAME=Mi Empresa SRL
COMPANY_ADDRESS=Calle Principal #123
COMPANY_PHONE=809-555-1234
```

---

## 📚 Endpoints Principales

### 🔐 Autenticación
```http
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/profile
```

### 👥 Usuarios
```http
GET    /api/v1/users
GET    /api/v1/users/:id
POST   /api/v1/users
PUT    /api/v1/users/:id
PATCH  /api/v1/users/toggle-status/:id
```

### 📦 Productos
```http
GET    /api/v1/products
GET    /api/v1/products/:id
POST   /api/v1/products
PUT    /api/v1/products/:id
PATCH  /api/v1/products/toggle-status/:id
GET    /api/v1/products/categories
```

### 👤 Clientes
```http
GET    /api/v1/customers
GET    /api/v1/customers/:id
GET    /api/v1/customers/consumidor-final
GET    /api/v1/customers/generate-code
POST   /api/v1/customers
PUT    /api/v1/customers/:id
```

### 📄 NCF (Comprobantes Fiscales)
```http
GET    /api/v1/ncf
GET    /api/v1/ncf/next/:tipo
GET    /api/v1/ncf/alerts
POST   /api/v1/ncf
POST   /api/v1/ncf/consume/:tipo
PATCH  /api/v1/ncf/:id/deactivate
```

### 🧾 Facturas
```http
GET    /api/v1/invoices
GET    /api/v1/invoices/:id
GET    /api/v1/invoices/stats
POST   /api/v1/invoices
PATCH  /api/v1/invoices/:id/anular
POST   /api/v1/invoices/:id/payments
```

### 📊 Reportes DGII
```http
# Reporte 607 (Ventas)
GET    /api/v1/reports/607?mes=1&año=2025
GET    /api/v1/reports/607?mes=1&año=2025&format=txt
GET    /api/v1/reports/607?mes=1&año=2025&format=excel
POST   /api/v1/reports/607/save

# Reporte 606 (Compras)
GET    /api/v1/reports/606?mes=1&año=2025
GET    /api/v1/reports/606?mes=1&año=2025&format=txt
GET    /api/v1/reports/606?mes=1&año=2025&format=excel
POST   /api/v1/reports/606/save

# Reporte 608 (Anulaciones)
GET    /api/v1/reports/608?mes=1&año=2025
GET    /api/v1/reports/608?mes=1&año=2025&format=txt
GET    /api/v1/reports/608?mes=1&año=2025&format=excel
POST   /api/v1/reports/608/save

# Resumen
GET    /api/v1/reports/summary?año=2025
```

### 🛒 POS (Punto de Venta) - **NUEVO**
```http
# Búsqueda de productos
GET    /api/v1/pos/products/search?query=martillo
GET    /api/v1/pos/products/barcode/:codigo

# Ventas
POST   /api/v1/pos/sale
GET    /api/v1/pos/daily-sales
GET    /api/v1/pos/daily-sales?fecha=2025-10-09

# Cierre de caja
POST   /api/v1/pos/close-register
```

### 📦 Inventario
```http
GET    /api/v1/inventory/movements
GET    /api/v1/inventory/movements/product/:id
POST   /api/v1/inventory/movements
GET    /api/v1/inventory/low-stock
GET    /api/v1/inventory/valuation
```

---

## 🧪 Testing

```bash
# Probar conexión y estructura
npm run init-db

# Poblar datos de prueba
npm run seed

# Probar reportes DGII
npm run test:reports

# Probar módulo POS
npm run test:pos
```

---

## 🔒 Autenticación

Todas las rutas (excepto login/register) requieren token JWT:

```http
Authorization: Bearer <tu_token_jwt>
```

**Credenciales por defecto:**
- Email: `admin@erp.com`
- Password: `Admin123!`

---

## 📝 Ejemplo de Venta POS

```javascript
POST /api/v1/pos/sale
Content-Type: application/json
Authorization: Bearer <token>

{
  "cliente_id": 1,
  "items": [
    {
      "producto_id": 1,
      "cantidad": 2,
      "precio_unitario": 350.00,
      "descuento": 0
    },
    {
      "producto_id": 3,
      "cantidad": 5,
      "precio_unitario": 65.00,
      "descuento": 10
    }
  ],
  "tipo_ncf": "B02",
  "tipo_venta": "contado",
  "metodo_pago": "efectivo",
  "monto_recibido": 1500,
  "descuento": 0,
  "notas": "Venta rápida POS"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Venta registrada exitosamente",
  "invoice": {
    "id": 1,
    "numero_factura": "FAC-00001",
    "ncf": "B0200000001",
    "total": 1015.00,
    "cambio": "485.00"
  },
  "cambio": "485.00"
}
```

---

## 📊 Estructura de Base de Datos

### Tablas Principales
- `usuarios` - Usuarios del sistema
- `roles` - Roles y permisos
- `clientes` - Clientes
- `proveedores` - Proveedores
- `productos` - Productos
- `categorias` - Categorías de productos
- `facturas` - Facturas de venta
- `detalle_facturas` - Items de facturas
- `ncf` - Rangos de NCF
- `movimientos_inventario` - Historial de inventario
- `cuentas_por_cobrar` - CxC
- `cuentas_por_pagar` - CxP
- `pagos` - Registro de pagos

### Reportes DGII
- `reporte_607` - Ventas
- `reporte_606` - Compras
- `reporte_608` - Anulaciones

---

## 🎯 Próximas Etapas

### Etapa 7 - Validación DGII
- [ ] Integración con API DGII (RNC/Cédula)
- [ ] Validación de NCF en tiempo real
- [ ] Consulta de contribuyentes

### Etapa 8 - Dashboard Gerencial
- [ ] KPIs en tiempo real
- [ ] Gráficos de ventas
- [ ] Análisis de rentabilidad
- [ ] Drill-down en datos

### Etapa 9 - Control de Suscripciones
- [ ] Gestión de planes
- [ ] Bloqueo por falta de pago
- [ ] Alertas de vencimiento

### Etapa 10 - Super Admin
- [ ] Gestión multi-empresa
- [ ] Configuración por tipo de negocio
- [ ] Panel de administración

---

## 🐛 Debugging

```bash
# Ver logs en tiempo real
npm run dev

# Probar endpoints con curl
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@erp.com","password":"Admin123!"}'
```

---

## 📖 Documentación Adicional

- [DGII - Normas NCF](https://dgii.gov.do/)
- [Sequelize Docs](https://sequelize.org/)
- [Express.js](https://expressjs.com/)

---

## 👨‍💻 Autor

**Zlb**

---

## 📄 Licencia

MIT

---

## 🆘 Soporte

Si encuentras algún bug o necesitas ayuda:
1. Revisa los logs: `npm run dev`
2. Ejecuta las pruebas: `npm run test:reports` o `npm run test:pos`
3. Verifica la conexión a BD: `npm run init-db` opción 4

**Estado actual:** ✅ Etapa 6 (Reportes DGII) + POS Completados