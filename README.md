# 👟 Shoelandia - E-commerce de Zapatillas

Una tienda online completa y profesional para la venta de zapatillas, con un frontend moderno en React y un backend robusto en Node.js. Diseñada con todas las funcionalidades necesarias para un e-commerce real en producción.

## 🌐 Demo en Vivo

**URL:** [https://shoelandia.es](https://shoelandia.es)

## ✨ Características Principales

### 🛒 E-commerce Completo
- Sistema de productos con categorías dinámicas y variantes
- Carrito de compras con persistencia
- Proceso de checkout completo
- Integración con **Stripe** para pagos reales
- Sistema de pedidos con seguimiento
- Gestión de stock automática
- Códigos de descuento y cupones

### 👤 Sistema de Usuarios
- Registro e inicio de sesión
- Autenticación con JWT y sesiones seguras
- Perfiles de usuario personalizados
- Historial de pedidos
- Sistema de roles (admin/usuario)

### 🎟️ Soporte al Cliente
- Sistema de tickets de soporte
- Estados: Nuevo, En Proceso, Resuelto, Cerrado
- Prioridades configurables
- Panel de gestión de tickets para administradores
- Notificaciones por email automáticas

### 📱 Marketing en Redes Sociales (NUEVO)
- **Publicación automática en Instagram y Facebook**
- Procesamiento de imágenes con círculos de género (rosa para mujer, azul para hombre)
- Soporte para carruseles de múltiples imágenes en Instagram
- Mensajes automáticos personalizados con hashtags
- **Historial de publicaciones** con capacidad de eliminar
- **Contadores sincronizados** de publicaciones por red social
- Tokens de larga duración (60 días) con renovación automática
- Limpieza automática de archivos temporales cada 24h

### 📊 Panel de Administración Completo
Acceso en `/admin` o `/dashboard` con credenciales:
- **Usuario:** admin
- **Contraseña:** admin123

**Secciones del panel:**
- 🏠 **Dashboard**: Estadísticas generales, gráficas de ventas en tiempo real
- 📋 **Pedidos**: Gestión completa de pedidos y estados
- 📦 **Productos**: CRUD completo, actualización masiva vía CSV
- 🎟️ **Descuentos**: Creación y gestión de códigos promocionales
- 👥 **Clientes**: Base de datos de clientes y estadísticas
- 🎫 **Tickets**: Sistema de soporte al cliente
- 📧 **Marketing Email**: Envío de emails masivos a clientes
- 📱 **Marketing RRSS**: Publicación automática en Instagram y Facebook (NUEVO)
- 📊 **Analíticas**: Integración con Google Analytics

### 🎨 Diseño y UX
- Diseño responsive 100% mobile-first
- Animaciones suaves y transiciones elegantes
- Navegación intuitiva con menús desplegables
- Modal de productos con zoom de imágenes
- Footer completo con redes sociales
- Badges visuales de contadores de RRSS (NUEVO)

### 📧 Sistema de Email
- Confirmaciones de pedido automáticas
- Notificaciones de cambio de estado
- Notificaciones de tickets de soporte
- Marketing por email desde el panel admin
- Integración con Nodemailer y SMTP

### 🔒 Seguridad
- Contraseñas hasheadas con bcrypt
- Tokens JWT para autenticación
- Sesiones seguras con express-session
- Variables de entorno para datos sensibles
- Validación de datos en frontend y backend
- Protección CORS configurada
- Timeouts aumentados para operaciones largas

## 🏗️ Arquitectura del Proyecto

```
Tienda-Zapatillas/
├── backend/
│   ├── server.js              # Servidor Express principal
│   ├── dashboard.html         # Panel de administración
│   ├── login.html             # Login del panel admin
│   ├── reset-counters.js      # Script de mantenimiento (NUEVO)
│   ├── data/
│   │   ├── productos.json     # Base de datos de productos
│   │   ├── pedidos.json       # Pedidos realizados
│   │   ├── usuarios.json      # Usuarios registrados
│   │   ├── descuentos.json    # Códigos promocionales
│   │   ├── tickets.json       # Tickets de soporte
│   │   ├── publicaciones.json # Historial de RRSS (NUEVO)
│   │   ├── categorias.json    # Categorías de productos
│   │   └── auto_update.json   # Actualizaciones automáticas
│   ├── uploads/               # Imágenes procesadas temporales (NUEVO)
│   ├── .env                   # Variables de entorno
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
│   │   │   ├── AdminMarketingRRSS.jsx # Marketing RRSS (NUEVO)
│   │   │   ├── Footer.jsx             # Footer del sitio
│   │   │   └── HalloweenDecorations.jsx
│   │   ├── context/
│   │   │   ├── CartContext.jsx        # Estado del carrito
│   │   │   └── AuthContext.jsx        # Estado de autenticación
│   │   ├── services/
│   │   │   └── api.js                 # Cliente API
│   │   └── styles/                    # Estilos CSS por componente
│   │       └── AdminMarketingRRSS.css # Estilos RRSS (NUEVO)
│   ├── dist/                  # Build de producción
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
- Cuenta de Facebook Developer (para Instagram/Facebook API)
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

Crea un archivo `.env` con:

```env
# Stripe
STRIPE_SECRET_KEY=tu_clave_secreta_de_stripe
STRIPE_PUBLISHABLE_KEY=tu_clave_publica_de_stripe

# Email
EMAIL_USER=info@tudominio.es
EMAIL_PASSWORD=tu_contraseña_smtp

# Instagram API (Token de larga duración - 60 días)
INSTAGRAM_ACCESS_TOKEN=tu_token_de_instagram
INSTAGRAM_ACCOUNT_ID=tu_instagram_account_id

# Facebook API (Token de página de larga duración - 60 días)
FACEBOOK_PAGE_ID=tu_facebook_page_id
FACEBOOK_PAGE_ACCESS_TOKEN=tu_facebook_page_token
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
# o con nodemon
nodemon server.js
```

**Frontend:**
```bash
cd frontend
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### 5. Despliegue en Producción

El proyecto está configurado para usar PM2 y Nginx:

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Compilar frontend
cd frontend
npm run build

# Iniciar backend con PM2
cd ../backend
pm2 start server.js --name shoelandia-backend

# Iniciar preview del frontend con PM2
cd ../frontend
pm2 start "npm run preview" --name shoelandia-frontend

# Guardar configuración
pm2 save

# Configurar inicio automático
pm2 startup
```

**Configuración de Nginx:**
```nginx
server {
    server_name tudominio.com www.tudominio.com;

    client_max_body_size 20M;

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;

        # Timeouts aumentados para publicaciones en RRSS
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
        proxy_read_timeout 300;
        send_timeout 300;
    }

    location / {
        proxy_pass http://localhost:4173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tudominio.com/privkey.pem;
}
```

## 📡 API Endpoints

### Productos
- `GET /api/productos` - Obtener todos los productos
- `GET /api/productos/:id` - Obtener producto por ID
- `POST /api/productos` - Crear producto (admin)
- `PUT /api/productos/:id` - Actualizar producto (admin)
- `DELETE /api/productos/:id` - Eliminar producto (admin)
- `POST /api/productos/csv` - Importar productos desde CSV (admin)
- `POST /api/productos/:id/instagram-share` - Incrementar contadores de RRSS (NUEVO)

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login de usuario
- `GET /api/auth/verify` - Verificar token JWT
- `POST /api/login` - Login admin dashboard
- `POST /api/logout` - Logout admin

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

### Marketing en Redes Sociales (NUEVO)
- `POST /api/instagram/publicar` - Publicar en Instagram y Facebook
- `GET /api/publicaciones` - Obtener historial de publicaciones
- `DELETE /api/publicaciones/:id` - Eliminar publicación del historial

### Stripe
- `POST /api/stripe/create-payment-intent` - Crear intención de pago
- `POST /api/stripe/webhook` - Webhook de Stripe

### Email
- `POST /api/email/send` - Enviar email individual
- `POST /api/email/send-bulk` - Enviar emails masivos (admin)

## 🎯 Funcionalidades Destacadas

### Sistema de Marketing en Redes Sociales (NUEVO)

**Características:**
- Publicación simultánea en Instagram y Facebook
- Procesamiento automático de imágenes con círculos de género:
  - **Rosa (#FF69B4)** para productos de mujer
  - **Azul (#4169E1)** para productos de hombre
- Soporte para carruseles de hasta 10 imágenes en Instagram
- Detección automática de género desde categorías
- Mensajes personalizados con información del producto
- Historial completo de publicaciones con:
  - Fecha y hora de publicación
  - Redes sociales donde se publicó
  - Texto completo de la publicación
  - Capacidad de eliminar de cada red individual
- Contadores visuales sincronizados:
  - Badge de Instagram con gradiente
  - Badge de Facebook en azul corporativo
  - Sincronización automática con historial
- Limpieza automática de archivos temporales cada 24h

**Uso:**
1. Accede al panel admin → Marketing RRSS
2. Selecciona uno o varios productos
3. Personaliza el mensaje (opcional)
4. Haz clic en "Compartir en RRSS"
5. Se publican automáticamente en ambas redes con círculos de género

### Importación Masiva de Productos
El panel admin permite importar productos desde archivos CSV con:
- Actualización de stock existente
- Adición de productos nuevos
- Validación de datos
- Vista previa antes de importar
- Actualización automática cada 2 horas

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

## 🔧 Configuración de APIs Externas

### Configurar Instagram/Facebook API

1. **Crear App de Facebook:**
   - Ve a [Facebook Developers](https://developers.facebook.com/)
   - Crea una nueva app
   - Añade el producto "Instagram Graph API"

2. **Obtener Tokens de Larga Duración:**

   Genera un token de usuario con estos permisos:
   - `pages_show_list`
   - `pages_read_engagement`
   - `pages_manage_posts`
   - `instagram_basic`
   - `instagram_content_publish`
   - `business_management`

   Convierte a token de larga duración (60 días):
   ```bash
   curl -G "https://graph.facebook.com/v18.0/oauth/access_token" \
     -d "grant_type=fb_exchange_token" \
     -d "client_id=TU_APP_ID" \
     -d "client_secret=TU_APP_SECRET" \
     -d "fb_exchange_token=TU_TOKEN_CORTO"
   ```

   Obtén el token de página:
   ```bash
   curl -G "https://graph.facebook.com/v18.0/me/accounts" \
     -d "access_token=TU_TOKEN_DE_LARGA_DURACION"
   ```

3. **Añadir al .env:**
   ```env
   INSTAGRAM_ACCESS_TOKEN=tu_token_de_instagram
   INSTAGRAM_ACCOUNT_ID=tu_instagram_account_id
   FACEBOOK_PAGE_ID=tu_facebook_page_id
   FACEBOOK_PAGE_ACCESS_TOKEN=tu_facebook_page_token
   ```

### Configurar Stripe

1. Crea una cuenta en [Stripe](https://stripe.com)
2. Obtén tus claves API (test o production)
3. Añádelas al `.env` del backend
4. Las claves públicas van en el frontend

### Configurar Email SMTP

Usa cualquier proveedor SMTP (Gmail, OVH, SendGrid, etc.):

1. Obtén credenciales SMTP
2. Añade al `.env`:
   ```env
   EMAIL_USER=tu_email@dominio.com
   EMAIL_PASSWORD=tu_contraseña_smtp
   ```

## 🔐 Credenciales de Acceso

### Panel de Administración
- **URL:** `/admin` o `/dashboard`
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
- **Sharp** - Procesamiento de imágenes (NUEVO)
- **Axios** - Cliente HTTP para APIs
- **Node-cron** - Tareas programadas
- **Multer** - Upload de archivos
- **CORS** - Seguridad

### APIs Externas
- **Instagram Graph API** - Publicación en Instagram
- **Facebook Graph API** - Publicación en Facebook
- **Stripe API** - Procesamiento de pagos
- **Google Analytics** - Analíticas

### Producción
- **PM2** - Process manager
- **Nginx** - Reverse proxy y load balancer
- **Certbot** - SSL/HTTPS automático
- **Contabo VPS** - Hosting (Ubuntu 22.04)

## 📈 Estado del Proyecto

✅ **Funcional en Producción:** [https://shoelandia.es](https://shoelandia.es)

### Características Implementadas
- [x] Sistema completo de e-commerce
- [x] Integración con Stripe
- [x] Panel de administración completo
- [x] Sistema de usuarios con JWT
- [x] Tickets de soporte
- [x] Marketing por email
- [x] Descuentos y cupones
- [x] Responsive design
- [x] Integración con Google Analytics
- [x] **Marketing en Redes Sociales (Instagram + Facebook)**
- [x] **Procesamiento automático de imágenes**
- [x] **Historial de publicaciones**
- [x] **Contadores sincronizados de RRSS**
- [x] **Limpieza automática de archivos temporales**
- [x] **Actualización automática de productos vía CSV**

### Próximas Mejoras
- [ ] Sistema de reviews y valoraciones
- [ ] Wishlist/favoritos
- [ ] Comparador de productos
- [ ] Chat en vivo
- [ ] Notificaciones push
- [ ] Multi-idioma (i18n)
- [ ] Multi-moneda
- [ ] Publicación en Twitter/X
- [ ] Stories de Instagram automáticas

## 🐛 Troubleshooting

### Problema: Timeout en publicaciones de RRSS
**Solución:** Los timeouts de Nginx están configurados a 300 segundos (5 minutos). Si aún así falla, verifica:
- Token de Facebook no expirado
- Imágenes accesibles públicamente
- Límites de API de Instagram no excedidos

### Problema: Los posts no se eliminan de Instagram
**Nota:** La API de Instagram NO permite eliminar posts publicados. Solo se eliminan del historial local. Debes eliminar manualmente desde la app de Instagram.

### Problema: Contadores desincronizados
**Solución:** Ejecuta el script de reinicio:
```bash
cd backend
node reset-counters.js
pm2 restart shoelandia-backend
```

## 📄 Licencia

MIT License - Siéntete libre de usar este proyecto para tus propios fines.

## 👨‍💻 Autor

**Pablo MR**
- GitHub: [@PabloMR4](https://github.com/PabloMR4)
- Proyecto: Shoelandia E-commerce
- Año: 2024-2025

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Si tienes preguntas o necesitas ayuda:
- Abre un issue en GitHub
- Consulta la documentación de las APIs utilizadas
- Revisa los logs del servidor: `pm2 logs shoelandia-backend`

## 🙏 Agradecimientos

- Facebook/Meta por la Instagram Graph API
- Stripe por su excelente API de pagos
- La comunidad de React y Node.js
- Todos los contribuidores y usuarios de Shoelandia

---

**Desarrollado con ❤️ usando React, Node.js y mucho café ☕**

**Shoelandia © 2024-2025** - Tu tienda de zapatillas online
