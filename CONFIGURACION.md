# 🔧 Configuración - San Juan Construye Webapp

Esta guía te ayudará a configurar todas las integraciones de la webapp de San Juan Construye.

## 📋 Índice
1. [Google Sheets + Apps Script](#google-sheets--apps-script)
2. [WhatsApp Integration](#whatsapp-integration)
3. [Google Forms](#google-forms)
4. [Configuración de Imágenes](#configuración-de-imágenes)
5. [Configuración de Productos](#configuración-de-productos)

---

## 📊 Google Sheets + Apps Script

### Paso 1: Crear Google Sheets

1. **Crear nuevo Google Sheets**
   - Ir a [Google Sheets](https://sheets.google.com)
   - Crear nuevo archivo llamado "San Juan Construye - Productos"

2. **Configurar columnas** (en este orden exacto):
   ```
   A: id          - ID único del producto
   B: nombre      - Nombre del producto
   C: descripcion - Descripción del producto
   D: precio      - Precio (número)
   E: promocion   - % de descuento (número)
   F: categoria   - Categoría del producto
   G: imagen      - URL de la imagen
   H: stock       - Stock disponible
   I: codigo      - Código del producto
   ```

3. **Hacer público el sheet**
   - Clic en "Compartir"
   - "Cambiar a cualquier persona con el enlace"
   - Asegurar que esté en modo "Lector"

4. **Obtener URL del sheet**
   ```
   https://docs.google.com/spreadsheets/d/TU_SHEET_ID/edit
   ```

### Paso 2: Configurar Google Apps Script

1. **Crear proyecto Apps Script**
   - Ir a [script.google.com](https://script.google.com)
   - Crear nuevo proyecto
   - Borrar código por defecto

2. **Copiar código de Apps Script**
   - Usar el archivo `google-apps-script.js` incluido
   - Reemplazar todo el código en Apps Script

3. **Configurar variables**
   ```javascript
   const CONFIG = {
       SHEETS_URL: 'https://docs.google.com/spreadsheets/d/TU_SHEET_ID/edit',
       SHEET_ID: '0', // Usualmente '0' para el primer sheet
       // ... resto de configuración
   };
   ```

4. **Desplegar como Web App**
   - Clic en "Deploy" > "New deployment"
   - Seleccionar "Web app"
   - Configurar:
     - Execute as: Me
     - Who has access: Anyone
   - Clic en "Deploy"
   - **Copiar la URL del Web App**

### Paso 3: Configurar en la Webapp

1. **Editar `scripts/app.js`** (al final del archivo):
   ```javascript
   // Configurar Google Sheets
   window.googleSheets.configure(
       'https://script.google.com/macros/s/TU_APP_SCRIPT_ID/exec',
       'https://docs.google.com/spreadsheets/d/TU_SHEET_ID/edit',
       'TU_API_KEY' // Opcional
   );
   ```

2. **O crear archivo de configuración separado**:
   ```javascript
   // config.js
   window.GOOGLE_SHEETS_CONFIG = {
       appScriptUrl: 'https://script.google.com/macros/s/TU_APP_SCRIPT_ID/exec',
       sheetsUrl: 'https://docs.google.com/spreadsheets/d/TU_SHEET_ID/edit',
       apiKey: 'TU_API_KEY' // Opcional
   };
   ```

---

## 📱 WhatsApp Integration

### Configuración Básica

1. **Configurar número de WhatsApp Business**
   ```javascript
   // En whatsapp-integration.js
   window.whatsApp.setPhoneNumber('5491145678900'); // Tu número
   window.whatsApp.setBusinessName('San Juan Construye');
   ```

2. **Configurar mediante variables globales**:
   ```javascript
   window.WHATSAPP_PHONE = '5491145678900';
   window.BUSINESS_NAME = 'San Juan Construye';
   ```

### Formato del Número

- **Argentinian format**: `5491145678900`
- **Local format**: `1145678900`
- **International format**: `+54 11 4567-8900`

---

## 📋 Google Forms

### Crear Google Form para Captura de Clientes

1. **Crear nuevo Google Form**
   - Ir a [forms.google.com](https://forms.google.com)
   - Crear nuevo formulario "San Juan Construye - Pedidos"

2. **Configurar campos** (en este orden):
   ```
   1. Nombre completo (Texto)
   2. Teléfono (Texto)
   3. Email (Texto)
   4. Dirección (Texto)
   5. Localidad (Texto)
   6. Comentarios (Párrafo)
   7. Método de entrega (Opción múltiple)
   8. Método de pago (Opción múltiple)
   9. Order ID (Texto)
   10. Total (Texto)
   11. Items Count (Texto)
   ```

3. **Configurar respuestas**
   - Clic en "Enviar" > "Obtener enlace directo"
   - **Copiar URL del formulario**

### Configurar en la Webapp

```javascript
// En customer-form.js
window.GOOGLE_FORMS_CONFIG = {
    url: 'https://docs.google.com/forms/d/e/TU_FORM_ID/formResponse'
};
```

**Nota**: Los IDs de los campos (`entry.NOMBRE_ID`) deben coincidir con los IDs reales del Google Form.

---

## 🖼️ Configuración de Imágenes

### Solución al Error `via.placeholder.com`

La webapp ahora usa `placehold.co` que es más confiable:

```javascript
// URLs de imágenes actualizadas
https://placehold.co/300x300/0047AB/FFFFFF?text=Taladro
https://placehold.co/300x300/0056D2/FFFFFF?text=Cemento
https://placehold.co/300x300/EF6C00/FFFFFF?text=Pintura
```

### Colores por Categoría

```javascript
const categoryColors = {
    herramientas: '0047AB', // Azul
    materiales: '0056D2',   // Azul medio
    pintura: 'EF6C00',      // Naranja
    electricidad: '2E7D32', // Verde
    plomeria: 'D32F2F',     // Rojo
    ferreteria: '0288D1'    // Azul claro
};
```

### Agregar Imágenes Propias

En Google Sheets, columna G (imagen), usar URLs directas:

```
https://tudominio.com/images/producto1.jpg
https://imagenes.ejemplo.com/taladro.jpg
```

---

## 🛍️ Configuración de Productos

### Estructura en Google Sheets

| Campo | Tipo | Requerido | Ejemplo |
|-------|------|-----------|---------|
| id | Número | No (auto-generado) | 1 |
| nombre | Texto | Sí | "Taladro Black & Decker" |
| descripcion | Texto | Sí | "Taladro de 1/2 HP..." |
| precio | Número | Sí | 8500 |
| promocion | Número | No (0-100) | 15 |
| categoria | Texto | Sí | "herramientas" |
| imagen | URL | No | URL de imagen |
| stock | Número | No | 15 |
| codigo | Texto | No | "TAL001" |

### Categorías Válidas

```javascript
const VALID_CATEGORIES = [
    'herramientas',
    'materiales',
    'pintura',
    'electricidad',
    'plomeria',
    'ferreteria'
];
```

### Ejemplo de Datos

```
1,Taladro Black & Decker 1/2 HP,Taladro de 1/2 HP con mandril,8500,15,herramientas,https://...jpg,15,TAL001
2,Cemento Portland 50kg,Cemento tipo I para obras,3200,0,materiales,https://...jpg,50,MAT001
```

---

## ⚙️ Configuración Rápida

### 1. Variables de Entorno

Crear archivo `config.js`:

```javascript
// Configuración San Juan Construye
window.SAN_JUAN_CONFIG = {
    // Google Sheets
    googleSheets: {
        appScriptUrl: 'https://script.google.com/macros/s/TU_APP_SCRIPT_ID/exec',
        sheetsUrl: 'https://docs.google.com/spreadsheets/d/TU_SHEET_ID/edit',
        apiKey: 'TU_API_KEY'
    },
    
    // WhatsApp
    whatsapp: {
        phoneNumber: '5491145678900',
        businessName: 'San Juan Construye'
    },
    
    // Google Forms
    googleForms: {
        url: 'https://docs.google.com/forms/d/e/TU_FORM_ID/formResponse'
    },
    
    // Información de contacto
    contact: {
        address: 'Av. San Juan 1234, Buenos Aires',
        phone: '+54 11 4567-8900',
        email: 'info@sanjuanconstruye.com',
        whatsapp: '+54 11 4567-8900',
        schedule: {
            weekdays: '8:00 - 18:00',
            saturday: '8:00 - 13:00',
            sunday: 'Cerrado'
        }
    }
};
```

### 2. Incluir en HTML

```html
<!-- Antes de los otros scripts -->
<script src="config.js"></script>
<script src="scripts/google-sheets-integration.js"></script>
<script src="scripts/whatsapp-integration.js"></script>
<script src="scripts/customer-form.js"></script>
```

---

## 🔍 Testing y Diagnóstico

### Verificar Configuración

```javascript
// En consola del navegador
console.log('Google Sheets:', window.googleSheets.getDiagnostics());
console.log('Configuración:', window.SAN_JUAN_CONFIG);
```

### Test de Conectividad

1. **Google Sheets**:
   - Ejecutar función `testConnection()` en Apps Script
   - Verificar logs en Apps Script

2. **WhatsApp**:
   - Abrir `https://wa.me/5491145678900`
   - Verificar que abre correctamente

3. **Google Forms**:
   - Completar formulario manualmente
   - Verificar que llega a Google Sheets

---

## 🆘 Solución de Problemas

### Error: `ERR_NAME_NOT_RESOLVED`
- **Problema**: `via.placeholder.com` no disponible
- **Solución**: Usar `placehold.co` (ya configurado)

### Error: Google Sheets no carga
- **Verificar**: URL del Apps Script sea correcta
- **Verificar**: Apps Script esté desplegado como "Anyone"
- **Verificar**: Permisos del Google Sheet

### Error: WhatsApp no envía
- **Verificar**: Formato del número (5491145678900)
- **Verificar**: Que WhatsApp Web/App esté disponible

### Error: Google Forms no recibe datos
- **Verificar**: URL del formulario
- **Verificar**: IDs de campos coincidan
- **Verificar**: Formulario público

---

## 📞 Soporte

Si necesitas ayuda con la configuración:

1. **Revisa los logs** en la consola del navegador
2. **Verifica las URLs** sean correctas
3. **Prueba paso a paso** cada integración
4. **Consulta la documentación** de Google Apps Script

---

**¡La webapp está lista para funcionar con todas las integraciones!** 🚀