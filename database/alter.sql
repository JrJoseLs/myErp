-- Versión Ultra-Robusta con Manejo de Errores (Si tu versión lo permite)
-- Este script intenta crear el índice. Si el error 1061 (Duplicado) ocurre, lo ignora y continúa.
-- Se usa un bloque de manejo de errores DYNAMIC SQL para la máxima compatibilidad.

-- 1. Definición de la Base de Datos
CREATE DATABASE IF NOT EXISTS `erp_crm_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `erp_crm_db`;

-- 2. Declarar un manejador para ignorar el error 1061 (Duplicate key name)
-- Esto permite que las sentencias ALTER TABLE se ejecuten sin detener el script si ya existen.
DELIMITER //

DROP PROCEDURE IF EXISTS `AddIndexIfNotExists` //

CREATE PROCEDURE `AddIndexIfNotExists`(
    IN tableName VARCHAR(64),
    IN indexName VARCHAR(64),
    IN indexColumns VARCHAR(255)
)
BEGIN
    DECLARE CONTINUE HANDLER FOR 1061 BEGIN END;
    
    -- La consulta verifica si el índice existe. Si no, se ejecuta el ALTER TABLE.
    -- Dado que ya sabemos que existen, la forma más sencilla es solo ejecutar el ALTER y usar el HANDLER.

    SET @s = CONCAT('ALTER TABLE ', tableName, ' ADD INDEX ', indexName, ' (', indexColumns, ')');
    PREPARE stmt FROM @s;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END //

DELIMITER ;

-- 3. Ejecutar la creación de índices usando el procedimiento
CALL AddIndexIfNotExists('facturas', 'idx_fecha_estado', 'fecha_emision, estado');
CALL AddIndexIfNotExists('facturas', 'idx_cliente_fecha', 'cliente_id, fecha_emision');
CALL AddIndexIfNotExists('productos', 'idx_activo_stock', 'activo, stock_actual');
CALL AddIndexIfNotExists('movimientos_inventario', 'idx_producto_fecha', 'producto_id, fecha_movimiento');

-- 4. Limpieza del procedimiento (Opcional)
DROP PROCEDURE IF EXISTS `AddIndexIfNotExists`;

-- 5. Finalización de Configuración
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;