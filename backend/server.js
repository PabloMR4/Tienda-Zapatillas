require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const multer = require('multer');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const axios = require('axios');

// Verificar que las claves de Stripe estén configuradas
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('⚠️  ERROR: STRIPE_SECRET_KEY no está configurada en el archivo .env');
  console.error('📝 Por favor, crea un archivo .env con tus claves de Stripe');
  console.error('🔗 Obtén tus claves en: https://dashboard.stripe.com/test/apikeys');
}

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || '');

const app = express();
const PORT = 3000;

// Rutas de archivos de datos
const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTOS_FILE = path.join(DATA_DIR, 'productos.json');
const PEDIDOS_FILE = path.join(DATA_DIR, 'pedidos.json');
const CATEGORIAS_FILE = path.join(DATA_DIR, 'categorias.json');
const DESCUENTOS_FILE = path.join(DATA_DIR, 'descuentos.json');
const USUARIOS_FILE = path.join(DATA_DIR, 'usuarios.json');
const TICKETS_FILE = path.join(DATA_DIR, 'tickets.json');
const AUTO_UPDATE_FILE = path.join(DATA_DIR, 'auto_update.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Crear directorios si no existen
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configuración de Multer para archivos adjuntos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Límite de 5MB
  },
  fileFilter: function (req, file, cb) {
    // Permitir solo ciertos tipos de archivos
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes, PDFs, documentos y archivos ZIP.'));
    }
  }
});

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
  host: 'ssl0.ovh.net', // Servidor SMTP de OVH
  port: 587,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER || 'info@shoelandia.es',
    pass: process.env.EMAIL_PASSWORD || '' // Configurar en .env
  },
  tls: {
    rejectUnauthorized: false // Necesario para algunos servidores OVH
  }
});

// Función para enviar email de notificación de ticket
async function enviarEmailNuevoTicket(ticket) {
  try {
    const mailOptions = {
      from: '"ShoeLandia Soporte" <info@shoelandia.es>',
      to: 'info@shoelandia.es',
      subject: `Nuevo Ticket #${ticket.id} - ${ticket.asunto}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">🎫 Nuevo Ticket de Soporte</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p><strong>Ticket ID:</strong> #${ticket.id}</p>
            <p><strong>Cliente:</strong> ${ticket.nombre}</p>
            <p><strong>Email:</strong> ${ticket.email}</p>
            <p><strong>Asunto:</strong> ${ticket.asunto}</p>
            <p><strong>Prioridad:</strong> ${ticket.prioridad}</p>
            <p><strong>Fecha:</strong> ${new Date(ticket.fechaCreacion).toLocaleString('es-ES')}</p>
          </div>
          <div style="background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
            <h3>Mensaje:</h3>
            <p style="white-space: pre-wrap;">${ticket.mensajes[0].mensaje}</p>
          </div>
          <p style="color: #666; font-size: 12px;">
            Para responder a este ticket, accede al panel de administración.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email enviado para ticket #${ticket.id}`);
  } catch (error) {
    console.error('❌ Error enviando email:', error.message);
    // No lanzar error para que no afecte la creación del ticket
  }
}

// Función para enviar email de contacto simple
async function enviarEmailContacto(datos) {
  try {
    const mailOptions = {
      from: '"ShoeLandia Web" <info@shoelandia.es>',
      to: 'info@shoelandia.es',
      replyTo: datos.email,
      subject: `Contacto Web: ${datos.asunto}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">📧 Nuevo Mensaje de Contacto</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p><strong>Nombre:</strong> ${datos.nombre}</p>
            <p><strong>Email:</strong> ${datos.email}</p>
            <p><strong>Asunto:</strong> ${datos.asunto}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
          </div>
          <div style="background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
            <h3>Mensaje:</h3>
            <p style="white-space: pre-wrap;">${datos.mensaje}</p>
          </div>
          <p style="color: #666; font-size: 12px;">
            Este mensaje fue enviado desde el formulario de contacto de la web.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de contacto enviado de ${datos.email}`);
  } catch (error) {
    console.error('❌ Error enviando email de contacto:', error.message);
    throw error; // Lanzar error para que el usuario sepa que no se envió
  }
}

// ==================== FUNCIONES DE EMAIL PARA PEDIDOS ====================

// Función para obtener color del estado del pedido
function obtenerColorEstado(estado) {
  const colores = {
    'Nuevo Pedido': '#3498db',
    'En Preparación': '#f39c12',
    'Enviado': '#9b59b6',
    'Entregado': '#27ae60',
    'Cancelado': '#e74c3c'
  };
  return colores[estado] || '#95a5a6';
}

// Función para obtener icono del estado del pedido
function obtenerIconoEstado(estado) {
  const iconos = {
    'Nuevo Pedido': '📦',
    'En Preparación': '⚙️',
    'Enviado': '🚚',
    'Entregado': '✅',
    'Cancelado': '❌'
  };
  return iconos[estado] || '📋';
}

// Función para enviar email de confirmación de pedido
async function enviarEmailConfirmacionPedido(pedido) {
  try {
    const colorEstado = obtenerColorEstado(pedido.estado);
    const iconoEstado = obtenerIconoEstado(pedido.estado);

    // Calcular subtotal y envío
    const subtotal = pedido.items.reduce((sum, item) => {
      const precio = item.descuento ? item.descuento.precioConDescuento : item.precio;
      return sum + (precio * item.cantidad);
    }, 0);

    const envio = pedido.total - subtotal;

    const itemsHTML = pedido.items.map(item => {
      const precio = item.descuento ? item.descuento.precioConDescuento : item.precio;
      const descuentoHTML = item.descuento ?
        `<br><small style="color: #27ae60;">Descuento: -${item.descuento.porcentaje}%</small>` : '';

      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">
            <strong>${item.nombre}</strong><br>
            <small style="color: #666;">Talla: ${item.talla} | Cantidad: ${item.cantidad}</small>
            ${descuentoHTML}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
            €${(precio * item.cantidad).toFixed(2)}
          </td>
        </tr>
      `;
    }).join('');

    const mailOptions = {
      from: '"ShoeLandia" <info@shoelandia.es>',
      to: pedido.cliente.email,
      subject: `Confirmación de Pedido #${pedido.id} - ShoeLandia`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 700;">Shoe·Landia</h1>
                      <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Confirmación de Pedido</p>
                    </td>
                  </tr>

                  <!-- Contenido Principal -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px 0; color: #333; font-size: 24px;">¡Gracias por tu compra!</h2>
                      <p style="margin: 0 0 30px 0; color: #666; font-size: 16px; line-height: 1.6;">
                        Hola <strong>${pedido.cliente.nombre}</strong>,<br>
                        Hemos recibido tu pedido correctamente. A continuación encontrarás los detalles:
                      </p>

                      <!-- Estado del Pedido -->
                      <div style="background-color: ${colorEstado}15; border-left: 4px solid ${colorEstado}; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
                        <p style="margin: 0; color: ${colorEstado}; font-size: 18px; font-weight: 600;">
                          ${iconoEstado} Estado: ${pedido.estado}
                        </p>
                        <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
                          Pedido #${pedido.id} realizado el ${new Date(pedido.fecha).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>

                      <!-- Detalles del Pedido -->
                      <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">Detalles del Pedido</h3>
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                        ${itemsHTML}
                        <tr>
                          <td style="padding: 12px; border-top: 2px solid #ddd; text-align: right;" colspan="2">
                            <strong>Subtotal:</strong> €${subtotal.toFixed(2)}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; text-align: right;" colspan="2">
                            <strong>Envío:</strong> ${envio === 0 ? '<span style="color: #27ae60;">GRATIS</span>' : '€' + envio.toFixed(2)}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; border-top: 2px solid #ddd; text-align: right; background-color: #f8f9fa;" colspan="2">
                            <strong style="font-size: 20px; color: #667eea;">Total: €${pedido.total.toFixed(2)}</strong>
                          </td>
                        </tr>
                      </table>

                      <!-- Dirección de Envío -->
                      <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">📍 Dirección de Envío</h3>
                      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                        <p style="margin: 0; color: #333; line-height: 1.8;">
                          ${pedido.cliente.nombre}<br>
                          ${pedido.cliente.direccion}<br>
                          ${pedido.cliente.ciudad}, ${pedido.cliente.codigoPostal}<br>
                          ${pedido.cliente.telefono}
                        </p>
                      </div>

                      <!-- Información Adicional -->
                      <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin-top: 30px;">
                        <p style="margin: 0; color: #1976d2; font-size: 14px; line-height: 1.6;">
                          💡 <strong>¿Qué sigue?</strong><br>
                          Te enviaremos un correo cada vez que el estado de tu pedido cambie.
                          Si tienes alguna pregunta, no dudes en contactarnos.
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                      <p style="margin: 0 0 10px 0; color: #999; font-size: 14px;">
                        Gracias por confiar en ShoeLandia
                      </p>
                      <p style="margin: 0; color: #999; font-size: 12px;">
                        © ${new Date().getFullYear()} ShoeLandia. Todos los derechos reservados.
                      </p>
                      <div style="margin-top: 20px;">
                        <a href="https://shoelandia.es" style="color: #667eea; text-decoration: none; margin: 0 10px;">Visitar Tienda</a>
                        <span style="color: #ddd;">|</span>
                        <a href="https://shoelandia.es" style="color: #667eea; text-decoration: none; margin: 0 10px;">Contacto</a>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de confirmación enviado para pedido #${pedido.id} a ${pedido.cliente.email}`);
  } catch (error) {
    console.error('❌ Error enviando email de confirmación:', error.message);
    // No lanzar error para que no afecte la creación del pedido
  }
}

// Función para enviar email de cambio de estado de pedido
async function enviarEmailCambioEstado(pedido, estadoAnterior) {
  try {
    const colorEstado = obtenerColorEstado(pedido.estado);
    const iconoEstado = obtenerIconoEstado(pedido.estado);

    const mensajesEstado = {
      'En Preparación': '⚙️ Tu pedido está siendo preparado cuidadosamente por nuestro equipo.',
      'Enviado': '🚚 ¡Buenas noticias! Tu pedido está en camino. Recibirás un seguimiento pronto.',
      'Entregado': '🎉 ¡Tu pedido ha sido entregado! Esperamos que disfrutes tu compra.',
      'Cancelado': '😔 Tu pedido ha sido cancelado. Si necesitas ayuda, contáctanos.'
    };

    const mailOptions = {
      from: '"ShoeLandia" <info@shoelandia.es>',
      to: pedido.cliente.email,
      subject: `${iconoEstado} Actualización de Pedido #${pedido.id} - ${pedido.estado}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 700;">Shoe·Landia</h1>
                      <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Actualización de Pedido</p>
                    </td>
                  </tr>

                  <!-- Contenido Principal -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px 0; color: #333; font-size: 24px;">Estado de tu Pedido Actualizado</h2>
                      <p style="margin: 0 0 30px 0; color: #666; font-size: 16px; line-height: 1.6;">
                        Hola <strong>${pedido.cliente.nombre}</strong>,<br>
                        Tu pedido ha sido actualizado. Aquí están los detalles:
                      </p>

                      <!-- Nuevo Estado -->
                      <div style="background-color: ${colorEstado}15; border-left: 4px solid ${colorEstado}; padding: 25px; margin-bottom: 20px; border-radius: 4px;">
                        <p style="margin: 0 0 10px 0; color: ${colorEstado}; font-size: 24px; font-weight: 600;">
                          ${iconoEstado} ${pedido.estado}
                        </p>
                        <p style="margin: 0; color: #666; font-size: 15px; line-height: 1.6;">
                          ${mensajesEstado[pedido.estado] || 'Tu pedido ha sido actualizado.'}
                        </p>
                      </div>

                      <!-- Info del Pedido -->
                      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                        <p style="margin: 0; color: #666; font-size: 14px;">
                          <strong>Pedido:</strong> #${pedido.id}<br>
                          <strong>Fecha:</strong> ${new Date(pedido.fecha).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}<br>
                          <strong>Total:</strong> €${pedido.total.toFixed(2)}
                        </p>
                      </div>

                      ${pedido.estado === 'Enviado' ? `
                      <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <p style="margin: 0; color: #2e7d32; font-size: 14px; line-height: 1.6;">
                          📦 <strong>Tiempo estimado de entrega:</strong> 24 horas
                        </p>
                      </div>
                      ` : ''}

                      <!-- CTA -->
                      <div style="text-align: center; margin-top: 30px;">
                        <a href="https://shoelandia.es" style="display: inline-block; background-color: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                          Ver mi Cuenta
                        </a>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                      <p style="margin: 0 0 10px 0; color: #999; font-size: 14px;">
                        ¿Necesitas ayuda? Contáctanos en cualquier momento
                      </p>
                      <p style="margin: 0; color: #999; font-size: 12px;">
                        © ${new Date().getFullYear()} ShoeLandia. Todos los derechos reservados.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de cambio de estado enviado para pedido #${pedido.id} (${estadoAnterior} → ${pedido.estado})`);
  } catch (error) {
    console.error('❌ Error enviando email de cambio de estado:', error.message);
  }
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
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Middleware para asegurar UTF-8 en respuestas JSON
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function(data) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return originalJson.call(this, data);
  };
  next();
});

// Configurar sesiones
app.use(session({
  secret: 'moda-store-secret-key-2024',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    httpOnly: true,
    secure: false, // Temporalmente en false hasta tener HTTPS
    sameSite: 'lax'
  }
}));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Servir archivos adjuntos (uploads)
app.use('/uploads', express.static(UPLOADS_DIR));

// Base de datos en memoria (productos)
let productos = [
  {
    id: 1,
    sku: "ZAP-001",
    nombre: "Zapatillas Air Jordan Retro",
    precio: 189.99,
    categoria: "zapatillas",
    descripcion: "Zapatillas icónicas con diseño retro y máxima comodidad",
    nuevo: true,
    variantes: [
      {
        id: 1,
        talla: "38",
        stock: 10,
        imagenes: [
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=700&fit=crop",
          "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500&h=700&fit=crop"
        ]
      },
      {
        id: 2,
        talla: "39",
        stock: 15,
        imagenes: [
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=700&fit=crop",
          "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=500&h=700&fit=crop"
        ]
      },
      {
        id: 3,
        talla: "40",
        stock: 8,
        imagenes: [
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=700&fit=crop"
        ]
      }
    ]
  },
  {
    id: 2,
    sku: "ZAP-002",
    nombre: "Zapatillas Running Ultra Boost",
    precio: 159.99,
    categoria: "zapatillas",
    imagenes: [
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&h=700&fit=crop",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&h=700&fit=crop"
    ],
    descripcion: "Tecnología de amortiguación para máximo rendimiento",
    tallas: ["36", "37", "38", "39", "40", "41", "42", "43", "44"],
    nuevo: true
  },
  {
    id: 3,
    sku: "ZAP-003",
    nombre: "Zapatillas Casual Blancas Premium",
    precio: 119.99,
    categoria: "zapatillas",
    imagenes: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=700&fit=crop"],
    descripcion: "Minimalistas y elegantes, perfectas para el día a día",
    tallas: ["36", "37", "38", "39", "40", "41", "42"],
    nuevo: false
  },
  {
    id: 4,
    sku: "ZAP-004",
    nombre: "Zapatillas High Top Negras",
    precio: 139.99,
    categoria: "zapatillas",
    imagenes: ["https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500&h=700&fit=crop"],
    descripcion: "Estilo urbano con suela resistente y diseño moderno",
    tallas: ["37", "38", "39", "40", "41", "42", "43"],
    nuevo: true
  },
  {
    id: 5,
    sku: "BOL-001",
    nombre: "Bolso Tote de Cuero Camel",
    precio: 249.99,
    categoria: "bolsos",
    imagenes: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=700&fit=crop"],
    descripcion: "Bolso espacioso de cuero genuino de máxima calidad",
    tallas: ["Único"],
    nuevo: true
  },
  {
    id: 6,
    nombre: "Bolso Bandolera Negro Elegante",
    precio: 179.99,
    categoria: "bolsos",
    imagenes: ["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&h=700&fit=crop"],
    descripcion: "Diseño sofisticado perfecto para cualquier ocasión",
    tallas: ["Único"],
    nuevo: false
  },
  {
    id: 7,
    nombre: "Bolso Clutch de Noche Dorado",
    precio: 89.99,
    categoria: "bolsos",
    imagenes: ["https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=500&h=700&fit=crop"],
    descripcion: "Pequeño y elegante, ideal para eventos especiales",
    tallas: ["Único"],
    nuevo: true
  },
  {
    id: 8,
    nombre: "Mochila de Cuero Premium",
    precio: 199.99,
    categoria: "bolsos",
    imagenes: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=700&fit=crop"],
    descripcion: "Funcional y elegante, perfecta para el día a día",
    tallas: ["Único"],
    nuevo: false
  },
  {
    id: 9,
    nombre: "Zapatillas Deportivas Trail",
    precio: 169.99,
    categoria: "zapatillas",
    imagenes: ["https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&h=700&fit=crop"],
    descripcion: "Diseñadas para terrenos difíciles con gran agarre",
    tallas: ["38", "39", "40", "41", "42", "43", "44"],
    nuevo: false
  },
  {
    id: 10,
    nombre: "Bolso Shopper de Lona",
    precio: 69.99,
    categoria: "bolsos",
    imagenes: ["https://images.unsplash.com/photo-1564422170194-896b89110ef8?w=500&h=700&fit=crop"],
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
  { id: 1, nombre: 'zapatillas', parentId: null },
  { id: 2, nombre: 'bolsos', parentId: null }
];
let categoriaIdCounter = 3;

// Base de datos en memoria (descuentos)
let descuentos = [];
let descuentoIdCounter = 1;

// Base de datos en memoria (usuarios/clientes)
let usuarios = [];
let usuarioIdCounter = 1;

// Base de datos en memoria (tickets de soporte)
let tickets = [];
let ticketIdCounter = 1;

// ==================== FUNCIONES DE PERSISTENCIA ====================

// Función para migrar productos del formato antiguo al nuevo con variantes
function migrarProductoAVariantes(producto) {
  // Si ya tiene variantes, no migrar
  if (producto.variantes && Array.isArray(producto.variantes)) {
    return {
      ...producto,
      destacado: producto.destacado || false
    };
  }

  // Si tiene el formato antiguo con tallas e imagenes
  if (producto.tallas && Array.isArray(producto.tallas)) {
    const variantes = producto.tallas.map((talla, index) => ({
      id: index + 1,
      talla: talla,
      stock: producto.stock || 10, // Stock por defecto si no existe
      imagenes: producto.imagenes || []
    }));

    // Retornar producto en nuevo formato
    return {
      id: producto.id,
      sku: producto.sku,
      nombre: producto.nombre,
      precio: producto.precio,
      categoria: producto.categoria,
      descripcion: producto.descripcion,
      nuevo: producto.nuevo || false,
      destacado: producto.destacado || false,
      variantes: variantes
    };
  }

  // Si no tiene ni variantes ni tallas, crear una variante por defecto
  return {
    ...producto,
    destacado: producto.destacado || false,
    variantes: [{
      id: 1,
      talla: "Único",
      stock: producto.stock || 10,
      imagenes: producto.imagenes || []
    }]
  };
}

// Cargar datos desde archivos JSON
function cargarDatos() {
  try {
    // Cargar productos
    if (fs.existsSync(PRODUCTOS_FILE)) {
      const data = fs.readFileSync(PRODUCTOS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      let productosRaw = parsed.productos || productos;
      // Migrar productos al nuevo formato
      productos = productosRaw.map(migrarProductoAVariantes);
      productoIdCounter = parsed.counter || productoIdCounter;
      console.log(`✅ ${productos.length} productos cargados y migrados`);
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

    // Cargar usuarios
    if (fs.existsSync(USUARIOS_FILE)) {
      const data = fs.readFileSync(USUARIOS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      usuarios = parsed.usuarios || usuarios;
      usuarioIdCounter = parsed.counter || usuarioIdCounter;
      console.log(`✅ ${usuarios.length} usuarios cargados`);
    }

    // Cargar tickets
    if (fs.existsSync(TICKETS_FILE)) {
      const data = fs.readFileSync(TICKETS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      tickets = parsed.tickets || tickets;
      ticketIdCounter = parsed.counter || ticketIdCounter;
      console.log(`✅ ${tickets.length} tickets cargados`);
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
    }, null, 2), 'utf8');

    // Guardar pedidos
    fs.writeFileSync(PEDIDOS_FILE, JSON.stringify({
      pedidos,
      counter: pedidoIdCounter
    }, null, 2), 'utf8');

    // Guardar categorías
    fs.writeFileSync(CATEGORIAS_FILE, JSON.stringify({
      categorias,
      counter: categoriaIdCounter
    }, null, 2), 'utf8');

    // Guardar descuentos
    fs.writeFileSync(DESCUENTOS_FILE, JSON.stringify({
      descuentos,
      counter: descuentoIdCounter
    }, null, 2), 'utf8');

    // Guardar usuarios
    fs.writeFileSync(USUARIOS_FILE, JSON.stringify({
      usuarios,
      counter: usuarioIdCounter
    }, null, 2), 'utf8');

    // Guardar tickets
    fs.writeFileSync(TICKETS_FILE, JSON.stringify({
      tickets,
      counter: ticketIdCounter
    }, null, 2), 'utf8');

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

// ==================== RUTAS DE AUTENTICACIÓN DE CLIENTES ====================

// Middleware de autenticación para clientes
const requireClientAuth = (req, res, next) => {
  if (req.session && req.session.clienteId) {
    next();
  } else {
    res.status(401).json({ mensaje: 'No autorizado' });
  }
};

// Registro de cliente
app.post('/api/clientes/registro', async (req, res) => {
  const { nombre, email, password, telefono, direccion, ciudad, provincia, codigoPostal } = req.body;

  // Validar campos requeridos
  if (!nombre || !email || !password) {
    return res.status(400).json({ mensaje: 'Nombre, email y contraseña son requeridos' });
  }

  // Verificar si el email ya existe
  const usuarioExistente = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (usuarioExistente) {
    return res.status(400).json({ mensaje: 'El email ya está registrado' });
  }

  try {
    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    const nuevoUsuario = {
      id: usuarioIdCounter++,
      nombre,
      email: email.toLowerCase(),
      password: passwordHash,
      telefono: telefono || '',
      direccion: direccion || '',
      ciudad: ciudad || '',
      provincia: provincia || '',
      codigoPostal: codigoPostal || '',
      fechaRegistro: new Date().toISOString(),
      pedidos: []
    };

    usuarios.push(nuevoUsuario);
    guardarDatos();

    // Iniciar sesión automáticamente
    req.session.clienteId = nuevoUsuario.id;
    req.session.clienteEmail = nuevoUsuario.email;

    res.status(201).json({
      success: true,
      mensaje: 'Usuario registrado exitosamente',
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email
      }
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar usuario' });
  }
});

// Login de cliente
app.post('/api/clientes/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ mensaje: 'Email y contraseña son requeridos' });
  }

  const usuario = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!usuario) {
    return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
  }

  try {
    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    // Iniciar sesión
    req.session.clienteId = usuario.id;
    req.session.clienteEmail = usuario.email;

    res.json({
      success: true,
      mensaje: 'Login exitoso',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email
      }
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión' });
  }
});

// Logout de cliente
app.post('/api/clientes/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ mensaje: 'Error al cerrar sesión' });
    }
    res.json({ mensaje: 'Sesión cerrada correctamente' });
  });
});

// Verificar sesión de cliente
app.get('/api/clientes/session', requireClientAuth, (req, res) => {
  const usuario = usuarios.find(u => u.id === req.session.clienteId);
  if (usuario) {
    res.json({
      authenticated: true,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email
      }
    });
  } else {
    res.status(401).json({ mensaje: 'No autorizado' });
  }
});

// Obtener perfil de cliente
app.get('/api/clientes/perfil', requireClientAuth, (req, res) => {
  const usuario = usuarios.find(u => u.id === req.session.clienteId);
  if (usuario) {
    // No enviar la contraseña
    const { password, ...usuarioSinPassword } = usuario;
    res.json(usuarioSinPassword);
  } else {
    res.status(404).json({ mensaje: 'Usuario no encontrado' });
  }
});

// Actualizar perfil de cliente
app.put('/api/clientes/perfil', requireClientAuth, async (req, res) => {
  const usuarioIndex = usuarios.findIndex(u => u.id === req.session.clienteId);

  if (usuarioIndex === -1) {
    return res.status(404).json({ mensaje: 'Usuario no encontrado' });
  }

  const { nombre, telefono, direccion, ciudad, provincia, codigoPostal, passwordActual, passwordNueva } = req.body;

  try {
    // Si se proporciona nueva contraseña, verificar la actual
    if (passwordNueva) {
      if (!passwordActual) {
        return res.status(400).json({ mensaje: 'Debe proporcionar la contraseña actual' });
      }

      const passwordValida = await bcrypt.compare(passwordActual, usuarios[usuarioIndex].password);
      if (!passwordValida) {
        return res.status(401).json({ mensaje: 'Contraseña actual incorrecta' });
      }

      // Actualizar contraseña
      usuarios[usuarioIndex].password = await bcrypt.hash(passwordNueva, 10);
    }

    // Actualizar otros campos
    if (nombre) usuarios[usuarioIndex].nombre = nombre;
    if (telefono !== undefined) usuarios[usuarioIndex].telefono = telefono;
    if (direccion !== undefined) usuarios[usuarioIndex].direccion = direccion;
    if (ciudad !== undefined) usuarios[usuarioIndex].ciudad = ciudad;
    if (provincia !== undefined) usuarios[usuarioIndex].provincia = provincia;
    if (codigoPostal !== undefined) usuarios[usuarioIndex].codigoPostal = codigoPostal;

    guardarDatos();

    const { password, ...usuarioSinPassword } = usuarios[usuarioIndex];
    res.json(usuarioSinPassword);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar perfil' });
  }
});

// Obtener pedidos del cliente
app.get('/api/clientes/pedidos', requireClientAuth, (req, res) => {
  const pedidosCliente = pedidos.filter(p => p.clienteId === req.session.clienteId);
  res.json(pedidosCliente);
});

// Obtener lista de todos los clientes (Admin)
app.get('/api/admin/clientes', requireAuth, (req, res) => {
  const clientesConEstadisticas = usuarios.map(usuario => {
    // Contar pedidos del cliente
    const pedidosCliente = pedidos.filter(p => p.clienteId === usuario.id);
    const totalPedidos = pedidosCliente.length;

    // Calcular total gastado
    const totalGastado = pedidosCliente.reduce((sum, pedido) => sum + (pedido.total || 0), 0);

    // Encontrar último pedido
    const ultimoPedido = pedidosCliente.length > 0
      ? pedidosCliente.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0]
      : null;

    // No enviar la contraseña
    const { password, ...usuarioSinPassword } = usuario;

    return {
      ...usuarioSinPassword,
      estadisticas: {
        totalPedidos,
        totalGastado,
        ultimoPedido: ultimoPedido ? {
          id: ultimoPedido.id,
          fecha: ultimoPedido.fecha,
          total: ultimoPedido.total
        } : null
      }
    };
  });

  // Ordenar por total gastado (mejores clientes primero)
  clientesConEstadisticas.sort((a, b) => b.estadisticas.totalGastado - a.estadisticas.totalGastado);

  res.json(clientesConEstadisticas);
});

// ==================== RUTAS DE STRIPE ====================

// Crear Payment Intent
app.post('/api/stripe/create-payment-intent', async (req, res) => {
  const { amount, currency = 'eur' } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Monto inválido' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe espera el monto en centavos
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creando Payment Intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener clave pública de Stripe
app.get('/api/stripe/config', (req, res) => {
  if (!process.env.STRIPE_PUBLISHABLE_KEY) {
    return res.status(500).json({
      error: 'Stripe no está configurado. Por favor, configura las claves en el archivo .env'
    });
  }
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
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

// Función auxiliar para obtener la ruta completa de categorías
function obtenerRutaCategoria(nombreCategoria) {
  const categoria = categorias.find(c => c.nombre === nombreCategoria);
  if (!categoria) {
    return nombreCategoria.charAt(0).toUpperCase() + nombreCategoria.slice(1);
  }

  let ruta = [categoria.nombre.charAt(0).toUpperCase() + categoria.nombre.slice(1)];
  let categoriaActual = categoria;

  // Subir por la jerarquía hasta llegar a la raíz
  while (categoriaActual.parentId) {
    const categoriaPadre = categorias.find(c => c.id === categoriaActual.parentId);
    if (categoriaPadre) {
      ruta.unshift(categoriaPadre.nombre.charAt(0).toUpperCase() + categoriaPadre.nombre.slice(1));
      categoriaActual = categoriaPadre;
    } else {
      break;
    }
  }

  return ruta.join(' › ');
}

// Función auxiliar para calcular descuentos aplicables a un producto
function calcularDescuentoProducto(producto) {
  const ahora = new Date();

  // Filtrar descuentos activos y dentro del rango de fechas
  const descuentosAplicables = descuentos.filter(descuento => {
    if (!descuento.activo) return false;

    // IMPORTANTE: Solo aplicar descuentos generales automáticamente
    // Los códigos promocionales (tipoCodigo === 'promocional') solo se aplican en el carrito manualmente
    if (descuento.tipoCodigo === 'promocional') return false;

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

  // Calcular el mejor descuento considerando tanto porcentaje como cantidad
  const mejorDescuento = descuentosAplicables.reduce((max, desc) => {
    const descuentoActual = desc.tipoBeneficioGlobal === 'cantidad'
      ? (desc.cantidad / producto.precio * 100) // Convertir cantidad a porcentaje equivalente para comparar
      : desc.porcentaje;

    const descuentoMax = max.tipoBeneficioGlobal === 'cantidad'
      ? (max.cantidad / producto.precio * 100)
      : max.porcentaje;

    return descuentoActual > descuentoMax ? desc : max;
  });

  // Calcular precio con descuento
  let precioConDescuento;
  if (mejorDescuento.tipoBeneficioGlobal === 'cantidad') {
    precioConDescuento = Math.max(0, producto.precio - mejorDescuento.cantidad);
  } else {
    precioConDescuento = producto.precio * (1 - mejorDescuento.porcentaje / 100);
  }

  return {
    descuentoId: mejorDescuento.id,
    nombre: mejorDescuento.nombre,
    porcentaje: mejorDescuento.porcentaje,
    precioOriginal: producto.precio,
    precioConDescuento: precioConDescuento
  };
}

// Obtener todos los productos
app.get('/api/productos', (req, res) => {
  const productosConDescuentos = productos.map(producto => {
    const descuento = calcularDescuentoProducto(producto);
    const rutaCategoria = obtenerRutaCategoria(producto.categoria);
    return {
      ...producto,
      descuento,
      rutaCategoria
    };
  });

  res.json(productosConDescuentos);
});

// Endpoint para obtener info de última actualización automática
app.get('/api/productos/ultima-actualizacion', (req, res) => {
  res.json(getUltimaActualizacion());
});

// Endpoint para forzar actualización manual
app.post('/api/productos/actualizar-ahora', async (req, res) => {
  try {
    await actualizarProductosAutomatico();
    res.json(getUltimaActualizacion());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener producto por ID
app.get('/api/productos/:id', (req, res) => {
  const producto = productos.find(p => p.id === parseInt(req.params.id));
  if (producto) {
    const descuento = calcularDescuentoProducto(producto);
    const rutaCategoria = obtenerRutaCategoria(producto.categoria);
    res.json({
      ...producto,
      descuento,
      rutaCategoria
    });
  } else {
    res.status(404).json({ mensaje: 'Producto no encontrado' });
  }
});

// Crear un nuevo pedido
app.post('/api/pedidos', (req, res) => {
  const { items, total, cliente, paymentIntentId } = req.body;

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
    clienteId: req.session.clienteId || null, // Asociar con cliente autenticado si existe
    paymentIntentId: paymentIntentId || null, // ID del pago de Stripe
    fecha: new Date().toISOString(),
    estado: 'Nuevo Pedido',
    descuentosAplicados: Array.from(descuentosUsados)
  };

  pedidos.push(nuevoPedido);

  // Si el cliente está autenticado, agregar el pedido a su lista
  if (req.session.clienteId) {
    const usuario = usuarios.find(u => u.id === req.session.clienteId);
    if (usuario) {
      usuario.pedidos.push(nuevoPedido.id);
    }
  }

  guardarDatos();

  // Enviar email de confirmación al cliente
  enviarEmailConfirmacionPedido(nuevoPedido);

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
    const estadoAnterior = pedido.estado;
    const nuevoEstado = req.body.estado || pedido.estado;

    // Solo enviar email si el estado realmente cambió
    if (estadoAnterior !== nuevoEstado) {
      pedido.estado = nuevoEstado;
      guardarDatos();

      // Enviar email de cambio de estado al cliente
      enviarEmailCambioEstado(pedido, estadoAnterior);

      res.json(pedido);
    } else {
      res.json(pedido);
    }
  } else {
    res.status(404).json({ mensaje: 'Pedido no encontrado' });
  }
});

// Eliminar un pedido
app.delete('/api/pedidos/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const pedidoIndex = pedidos.findIndex(p => p.id === id);

  if (pedidoIndex === -1) {
    return res.status(404).json({ mensaje: 'Pedido no encontrado' });
  }

  pedidos.splice(pedidoIndex, 1);
  guardarDatos();
  res.json({ mensaje: 'Pedido eliminado correctamente' });
});

// Crear un nuevo producto
app.post('/api/productos', (req, res) => {
  const { sku, nombre, precio, categoria, imagen, imagenes, descripcion, tallas, nuevo, destacado } = req.body;

  // Verificar si el SKU ya existe
  if (sku) {
    const productoExistente = productos.find(p => p.sku === sku);
    if (productoExistente) {
      return res.status(400).json({ mensaje: `Ya existe un producto con el SKU: ${sku}` });
    }
  }

  // Soportar tanto 'imagen' (campo antiguo) como 'imagenes' (nuevo array)
  let imagenesArray = imagenes;
  if (!imagenesArray && imagen) {
    // Si se envía 'imagen' (formato antiguo), convertirlo a array
    imagenesArray = Array.isArray(imagen) ? imagen : [imagen];
  } else if (!imagenesArray) {
    imagenesArray = [];
  }

  const nuevoProducto = {
    id: productoIdCounter++,
    sku: sku || null,
    nombre,
    precio,
    categoria,
    imagenes: imagenesArray,
    descripcion,
    tallas,
    nuevo: nuevo || false,
    destacado: destacado || false
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
    const { sku, nombre, precio, categoria, imagen, imagenes, descripcion, tallas, nuevo, destacado } = req.body;

    // Si se intenta cambiar el SKU, verificar que no exista
    if (sku && sku !== productos[productoIndex].sku) {
      const skuExistente = productos.find(p => p.sku === sku && p.id !== id);
      if (skuExistente) {
        return res.status(400).json({ mensaje: `Ya existe un producto con el SKU: ${sku}` });
      }
    }

    // Soportar tanto 'imagen' (campo antiguo) como 'imagenes' (nuevo array)
    let imagenesArray = imagenes;
    if (!imagenesArray && imagen) {
      // Si se envía 'imagen' (formato antiguo), convertirlo a array
      imagenesArray = Array.isArray(imagen) ? imagen : [imagen];
    }

    productos[productoIndex] = {
      ...productos[productoIndex],
      sku: sku !== undefined ? sku : productos[productoIndex].sku,
      nombre,
      precio,
      categoria,
      imagenes: imagenesArray || productos[productoIndex].imagenes,
      descripcion,
      tallas,
      nuevo,
      destacado: destacado !== undefined ? destacado : productos[productoIndex].destacado
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

// Eliminar múltiples productos (eliminación masiva)
app.post('/api/productos/eliminar-masivo', (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ mensaje: 'Debes proporcionar un array de IDs válido' });
  }

  let eliminados = 0;
  const idsSet = new Set(ids.map(id => parseInt(id)));

  // Filtrar productos, eliminando los que tengan IDs en el set
  const productosOriginales = productos.length;
  productos = productos.filter(producto => {
    if (idsSet.has(producto.id)) {
      eliminados++;
      return false;
    }
    return true;
  });

  if (eliminados > 0) {
    guardarDatos();
    res.json({
      mensaje: `${eliminados} producto(s) eliminado(s) correctamente`,
      eliminados: eliminados,
      total: productosOriginales,
      restantes: productos.length
    });
  } else {
    res.status(404).json({ mensaje: 'No se encontraron productos para eliminar' });
  }
});

// Actualizar SOLO stock de productos existentes por SKU
app.post('/api/productos/actualizar-stock-csv', (req, res) => {
  const { productos: productosCSV, vistaPrevia } = req.body;

  if (!productosCSV || !Array.isArray(productosCSV)) {
    return res.status(400).json({ mensaje: 'Datos inválidos' });
  }

  const resultados = {
    actualizados: [],
    noEncontrados: [],
    errores: []
  };

  const vistaPreviaProductos = [];

  try {
    // Agrupar filas por SKU
    const productosPorSKU = new Map();

    productosCSV.forEach((fila, index) => {
      // Soportar diferentes formatos de columnas CSV
      let sku = fila.sku || fila.SKU || fila.Sku;
      let talla = fila['Option1 Value'] || fila.option1Value || fila.talla || fila.Talla;
      let stock = fila.Available || fila.available || fila.stock || fila.Stock;

      if (!sku) {
        resultados.errores.push({
          fila: index + 2,
          error: 'SKU no encontrado'
        });
        return;
      }

      sku = String(sku).trim();
      talla = talla ? String(talla).trim() : "Único";
      stock = parseInt(stock) || 0;

      if (!productosPorSKU.has(sku)) {
        productosPorSKU.set(sku, []);
      }
      productosPorSKU.get(sku).push({ talla, stock });
    });

    // Para cada SKU, buscar el producto existente y actualizar stock
    let productosActualizadosCount = 0;

    productosPorSKU.forEach((filas, sku) => {
      const productoExistente = productos.find(p => p.sku === sku);

      if (!productoExistente) {
        resultados.noEncontrados.push({
          sku: sku,
          motivo: 'Producto no existe en la base de datos'
        });
        return;
      }

      // Si es vista previa, guardar el estado actual (solo primeros 5 productos)
      const esParaVistaPrevia = vistaPrevia && vistaPreviaProductos.length < 5;
      let vistaPreviaProducto = null;

      if (esParaVistaPrevia) {
        vistaPreviaProducto = {
          sku: productoExistente.sku,
          nombre: productoExistente.nombre,
          antes: productoExistente.variantes ? productoExistente.variantes.map(v => ({
            talla: v.talla,
            stock: v.stock
          })) : [],
          despues: []
        };
      }

      // Actualizar stock de variantes existentes
      if (productoExistente.variantes && Array.isArray(productoExistente.variantes)) {
        let variantesActualizadas = 0;

        filas.forEach(({ talla, stock }) => {
          // Buscar la variante con esta talla
          const variante = productoExistente.variantes.find(v =>
            String(v.talla).toLowerCase() === String(talla).toLowerCase()
          );

          if (variante) {
            // Solo actualizar si NO es vista previa
            if (!vistaPrevia) {
              variante.stock = stock;
            }
            variantesActualizadas++;
          }
        });

        if (variantesActualizadas > 0) {
          // Calcular el estado "después" para la vista previa
          if (esParaVistaPrevia && vistaPreviaProducto) {
            vistaPreviaProducto.despues = productoExistente.variantes.map(v => {
              const filaCSV = filas.find(f =>
                String(f.talla).toLowerCase() === String(v.talla).toLowerCase()
              );
              return {
                talla: v.talla,
                stock: filaCSV ? filaCSV.stock : v.stock
              };
            });
            vistaPreviaProductos.push(vistaPreviaProducto);
          }

          resultados.actualizados.push({
            sku: sku,
            nombre: productoExistente.nombre,
            variantesActualizadas: variantesActualizadas
          });
          productosActualizadosCount++;
        }
      }
    });

    // Solo guardar si NO es vista previa
    if (!vistaPrevia) {
      guardarDatos();
    }

    res.json({
      success: true,
      mensaje: vistaPrevia
        ? `Vista previa: ${productosActualizadosCount} productos serían actualizados`
        : `${productosActualizadosCount} productos actualizados correctamente`,
      resultados: resultados,
      vistaPrevia: vistaPrevia ? vistaPreviaProductos : undefined
    });

  } catch (error) {
    console.error('Error al actualizar stock:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al procesar el CSV',
      error: error.message
    });
  }
});

// Subir productos desde CSV con soporte de variantes
app.post('/api/productos/upload-csv', (req, res) => {
  const { productos: productosCSV, reemplazar, soloNuevos } = req.body;

  if (!productosCSV || !Array.isArray(productosCSV)) {
    return res.status(400).json({ mensaje: 'Datos inválidos' });
  }

  const resultados = {
    nuevos: [],
    actualizados: [],
    duplicados: [],
    variantesAgregadas: [],
    errores: []
  };

  try {
    // Expandir filas que tienen "tallas" (plural) en formato "36;37;38"
    const filasExpandidas = [];

    productosCSV.forEach((fila, index) => {
      // Si la fila tiene "tallas" (plural) con formato separado por punto y coma
      if (fila.tallas && typeof fila.tallas === 'string' && fila.tallas.includes(';')) {
        const tallasArray = fila.tallas.split(';').map(t => t.trim()).filter(t => t);

        // Crear una fila por cada talla
        tallasArray.forEach(talla => {
          filasExpandidas.push({
            ...fila,
            talla: talla,
            tallas: undefined, // Eliminar el campo tallas plural
            filaOriginal: index + 2
          });
        });
      } else if (fila.tallas && typeof fila.tallas === 'string' && !fila.tallas.includes(';')) {
        // Si tiene tallas pero no tiene punto y coma, es una sola talla
        filasExpandidas.push({
          ...fila,
          talla: fila.tallas,
          tallas: undefined,
          filaOriginal: index + 2
        });
      } else {
        // Si no tiene tallas o ya tiene talla (singular), usar tal cual
        filasExpandidas.push({
          ...fila,
          filaOriginal: index + 2
        });
      }
    });

    // Agrupar filas del CSV por SKU para detectar variantes
    const productosPorSKU = {};

    filasExpandidas.forEach((fila) => {
      const sku = fila.sku || `TEMP-${fila.filaOriginal}`;
      if (!productosPorSKU[sku]) {
        productosPorSKU[sku] = [];
      }
      productosPorSKU[sku].push(fila);
    });

    // Procesar cada grupo de SKU
    Object.keys(productosPorSKU).forEach(sku => {
      const filasGrupo = productosPorSKU[sku];

      try {
        // Si el SKU tiene múltiples filas, son variantes
        const esVariante = filasGrupo.length > 1 || filasGrupo[0].talla;

        // Tomar datos comunes de la primera fila
        const primeraFila = filasGrupo[0];

        // Construir variantes
        const variantes = filasGrupo.map((fila, varIndex) => {
          // Procesar imágenes
          let imagenesVariante = [];
          if (fila.imagenes) {
            imagenesVariante = Array.isArray(fila.imagenes) ? fila.imagenes : [fila.imagenes];
          } else if (fila.imagen) {
            imagenesVariante = Array.isArray(fila.imagen) ? fila.imagen : [fila.imagen];
          }

          return {
            id: varIndex + 1,
            talla: fila.talla || "Único",
            stock: parseInt(fila.stock) || 10,
            imagenes: imagenesVariante
          };
        });

        // Construir el producto con variantes
        const productoData = {
          sku: sku.startsWith('TEMP-') ? null : sku,
          nombre: primeraFila.nombre,
          precio: parseFloat(primeraFila.precio),
          categoria: primeraFila.categoria,
          descripcion: primeraFila.descripcion || "",
          nuevo: primeraFila.nuevo === 'true' || primeraFila.nuevo === true || false,
          destacado: primeraFila.destacado === 'true' || primeraFila.destacado === true || false,
          variantes: variantes
        };

        // Buscar producto existente por SKU
        const productoExistenteIndex = productoData.sku ? productos.findIndex(prod => prod.sku === productoData.sku) : -1;

        if (productoExistenteIndex !== -1) {
          // Producto existe con el mismo SKU
          if (reemplazar) {
            // Modo "Reemplazar y modificar datos": actualizar producto existente
            productos[productoExistenteIndex] = {
              ...productoData,
              id: productos[productoExistenteIndex].id // Mantener el ID original
            };
            resultados.actualizados.push({
              sku: productoData.sku,
              nombre: productoData.nombre,
              variantes: variantes.length,
              accion: 'actualizado'
            });
          } else if (soloNuevos) {
            // Modo "Solo productos nuevos": marcar como duplicado
            resultados.duplicados.push({
              sku: productoData.sku,
              nombre: productoData.nombre,
              accion: 'omitido - ya existe'
            });
          } else {
            // Sin opciones especiales: agregar variantes al producto existente
            const productoExistente = productos[productoExistenteIndex];
            const maxVarianteId = Math.max(...productoExistente.variantes.map(v => v.id), 0);
            const nuevasVariantes = variantes.map((v, idx) => ({
              ...v,
              id: maxVarianteId + idx + 1
            }));
            productoExistente.variantes.push(...nuevasVariantes);

            resultados.variantesAgregadas.push({
              sku: productoData.sku,
              nombre: productoData.nombre,
              variantes: nuevasVariantes.length,
              accion: 'variantes agregadas'
            });
          }
        } else {
          // Producto no existe: crear nuevo
          const nuevoProducto = {
            ...productoData,
            id: productoIdCounter++
          };
          productos.push(nuevoProducto);
          resultados.nuevos.push({
            sku: productoData.sku,
            nombre: productoData.nombre,
            variantes: variantes.length,
            accion: 'creado'
          });
        }
      } catch (error) {
        resultados.errores.push({
          sku: sku,
          error: error.message
        });
      }
    });

    guardarDatos();

    const totalProcesados = resultados.nuevos.length + resultados.actualizados.length + resultados.variantesAgregadas.length;
    const mensaje = `Importación completada: ${resultados.nuevos.length} nuevos, ${resultados.actualizados.length} actualizados, ${resultados.variantesAgregadas.length} con variantes agregadas, ${resultados.duplicados.length} duplicados omitidos, ${resultados.errores.length} errores`;

    res.status(201).json({
      mensaje,
      resultados,
      totalProcesados
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error procesando CSV',
      error: error.message
    });
  }
});

// Obtener todas las categorías
app.get('/api/categorias', (req, res) => {
  res.json(categorias);
});

// Crear una nueva categoría
app.post('/api/categorias', (req, res) => {
  const { nombre, parentId } = req.body;

  if (!nombre) {
    return res.status(400).json({ mensaje: 'El nombre de la categoría es requerido' });
  }

  // Verificar si el padre existe (si se especifica)
  if (parentId !== null && parentId !== undefined) {
    const parentExists = categorias.find(c => c.id === parseInt(parentId));
    if (!parentExists) {
      return res.status(400).json({ mensaje: 'La categoría padre no existe' });
    }
  }

  // Verificar si ya existe una categoría con ese nombre en el mismo nivel
  const existeCategoria = categorias.find(c =>
    c.nombre.toLowerCase() === nombre.toLowerCase() &&
    c.parentId === (parentId ? parseInt(parentId) : null)
  );

  if (existeCategoria) {
    return res.status(400).json({ mensaje: 'Ya existe una categoría con ese nombre en este nivel' });
  }

  const nuevaCategoria = {
    id: categoriaIdCounter++,
    nombre: nombre.toLowerCase(),
    parentId: parentId ? parseInt(parentId) : null
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

  const { nombre, parentId } = req.body;

  if (!nombre) {
    return res.status(400).json({ mensaje: 'El nombre de la categoría es requerido' });
  }

  // Verificar si el padre existe (si se especifica)
  if (parentId !== null && parentId !== undefined) {
    const parentExists = categorias.find(c => c.id === parseInt(parentId));
    if (!parentExists) {
      return res.status(400).json({ mensaje: 'La categoría padre no existe' });
    }
    // No permitir que una categoría sea su propio padre o crear ciclos
    if (parseInt(parentId) === id) {
      return res.status(400).json({ mensaje: 'Una categoría no puede ser su propio padre' });
    }
  }

  const nombreAntiguo = categorias[categoriaIndex].nombre;
  const nombreNuevo = nombre.toLowerCase();

  // Actualizar la categoría
  categorias[categoriaIndex].nombre = nombreNuevo;
  categorias[categoriaIndex].parentId = parentId ? parseInt(parentId) : null;

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

  // Verificar si hay subcategorías
  const subcategorias = categorias.filter(c => c.parentId === id);
  if (subcategorias.length > 0) {
    return res.status(400).json({
      mensaje: `No se puede eliminar la categoría porque tiene ${subcategorias.length} subcategoría(s)`
    });
  }

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
  const { nombre, porcentaje, tipo, aplicaA, fechaInicio, fechaFin, activo, codigo, montoMinimo, tipoBeneficio, tipoBeneficioGlobal, cantidad, tipoCodigo } = req.body;

  if (!nombre || !tipo) {
    return res.status(400).json({ mensaje: 'Nombre y tipo son requeridos' });
  }

  // Para descuentos de tipo "pedido", validar montoMinimo
  if (tipo === 'pedido') {
    if (!montoMinimo || montoMinimo < 0) {
      return res.status(400).json({ mensaje: 'El monto mínimo es requerido para descuentos de pedido' });
    }
    if (!tipoBeneficio) {
      return res.status(400).json({ mensaje: 'El tipo de beneficio es requerido para descuentos de pedido' });
    }
  } else {
    // Para otros tipos, validar porcentaje o cantidad según tipoBeneficioGlobal
    if (tipoBeneficioGlobal === 'porcentaje') {
      if (porcentaje === undefined || porcentaje < 0 || porcentaje > 100) {
        return res.status(400).json({ mensaje: 'El porcentaje debe estar entre 0 y 100' });
      }
    } else if (tipoBeneficioGlobal === 'cantidad') {
      if (cantidad === undefined || cantidad < 0) {
        return res.status(400).json({ mensaje: 'La cantidad debe ser mayor o igual a 0' });
      }
    }
  }

  const nuevoDescuento = {
    id: descuentoIdCounter++,
    nombre,
    porcentaje: parseFloat(porcentaje) || 0,
    tipo, // "general", "categoria", "producto", "pedido"
    aplicaA: aplicaA || null, // ID de categoría o producto, null si es general
    fechaInicio: fechaInicio || null,
    fechaFin: fechaFin || null,
    activo: activo !== undefined ? activo : true,
    codigo: codigo || null,
    tipoBeneficioGlobal: tipoBeneficioGlobal || 'porcentaje', // "porcentaje" o "cantidad"
    cantidad: parseFloat(cantidad) || 0,
    tipoCodigo: tipoCodigo || 'general', // "general" o "promocional"
    vecesUsado: 0,
    creadoEn: new Date().toISOString()
  };

  // Añadir campos específicos para descuentos de tipo "pedido"
  if (tipo === 'pedido') {
    nuevoDescuento.montoMinimo = parseFloat(montoMinimo);
    nuevoDescuento.tipoBeneficio = tipoBeneficio; // "envio_gratis" o "descuento"
  }

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

  const { nombre, porcentaje, tipo, aplicaA, fechaInicio, fechaFin, activo, codigo, montoMinimo, tipoBeneficio, tipoBeneficioGlobal, cantidad, tipoCodigo } = req.body;

  // Validar porcentaje si se proporciona y no es un descuento de pedido con envío gratis
  if (porcentaje !== undefined && (porcentaje < 0 || porcentaje > 100)) {
    return res.status(400).json({ mensaje: 'El porcentaje debe estar entre 0 y 100' });
  }

  // Validar cantidad si se proporciona
  if (cantidad !== undefined && cantidad < 0) {
    return res.status(400).json({ mensaje: 'La cantidad debe ser mayor o igual a 0' });
  }

  // Validar campos específicos de descuento de pedido
  if (tipo === 'pedido') {
    if (montoMinimo !== undefined && montoMinimo < 0) {
      return res.status(400).json({ mensaje: 'El monto mínimo debe ser mayor o igual a 0' });
    }
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
    tipoBeneficioGlobal: tipoBeneficioGlobal || descuentos[descuentoIndex].tipoBeneficioGlobal || 'porcentaje',
    cantidad: cantidad !== undefined ? parseFloat(cantidad) : (descuentos[descuentoIndex].cantidad || 0),
    tipoCodigo: tipoCodigo !== undefined ? tipoCodigo : (descuentos[descuentoIndex].tipoCodigo || 'general'),
    actualizadoEn: new Date().toISOString()
  };

  // Actualizar campos específicos para descuentos de tipo "pedido"
  if (tipo === 'pedido' || descuentos[descuentoIndex].tipo === 'pedido') {
    if (montoMinimo !== undefined) {
      descuentos[descuentoIndex].montoMinimo = parseFloat(montoMinimo);
    }
    if (tipoBeneficio !== undefined) {
      descuentos[descuentoIndex].tipoBeneficio = tipoBeneficio;
    }
  }

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

// Validar cupón promocional
app.post('/api/descuentos/validar-cupon', (req, res) => {
  const { codigo, subtotal } = req.body;

  if (!codigo) {
    return res.status(400).json({ valido: false, mensaje: 'Código de cupón requerido' });
  }

  if (subtotal === undefined || subtotal < 0) {
    return res.status(400).json({ valido: false, mensaje: 'Subtotal inválido' });
  }

  // Buscar el descuento por código
  const descuento = descuentos.find(d => d.codigo && d.codigo.toUpperCase() === codigo.toUpperCase());

  if (!descuento) {
    return res.status(404).json({ valido: false, mensaje: 'Cupón no encontrado' });
  }

  // Verificar que sea un código promocional
  if (descuento.tipoCodigo !== 'promocional') {
    return res.status(400).json({ valido: false, mensaje: 'Este código no es válido como cupón promocional' });
  }

  // Verificar si está activo
  if (!descuento.activo) {
    return res.status(400).json({ valido: false, mensaje: 'Este cupón no está activo' });
  }

  // Verificar fechas de validez
  const ahora = new Date();
  if (descuento.fechaInicio) {
    const fechaInicio = new Date(descuento.fechaInicio);
    if (ahora < fechaInicio) {
      return res.status(400).json({ valido: false, mensaje: 'Este cupón aún no es válido' });
    }
  }

  if (descuento.fechaFin) {
    const fechaFin = new Date(descuento.fechaFin);
    if (ahora > fechaFin) {
      return res.status(400).json({ valido: false, mensaje: 'Este cupón ha expirado' });
    }
  }

  // Verificar monto mínimo si existe
  if (descuento.montoMinimo && subtotal < descuento.montoMinimo) {
    return res.status(400).json({
      valido: false,
      mensaje: `El monto mínimo para este cupón es €${descuento.montoMinimo.toFixed(2)}`
    });
  }

  // Calcular el monto del descuento
  let montoDescuento = 0;

  if (descuento.tipoBeneficioGlobal === 'cantidad') {
    // Descuento de cantidad fija en euros
    montoDescuento = descuento.cantidad || 0;
  } else {
    // Descuento porcentual
    montoDescuento = (subtotal * (descuento.porcentaje || 0)) / 100;
  }

  // No permitir que el descuento sea mayor que el subtotal
  montoDescuento = Math.min(montoDescuento, subtotal);

  // Incrementar contador de uso
  descuento.vecesUsado = (descuento.vecesUsado || 0) + 1;
  guardarDatos();

  res.json({
    valido: true,
    mensaje: 'Cupón aplicado correctamente',
    descuento: {
      id: descuento.id,
      nombre: descuento.nombre,
      codigo: descuento.codigo,
      tipo: descuento.tipoBeneficioGlobal,
      valor: descuento.tipoBeneficioGlobal === 'cantidad' ? descuento.cantidad : descuento.porcentaje
    },
    montoDescuento: montoDescuento
  });
});

// ==================== RUTA DE CONTACTO (email simple) ====================

// Enviar email de contacto (no crea ticket)
app.post('/api/contacto', async (req, res) => {
  const { nombre, email, asunto, mensaje } = req.body;

  if (!nombre || !email || !asunto || !mensaje) {
    return res.status(400).json({ mensaje: 'Todos los campos son requeridos' });
  }

  try {
    await enviarEmailContacto({ nombre, email, asunto, mensaje });
    res.json({ success: true, mensaje: 'Mensaje enviado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al enviar el mensaje. Inténtalo más tarde.' });
  }
});

// ==================== RUTAS DE TICKETS DE SOPORTE ====================

// Crear un nuevo ticket (SOLO usuarios registrados)
app.post('/api/tickets', requireClientAuth, upload.array('archivos', 5), async (req, res) => {
  const { asunto, mensaje, prioridad, pedidoId } = req.body;

  if (!asunto || !mensaje) {
    return res.status(400).json({ mensaje: 'Asunto y mensaje son requeridos' });
  }

  // Obtener información del usuario autenticado
  const usuario = usuarios.find(u => u.id === req.session.clienteId);
  if (!usuario) {
    return res.status(404).json({ mensaje: 'Usuario no encontrado' });
  }

  // Validar que el pedido pertenezca al usuario (si se proporcionó)
  let pedido = null;
  if (pedidoId) {
    pedido = pedidos.find(p => p.id === parseInt(pedidoId) && p.clienteId === req.session.clienteId);
    if (!pedido) {
      return res.status(400).json({ mensaje: 'Pedido no encontrado o no pertenece al usuario' });
    }
  }

  // Procesar archivos adjuntos
  const archivosAdjuntos = req.files ? req.files.map(file => ({
    nombre: file.originalname,
    ruta: `/uploads/${file.filename}`,
    tamaño: file.size,
    tipo: file.mimetype
  })) : [];

  const nuevoTicket = {
    id: ticketIdCounter++,
    nombre: usuario.nombre,
    email: usuario.email,
    asunto,
    estado: 'Nuevo', // Estados: Nuevo, En Proceso, Resuelto, Cerrado
    prioridad: prioridad || 'Media', // Baja, Media, Alta, Urgente
    clienteId: req.session.clienteId,
    pedidoId: pedidoId ? parseInt(pedidoId) : null,
    pedido: pedido ? {
      id: pedido.id,
      fecha: pedido.fecha,
      total: pedido.total,
      estado: pedido.estado
    } : null,
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString(),
    archivos: archivosAdjuntos,
    mensajes: [
      {
        id: 1,
        autor: usuario.nombre,
        tipo: 'cliente', // 'cliente' o 'admin'
        mensaje: mensaje,
        archivos: archivosAdjuntos,
        fecha: new Date().toISOString()
      }
    ]
  };

  tickets.push(nuevoTicket);
  guardarDatos();

  // Enviar email de notificación
  enviarEmailNuevoTicket(nuevoTicket);

  res.status(201).json(nuevoTicket);
});

// Obtener todos los tickets (Admin) o solo los del cliente (Cliente autenticado)
app.get('/api/tickets', (req, res) => {
  // Si es admin (sesión de admin)
  if (req.session && req.session.userId) {
    // Admin ve todos los tickets
    const ticketsOrdenados = [...tickets].sort((a, b) =>
      new Date(b.fechaActualizacion) - new Date(a.fechaActualizacion)
    );
    return res.json(ticketsOrdenados);
  }

  // Si es cliente autenticado
  if (req.session && req.session.clienteId) {
    const ticketsCliente = tickets.filter(t => t.clienteId === req.session.clienteId);
    return res.json(ticketsCliente);
  }

  // Si no está autenticado, no puede ver tickets
  return res.status(401).json({ mensaje: 'No autorizado' });
});

// Obtener un ticket por ID
app.get('/api/tickets/:id', (req, res) => {
  const ticket = tickets.find(t => t.id === parseInt(req.params.id));

  if (!ticket) {
    return res.status(404).json({ mensaje: 'Ticket no encontrado' });
  }

  // Verificar permisos: admin puede ver todos, cliente solo los suyos
  if (req.session && req.session.userId) {
    // Es admin
    return res.json(ticket);
  }

  if (req.session && req.session.clienteId && ticket.clienteId === req.session.clienteId) {
    // Es el cliente dueño del ticket
    return res.json(ticket);
  }

  return res.status(403).json({ mensaje: 'No tienes permiso para ver este ticket' });
});

// Agregar mensaje a un ticket
app.post('/api/tickets/:id/mensajes', upload.array('archivos', 5), (req, res) => {
  const id = parseInt(req.params.id);
  const { mensaje } = req.body;

  if (!mensaje) {
    return res.status(400).json({ mensaje: 'El mensaje es requerido' });
  }

  const ticket = tickets.find(t => t.id === id);

  if (!ticket) {
    return res.status(404).json({ mensaje: 'Ticket no encontrado' });
  }

  // Determinar tipo y autor del mensaje
  let tipo = 'cliente';
  let autor = ticket.nombre;

  if (req.session && req.session.userId) {
    // Es admin
    tipo = 'admin';
    autor = 'Soporte';
  } else if (req.session && req.session.clienteId && ticket.clienteId !== req.session.clienteId) {
    return res.status(403).json({ mensaje: 'No tienes permiso para responder a este ticket' });
  }

  // Procesar archivos adjuntos
  const archivosAdjuntos = req.files ? req.files.map(file => ({
    nombre: file.originalname,
    ruta: `/uploads/${file.filename}`,
    tamaño: file.size,
    tipo: file.mimetype
  })) : [];

  const nuevoMensaje = {
    id: ticket.mensajes.length + 1,
    autor,
    tipo,
    mensaje,
    archivos: archivosAdjuntos,
    fecha: new Date().toISOString()
  };

  ticket.mensajes.push(nuevoMensaje);
  ticket.fechaActualizacion = new Date().toISOString();

  // Si el admin responde, cambiar estado a "En Proceso"
  if (tipo === 'admin' && ticket.estado === 'Nuevo') {
    ticket.estado = 'En Proceso';
  }

  guardarDatos();
  res.json(ticket);
});

// Actualizar estado de un ticket (Admin)
app.put('/api/tickets/:id/estado', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const { estado } = req.body;

  if (!estado) {
    return res.status(400).json({ mensaje: 'El estado es requerido' });
  }

  const estadosValidos = ['Nuevo', 'En Proceso', 'Resuelto', 'Cerrado'];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ mensaje: 'Estado inválido' });
  }

  const ticket = tickets.find(t => t.id === id);

  if (!ticket) {
    return res.status(404).json({ mensaje: 'Ticket no encontrado' });
  }

  ticket.estado = estado;
  ticket.fechaActualizacion = new Date().toISOString();

  guardarDatos();
  res.json(ticket);
});

// Actualizar prioridad de un ticket (Admin)
app.put('/api/tickets/:id/prioridad', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const { prioridad } = req.body;

  if (!prioridad) {
    return res.status(400).json({ mensaje: 'La prioridad es requerida' });
  }

  const prioridadesValidas = ['Baja', 'Media', 'Alta', 'Urgente'];
  if (!prioridadesValidas.includes(prioridad)) {
    return res.status(400).json({ mensaje: 'Prioridad inválida' });
  }

  const ticket = tickets.find(t => t.id === id);

  if (!ticket) {
    return res.status(404).json({ mensaje: 'Ticket no encontrado' });
  }

  ticket.prioridad = prioridad;
  ticket.fechaActualizacion = new Date().toISOString();

  guardarDatos();
  res.json(ticket);
});

// Eliminar un ticket (Admin)
app.delete('/api/tickets/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const ticketIndex = tickets.findIndex(t => t.id === id);

  if (ticketIndex === -1) {
    return res.status(404).json({ mensaje: 'Ticket no encontrado' });
  }

  tickets.splice(ticketIndex, 1);
  guardarDatos();
  res.json({ mensaje: 'Ticket eliminado correctamente' });
});

// ==================== ACTUALIZACIÓN AUTOMÁTICA DE PRODUCTOS ====================

const CSV_URL = 'https://dropshippingzapatos.com/Csv/All/InventarioShopify.csv';

// Función para obtener la última actualización
function getUltimaActualizacion() {
  try {
    if (fs.existsSync(AUTO_UPDATE_FILE)) {
      const data = JSON.parse(fs.readFileSync(AUTO_UPDATE_FILE, 'utf8'));
      return data;
    }
  } catch (error) {
    console.error('Error leyendo última actualización:', error);
  }
  return { ultimaActualizacion: null, estado: 'nunca', productosActualizados: 0 };
}

// Función para guardar la última actualización
function guardarUltimaActualizacion(estado, productosActualizados = 0, error = null) {
  const data = {
    ultimaActualizacion: new Date().toISOString(),
    estado, // 'exito', 'error', 'en_proceso'
    productosActualizados,
    error
  };
  fs.writeFileSync(AUTO_UPDATE_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Función para parsear CSV
function parseCSV(text) {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"(.*)"$/, '$1'));
  const productos = [];

  for (let i = 1; i < lines.length; i++) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^"(.*)"$/, '$1'));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^"(.*)"$/, '$1'));

    if (values.length === headers.length) {
      const producto = {};
      headers.forEach((header, index) => {
        producto[header] = values[index];
      });
      productos.push(producto);
    }
  }

  return productos;
}

// Función para actualizar productos desde CSV
async function actualizarProductosAutomatico() {
  console.log('🔄 Iniciando actualización automática de productos...');
  guardarUltimaActualizacion('en_proceso', 0);

  try {
    // Descargar CSV
    const response = await axios.get(CSV_URL, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (response.status !== 200) {
      throw new Error(`Error al descargar CSV: ${response.status}`);
    }

    // Parsear CSV
    const productosCSV = parseCSV(response.data);
    console.log(`📦 CSV descargado: ${productosCSV.length} productos encontrados`);

    if (productosCSV.length === 0) {
      throw new Error('El CSV está vacío');
    }

    // Leer productos actuales
    let allData = {};
    if (fs.existsSync(PRODUCTOS_FILE)) {
      allData = JSON.parse(fs.readFileSync(PRODUCTOS_FILE, 'utf8'));
    }
    let productos = allData.productos || [];

    let productosActualizados = 0;

    // Actualizar stock de cada producto
    productosCSV.forEach((fila) => {
      const sku = fila.SKU || fila.sku || fila.Handle || fila.handle;
      const stockStr = fila.Stock || fila.stock || fila['Variant Inventory Qty'] || fila.quantity || '0';
      const stock = parseInt(stockStr) || 0;

      if (!sku) return;

      // Buscar producto por SKU
      const producto = productos.find(p => p.sku === sku);

      if (producto) {
        // Si el producto tiene variantes
        if (producto.variantes && producto.variantes.length > 0) {
          producto.variantes.forEach(variante => {
            if (variante.sku === sku) {
              variante.stock = stock;
              productosActualizados++;
            }
          });
        } else {
          // Producto sin variantes
          producto.stock = stock;
          productosActualizados++;
        }
      }
    });

    // Guardar productos actualizados
    allData.productos = productos;
    fs.writeFileSync(PRODUCTOS_FILE, JSON.stringify(allData, null, 2), 'utf8');

    console.log(`✅ Actualización completada: ${productosActualizados} productos actualizados`);
    guardarUltimaActualizacion('exito', productosActualizados);

  } catch (error) {
    console.error('❌ Error en actualización automática:', error.message);
    guardarUltimaActualizacion('error', 0, error.message);
  }
}

// Configurar cron job para actualizar cada 2 horas
// Formato: minuto hora día mes día-semana
// 0 */2 * * * = cada 2 horas en el minuto 0
cron.schedule('0 */2 * * *', () => {
  console.log('⏰ Ejecutando actualización programada de productos...');
  actualizarProductosAutomatico();
});

// Ejecutar actualización al iniciar el servidor
setTimeout(() => {
  console.log('🚀 Ejecutando primera actualización de productos...');
  actualizarProductosAutomatico();
}, 5000); // Esperar 5 segundos después del inicio

// ==================== FIN ACTUALIZACIÓN AUTOMÁTICA ====================

// ==================== ENDPOINTS DE MARKETING ====================

// Endpoint para enviar emails masivos
app.post('/api/marketing/enviar-email', requireAuth, async (req, res) => {
  try {
    const { destinatarios, asunto, mensaje } = req.body;

    if (!destinatarios || !Array.isArray(destinatarios) || destinatarios.length === 0) {
      return res.status(400).json({ error: 'Debes proporcionar al menos un destinatario' });
    }

    if (!asunto || !mensaje) {
      return res.status(400).json({ error: 'El asunto y el mensaje son obligatorios' });
    }

    // Enviar email a cada destinatario
    const resultados = await Promise.allSettled(
      destinatarios.map(async (email) => {
        const mailOptions = {
          from: '"ShoeLandia" <info@shoelandia.es>',
          to: email,
          subject: asunto,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f0e8;">
              <div style="background: white; padding: 30px; border-radius: 10px;">
                <h2 style="color: #1a1a1a; margin-bottom: 20px;">ShoeLandia</h2>
                <div style="color: #333; line-height: 1.6;">
                  ${mensaje.replace(/\n/g, '<br>')}
                </div>
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                <p style="color: #999; font-size: 0.9em; text-align: center;">
                  Este email fue enviado por ShoeLandia<br>
                  <a href="https://shoelandia.es" style="color: #667eea;">www.shoelandia.es</a>
                </p>
              </div>
            </div>
          `
        };

        return await transporter.sendMail(mailOptions);
      })
    );

    // Contar éxitos y fallos
    const exitosos = resultados.filter(r => r.status === 'fulfilled').length;
    const fallidos = resultados.filter(r => r.status === 'rejected').length;

    console.log(`📧 Emails enviados: ${exitosos} exitosos, ${fallidos} fallidos`);

    res.json({
      success: true,
      exitosos,
      fallidos,
      total: destinatarios.length
    });

  } catch (error) {
    console.error('❌ Error enviando emails:', error);
    res.status(500).json({ error: 'Error al enviar los emails' });
  }
});

// Endpoint para registrar compartidas en RRSS
app.post('/api/marketing/registrar-compartir', requireAuth, async (req, res) => {
  try {
    const { productoId, redSocial, texto } = req.body;

    // Aquí podrías guardar estadísticas de compartidas
    console.log(`📱 Producto ${productoId} compartido en ${redSocial}`);

    // Por ahora solo registramos en consola, pero podrías guardar en un archivo JSON
    // para hacer análisis de qué productos se comparten más

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error registrando compartida:', error);
    res.status(500).json({ error: 'Error al registrar la compartida' });
  }
});

// ==================== FIN ENDPOINTS DE MARKETING ====================

// Endpoint de prueba para enviar correo (TEMPORAL - eliminar en producción)
app.get('/api/test-email', async (req, res) => {
  try {
    await transporter.sendMail({
      from: '"ShoeLandia Test" <info@shoelandia.es>',
      to: 'pablo.martinezruiz@protonmail.com',
      subject: 'Prueba de Correo - ShoeLandia',
      html: `
        <h1 style="color: #667eea;">¡Correo de Prueba!</h1>
        <p>Este correo se envió correctamente desde el servidor de ShoeLandia.</p>
        <p>Configuración SMTP de OVH funcionando ✅</p>
      `
    });
    res.json({ success: true, message: 'Correo de prueba enviado correctamente' });
  } catch (error) {
    console.error('❌ Error en prueba de correo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Servir index.html para todas las demás rutas (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
  console.log(`📡 Accesible públicamente en http://109.205.182.103`);
  console.log(`🌐 Tienda: http://109.205.182.103`);
  console.log(`📊 Admin: http://109.205.182.103/admin`);
  console.log(`🔄 Actualización automática programada cada 2 horas`);
});
