// ===== SAN JUAN CONSTRUYE - INTEGRACIÓN WHATSAPP =====

class WhatsAppIntegration {
    constructor() {
        this.phoneNumber = '5491145678900'; // Número de WhatsApp Business
        this.businessName = 'San Juan Construye';
        this.init();
    }
    
    init() {
        // Verificar si estamos en un entorno de navegador
        if (typeof window !== 'undefined') {
            this.setupWhatsAppHandlers();
        }
    }
    
    // ===== CONFIGURACIÓN =====
    setPhoneNumber(phoneNumber) {
        this.phoneNumber = phoneNumber.replace(/[^\d]/g, ''); // Limpiar formato
    }
    
    setBusinessName(businessName) {
        this.businessName = businessName;
    }
    
    // ===== GENERACIÓN DE MENSAJES =====
    generateOrderMessage(orderData) {
        const {
            customerInfo,
            orderItems,
            totals,
            orderId,
            timestamp
        } = orderData;
        
        let message = `🏗️ *${this.businessName}* - Nuevo Pedido\n\n`;
        message += `📋 *Número de Pedido:* ${orderId}\n`;
        message += `📅 *Fecha:* ${this.formatDate(timestamp)}\n\n`;
        
        message += `👤 *DATOS DEL CLIENTE*\n`;
        message += `📝 Nombre: ${customerInfo.nombre}\n`;
        message += `📱 Teléfono: ${customerInfo.telefono}\n`;
        message += `📧 Email: ${customerInfo.email || 'No proporcionado'}\n`;
        message += `🏠 Dirección: ${customerInfo.direccion}\n`;
        message += `📍 Localidad: ${customerInfo.localidad}\n`;
        message += `💬 Comentarios: ${customerInfo.comentarios || 'Ninguno'}\n\n`;
        
        message += `🛒 *PRODUCTOS SOLICITADOS*\n`;
        orderItems.forEach((item, index) => {
            const discount = item.promocion > 0;
            const finalPrice = discount ? item.precio * (1 - item.promocion / 100) : item.precio;
            const subtotal = finalPrice * item.quantity;
            
            message += `${index + 1}. *${item.nombre}*\n`;
            message += `   Cantidad: ${item.quantity}\n`;
            message += `   Precio unitario: $${finalPrice.toLocaleString('es-AR')}\n`;
            if (discount) {
                message += `   Precio original: $${item.precio.toLocaleString('es-AR')} (${item.promocion}% OFF)\n`;
            }
            message += `   Subtotal: $${subtotal.toLocaleString('es-AR')}\n`;
            message += `   Código: ${item.codigo}\n\n`;
        });
        
        message += `💰 *RESUMEN*\n`;
        message += `Subtotal: $${totals.subtotal.toLocaleString('es-AR')}\n`;
        if (totals.savings > 0) {
            message += `Ahorros: -$${totals.savings.toLocaleString('es-AR')}\n`;
        }
        message += `*TOTAL: $${totals.total.toLocaleString('es-AR')}*\n\n`;
        
        message += `🚚 *MÉTODO DE ENTREGA*\n`;
        message += `${customerInfo.metodoEntrega === 'retiro' ? '📦 Retiro en tienda' : '🚛 Envío a domicilio'}\n\n`;
        
        message += `📞 *Contacto:* ${this.phoneNumber}\n`;
        message += `🕒 *Horario:* Lun-Vie 8-18hs, Sáb 8-13hs\n\n`;
        message += `Gracias por elegir ${this.businessName}! 🙏`;
        
        return encodeURIComponent(message);
    }
    
    generateCustomerMessage(orderData) {
        const { orderId, customerInfo, totals } = orderData;
        
        let message = `¡Hola ${customerInfo.nombre}! 👋\n\n`;
        message += `Tu pedido *${orderId}* ha sido recibido correctamente en ${this.businessName}.\n\n`;
        message += `📋 *Resumen:*\n`;
        message += `• Total: $${totals.total.toLocaleString('es-AR')}\n`;
        message += `• Productos: ${orderData.orderItems.length}\n\n`;
        message += `📞 *Próximos pasos:*\n`;
        message += `1. Te contactaremos para confirmar el pedido\n`;
        message += `2. Coordinaremos el pago\n`;
        message += `3. Coordinaremos entrega/retiro\n\n`;
        message += `¿Tenés alguna consulta? ¡Respondé este mensaje! 😊\n\n`;
        message += `¡Gracias por elegir ${this.businessName}! 🙏`;
        
        return encodeURIComponent(message);
    }
    
    // ===== ENVÍO DE WHATSAPP =====
    sendToBusiness(orderData) {
        const message = this.generateOrderMessage(orderData);
        const url = `https://wa.me/${this.phoneNumber}?text=${message}`;
        
        // Abrir WhatsApp Web/App
        window.open(url, '_blank');
        
        return url;
    }
    
    sendToCustomer(orderData) {
        const message = this.generateCustomerMessage(orderData);
        const customerPhone = orderData.customerInfo.telefono.replace(/[^\d]/g, '');
        
        // Solo enviar si el cliente proporcionó WhatsApp
        if (customerPhone && customerPhone.length >= 10) {
            const url = `https://wa.me/${customerPhone}?text=${message}`;
            window.open(url, '_blank');
            return url;
        }
        
        return null;
    }
    
    // ===== INTEGRACIÓN CON FORMULARIOS =====
    setupWhatsAppHandlers() {
        // Handler para botones de WhatsApp en el HTML
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-whatsapp-action]')) {
                e.preventDefault();
                const action = e.target.dataset.whatsappAction;
                const orderId = e.target.dataset.orderId;
                
                if (action === 'contact-business' && window.orderData) {
                    this.sendToBusiness(window.orderData);
                } else if (action === 'contact-customer' && window.orderData) {
                    this.sendToCustomer(window.orderData);
                }
            }
        });
    }
    
    // ===== UTILIDADES =====
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-AR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // ===== VALIDACIÓN DE NÚMEROS =====
    validatePhoneNumber(phone) {
        // Validar formato argentino
        const phoneRegex = /^(\+54|0)?[11]\d{8,9}$/;
        return phoneRegex.test(phone.replace(/[^\d+]/g, ''));
    }
    
    formatPhoneForWhatsApp(phone) {
        // Convertir a formato internacional
        let cleanPhone = phone.replace(/[^\d]/g, '');
        
        if (cleanPhone.startsWith('0')) {
            cleanPhone = '54' + cleanPhone.substring(1);
        } else if (!cleanPhone.startsWith('54')) {
            cleanPhone = '54' + cleanPhone;
        }
        
        return cleanPhone;
    }
    
    // ===== INTEGRACIÓN CON GOOGLE FORMS =====
    sendToGoogleForms(formData, formUrl) {
        // Preparar datos para Google Forms
        const formPayload = new FormData();
        
        // Mapear campos del formulario a campos de Google Forms
        Object.keys(formData).forEach(key => {
            formPayload.append(key, formData[key]);
        });
        
        // Enviar a Google Forms
        return fetch(formUrl, {
            method: 'POST',
            body: formPayload,
            mode: 'no-cors' // Para evitar problemas de CORS
        }).then(response => {
            console.log('Datos enviados a Google Forms:', formData);
            return response;
        }).catch(error => {
            console.error('Error enviando a Google Forms:', error);
            throw error;
        });
    }
    
    // ===== MANEJO DE ERRORES =====
    handleWhatsAppError(error, context = 'WhatsApp') {
        console.error(`Error en ${context}:`, error);
        
        // Mostrar notificación al usuario
        if (window.app && window.app.showNotification) {
            window.app.showNotification(
                `Error enviando mensaje por WhatsApp. Intentá nuevamente.`,
                'error'
            );
        }
        
        // Fallback: copiar mensaje al portapapeles
        this.copyMessageToClipboard(error.message || 'Error desconocido');
    }
    
    copyMessageToClipboard(message) {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(message).then(() => {
                if (window.app && window.app.showNotification) {
                    window.app.showNotification(
                        'Mensaje copiado al portapapeles',
                        'success'
                    );
                }
            }).catch(err => {
                console.error('Error copiando al portapapeles:', err);
            });
        }
    }
}

// ===== CONFIGURACIÓN GLOBAL =====
window.whatsApp = new WhatsAppIntegration();

// ===== FUNCIONES DE UTILIDAD PARA HTML =====
window.sendOrderToWhatsApp = function() {
    if (window.orderData) {
        return window.whatsApp.sendToBusiness(window.orderData);
    }
    return null;
};

window.sendConfirmationToCustomer = function() {
    if (window.orderData) {
        return window.whatsApp.sendToCustomer(window.orderData);
    }
    return null;
};

window.validatePhone = function(phone) {
    return window.whatsApp.validatePhoneNumber(phone);
};

window.formatPhoneForWhatsApp = function(phone) {
    return window.whatsApp.formatPhoneForWhatsApp(phone);
};

// ===== CONFIGURACIÓN DESDE VARIABLES DE ENTORNO =====
if (typeof process !== 'undefined' && process.env) {
    // Configuración desde variables de entorno (para build)
    if (process.env.WHATSAPP_PHONE) {
        window.whatsApp.setPhoneNumber(process.env.WHATSAPP_PHONE);
    }
    if (process.env.BUSINESS_NAME) {
        window.whatsApp.setBusinessName(process.env.BUSINESS_NAME);
    }
}