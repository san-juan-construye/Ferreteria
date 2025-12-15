// ===== SAN JUAN CONSTRUYE - PÁGINA DE CONFIRMACIÓN =====

class ConfirmationPage {
    constructor() {
        this.order = null;
        this.orderId = null;
        this.init();
    }
    
    init() {
        this.getOrderIdFromUrl();
        this.loadOrder();
        this.setupEventListeners();
        this.updateHeaderCart();
    }
    
    getOrderIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        this.orderId = urlParams.get('orderId');
        
        if (!this.orderId) {
            // Si no hay ID de pedido en URL, redirigir al inicio
            window.location.href = 'index.html';
            return;
        }
        
        // Actualizar el número de pedido en la interfaz
        const orderNumberElement = document.getElementById('orderNumber');
        if (orderNumberElement) {
            orderNumberElement.textContent = this.orderId;
        }
    }
    
    loadOrder() {
        try {
            // Obtener pedidos del localStorage
            const orders = JSON.parse(localStorage.getItem('sanJuanOrders') || '[]');
            this.order = orders.find(order => order.id === this.orderId);
            
            if (!this.order) {
                throw new Error('Pedido no encontrado');
            }
            
            this.renderOrderDetails();
            this.updateOrderDate();
            
        } catch (error) {
            console.error('Error cargando pedido:', error);
            this.showError('No se pudo cargar la información del pedido');
        }
    }
    
    renderOrderDetails() {
        if (!this.order) return;
        
        const orderItemsContainer = document.getElementById('orderItems');
        const orderSubtotalElement = document.getElementById('orderSubtotal');
        const orderSavingsRow = document.getElementById('orderSavingsRow');
        const orderSavingsElement = document.getElementById('orderSavings');
        const orderTotalElement = document.getElementById('orderTotal');
        
        if (!orderItemsContainer) return;
        
        // Renderizar items del pedido
        orderItemsContainer.innerHTML = this.order.items.map(item => {
            const discount = item.promocion > 0;
            const finalPrice = discount ? item.precio * (1 - item.promocion / 100) : item.precio;
            const subtotal = finalPrice * item.quantity;
            
            return `
                <div class="order-item">
                    <div class="order-item-image">
                        <img src="${item.imagen}" alt="${item.nombre}" loading="lazy"
                             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zNSAzNUg0NVY0NUgzNVYzNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'">
                    </div>
                    <div class="order-item-info">
                        <h4 class="order-item-name">${item.nombre}</h4>
                        <div class="order-item-details">
                            <span class="order-item-quantity">Cantidad: ${item.quantity}</span>
                            <span class="order-item-price">$${subtotal.toLocaleString('es-AR')}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Actualizar totales
        orderSubtotalElement.textContent = `$${this.order.subtotal.toLocaleString('es-AR')}`;
        
        if (this.order.savings > 0) {
            orderSavingsRow.style.display = 'flex';
            orderSavingsElement.textContent = `-$${this.order.savings.toLocaleString('es-AR')}`;
        } else {
            orderSavingsRow.style.display = 'none';
        }
        
        orderTotalElement.textContent = `$${this.order.total.toLocaleString('es-AR')}`;
    }
    
    updateOrderDate() {
        const orderDateElement = document.getElementById('orderDate');
        if (!orderDateElement || !this.order) return;
        
        const orderDate = new Date(this.order.timestamp);
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        orderDateElement.textContent = orderDate.toLocaleDateString('es-AR', options);
    }
    
    updateHeaderCart() {
        // El carrito debería estar vacío después de confirmar el pedido
        // Pero actualizamos por si acaso
        if (window.app) {
            window.app.updateCartUI();
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
        
        // Carrito
        const cartBtn = document.getElementById('cartBtn');
        if (cartBtn) {
            cartBtn.addEventListener('click', () => {
                // En la página de confirmación, el carrito debería estar vacío
                // Redirigimos a productos en su lugar
                window.location.href = 'productos.html';
            });
        }
        
        // Newsletter
        this.setupNewsletter();
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
    
    // ===== UTILIDADES =====
    performSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput && searchInput.value.trim()) {
            window.location.href = `productos.html?search=${encodeURIComponent(searchInput.value)}`;
        } else {
            window.location.href = 'productos.html';
        }
    }
    
    subscribeToNewsletter(email) {
        // Simulación de suscripción
        this.showNotification('¡Gracias! Te suscribiste a nuestro newsletter.', 'success');
        
        // En producción, enviar al backend
        console.log('Newsletter subscription:', email);
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
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
    
    showError(message) {
        this.showNotification(message, 'error');
        
        // Opcional: redirigir después de un tiempo
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 5000);
    }
    
    // ===== FUNCIONES GLOBALES =====
    printOrder() {
        window.print();
    }
}

// ===== FUNCIONES GLOBALES PARA HTML =====
window.printOrder = function() {
    if (window.confirmationPage) {
        window.confirmationPage.printOrder();
    }
};

window.showNotification = function(message, type) {
    if (window.confirmationPage) {
        window.confirmationPage.showNotification(message, type);
    }
};

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    window.confirmationPage = new ConfirmationPage();
    
    // Añadir animación de entrada a los elementos
    const animatedElements = document.querySelectorAll('.success-icon, .success-title, .success-message, .order-info');
    animatedElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.6s ease-out';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 200);
    });
});

// ===== FUNCIONES DE UTILIDAD =====

/**
 * Formatear fecha para mostrar
 * @param {Date} date - Fecha a formatear
 * @param {string} format - Formato deseado
 * @returns {string} Fecha formateada
 */
function formatDate(date, format = 'short') {
    const options = {
        short: { year: 'numeric', month: '2-digit', day: '2-digit' },
        long: { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        },
        time: { hour: '2-digit', minute: '2-digit' }
    };
    
    return date.toLocaleDateString('es-AR', options[format] || options.short);
}

/**
 * Calcular días desde una fecha
 * @param {Date} date - Fecha de referencia
 * @returns {number} Días transcurridos
 */
function daysSince(date) {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Obtener estado del pedido en texto
 * @param {string} status - Estado del pedido
 * @returns {string} Texto descriptivo del estado
 */
function getOrderStatusText(status) {
    const statusTexts = {
        pending: 'Pendiente de confirmación',
        confirmed: 'Confirmado',
        preparing: 'Preparando pedido',
        ready: 'Listo para retiro',
        delivered: 'Entregado',
        cancelled: 'Cancelado'
    };
    
    return statusTexts[status] || 'Estado desconocido';
}

/**
 * Obtener color del estado del pedido
 * @param {string} status - Estado del pedido
 * @returns {string} Clase CSS del color
 */
function getOrderStatusColor(status) {
    const statusColors = {
        pending: 'pending',
        confirmed: 'confirmed',
        preparing: 'preparing',
        ready: 'ready',
        delivered: 'delivered',
        cancelled: 'cancelled'
    };
    
    return statusColors[status] || 'pending';
}