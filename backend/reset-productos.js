const fs = require('fs');
const path = require('path');

// Rutas
const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTOS_FILE = path.join(DATA_DIR, 'productos.json');
const BACKUP_FILE = path.join(DATA_DIR, 'productos-backup.json');

console.log('🔄 Iniciando reseteo de productos...\n');

// 1. Hacer backup del archivo actual
if (fs.existsSync(PRODUCTOS_FILE)) {
  const contenidoActual = fs.readFileSync(PRODUCTOS_FILE, 'utf8');
  fs.writeFileSync(BACKUP_FILE, contenidoActual);
  console.log('✅ Backup creado en: productos-backup.json\n');
} else {
  console.log('⚠️  No se encontró productos.json\n');
}

// 2. Crear productos.json vacío (listo para importar desde CSV)
const productosVacios = {
  productos: [],
  counter: 1
};

fs.writeFileSync(PRODUCTOS_FILE, JSON.stringify(productosVacios, null, 2));
console.log('✅ productos.json reseteado (vacío y listo para importar CSV)\n');

console.log('✅ Proceso completado!');
console.log('\n📋 Siguientes pasos:');
console.log('1. Accede al dashboard de administración');
console.log('2. Ve a la sección de "Importar CSV"');
console.log('3. Sube tu archivo CSV con el formato correcto');
console.log('   - Formato recomendado: múltiples filas con mismo SKU, cada una con su talla');
console.log('   - O formato: una fila por producto con tallas separadas por ; (ej: 36;37;38)');
