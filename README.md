# 🏢 ERP/CRM República Dominicana

Sistema de Gestión Empresarial (ERP/CRM) diseñado específicamente para República Dominicana con soporte completo para DGII, NCF, ITBIS y reportes fiscales.

## 📋 Características Principales

### ✅ Implementado (Etapa 5)
- **Autenticación y Roles**: JWT, control de acceso por roles
- **Gestión de Usuarios**: CRUD completo con validación
- **Inventario**: Productos, categorías, movimientos de stock
- **Clientes**: CRUD con validación RNC/Cédula
- **NCF**: Gestión de rangos de comprobantes fiscales (B01, B02, B14)
- **Facturación**: Sistema completo con NCF e ITBIS
- **Pagos**: Registro de pagos y recibos
- **Dashboard**: KPIs, stock bajo, accesos rápidos

### 🚧 En Desarrollo
- **Proveedores**: CRUD de proveedores
- **Compras**: Gestión de compras y entradas
- **Reportes DGII**: 606 (Compras), 607 (Ventas), 608 (Anulaciones)
- **Cuentas por Cobrar/Pagar**: Gestión financiera
- **Nómina**: Gestión de empleados y pagos
- **Activos Fijos**: Control de activos
- **Presupuestos**: Planificación financiera
- **Suscripciones**: Control de licencias

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** + **Express**
- **MySQL** con **Sequelize ORM**
- **JWT** para autenticación
- **bcryptjs** para encriptación
- Exportación a **Excel** y **PDF**

### Frontend
- **React 18** + **Vite**
- **React Router** v6
- **Tailwind CSS** 3
- **Axios** para HTTP
- **Lucide React** para iconos
- **Recharts** para gráficos

## 📦 Instalación

### Prerrequisitos
- Node.js >= 18.x
- MySQL >= 8.0
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd erp-crm-dominicana
```

### 2. Configurar Backend

```bash
cd backend
npm install
```

Crear archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=erp_crm_db
DB_USER=root
DB_PASSWORD=tu_password
JWT_SECRET=tu_secret_key_super_seguro
```

### 3. Inicializar Base de Datos

```bash
# Opción 1: Script interactivo
npm run init-db

# Opción 2: Ejecutar SQL directamente
mysql -u root -p < ../database/schema.sql
```

### 4. Poblar datos de prueba (opcional)

```bash
npm run seed
```

### 5. Iniciar Backend

```bash
npm run dev
# Backend corriendo en http://localhost:5000
```

### 6. Configurar Frontend

```bash
cd ../frontend
npm install
```

Crear archivo `.env`:
```bash
cp .env.example .env
```

### 7. Iniciar Frontend

```bash
npm run dev
# Frontend corriendo en http://localhost:3000
```

## 🔐 Credenciales de Prueba

**Administrador:**
- Email: `admin@erp.com`
- Password: `Admin123!`

## 📁 Estructura del Proyecto

```
erp-crm-dominicana/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuraciones
│   │   ├── controllers/     # Controladores de rutas
│   │   ├── middlewares/     # Middlewares (auth, validación)
│   │   ├── models/          # Modelos de Sequelize
│   │   ├── routes/          # Definición de rutas
│   │   ├── services/        # Lógica de negocio
│   │   ├── utils/           # Utilidades
│   │   ├── scripts/         # Scripts de BD
│   │   ├── app.js           # Configuración Express
│   │   └── server.js        # Punto de entrada
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── pages/           # Páginas principales
│   │   ├── services/        # Servicios API
│   │   ├── hooks/           # Custom hooks
│   │   ├── utils/           # Utilidades
│   │   ├── App.jsx          # Componente raíz
│   │   └── main.jsx         # Punto de entrada
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── database/
    └── schema.sql           # Esquema de BD

```

## 🚀 Guía de Desarrollo

### Agregar un nuevo módulo

1. **Backend:**
   - Crear modelo en `models/`
   - Crear controlador en `controllers/`
   - Definir rutas en `routes/`
   - Agregar middleware si es necesario

2. **Frontend:**
   - Crear servicio en `services/`
   - Crear componentes en `components/`
   - Crear página en `pages/`
   - Agregar ruta en `App.jsx`

### Convenciones de Código

- **Backend:** 
  - Nombres en snake_case para BD
  - Nombres en camelCase para variables JS
  - Siempre usar try-catch
  - Validar entrada del usuario

- **Frontend:**
  - Componentes en PascalCase
  - Hooks en camelCase con prefijo `use`
  - Servicios exportan funciones nombradas
  - Siempre manejar estados de carga y error

## 📊 Modelo de Datos Principal

### Tablas Core
- `usuarios` - Usuarios del sistema
- `roles` - Roles y permisos
- `clientes` - Clientes
- `proveedores` - Proveedores
- `productos` - Productos
- `facturas` - Facturas con NCF
- `ncf` - Rangos de NCF
- `cuentas_por_cobrar` - CxC
- `cuentas_por_pagar` - CxP

### Reportes DGII
- `reporte_606` - Compras
- `reporte_607` - Ventas
- `reporte_608` - Anulaciones

## 🔧 Scripts Disponibles

### Backend
```bash
npm start          # Iniciar en producción
npm run dev        # Iniciar en desarrollo (nodemon)
npm run init-db    # Inicializar base de datos
npm run seed       # Poblar datos de prueba
```

### Frontend
```bash
npm run dev        # Iniciar servidor de desarrollo
npm run build      # Compilar para producción
npm run preview    # Previsualizar build
npm run lint       # Ejecutar ESLint
```

## 🐛 Problemas Comunes

### Error de conexión MySQL
```bash
# Verificar que MySQL esté corriendo
mysql --version
sudo systemctl status mysql

# Verificar credenciales en .env
```

### Error "Module not found"
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error CORS
```bash
# Verificar que VITE_API_URL en frontend/.env
# coincida con el puerto del backend
```

## 📝 Roadmap

- [x] Etapa 1: Estructura del proyecto
- [x] Etapa 2: Base de datos y modelos
- [x] Etapa 3: Backend con autenticación
- [x] Etapa 4: CRUD de productos e inventario
- [x] Etapa 5: Facturación con NCF
- [ ] Etapa 6: Reportes DGII (606, 607, 608)
- [ ] Etapa 7: Validación RNC/Cédula con DGII
- [ ] Etapa 8: Dashboard Gerencial
- [ ] Etapa 9: Control de suscripciones
- [ ] Etapa 10: Extras y pulido final

## 📄 Licencia

Este proyecto es privado y confidencial.

## 🤝 Contribución

Para contribuir al proyecto, contacta al equipo de desarrollo.

## 📞 Soporte

Para soporte técnico, contacta a: support@erp-dominicana.com



## NEW
npm run dev -- --host