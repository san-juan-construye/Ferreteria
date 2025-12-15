// ===== SAN JUAN CONSTRUYE - GESTIÓN DEL CARRITO =====

class CartManager {
    constructor() {
        this.cart = [];
        this.init();
    }
    
    init() {
        this.loadCart();
        this.renderCart();
        this.updateSummary();
        this.setupEventListeners();
        this.loadRecommendations();
    }
    
    // ===== GESTIÓN DEL CARRITO =====
    loadCart() {
        const saved = localStorage.getItem('sanJuanCart');
        this.cart = saved ? JSON.parse(saved) : [];
    }
    
    saveCart() {
        localStorage.setItem('sanJuanCart', JSON.stringify(this.cart));
        
        // Actualizar badge del header si existe
        if (window.app) {
            window.app.updateCartUI();
        }
    }
    
    addItem(product, quantity = 1) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                ...product,
                quantity: quantity
            });
        }
        
        this.saveCart();
        this.renderCart();
        this.updateSummary();
        
        // Mostrar notificación
        if (window.app) {
            window.app.showNotification(`${product.nombre} agregado al pedido`, 'success');
        }
    }
    
    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (!item) return;
        
        if (quantity <= 0) {
            this.removeItem(productId);
            return;
        }
        
        item.quantity = quantity;
        this.saveCart();
        this.renderCart();
        this.updateSummary();
    }
    
    removeItem(productId) {
        const itemIndex = this.cart.findIndex(item => item.id === productId);
        if (itemIndex === -1) return;
        
        const item = this.cart[itemIndex];
        this.cart.splice(itemIndex, 1);
        
        this.saveCart();
        this.renderCart();
        this.updateSummary();
        
        // Mostrar notificación
        if (window.app) {
            window.app.showNotification(`${item.nombre} eliminado del pedido`, 'info');
        }
    }
    
    clearCart() {
        if (this.cart.length === 0) return;
        
        if (confirm('¿Estás seguro de que querés vaciar el carrito?')) {
            this.cart = [];
            this.saveCart();
            this.renderCart();
            this.updateSummary();
            
            if (window.app) {
                window.app.showNotification('Carrito vaciado', 'info');
            }
        }
    }
    
    // ===== RENDERIZADO =====
    renderCart() {
        const emptyCart = document.getElementById('emptyCart');
        const cartItemsList = document.getElementById('cartItemsList');
        const cartActions = document.getElementById('cartActions');
        const orderSummary = document.getElementById('orderSummary');
        const checkoutBtn = document.getElementById('checkoutBtn');
        
        if (this.cart.length === 0) {
            // Mostrar carrito vacío
            emptyCart.style.display = 'flex';
            cartItemsList.style.display = 'none';
            cartActions.style.display = 'none';
            checkoutBtn.disabled = true;
            return;
        }
        
        // Ocultar carrito vacío
        emptyCart.style.display = 'none';
        cartItemsList.style.display = 'block';
        cartActions.style.display = 'flex';
        checkoutBtn.disabled = false;
        
        // Renderizar items
        cartItemsList.innerHTML = this.cart.map(item => this.createCartItemHTML(item)).join('');
        
        // Añadir eventos a los controles de cantidad
        this.setupQuantityControls();
    }
    
    createCartItemHTML(item) {
        const discount = item.promocion > 0;
        const finalPrice = discount ? item.precio * (1 - item.promocion / 100) : item.precio;
        const subtotal = finalPrice * item.quantity;
        
        return `
            <div class="cart-item" data-product-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.imagen}" alt="${item.nombre}" loading="lazy"
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik01MCA1MEg3MFY3MEg1MFY1MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'">
                    ${discount ? `<div class="cart-item-offer">-${item.promocion}%</div>` : ''}
                </div>
                <div class="cart-item-content">
                    <div class="cart-item-header">
                        <h3 class="cart-item-name">${item.nombre}</h3>
                        <p class="cart-item-description">${item.descripcion}</p>
                        <p class="cart-item-code">Código: ${item.codigo}</p>
                    </div>
                    <div class="cart-item-footer">
                        <div class="cart-item-prices">
                            <span class="cart-item-current">$${finalPrice.toLocaleString('es-AR')}</span>
                            ${discount ? `<span class="cart-item-original">$${item.precio.toLocaleString('es-AR')}</span>` : ''}
                        </div>
                        <div class="cart-item-actions">
                            <div class="quantity-controls">
                                <button class="quantity-btn" onclick="cart.decreaseQuantity(${item.id})" 
                                        ${item.quantity <= 1 ? 'disabled' : ''}>
                                    −
                                </button>
                                <input type="number" class="quantity-input" value="${item.quantity}" 
                                       min="1" onchange="cart.updateQuantityFromInput(${item.id}, this.value)">
                                <button class="quantity-btn" onclick="cart.increaseQuantity(${item.id})">
                                    +
                                </button>
                            </div>
                            <button class="remove-item-btn" onclick="cart.removeItem(${item.id})">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <polyline points="3,6 5,6 21,6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="m19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // ===== RESUMEN DEL PEDIDO =====
    updateSummary() {
        const summaryItems = document.getElementById('summaryItems');
        const subtotalElement = document.getElementById('subtotal');
        const savingsRow = document.getElementById('savingsRow');
        const savingsElement = document.getElementById('savings');
        const totalElement = document.getElementById('total');
        
        if (this.cart.length === 0) {
            summaryItems.innerHTML = '';
            subtotalElement.textContent = '$0';
            savingsRow.style.display = 'none';
            totalElement.textContent = '$0';
            return;
        }
        
        // Renderizar items del resumen
        summaryItems.innerHTML = this.cart.map(item => {
            const discount = item.promocion > 0;
            const finalPrice = discount ? item.precio * (1 - item.promocion / 100) : item.precio;
            
            return `
                <div class="summary-item">
                    <div class="summary-item-info">
                        <div class="summary-item-name">${item.nombre}</div>
                        <div class="summary-item-qty">Cantidad: ${item.quantity}</div>
                    </div>
                    <div class="summary-item-price">$${(finalPrice * item.quantity).toLocaleString('es-AR')}</div>
                </div>
            `;
        }).join('');
        
        // Calcular totales
        let subtotal = 0;
        let totalSavings = 0;
        
        this.cart.forEach(item => {
            const originalPrice = item.precio;
            const finalPrice = item.promocion > 0 ? 
                item.precio * (1 - item.promocion / 100) : 
                item.precio;
            
            subtotal += finalPrice * item.quantity;
            totalSavings += (originalPrice - finalPrice) * item.quantity;
        });
        
        // Actualizar elementos
        subtotalElement.textContent = `$${subtotal.toLocaleString('es-AR')}`;
        
        if (totalSavings > 0) {
            savingsRow.style.display = 'flex';
            savingsElement.textContent = `-$${totalSavings.toLocaleString('es-AR')}`;
        } else {
            savingsRow.style.display = 'none';
        }
        
        totalElement.textContent = `$${subtotal.toLocaleString('es-AR')}`;
    }
    
    // ===== CONTROLES DE CANTIDAD =====
    setupQuantityControls() {
        // Los eventos ya están asignados en el HTML, pero podríamos añadir validaciones adicionales aquí
        const quantityInputs = document.querySelectorAll('.quantity-input');
        quantityInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                if (value < 1 || isNaN(value)) {
                    e.target.value = 1;
                }
            });
        });
    }
    
    increaseQuantity(productId) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            this.updateQuantity(productId, item.quantity + 1);
        }
    }
    
    decreaseQuantity(productId) {
        const item = this.cart.find(item => item.id === productId);
        if (item && item.quantity > 1) {
            this.updateQuantity(productId, item.quantity - 1);
        }
    }
    
    updateQuantityFromInput(productId, value) {
        const quantity = parseInt(value);
        if (!isNaN(quantity) && quantity > 0) {
            this.updateQuantity(productId, quantity);
        }
    }
    
    // ===== CHECKOUT =====
    proceedToCheckout() {
        if (this.cart.length === 0) return;
        
        // Crear objeto de pedido temporal
        const order = {
            id: this.generateOrderId(),
            items: [...this.cart],
            subtotal: this.calculateSubtotal(),
            savings: this.calculateSavings(),
            total: this.calculateTotal(),
            timestamp: new Date().toISOString(),
            status: 'pending'
        };
        
        // Guardar pedido temporal
        this.saveOrder(order);
        
        // Abrir formulario de cliente
        if (window.customerForm) {
            window.customerForm.open(order);
        } else {
            // Fallback al método anterior
            window.location.href = `confirmacion.html?orderId=${order.id}`;
        }
    }
    
    openCustomerForm() {
        if (this.cart.length === 0) return;
        
        // Crear objeto de pedido temporal
        const order = {
            id: this.generateOrderId(),
            items: [...this.cart],
            subtotal: this.calculateSubtotal(),
            savings: this.calculateSavings(),
            total: this.calculateTotal(),
            timestamp: new Date().toISOString(),
            status: 'pending'
        };
        
        // Guardar pedido temporal
        this.saveOrder(order);
        
        // Abrir formulario de cliente
        if (window.customerForm) {
            window.customerForm.open(order);
        } else {
            // Fallback al método anterior
            window.location.href = `confirmacion.html?orderId=${order.id}`;
        }
    }
    
    generateOrderId() {
        return 'SJ' + Date.now().toString(36).toUpperCase();
    }
    
    calculateSubtotal() {
        return this.cart.reduce((total, item) => {
            const price = item.promocion > 0 ? 
                item.precio * (1 - item.promocion / 100) : 
                item.precio;
            return total + (price * item.quantity);
        }, 0);
    }
    
    calculateSavings() {
        return this.cart.reduce((savings, item) => {
            if (item.promocion > 0) {
                const discount = item.precio * (item.promocion / 100);
                return savings + (discount * item.quantity);
            }
            return savings;
        }, 0);
    }
    
    calculateTotal() {
        return this.calculateSubtotal();
    }
    
    saveOrder(order) {
        // Obtener pedidos existentes
        const existingOrders = JSON.parse(localStorage.getItem('sanJuanOrders') || '[]');
        
        // Agregar nuevo pedido
        existingOrders.push(order);
        
        // Guardar
        localStorage.setItem('sanJuanOrders', JSON.stringify(existingOrders));
    }
    
    // ===== RECOMENDACIONES =====
    loadRecommendations() {
        const container = document.getElementById('recommendedProducts');
        if (!container || this.cart.length === 0) return;
        
        // Obtener categorías del carrito
        const categories = [...new Set(this.cart.map(item => item.categoria))];
        
        // Productos de ejemplo para recomendaciones
        const recommendations = this.getRecommendations(categories);
        
        container.innerHTML = recommendations.map(product => {
            const discount = product.promocion > 0;
            const finalPrice = discount ? product.precio * (1 - product.promocion / 100) : product.precio;
            
            return `
                <div class="product-card">
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
                        <button class="add-to-cart-btn" onclick="cart.addToRecommendations(${product.id})">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Agregar al Pedido
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    getRecommendations(excludeCategories = []) {
        // Productos de ejemplo para recomendaciones
        const allProducts = [
            {
                id: 1001,
                nombre: 'Destornillador Phillips 1/4"',
                descripcion: 'Destornillador Phillips profesional 1/4". Mango ergonómico.',
                precio: 1200,
                promocion: 0,
                categoria: 'herramientas',
                imagen: 'https://via.placeholder.com/300x300/0047AB/FFFFFF?text=Destornillador'
            },
            {
                id: 1002,
                nombre: 'Arena Gruesa 1m³',
                descripcion: 'Arena gruesa para construcción. Ideal para contrapiso.',
                precio: 2800,
                promocion: 10,
                categoria: 'materiales',
                imagen: 'https://via.placeholder.com/300x300/8B4513/FFFFFF?text=Arena'
            },
            {
                id: 1003,
                nombre: 'Brocha Ancha 6"',
                descripcion: 'Brocha ancha profesional 6". Cerdas naturales.',
                precio: 850,
                promocion: 15,
                categoria: 'pintura',
                imagen: 'https://via.placeholder.com/300x300/228B22/FFFFFF?text=Brocha'
            },
            {
                id: 1004,
                nombre: 'Enchufe Triple',
                descripcion: 'Enchufe triple con tierra. 16A, 250V.',
                precio: 450,
                promocion: 0,
                categoria: 'electricidad',
                imagen: 'https://via.placeholder.com/300x300/DAA520/FFFFFF?text=Enchufe'
            }
        ];
        
        // Filtrar por categorías (excluyendo las del carrito)
        return allProducts.filter(product => 
            !excludeCategories.includes(product.categoria)
        ).slice(0, 4);
    }
    
    addToRecommendations(productId) {
        const recommendations = this.getRecommendations();
        const product = recommendations.find(p => p.id === productId);
        
        if (product) {
            this.addItem(product);
        }
    }
    
    // ===== EVENTOS =====
    setupEventListeners() {
        // Búsqueda
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        if (searchInput) {
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
    }
    
    performSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput && searchInput.value.trim()) {
            window.location.href = `productos.html?search=${encodeURIComponent(searchInput.value)}`;
        } else {
            window.location.href = 'productos.html';
        }
    }
}

// ===== FUNCIONES GLOBALES =====
window.cart = new CartManager();

window.clearCart = function() {
    window.cart.clearCart();
};

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    // Si llegamos desde la página de productos con un producto específico
    const urlParams = new URLSearchParams(window.location.search);
    const addProductId = urlParams.get('addProduct');
    
    if (addProductId && window.app && window.app.products) {
        const product = window.app.products.find(p => p.id == addProductId);
        if (product) {
            window.cart.addItem(product);
        }
    }
});