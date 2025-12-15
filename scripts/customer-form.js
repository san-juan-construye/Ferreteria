// ===== SAN JUAN CONSTRUYE - FORMULARIO DE CLIENTE =====

class CustomerForm {
    constructor() {
        this.isOpen = false;
        this.currentOrderData = null;
        this.googleFormsUrl = 'https://docs.google.com/forms/d/e/TU_FORM_ID/formResponse'; // Reemplazar con URL real
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupFormValidation();
    }
    
    // ===== MODAL MANAGEMENT =====
    open(orderData = null) {
        this.currentOrderData = orderData;
        this.isOpen = true;
        
        const overlay = document.getElementById('customerModal');
        if (overlay) {
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Focus en el primer input
            setTimeout(() => {
                const firstInput = overlay.querySelector('input');
                if (firstInput) {
                    firstInput.focus();
                }
            }, 300);
        }
        
        // Pre-fill form if order data exists
        if (orderData) {
            this.prefillForm(orderData);
        }
    }
    
    close() {
        this.isOpen = false;
        
        const overlay = document.getElementById('customerModal');
        if (overlay) {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        // Limpiar datos temporales
        this.currentOrderData = null;
    }
    
    // ===== FORM HANDLING =====
    setupEventListeners() {
        // Modal events
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="open-customer-form"]')) {
                e.preventDefault();
                this.open();
            }
            
            if (e.target.matches('[data-action="close-customer-form"]') || e.target.classList.contains('modal-overlay')) {
                e.preventDefault();
                this.close();
            }
        });
        
        // Form submission
        document.addEventListener('submit', (e) => {
            if (e.target.matches('#customerForm')) {
                e.preventDefault();
                this.handleFormSubmit(e.target);
            }
        });
        
        // Delivery method change
        document.addEventListener('change', (e) => {
            if (e.target.name === 'metodoEntrega') {
                this.toggleDeliveryFields(e.target.value);
            }
        });
        
        // Real-time validation
        document.addEventListener('input', (e) => {
            if (e.target.matches('#customerForm input, #customerForm select, #customerForm textarea')) {
                this.validateField(e.target);
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.isOpen && e.key === 'Escape') {
                this.close();
            }
        });
    }
    
    setupFormValidation() {
        // Real-time validation rules
        this.validationRules = {
            nombre: {
                required: true,
                minLength: 2,
                pattern: /^[a-zA-ZáéíóúñÑ\s]+$/,
                message: 'El nombre debe contener solo letras y espacios'
            },
            telefono: {
                required: true,
                pattern: /^(\+54|0)?[11]\d{8,9}$/,
                message: 'Ingrese un teléfono válido argentino'
            },
            email: {
                required: false,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Ingrese un email válido'
            },
            direccion: {
                required: true,
                minLength: 10,
                message: 'La dirección debe tener al menos 10 caracteres'
            },
            localidad: {
                required: true,
                minLength: 2,
                message: 'Ingrese su localidad'
            }
        };
    }
    
    // ===== FORM VALIDATION =====
    validateField(field) {
        const fieldName = field.name;
        const value = field.value.trim();
        const rules = this.validationRules[fieldName];
        
        if (!rules) return true;
        
        let isValid = true;
        let errorMessage = '';
        
        // Required validation
        if (rules.required && !value) {
            isValid = false;
            errorMessage = 'Este campo es obligatorio';
        }
        
        // Pattern validation
        if (isValid && rules.pattern && value && !rules.pattern.test(value)) {
            isValid = false;
            errorMessage = rules.message;
        }
        
        // Min length validation
        if (isValid && rules.minLength && value.length < rules.minLength) {
            isValid = false;
            errorMessage = rules.message;
        }
        
        // Update field state
        this.updateFieldState(field, isValid, errorMessage);
        
        return isValid;
    }
    
    validateForm(form) {
        const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    updateFieldState(field, isValid, errorMessage) {
        const formGroup = field.closest('.form-group');
        const errorElement = formGroup.querySelector('.form-error');
        
        // Remove previous state
        formGroup.classList.remove('error', 'success');
        
        // Add new state
        if (isValid && field.value.trim()) {
            formGroup.classList.add('success');
        } else if (!isValid) {
            formGroup.classList.add('error');
        }
        
        // Update error message
        if (errorElement) {
            errorElement.textContent = errorMessage || '';
        }
    }
    
    // ===== FORM SUBMISSION =====
    async handleFormSubmit(form) {
        try {
            // Validate form
            if (!this.validateForm(form)) {
                this.showGlobalError('Por favor, corrige los errores en el formulario');
                return;
            }
            
            // Show loading state
            this.setFormLoading(true);
            
            // Collect form data
            const formData = this.collectFormData(form);
            
            // Add order data if available
            if (this.currentOrderData) {
                formData.pedido = this.currentOrderData;
            }
            
            // Send to Google Forms
            await this.sendToGoogleForms(formData);
            
            // Send to WhatsApp
            await this.sendToWhatsApp(formData);
            
            // Show success and close
            this.showSuccess();
            
            // Close modal after delay
            setTimeout(() => {
                this.close();
                this.resetForm(form);
                
                // Redirect to confirmation or trigger success action
                if (this.currentOrderData) {
                    this.handleOrderConfirmation(formData);
                }
            }, 2000);
            
        } catch (error) {
            console.error('Error procesando formulario:', error);
            this.showGlobalError('Error procesando el formulario. Intente nuevamente.');
        } finally {
            this.setFormLoading(false);
        }
    }
    
    collectFormData(form) {
        const formData = new FormData(form);
        const data = {};
        
        // Basic customer info
        data.nombre = formData.get('nombre');
        data.telefono = formData.get('telefono');
        data.email = formData.get('email') || '';
        data.direccion = formData.get('direccion');
        data.localidad = formData.get('localidad');
        data.comentarios = formData.get('comentarios') || '';
        
        // Delivery method
        data.metodoEntrega = formData.get('metodoEntrega');
        if (data.metodoEntrega === 'envio') {
            data.metodoPago = formData.get('metodoPago');
        }
        
        // Additional data
        data.timestamp = new Date().toISOString();
        data.source = 'webapp';
        
        return data;
    }
    
    // ===== GOOGLE FORMS INTEGRATION =====
    async sendToGoogleForms(formData) {
        try {
            // Prepare data for Google Forms
            const formsData = new FormData();
            
            // Map form fields to Google Forms entry IDs
            // Reemplazar con los IDs reales de tu Google Form
            formsData.append('entry.NOMBRE_ID', formData.nombre);
            formsData.append('entry.TELEFONO_ID', formData.telefono);
            formsData.append('entry.EMAIL_ID', formData.email);
            formsData.append('entry.DIRECCION_ID', formData.direccion);
            formsData.append('entry.LOCALIDAD_ID', formData.localidad);
            formsData.append('entry.COMENTARIOS_ID', formData.comentarios);
            formsData.append('entry.METODO_ENTREGA_ID', formData.metodoEntrega);
            formsData.append('entry.METODO_PAGO_ID', formData.metodoPago || '');
            
            // Add order data if available
            if (formData.pedido) {
                formsData.append('entry.ORDER_ID', formData.pedido.id);
                formsData.append('entry.TOTAL_ID', formData.pedido.total.toString());
                formsData.append('entry.ITEMS_COUNT_ID', formData.pedido.items.length.toString());
            }
            
            // Send to Google Forms
            const response = await fetch(this.googleFormsUrl, {
                method: 'POST',
                body: formsData,
                mode: 'no-cors' // Handle CORS
            });
            
            console.log('Datos enviados a Google Forms exitosamente');
            
        } catch (error) {
            console.error('Error enviando a Google Forms:', error);
            // Don't throw error, continue with other processes
        }
    }
    
    // ===== WHATSAPP INTEGRATION =====
    async sendToWhatsApp(formData) {
        try {
            if (!window.whatsApp) {
                console.warn('WhatsApp integration no disponible');
                return;
            }
            
            // Prepare order data for WhatsApp
            const orderData = {
                customerInfo: {
                    nombre: formData.nombre,
                    telefono: formData.telefono,
                    email: formData.email,
                    direccion: formData.direccion,
                    localidad: formData.localidad,
                    comentarios: formData.comentarios,
                    metodoEntrega: formData.metodoEntrega,
                    metodoPago: formData.metodoPago
                },
                orderItems: formData.pedido ? formData.pedido.items : [],
                totals: formData.pedido ? {
                    subtotal: formData.pedido.subtotal,
                    savings: formData.pedido.savings,
                    total: formData.pedido.total
                } : { subtotal: 0, savings: 0, total: 0 },
                orderId: formData.pedido ? formData.pedido.id : this.generateTempOrderId(),
                timestamp: formData.timestamp
            };
            
            // Send to business
            window.whatsApp.sendToBusiness(orderData);
            
            // Send confirmation to customer (optional)
            setTimeout(() => {
                window.whatsApp.sendToCustomer(orderData);
            }, 2000);
            
        } catch (error) {
            console.error('Error enviando a WhatsApp:', error);
            // Don't throw error, continue
        }
    }
    
    // ===== UI HELPERS =====
    prefillForm(orderData) {
        // Pre-fill customer info if available in localStorage
        const savedCustomer = localStorage.getItem('sanjuan_customer_info');
        if (savedCustomer) {
            try {
                const customerData = JSON.parse(savedCustomer);
                this.fillFormFields(customerData);
            } catch (e) {
                console.warn('Error parsing saved customer data');
            }
        }
    }
    
    fillFormFields(data) {
        const form = document.getElementById('customerForm');
        if (!form) return;
        
        Object.keys(data).forEach(key => {
            const field = form.querySelector(`[name="${key}"]`);
            if (field && data[key]) {
                field.value = data[key];
            }
        });
    }
    
    toggleDeliveryFields(method) {
        const paymentSection = document.querySelector('.payment-section');
        if (paymentSection) {
            if (method === 'envio') {
                paymentSection.style.display = 'block';
            } else {
                paymentSection.style.display = 'none';
            }
        }
    }
    
    setFormLoading(loading) {
        const submitBtn = document.querySelector('#customerForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = loading;
            submitBtn.classList.toggle('loading', loading);
            
            if (loading) {
                submitBtn.innerHTML = `
                    <div class="loading-spinner"></div>
                    Procesando...
                `;
            } else {
                submitBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 11l3 3L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Confirmar Pedido
                `;
            }
        }
    }
    
    showGlobalError(message) {
        const form = document.getElementById('customerForm');
        if (!form) return;
        
        // Remove existing error
        const existingError = form.querySelector('.form-global-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-global-error';
        errorDiv.textContent = message;
        
        form.insertBefore(errorDiv, form.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
    
    showSuccess() {
        const form = document.getElementById('customerForm');
        if (!form) return;
        
        // Hide form and show success message
        form.style.display = 'none';
        
        const successDiv = document.createElement('div');
        successDiv.className = 'form-success';
        successDiv.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3>¡Pedido Enviado!</h3>
            <p>Hemos recibido tu pedido y nos pondremos en contacto contigo pronto.</p>
        `;
        
        form.parentNode.appendChild(successDiv);
    }
    
    resetForm(form) {
        form.reset();
        form.style.display = 'block';
        
        // Remove success message
        const successDiv = form.parentNode.querySelector('.form-success');
        if (successDiv) {
            successDiv.remove();
        }
        
        // Clear field states
        const formGroups = form.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            group.classList.remove('error', 'success');
        });
        
        // Hide payment section if visible
        this.toggleDeliveryFields('retiro');
    }
    
    // ===== ORDER HANDLING =====
    handleOrderConfirmation(formData) {
        // Save customer info for future use
        localStorage.setItem('sanjuan_customer_info', JSON.stringify({
            nombre: formData.nombre,
            telefono: formData.telefono,
            email: formData.email,
            direccion: formData.direccion,
            localidad: formData.localidad,
            metodoEntrega: formData.metodoEntrega
        }));
        
        // Create final order object
        const finalOrder = {
            ...this.currentOrderData,
            customerInfo: formData,
            status: 'confirmed',
            confirmedAt: new Date().toISOString()
        };
        
        // Save final order
        this.saveFinalOrder(finalOrder);
        
        // Redirect to confirmation page
        setTimeout(() => {
            window.location.href = `confirmacion.html?orderId=${finalOrder.id}`;
        }, 1000);
    }
    
    saveFinalOrder(order) {
        const orders = JSON.parse(localStorage.getItem('sanJuanOrders') || '[]');
        const existingIndex = orders.findIndex(o => o.id === order.id);
        
        if (existingIndex >= 0) {
            orders[existingIndex] = order;
        } else {
            orders.push(order);
        }
        
        localStorage.setItem('sanJuanOrders', JSON.stringify(orders));
    }
    
    generateTempOrderId() {
        return 'SJ' + Date.now().toString(36).toUpperCase();
    }
}

// ===== GLOBAL INSTANCE =====
window.customerForm = new CustomerForm();

// ===== UTILITY FUNCTIONS =====
window.openCustomerForm = function() {
    window.customerForm.open();
};

window.closeCustomerForm = function() {
    window.customerForm.close();
};

// ===== AUTO-CONFIGURATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Configure Google Forms URL if available
    if (typeof window.GOOGLE_FORMS_CONFIG !== 'undefined') {
        window.customerForm.googleFormsUrl = window.GOOGLE_FORMS_CONFIG.url;
    }
    
    // Auto-open form if redirect parameter exists
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('showCustomerForm') === 'true') {
        setTimeout(() => {
            window.customerForm.open();
        }, 500);
    }
});