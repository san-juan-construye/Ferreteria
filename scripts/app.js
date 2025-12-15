// ===== SAN JUAN CONSTRUYE - APP PRINCIPAL =====

class SanJuanConstruye {
    constructor() {
        this.cart = [];
        this.products = [];
        this.categories = ['herramientas', 'materiales', 'pintura', 'electricidad', 'plomeria', 'ferreteria'];
        this.currentCategory = null;
        this.searchTerm = '';
        
        this.init();
    }
    
    init() {
        this.loadCartFromStorage();
        this.updateCartUI();
        this.setupEventListeners();
        this.loadProducts();
        this.renderFeaturedProducts();
        this.renderFeaturedOffers();
    }
    
    // ===== GESTIÓN DEL CARRITO =====
    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                ...product,
                quantity: 1
            });
        }
        
        this.saveCartToStorage();
        this.updateCartUI();
        this.showAddToCartFeedback(productId);
    }
    
    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCartToStorage();
        this.updateCartUI();
    }
    
    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                this.saveCartToStorage();
                this.updateCartUI();
            }
        }
    }
    
    getCartTotal() {
        return this.cart.reduce((total, item) => {
            const price = item.promocion > 0 ? 
                item.precio * (1 - item.promocion / 100) : 
                item.precio;
            return total + (price * item.quantity);
        }, 0);
    }
    
    getCartItemCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }
    
    // ===== GESTIÓN DEL STORAGE =====
    saveCartToStorage() {
        localStorage.setItem('sanJuanCart', JSON.stringify(this.cart));
    }
    
    loadCartFromStorage() {
        const saved = localStorage.getItem('sanJuanCart');
        if (saved) {
            this.cart = JSON.parse(saved);
        }
    }
    
    // ===== UI UPDATES =====
    updateCartUI() {
        const cartBadge = document.getElementById('cartBadge');
        const itemCount = this.getCartItemCount();
        
        if (cartBadge) {
            cartBadge.textContent = itemCount;
            cartBadge.classList.add('bounce');
            
            setTimeout(() => {
                cartBadge.classList.remove('bounce');
            }, 600);
        }
    }
    
    showAddToCartFeedback(productId) {
        const buttons = document.querySelectorAll(`[data-product-id="${productId}"]`);
        buttons.forEach(btn => {
            const originalText = btn.textContent;
            btn.textContent = 'Agregado ✓';
            btn.classList.add('added');
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.classList.remove('added');
            }, 2000);
        });
    }
    
    // ===== GESTIÓN DE PRODUCTOS =====
    async loadProducts() {
        try {
            // Intentar cargar desde Google Sheets/Apps Script primero
            if (window.googleSheets) {
                console.log('Cargando productos desde Google Sheets...');
                this.products = await window.googleSheets.getProducts();
                
                if (this.products && this.products.length > 0) {
                    console.log(`Productos cargados desde Google Sheets: ${this.products.length}`);
                    return;
                }
            }
            
            // Fallback a datos estáticos
            console.log('Usando productos estáticos');
            this.products = this.getStaticProducts();
            
        } catch (error) {
            console.error('Error cargando productos:', error);
            // Usar productos estáticos como último recurso
            this.products = this.getStaticProducts();
        }
    }
    
    getStaticProducts() {
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
            },
            {
                id: 4,
                nombre: 'Cable Eléctrico 2.5mm x 100m',
                descripcion: 'Cable eléctrico preaislado 2.5mm². Cumple normas IRAM.',
                precio: 2800,
                promocion: 10,
                categoria: 'electricidad',
                imagen: 'https://placehold.co/300x300/2E7D32/FFFFFF?text=Cable',
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
                imagen: 'https://placehold.co/300x300/D32F2F/FFFFFF?text=PVC',
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
                imagen: 'https://placehold.co/300x300/0288D1/FFFFFF?text=Tornillos',
                stock: 80,
                codigo: 'FER001'
            },
            {
                id: 7,
                nombre: 'Amoladora Angular 9"',
                descripcion: 'Amoladora angular 9" con potencia de 2200W. Incluye disco.',
                precio: 12500,
                promocion: 0,
                categoria: 'herramientas',
                imagen: 'https://placehold.co/300x300/FF9100/FFFFFF?text=Amoladora',
                stock: 12,
                codigo: 'TAL002'
            },
            {
                id: 8,
                nombre: 'Arena Fina 1m³',
                descripcion: 'Arena fina lavada para construcción. Ideal para morteros.',
                precio: 2200,
                promocion: 5,
                categoria: 'materiales',
                imagen: 'https://placehold.co/300x300/9CA3AF/FFFFFF?text=Arena',
                stock: 100,
                codigo: 'MAT002'
            },
            {
                id: 9,
                nombre: 'Pincel Ancho 4"',
                descripcion: 'Pincel ancho profesional 4". Cerdas naturales de alta calidad.',
                precio: 650,
                promocion: 0,
                categoria: 'pintura',
                imagen: 'https://placehold.co/300x300/374151/FFFFFF?text=Pincel',
                stock: 35,
                codigo: 'PIN002'
            },
            {
                id: 10,
                nombre: 'Interruptor Termomagnético 20A',
                descripcion: 'Interruptor termomagnético 20A para tablero eléctrico.',
                precio: 1200,
                promocion: 15,
                categoria: 'electricidad',
                imagen: 'https://placehold.co/300x300/111827/FFFFFF?text=Interruptor',
                stock: 20,
                codigo: 'ELE002'
            },
            {
                id: 11,
                nombre: 'Llave Mezcladora Cocina',
                descripcion: 'Llave mezcladora para cocina. Acero inoxidable.',
                precio: 8500,
                promocion: 0,
                categoria: 'plomeria',
                imagen: 'https://placehold.co/300x300/EF6C00/FFFFFF?text=Llave',
                stock: 8,
                codigo: 'PLO002'
            },
            {
                id: 12,
                nombre: 'Martillo de Carpintero 16oz',
                descripcion: 'Martillo de carpintero con mango de fibra de vidrio.',
                precio: 3800,
                promocion: 12,
                categoria: 'herramientas',
                imagen: 'https://placehold.co/300x300/0047AB/FFFFFF?text=Martillo',
                stock: 18,
                codigo: 'TAL003'
            }
        ];
    }
    
    // ===== RENDERIZADO DE PRODUCTOS =====
    renderFeaturedProducts() {
        const container = document.getElementById('featuredProducts');
        if (!container) return;
        
        // Mostrar solo 8 productos destacados
        const featuredProducts = this.products.slice(0, 8);
        container.innerHTML = featuredProducts.map(product => this.createProductCard(product)).join('');
    }
    
    renderFeaturedOffers() {
        const container = document.getElementById('offersTrack');
        if (!container) return;
        
        // Filtrar solo productos con promoción
        const offerProducts = this.products.filter(product => product.promocion > 0);
        container.innerHTML = offerProducts.map(product => this.createProductCard(product)).join('');
    }
    
    createProductCard(product) {
        const discount = product.promocion > 0;
        const finalPrice = discount ? product.precio * (1 - product.promocion / 100) : product.precio;
        
        return `
            <div class="product-card" data-category="${product.categoria}">
                <div class="product-image">
                    <img src="${product.imagen}" alt="${product.nombre}" loading="lazy" 
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjUgMTI1SDE3NVYxNzVIMTI1VjEyNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'">
                    ${discount ? `<div class="offer-badge">-${product.promocion}%</div>` : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.nombre}</h3>
                    <p class="product-description">${product.descripcion}</p>
                    <div class="product-prices">
                        <span class="current-price">$${finalPrice.toLocaleString('es-AR')}</span>
                        ${discount ? `<span class="original-price">$${product.precio.toLocaleString('es-AR')}</span>` : ''}
                    </div>
                    <button class="add-to-cart-btn" data-product-id="${product.id}" onclick="app.addToCart(${product.id})">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Agregar al Pedido
                    </button>
                </div>
            </div>
        `;
    }
    
    // ===== FILTROS Y BÚSQUEDA =====
    filterProducts() {
        let filtered = this.products;
        
        // Filtrar por categoría
        if (this.currentCategory) {
            filtered = filtered.filter(product => product.categoria === this.currentCategory);
        }
        
        // Filtrar por búsqueda
        if (this.searchTerm) {
            const searchLower = this.searchTerm.toLowerCase();
            filtered = filtered.filter(product => 
                product.nombre.toLowerCase().includes(searchLower) ||
                product.descripcion.toLowerCase().includes(searchLower) ||
                product.codigo.toLowerCase().includes(searchLower)
            );
        }
        
        return filtered;
    }
    
    // ===== GESTIÓN DE EVENTOS =====
    setupEventListeners() {
        // Búsqueda
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.updateProductsDisplay();
            });
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.performSearch();
            });
        }
        
        // Categorías
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                this.selectCategory(category);
            });
        });
        
        // Carrito
        const cartBtn = document.getElementById('cartBtn');
        if (cartBtn) {
            cartBtn.addEventListener('click', () => {
                this.showCart();
            });
        }
        
        // Ofertas
        const offersBtn = document.getElementById('offersBtn');
        if (offersBtn) {
            offersBtn.addEventListener('click', () => {
                this.scrollToOffers();
            });
        }
        
        // Carrusel de ofertas
        this.setupCarousel();
        
        // Newsletter
        this.setupNewsletter();
        
        // Scroll events para header
        this.setupScrollEvents();
    }
    
    setupCarousel() {
        const track = document.getElementById('offersTrack');
        const prevBtn = document.getElementById('offersPrev');
        const nextBtn = document.getElementById('offersNext');
        
        if (!track || !prevBtn || !nextBtn) return;
        
        let currentIndex = 0;
        const itemWidth = 300 + 24; // width + gap
        const visibleItems = Math.floor(track.parentElement.clientWidth / itemWidth);
        const maxIndex = Math.max(0, this.products.filter(p => p.promocion > 0).length - visibleItems);
        
        function updateCarousel() {
            const translateX = -currentIndex * itemWidth;
            track.style.transform = `translateX(${translateX}px)`;
            
            prevBtn.disabled = currentIndex === 0;
            nextBtn.disabled = currentIndex >= maxIndex;
        }
        
        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        });
        
        nextBtn.addEventListener('click', () => {
            if (currentIndex < maxIndex) {
                currentIndex++;
                updateCarousel();
            }
        });
        
        // Auto-scroll cada 5 segundos
        setInterval(() => {
            if (currentIndex < maxIndex) {
                currentIndex++;
            } else {
                currentIndex = 0;
            }
            updateCarousel();
        }, 5000);
        
        updateCarousel();
    }
    
    setupNewsletter() {
        const newsletterBtn = document.querySelector('.newsletter-btn');
        const newsletterInput = document.querySelector('.newsletter-input');
        
        if (newsletterBtn && newsletterInput) {
            newsletterBtn.addEventListener('click', () => {
                const email = newsletterInput.value.trim();
                if (email && this.isValidEmail(email)) {
                    this.subscribeToNewsletter(email);
                    newsletterInput.value = '';
                } else {
                    this.showNotification('Por favor ingresa un email válido', 'error');
                }
            });
        }
    }
    
    setupScrollEvents() {
        const header = document.querySelector('.header');
        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > 100) {
                header.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)';
            } else {
                header.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
            }
            
            lastScrollY = currentScrollY;
        });
    }
    
    // ===== NAVEGACIÓN =====
    selectCategory(category) {
        this.currentCategory = category;
        this.updateCategorySelection();
        this.updateProductsDisplay();
        
        // Scroll a productos
        const productsSection = document.querySelector('.featured-products');
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    updateCategorySelection() {
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            const isSelected = card.dataset.category === this.currentCategory;
            card.classList.toggle('selected', isSelected);
        });
    }
    
    updateProductsDisplay() {
        const filteredProducts = this.filterProducts();
        const container = document.getElementById('featuredProducts');
        
        if (container) {
            container.innerHTML = filteredProducts.map(product => this.createProductCard(product)).join('');
        }
    }
    
    performSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            this.searchTerm = searchInput.value;
            this.updateProductsDisplay();
            
            const productsSection = document.querySelector('.featured-products');
            if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }
    
    scrollToOffers() {
        const offersSection = document.querySelector('.featured-offers');
        if (offersSection) {
            offersSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    showCart() {
        // En una implementación completa, esto abriría un modal o navegaría al carrito
        window.location.href = 'carrito.html';
    }
    
    // ===== UTILIDADES =====
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    subscribeToNewsletter(email) {
        // Simulación de suscripción
        this.showNotification('¡Gracias! Te suscribiste a nuestro newsletter.', 'success');
        
        // En producción, enviar al backend
        console.log('Newsletter subscription:', email);
    }
    
    showNotification(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Estilos inline para la notificación
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '9999',
            opacity: '0',
            transform: 'translateX(100%)',
            transition: 'all 0.3s ease-out',
            backgroundColor: type === 'success' ? '#2E7D32' : type === 'error' ? '#D32F2F' : '#0288D1'
        });
        
        document.body.appendChild(notification);
        
        // Mostrar notificación
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Ocultar después de 3 segundos
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SanJuanConstruye();
});

// ===== FUNCIONES GLOBALES PARA HTML =====
window.formatPrice = function(price) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
    }).format(price);
};

window.showNotification = function(message, type) {
    if (window.app) {
        window.app.showNotification(message, type);
    }
};