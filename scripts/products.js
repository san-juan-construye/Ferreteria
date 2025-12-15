// ===== SAN JUAN CONSTRUYE - GESTIÓN DE PRODUCTOS =====

class ProductsManager {
    constructor() {
        this.googleSheetsUrl = null; // URL del Google Sheets
        this.apiKey = null; // API Key de Google Sheets
        this.cache = new Map();
        this.lastUpdate = null;
    }
    
    // ===== INTEGRACIÓN CON GOOGLE SHEETS =====
    
    /**
     * Configurar la conexión con Google Sheets
     * @param {string} sheetsUrl - URL del Google Sheets
     * @param {string} apiKey - API Key opcional
     */
    configureGoogleSheets(sheetsUrl, apiKey = null) {
        this.googleSheetsUrl = sheetsUrl;
        this.apiKey = apiKey;
    }
    
    /**
     * Cargar productos desde Google Sheets
     * @returns {Promise<Array>} Lista de productos
     */
    async loadFromGoogleSheets() {
        if (!this.googleSheetsUrl) {
            console.warn('Google Sheets URL no configurada');
            return this.getFallbackProducts();
        }
        
        try {
            const url = this.buildSheetsUrl();
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const products = this.parseSheetsData(data);
            
            // Cachear datos
            this.cache.set('products', products);
            this.lastUpdate = new Date();
            
            return products;
            
        } catch (error) {
            console.error('Error cargando desde Google Sheets:', error);
            this.showOfflineMessage();
            return this.getFallbackProducts();
        }
    }
    
    /**
     * Construir URL para Google Sheets API
     * @returns {string} URL completa
     */
    buildSheetsUrl() {
        const baseUrl = this.googleSheetsUrl.replace('/edit', '/export');
        const params = new URLSearchParams({
            format: 'json',
            gid: '0' // Primer sheet
        });
        
        if (this.apiKey) {
            params.append('key', this.apiKey);
        }
        
        return `${baseUrl}?${params.toString()}`;
    }
    
    /**
     * Parsear datos del Google Sheets
     * @param {Object} data - Datos crudos del API
     * @returns {Array} Productos procesados
     */
    parseSheetsData(data) {
        if (!data.values || !Array.isArray(data.values)) {
            throw new Error('Formato de datos inválido');
        }
        
        const rows = data.values;
        const headers = rows[0]; // Primera fila como headers
        const products = [];
        
        // Procesar cada fila (saltando headers)
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (row.length === 0 || !row[0]) continue; // Saltar filas vacías
            
            try {
                const product = this.parseProductRow(row, headers);
                if (product) {
                    products.push(product);
                }
            } catch (error) {
                console.warn(`Error procesando fila ${i + 1}:`, error);
            }
        }
        
        return products;
    }
    
    /**
     * Parsear una fila individual de producto
     * @param {Array} row - Datos de la fila
     * @param {Array} headers - Headers de las columnas
     * @returns {Object} Producto procesado
     */
    parseProductRow(row, headers) {
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
        
        headers.forEach((header, index) => {
            const value = row[index] || '';
            const headerLower = header.toLowerCase().trim();
            
            switch (headerLower) {
                case 'id':
                case 'codigo':
                case 'cod':
                    product.id = parseInt(value) || this.generateId();
                    product.codigo = value.toString();
                    break;
                    
                case 'nombre':
                case 'name':
                case 'titulo':
                    product.nombre = value.toString().trim();
                    break;
                    
                case 'descripcion':
                case 'description':
                case 'desc':
                    product.descripcion = value.toString().trim();
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
                    product.categoria = value.toString().trim().toLowerCase();
                    break;
                    
                case 'imagen':
                case 'image':
                case 'foto':
                case 'url':
                    product.imagen = value.toString().trim();
                    break;
                    
                case 'stock':
                case 'inventario':
                case 'cantidad':
                    product.stock = parseInt(value) || 0;
                    break;
            }
        });
        
        // Validaciones
        if (!product.nombre || product.precio <= 0) {
            return null;
        }
        
        // Generar ID si no existe
        if (!product.id) {
            product.id = this.generateId();
        }
        
        // Validar categoría
        const validCategories = ['herramientas', 'materiales', 'pintura', 'electricidad', 'plomeria', 'ferreteria'];
        if (!validCategories.includes(product.categoria)) {
            product.categoria = 'ferreteria';
        }
        
        // Generar imagen por defecto si no existe
        if (!product.imagen) {
            product.imagen = this.generatePlaceholderImage(product.nombre, product.categoria);
        }
        
        return product;
    }
    
    /**
     * Generar ID único para producto
     * @returns {number} ID único
     */
    generateId() {
        return Date.now() + Math.floor(Math.random() * 1000);
    }
    
    /**
     * Generar imagen placeholder
     * @param {string} name - Nombre del producto
     * @param {string} category - Categoría del producto
     * @returns {string} URL de imagen placeholder
     */
    generatePlaceholderImage(name, category) {
        const colors = {
            herramientas: '0047AB',
            materiales: '0056D2',
            pintura: 'EF6C00',
            electricidad: '2E7D32',
            plomeria: 'D32F2F',
            ferreteria: '0288D1'
        };
        
        const color = colors[category] || '9CA3AF';
        const text = encodeURIComponent(name.substring(0, 20));
        
        return `https://via.placeholder.com/300x300/${color}/FFFFFF?text=${text}`;
    }
    
    // ===== DATOS DE RESPALDO =====
    
    /**
     * Obtener productos de respaldo cuando Google Sheets no está disponible
     * @returns {Array} Productos de ejemplo
     */
    getFallbackProducts() {
        return [
            {
                id: 1,
                nombre: 'Taladro Black & Decker 1/2 HP',
                descripcion: 'Taladro de 1/2 HP con mandril de 13mm. Ideal para trabajos pesados.',
                precio: 8500,
                promocion: 15,
                categoria: 'herramientas',
                imagen: 'https://via.placeholder.com/300x300/0047AB/FFFFFF?text=Taladro',
                stock: 15,
                codigo: 'TAL001'
            },
            {
                id: 2,
                nombre: 'Cemento Portland 50kg',
                descripcion: 'Cemento Portland tipo I para obras generales. Resistente y duradero.',
                precio: 3200,
                promocion: 0,
                categoria: 'materiales',
                imagen: 'https://via.placeholder.com/300x300/0056D2/FFFFFF?text=Cemento',
                stock: 50,
                codigo: 'MAT001'
            },
            {
                id: 3,
                nombre: 'Pintura Látex Blanca 20L',
                descripcion: 'Pintura látex interior blanca de alta cobertura. Rendimiento superior.',
                precio: 4500,
                promocion: 20,
                categoria: 'pintura',
                imagen: 'https://via.placeholder.com/300x300/EF6C00/FFFFFF?text=Pintura',
                stock: 25,
                codigo: 'PIN001'
            },
            {
                id: 4,
                nombre: 'Cable Eléctrico 2.5mm x 100m',
                descripcion: 'Cable eléctrico preaislado 2.5mm². Cumple normas IRAM.',
                precio: 2800,
                promocion: 10,
                categoria: 'electricidad',
                imagen: 'https://via.placeholder.com/300x300/2E7D32/FFFFFF?text=Cable',
                stock: 30,
                codigo: 'ELE001'
            },
            {
                id: 5,
                nombre: 'Tubo PVC 110mm x 4m',
                descripcion: 'Tubo PVC sanitario 110mm para desagües. Fácil instalación.',
                precio: 1850,
                promocion: 0,
                categoria: 'plomeria',
                imagen: 'https://via.placeholder.com/300x300/D32F2F/FFFFFF?text=PVC',
                stock: 40,
                codigo: 'PLO001'
            },
            {
                id: 6,
                nombre: 'Tornillos Autoperforantes x100',
                descripcion: 'Tornillos autoperforantes 1/4" x 20mm. Acero templado.',
                precio: 450,
                promocion: 25,
                categoria: 'ferreteria',
                imagen: 'https://via.placeholder.com/300x300/0288D1/FFFFFF?text=Tornillos',
                stock: 80,
                codigo: 'FER001'
            }
        ];
    }
    
    // ===== GESTIÓN DE CACHE =====
    
    /**
     * Guardar productos en cache local
     * @param {Array} products - Lista de productos
     */
    saveToCache(products) {
        localStorage.setItem('sanjuan_products_cache', JSON.stringify({
            products,
            timestamp: new Date().toISOString()
        }));
    }
    
    /**
     * Cargar productos desde cache local
     * @returns {Array|null} Productos en cache o null
     */
    loadFromCache() {
        try {
            const cached = localStorage.getItem('sanjuan_products_cache');
            if (cached) {
                const data = JSON.parse(cached);
                
                // Verificar si el cache es reciente (menos de 1 hora)
                const cacheAge = Date.now() - new Date(data.timestamp).getTime();
                const oneHour = 60 * 60 * 1000;
                
                if (cacheAge < oneHour) {
                    return data.products;
                }
            }
        } catch (error) {
            console.warn('Error cargando cache:', error);
        }
        
        return null;
    }
    
    // ===== UTILIDADES =====
    
    /**
     * Mostrar mensaje cuando está offline
     */
    showOfflineMessage() {
        if (window.app && window.app.showNotification) {
            window.app.showNotification(
                'Modo offline: mostrando productos de ejemplo. Configure Google Sheets para datos actualizados.',
                'info'
            );
        }
    }
    
    /**
     * Filtrar productos por categoría
     * @param {Array} products - Lista de productos
     * @param {string} category - Categoría a filtrar
     * @returns {Array} Productos filtrados
     */
    filterByCategory(products, category) {
        if (!category || category === 'all') {
            return products;
        }
        
        return products.filter(product => 
            product.categoria.toLowerCase() === category.toLowerCase()
        );
    }
    
    /**
     * Buscar productos por texto
     * @param {Array} products - Lista de productos
     * @param {string} searchTerm - Término de búsqueda
     * @returns {Array} Productos que coinciden
     */
    searchProducts(products, searchTerm) {
        if (!searchTerm) {
            return products;
        }
        
        const term = searchTerm.toLowerCase();
        return products.filter(product => 
            product.nombre.toLowerCase().includes(term) ||
            product.descripcion.toLowerCase().includes(term) ||
            product.codigo.toLowerCase().includes(term) ||
            product.categoria.toLowerCase().includes(term)
        );
    }
    
    /**
     * Obtener productos en oferta
     * @param {Array} products - Lista de productos
     * @returns {Array} Productos con promoción
     */
    getOnSaleProducts(products) {
        return products.filter(product => product.promocion > 0);
    }
    
    /**
     * Ordenar productos
     * @param {Array} products - Lista de productos
     * @param {string} sortBy - Campo de ordenamiento
     * @param {string} sortOrder - Orden (asc/desc)
     * @returns {Array} Productos ordenados
     */
    sortProducts(products, sortBy = 'nombre', sortOrder = 'asc') {
        const sorted = [...products];
        
        sorted.sort((a, b) => {
            let valueA = a[sortBy];
            let valueB = b[sortBy];
            
            // Manejar diferentes tipos de datos
            if (typeof valueA === 'string') {
                valueA = valueA.toLowerCase();
                valueB = valueB.toLowerCase();
            }
            
            if (sortOrder === 'desc') {
                return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
            } else {
                return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
            }
        });
        
        return sorted;
    }
}

// ===== CONFIGURACIÓN PARA GOOGLE SHEETS =====

/**
 * Ejemplo de configuración para Google Sheets
 * 
 * ESTRUCTURA ESPERADA EN GOOGLE SHEETS:
 * 
 * | ID | Nombre | Descripción | Precio | Promoción | Categoría | Imagen | Stock | Código |
 * |----|--------|-------------|--------|-----------|-----------|--------|-------|--------|
 * | 1  | Taladro...| Descripción... | 8500   | 15        | herramientas | URL... | 15    | TAL001 |
 * 
 * PASOS PARA CONFIGURAR:
 * 
 * 1. Crear Google Sheets con las columnas mencionadas
 * 2. Hacer público el sheet (Share -> Anyone with link can view)
 * 3. Obtener la URL del sheet
 * 4. Llamar a productsManager.configureGoogleSheets(url)
 * 
 * CÓDIGO DE EJEMPLO:
 * 
 * const productsManager = new ProductsManager();
 * productsManager.configureGoogleSheets(
 *     'https://docs.google.com/spreadsheets/d/TU_SHEET_ID/edit',
 *     'TU_API_KEY_OPTIONAL' // Opcional para límites más altos
 * );
 */

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    // Configurar ProductsManager global
    window.productsManager = new ProductsManager();
    
    // Configuración por defecto (descomenta y modifica según tu Google Sheets)
    /*
    window.productsManager.configureGoogleSheets(
        'https://docs.google.com/spreadsheets/d/TU_SHEET_ID/edit',
        'TU_API_KEY' // Opcional
    );
    */
});

// ===== EXPORTAR PARA MÓDULOS =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductsManager;
}