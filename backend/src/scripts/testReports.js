// backend/src/scripts/testReports.js
// Script para probar la generación de reportes DGII

import { connectDatabase, closeDatabase } from '../config/database.js';
import {
  generateReport607,
  generateReport606,
  generateReport608,
} from '../services/reportService.js';
import {
  generate607TXT,
  generate606TXT,
  generate608TXT,
} from '../utils/txtGenerator.js';
import fs from 'fs';
import path from 'path';

const testReports = async () => {
  console.log('\n========================================');
  console.log('🧪 PRUEBA DE REPORTES DGII');
  console.log('========================================\n');

  try {
    await connectDatabase();

    // Obtener mes y año actual
    const now = new Date();
    const mes = now.getMonth() + 1; // 1-12
    const año = now.getFullYear();

    console.log(`📅 Generando reportes para: ${mes}/${año}\n`);

    // ============================================
    // REPORTE 607 (VENTAS)
    // ============================================
    console.log('📊 Generando Reporte 607 (Ventas)...');
    const report607 = await generateReport607(mes, año);
    
    console.log(`   ✅ Facturas encontradas: ${report607.length}`);
    
    if (report607.length > 0) {
      const totales607 = report607.reduce((acc, row) => {
        acc.monto += parseFloat(row.monto_facturado);
        acc.itbis += parseFloat(row.itbis_facturado);
        return acc;
      }, { monto: 0, itbis: 0 });

      console.log(`   💰 Monto total: RD$ ${totales607.monto.toFixed(2)}`);
      console.log(`   📄 ITBIS total: RD$ ${totales607.itbis.toFixed(2)}`);

      // Generar archivo TXT
      const txt607 = generate607TXT(report607, process.env.COMPANY_RNC || '000000000', mes, año);
      const dir607 = path.join(process.cwd(), 'exports', 'reports');
      
      if (!fs.existsSync(dir607)) {
        fs.mkdirSync(dir607, { recursive: true });
      }

      const file607 = path.join(dir607, `607_${año}${String(mes).padStart(2, '0')}.txt`);
      fs.writeFileSync(file607, txt607);
      console.log(`   📁 Archivo TXT generado: ${file607}\n`);
    } else {
      console.log('   ⚠️  No hay facturas para este período\n');
    }

    // ============================================
    // REPORTE 606 (COMPRAS)
    // ============================================
    console.log('📊 Generando Reporte 606 (Compras)...');
    const report606 = await generateReport606(mes, año);
    
    console.log(`   ✅ Compras encontradas: ${report606.length}`);
    
    if (report606.length > 0) {
      const totales606 = report606.reduce((acc, row) => {
        acc.monto += parseFloat(row.monto_facturado);
        acc.itbis += parseFloat(row.itbis_facturado);
        return acc;
      }, { monto: 0, itbis: 0 });

      console.log(`   💰 Monto total: RD$ ${totales606.monto.toFixed(2)}`);
      console.log(`   📄 ITBIS total: RD$ ${totales606.itbis.toFixed(2)}`);

      // Generar archivo TXT
      const txt606 = generate606TXT(report606, process.env.COMPANY_RNC || '000000000', mes, año);
      const file606 = path.join(process.cwd(), 'exports', 'reports', `606_${año}${String(mes).padStart(2, '0')}.txt`);
      fs.writeFileSync(file606, txt606);
      console.log(`   📁 Archivo TXT generado: ${file606}\n`);
    } else {
      console.log('   ⚠️  No hay compras para este período\n');
    }

    // ============================================
    // REPORTE 608 (ANULACIONES)
    // ============================================
    console.log('📊 Generando Reporte 608 (Anulaciones)...');
    const report608 = await generateReport608(mes, año);
    
    console.log(`   ✅ Anulaciones encontradas: ${report608.length}`);
    
    if (report608.length > 0) {
      // Generar archivo TXT
      const txt608 = generate608TXT(report608, process.env.COMPANY_RNC || '000000000', mes, año);
      const file608 = path.join(process.cwd(), 'exports', 'reports', `608_${año}${String(mes).padStart(2, '0')}.txt`);
      fs.writeFileSync(file608, txt608);
      console.log(`   📁 Archivo TXT generado: ${file608}\n`);
    } else {
      console.log('   ⚠️  No hay anulaciones para este período\n');
    }

    console.log('✅ Prueba de reportes completada exitosamente');
    console.log('\n💡 Tip: Los archivos TXT están listos para subir a la DGII');
    console.log('   Ubicación: exports/reports/\n');

  } catch (error) {
    console.error('\n❌ Error durante la prueba:', error.message);
    console.error(error.stack);
    throw error;
  } finally {
    await closeDatabase();
    console.log('========================================');
    console.log('👋 Prueba finalizada');
    console.log('========================================\n');
    process.exit(0);
  }
};

// Ejecutar
testReports();