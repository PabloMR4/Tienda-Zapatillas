# 👟 Shoelandia - E-commerce de Zapatillas

Una tienda online completa y profesional para la venta de zapatillas, con un frontend moderno en React y un backend robusto en Node.js. Diseñada con todas las funcionalidades necesarias para un e-commerce real en producción.

## 🌐 Demo en Vivo

**URL:** [https://shoelandia.es](https://shoelandia.es)

## ✨ Características Principales

### 🛒 E-commerce Completo
- Sistema de productos con categorías dinámicas
- Carrito de compras con persistencia
- Proceso de checkout completo
- Integración con **Stripe** para pagos reales
- Sistema de pedidos con seguimiento
- Gestión de stock automática
- Códigos de descuento y cupones

### 👤 Sistema de Usuarios
- Registro e inicio de sesión
- Autenticación con JWT
- Perfiles de usuario personalizados
- Historial de pedidos
- Sistema de roles (admin/usuario)

### 🎟️ Soporte al Cliente
- Sistema de tickets de soporte
- Estados: Nuevo, En Proceso, Resuelto, Cerrado
- Prioridades configurables
- Panel de gestión de tickets para administradores

### 📊 Panel de Administración Completo
Acceso en `/admin` con credenciales:
- **Usuario:** admin
- **Contraseña:** admin123

**Secciones del panel:**
- 🏠 **Dashboard**: Estadísticas generales, gráficas de ventas
- 📋 **Pedidos**: Gestión completa de pedidos y estados
- 📦 **Productos**: CRUD completo, actualización masiva vía CSV
- 🎟️ **Descuentos**: Creación y gestión de códigos promocionales
- 👥 **Clientes**: Base de datos de clientes y estadísticas
- 🎫 **Tickets**: Sistema de soporte al cliente
- 📧 **Marketing**: Envío de emails masivos a clientes
- 📊 **Analíticas**: Integración con Google Analytics

### 🎨 Diseño y UX
- Diseño responsive 100% mobile-first
- Animaciones suaves y transiciones elegantes
- Tema de Halloween personalizable
- Banner promocional configurable
- Navegación intuitiva con menús desplegables
- Modal de productos con zoom de imágenes
- Footer completo con redes sociales

### 📧 Sistema de Email
- Confirmaciones de pedido automáticas
- Notificaciones de cambio de estado
- Marketing por email desde el panel admin
- Integración con Nodemailer

### 🔒 Seguridad
- Contraseñas hasheadas con bcrypt
- Tokens JWT para autenticación
- Variables de entorno para datos sensibles
- Validación de datos en frontend y backend
- Protección CORS configurada

## 🏗️ Arquitectura del Proyecto

```
Tienda-Zapatillas/
├── backend/
│   ├── server.js              # Servidor Express principal
│   ├── dashboard.html         # Panel de administración
│   ├── login.html             # Login del panel admin
│   ├── data/
│   │   ├── productos.json     # Base de datos de productos
│   │   ├── pedidos.json       # Pedidos realizados
│   │   ├── usuarios.json      # Usuarios registrados
│   │   ├── descuentos.json    # Códigos promocionales
│   │   ├── tickets.json       # Tickets de soporte
│   │   └── categorias.json    # Categorías de productos
│   ├── .env.example           # Variables de entorno
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Home.jsx               # Página principal
│   │   │   ├── Navbar.jsx             # Barra de navegación
│   │   │   ├── ProductGrid.jsx        # Cuadrícula de productos
│   │   │   ├── ProductModal.jsx       # Modal de detalles
│   │   │   ├── Cart.jsx               # Carrito de compras
│   │   │   ├── Checkout.jsx           # Proceso de pago
│   │   │   ├── StripeCheckout.jsx     # Integración Stripe
│   │   │   ├── Login.jsx              # Login de usuarios
│   │   │   ├── Register.jsx           # Registro de usuarios
│   │   │   ├── UserProfile.jsx        # Perfil de usuario
│   │   │   ├── CategoryPage.jsx       # Página de categoría
│   │   │   ├── Contact.jsx            # Formulario de contacto
│   │   │   ├── MisTickets.jsx         # Tickets del usuario
│   │   │   ├── AdminDescuentos.jsx    # Gestión de descuentos
│   │   │   ├── AdminAnalytics.jsx     # Panel de analíticas
│   │   │   ├── Footer.jsx             # Footer del sitio
│   │   │   └── HalloweenDecorations.jsx
│   │   ├── context/
│   │   │   ├── CartContext.jsx        # Estado del carrito
│   │   │   └── AuthContext.jsx        # Estado de autenticación
│   │   ├── services/
│   │   │   └── api.js                 # Cliente API
│   │   └── styles/                    # Estilos CSS por componente
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── ecosystem.config.js        # Configuración PM2
├── .gitignore
└── README.md
```

## 🚀 Instalación y Configuración

### Requisitos Previos
- Node.js v16 o superior
- npm o yarn
- PM2 (para producción)
- Cuenta de Stripe (para pagos)
- Cuenta de Google Analytics (opcional)

### 1. Clonar el Repositorio

```bash
git clone https://github.com/PabloMR4/Tienda-Zapatillas.git
cd Tienda-Zapatillas
```

### 2. Configurar Backend

```bash
cd backend
npm install
```

Crea un archivo `.env` basándote en `.env.example`:

```env
PORT=3001
STRIPE_SECRET_KEY=tu_clave_secreta_de_stripe
JWT_SECRET=tu_secreto_jwt
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion
```

### 3. Configurar Frontend

```bash
cd ../frontend
npm install
```

### 4. Ejecutar en Desarrollo

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### 5. Despliegue en Producción

El proyecto está configurado para usar PM2:

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Compilar frontend
cd frontend
npm run build

# Iniciar con PM2
cd ..
pm2 start ecosystem.config.js

# Guardar configuración
pm2 save

# Configurar inicio automático
pm2 startup
```

## 📡 API Endpoints

### Productos
- `GET /api/productos` - Obtener todos los productos
- `GET /api/productos/:id` - Obtener producto por ID
- `POST /api/productos` - Crear producto (admin)
- `PUT /api/productos/:id` - Actualizar producto (admin)
- `DELETE /api/productos/:id` - Eliminar producto (admin)
- `POST /api/productos/csv` - Importar productos desde CSV (admin)

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login de usuario
- `GET /api/auth/verify` - Verificar token JWT

### Pedidos
- `POST /api/pedidos` - Crear pedido
- `GET /api/pedidos` - Obtener todos los pedidos (admin)
- `GET /api/pedidos/usuario/:usuarioId` - Pedidos de un usuario
- `PATCH /api/pedidos/:id` - Actualizar estado de pedido (admin)

### Tickets de Soporte
- `POST /api/tickets` - Crear ticket
- `GET /api/tickets` - Obtener todos los tickets (admin)
- `GET /api/tickets/usuario/:usuarioId` - Tickets de un usuario
- `PATCH /api/tickets/:id` - Actualizar ticket

### Descuentos
- `GET /api/descuentos` - Obtener descuentos (admin)
- `POST /api/descuentos` - Crear descuento (admin)
- `POST /api/descuentos/validar` - Validar código de descuento
- `DELETE /api/descuentos/:codigo` - Eliminar descuento (admin)

### Stripe
- `POST /api/stripe/create-payment-intent` - Crear intención de pago
- `POST /api/stripe/webhook` - Webhook de Stripe

### Email
- `POST /api/email/send` - Enviar email individual
- `POST /api/email/send-bulk` - Enviar emails masivos (admin)

## 🎯 Funcionalidades Destacadas

### Importación Masiva de Productos
El panel admin permite importar productos desde archivos CSV con:
- Actualización de stock existente
- Adición de productos nuevos
- Validación de datos
- Vista previa antes de importar

### Sistema de Descuentos
- Códigos de descuento personalizados
- Porcentajes o cantidades fijas
- Fechas de validez
- Límite de usos
- Aplicación automática en checkout

### Marketing por Email
- Segmentación de clientes
- Plantillas de email
- Envío masivo desde el panel
- Historial de emails enviados

### Analíticas
- Integración lista para Google Analytics
- Dashboard con métricas clave
- Acceso directo a Analytics desde el panel
- Instrucciones de configuración incluidas

## 🎨 Personalización

### Cambiar Tema de Colores

Edita las variables CSS en `frontend/src/styles/index.css`:

```css
:root {
  --primary-color: #2c3e50;
  --accent-color: #3498db;
  --bg-color: #ffffff;
  /* ... más variables */
}
```

### Configurar Stripe

1. Crea una cuenta en [Stripe](https://stripe.com)
2. Obtén tus claves API (test o production)
3. Añádelas al `.env` del backend
4. Las claves públicas van en el frontend

### Configurar Email

Usa Gmail con contraseña de aplicación:

1. Activa la verificación en 2 pasos
2. Genera una contraseña de aplicación
3. Añádela al `.env` como `EMAIL_PASS`

## 🔐 Credenciales de Acceso

### Panel de Administración
- **URL:** `/admin`
- **Usuario:** `admin`
- **Contraseña:** `admin123`

### Usuario de Prueba
Crea uno desde el registro o en el panel admin

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** - Framework UI
- **Vite** - Build tool y dev server
- **React Router** - Navegación
- **Context API** - Gestión de estado
- **Stripe React** - Integración de pagos
- **CSS3** - Estilos y animaciones

### Backend
- **Node.js** - Runtime
- **Express.js** - Framework web
- **JWT** - Autenticación
- **Bcrypt** - Encriptación de contraseñas
- **Stripe** - Procesamiento de pagos
- **Nodemailer** - Envío de emails
- **Node-cron** - Tareas programadas
- **Multer** - Upload de archivos
- **CORS** - Seguridad

### Producción
- **PM2** - Process manager
- **Nginx** - Reverse proxy
- **Certbot** - SSL/HTTPS
- **Contabo VPS** - Hosting

## 📈 Estado del Proyecto

✅ **Funcional en Producción:** [https://shoelandia.es](https://shoelandia.es)

### Características Implementadas
- [x] Sistema completo de e-commerce
- [x] Integración con Stripe
- [x] Panel de administración
- [x] Sistema de usuarios
- [x] Tickets de soporte
- [x] Marketing por email
- [x] Descuentos y cupones
- [x] Responsive design
- [x] Integración con Google Analytics

### Próximas Mejoras
- [ ] Sistema de reviews y valoraciones
- [ ] Wishlist/favoritos
- [ ] Comparador de productos
- [ ] Chat en vivo
- [ ] Notificaciones push
- [ ] Multi-idioma
- [ ] Multi-moneda

## 📄 Licencia

MIT License - Siéntete libre de usar este proyecto para tus propios fines.

## 👨‍💻 Autor

**Pablo MR**
- GitHub: [@PabloMR4](https://github.com/PabloMR4)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Si tienes preguntas o necesitas ayuda, abre un issue en GitHub.

---

Desarrollado con ❤️ usando React y Node.js
