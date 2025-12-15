// ===== SAN JUAN CONSTRUYE - INTEGRACIÓN GOOGLE SHEETS + APPS SCRIPT =====

class GoogleSheetsIntegration {
    constructor() {
        this.appScriptUrl = null; // URL del Web App de Google Apps Script
        this.sheetsUrl = null; // URL del Google Sheets
        this.apiKey = null; // API Key de Google Sheets
        this.cache = new Map();
        this.lastUpdate = null;
        this.isLoading = false;
        
        this.init();
    }
    
    init() {
        // Configuración por defecto (se puede cambiar dinámicamente)
        this.setupDefaultConfiguration();
    }
    
    setupDefaultConfiguration() {
        // Configuración de ejemplo - reemplazar con datos reales
        this.appScriptUrl = 'https://script.google.com/macros/s/TU_APP_SCRIPT_ID/exec';
        this.sheetsUrl = 'https://docs.google.com/spreadsheets/d/TU_SHEET_ID/edit';
        this.apiKey = 'TU_API_KEY_OPTIONAL';
    }
    
    // ===== CONFIGURACIÓN =====
    configure(appScriptUrl, sheetsUrl = null, apiKey = null) {
        this.appScriptUrl = appScriptUrl;
        this.sheetsUrl = sheetsUrl;
        this.apiKey = apiKey;
        
        console.log('Google Sheets configurado:', {
            appScript: !!appScriptUrl,
            sheets: !!sheetsUrl,
            apiKey: !!apiKey
        });
    }
    
    // ===== CARGA DE PRODUCTOS DESDE APPS SCRIPT =====
    async loadProductsFromAppScript() {
        if (!this.appScriptUrl) {
            console.warn('URL de App Script no configurada');
            return this.getFallbackProducts();
        }
        
        if (this.isLoading) {
            console.log('Carga en progreso, esperando...');
            return this.waitForLoading();
        }
        
        this.isLoading = true;
        
        try {
            console.log('Cargando productos desde Apps Script...');
            
            const response = await fetch(this.appScriptUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 10000 // 10 segundos timeout
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const products = this.processAppScriptData(data);
            
            // Guardar en cache
            this.cache.set('products', products);
            this.lastUpdate = new Date();
            this.saveToLocalStorage(products);
            
            console.log(`Productos cargados desde Apps Script: ${products.length}`);
            return products;
            
        } catch (error) {
            console.error('Error cargando desde Apps Script:', error);
            this.showOfflineMessage();
            
            // Intentar cargar desde Google Sheets directo
            if (this.sheetsUrl) {
                console.log('Intentando cargar desde Google Sheets directo...');
                return await this.loadProductsFromSheets();
            }
            
            return this.getFallbackProducts();
        } finally {
            this.isLoading = false;
        }
    }
    
    // ===== CARGA DESDE GOOGLE SHEETS DIRECTO =====
    async loadProductsFromSheets() {
        if (!this.sheetsUrl) {
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
            this.saveToLocalStorage(products);
            
            console.log(`Productos cargados desde Google Sheets: ${products.length}`);
            return products;
            
        } catch (error) {
            console.error('Error cargando desde Google Sheets:', error);
            return this.getFallbackProducts();
        }
    }
    
    // ===== PROCESAMIENTO DE DATOS =====
    processAppScriptData(data) {
        if (!data || !data.products || !Array.isArray(data.products)) {
            throw new Error('Formato de datos inválido desde Apps Script');
        }
        
        return data.products.map(product => this.normalizeProduct(product));
    }
    
    parseSheetsData(data) {
        if (!data.values || !Array.isArray(data.values)) {
            throw new Error('Formato de datos inválido');
        }
        
        const rows = data.values;
        const headers = rows[0];
        const products = [];
        
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (row.length === 0 || !row[0]) continue;
            
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
        
        // Validaciones y normalización
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
        
        // Procesar imagen
        product.imagen = this.processImageUrl(product.imagen, product.nombre, product.categoria);
        
        return product;
    }
    
    normalizeProduct(product) {
        return {
            id: parseInt(product.id) || this.generateId(),
            nombre: product.nombre?.toString().trim() || '',
            descripcion: product.descripcion?.toString().trim() || '',
            precio: parseFloat(product.precio) || 0,
            promocion: parseInt(product.promocion) || 0,
            categoria: product.categoria?.toString().trim().toLowerCase() || 'ferreteria',
            imagen: this.processImageUrl(product.imagen, product.nombre, product.categoria),
            stock: parseInt(product.stock) || 0,
            codigo: product.codigo?.toString().trim() || ''
        };
    }
    
    // ===== PROCESAMIENTO DE IMÁGENES =====
    processImageUrl(imageUrl, productName, category) {
        if (!imageUrl || imageUrl.trim() === '') {
            return this.generatePlaceholderImage(productName, category);
        }
        
        // Validar si es una URL válida
        try {
            new URL(imageUrl);
            return imageUrl;
        } catch (e) {
            // Si no es una URL válida, generar placeholder
            return this.generatePlaceholderImage(productName, category);
        }
    }
    
    generatePlaceholderImage(name, category) {
        // Usar múltiples servicios de placeholder para redundancia
        const services = [
            // Placeholder.co (más confiable)
            `https://placehold.co/300x300/0047AB/FFFFFF?text=${encodeURIComponent(name.substring(0, 20))}`,
            // DummyImage.com
            `https://dummyimage.com/300x300/0047AB/ffffff&text=${encodeURIComponent(name.substring(0, 20))}`,
            // Placebear.com (osos con texto)
            `https://placebear.com/300/300?text=${encodeURIComponent(name.substring(0, 15))}`
        ];
        
        // Usar servicio basado en categoría
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
        
        // Retornar placeholder más confiable
        return `https://placehold.co/300x300/${color}/FFFFFF?text=${text}`;
    }
    
    // ===== UTILIDADES =====
    buildSheetsUrl() {
        if (!this.sheetsUrl) return null;
        
        const baseUrl = this.sheetsUrl.replace('/edit', '/export');
        const params = new URLSearchParams({
            format: 'json',
            gid: '0'
        });
        
        if (this.apiKey) {
            params.append('key', this.apiKey);
        }
        
        return `${baseUrl}?${params.toString()}`;
    }
    
    generateId() {
        return Date.now() + Math.floor(Math.random() * 1000);
    }
    
    waitForLoading() {
        return new Promise(resolve => {
            const checkLoading = () => {
                if (!this.isLoading) {
                    resolve(this.cache.get('products') || this.getFallbackProducts());
                } else {
                    setTimeout(checkLoading, 100);
                }
            };
            checkLoading();
        });
    }
    
    // ===== CACHE Y PERSISTENCIA =====
    saveToLocalStorage(products) {
        try {
            localStorage.setItem('sanjuan_products_cache', JSON.stringify({
                products,
                timestamp: new Date().toISOString(),
                source: 'google-sheets'
            }));
        } catch (error) {
            console.warn('Error guardando cache:', error);
        }
    }
    
    loadFromLocalStorage() {
        try {
            const cached = localStorage.getItem('sanjuan_products_cache');
            if (cached) {
                const data = JSON.parse(cached);
                
                // Verificar si el cache es reciente (menos de 30 minutos)
                const cacheAge = Date.now() - new Date(data.timestamp).getTime();
                const thirtyMinutes = 30 * 60 * 1000;
                
                if (cacheAge < thirtyMinutes) {
                    console.log('Cargando productos desde cache local');
                    return data.products;
                }
            }
        } catch (error) {
            console.warn('Error cargando cache:', error);
        }
        
        return null;
    }
    
    // ===== PRODUCTOS DE RESPALDO =====
    getFallbackProducts() {
        console.log('Usando productos de respaldo');
        return [
            {
                id: 1,
                nombre: 'Taladro Black & Decker 1/2 HP',
                descripcion: 'Taladro de 1/2 HP con mandril de 13mm. Ideal para trabajos pesados.',
                precio: 8500,
                promocion: 15,
                categoria: 'herramientas',
                imagen: 'https://placehold.co/300x300/0047AB/FFFFFF?text=Taladro',
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
                imagen: 'https://placehold.co/300x300/0056D2/FFFFFF?text=Cemento',
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
                imagen: 'https://placehold.co/300x300/EF6C00/FFFFFF?text=Pintura',
                stock: 25,
                codigo: 'PIN001'
            }
        ];
    }
    
    // ===== MÉTODOS PÚBLICOS =====
    async getProducts() {
        // Intentar cargar desde cache local primero
        const cached = this.loadFromLocalStorage();
        if (cached) {
            return cached;
        }
        
        // Cargar desde Apps Script
        return await this.loadProductsFromAppScript();
    }
    
    async refreshProducts() {
        // Limpiar cache y recargar
        this.cache.clear();
        localStorage.removeItem('sanjuan_products_cache');
        return await this.loadProductsFromAppScript();
    }
    
    // ===== MANEJO DE ERRORES =====
    showOfflineMessage() {
        if (window.app && window.app.showNotification) {
            window.app.showNotification(
                'Modo offline: mostrando productos de ejemplo. Configure Google Sheets para datos actualizados.',
                'info'
            );
        }
    }
    
    // ===== DIAGNÓSTICO =====
    getDiagnostics() {
        return {
            configured: !!(this.appScriptUrl || this.sheetsUrl),
            appScriptConfigured: !!this.appScriptUrl,
            sheetsConfigured: !!this.sheetsUrl,
            apiKeyConfigured: !!this.apiKey,
            cacheSize: this.cache.size,
            lastUpdate: this.lastUpdate,
            isLoading: this.isLoading
        };
    }
}

// ===== CONFIGURACIÓN GLOBAL =====
window.googleSheets = new GoogleSheetsIntegration();

// ===== FUNCIONES DE UTILIDAD =====
window.configureGoogleSheets = function(appScriptUrl, sheetsUrl, apiKey) {
    window.googleSheets.configure(appScriptUrl, sheetsUrl, apiKey);
};

window.loadProducts = function() {
    return window.googleSheets.getProducts();
};

window.refreshProducts = function() {
    return window.googleSheets.refreshProducts();
};

window.getSheetsDiagnostics = function() {
    return window.googleSheets.getDiagnostics();
};

// ===== AUTO-CONFIGURACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    // Intentar cargar configuración desde variables globales
    if (typeof window.GOOGLE_SHEETS_CONFIG !== 'undefined') {
        const config = window.GOOGLE_SHEETS_CONFIG;
        window.googleSheets.configure(
            config.appScriptUrl,
            config.sheetsUrl,
            config.apiKey
        );
    }
});