CREATE DATABASE  IF NOT EXISTS `erp_crm_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `erp_crm_db`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: erp_crm_db
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activos`
--

DROP TABLE IF EXISTS `activos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `categoria` enum('edificio','vehiculo','maquinaria','equipo','mueble','tecnologia') COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor_compra` decimal(12,2) NOT NULL,
  `fecha_compra` date NOT NULL,
  `vida_util_años` int DEFAULT NULL,
  `depreciacion_anual` decimal(12,2) DEFAULT NULL,
  `depreciacion_acumulada` decimal(12,2) DEFAULT '0.00',
  `valor_residual` decimal(12,2) DEFAULT NULL,
  `estado` enum('activo','en_reparacion','dado_de_baja') COLLATE utf8mb4_unicode_ci DEFAULT 'activo',
  `ubicacion` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `responsable_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `responsable_id` (`responsable_id`),
  CONSTRAINT `activos_ibfk_1` FOREIGN KEY (`responsable_id`) REFERENCES `empleados` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activos`
--

LOCK TABLES `activos` WRITE;
/*!40000 ALTER TABLE `activos` DISABLE KEYS */;
/*!40000 ALTER TABLE `activos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auditoria`
--

DROP TABLE IF EXISTS `auditoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auditoria` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tabla` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre de la tabla afectada',
  `accion` enum('CREATE','UPDATE','DELETE','ANULAR','LOGIN','LOGOUT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `registro_id` int NOT NULL COMMENT 'ID del registro afectado',
  `usuario_id` int DEFAULT NULL COMMENT 'Usuario que ejecutó la acción',
  `datos_anteriores` json DEFAULT NULL COMMENT 'Estado anterior del registro',
  `datos_nuevos` json DEFAULT NULL COMMENT 'Estado nuevo del registro',
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Dirección IP del usuario',
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Navegador/dispositivo',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tabla` (`tabla`),
  KEY `idx_usuario` (`usuario_id`),
  KEY `idx_fecha` (`created_at`),
  KEY `idx_accion` (`accion`),
  KEY `idx_registro` (`tabla`,`registro_id`),
  CONSTRAINT `auditoria_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de auditoría del sistema';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditoria`
--

LOCK TABLES `auditoria` WRITE;
/*!40000 ALTER TABLE `auditoria` DISABLE KEYS */;
/*!40000 ALTER TABLE `auditoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `categoria_padre_id` int DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `categoria_padre_id` (`categoria_padre_id`),
  CONSTRAINT `categorias_ibfk_1` FOREIGN KEY (`categoria_padre_id`) REFERENCES `categorias` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (1,'Ferretería','Productos de ferretería en general',NULL,1,'2025-10-05 19:27:39','2025-10-05 19:27:39'),(2,'Herramientas','Herramientas manuales y eléctricas',NULL,1,'2025-10-05 19:27:39','2025-10-05 19:27:39'),(3,'Construcción','Materiales de construcción',NULL,1,'2025-10-05 19:27:39','2025-10-05 19:27:39'),(4,'Electricidad','Productos eléctricos',NULL,1,'2025-10-05 19:27:39','2025-10-05 19:27:39'),(5,'Plomería','Productos de plomería',NULL,1,'2025-10-05 19:27:39','2025-10-05 19:27:39'),(6,'Pintura','Pinturas y accesorios',NULL,1,'2025-10-05 19:27:39','2025-10-05 19:27:39'),(7,'Cerrajería','Cerraduras y candados',NULL,1,'2025-10-05 19:27:39','2025-10-05 19:27:39');
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo_cliente` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_identificacion` enum('RNC','CEDULA','PASAPORTE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `numero_identificacion` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_comercial` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `razon_social` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `celular` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` text COLLATE utf8mb4_unicode_ci,
  `ciudad` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `provincia` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `limite_credito` decimal(12,2) DEFAULT '0.00',
  `balance_actual` decimal(12,2) DEFAULT '0.00',
  `dias_credito` int DEFAULT '0',
  `tipo_cliente` enum('contado','credito','ambos') COLLATE utf8mb4_unicode_ci DEFAULT 'contado',
  `activo` tinyint(1) DEFAULT '1',
  `notas` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo_cliente` (`codigo_cliente`),
  UNIQUE KEY `numero_identificacion` (`numero_identificacion`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes`
--

LOCK TABLES `clientes` WRITE;
/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;
INSERT INTO `clientes` VALUES (1,'CLI-00001','CEDULA','46456464','SUPUTAMADRE','COMPRADOR','SUPU@gmail.com','54465464654','5416464564','','','',0.00,-550.00,0,'contado',1,'','2025-10-05 19:31:54','2025-10-05 19:34:06'),(2,'CLI-00002','CEDULA','546464519','POPOLONY','POPOLONY','popo@gmail.com','','','','','',0.00,0.00,0,'contado',1,'','2025-10-05 23:27:14','2025-10-06 14:58:27'),(3,'CLI-00000','CEDULA','00000000000','CONSUMIDOR FINAL','CONSUMIDOR FINAL',NULL,NULL,NULL,NULL,NULL,NULL,0.00,-199.99,0,'contado',1,NULL,'2025-10-06 12:52:34','2025-10-06 14:43:10');
/*!40000 ALTER TABLE `clientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `compras`
--

DROP TABLE IF EXISTS `compras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compras` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero_compra` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `proveedor_id` int NOT NULL,
  `ncf_proveedor` varchar(19) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_compra` date NOT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `tipo_compra` enum('contado','credito') COLLATE utf8mb4_unicode_ci DEFAULT 'contado',
  `subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `itbis` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `estado` enum('pendiente','recibida','cancelada') COLLATE utf8mb4_unicode_ci DEFAULT 'pendiente',
  `notas` text COLLATE utf8mb4_unicode_ci,
  `usuario_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_compra` (`numero_compra`),
  KEY `proveedor_id` (`proveedor_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `compras_ibfk_1` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `compras_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compras`
--

LOCK TABLES `compras` WRITE;
/*!40000 ALTER TABLE `compras` DISABLE KEYS */;
/*!40000 ALTER TABLE `compras` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cuentas_por_cobrar`
--

DROP TABLE IF EXISTS `cuentas_por_cobrar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cuentas_por_cobrar` (
  `id` int NOT NULL AUTO_INCREMENT,
  `factura_id` int NOT NULL,
  `cliente_id` int NOT NULL,
  `monto_original` decimal(12,2) NOT NULL,
  `monto_pagado` decimal(12,2) DEFAULT '0.00',
  `balance_pendiente` decimal(12,2) NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `dias_vencido` int DEFAULT '0',
  `estado` enum('vigente','vencida','cobrada') COLLATE utf8mb4_unicode_ci DEFAULT 'vigente',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `factura_id` (`factura_id`),
  KEY `cliente_id` (`cliente_id`),
  CONSTRAINT `cuentas_por_cobrar_ibfk_1` FOREIGN KEY (`factura_id`) REFERENCES `facturas` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `cuentas_por_cobrar_ibfk_2` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cuentas_por_cobrar`
--

LOCK TABLES `cuentas_por_cobrar` WRITE;
/*!40000 ALTER TABLE `cuentas_por_cobrar` DISABLE KEYS */;
INSERT INTO `cuentas_por_cobrar` VALUES (1,1,1,1416.00,0.01,866.00,'2025-10-06',0,'vigente','2025-10-05 19:33:09','2025-10-05 19:34:06'),(2,4,3,708.00,0.00,508.00,'2025-10-05',0,'vigente','2025-10-06 14:42:55','2025-10-06 14:43:10'),(3,5,2,236.00,0.00,236.00,'2025-10-07',0,'vigente','2025-10-06 14:58:27','2025-10-06 14:58:27');
/*!40000 ALTER TABLE `cuentas_por_cobrar` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cuentas_por_pagar`
--

DROP TABLE IF EXISTS `cuentas_por_pagar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cuentas_por_pagar` (
  `id` int NOT NULL AUTO_INCREMENT,
  `compra_id` int NOT NULL,
  `proveedor_id` int NOT NULL,
  `monto_original` decimal(12,2) NOT NULL,
  `monto_pagado` decimal(12,2) DEFAULT '0.00',
  `balance_pendiente` decimal(12,2) NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `dias_vencido` int DEFAULT '0',
  `estado` enum('vigente','vencida','pagada') COLLATE utf8mb4_unicode_ci DEFAULT 'vigente',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `compra_id` (`compra_id`),
  KEY `proveedor_id` (`proveedor_id`),
  CONSTRAINT `cuentas_por_pagar_ibfk_1` FOREIGN KEY (`compra_id`) REFERENCES `compras` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `cuentas_por_pagar_ibfk_2` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cuentas_por_pagar`
--

LOCK TABLES `cuentas_por_pagar` WRITE;
/*!40000 ALTER TABLE `cuentas_por_pagar` DISABLE KEYS */;
/*!40000 ALTER TABLE `cuentas_por_pagar` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_compras`
--

DROP TABLE IF EXISTS `detalle_compras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_compras` (
  `id` int NOT NULL AUTO_INCREMENT,
  `compra_id` int NOT NULL,
  `producto_id` int NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(12,2) NOT NULL,
  `itbis_porcentaje` decimal(5,2) DEFAULT '18.00',
  `itbis_monto` decimal(12,2) DEFAULT '0.00',
  `subtotal` decimal(12,2) NOT NULL,
  `total` decimal(12,2) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `compra_id` (`compra_id`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `detalle_compras_ibfk_1` FOREIGN KEY (`compra_id`) REFERENCES `compras` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `detalle_compras_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_compras`
--

LOCK TABLES `detalle_compras` WRITE;
/*!40000 ALTER TABLE `detalle_compras` DISABLE KEYS */;
/*!40000 ALTER TABLE `detalle_compras` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_facturas`
--

DROP TABLE IF EXISTS `detalle_facturas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_facturas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `factura_id` int NOT NULL,
  `producto_id` int NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(12,2) NOT NULL,
  `descuento` decimal(12,2) DEFAULT '0.00',
  `itbis_porcentaje` decimal(5,2) DEFAULT '18.00',
  `itbis_monto` decimal(12,2) DEFAULT '0.00',
  `subtotal` decimal(12,2) NOT NULL,
  `total` decimal(12,2) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `factura_id` (`factura_id`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `detalle_facturas_ibfk_1` FOREIGN KEY (`factura_id`) REFERENCES `facturas` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `detalle_facturas_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_facturas`
--

LOCK TABLES `detalle_facturas` WRITE;
/*!40000 ALTER TABLE `detalle_facturas` DISABLE KEYS */;
INSERT INTO `detalle_facturas` VALUES (1,1,2,10,120.00,0.00,18.00,216.00,1200.00,1416.00,'2025-10-05 19:33:09'),(2,2,2,1,120.00,0.00,18.00,21.60,120.00,141.60,'2025-10-05 23:26:18'),(3,3,1,1,50.00,0.00,18.00,9.00,50.00,59.00,'2025-10-05 23:27:25'),(4,4,2,5,120.00,0.00,18.00,108.00,600.00,708.00,'2025-10-06 14:42:55'),(5,5,4,10,20.00,0.00,18.00,36.00,200.00,236.00,'2025-10-06 14:58:27'),(6,6,1,2,50.00,0.00,18.00,18.00,100.00,118.00,'2025-10-06 17:10:10'),(7,7,3,1,200.00,0.00,18.00,36.00,200.00,236.00,'2025-10-06 22:33:42'),(8,8,3,2,200.00,0.00,18.00,72.00,400.00,472.00,'2025-10-06 22:41:46'),(9,9,3,1,200.00,0.00,18.00,36.00,200.00,236.00,'2025-10-07 11:43:20');
/*!40000 ALTER TABLE `detalle_facturas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `empleados`
--

DROP TABLE IF EXISTS `empleados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `empleados` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int DEFAULT NULL,
  `codigo_empleado` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_completo` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cedula` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `direccion` text COLLATE utf8mb4_unicode_ci,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cargo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `departamento` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `salario` decimal(12,2) DEFAULT NULL,
  `fecha_ingreso` date NOT NULL,
  `estado` enum('activo','inactivo','suspendido') COLLATE utf8mb4_unicode_ci DEFAULT 'activo',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo_empleado` (`codigo_empleado`),
  UNIQUE KEY `cedula` (`cedula`),
  UNIQUE KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `empleados_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empleados`
--

LOCK TABLES `empleados` WRITE;
/*!40000 ALTER TABLE `empleados` DISABLE KEYS */;
/*!40000 ALTER TABLE `empleados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `facturas`
--

DROP TABLE IF EXISTS `facturas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `facturas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero_factura` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ncf` varchar(19) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_ncf` enum('B01','B02','B14','B15','B16') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cliente_id` int NOT NULL,
  `fecha_emision` date NOT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `tipo_venta` enum('contado','credito') COLLATE utf8mb4_unicode_ci DEFAULT 'contado',
  `moneda` enum('DOP','USD') COLLATE utf8mb4_unicode_ci DEFAULT 'DOP',
  `subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `descuento` decimal(12,2) DEFAULT '0.00',
  `itbis` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `monto_pagado` decimal(12,2) DEFAULT '0.00',
  `balance_pendiente` decimal(12,2) DEFAULT '0.00',
  `estado` enum('pendiente','pagada','parcial','vencida','anulada') COLLATE utf8mb4_unicode_ci DEFAULT 'pendiente',
  `notas` text COLLATE utf8mb4_unicode_ci,
  `vendedor_id` int DEFAULT NULL,
  `anulada` tinyint(1) DEFAULT '0',
  `motivo_anulacion` text COLLATE utf8mb4_unicode_ci,
  `fecha_anulacion` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_factura` (`numero_factura`),
  UNIQUE KEY `ncf` (`ncf`),
  KEY `cliente_id` (`cliente_id`),
  KEY `vendedor_id` (`vendedor_id`),
  CONSTRAINT `facturas_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `facturas_ibfk_2` FOREIGN KEY (`vendedor_id`) REFERENCES `usuarios` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `facturas`
--

LOCK TABLES `facturas` WRITE;
/*!40000 ALTER TABLE `facturas` DISABLE KEYS */;
INSERT INTO `facturas` VALUES (1,'FAC-00001','B0200000001','B02',1,'2025-10-05','2025-10-06','credito','DOP',1200.00,0.00,216.00,1416.00,0.01,866.00,'parcial','',1,0,NULL,NULL,'2025-10-05 19:33:09','2025-10-05 19:34:06'),(2,'FAC-00002','B0200000002','B02',1,'2025-10-06',NULL,'contado','DOP',120.00,0.00,21.60,141.60,141.60,0.00,'pagada','Venta POS',1,0,NULL,NULL,'2025-10-05 23:26:18','2025-10-05 23:26:18'),(3,'FAC-00003','B0200000003','B02',1,'2025-10-06',NULL,'contado','DOP',50.00,0.00,9.00,59.00,59.00,0.00,'pagada','Venta POS',1,0,NULL,NULL,'2025-10-05 23:27:25','2025-10-05 23:27:25'),(4,'FAC-00004','B0200000004','B02',3,'2025-10-06','2025-10-05','credito','DOP',600.00,0.00,108.00,708.00,0.00,508.00,'parcial','',1,0,NULL,NULL,'2025-10-06 14:42:55','2025-10-06 14:43:10'),(5,'FAC-00005','B0200000005','B02',2,'2025-10-06','2025-10-07','credito','DOP',200.00,0.00,36.00,236.00,0.00,236.00,'pendiente','',1,0,NULL,NULL,'2025-10-06 14:58:27','2025-10-06 14:58:27'),(6,'FAC-00006','B0200000006','B02',2,'2025-10-06',NULL,'contado','DOP',100.00,0.00,18.00,118.00,118.00,0.00,'pagada','Venta POS',1,0,NULL,NULL,'2025-10-06 17:10:10','2025-10-06 17:10:10'),(7,'FAC-00007','B0200000007','B02',3,'2025-10-07',NULL,'contado','DOP',200.00,0.00,36.00,236.00,236.00,0.00,'pagada','Venta POS - Usuario: Administrador Sistema',1,0,NULL,NULL,'2025-10-06 22:33:42','2025-10-06 22:33:42'),(8,'FAC-00008','B0200000008','B02',3,'2025-10-07',NULL,'contado','DOP',400.00,0.00,72.00,472.00,472.00,0.00,'pagada','Venta POS - Usuario: Administrador Sistema',1,0,NULL,NULL,'2025-10-06 22:41:46','2025-10-06 22:41:46'),(9,'FAC-00009','B0200000009','B02',3,'2025-10-07',NULL,'contado','DOP',200.00,0.00,36.00,236.00,236.00,0.00,'pagada','Venta POS - Usuario: Administrador Sistema',1,0,NULL,NULL,'2025-10-07 11:43:20','2025-10-07 11:43:20');
/*!40000 ALTER TABLE `facturas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimientos_inventario`
--

DROP TABLE IF EXISTS `movimientos_inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimientos_inventario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `producto_id` int NOT NULL,
  `tipo_movimiento` enum('entrada','salida','ajuste') COLLATE utf8mb4_unicode_ci NOT NULL,
  `cantidad` int NOT NULL,
  `costo_unitario` decimal(12,2) DEFAULT NULL,
  `documento_referencia` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `motivo` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `usuario_id` int DEFAULT NULL,
  `fecha_movimiento` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `producto_id` (`producto_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `movimientos_inventario_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `movimientos_inventario_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimientos_inventario`
--

LOCK TABLES `movimientos_inventario` WRITE;
/*!40000 ALTER TABLE `movimientos_inventario` DISABLE KEYS */;
INSERT INTO `movimientos_inventario` VALUES (1,2,'salida',10,50.00,'','Devolución, llegaron 10 llave de cubo no ajustables ',1,'2025-10-05 19:30:13'),(2,2,'entrada',10,50.00,'','ajuste de la devolución de las 10 llaves de cubo que llegaron por error',1,'2025-10-05 19:30:55'),(3,2,'salida',10,NULL,'FAC-00001','Venta - Factura FAC-00001',1,'2025-10-05 19:33:09'),(4,2,'salida',1,NULL,'FAC-00002','Venta - Factura FAC-00002',1,'2025-10-05 23:26:18'),(5,1,'salida',1,NULL,'FAC-00003','Venta - Factura FAC-00003',1,'2025-10-05 23:27:25'),(6,2,'salida',5,NULL,'FAC-00004','Venta - Factura FAC-00004',1,'2025-10-06 14:42:55'),(7,4,'salida',10,NULL,'FAC-00005','Venta - Factura FAC-00005',1,'2025-10-06 14:58:27'),(8,4,'entrada',69,10.00,'','Compra Cable 12',1,'2025-10-06 14:59:52'),(9,1,'salida',2,NULL,'FAC-00006','Venta - Factura FAC-00006',1,'2025-10-06 17:10:10'),(10,3,'salida',1,NULL,'FAC-00007','Venta - Factura FAC-00007',1,'2025-10-06 22:33:42'),(11,3,'salida',2,NULL,'FAC-00008','Venta - Factura FAC-00008',1,'2025-10-06 22:41:46'),(12,3,'entrada',10,20.00,'','compra ',1,'2025-10-07 11:02:17'),(13,3,'salida',1,NULL,'FAC-00009','Venta - Factura FAC-00009',1,'2025-10-07 11:43:20');
/*!40000 ALTER TABLE `movimientos_inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ncf`
--

DROP TABLE IF EXISTS `ncf`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ncf` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo_ncf` enum('B01','B02','B14','B15','B16') COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion_tipo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `secuencia_desde` varchar(11) COLLATE utf8mb4_unicode_ci NOT NULL,
  `secuencia_hasta` varchar(11) COLLATE utf8mb4_unicode_ci NOT NULL,
  `secuencia_actual` varchar(11) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `agotado` tinyint(1) DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ncf`
--

LOCK TABLES `ncf` WRITE;
/*!40000 ALTER TABLE `ncf` DISABLE KEYS */;
INSERT INTO `ncf` VALUES (1,'B01','Crédito Fiscal','B0100000001','B0100001000','B0100000001','2026-10-05',1,0,'2025-10-05 19:27:39','2025-10-05 19:27:39'),(2,'B02','Consumo','B0200000001','B0200005000','B0200000010','2026-10-05',1,0,'2025-10-05 19:27:39','2025-10-07 11:43:20'),(3,'B14','Regímenes Especiales','B1400000001','B1400000500','B1400000001','2026-10-05',1,0,'2025-10-05 19:27:39','2025-10-05 19:27:39');
/*!40000 ALTER TABLE `ncf` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nomina`
--

DROP TABLE IF EXISTS `nomina`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nomina` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empleado_id` int NOT NULL,
  `periodo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `salario_base` decimal(12,2) NOT NULL,
  `bonificaciones` decimal(12,2) DEFAULT '0.00',
  `horas_extra` decimal(12,2) DEFAULT '0.00',
  `deducciones` decimal(12,2) DEFAULT '0.00',
  `seguro_social` decimal(12,2) DEFAULT '0.00',
  `afp` decimal(12,2) DEFAULT '0.00',
  `isr` decimal(12,2) DEFAULT '0.00',
  `salario_neto` decimal(12,2) NOT NULL,
  `estado` enum('borrador','aprobada','pagada') COLLATE utf8mb4_unicode_ci DEFAULT 'borrador',
  `fecha_pago` date DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `empleado_id` (`empleado_id`),
  CONSTRAINT `nomina_ibfk_1` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nomina`
--

LOCK TABLES `nomina` WRITE;
/*!40000 ALTER TABLE `nomina` DISABLE KEYS */;
/*!40000 ALTER TABLE `nomina` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pagos`
--

DROP TABLE IF EXISTS `pagos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `factura_id` int NOT NULL,
  `numero_recibo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_pago` date NOT NULL,
  `monto_pagado` decimal(12,2) NOT NULL,
  `metodo_pago` enum('efectivo','transferencia','cheque','tarjeta') COLLATE utf8mb4_unicode_ci NOT NULL,
  `referencia` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci,
  `usuario_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_recibo` (`numero_recibo`),
  KEY `factura_id` (`factura_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `pagos_ibfk_1` FOREIGN KEY (`factura_id`) REFERENCES `facturas` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `pagos_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagos`
--

LOCK TABLES `pagos` WRITE;
/*!40000 ALTER TABLE `pagos` DISABLE KEYS */;
INSERT INTO `pagos` VALUES (1,1,'REC-00001','2025-10-05',550.00,'efectivo','','',1,'2025-10-05 19:34:06'),(2,4,'REC-00002','2025-10-06',200.00,'efectivo','','',1,'2025-10-06 14:43:10');
/*!40000 ALTER TABLE `pagos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `presupuestos`
--

DROP TABLE IF EXISTS `presupuestos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `presupuestos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `año` int NOT NULL,
  `mes` int NOT NULL,
  `departamento` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `categoria` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `monto_presupuestado` decimal(12,2) NOT NULL,
  `monto_ejecutado` decimal(12,2) DEFAULT '0.00',
  `porcentaje_ejecutado` decimal(5,2) DEFAULT '0.00',
  `notas` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `presupuestos`
--

LOCK TABLES `presupuestos` WRITE;
/*!40000 ALTER TABLE `presupuestos` DISABLE KEYS */;
/*!40000 ALTER TABLE `presupuestos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `categoria_id` int DEFAULT NULL,
  `unidad_medida` enum('UND','KG','LB','LT','GAL','MT','CAJA','PAQUETE') COLLATE utf8mb4_unicode_ci DEFAULT 'UND',
  `precio_compra` decimal(12,2) NOT NULL DEFAULT '0.00',
  `precio_venta` decimal(12,2) NOT NULL DEFAULT '0.00',
  `precio_mayorista` decimal(12,2) DEFAULT NULL,
  `itbis_aplicable` tinyint(1) DEFAULT '1',
  `tasa_itbis` decimal(5,2) DEFAULT '18.00',
  `stock_actual` int DEFAULT '0',
  `stock_minimo` int DEFAULT '0',
  `stock_maximo` int DEFAULT '0',
  `costo_promedio` decimal(12,2) DEFAULT '0.00',
  `activo` tinyint(1) DEFAULT '1',
  `imagen_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `categoria_id` (`categoria_id`),
  KEY `idx_codigo` (`codigo`),
  KEY `idx_nombre` (`nombre`),
  CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (1,'1561616416','LLAVE 10','',2,'UND',10.00,50.00,35.00,1,18.00,7,5,100,10.00,1,'','2025-10-05 19:28:52','2025-10-06 17:10:10'),(2,'416464646','Ajustable','',2,'UND',50.00,120.00,105.00,1,18.00,34,5,100,50.00,1,'https://www.flaticon.es/icono-gratis/configuraciones_1085005?term=ajustable&page=1&position=7&origin=search&related_id=1085005','2025-10-05 19:29:29','2025-10-06 14:42:55'),(3,'46413141','LLAVE CRUZ','',2,'UND',50.00,200.00,175.00,1,18.00,11,5,100,25.00,1,'','2025-10-06 14:34:44','2025-10-07 11:43:20'),(4,'46465464','CABLE 12','',4,'MT',10.00,20.00,18.00,1,18.00,69,5,100,10.00,1,'','2025-10-06 14:57:21','2025-10-06 14:59:52');
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proveedores`
--

DROP TABLE IF EXISTS `proveedores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo_proveedor` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_identificacion` enum('RNC','CEDULA') COLLATE utf8mb4_unicode_ci NOT NULL,
  `numero_identificacion` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_comercial` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `razon_social` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `celular` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` text COLLATE utf8mb4_unicode_ci,
  `ciudad` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `provincia` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contacto_nombre` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contacto_telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dias_pago` int DEFAULT '30',
  `activo` tinyint(1) DEFAULT '1',
  `notas` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo_proveedor` (`codigo_proveedor`),
  UNIQUE KEY `numero_identificacion` (`numero_identificacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedores`
--

LOCK TABLES `proveedores` WRITE;
/*!40000 ALTER TABLE `proveedores` DISABLE KEYS */;
/*!40000 ALTER TABLE `proveedores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reporte_606`
--

DROP TABLE IF EXISTS `reporte_606`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reporte_606` (
  `id` int NOT NULL AUTO_INCREMENT,
  `compra_id` int NOT NULL,
  `rnc_cedula` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_identificacion` enum('1','2','3') COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_bienes_servicios` varchar(2) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ncf` varchar(19) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ncf_modificado` varchar(19) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_comprobante` date NOT NULL,
  `fecha_pago` date DEFAULT NULL,
  `monto_facturado` decimal(12,2) NOT NULL,
  `itbis_facturado` decimal(12,2) NOT NULL,
  `itbis_retenido` decimal(12,2) DEFAULT '0.00',
  `itbis_sujeto_proporcionalidad` decimal(12,2) DEFAULT '0.00',
  `itbis_llevado_costo` decimal(12,2) DEFAULT '0.00',
  `itbis_compensacion` decimal(12,2) DEFAULT '0.00',
  `mes_reporte` int NOT NULL,
  `año_reporte` int NOT NULL,
  `enviado_dgii` tinyint(1) DEFAULT '0',
  `fecha_envio` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `compra_id` (`compra_id`),
  CONSTRAINT `reporte_606_ibfk_1` FOREIGN KEY (`compra_id`) REFERENCES `compras` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reporte_606`
--

LOCK TABLES `reporte_606` WRITE;
/*!40000 ALTER TABLE `reporte_606` DISABLE KEYS */;
/*!40000 ALTER TABLE `reporte_606` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reporte_607`
--

DROP TABLE IF EXISTS `reporte_607`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reporte_607` (
  `id` int NOT NULL AUTO_INCREMENT,
  `factura_id` int NOT NULL,
  `rnc_cedula` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_identificacion` enum('1','2','3') COLLATE utf8mb4_unicode_ci NOT NULL,
  `ncf` varchar(19) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ncf_modificado` varchar(19) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_ingreso` varchar(2) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_comprobante` date NOT NULL,
  `fecha_retencion` date DEFAULT NULL,
  `monto_facturado` decimal(12,2) NOT NULL,
  `itbis_facturado` decimal(12,2) NOT NULL,
  `itbis_retenido` decimal(12,2) DEFAULT '0.00',
  `isr_retenido` decimal(12,2) DEFAULT '0.00',
  `impuesto_selectivo` decimal(12,2) DEFAULT '0.00',
  `otros_impuestos` decimal(12,2) DEFAULT '0.00',
  `propina_legal` decimal(12,2) DEFAULT '0.00',
  `mes_reporte` int NOT NULL,
  `año_reporte` int NOT NULL,
  `enviado_dgii` tinyint(1) DEFAULT '0',
  `fecha_envio` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `factura_id` (`factura_id`),
  CONSTRAINT `reporte_607_ibfk_1` FOREIGN KEY (`factura_id`) REFERENCES `facturas` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reporte_607`
--

LOCK TABLES `reporte_607` WRITE;
/*!40000 ALTER TABLE `reporte_607` DISABLE KEYS */;
/*!40000 ALTER TABLE `reporte_607` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reporte_608`
--

DROP TABLE IF EXISTS `reporte_608`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reporte_608` (
  `id` int NOT NULL AUTO_INCREMENT,
  `factura_id` int NOT NULL,
  `ncf` varchar(19) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_comprobante` date NOT NULL,
  `tipo_anulacion` enum('01','02','03','04') COLLATE utf8mb4_unicode_ci NOT NULL,
  `mes_reporte` int NOT NULL,
  `año_reporte` int NOT NULL,
  `enviado_dgii` tinyint(1) DEFAULT '0',
  `fecha_envio` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `factura_id` (`factura_id`),
  CONSTRAINT `reporte_608_ibfk_1` FOREIGN KEY (`factura_id`) REFERENCES `facturas` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reporte_608`
--

LOCK TABLES `reporte_608` WRITE;
/*!40000 ALTER TABLE `reporte_608` DISABLE KEYS */;
/*!40000 ALTER TABLE `reporte_608` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `permisos` json DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Administrador','Acceso total al sistema','{\"all\": true}',1,'2025-10-05 19:27:38','2025-10-05 19:27:38'),(2,'Gerente','Acceso a dashboard y reportes ejecutivos','{\"finanzas\": true, \"reportes\": true, \"dashboard\": true}',1,'2025-10-05 19:27:38','2025-10-05 19:27:38'),(3,'Vendedor','Acceso a ventas, facturación y CRM','{\"crm\": true, \"ventas\": true, \"clientes\": true}',1,'2025-10-05 19:27:38','2025-10-05 19:27:38'),(4,'Inventario','Gestión de productos e inventario','{\"compras\": true, \"productos\": true, \"inventario\": true}',1,'2025-10-05 19:27:38','2025-10-05 19:27:38'),(5,'Contabilidad','Gestión financiera y contable','{\"finanzas\": true, \"reportes\": true, \"contabilidad\": true}',1,'2025-10-05 19:27:38','2025-10-05 19:27:38'),(6,'RRHH','Gestión de recursos humanos','{\"nomina\": true, \"empleados\": true}',1,'2025-10-05 19:27:38','2025-10-05 19:27:38');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suscripciones`
--

DROP TABLE IF EXISTS `suscripciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suscripciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_nombre` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `empresa_rnc` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `plan` enum('basico','profesional','empresarial') COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuarios_permitidos` int NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `estado` enum('activa','vencida','suspendida','cancelada') COLLATE utf8mb4_unicode_ci DEFAULT 'activa',
  `monto_mensual` decimal(12,2) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `empresa_rnc` (`empresa_rnc`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suscripciones`
--

LOCK TABLES `suscripciones` WRITE;
/*!40000 ALTER TABLE `suscripciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `suscripciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre_completo` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cedula` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rol_id` int NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `ultimo_acceso` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `cedula` (`cedula`),
  KEY `rol_id` (`rol_id`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Administrador Sistema','admin@erp.com','$2a$10$GTrNE/enlwMKmo.dkO7.pONh6gP7rWuisLkOlAXuyEGOPudiDLzCC',NULL,NULL,1,1,'2025-10-07 17:18:20','2025-10-05 19:27:38','2025-10-07 17:18:20');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-07 18:49:43
