// ===== SAN JUAN CONSTRUYE - PÁGINA DE PRODUCTOS =====

class ProductsPage {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentPage = 1;
        this.productsPerPage = 12;
        this.currentView = 'grid';
        this.filters = {
            category: 'all',
            search: '',
            minPrice: null,
            maxPrice: null,
            onlyPromotions: false,
            inStock: false,
            sortBy: 'nombre'
        };
        
        this.init();
    }
    
    init() {
        this.loadProducts();
        this.setupEventListeners();
        this.setupMobileFilters();
    }
    
    // ===== CARGA DE PRODUCTOS =====
    async loadProducts() {
        try {
            this.showLoading(true);
            
            // Usar ProductsManager si está disponible
            if (window.productsManager) {
                // Intentar cargar desde Google Sheets
                this.products = await window.productsManager.loadFromGoogleSheets();
                
                // Si no hay datos, usar cache o fallback
                if (!this.products || this.products.length === 0) {
                    this.products = window.productsManager.loadFromCache() || 
                                   window.productsManager.getFallbackProducts();
                }
            } else {
                // Fallback a datos estáticos
                this.products = this.getStaticProducts();
            }
            
            this.filteredProducts = [...this.products];
            this.renderProducts();
            this.updateProductsCount();
            this.setupPagination();
            
        } catch (error) {
            console.error('Error cargando productos:', error);
            this.showError('Error cargando productos. Intentá nuevamente.');
        } finally {
            this.showLoading(false);
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
            },
            {
                id: 7,
                nombre: 'Amoladora Angular 9"',
                descripcion: 'Amoladora angular 9" con potencia de 2200W. Incluye disco.',
                precio: 12500,
                promocion: 0,
                categoria: 'herramientas',
                imagen: 'https://via.placeholder.com/300x300/FF9100/FFFFFF?text=Amoladora',
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
                imagen: 'https://via.placeholder.com/300x300/9CA3AF/FFFFFF?text=Arena',
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
                imagen: 'https://via.placeholder.com/300x300/374151/FFFFFF?text=Pincel',
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
                imagen: 'https://via.placeholder.com/300x300/111827/FFFFFF?text=Interruptor',
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
                imagen: 'https://via.placeholder.com/300x300/EF6C00/FFFFFF?text=Llave',
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
                imagen: 'https://via.placeholder.com/300x300/0047AB/FFFFFF?text=Martillo',
                stock: 18,
                codigo: 'TAL003'
            },
            {
                id: 13,
                nombre: 'Ladrillo Común x100',
                descripcion: 'Ladrillo común para construcción. Medidas estándar.',
                precio: 1500,
                promocion: 0,
                categoria: 'materiales',
                imagen: 'https://via.placeholder.com/300x300/8B4513/FFFFFF?text=Ladrillo',
                stock: 200,
                codigo: 'MAT003'
            },
            {
                id: 14,
                nombre: 'Rodillo de Pintura 9"',
                descripcion: 'Rodillo de pintura 9" con mango ergonómico.',
                precio: 850,
                promocion: 18,
                categoria: 'pintura',
                imagen: 'https://via.placeholder.com/300x300/228B22/FFFFFF?text=Rodillo',
                stock: 45,
                codigo: 'PIN003'
            },
            {
                id: 15,
                nombre: 'Portalámparas Cerámico',
                descripcion: 'Portalámparas cerámico para lamparas Edison.',
                precio: 280,
                promocion: 0,
                categoria: 'electricidad',
                imagen: 'https://via.placeholder.com/300x300/DAA520/FFFFFF?text=Portalámparas',
                stock: 60,
                codigo: 'ELE003'
            },
            {
                id: 16,
                nombre: 'Canilla Mezcladora Baño',
                descripcion: 'Canilla mezcladora para baño. Acero inoxidable.',
                precio: 12500,
                promocion: 8,
                categoria: 'plomeria',
                imagen: 'https://via.placeholder.com/300x300/C0C0C0/FFFFFF?text=Canilla',
                stock: 6,
                codigo: 'PLO003'
            }
        ];
    }
    
    // ===== RENDERIZADO =====
    renderProducts() {
        const startIndex = (this.currentPage - 1) * this.productsPerPage;
        const endIndex = startIndex + this.productsPerPage;
        const productsToShow = this.filteredProducts.slice(startIndex, endIndex);
        
        if (this.currentView === 'grid') {
            this.renderProductsGrid(productsToShow);
        } else {
            this.renderProductsList(productsToShow);
        }
        
        this.updatePagination();
    }
    
    renderProductsGrid(products) {
        const container = document.getElementById('productsGrid');
        const listContainer = document.getElementById('productsList');
        
        if (!container) return;
        
        container.style.display = 'grid';
        listContainer.style.display = 'none';
        
        if (products.length === 0) {
            container.innerHTML = '';
            this.showNoResults(true);
            return;
        }
        
        this.showNoResults(false);
        
        container.innerHTML = products.map(product => this.createProductCard(product)).join('');
        
        // Añadir animación de entrada
        container.querySelectorAll('.product-card').forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('fade-in');
        });
    }
    
    renderProductsList(products) {
        const container = document.getElementById('productsList');
        const gridContainer = document.getElementById('productsGrid');
        
        if (!container) return;
        
        container.style.display = 'flex';
        gridContainer.style.display = 'none';
        
        if (products.length === 0) {
            container.innerHTML = '';
            this.showNoResults(true);
            return;
        }
        
        this.showNoResults(false);
        
        container.innerHTML = products.map(product => this.createProductListItem(product)).join('');
        
        // Añadir animación de entrada
        container.querySelectorAll('.product-list-item').forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
            item.classList.add('fade-in');
        });
    }
    
    createProductCard(product) {
        const discount = product.promocion > 0;
        const finalPrice = discount ? product.precio * (1 - product.promocion / 100) : product.precio;
        const inStock = product.stock > 0;
        
        return `
            <div class="product-card" data-category="${product.categoria}">
                <div class="product-image">
                    <img src="${product.imagen}" alt="${product.nombre}" loading="lazy"
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjUgMTI1SDE3NVYxNzVIMTI1VjEyNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'">
                    ${discount ? `<div class="offer-badge">-${product.promocion}%</div>` : ''}
                    ${!inStock ? '<div class="stock-badge">Sin stock</div>' : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.nombre}</h3>
                    <p class="product-description">${product.descripcion}</p>
                    <div class="product-prices">
                        <span class="current-price">$${finalPrice.toLocaleString('es-AR')}</span>
                        ${discount ? `<span class="original-price">$${product.precio.toLocaleString('es-AR')}</span>` : ''}
                    </div>
                    <button class="add-to-cart-btn" data-product-id="${product.id}" 
                            onclick="app.addToCart(${product.id})" ${!inStock ? 'disabled' : ''}>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        ${inStock ? 'Agregar al Pedido' : 'Sin Stock'}
                    </button>
                </div>
            </div>
        `;
    }
    
    createProductListItem(product) {
        const discount = product.promocion > 0;
        const finalPrice = discount ? product.precio * (1 - product.promocion / 100) : product.precio;
        const inStock = product.stock > 0;
        
        return `
            <div class="product-list-item" data-category="${product.categoria}">
                <div class="product-list-image">
                    <img src="${product.imagen}" alt="${product.nombre}" loading="lazy"
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik01MCA1MEg3MFY3MEg1MFY1MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'">
                    ${discount ? `<div class="product-list-offer">-${product.promocion}%</div>` : ''}
                </div>
                <div class="product-list-content">
                    <div class="product-list-header">
                        <h3 class="product-list-name">${product.nombre}</h3>
                        <p class="product-list-description">${product.descripcion}</p>
                    </div>
                    <div class="product-list-footer">
                        <div class="product-list-prices">
                            <span class="product-list-current">$${finalPrice.toLocaleString('es-AR')}</span>
                            ${discount ? `<span class="product-list-original">$${product.precio.toLocaleString('es-AR')}</span>` : ''}
                        </div>
                        <div class="product-list-actions">
                            <button class="add-to-cart-btn" data-product-id="${product.id}" 
                                    onclick="app.addToCart(${product.id})" ${!inStock ? 'disabled' : ''}>
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                ${inStock ? 'Agregar al Pedido' : 'Sin Stock'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // ===== FILTROS =====
    applyFilters() {
        this.filteredProducts = this.products.filter(product => {
            // Filtro por categoría
            if (this.filters.category !== 'all' && product.categoria !== this.filters.category) {
                return false;
            }
            
            // Filtro por búsqueda
            if (this.filters.search) {
                const searchTerm = this.filters.search.toLowerCase();
                const searchableText = `${product.nombre} ${product.descripcion} ${product.codigo}`.toLowerCase();
                if (!searchableText.includes(searchTerm)) {
                    return false;
                }
            }
            
            // Filtro por precio
            if (this.filters.minPrice !== null && product.precio < this.filters.minPrice) {
                return false;
            }
            
            if (this.filters.maxPrice !== null && product.precio > this.filters.maxPrice) {
                return false;
            }
            
            // Filtro por promociones
            if (this.filters.onlyPromotions && product.promocion === 0) {
                return false;
            }
            
            // Filtro por stock
            if (this.filters.inStock && product.stock === 0) {
                return false;
            }
            
            return true;
        });
        
        // Aplicar ordenamiento
        this.filteredProducts = this.sortProducts(this.filteredProducts, this.filters.sortBy);
        
        // Resetear a la primera página
        this.currentPage = 1;
        
        this.renderProducts();
        this.updateProductsCount();
        this.setupPagination();
    }
    
    sortProducts(products, sortBy) {
        const sorted = [...products];
        
        switch (sortBy) {
            case 'precio-asc':
                return sorted.sort((a, b) => {
                    const priceA = a.promocion > 0 ? a.precio * (1 - a.promocion / 100) : a.precio;
                    const priceB = b.promocion > 0 ? b.precio * (1 - b.promocion / 100) : b.precio;
                    return priceA - priceB;
                });
                
            case 'precio-desc':
                return sorted.sort((a, b) => {
                    const priceA = a.promocion > 0 ? a.precio * (1 - a.promocion / 100) : a.precio;
                    const priceB = b.promocion > 0 ? b.precio * (1 - b.promocion / 100) : b.precio;
                    return priceB - priceA;
                });
                
            case 'promocion':
                return sorted.sort((a, b) => b.promocion - a.promocion);
                
            case 'stock':
                return sorted.sort((a, b) => b.stock - a.stock);
                
            case 'nombre':
            default:
                return sorted.sort((a, b) => a.nombre.localeCompare(b.nombre));
        }
    }
    
    // ===== PAGINACIÓN =====
    setupPagination() {
        const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
        
        if (totalPages <= 1) {
            document.getElementById('pagination').innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // Botón anterior
        paginationHTML += `
            <button class="pagination-btn" onclick="productsPage.changePage(${this.currentPage - 1})" 
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                Anterior
            </button>
        `;
        
        // Números de página
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);
        
        if (startPage > 1) {
            paginationHTML += `<button class="pagination-btn" onclick="productsPage.changePage(1)">1</button>`;
            if (startPage > 2) {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" 
                        onclick="productsPage.changePage(${i})">
                    ${i}
                </button>
            `;
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
            }
            paginationHTML += `<button class="pagination-btn" onclick="productsPage.changePage(${totalPages})">${totalPages}</button>`;
        }
        
        // Botón siguiente
        paginationHTML += `
            <button class="pagination-btn" onclick="productsPage.changePage(${this.currentPage + 1})" 
                    ${this.currentPage === totalPages ? 'disabled' : ''}>
                Siguiente
            </button>
        `;
        
        document.getElementById('pagination').innerHTML = paginationHTML;
    }
    
    changePage(page) {
        const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
        
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        this.renderProducts();
        this.setupPagination();
        
        // Scroll hacia arriba
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // ===== EVENTOS =====
    setupEventListeners() {
        // Búsqueda
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value;
                this.applyFilters();
            });
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.filters.search = e.target.value;
                    this.applyFilters();
                }
            });
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.filters.search = searchInput.value;
                this.applyFilters();
            });
        }
        
        // Filtros de categoría
        const categoryFilters = document.querySelectorAll('input[name="category"]');
        categoryFilters.forEach(filter => {
            filter.addEventListener('change', (e) => {
                this.filters.category = e.target.value;
                this.applyFilters();
            });
        });
        
        // Filtros de precio
        const minPriceInput = document.getElementById('minPrice');
        const maxPriceInput = document.getElementById('maxPrice');
        
        if (minPriceInput) {
            minPriceInput.addEventListener('input', (e) => {
                this.filters.minPrice = e.target.value ? parseFloat(e.target.value) : null;
                this.applyFilters();
            });
        }
        
        if (maxPriceInput) {
            maxPriceInput.addEventListener('input', (e) => {
                this.filters.maxPrice = e.target.value ? parseFloat(e.target.value) : null;
                this.applyFilters();
            });
        }
        
        // Filtro de promociones
        const promotionsFilter = document.getElementById('onlyPromotions');
        if (promotionsFilter) {
            promotionsFilter.addEventListener('change', (e) => {
                this.filters.onlyPromotions = e.target.checked;
                this.applyFilters();
            });
        }
        
        // Filtro de stock
        const stockFilter = document.getElementById('inStock');
        if (stockFilter) {
            stockFilter.addEventListener('change', (e) => {
                this.filters.inStock = e.target.checked;
                this.applyFilters();
            });
        }
        
        // Ordenamiento
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.filters.sortBy = e.target.value;
                this.applyFilters();
            });
        }
        
        // Vista
        const viewButtons = document.querySelectorAll('.view-btn');
        viewButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                this.changeView(view);
            });
        });
        
        // Limpiar filtros
        const clearFiltersBtn = document.getElementById('clearFilters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }
        
        // Carrito
        const cartBtn = document.getElementById('cartBtn');
        if (cartBtn) {
            cartBtn.addEventListener('click', () => {
                window.location.href = 'carrito.html';
            });
        }
    }
    
    setupMobileFilters() {
        const mobileFiltersBtn = document.getElementById('mobileFiltersBtn');
        const filtersSidebar = document.getElementById('filtersSidebar');
        const filtersClose = document.getElementById('filtersClose');
        const overlay = document.getElementById('mobileFiltersOverlay');
        
        if (mobileFiltersBtn && filtersSidebar) {
            mobileFiltersBtn.addEventListener('click', () => {
                filtersSidebar.classList.add('open');
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        }
        
        if (filtersClose && filtersSidebar && overlay) {
            const closeFilters = () => {
                filtersSidebar.classList.remove('open');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            };
            
            filtersClose.addEventListener('click', closeFilters);
            overlay.addEventListener('click', closeFilters);
        }
    }
    
    // ===== UTILIDADES =====
    changeView(view) {
        this.currentView = view;
        
        // Actualizar botones de vista
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        this.renderProducts();
    }
    
    clearAllFilters() {
        // Resetear filtros
        this.filters = {
            category: 'all',
            search: '',
            minPrice: null,
            maxPrice: null,
            onlyPromotions: false,
            inStock: false,
            sortBy: 'nombre'
        };
        
        // Resetear UI
        document.querySelectorAll('input[name="category"]').forEach(input => {
            input.checked = input.value === 'all';
        });
        
        const searchInput = document.getElementById('searchInput');
        const minPriceInput = document.getElementById('minPrice');
        const maxPriceInput = document.getElementById('maxPrice');
        const promotionsFilter = document.getElementById('onlyPromotions');
        const stockFilter = document.getElementById('inStock');
        const sortSelect = document.getElementById('sortSelect');
        
        if (searchInput) searchInput.value = '';
        if (minPriceInput) minPriceInput.value = '';
        if (maxPriceInput) maxPriceInput.value = '';
        if (promotionsFilter) promotionsFilter.checked = false;
        if (stockFilter) stockFilter.checked = false;
        if (sortSelect) sortSelect.value = 'nombre';
        
        this.applyFilters();
    }
    
    updateProductsCount() {
        const countElement = document.getElementById('productsCount');
        if (countElement) {
            const count = this.filteredProducts.length;
            const text = count === 1 ? 'producto' : 'productos';
            countElement.textContent = `${count} ${text}`;
        }
    }
    
    showLoading(show) {
        const loadingState = document.getElementById('loadingState');
        const productsGrid = document.getElementById('productsGrid');
        const productsList = document.getElementById('productsList');
        
        if (show) {
            if (loadingState) loadingState.style.display = 'flex';
            if (productsGrid) productsGrid.style.display = 'none';
            if (productsList) productsList.style.display = 'none';
        } else {
            if (loadingState) loadingState.style.display = 'none';
        }
    }
    
    showNoResults(show) {
        const noResults = document.getElementById('noResults');
        if (noResults) {
            noResults.style.display = show ? 'flex' : 'none';
        }
    }
    
    showError(message) {
        if (window.app && window.app.showNotification) {
            window.app.showNotification(message, 'error');
        }
    }
}

// ===== FUNCIONES GLOBALES =====
window.clearAllFilters = function() {
    if (window.productsPage) {
        window.productsPage.clearAllFilters();
    }
};

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    window.productsPage = new ProductsPage();
});