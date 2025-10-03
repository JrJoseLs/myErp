-- Agregar cliente CONSUMIDOR FINAL
INSERT INTO clientes (
    codigo_cliente,
    tipo_identificacion,
    numero_identificacion,
    nombre_comercial,
    razon_social,
    tipo_cliente,
    activo
) VALUES (
    'CLI-00000',
    'CEDULA',
    '00000000000',
    'CONSUMIDOR FINAL',
    'CONSUMIDOR FINAL',
    'contado',
    true
);