/**
 * GOOGLE APPS SCRIPT PARA SAN JUAN CONSTRUYE
 * 
 * INSTRUCCIONES:
 * 1. Ir a https://script.google.com/
 * 2. Crear nuevo proyecto
 * 3. Reemplazar el código por defecto con este código
 * 4. Configurar las variables al inicio del código
 * 5. Desplegar como Web App
 * 6. Copiar la URL y configurar en la webapp
 */

// ===== CONFIGURACIÓN =====
const CONFIG = {
    // URL del Google Sheets con los productos
    SHEETS_URL: 'https://docs.google.com/spreadsheets/d/TU_SHEET_ID/edit',
    
    // ID del sheet (usualmente '0' para el primer sheet)
    SHEET_ID: '0',
    
    // Headers esperados en el sheet
    HEADERS: [
        'id',           // Columna A: ID único del producto
        'nombre',       // Columna B: Nombre del producto
        'descripcion',  // Columna C: Descripción
        'precio',       // Columna D: Precio
        'promocion',    // Columna E: % de descuento
        'categoria',    // Columna F: Categoría
        'imagen',       // Columna G: URL de imagen
        'stock',        // Columna H: Stock disponible
        'codigo'        // Columna I: Código del producto
    ],
    
    // Categorías válidas
    VALID_CATEGORIES: [
        'herramientas',
        'materiales', 
        'pintura',
        'electricidad',
        'plomeria',
        'ferreteria'
    ]
};

/**
 * Función principal que maneja las peticiones GET
 */
function doGet(e) {
    try {
        // Obtener productos desde el sheet
        const products = getProductsFromSheet();
        
        // Retornar respuesta JSON
        const result = {
            success: true,
            timestamp: new Date().toISOString(),
            products: products,
            count: products.length
        };
        
        return ContentService
            .createTextOutput(JSON.stringify(result))
            .setMimeType(ContentService.MimeType.JSON);
            
    } catch (error) {
        // Manejar errores
        console.error('Error en doGet:', error);
        
        const errorResult = {
            success: false,
            error: error.toString(),
            timestamp: new Date().toISOString()
        };
        
        return ContentService
            .createTextOutput(JSON.stringify(errorResult))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

/**
 * Obtiene los productos desde Google Sheets
 */
function getProductsFromSheet() {
    try {
        // Abrir el spreadsheet
        const spreadsheet = SpreadsheetApp.openByUrl(CONFIG.SHEETS_URL);
        const sheet = spreadsheet.getSheetById(CONFIG.SHEET_ID);
        
        if (!sheet) {
            throw new Error(`Sheet con ID ${CONFIG.SHEET_ID} no encontrado`);
        }
        
        // Obtener todos los datos
        const data = sheet.getDataRange().getValues();
        
        if (data.length < 2) {
            throw new Error('No hay suficientes datos en el sheet');
        }
        
        // Extraer headers y datos
        const headers = data[0];
        const rows = data.slice(1);
        
        console.log(`Headers encontrados: ${headers.length}`);
        console.log(`Filas de datos: ${rows.length}`);
        
        // Procesar cada fila
        const products = [];
        
        rows.forEach((row, index) => {
            try {
                // Saltar filas vacías
                if (!row[0]) return;
                
                const product = processProductRow(row, headers, index + 2); // +2 porque empezamos en fila 2
                
                if (product && isValidProduct(product)) {
                    products.push(product);
                } else {
                    console.warn(`Producto inválido en fila ${index + 2}`);
                }
                
            } catch (error) {
                console.error(`Error procesando fila ${index + 2}:`, error);
            }
        });
        
        console.log(`Productos procesados: ${products.length}`);
        return products;
        
    } catch (error) {
        console.error('Error obteniendo productos:', error);
        throw error;
    }
}

/**
 * Procesa una fila individual del sheet
 */
function processProductRow(row, headers, rowNumber) {
    const product = {
        id: null,
        nombre: '',
        descripcion: '',
        precio: 0,
        promocion: 0,
        categoria: 'ferreteria',
        imagen: '',
        stock: 0,
        codigo: ''
    };
    
    // Mapear cada celda a su campo correspondiente
    headers.forEach((header, index) => {
        const value = row[index];
        const headerLower = header.toString().toLowerCase().trim();
        
        try {
            switch (headerLower) {
                case 'id':
                case 'codigo':
                case 'cod':
                    product.id = parseInt(value) || generateId();
                    product.codigo = value ? value.toString() : '';
                    break;
                    
                case 'nombre':
                case 'name':
                case 'titulo':
                    product.nombre = value ? value.toString().trim() : '';
                    break;
                    
                case 'descripcion':
                case 'description':
                case 'desc':
                    product.descripcion = value ? value.toString().trim() : '';
                    break;
                    
                case 'precio':
                case 'price':
                case 'cost':
                    product.precio = parseFloat(value) || 0;
                    break;
                    
                case 'promocion':
                case 'promo':
                case 'descuento':
                case 'discount':
                    product.promocion = parseInt(value) || 0;
                    break;
                    
                case 'categoria':
                case 'category':
                case 'cat':
                    product.categoria = value ? value.toString().trim().toLowerCase() : 'ferreteria';
                    break;
                    
                case 'imagen':
                case 'image':
                case 'foto':
                case 'url':
                    product.imagen = value ? value.toString().trim() : '';
                    break;
                    
                case 'stock':
                case 'inventario':
                case 'cantidad':
                    product.stock = parseInt(value) || 0;
                    break;
            }
        } catch (error) {
            console.warn(`Error procesando columna ${header} en fila ${rowNumber}:`, error);
        }
    });
    
    // Validaciones y normalización
    if (!product.id) {
        product.id = generateId();
    }
    
    if (!product.nombre) {
        throw new Error('Nombre requerido');
    }
    
    if (product.precio <= 0) {
        throw new Error('Precio debe ser mayor a 0');
    }
    
    // Validar categoría
    if (!CONFIG.VALID_CATEGORIES.includes(product.categoria)) {
        product.categoria = 'ferreteria';
    }
    
    // Procesar imagen
    product.imagen = processImageUrl(product.imagen, product.nombre, product.categoria);
    
    return product;
}

/**
 * Procesa la URL de la imagen
 */
function processImageUrl(imageUrl, productName, category) {
    if (!imageUrl || imageUrl.trim() === '') {
        return generatePlaceholderImage(productName, category);
    }
    
    // Validar si es una URL válida
    try {
        new URL(imageUrl);
        return imageUrl;
    } catch (e) {
        // Si no es una URL válida, generar placeholder
        return generatePlaceholderImage(productName, category);
    }
}

/**
 * Genera una imagen placeholder
 */
function generatePlaceholderImage(name, category) {
    const categoryColors = {
        herramientas: '0047AB',
        materiales: '0056D2',
        pintura: 'EF6C00',
        electricidad: '2E7D32',
        plomeria: 'D32F2F',
        ferreteria: '0288D1'
    };
    
    const color = categoryColors[category] || '9CA3AF';
    const text = encodeURIComponent(name.substring(0, 20));
    
    // Usar placeholder más confiable
    return `https://placehold.co/300x300/${color}/FFFFFF?text=${text}`;
}

/**
 * Valida si un producto es válido
 */
function isValidProduct(product) {
    return product &&
           product.nombre &&
           product.nombre.trim() !== '' &&
           product.precio > 0 &&
           !isNaN(product.precio);
}

/**
 * Genera un ID único
 */
function generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

/**
 * Función para probar la conexión (opcional)
 */
function testConnection() {
    try {
        const products = getProductsFromSheet();
        console.log('Conexión exitosa. Productos encontrados:', products.length);
        return {
            success: true,
            count: products.length,
            sample: products.slice(0, 3)
        };
    } catch (error) {
        console.error('Error en testConnection:', error);
        return {
            success: false,
            error: error.toString()
        };
    }
}

/**
 * Función para configurar el sheet automáticamente (opcional)
 */
function setupSheet() {
    try {
        const spreadsheet = SpreadsheetApp.openByUrl(CONFIG.SHEETS_URL);
        const sheet = spreadsheet.getSheetById(CONFIG.SHEET_ID);
        
        if (!sheet) {
            throw new Error(`Sheet con ID ${CONFIG.SHEET_ID} no encontrado`);
        }
        
        // Verificar si ya tiene headers
        const existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        
        if (existingHeaders.length === 0 || !existingHeaders[0]) {
            // Agregar headers
            sheet.getRange(1, 1, 1, CONFIG.HEADERS.length).setValues([CONFIG.HEADERS]);
            
            // Formatear headers
            const headerRange = sheet.getRange(1, 1, 1, CONFIG.HEADERS.length);
            headerRange.setFontWeight('bold');
            headerRange.setBackground('#0047AB');
            headerRange.setFontColor('white');
            
            console.log('Headers agregados exitosamente');
        } else {
            console.log('Sheet ya tiene headers');
        }
        
        return { success: true, message: 'Sheet configurado exitosamente' };
        
    } catch (error) {
        console.error('Error configurando sheet:', error);
        return { success: false, error: error.toString() };
    }
}

/**
 * Función para limpiar datos inválidos (opcional)
 */
function cleanInvalidData() {
    try {
        const spreadsheet = SpreadsheetApp.openByUrl(CONFIG.SHEETS_URL);
        const sheet = spreadsheet.getSheetById(CONFIG.SHEET_ID);
        const data = sheet.getDataRange().getValues();
        
        let deletedRows = 0;
        
        // Procesar desde la última fila hacia arriba para evitar problemas de índices
        for (let i = data.length - 1; i >= 1; i--) {
            const row = data[i];
            
            // Verificar si la fila está vacía o tiene datos inválidos
            if (!row[0] || !row[1] || parseFloat(row[3]) <= 0) {
                sheet.deleteRow(i + 1); // +1 porque las filas empiezan en 1
                deletedRows++;
            }
        }
        
        console.log(`Filas eliminadas: ${deletedRows}`);
        return { success: true, deletedRows };
        
    } catch (error) {
        console.error('Error limpiando datos:', error);
        return { success: false, error: error.toString() };
    }
}

/**
 * CONFIGURACIÓN DE DEPLOYMENT:
 * 
 * 1. Ir a Deploy > New Deployment
 * 2. Seleccionar "Web app" como tipo
 * 3. Configurar:
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Hacer clic en Deploy
 * 5. Copiar la URL del Web App
 * 
 * La URL se verá así:
 * https://script.google.com/macros/s/AKfycbz.../exec
 * 
 * USAR ESTA URL EN LA WEBAPP:
 * window.googleSheets.configure('TU_URL_DE_APPS_SCRIPT', 'TU_URL_DE_SHEETS');
 */