const fs = require('fs');
const path = require('path');

const PRODUCTOS_FILE = path.join(__dirname, 'data', 'productos.json');

console.log('🔄 Reiniciando contadores de redes sociales...');

// Leer productos
const data = fs.readFileSync(PRODUCTOS_FILE, 'utf8');
const parsed = JSON.parse(data);

// Reiniciar contadores
parsed.productos = parsed.productos.map(producto => {
  return {
    ...producto,
    instagramShares: 0,
    facebookShares: 0
  };
});

// Guardar
fs.writeFileSync(PRODUCTOS_FILE, JSON.stringify(parsed, null, 2), 'utf8');

console.log(`✅ Contadores reiniciados para ${parsed.productos.length} productos`);
console.log('📊 Instagram: 0');
console.log('📊 Facebook: 0');
