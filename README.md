# MODA - Tienda de Moda de Lujo

Una aplicación web moderna y elegante para vender productos de moda, con un frontend impresionante en React y un backend robusto en Node.js.

## Características

### Frontend
- Diseño minimalista de lujo con animaciones suaves
- Hero section con efecto parallax
- Galería de productos con efectos hover impresionantes
- Filtrado de productos por categoría
- Carrito de compras deslizante
- Sistema de checkout completo
- Diseño 100% responsive
- Fuentes premium (Playfair Display & Montserrat)

### Backend
- API REST completa
- Gestión de productos
- Sistema de pedidos
- Panel de administración elegante
- Base de datos en memoria (fácilmente migratable a MongoDB/PostgreSQL)

## Estructura del Proyecto

```
Moda/
├── backend/
│   ├── server.js          # Servidor Express
│   ├── admin.html         # Panel de administración
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/    # Componentes React
    │   ├── context/       # Context API para el carrito
    │   ├── services/      # Servicios de API
    │   └── styles/        # Estilos CSS
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## Instalación

### Requisitos Previos
- Node.js (v16 o superior)
- npm o yarn

### Paso 1: Instalar dependencias del Backend

```bash
cd backend
npm install
```

### Paso 2: Instalar dependencias del Frontend

```bash
cd ../frontend
npm install
```

## Ejecución

### Iniciar el Backend (Puerto 3001)

En una terminal:

```bash
cd backend
npm start
```

El servidor estará corriendo en `http://localhost:3001`

### Iniciar el Frontend (Puerto 3000)

En otra terminal:

```bash
cd frontend
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Acceder al Panel de Administración

Una vez el backend esté corriendo, accede a:

```
http://localhost:3001/admin
```

Aquí podrás ver todos los pedidos realizados, estadísticas de ventas y detalles de clientes.

## Uso

1. **Página Principal**: Navega por la colección de productos de moda
2. **Filtrar**: Usa los botones de filtro para ver productos por categoría
3. **Añadir al Carrito**: Haz hover sobre un producto y selecciona tu talla
4. **Ver Carrito**: Haz clic en el icono del carrito en la esquina superior derecha
5. **Finalizar Compra**: En el carrito, haz clic en "Proceder al Pago"
6. **Completar Pedido**: Rellena el formulario y confirma tu pedido

## Tecnologías Utilizadas

### Frontend
- React 18
- Vite (Build tool)
- Context API (State management)
- CSS3 (Animaciones y estilos)
- Google Fonts

### Backend
- Node.js
- Express.js
- CORS
- Body Parser

## Personalización

### Añadir más productos

Edita el array `productos` en `backend/server.js`:

```javascript
{
  id: 9,
  nombre: "Tu Producto",
  precio: 99.99,
  categoria: "categoria",
  imagen: "url-de-imagen",
  descripcion: "Descripción del producto",
  tallas: ["S", "M", "L"],
  nuevo: true
}
```

### Cambiar colores

Modifica las variables CSS en `frontend/src/styles/index.css`:

```css
:root {
  --primary-color: #1a1a1a;
  --accent-color: #d4af37;
  /* etc... */
}
```

## API Endpoints

### Productos
- `GET /api/productos` - Obtener todos los productos
- `GET /api/productos/:id` - Obtener un producto específico

### Pedidos
- `POST /api/pedidos` - Crear un nuevo pedido
- `GET /api/pedidos` - Obtener todos los pedidos
- `GET /api/pedidos/:id` - Obtener un pedido específico
- `PATCH /api/pedidos/:id` - Actualizar estado del pedido

## Próximas Mejoras

- Integración con pasarela de pago real (Stripe/PayPal)
- Base de datos persistente (MongoDB/PostgreSQL)
- Sistema de autenticación de usuarios
- Wishlist/favoritos
- Sistema de reviews y valoraciones
- Búsqueda avanzada de productos
- Integración con sistema de envíos

## Licencia

MIT

---

Desarrollado con ❤️ para crear una experiencia de compra de lujo
