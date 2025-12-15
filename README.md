# San Juan Construye - Webapp de Pedidos

Una webapp moderna de pedidos para ferretería desarrollada con HTML5, CSS3 y JavaScript vanilla. Diseñada con un estilo ecommerce profesional similar a MercadoLibre, Amazon, eBay y Alibaba.

## 🎯 Características Principales

### ✅ Funcionalidades Implementadas
- **Sistema de Pedidos Completo**: Sin procesamiento de pagos, solo generación de pedidos
- **Catálogo de Productos**: Organizado por categorías con búsqueda avanzada
- **Carrito de Compras**: Gestión completa de productos y cantidades
- **Confirmación de Pedidos**: Sistema de confirmación con resumen detallado
- **Integración Google Sheets**: Carga de productos desde hojas de cálculo con Apps Script
- **Formulario de Cliente**: Captura de datos del cliente antes del pedido
- **Integración WhatsApp**: Envío automático de pedidos por WhatsApp
- **Google Forms**: Captura de datos de clientes automáticamente
- **Diseño Responsive**: Optimizado para desktop, tablet y móvil
- **Sistema de Promociones**: Badges y carruseles para ofertas especiales
- **Parallax Effects**: Efectos visuales modernos en el hero section
- **Gestión de Imágenes**: Placeholder dinámico con colores por categoría

### 🎨 Diseño y UX
- **Estilo Moderno**: Inspirado en las mejores prácticas de ecommerce
- **Paleta de Colores**: Azul corporativo (#0047AB) y naranja de acción (#EF6C00)
- **Tipografía**: Inter font para máxima legibilidad
- **Animaciones**: Transiciones suaves y efectos hover
- **Accesibilidad**: Cumplimiento de estándares web modernos

### 📱 Responsive Design
- **Mobile First**: Diseño optimizado para dispositivos móviles
- **Breakpoints**: 320px, 768px, 1024px, 1280px
- **Touch Friendly**: Botones y controles optimizados para táctil

### 🚀 Nuevas Integraciones (2024)
- **Google Apps Script**: Carga dinámica de productos desde Google Sheets
- **WhatsApp Business**: Envío automático de pedidos al negocio y confirmación al cliente
- **Google Forms**: Captura automática de datos del cliente
- **Formulario Modal**: Interfaz moderna para datos del cliente
- **Validación en Tiempo Real**: Validación de campos con feedback inmediato

## 🗂️ Estructura del Proyecto

```
san-juan-construye/
├── index.html                    # Página principal
├── productos.html                 # Catálogo de productos
├── carrito.html                   # Carrito de compras
├── confirmacion.html              # Confirmación de pedido
├── CONFIGURACION.md               # Guía de configuración detallada
├── google-apps-script.js          # Código para Google Apps Script
├── README.md                      # Documentación
├── styles/
│   ├── main.css                  # Estilos principales
│   ├── responsive.css            # Estilos responsive
│   ├── products.css              # Estilos página productos
│   ├── cart.css                  # Estilos página carrito
│   ├── confirmation.css          # Estilos confirmación
│   └── customer-form.css         # Estilos formulario cliente
├── scripts/
│   ├── app.js                    # Lógica principal
│   ├── products.js               # Gestión productos y Google Sheets
│   ├── products-page.js          # Funcionalidad página productos
│   ├── cart.js                   # Gestión del carrito
│   ├── confirmation.js           # Página de confirmación
│   ├── google-sheets-integration.js # Integración Google Sheets + Apps Script
│   ├── whatsapp-integration.js   # Integración WhatsApp Business
│   └── customer-form.js          # Formulario de datos del cliente
└── assets/
    └── favicon.ico               # Icono del sitio
```

## 🚀 Instalación y Uso

### Requisitos
- Servidor web local (Apache, Nginx, o Python SimpleHTTPServer)
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Cuenta de Google Sheets (opcional, para carga dinámica de productos)

### Instalación Local

1. **Clonar o descargar el proyecto**
   ```bash
   # Si usas git
   git clone [URL_DEL_REPOSITORIO]
   
   # O descargar ZIP y extraer
   ```

2. **Iniciar servidor local**
   ```bash
   # Con Python 3
   python -m http.server 8000
   
   # Con Python 2
   python -m SimpleHTTPServer 8000
   
   # Con Node.js (requiere npm install -g http-server)
   http-server
   
   # Con PHP
   php -S localhost:8000
   ```

3. **Abrir en navegador**
   ```
   http://localhost:8000
   ```

### Configuración de Google Sheets (Opcional)

Para cargar productos dinámicamente desde Google Sheets:

1. **Crear Google Sheets** con las siguientes columnas:
   ```
   | ID | Nombre | Descripción | Precio | Promoción | Categoría | Imagen | Stock | Código |
   ```

2. **Hacer público el sheet**:
   - Clic en "Compartir" → "Cambiar a cualquier persona con el enlace"
   - Asegurarse de que esté en modo "Lector"

3. **Obtener URL del sheet**:
   ```
   https://docs.google.com/spreadsheets/d/TU_SHEET_ID/edit#gid=0
   ```

4. **Configurar en products.js**:
   ```javascript
   // En scripts/products.js, descomentar y modificar:
   window.productsManager.configureGoogleSheets(
       'https://docs.google.com/spreadsheets/d/TU_SHEET_ID/edit',
       'TU_API_KEY_OPTIONAL' // Opcional para límites más altos
   );
   ```

## 📋 Funcionalidades Detalladas

### Página Principal (index.html)
- **Hero Section**: Banner principal con parallax
- **Categorías**: Navegación por categorías de productos
- **Carrusel de Ofertas**: Productos en promoción
- **Productos Destacados**: Selección de productos principales
- **Newsletter**: Suscripción a promociones

### Página de Productos (productos.html)
- **Búsqueda Avanzada**: Por nombre, descripción, código
- **Filtros**:
  - Por categoría
  - Por rango de precio
  - Solo productos en oferta
  - Solo productos en stock
- **Ordenamiento**: Por nombre, precio, promoción, stock
- **Vistas**: Grid y lista
- **Paginación**: Navegación entre páginas de resultados

### Carrito de Compras (carrito.html)
- **Gestión de Cantidades**: Incrementar/decrementar productos
- **Eliminación de Items**: Quitar productos del carrito
- **Cálculo de Totales**: Subtotal, ahorros, total
- **Opciones de Entrega**: Retiro en tienda y envío
- **Productos Recomendados**: Sugerencias basadas en carrito actual

### Confirmación de Pedido (confirmacion.html)
- **Resumen Completo**: Detalles del pedido confirmado
- **Número de Pedido**: Identificador único generado
- **Próximos Pasos**: Guía del proceso post-pedido
- **Información de Contacto**: Múltiples canales de comunicación
- **Acciones**: Continuar comprando, imprimir pedido

## 🎨 Sistema de Diseño

### Colores Principales
```css
--primary-700: #0047AB    /* Azul corporativo */
--primary-500: #0056D2    /* Azul medio */
--primary-50:  #E3F2FD    /* Azul claro */
--secondary-600: #EF6C00  /* Naranja de acción */
--secondary-500: #FF9100  /* Naranja medio */
--red-discount: #D32F2F   /* Rojo para descuentos */
--green-success: #2E7D32  /* Verde para éxito */
```

### Tipografía
- **Fuente Principal**: Inter (Google Fonts)
- **Pesos**: 400, 500, 600, 700, 800
- **Escalas**: Mobile-first responsive

### Espaciado
- **Sistema de 4px**: Espaciado consistente
- **Variables CSS**: Fácil personalización
- **Grid de 12 columnas**: Layout responsive

## 🔧 Personalización

### Cambiar Colores
Modificar las variables CSS en `styles/main.css`:
```css
:root {
    --primary-700: #TU_COLOR_AZUL;
    --secondary-600: #TU_COLOR_NARANJA;
    /* ... otros colores */
}
```

### Añadir Productos
**Opción 1: Modificar datos en app.js**
```javascript
// En scripts/app.js, modificar el array products
```

**Opción 2: Google Sheets** (Recomendado)
- Configurar según instrucciones anteriores
- Los productos se cargan automáticamente

### Modificar Categorías
En `scripts/app.js`:
```javascript
this.categories = [
    'herramientas',
    'materiales', 
    'pintura',
    'electricidad',
    'plomeria',
    'ferreteria',
    'tu_nueva_categoria'
];
```

### Personalizar Información de Contacto
Modificar en `index.html`, `productos.html`, `carrito.html`, `confirmacion.html`:
```html
<!-- Buscar y modificar -->
<span>Av. San Juan 1234, Buenos Aires</span>
<span>+54 11 4567-8900</span>
<span>info@sanjuanconstruye.com</span>
```

## 🌐 Compatibilidad

### Navegadores Soportados
- **Chrome**: 70+
- **Firefox**: 65+
- **Safari**: 12+
- **Edge**: 79+

### Características Utilizadas
- CSS Grid y Flexbox
- ES6+ JavaScript
- LocalStorage API
- Fetch API
- CSS Custom Properties

## 📱 Funcionalidades Móviles

### Optimizaciones Móviles
- **Touch Targets**: Mínimo 44px para botones
- **Navegación**: Menú hamburguesa en móvil
- **Filtros**: Bottom sheet para filtros
- **Carrito**: Layout vertical optimizado
- **Scroll**: Suavizado y optimizado

### Viewport
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

## 🚀 Despliegue

### Opciones de Hosting
1. **Netlify** (Recomendado para static sites)
2. **Vercel**
3. **GitHub Pages**
4. **AWS S3**
5. **Servidor tradicional**

### Configuración para Producción
1. **Minificar CSS/JS** (opcional)
2. **Optimizar imágenes** (opcional)
3. **Configurar redirects** (opcional)
4. **HTTPS** (recomendado)

### Ejemplo Netlify
1. Subir archivos a repositorio Git
2. Conectar repositorio en Netlify
3. Configurar build settings:
   - Build command: (vacío)
   - Publish directory: ./

## 🛠️ Mantenimiento

### Actualizar Productos
1. **Google Sheets**: Modificar directamente
2. **Código**: Actualizar array en `scripts/app.js`

### Añadir Funcionalidades
- **Nuevas páginas**: Seguir estructura existente
- **Nuevos estilos**: Modularizar en archivos CSS
- **Nueva funcionalidad**: Extender clases JavaScript

### Monitoreo
- **Analytics**: Google Analytics, etc.
- **Performance**: Lighthouse audits
- **Testing**: Browser testing manual

## 📞 Soporte

### Información de Contacto
- **Email**: info@sanjuanconstruye.com
- **Teléfono**: +54 11 4567-8900
- **WhatsApp**: +54 11 4567-8900
- **Dirección**: Av. San Juan 1234, Buenos Aires

### Horarios de Atención
- **Lunes - Viernes**: 8:00 - 18:00
- **Sábados**: 8:00 - 13:00
- **Domingos**: Cerrado

## 📄 Licencia

Este proyecto es propiedad de San Juan Construye. Todos los derechos reservados.

---

## 🎯 Próximas Mejoras

### Funcionalidades Planificadas
- [ ] Sistema de usuarios/registro
- [ ] Historial de pedidos
- [ ] Wishlist/Favoritos
- [ ] Chat en vivo
- [ ] PWA (Progressive Web App)
- [ ] Notificaciones push
- [ ] Integración con WhatsApp Business API
- [ ] Sistema de calificaciones/reviews
- [ ] Descuentos por cantidad
- [ ] Códigos promocionales

### Mejoras Técnicas
- [ ] Bundle con Webpack/Vite
- [ ] TypeScript
- [ ] Testing automatizado
- [ ] CI/CD pipeline
- [ ] Optimización de imágenes automática
- [ ] Service Worker para offline
- [ ] Lazy loading avanzado
- [ ] SSR (Server Side Rendering)

---

---

## 🎉 **Actualizaciones Recientes (2024)**

### ✨ **Nuevas Funcionalidades Principales**

1. **📋 Formulario de Cliente**
   - Modal moderno para capturar datos del cliente
   - Validación en tiempo real
   - Opciones de entrega y pago
   - Integración automática con WhatsApp y Google Forms

2. **📱 Integración WhatsApp Business**
   - Envío automático de pedidos al negocio
   - Mensaje de confirmación al cliente
   - Formato estructurado con todos los detalles
   - Soporte para números argentinos

3. **📊 Google Sheets + Apps Script**
   - Carga dinámica de productos
   - Apps Script para procesamiento de datos
   - Cache local para mejor performance
   - Fallback a datos estáticos si falla conexión

4. **🖼️ Gestión de Imágenes Mejorada**
   - Solucionado problema de `via.placeholder.com`
   - Uso de `placehold.co` más confiable
   - Placeholders dinámicos con colores por categoría
   - Soporte para imágenes propias desde Google Sheets

5. **📝 Google Forms Integration**
   - Captura automática de datos del cliente
   - Envío estructurado de información del pedido
   - Integración con el formulario de cliente

### 🔧 **Mejoras Técnicas**

- **Arquitectura Modular**: Scripts separados por funcionalidad
- **Manejo de Errores**: Fallbacks y mensajes informativos
- **Performance**: Cache local y carga asíncrona
- **UX**: Animaciones y transiciones suaves
- **Accesibilidad**: Mejor navegación por teclado

### 🎯 **Flujo Completo del Pedido**

1. **Cliente navega** productos y agrega al carrito
2. **Va al carrito** y hace clic en "Continuar con Datos del Cliente"
3. **Completa formulario** con datos personales y preferencias
4. **Sistema envía automáticamente**:
   - Pedido por WhatsApp al negocio
   - Datos por Google Forms
   - Confirmación por WhatsApp al cliente
5. **Cliente recibe** mensaje de confirmación
6. **Negocio recibe** todos los datos para procesar

### 📞 **Contacto y Configuración**

Para configurar todas las integraciones, consultar:
- **`CONFIGURACION.md`**: Guía paso a paso detallada
- **`google-apps-script.js`**: Código para Google Apps Script
- Comentarios en código para configuración

---

**Desarrollado con ❤️ para San Juan Construye**