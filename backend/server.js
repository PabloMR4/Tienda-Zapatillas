const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const app = express();
const PORT = 80;

// Rutas de archivos de datos
const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTOS_FILE = path.join(DATA_DIR, 'productos.json');
const PEDIDOS_FILE = path.join(DATA_DIR, 'pedidos.json');
const CATEGORIAS_FILE = path.join(DATA_DIR, 'categorias.json');
const DESCUENTOS_FILE = path.join(DATA_DIR, 'descuentos.json');

// Crear directorio de datos si no existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Credenciales de administrador (en producción usar base de datos)
const ADMIN_USER = {
  username: 'admin',
  password: bcrypt.hashSync('admin123', 10) // Hash de "admin123"
};

// Middleware
app.use(cors({
  origin: true, // Permitir el origen de la solicitud
  credentials: true // Permitir cookies
}));
app.use(bodyParser.json());
app.use(cookieParser());

// Configurar sesiones
app.use(session({
  secret: 'moda-store-secret-key-2024',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    httpOnly: true,
    secure: false, // Cambiar a true si usas HTTPS
    sameSite: 'lax'
  }
}));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Base de datos en memoria (productos)
let productos = [
  {
    id: 1,
    nombre: "Zapatillas Air Jordan Retro",
    precio: 189.99,
    categoria: "zapatillas",
    imagen: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=700&fit=crop",
    descripcion: "Zapatillas icónicas con diseño retro y máxima comodidad",
    tallas: ["36", "37", "38", "39", "40", "41", "42", "43"],
    nuevo: true
  },
  {
    id: 2,
    nombre: "Zapatillas Running Ultra Boost",
    precio: 159.99,
    categoria: "zapatillas",
    imagen: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&h=700&fit=crop",
    descripcion: "Tecnología de amortiguación para máximo rendimiento",
    tallas: ["36", "37", "38", "39", "40", "41", "42", "43", "44"],
    nuevo: true
  },
  {
    id: 3,
    nombre: "Zapatillas Casual Blancas Premium",
    precio: 119.99,
    categoria: "zapatillas",
    imagen: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=700&fit=crop",
    descripcion: "Minimalistas y elegantes, perfectas para el día a día",
    tallas: ["36", "37", "38", "39", "40", "41", "42"],
    nuevo: false
  },
  {
    id: 4,
    nombre: "Zapatillas High Top Negras",
    precio: 139.99,
    categoria: "zapatillas",
    imagen: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500&h=700&fit=crop",
    descripcion: "Estilo urbano con suela resistente y diseño moderno",
    tallas: ["37", "38", "39", "40", "41", "42", "43"],
    nuevo: true
  },
  {
    id: 5,
    nombre: "Bolso Tote de Cuero Camel",
    precio: 249.99,
    categoria: "bolsos",
    imagen: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=700&fit=crop",
    descripcion: "Bolso espacioso de cuero genuino de máxima calidad",
    tallas: ["Único"],
    nuevo: true
  },
  {
    id: 6,
    nombre: "Bolso Bandolera Negro Elegante",
    precio: 179.99,
    categoria: "bolsos",
    imagen: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&h=700&fit=crop",
    descripcion: "Diseño sofisticado perfecto para cualquier ocasión",
    tallas: ["Único"],
    nuevo: false
  },
  {
    id: 7,
    nombre: "Bolso Clutch de Noche Dorado",
    precio: 89.99,
    categoria: "bolsos",
    imagen: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=500&h=700&fit=crop",
    descripcion: "Pequeño y elegante, ideal para eventos especiales",
    tallas: ["Único"],
    nuevo: true
  },
  {
    id: 8,
    nombre: "Mochila de Cuero Premium",
    precio: 199.99,
    categoria: "bolsos",
    imagen: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=700&fit=crop",
    descripcion: "Funcional y elegante, perfecta para el día a día",
    tallas: ["Único"],
    nuevo: false
  },
  {
    id: 9,
    nombre: "Zapatillas Deportivas Trail",
    precio: 169.99,
    categoria: "zapatillas",
    imagen: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&h=700&fit=crop",
    descripcion: "Diseñadas para terrenos difíciles con gran agarre",
    tallas: ["38", "39", "40", "41", "42", "43", "44"],
    nuevo: false
  },
  {
    id: 10,
    nombre: "Bolso Shopper de Lona",
    precio: 69.99,
    categoria: "bolsos",
    imagen: "https://images.unsplash.com/photo-1564422170194-896b89110ef8?w=500&h=700&fit=crop",
    descripcion: "Espacioso y resistente, ideal para el día a día",
    tallas: ["Único"],
    nuevo: true
  }
];

// Base de datos en memoria (pedidos)
let pedidos = [];
let pedidoIdCounter = 1;
let productoIdCounter = 11; // Empezamos desde 11 porque ya hay 10 productos

// Base de datos en memoria (categorías)
let categorias = [
  { id: 1, nombre: 'zapatillas' },
  { id: 2, nombre: 'bolsos' }
];
let categoriaIdCounter = 3;

// Base de datos en memoria (descuentos)
let descuentos = [];
let descuentoIdCounter = 1;

// ==================== FUNCIONES DE PERSISTENCIA ====================

// Cargar datos desde archivos JSON
function cargarDatos() {
  try {
    // Cargar productos
    if (fs.existsSync(PRODUCTOS_FILE)) {
      const data = fs.readFileSync(PRODUCTOS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      productos = parsed.productos || productos;
      productoIdCounter = parsed.counter || productoIdCounter;
      console.log(`✅ ${productos.length} productos cargados`);
    }

    // Cargar pedidos
    if (fs.existsSync(PEDIDOS_FILE)) {
      const data = fs.readFileSync(PEDIDOS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      pedidos = parsed.pedidos || pedidos;
      pedidoIdCounter = parsed.counter || pedidoIdCounter;
      console.log(`✅ ${pedidos.length} pedidos cargados`);
    }

    // Cargar categorías
    if (fs.existsSync(CATEGORIAS_FILE)) {
      const data = fs.readFileSync(CATEGORIAS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      categorias = parsed.categorias || categorias;
      categoriaIdCounter = parsed.counter || categoriaIdCounter;
      console.log(`✅ ${categorias.length} categorías cargadas`);
    }

    // Cargar descuentos
    if (fs.existsSync(DESCUENTOS_FILE)) {
      const data = fs.readFileSync(DESCUENTOS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      descuentos = parsed.descuentos || descuentos;
      descuentoIdCounter = parsed.counter || descuentoIdCounter;
      console.log(`✅ ${descuentos.length} descuentos cargados`);
    }
  } catch (error) {
    console.error('❌ Error cargando datos:', error.message);
  }
}

// Guardar datos en archivos JSON
function guardarDatos() {
  try {
    // Guardar productos
    fs.writeFileSync(PRODUCTOS_FILE, JSON.stringify({
      productos,
      counter: productoIdCounter
    }, null, 2));

    // Guardar pedidos
    fs.writeFileSync(PEDIDOS_FILE, JSON.stringify({
      pedidos,
      counter: pedidoIdCounter
    }, null, 2));

    // Guardar categorías
    fs.writeFileSync(CATEGORIAS_FILE, JSON.stringify({
      categorias,
      counter: categoriaIdCounter
    }, null, 2));

    // Guardar descuentos
    fs.writeFileSync(DESCUENTOS_FILE, JSON.stringify({
      descuentos,
      counter: descuentoIdCounter
    }, null, 2));

    console.log('💾 Datos guardados correctamente');
  } catch (error) {
    console.error('❌ Error guardando datos:', error.message);
  }
}

// Cargar datos al iniciar
cargarDatos();

// Guardar datos cada 30 segundos
setInterval(guardarDatos, 30000);

// Guardar datos al cerrar el servidor
process.on('SIGINT', () => {
  console.log('\n⏹️  Cerrando servidor...');
  guardarDatos();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⏹️  Cerrando servidor...');
  guardarDatos();
  process.exit(0);
});

// Middleware de autenticación
const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.status(401).json({ mensaje: 'No autorizado' });
  }
};

// Rutas de autenticación

// Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USER.username && bcrypt.compareSync(password, ADMIN_USER.password)) {
    req.session.userId = username;
    req.session.username = username;
    res.json({ success: true, mensaje: 'Login exitoso' });
  } else {
    res.status(401).json({ success: false, mensaje: 'Credenciales incorrectas' });
  }
});

// Logout
app.post('/api/admin/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ mensaje: 'Error al cerrar sesión' });
    }
    res.json({ mensaje: 'Sesión cerrada correctamente' });
  });
});

// Verificar sesión
app.get('/api/admin/session', requireAuth, (req, res) => {
  res.json({
    authenticated: true,
    username: req.session.username
  });
});

// Rutas de administración

// Página de login
app.get('/admin', (req, res) => {
  if (req.session && req.session.userId) {
    res.redirect('/dashboard');
  } else {
    res.sendFile(path.join(__dirname, 'login.html'));
  }
});

// Dashboard (protegido)
app.get('/dashboard', (req, res) => {
  if (req.session && req.session.userId) {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
  } else {
    res.redirect('/admin');
  }
});

// Función auxiliar para calcular descuentos aplicables a un producto
function calcularDescuentoProducto(producto) {
  const ahora = new Date();

  // Filtrar descuentos activos y dentro del rango de fechas
  const descuentosAplicables = descuentos.filter(descuento => {
    if (!descuento.activo) return false;

    // Verificar fechas
    if (descuento.fechaInicio && new Date(descuento.fechaInicio) > ahora) return false;
    if (descuento.fechaFin && new Date(descuento.fechaFin) < ahora) return false;

    // Verificar tipo de descuento
    if (descuento.tipo === 'general') return true;
    if (descuento.tipo === 'categoria' && descuento.aplicaA === producto.categoria) return true;
    if (descuento.tipo === 'producto' && descuento.aplicaA === producto.id) return true;

    return false;
  });

  // Obtener el descuento más alto
  if (descuentosAplicables.length === 0) return null;

  const mejorDescuento = descuentosAplicables.reduce((max, desc) =>
    desc.porcentaje > max.porcentaje ? desc : max
  );

  return {
    descuentoId: mejorDescuento.id,
    nombre: mejorDescuento.nombre,
    porcentaje: mejorDescuento.porcentaje,
    precioOriginal: producto.precio,
    precioConDescuento: producto.precio * (1 - mejorDescuento.porcentaje / 100)
  };
}

// Obtener todos los productos
app.get('/api/productos', (req, res) => {
  const productosConDescuentos = productos.map(producto => {
    const descuento = calcularDescuentoProducto(producto);
    return {
      ...producto,
      descuento
    };
  });

  res.json(productosConDescuentos);
});

// Obtener producto por ID
app.get('/api/productos/:id', (req, res) => {
  const producto = productos.find(p => p.id === parseInt(req.params.id));
  if (producto) {
    const descuento = calcularDescuentoProducto(producto);
    res.json({
      ...producto,
      descuento
    });
  } else {
    res.status(404).json({ mensaje: 'Producto no encontrado' });
  }
});

// Crear un nuevo pedido
app.post('/api/pedidos', (req, res) => {
  const { items, total, cliente } = req.body;

  // Trackear descuentos usados y actualizar contadores
  const descuentosUsados = new Set();
  items.forEach(item => {
    if (item.descuento && item.descuento.descuentoId) {
      descuentosUsados.add(item.descuento.descuentoId);
    }
  });

  // Incrementar el contador de veces usado para cada descuento
  descuentosUsados.forEach(descuentoId => {
    const descuento = descuentos.find(d => d.id === descuentoId);
    if (descuento) {
      descuento.vecesUsado = (descuento.vecesUsado || 0) + 1;
    }
  });

  const nuevoPedido = {
    id: pedidoIdCounter++,
    items,
    total,
    cliente,
    fecha: new Date().toISOString(),
    estado: 'Nuevo Pedido',
    descuentosAplicados: Array.from(descuentosUsados)
  };

  pedidos.push(nuevoPedido);
  guardarDatos();
  res.status(201).json(nuevoPedido);
});

// Obtener todos los pedidos
app.get('/api/pedidos', (req, res) => {
  res.json(pedidos);
});

// Obtener pedido por ID
app.get('/api/pedidos/:id', (req, res) => {
  const pedido = pedidos.find(p => p.id === parseInt(req.params.id));
  if (pedido) {
    res.json(pedido);
  } else {
    res.status(404).json({ mensaje: 'Pedido no encontrado' });
  }
});

// Actualizar estado del pedido
app.patch('/api/pedidos/:id', (req, res) => {
  const pedido = pedidos.find(p => p.id === parseInt(req.params.id));
  if (pedido) {
    pedido.estado = req.body.estado || pedido.estado;
    guardarDatos();
    res.json(pedido);
  } else {
    res.status(404).json({ mensaje: 'Pedido no encontrado' });
  }
});

// Crear un nuevo producto
app.post('/api/productos', (req, res) => {
  const { nombre, precio, categoria, imagen, descripcion, tallas, nuevo } = req.body;

  const nuevoProducto = {
    id: productoIdCounter++,
    nombre,
    precio,
    categoria,
    imagen,
    descripcion,
    tallas,
    nuevo: nuevo || false
  };

  productos.push(nuevoProducto);
  guardarDatos();
  res.status(201).json(nuevoProducto);
});

// Actualizar un producto
app.put('/api/productos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const productoIndex = productos.findIndex(p => p.id === id);

  if (productoIndex !== -1) {
    const { nombre, precio, categoria, imagen, descripcion, tallas, nuevo } = req.body;
    productos[productoIndex] = {
      ...productos[productoIndex],
      nombre,
      precio,
      categoria,
      imagen,
      descripcion,
      tallas,
      nuevo
    };
    guardarDatos();
    res.json(productos[productoIndex]);
  } else {
    res.status(404).json({ mensaje: 'Producto no encontrado' });
  }
});

// Eliminar un producto
app.delete('/api/productos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const productoIndex = productos.findIndex(p => p.id === id);

  if (productoIndex !== -1) {
    productos.splice(productoIndex, 1);
    guardarDatos();
    res.json({ mensaje: 'Producto eliminado correctamente' });
  } else {
    res.status(404).json({ mensaje: 'Producto no encontrado' });
  }
});

// Subir productos desde CSV
app.post('/api/productos/upload-csv', (req, res) => {
  const { productos: productosCSV } = req.body;

  if (!productosCSV || !Array.isArray(productosCSV)) {
    return res.status(400).json({ mensaje: 'Datos inválidos' });
  }

  const productosNuevos = productosCSV.map(p => ({
    id: productoIdCounter++,
    nombre: p.nombre,
    precio: p.precio,
    categoria: p.categoria,
    imagen: p.imagen,
    descripcion: p.descripcion,
    tallas: p.tallas,
    nuevo: p.nuevo || false
  }));

  productos.push(...productosNuevos);
  guardarDatos();
  res.status(201).json({ mensaje: `${productosNuevos.length} productos importados`, productos: productosNuevos });
});

// Obtener todas las categorías
app.get('/api/categorias', (req, res) => {
  res.json(categorias);
});

// Crear una nueva categoría
app.post('/api/categorias', (req, res) => {
  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).json({ mensaje: 'El nombre de la categoría es requerido' });
  }

  // Verificar si ya existe
  if (categorias.find(c => c.nombre.toLowerCase() === nombre.toLowerCase())) {
    return res.status(400).json({ mensaje: 'Esta categoría ya existe' });
  }

  const nuevaCategoria = {
    id: categoriaIdCounter++,
    nombre: nombre.toLowerCase()
  };

  categorias.push(nuevaCategoria);
  guardarDatos();
  res.status(201).json(nuevaCategoria);
});

// Actualizar una categoría
app.put('/api/categorias/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const categoriaIndex = categorias.findIndex(c => c.id === id);

  if (categoriaIndex === -1) {
    return res.status(404).json({ mensaje: 'Categoría no encontrada' });
  }

  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).json({ mensaje: 'El nombre de la categoría es requerido' });
  }

  const nombreAntiguo = categorias[categoriaIndex].nombre;
  const nombreNuevo = nombre.toLowerCase();

  // Actualizar la categoría
  categorias[categoriaIndex].nombre = nombreNuevo;

  // Actualizar todos los productos que usan esta categoría
  productos.forEach(producto => {
    if (producto.categoria === nombreAntiguo) {
      producto.categoria = nombreNuevo;
    }
  });

  guardarDatos();
  res.json(categorias[categoriaIndex]);
});

// Eliminar una categoría
app.delete('/api/categorias/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const categoriaIndex = categorias.findIndex(c => c.id === id);

  if (categoriaIndex === -1) {
    return res.status(404).json({ mensaje: 'Categoría no encontrada' });
  }

  const nombreCategoria = categorias[categoriaIndex].nombre;

  // Verificar si hay productos usando esta categoría
  const productosConCategoria = productos.filter(p => p.categoria === nombreCategoria);

  if (productosConCategoria.length > 0) {
    return res.status(400).json({
      mensaje: `No se puede eliminar la categoría porque ${productosConCategoria.length} producto(s) la están usando`
    });
  }

  categorias.splice(categoriaIndex, 1);
  guardarDatos();
  res.json({ mensaje: 'Categoría eliminada correctamente' });
});

// ==================== RUTAS DE DESCUENTOS ====================

// Obtener todos los descuentos
app.get('/api/descuentos', (req, res) => {
  res.json(descuentos);
});

// Crear un nuevo descuento
app.post('/api/descuentos', requireAuth, (req, res) => {
  const { nombre, porcentaje, tipo, aplicaA, fechaInicio, fechaFin, activo, codigo } = req.body;

  if (!nombre || !porcentaje || !tipo) {
    return res.status(400).json({ mensaje: 'Nombre, porcentaje y tipo son requeridos' });
  }

  if (porcentaje < 0 || porcentaje > 100) {
    return res.status(400).json({ mensaje: 'El porcentaje debe estar entre 0 y 100' });
  }

  const nuevoDescuento = {
    id: descuentoIdCounter++,
    nombre,
    porcentaje: parseFloat(porcentaje),
    tipo, // "general", "categoria", "producto"
    aplicaA: aplicaA || null, // ID de categoría o producto, null si es general
    fechaInicio: fechaInicio || null,
    fechaFin: fechaFin || null,
    activo: activo !== undefined ? activo : true,
    codigo: codigo || null,
    vecesUsado: 0,
    creadoEn: new Date().toISOString()
  };

  descuentos.push(nuevoDescuento);
  guardarDatos();
  res.status(201).json(nuevoDescuento);
});

// Actualizar un descuento
app.put('/api/descuentos/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const descuentoIndex = descuentos.findIndex(d => d.id === id);

  if (descuentoIndex === -1) {
    return res.status(404).json({ mensaje: 'Descuento no encontrado' });
  }

  const { nombre, porcentaje, tipo, aplicaA, fechaInicio, fechaFin, activo, codigo } = req.body;

  if (porcentaje !== undefined && (porcentaje < 0 || porcentaje > 100)) {
    return res.status(400).json({ mensaje: 'El porcentaje debe estar entre 0 y 100' });
  }

  descuentos[descuentoIndex] = {
    ...descuentos[descuentoIndex],
    nombre: nombre || descuentos[descuentoIndex].nombre,
    porcentaje: porcentaje !== undefined ? parseFloat(porcentaje) : descuentos[descuentoIndex].porcentaje,
    tipo: tipo || descuentos[descuentoIndex].tipo,
    aplicaA: aplicaA !== undefined ? aplicaA : descuentos[descuentoIndex].aplicaA,
    fechaInicio: fechaInicio !== undefined ? fechaInicio : descuentos[descuentoIndex].fechaInicio,
    fechaFin: fechaFin !== undefined ? fechaFin : descuentos[descuentoIndex].fechaFin,
    activo: activo !== undefined ? activo : descuentos[descuentoIndex].activo,
    codigo: codigo !== undefined ? codigo : descuentos[descuentoIndex].codigo,
    actualizadoEn: new Date().toISOString()
  };

  guardarDatos();
  res.json(descuentos[descuentoIndex]);
});

// Eliminar un descuento
app.delete('/api/descuentos/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const descuentoIndex = descuentos.findIndex(d => d.id === id);

  if (descuentoIndex === -1) {
    return res.status(404).json({ mensaje: 'Descuento no encontrado' });
  }

  descuentos.splice(descuentoIndex, 1);
  guardarDatos();
  res.json({ mensaje: 'Descuento eliminado correctamente' });
});

// Obtener descuento por ID
app.get('/api/descuentos/:id', (req, res) => {
  const descuento = descuentos.find(d => d.id === parseInt(req.params.id));
  if (descuento) {
    res.json(descuento);
  } else {
    res.status(404).json({ mensaje: 'Descuento no encontrado' });
  }
});

// Servir index.html para todas las demás rutas (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
  console.log(`📡 Accesible públicamente en http://62.169.18.188`);
  console.log(`🌐 Tienda: http://62.169.18.188`);
  console.log(`📊 Admin: http://62.169.18.188/admin`);
});
