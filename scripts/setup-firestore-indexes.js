#!/usr/bin/env node

/**
 * Script para configurar índices de Firestore automáticamente
 * Ejecutar con: node scripts/setup-firestore-indexes.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando índices de Firestore para ZADIA OS...\n');

// Verificar que existe el archivo de configuración
const indexesFile = path.join(__dirname, '..', 'firestore.indexes.json');
if (!fs.existsSync(indexesFile)) {
  console.error('❌ No se encontró el archivo firestore.indexes.json');
  process.exit(1);
}

try {
  // Validar JSON
  const indexesContent = fs.readFileSync(indexesFile, 'utf8');
  const indexes = JSON.parse(indexesContent);
  
  console.log(`✅ Archivo de índices válido con ${indexes.indexes.length} índices definidos\n`);
  
  // Mostrar índices de inventario
  const inventoryIndexes = indexes.indexes.filter(idx => 
    idx.collectionGroup.includes('inventory') || 
    idx.collectionGroup.includes('bill-of-materials')
  );
  
  if (inventoryIndexes.length > 0) {
    console.log('📦 Índices de inventario encontrados:');
    inventoryIndexes.forEach(idx => {
      console.log(`   - ${idx.collectionGroup}: ${idx.fields?.map(f => f.fieldPath).join(', ') || 'array index'}`);
    });
    console.log('');
  }
  
  // Intentar desplegar índices
  console.log('🚀 Desplegando índices en Firebase...\n');
  
  const output = execSync('firebase deploy --only firestore:indexes', {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  console.log(output);
  console.log('✅ Índices desplegados exitosamente!\n');
  
  // Mensaje informativo
  console.log('📝 Información importante:');
  console.log('   • Los índices pueden tardar varios minutos en construirse');
  console.log('   • Puedes monitorear el progreso en Firebase Console');
  console.log('   • Las consultas complejas no funcionarán hasta que se completen');
  console.log('   • El sistema usa consultas simplificadas como respaldo\n');
  
} catch (error) {
  if (error.status === 1 && error.stderr) {
    console.log('⚠️  Error al desplegar índices:', error.stderr);
    console.log('\n🔗 Para crear índices manualmente, visita:');
    console.log('   https://console.firebase.google.com/project/zadia-os-885k8/firestore/indexes\n');
    
    console.log('📋 Índices requeridos para inventario:');
    console.log('   1. Collection: inventory-alerts');
    console.log('      Fields: isRead (Ascending), createdAt (Descending)');
    console.log('   2. Collection: inventory-movements'); 
    console.log('      Fields: itemId (Ascending), performedAt (Descending)');
    console.log('   3. Collection: bill-of-materials');
    console.log('      Fields: finishedProductId (Ascending), isActive (Ascending)\n');
  } else {
    console.error('❌ Error inesperado:', error.message);
  }
  
  process.exit(1);
}