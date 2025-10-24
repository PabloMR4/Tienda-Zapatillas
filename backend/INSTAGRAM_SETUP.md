# 📷 Configuración de Instagram para Publicaciones Automáticas

Esta guía te ayudará a configurar la integración con Instagram para publicar productos directamente desde el panel administrativo de Shoelandia.

## 📋 Requisitos Previos

1. **Cuenta de Instagram Business** (no Personal ni Creator)
2. **Página de Facebook** conectada a tu cuenta de Instagram
3. **Cuenta de Desarrollador de Meta** (Facebook)
4. Las imágenes de productos deben estar **públicamente accesibles** (URLs públicas)

---

## 🚀 Pasos de Configuración

### Paso 1: Convertir tu cuenta de Instagram a Business

1. Abre la app de Instagram
2. Ve a **Configuración** → **Cuenta**
3. Selecciona **Cambiar a cuenta profesional**
4. Elige **Empresa** como tipo de cuenta
5. Completa la información de tu negocio

### Paso 2: Conectar Instagram con una Página de Facebook

1. En Instagram, ve a **Configuración** → **Cuenta**
2. Selecciona **Páginas conectadas**
3. Conecta o crea una **Página de Facebook**
4. Asegúrate de que tienes permisos de administrador en la página

### Paso 3: Crear una App de Meta (Facebook)

1. Ve a [Meta for Developers](https://developers.facebook.com/)
2. Inicia sesión con tu cuenta de Facebook
3. Haz clic en **Mis Apps** → **Crear App**
4. Selecciona el tipo **Empresa** (Business)
5. Dale un nombre a tu app (ej: "Shoelandia Marketing")
6. Añade un email de contacto
7. Haz clic en **Crear App**

### Paso 4: Configurar la App

1. En el Dashboard de tu app, busca **Instagram Basic Display** o **Instagram Graph API**
2. Haz clic en **Configurar** en la tarjeta de Instagram
3. Si no aparece, ve a **Productos** → **Añadir productos** → Busca **Instagram Graph API**

### Paso 5: Obtener el Token de Acceso

#### Opción A: Usando la Herramienta de Explorador de Graph API (Recomendado para desarrollo)

1. Ve a [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. En la parte superior derecha:
   - Selecciona tu App que creaste
   - Selecciona tu Página de Facebook
3. En "Permissions", añade los siguientes permisos:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_read_engagement`
   - `pages_show_list`
4. Haz clic en **Generate Access Token**
5. Acepta los permisos solicitados
6. Copia el token generado

**⚠️ IMPORTANTE:** Este token es temporal (1-2 horas). Para producción, necesitas un token de larga duración.

#### Opción B: Obtener Token de Larga Duración (Para Producción)

1. Una vez que tengas el token temporal, ve a:
   ```
   https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=TU_APP_ID&client_secret=TU_APP_SECRET&fb_exchange_token=TU_TOKEN_TEMPORAL
   ```

2. Reemplaza:
   - `TU_APP_ID`: ID de tu app (lo encuentras en Configuración → Básica)
   - `TU_APP_SECRET`: Secret de tu app (mismo lugar)
   - `TU_TOKEN_TEMPORAL`: El token que obtuviste en el paso anterior

3. Esto te dará un token que dura **60 días**

### Paso 6: Obtener el Instagram Account ID

1. Ve nuevamente a [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Con tu token configurado, ejecuta esta consulta:
   ```
   me?fields=instagram_business_account
   ```
3. Haz clic en **Submit**
4. En la respuesta verás algo como:
   ```json
   {
     "instagram_business_account": {
       "id": "123456789012345"
     },
     "id": "..."
   }
   ```
5. Copia el **id** que está dentro de `instagram_business_account`

### Paso 7: Configurar las Variables de Entorno

1. Abre el archivo `.env` en la carpeta `backend/`
2. Añade las siguientes líneas:

```env
INSTAGRAM_ACCESS_TOKEN=tu_token_de_acceso_aqui
INSTAGRAM_ACCOUNT_ID=tu_instagram_business_account_id_aqui
```

3. Guarda el archivo

### Paso 8: Reiniciar el Servidor

```bash
pm2 restart shoelandia-backend
```

---

## ✅ Verificar que Funciona

1. Accede al panel administrativo: `https://shoelandia.es/admin`
2. Ve a **Marketing** → **Marketing RRSS**
3. Selecciona un producto
4. Haz clic en **Compartir**
5. Escribe el texto de la publicación
6. Haz clic en **📷 Publicar en Instagram**
7. Si todo está configurado correctamente, verás el mensaje: ✅ ¡Publicado exitosamente en Instagram!

---

## 🔧 Solución de Problemas

### Error: "Instagram no está configurado"
- Verifica que las variables `INSTAGRAM_ACCESS_TOKEN` e `INSTAGRAM_ACCOUNT_ID` estén en el archivo `.env`
- Asegúrate de que no haya espacios extra en las variables
- Reinicia el servidor después de añadir las variables

### Error: "Invalid OAuth access token"
- Tu token ha expirado. Genera uno nuevo siguiendo el Paso 5
- Para evitar esto en producción, usa un token de larga duración (Opción B del Paso 5)

### Error: "Error uploading photo"
- Verifica que la URL de la imagen sea **pública** y accesible desde internet
- Instagram requiere que las imágenes sean HTTPS (no HTTP)
- La imagen debe ser JPEG o PNG
- Tamaño mínimo: 320px, máximo: 8MB

### Error: "Permissions error"
- Asegúrate de que tu token tenga los permisos:
  - `instagram_basic`
  - `instagram_content_publish`
- Vuelve a generar el token con todos los permisos necesarios

### Error: "Instagram account is not a business account"
- Tu cuenta de Instagram debe ser de tipo **Business** (no Personal ni Creator)
- Sigue el Paso 1 para convertir tu cuenta

---

## 📚 Recursos Adicionales

- [Documentación oficial de Instagram Graph API](https://developers.facebook.com/docs/instagram-api/)
- [Guía de Content Publishing](https://developers.facebook.com/docs/instagram-api/guides/content-publishing)
- [Herramienta de Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- [Token de Acceso de Larga Duración](https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived)

---

## 🔐 Seguridad

- **NUNCA** compartas tu token de acceso públicamente
- **NUNCA** subas tu archivo `.env` a Git (está en `.gitignore`)
- Rota tu token regularmente (cada 60 días si usas tokens de larga duración)
- Revisa los permisos de tu app periódicamente

---

## 📝 Notas

- Las publicaciones se hacen inmediatamente en tu feed de Instagram
- Instagram tiene límites de rate (aproximadamente 25 publicaciones por día)
- Las imágenes deben cumplir con las políticas de contenido de Instagram
- No puedes publicar Stories (solo posts) con esta API básica

---

## 💡 Mejoras Futuras

- Sistema de cola para programar publicaciones
- Preview de la publicación antes de publicar
- Soporte para publicaciones de carrusel (múltiples imágenes)
- Analytics de las publicaciones
- Publicación en Stories

---

Si tienes problemas con la configuración, revisa los logs del servidor:
```bash
pm2 logs shoelandia-backend
```
