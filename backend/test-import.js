const fs = require('fs');
const path = require('path');

// Leer CSV y convertirlo a array de objetos
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');

  const productos = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const producto = {};
    headers.forEach((header, index) => {
      producto[header] = values[index];
    });
    productos.push(producto);
  }

  return productos;
}

// Simular el proceso de importación
function simularImportacion(productosCSV) {
  console.log(`\n📊 Procesando ${productosCSV.length} filas del CSV...\n`);

  // Expandir filas que tienen "tallas" (plural) en formato "36;37;38"
  const filasExpandidas = [];

  productosCSV.forEach((fila, index) => {
    // Si la fila tiene "tallas" (plural) con formato separado por punto y coma
    if (fila.tallas && typeof fila.tallas === 'string' && fila.tallas.includes(';')) {
      const tallasArray = fila.tallas.split(';').map(t => t.trim()).filter(t => t);
      console.log(`  ✓ Expandiendo SKU ${fila.sku}: ${tallasArray.length} tallas encontradas (${tallasArray.join(', ')})`);

      // Crear una fila por cada talla
      tallasArray.forEach(talla => {
        filasExpandidas.push({
          ...fila,
          talla: talla,
          tallas: undefined,
          filaOriginal: index + 2
        });
      });
    } else if (fila.tallas && typeof fila.tallas === 'string' && !fila.tallas.includes(';')) {
      // Si tiene tallas pero no tiene punto y coma, es una sola talla
      console.log(`  ✓ SKU ${fila.sku}: talla única "${fila.tallas}"`);
      filasExpandidas.push({
        ...fila,
        talla: fila.tallas,
        tallas: undefined,
        filaOriginal: index + 2
      });
    } else {
      // Si no tiene tallas o ya tiene talla (singular), usar tal cual
      console.log(`  ✓ SKU ${fila.sku}: usando talla "${fila.talla || 'Único'}"`);
      filasExpandidas.push({
        ...fila,
        filaOriginal: index + 2
      });
    }
  });

  console.log(`\n📦 Total de filas después de expandir: ${filasExpandidas.length}\n`);

  // Agrupar por SKU
  const productosPorSKU = {};
  filasExpandidas.forEach((fila) => {
    const sku = fila.sku || `TEMP-${fila.filaOriginal}`;
    if (!productosPorSKU[sku]) {
      productosPorSKU[sku] = [];
    }
    productosPorSKU[sku].push(fila);
  });

  console.log(`🎯 Productos únicos (por SKU): ${Object.keys(productosPorSKU).length}\n`);

  // Mostrar resumen de cada producto
  Object.keys(productosPorSKU).forEach(sku => {
    const variantes = productosPorSKU[sku];
    const nombre = variantes[0].nombre;
    const tallas = variantes.map(v => v.talla || 'Único').join(', ');
    console.log(`  📦 ${sku} - ${nombre}`);
    console.log(`     Variantes: ${variantes.length}`);
    console.log(`     Tallas: ${tallas}`);
    console.log('');
  });

  return productosPorSKU;
}

// Ejecutar prueba
console.log('🧪 TEST DE IMPORTACIÓN DE CSV CON TALLAS\n');
console.log('='.repeat(60));

// Probar con CSV de tallas separadas
console.log('\n1️⃣  PROBANDO: productos_tallas_separadas.csv');
console.log('='.repeat(60));
const csv1 = parseCSV('/root/Shoelandia/productos_tallas_separadas.csv');
const resultado1 = simularImportacion(csv1);

// Probar con CSV de múltiples filas
console.log('\n2️⃣  PROBANDO: productos_multiples_filas.csv');
console.log('='.repeat(60));
const csv2 = parseCSV('/root/Shoelandia/productos_multiples_filas.csv');
const resultado2 = simularImportacion(csv2);

console.log('\n✅ PRUEBA COMPLETADA');
console.log('\n💡 Próximo paso: Reinicia el servidor y prueba la importación desde el dashboard');
