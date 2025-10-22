// backend/src/scripts/testDashboard.js
// Script para probar todos los endpoints del dashboard

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Datos de login (ajusta según tu BD)
const credentials = {
  email: 'admin@test.com',
  password: 'password123',
};

let token = null;
let empresaId = null;

/**
 * Login y obtener token
 */
async function login() {
  try {
    console.log('🔐 Inicando sesión...');
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    
    token = response.data.data.token;
    empresaId = response.data.data.usuario.empresa_id;
    
    console.log('✅ Sesión iniciada');
    console.log(`Token: ${token.substring(0, 20)}...`);
    console.log(`Empresa ID: ${empresaId}\n`);
    
    return { token, empresaId };
  } catch (error) {
    console.error('❌ Error al iniciar sesión:', error.response?.data || error.message);
    process.exit(1);
  }
}

/**
 * Realizar petición a API
 */
async function makeRequest(endpoint, params = {}) {
  try {
    const url = `${API_URL}/dashboard${endpoint}`;
    console.log(`📊 GET ${endpoint}`);
    
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    });
    
    console.log(`✅ Respuesta:`, JSON.stringify(response.data.data, null, 2));
    console.log('\n');
    
    return response.data.data;
  } catch (error) {
    console.error(`❌ Error:`, error.response?.data || error.message);
    console.log('\n');
  }
}

/**
 * Ejecutar todas las pruebas
 */
async function runTests() {
  try {
    // Login
    await login();

    console.log('═══════════════════════════════════════════════════════════');
    console.log('        PRUEBAS DE ENDPOINTS DEL DASHBOARD');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Resumen ejecutivo
    console.log('1️⃣ RESUMEN EJECUTIVO');
    console.log('─────────────────────────────────────────────────────────');
    await makeRequest('/summary', {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date(),
    });

    // Métricas de ventas
    console.log('2️⃣ MÉTRICAS DE VENTAS');
    console.log('─────────────────────────────────────────────────────────');
    await makeRequest('/sales-metrics', {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date(),
    });

    // Métricas de gastos
    console.log('3️⃣ MÉTRICAS DE GASTOS');
    console.log('─────────────────────────────────────────────────────────');
    await makeRequest('/expenses-metrics', {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date(),
    });

    // Análisis de rentabilidad
    console.log('4️⃣ ANÁLISIS DE RENTABILIDAD');
    console.log('─────────────────────────────────────────────────────────');
    await makeRequest('/profit-analysis', {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date(),
    });

    // Flujo de caja
    console.log('5️⃣ FLUJO DE CAJA');
    console.log('─────────────────────────────────────────────────────────');
    await makeRequest('/cash-flow', {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date(),
    });

    // Análisis de cuentas
    console.log('6️⃣ ANÁLISIS DE CUENTAS (Cobrar/Pagar)');
    console.log('─────────────────────────────────────────────────────────');
    await makeRequest('/accounts', {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date(),
    });

    // Análisis de inventario
    console.log('7️⃣ ANÁLISIS DE INVENTARIO');
    console.log('─────────────────────────────────────────────────────────');
    await makeRequest('/inventory-analysis', {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date(),
    });

    // Desempeño de empleados
    console.log('8️⃣ DESEMPEÑO DE EMPLEADOS');
    console.log('─────────────────────────────────────────────────────────');
    await makeRequest('/employee-performance', {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date(),
      limit: 10,
    });

    // Tendencia de ventas
    console.log('9️⃣ TENDENCIA DE VENTAS (Últimos 30 días)');
    console.log('─────────────────────────────────────────────────────────');
    await makeRequest('/sales-trend', {
      days: 30,
    });

    // Detalles de ventas por vendedor
    console.log('🔟 DETALLES DE VENTAS POR VENDEDOR');
    console.log('─────────────────────────────────────────────────────────');
    await makeRequest('/sales-detail', {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date(),
      groupBy: 'vendedor',
      limit: 10,
    });

    // Detalles de ventas por cliente
    console.log('1️⃣1️⃣ DETALLES DE VENTAS POR CLIENTE');
    console.log('─────────────────────────────────────────────────────────');
    await makeRequest('/sales-detail', {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date(),
      groupBy: 'cliente',
      limit: 10,
    });

    // Detalles de ventas por producto
    console.log('1️⃣2️⃣ DETALLES DE VENTAS POR PRODUCTO');
    console.log('─────────────────────────────────────────────────────────');
    await makeRequest('/sales-detail', {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date(),
      groupBy: 'producto',
      limit: 10,
    });

    // Top productos
    console.log('1️⃣3️⃣ TOP PRODUCTOS MÁS VENDIDOS');
    console.log('─────────────────────────────────────────────────────────');
    await makeRequest('/top-products', {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date(),
      limit: 10,
    });

    // Top clientes
    console.log('1️⃣4️⃣ TOP CLIENTES POR VENTAS');
    console.log('─────────────────────────────────────────────────────────');
    await makeRequest('/top-customers', {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date(),
      limit: 10,
    });

    // Comparación de períodos
    console.log('1️⃣5️⃣ COMPARACIÓN MES ACTUAL vs ANTERIOR');
    console.log('─────────────────────────────────────────────────────────');
    await makeRequest('/comparison');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ TODAS LAS PRUEBAS COMPLETADAS');
    console.log('═══════════════════════════════════════════════════════════');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error general:', error);
    process.exit(1);
  }
}

// Ejecutar pruebas
runTests();