-- ============================================
-- ESQUEMA BASE DE DATOS ERP/CRM DOMINICANA
-- ACTUALIZADO CON TABLA DE AUDITORÍA
-- ============================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS erp_crm_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE erp_crm_db;

-- ... (Todas las tablas anteriores se mantienen igual) ...

-- ============================================
-- TABLA: AUDITORÍA DE ACCIONES (NUEVA)
-- ============================================
CREATE TABLE IF NOT EXISTS auditoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tabla VARCHAR(50) NOT NULL COMMENT 'Nombre de la tabla afectada',
    accion ENUM('CREATE', 'UPDATE', 'DELETE', 'ANULAR', 'LOGIN', 'LOGOUT') NOT NULL,
    registro_id INT NOT NULL COMMENT 'ID del registro afectado',
    usuario_id INT COMMENT 'Usuario que ejecutó la acción',
    datos_anteriores JSON COMMENT 'Estado anterior del registro (para UPDATE)',
    datos_nuevos JSON COMMENT 'Estado nuevo del registro',
    ip_address VARCHAR(45) COMMENT 'Dirección IP del usuario',
    user_agent VARCHAR(255) COMMENT 'Navegador/dispositivo del usuario',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_tabla (tabla),
    INDEX idx_usuario (usuario_id),
    INDEX idx_fecha (created_at),
    INDEX idx_accion (accion),
    INDEX idx_registro (tabla, registro_id)
) ENGINE=InnoDB COMMENT='Registro de auditoría de todas las operaciones críticas del sistema';

-- ============================================
-- INSERTAR DATOS INICIALES (Si no existen)
-- ============================================

-- Roles iniciales
INSERT IGNORE INTO roles (id, nombre, descripcion, permisos) VALUES
(1, 'Administrador', 'Acceso total al sistema', '{"all": true}'),
(2, 'Gerente', 'Acceso a dashboard y reportes ejecutivos', '{"dashboard": true, "reportes": true, "finanzas": true}'),
(3, 'Vendedor', 'Acceso a ventas, facturación y CRM', '{"ventas": true, "crm": true, "clientes": true}'),
(4, 'Inventario', 'Gestión de productos e inventario', '{"inventario": true, "productos": true, "compras": true}'),
(5, 'Contabilidad', 'Gestión financiera y contable', '{"finanzas": true, "contabilidad": true, "reportes": true}'),
(6, 'RRHH', 'Gestión de recursos humanos', '{"empleados": true, "nomina": true}');

-- Usuario administrador por defecto (password: Admin123!)
-- Hash bcryptjs para "Admin123!": $2a$10$XqZYJ1Ld5kEKxXxKxJ0YYuHGKFZx4jZ8wXzVJxXxXxXxXxXxXxXxX
INSERT IGNORE INTO usuarios (id, nombre_completo, email, password, rol_id, activo) VALUES
(1, 'Administrador Sistema', 'admin@erp.com', '$2a$10$XqZYJ1Ld5kEKxXxKxJ0YYuHGKFZx4jZ8wXzVJxXxXxXxXxXxXxXxX', 1, true);

-- Tipos de NCF
INSERT IGNORE INTO ncf (id, tipo_ncf, descripcion_tipo, secuencia_desde, secuencia_hasta, secuencia_actual, fecha_vencimiento, activo) VALUES
(1, 'B01', 'Crédito Fiscal', 'B0100000001', 'B0100001000', 'B0100000001', '2025-12-31', true),
(2, 'B02', 'Consumo', 'B0200000001', 'B0200005000', 'B0200000001', '2025-12-31', true),
(3, 'B14', 'Regímenes Especiales', 'B1400000001', 'B1400000500', 'B1400000001', '2025-12-31', true);

-- Categorías de productos
INSERT IGNORE INTO categorias (id, nombre, descripcion, activo) VALUES
(1, 'Ferretería', 'Productos de ferretería en general', true),
(2, 'Herramientas', 'Herramientas manuales y eléctricas', true),
(3, 'Construcción', 'Materiales de construcción', true),
(4, 'Electricidad', 'Productos eléctricos', true),
(5, 'Plomería', 'Productos de plomería', true),
(6, 'Pintura', 'Pinturas y accesorios', true),
(7, 'Cerrajería', 'Cerraduras y candados', true);

-- ============================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- ============================================

-- Índices compuestos para reportes
CREATE INDEX IF NOT EXISTS idx_facturas_reporte ON facturas(fecha_emision, estado, anulada);
CREATE INDEX IF NOT EXISTS idx_compras_reporte ON compras(fecha_compra, estado);
CREATE INDEX IF NOT EXISTS idx_productos_stock ON productos(stock_actual, stock_minimo);
CREATE INDEX IF NOT EXISTS idx_facturas_cliente_fecha ON facturas(cliente_id, fecha_emision);
CREATE INDEX IF NOT EXISTS idx_ncf_tipo_activo ON ncf(tipo_ncf, activo, agotado);

-- ============================================
-- VISTAS ÚTILES PARA REPORTES
-- ============================================

-- Vista de productos con stock crítico
CREATE OR REPLACE VIEW v_productos_stock_critico AS
SELECT 
    p.id,
    p.codigo,
    p.nombre,
    c.nombre as categoria,
    p.stock_actual,
    p.stock_minimo,
    p.stock_maximo,
    (p.stock_minimo - p.stock_actual) as unidades_faltantes,
    p.precio_venta,
    (p.stock_minimo - p.stock_actual) * p.precio_venta as valor_reposicion
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
WHERE p.stock_actual <= p.stock_minimo
AND p.activo = true
ORDER BY (p.stock_minimo - p.stock_actual) DESC;

-- Vista de facturas pendientes de cobro
CREATE OR REPLACE VIEW v_cuentas_por_cobrar_pendientes AS
SELECT 
    f.id,
    f.numero_factura,
    f.ncf,
    f.fecha_emision,
    f.fecha_vencimiento,
    c.codigo_cliente,
    c.nombre_comercial,
    c.numero_identificacion,
    f.total,
    f.monto_pagado,
    f.balance_pendiente,
    DATEDIFF(CURDATE(), f.fecha_vencimiento) as dias_vencidos,
    CASE 
        WHEN DATEDIFF(CURDATE(), f.fecha_vencimiento) <= 0 THEN 'Al día'
        WHEN DATEDIFF(CURDATE(), f.fecha_vencimiento) <= 30 THEN '1-30 días'
        WHEN DATEDIFF(CURDATE(), f.fecha_vencimiento) <= 60 THEN '31-60 días'
        WHEN DATEDIFF(CURDATE(), f.fecha_vencimiento) <= 90 THEN '61-90 días'
        ELSE 'Más de 90 días'
    END as categoria_vencimiento
FROM facturas f
INNER JOIN clientes c ON f.cliente_id = c.id
WHERE f.balance_pendiente > 0
AND f.anulada = false
AND f.tipo_venta = 'credito'
ORDER BY dias_vencidos DESC;

-- Vista de resumen de ventas diarias
CREATE OR REPLACE VIEW v_ventas_diarias AS
SELECT 
    DATE(fecha_emision) as fecha,
    COUNT(*) as cantidad_facturas,
    SUM(subtotal) as subtotal,
    SUM(itbis) as itbis,
    SUM(total) as total,
    SUM(CASE WHEN tipo_venta = 'contado' THEN total ELSE 0 END) as ventas_contado,
    SUM(CASE WHEN tipo_venta = 'credito' THEN total ELSE 0 END) as ventas_credito
FROM facturas
WHERE anulada = false
GROUP BY DATE(fecha_emision)
ORDER BY fecha DESC;

-- ============================================
-- PROCEDIMIENTOS ALMACENADOS ÚTILES
-- ============================================

-- Procedimiento para actualizar días vencidos en cuentas por cobrar
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_actualizar_dias_vencidos()
BEGIN
    UPDATE cuentas_por_cobrar
    SET dias_vencido = DATEDIFF(CURDATE(), fecha_vencimiento)
    WHERE balance_pendiente > 0
    AND estado != 'cobrada';
    
    UPDATE cuentas_por_cobrar
    SET estado = CASE
        WHEN balance_pendiente <= 0 THEN 'cobrada'
        WHEN dias_vencido > 0 THEN 'vencida'
        ELSE 'vigente'
    END
    WHERE balance_pendiente > 0;
END //
DELIMITER ;

-- Procedimiento para generar reporte de ventas por período
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_reporte_ventas(
    IN fecha_inicio DATE,
    IN fecha_fin DATE
)
BEGIN
    SELECT 
        DATE(f.fecha_emision) as fecha,
        COUNT(DISTINCT f.id) as num_facturas,
        COUNT(DISTINCT f.cliente_id) as num_clientes,
        SUM(f.subtotal) as subtotal,
        SUM(f.itbis) as itbis,
        SUM(f.descuento) as descuentos,
        SUM(f.total) as total,
        AVG(f.total) as ticket_promedio,
        SUM(CASE WHEN f.tipo_venta = 'contado' THEN f.total ELSE 0 END) as ventas_contado,
        SUM(CASE WHEN f.tipo_venta = 'credito' THEN f.total ELSE 0 END) as ventas_credito
    FROM facturas f
    WHERE f.fecha_emision BETWEEN fecha_inicio AND fecha_fin
    AND f.anulada = false
    GROUP BY DATE(f.fecha_emision)
    ORDER BY fecha DESC;
END //
DELIMITER ;

-- Procedimiento para calcular valorización de inventario
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_valorizacion_inventario(
    IN categoria_id_param INT
)
BEGIN
    SELECT 
        p.id,
        p.codigo,
        p.nombre,
        c.nombre as categoria,
        p.stock_actual,
        p.costo_promedio,
        p.precio_venta,
        (p.stock_actual * p.costo_promedio) as valor_costo,
        (p.stock_actual * p.precio_venta) as valor_venta,
        ((p.stock_actual * p.precio_venta) - (p.stock_actual * p.costo_promedio)) as margen_potencial
    FROM productos p
    LEFT JOIN categorias c ON p.categoria_id = c.id
    WHERE p.activo = true
    AND (categoria_id_param IS NULL OR p.categoria_id = categoria_id_param)
    ORDER BY valor_costo DESC;
END //
DELIMITER ;

-- ============================================
-- TRIGGERS PARA AUDITORÍA AUTOMÁTICA
-- ============================================

-- Trigger para auditar creación de facturas
DELIMITER //
CREATE TRIGGER IF NOT EXISTS trg_auditoria_factura_insert
AFTER INSERT ON facturas
FOR EACH ROW
BEGIN
    INSERT INTO auditoria (tabla, accion, registro_id, usuario_id, datos_nuevos)
    VALUES (
        'facturas',
        'CREATE',
        NEW.id,
        NEW.vendedor_id,
        JSON_OBJECT(
            'numero_factura', NEW.numero_factura,
            'ncf', NEW.ncf,
            'cliente_id', NEW.cliente_id,
            'total', NEW.total,
            'tipo_venta', NEW.tipo_venta
        )
    );
END //
DELIMITER ;

-- Trigger para auditar anulación de facturas
DELIMITER //
CREATE TRIGGER IF NOT EXISTS trg_auditoria_factura_anular
AFTER UPDATE ON facturas
FOR EACH ROW
BEGIN
    IF NEW.anulada = true AND OLD.anulada = false THEN
        INSERT INTO auditoria (tabla, accion, registro_id, usuario_id, datos_anteriores, datos_nuevos)
        VALUES (
            'facturas',
            'ANULAR',
            NEW.id,
            NEW.vendedor_id,
            JSON_OBJECT('estado', OLD.estado, 'anulada', OLD.anulada),
            JSON_OBJECT(
                'estado', NEW.estado,
                'anulada', NEW.anulada,
                'motivo_anulacion', NEW.motivo_anulacion,
                'fecha_anulacion', NEW.fecha_anulacion
            )
        );
    END IF;
END //
DELIMITER ;

-- ============================================
-- EVENTOS PROGRAMADOS (OPCIONAL)
-- ============================================

-- Activar el programador de eventos
SET GLOBAL event_scheduler = ON;

-- Evento para actualizar días vencidos diariamente
CREATE EVENT IF NOT EXISTS evt_actualizar_dias_vencidos
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_DATE + INTERVAL 1 DAY
DO CALL sp_actualizar_dias_vencidos();

-- ============================================
-- PERMISOS Y SEGURIDAD
-- ============================================

-- Crear usuario de aplicación (recomendado para producción)
-- CREATE USER IF NOT EXISTS 'erp_app'@'localhost' IDENTIFIED BY 'password_seguro_aqui';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON erp_crm_db.* TO 'erp_app'@'localhost';
-- FLUSH PRIVILEGES;

-- ============================================
-- INFORMACIÓN Y VERSIÓN
-- ============================================

CREATE TABLE IF NOT EXISTS sistema_info (
    clave VARCHAR(50) PRIMARY KEY,
    valor TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO sistema_info (clave, valor) VALUES
('version', '1.0.0'),
('etapa', 'Etapa 5 - Facturación con NCF'),
('fecha_instalacion', NOW()),
('ultima_actualizacion', NOW())
ON DUPLICATE KEY UPDATE valor=VALUES(valor), updated_at=NOW();

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

SELECT 'Base de datos ERP/CRM creada exitosamente con tabla de auditoría' as Mensaje;