# ERP/CRM Sistema para República Dominicana

Sistema completo de ERP/CRM adaptado a las regulaciones dominicanas (NCF, DGII, ITBIS).

## Estructura del Proyecto

- **backend/** - API REST con Node.js + Express + MySQL
- **frontend/** - Interfaz con React + Vite
- **database/** - Migraciones y esquemas de base de datos
- **docs/** - Documentación del proyecto

## Instalación

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus credenciales
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Características

- ✅ Sistema de roles (Admin, Vendedor, Inventario, Contabilidad, RRHH, Gerente)
- ✅ Gestión de facturación con NCF
- ✅ Reportes DGII (606, 607, 608)
- ✅ Control de inventario
- ✅ Gestión de clientes y proveedores
- ✅ Contabilidad y finanzas
- ✅ RRHH y nómina
- ✅ Dashboard ejecutivo con KPIs

## Tecnologías

### Backend
- Node.js + Express
- MySQL + Sequelize
- JWT Authentication
- Axios (DGII API)

### Frontend
- React + Vite
- Tailwind CSS
- React Router
- Axios

## Licencia

ISC