-- ============================================
-- ESQUEMA BASE DE DATOS ERP/CRM DOMINICANA
-- ============================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS erp_crm_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE erp_crm_db;

-- ============================================
-- TABLA: ROLES
-- ============================================
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    permisos JSON,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- TABLA: USUARIOS
-- ============================================
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    cedula VARCHAR(20) UNIQUE,
    rol_id INT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    ultimo_acceso TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================
-- TABLA: EMPLEADOS
-- ============================================
CREATE TABLE empleados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNIQUE,
    codigo_empleado VARCHAR(20) UNIQUE NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    fecha_nacimiento DATE,
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(100),
    cargo VARCHAR(100),
    departamento VARCHAR(100),
    salario DECIMAL(12,2),
    fecha_ingreso DATE NOT NULL,
    estado ENUM('activo', 'inactivo', 'suspendido') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================
-- TABLA: CLIENTES
-- ============================================
CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_cliente VARCHAR(20) UNIQUE NOT NULL,
    tipo_identificacion ENUM('RNC', 'CEDULA', 'PASAPORTE') NOT NULL,
    numero_identificacion VARCHAR(20) UNIQUE NOT NULL,
    nombre_comercial VARCHAR(150) NOT NULL,
    razon_social VARCHAR(200),
    email VARCHAR(100),
    telefono VARCHAR(20),
    celular VARCHAR(20),
    direccion TEXT,
    ciudad VARCHAR(100),
    provincia VARCHAR(100),
    limite_credito DECIMAL(12,2) DEFAULT 0,
    balance_actual DECIMAL(12,2) DEFAULT 0,
    dias_credito INT DEFAULT 0,
    tipo_cliente ENUM('contado', 'credito', 'ambos') DEFAULT 'contado',
    activo BOOLEAN DEFAULT TRUE,
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_identificacion (numero_identificacion),
    INDEX idx_nombre (nombre_comercial)
) ENGINE=InnoDB;

-- ============================================
-- TABLA: PROVEEDORES
-- ============================================
CREATE TABLE proveedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_proveedor VARCHAR(20) UNIQUE NOT NULL,
    tipo_identificacion ENUM('RNC', 'CEDULA') NOT NULL,
    numero_identificacion VARCHAR(20) UNIQUE NOT NULL,
    nombre_comercial VARCHAR(150) NOT NULL,
    razon_social VARCHAR(200),
    email VARCHAR(100),
    telefono VARCHAR(20),
    celular VARCHAR(20),
    direccion TEXT,
    ciudad VARCHAR(100),
    provincia VARCHAR(100),
    contacto_nombre VARCHAR(150),
    contacto_telefono VARCHAR(20),
    dias_pago INT DEFAULT 30,
    activo BOOLEAN DEFAULT TRUE,
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_identificacion (numero_identificacion)
) ENGINE=InnoDB;

-- ============================================
-- TABLA: CATEGORIAS
-- ============================================
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    categoria_padre_id INT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_padre_id) REFERENCES categorias(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================
-- TABLA: PRODUCTOS
-- ============================================
CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    categoria_id INT,
    unidad_medida ENUM('UND', 'KG', 'LB', 'LT', 'GAL', 'MT', 'CAJA', 'PAQUETE') DEFAULT 'UND',
    precio_compra DECIMAL(12,2) NOT NULL DEFAULT 0,
    precio_venta DECIMAL(12,2) NOT NULL DEFAULT 0,
    precio_mayorista DECIMAL(12,2),
    itbis_aplicable BOOLEAN DEFAULT TRUE,
    tasa_itbis DECIMAL(5,2) DEFAULT 18.00,
    stock_actual INT DEFAULT 0,
    stock_minimo INT DEFAULT 0,
    stock_maximo INT DEFAULT 0,
    costo_promedio DECIMAL(12,2) DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    imagen_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
    INDEX idx_codigo (codigo),
    INDEX idx_nombre (nombre)
) ENGINE=InnoDB;

-- ============================================
-- TABLA: MOVIMIENTOS INVENTARIO
-- ============================================
CREATE TABLE movimientos_inventario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    tipo_movimiento ENUM('entrada', 'salida', 'ajuste') NOT NULL,
    cantidad INT NOT NULL,
    costo_unitario DECIMAL(12,2),
    documento_referencia VARCHAR(50),
    motivo VARCHAR(200),
    usuario_id INT,
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_producto (producto_id),
    INDEX idx_fecha (fecha_movimiento)
) ENGINE=InnoDB;

-- ============================================
-- TABLA: NCF (COMPROBANTES FISCALES)
-- ============================================
CREATE TABLE ncf (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_ncf ENUM('B01', 'B02', 'B14', 'B15', 'B16') NOT NULL,
    descripcion_tipo VARCHAR(100),
    secuencia_desde VARCHAR(11) NOT NULL,
    secuencia_hasta VARCHAR(11) NOT NULL,
    secuencia_actual VARCHAR(11) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    agotado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tipo (tipo_ncf),
    INDEX idx_activo (activo)
) ENGINE=InnoDB;

-- ============================================
-- TABLA: FACTURAS
-- ============================================
CREATE TABLE facturas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_factura VARCHAR(20) UNIQUE NOT NULL,
    ncf VARCHAR(19) UNIQUE,
    tipo_ncf ENUM('B01', 'B02', 'B14', 'B15', 'B16'),
    cliente_id INT NOT NULL,
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE,
    tipo_venta ENUM('contado', 'credito') DEFAULT 'contado',
    moneda ENUM('DOP', 'USD') DEFAULT 'DOP',
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    descuento DECIMAL(12,2) DEFAULT 0,
    itbis DECIMAL(12,2) NOT NULL DEFAULT 0,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    monto_pagado DECIMAL(12,2) DEFAULT 0,
    balance_pendiente DECIMAL(12,2) DEFAULT 0,
    estado ENUM('pendiente', 'pagada', 'parcial', 'vencida', 'anulada') DEFAULT 'pendiente',
    notas TEXT,
    vendedor_id INT,
    anulada BOOLEAN DEFAULT FALSE,
    motivo_anulacion TEXT,
    fecha_anulacion TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
    FOREIGN KEY (vendedor_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_numero (numero_factura),
    INDEX idx_ncf (ncf),
    INDEX idx_cliente (cliente_id),
    INDEX idx_fecha (fecha_emision),
    INDEX idx_estado (estado)
) ENGINE=InnoDB;

-- ============================================
-- TABLA: DETALLE FACTURAS
-- ============================================
CREATE TABLE detalle_facturas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    factura_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(12,2) NOT NULL,
    descuento DECIMAL(12,2) DEFAULT 0,
    itbis_porcentaje DECIMAL(5,2) DEFAULT 18.00,
    itbis_monto DECIMAL(12,2) DEFAULT 0,
    subtotal DECIMAL(12,2) NOT NULL,
    total DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (factura_id) REFERENCES facturas(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT,
    INDEX idx_factura (factura_id),
    INDEX idx_producto (producto_id)
) ENGINE=InnoDB;

-- ============================================
-- TABLA: PAGOS
-- ============================================
CREATE TABLE pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    factura_id INT NOT NULL,
    numero_recibo VARCHAR(20) UNIQUE NOT NULL,
    fecha_pago DATE NOT NULL,
    monto_pagado DECIMAL(12,2) NOT NULL,
    metodo_pago ENUM('efectivo', 'transferencia', 'cheque', 'tarjeta') NOT NULL,
    referencia VARCHAR(100),
    notas TEXT,
    usuario_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (factura_id) REFERENCES facturas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_factura (factura_id),
    INDEX idx_fecha (fecha_pago)
) ENGINE=InnoDB;

-- ============================================
-- TABLA: COMPRAS
-- ============================================
CREATE TABLE compras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_compra VARCHAR(20) UNIQUE NOT NULL,
    proveedor_id INT NOT NULL,
    ncf_proveedor VARCHAR(19),
    fecha_compra DATE NOT NULL,
    fecha_vencimiento DATE,
    tipo_compra ENUM('contado', 'credito') DEFAULT 'contado',
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    itbis DECIMAL(12,2) NOT NULL DEFAULT 0,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    estado ENUM('pendiente', 'recibida', 'cancelada') DEFAULT 'pendiente',
    notas TEXT,
    usuario_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE RESTRICT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_proveedor (proveedor_id),
    INDEX idx_fecha (fecha_compra)
) ENGINE=InnoDB;

-- ============================================
-- TABLA: DETALLE COMPRAS
-- ============================================
CREATE TABLE detalle_compras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    compra_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(12,2) NOT NULL,
    itbis_porcentaje DECIMAL(5,2) DEFAULT 18.00,
    itbis_monto DECIMAL(12,2) DEFAULT 0,
    subtotal DECIMAL(12,2) NOT NULL,
    total DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT,
    INDEX idx_compra (compra_id)
) ENGINE=InnoDB;

-- ============================================
-- TABLA: CUENTAS POR COBRAR
-- ============================================
CREATE TABLE cuentas_por_cobrar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    factura_id INT NOT NULL,
    cliente_id INT NOT NULL,
    monto_original DECIMAL(12,2) NOT NULL,
    monto_pagado DECIMAL(12,2) DEFAULT 0,
    balance_pendiente DECIMAL(12,2) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    dias_vencido INT DEFAULT 0,
    estado ENUM('vigente', 'vencida', 'cobrada') DEFAULT 'vigente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (factura_id) REFERENCES facturas(id) ON DELETE CASCADE,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    INDEX idx_cliente (cliente_id),
    INDEX idx_estado (estado)
) ENGINE=InnoDB;

-- ============================================
-- TABLA: CUENTAS POR PAGAR
-- ============================================
CREATE TABLE cuentas_por_pagar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    compra_id INT NOT NULL,
    proveedor_id INT NOT NULL,
    monto_original DECIMAL(12,2) NOT NULL,
    monto_pagado DECIMAL(12,2) DEFAULT 0,
    balance_pendiente DECIMAL(12,2) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    dias_vencido INT DEFAULT 0,
    estado ENUM('vigente', 'vencida', 'pagada') DEFAULT 'vigente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE CASCADE,
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE CASCADE,
    INDEX idx_proveedor (proveedor_id),
    INDEX idx_estado (estado)
) ENGINE=InnoDB;

-- ============================================
-- TABLA: NOMINA
-- ============================================
CREATE TABLE nomina (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empleado_id INT NOT NULL,
    periodo VARCHAR(20) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    salario_base DECIMAL(12,2) NOT NULL,
    bonificaciones DECIMAL(12,2) DEFAULT 0,
    horas_extra DECIMAL(12,2) DEFAULT 0,
    deducciones DECIMAL(12,2) DEFAULT 0,
    seguro_social DECIMAL(12,2) DEFAULT 0,
    afp DECIMAL(12,2) DEFAULT 0,
    isr DECIMAL(12,2) DEFAULT 0,
    salario_neto DECIMAL(12,2) NOT NULL,
    estado ENUM('borrador', 'aprobada', 'pagada') DEFAULT 'borrador',
    fecha_pago DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE CASCADE,
    INDEX idx_empleado (empleado_id),
    INDEX idx_periodo (periodo)
) ENGINE=InnoDB;

-- ============================================
-- TABLA: ACTIVOS FIJOS
-- ============================================
CREATE TABLE activos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    categoria ENUM('edificio', 'vehiculo', 'maquinaria', 'equipo', 'mueble', 'tecnologia') NOT NULL,
    valor_compra DECIMAL(12,2) NOT NULL,
    fecha_compra DATE NOT NULL,
    vida_util_años INT,
    depreciacion_anual DECIMAL(12,2),
    depreciacion_acumulada DECIMAL(12,2) DEFAULT 0,
    valor_residual DECIMAL(12,2),
    estado ENUM('activo', 'en_reparacion', 'dado_de_baja') DEFAULT 'activo',
    ubicacion VARCHAR(200),
    responsable_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (responsable_id) REFERENCES empleados(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================
-- TABLA: PRESUPUESTOS
-- ============================================
CREATE TABLE presupuestos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    año INT NOT NULL,
    mes INT NOT NULL,
    departamento VARCHAR(100),
    categoria VARCHAR(100) NOT NULL,
    monto_presupuestado DECIMAL(12,2) NOT NULL,
    monto_ejecutado DECIMAL(12,2) DEFAULT 0,
    porcentaje_ejecutado DECIMAL(5,2) DEFAULT 0,
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_presupuesto (año, mes, departamento, categoria)
) ENGINE=InnoDB;

-- ============================================
-- TABLA: SUSCRIPCIONES (Control de Licencias)
-- ============================================
CREATE TABLE suscripciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_nombre VARCHAR(200) NOT NULL,
    empresa_rnc VARCHAR(20) UNIQUE NOT NULL,
    plan ENUM('basico', 'profesional', 'empresarial') NOT NULL,
    usuarios_permitidos INT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    estado ENUM('activa', 'vencida', 'suspendida', 'cancelada') DEFAULT 'activa',
    monto_mensual DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_estado (estado)
) ENGINE=InnoDB;

-- ============================================
-- TABLA: REPORTES DGII 606 (COMPRAS)
-- ============================================
CREATE TABLE reporte_606 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    compra_id INT NOT NULL,
    rnc_cedula VARCHAR(20) NOT NULL,
    tipo_identificacion ENUM('1', '2', '3') NOT NULL COMMENT '1=RNC, 2=Cedula, 3=Pasaporte',
    tipo_bienes_servicios VARCHAR(2) NOT NULL COMMENT '01=Gastos, 02=Inversiones, etc',
    ncf VARCHAR(19) NOT NULL,
    ncf_modificado VARCHAR(19),
    fecha_comprobante DATE NOT NULL,
    fecha_pago DATE,
    monto_facturado DECIMAL(12,2) NOT NULL,
    itbis_facturado DECIMAL(12,2) NOT NULL,
    itbis_retenido DECIMAL(12,2) DEFAULT 0,
    itbis_sujeto_proporcionalidad DECIMAL(12,2) DEFAULT 0,
    itbis_llevado_costo DECIMAL(12,2) DEFAULT 0,
    itbis_compensacion DECIMAL(12,2) DEFAULT 0,
    mes_reporte INT NOT NULL,
    año_reporte INT NOT NULL,
    enviado_dgii BOOLEAN DEFAULT FALSE,
    fecha_envio TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE CASCADE,
    INDEX idx_periodo (año_reporte, mes_reporte),
    INDEX idx_rnc (rnc_cedula)
) ENGINE=InnoDB;

-- ============================================
-- TABLA: REPORTES DGII 607 (VENTAS)
-- ============================================
CREATE TABLE reporte_607 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    factura_id INT NOT NULL,
    rnc_cedula VARCHAR(20) NOT NULL,
    tipo_identificacion ENUM('1', '2', '3') NOT NULL COMMENT '1=RNC, 2=Cedula, 3=Pasaporte',
    ncf VARCHAR(19) NOT NULL,
    ncf_modificado VARCHAR(19),
    tipo_ingreso VARCHAR(2) NOT NULL COMMENT '01=Ingresos por operaciones, 02=Ingresos financieros, etc',
    fecha_comprobante DATE NOT NULL,
    fecha_retencion DATE,
    monto_facturado DECIMAL(12,2) NOT NULL,
    itbis_facturado DECIMAL(12,2) NOT NULL,
    itbis_retenido DECIMAL(12,2) DEFAULT 0,
    isr_retenido DECIMAL(12,2) DEFAULT 0,
    impuesto_selectivo DECIMAL(12,2) DEFAULT 0,
    otros_impuestos DECIMAL(12,2) DEFAULT 0,
    propina_legal DECIMAL(12,2) DEFAULT 0,
    mes_reporte INT NOT NULL,
    año_reporte INT NOT NULL,
    enviado_dgii BOOLEAN DEFAULT FALSE,
    fecha_envio TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (factura_id) REFERENCES facturas(id) ON DELETE CASCADE,
    INDEX idx_periodo (año_reporte, mes_reporte),
    INDEX idx_rnc (rnc_cedula)
) ENGINE=InnoDB;

-- ============================================
-- TABLA: REPORTES DGII 608 (ANULACIONES)
-- ============================================
CREATE TABLE reporte_608 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    factura_id INT NOT NULL,
    ncf VARCHAR(19) NOT NULL,
    fecha_comprobante DATE NOT NULL,
    tipo_anulacion ENUM('01', '02', '03', '04') NOT NULL COMMENT '01=Deterioro, 02=Error impresión, 03=Impresión defectuosa, 04=Corrección info',
    mes_reporte INT NOT NULL,
    año_reporte INT NOT NULL,
    enviado_dgii BOOLEAN DEFAULT FALSE,
    fecha_envio TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (factura_id) REFERENCES facturas(id) ON DELETE CASCADE,
    INDEX idx_periodo (año_reporte, mes_reporte),
    INDEX idx_ncf (ncf)
) ENGINE=InnoDB;

-- ============================================
-- INSERTAR DATOS INICIALES
-- ============================================

-- Roles iniciales
INSERT INTO roles (nombre, descripcion, permisos) VALUES
('Administrador', 'Acceso total al sistema', '{"all": true}'),
('Gerente', 'Acceso a dashboard y reportes ejecutivos', '{"dashboard": true, "reportes": true, "finanzas": true}'),
('Vendedor', 'Acceso a ventas, facturación y CRM', '{"ventas": true, "crm": true, "clientes": true}'),
('Inventario', 'Gestión de productos e inventario', '{"inventario": true, "productos": true, "compras": true}'),
('Contabilidad', 'Gestión financiera y contable', '{"finanzas": true, "contabilidad": true, "reportes": true}'),
('RRHH', 'Gestión de recursos humanos', '{"empleados": true, "nomina": true}');

-- Usuario administrador por defecto (password: Admin123!)
INSERT INTO usuarios (nombre_completo, email, password, rol_id) VALUES
('Administrador Sistema', 'admin@erp.com', '$2a$10$XqZYJ1Ld5kEKxXxKxJ0YYuHGKFZx4jZ8wXzVJxXxXxXxXxXxXxXxX', 1);

-- Tipos de NCF
INSERT INTO ncf (tipo_ncf, descripcion_tipo, secuencia_desde, secuencia_hasta, secuencia_actual, fecha_vencimiento) VALUES
('B01', 'Crédito Fiscal', 'B0100000001', 'B0100001000', 'B0100000001', '2025-12-31'),
('B02', 'Consumo', 'B0200000001', 'B0200005000', 'B0200000001', '2025-12-31'),
('B14', 'Regímenes Especiales', 'B1400000001', 'B1400000500', 'B1400000001', '2025-12-31');

-- Categorías de productos
INSERT INTO categorias (nombre, descripcion) VALUES
('Ferretería', 'Productos de ferretería en general'),
('Herramientas', 'Herramientas manuales y eléctricas'),
('Construcción', 'Materiales de construcción'),
('Electricidad', 'Productos eléctricos'),
('Plomería', 'Productos de plomería');

-- ============================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- ============================================

-- Índices compuestos para reportes
CREATE INDEX idx_facturas_reporte ON facturas(fecha_emision, estado, anulada);
CREATE INDEX idx_compras_reporte ON compras(fecha_compra, estado);
CREATE INDEX idx_productos_stock ON productos(stock_actual, stock_minimo);

-- ============================================
-- FIN DEL SCRIPT
-- ============================================