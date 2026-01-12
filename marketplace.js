// ===== Marketplace Application =====
// Demo marketplace for farmers and vendors

// Global State
let currentUser = null;
let allProducts = [];
let myProducts = [];
let allOrders = [];

// Initialize marketplace
document.addEventListener('DOMContentLoaded', () => {
    initializeMarketplace();
});

function initializeMarketplace() {
    // Load data from localStorage
    loadFromStorage();

    // Check if user type is set
    const userType = localStorage.getItem('userType');

    if (!userType) {
        showUserTypeModal();
    } else {
        currentUser = { type: userType };
        showDashboard(userType);
        loadDashboardData();
    }

    // Add sample products if none exist
    if (allProducts.length === 0) {
        addSampleProducts();
    }
}

// User Type Selection
function showUserTypeModal() {
    const modal = document.getElementById('userTypeModal');
    modal.classList.add('show');
}

function selectUserType(type) {
    localStorage.setItem('userType', type);
    currentUser = { type: type };
    closeModal('userTypeModal');
    showDashboard(type);
    loadDashboardData();
}

// Show appropriate dashboard
function showDashboard(type) {
    const farmerDashboard = document.getElementById('farmerDashboard');
    const vendorDashboard = document.getElementById('vendorDashboard');

    if (type === 'farmer') {
        farmerDashboard.style.display = 'block';
        vendorDashboard.style.display = 'none';
    } else {
        farmerDashboard.style.display = 'none';
        vendorDashboard.style.display = 'block';
    }
}

// Load dashboard data
function loadDashboardData() {
    if (currentUser.type === 'farmer') {
        loadFarmerDashboard();
    } else {
        loadVendorDashboard();
    }
}

// ===== Farmer Dashboard =====
function loadFarmerDashboard() {
    // Filter my products
    myProducts = allProducts.filter(p => p.farmerId === 'current_farmer');

    // Update stats
    document.getElementById('farmerProductCount').textContent = myProducts.length;

    const farmerOrders = allOrders.filter(o => o.farmerId === 'current_farmer');
    document.getElementById('farmerOrderCount').textContent = farmerOrders.filter(o => o.status === 'pending').length;

    const totalRevenue = farmerOrders
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + o.total, 0);
    document.getElementById('farmerRevenue').textContent = `₹${totalRevenue.toLocaleString()}`;

    // Display products
    displayMyProducts();
    displayFarmerOrders();
}

function displayMyProducts() {
    const container = document.getElementById('myProductsList');

    if (myProducts.length === 0) {
        container.innerHTML = '<p class="empty-state">No products listed yet. Click "List New Product" to get started!</p>';
        return;
    }

    container.innerHTML = myProducts.map(product => `
        <div class="product-item">
            <div class="product-info">
                <div class="product-name">
                    ${product.name}
                    ${product.organic ? '<span class="badge badge-organic">🌱 Organic</span>' : ''}
                </div>
                <div class="product-meta">
                    <span>📦 ${product.quantity} kg available</span>
                    <span>💰 ₹${product.price}/kg</span>
                    <span>📍 ${capitalizeFirst(product.location)}</span>
                </div>
            </div>
            <div class="product-actions">
                <button class="btn-icon" onclick="editProduct('${product.id}')" title="Edit">
                    ✏️
                </button>
                <button class="btn-icon delete" onclick="deleteProduct('${product.id}')" title="Delete">
                    🗑️
                </button>
            </div>
        </div>
    `).join('');
}

function displayFarmerOrders() {
    const container = document.getElementById('farmerOrdersList');
    const farmerOrders = allOrders.filter(o => o.farmerId === 'current_farmer');

    if (farmerOrders.length === 0) {
        container.innerHTML = '<p class="empty-state">No orders yet</p>';
        return;
    }

    container.innerHTML = farmerOrders.map(order => `
        <div class="order-item">
            <div class="order-header">
                <span class="order-id">Order #${order.id}</span>
                <span class="order-status status-${order.status}">${capitalizeFirst(order.status)}</span>
            </div>
            <div class="order-details">
                <div class="order-detail">
                    <span class="order-detail-label">Product</span>
                    <span class="order-detail-value">${order.productName}</span>
                </div>
                <div class="order-detail">
                    <span class="order-detail-label">Quantity</span>
                    <span class="order-detail-value">${order.quantity} kg</span>
                </div>
                <div class="order-detail">
                    <span class="order-detail-label">Total</span>
                    <span class="order-detail-value">₹${order.total}</span>
                </div>
                <div class="order-detail">
                    <span class="order-detail-label">Buyer</span>
                    <span class="order-detail-value">${order.buyerName}</span>
                </div>
            </div>
            ${order.status === 'pending' ? `
                <div class="order-actions">
                    <button class="btn btn-primary" onclick="confirmOrder('${order.id}')">Accept Order</button>
                    <button class="btn btn-secondary" onclick="rejectOrder('${order.id}')">Reject</button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// ===== Vendor Dashboard =====
function loadVendorDashboard() {
    displayAllProducts();
    displayVendorOrders();
}

function displayAllProducts() {
    const container = document.getElementById('productsGrid');
    let productsToShow = [...allProducts];

    // Apply filters
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const category = document.getElementById('categoryFilter')?.value || '';
    const location = document.getElementById('locationFilter')?.value || '';
    const organicOnly = document.getElementById('organicFilter')?.checked || false;

    productsToShow = productsToShow.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm) ||
            p.description.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || p.category === category;
        const matchesLocation = !location || p.location === location;
        const matchesOrganic = !organicOnly || p.organic;

        return matchesSearch && matchesCategory && matchesLocation && matchesOrganic;
    });

    // Sort
    const sortBy = document.getElementById('sortBy')?.value || 'recent';
    switch (sortBy) {
        case 'price-low':
            productsToShow.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            productsToShow.sort((a, b) => b.price - a.price);
            break;
        case 'quantity':
            productsToShow.sort((a, b) => b.quantity - a.quantity);
            break;
    }

    if (productsToShow.length === 0) {
        container.innerHTML = '<p class="empty-state" style="grid-column: 1/-1;">No products found</p>';
        return;
    }

    container.innerHTML = productsToShow.map(product => createProductCard(product)).join('');
}

function createProductCard(product) {
    const icons = {
        grains: '🌾',
        vegetables: '🥬',
        fruits: '🍎',
        pulses: '🫘',
        spices: '🌶️'
    };

    return `
        <div class="product-card" onclick="viewProductDetail('${product.id}')">
            <div class="product-image">
                <span>${icons[product.category] || '🌾'}</span>
                ${product.organic ? '<div class="organic-badge">🌱 Organic</div>' : ''}
            </div>
            <div class="product-content">
                <div class="product-header">
                    <h4 class="product-title">${product.name}</h4>
                    <div>
                        <div class="product-price">₹${product.price}</div>
                        <div class="price-unit">/kg</div>
                    </div>
                </div>
                <div class="product-details">
                    <div class="detail-row">
                        <span class="detail-label">Available:</span>
                        <span class="detail-value">${product.quantity} kg</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Location:</span>
                        <span class="detail-value">${capitalizeFirst(product.location)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Category:</span>
                        <span class="detail-value">${capitalizeFirst(product.category)}</span>
                    </div>
                </div>
                <div class="farmer-info">
                    <div class="farmer-avatar">👨‍🌾</div>
                    <div>
                        <div style="font-weight: 600;">${product.farmerName}</div>
                        <div style="color: var(--text-secondary); font-size: 0.8rem;">Verified Farmer</div>
                    </div>
                </div>
                <button class="btn-order" onclick="event.stopPropagation(); showOrderModal('${product.id}')">
                    Place Order
                </button>
            </div>
        </div>
    `;
}

function displayVendorOrders() {
    const container = document.getElementById('vendorOrdersList');
    const vendorOrders = allOrders.filter(o => o.buyerId === 'current_vendor');

    if (vendorOrders.length === 0) {
        container.innerHTML = '<p class="empty-state">No orders placed yet</p>';
        return;
    }

    container.innerHTML = vendorOrders.map(order => `
        <div class="order-item">
            <div class="order-header">
                <span class="order-id">Order #${order.id}</span>
                <span class="order-status status-${order.status}">${capitalizeFirst(order.status)}</span>
            </div>
            <div class="order-details">
                <div class="order-detail">
                    <span class="order-detail-label">Product</span>
                    <span class="order-detail-value">${order.productName}</span>
                </div>
                <div class="order-detail">
                    <span class="order-detail-label">Quantity</span>
                    <span class="order-detail-value">${order.quantity} kg</span>
                </div>
                <div class="order-detail">
                    <span class="order-detail-label">Total</span>
                    <span class="order-detail-value">₹${order.total}</span>
                </div>
                <div class="order-detail">
                    <span class="order-detail-label">Farmer</span>
                    <span class="order-detail-value">${order.farmerName}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== Product Management =====
function showAddProductModal() {
    const modal = document.getElementById('addProductModal');
    modal.classList.add('show');
}

function addProduct(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const product = {
        id: generateId(),
        name: formData.get('cropName'),
        category: formData.get('category'),
        quantity: parseInt(formData.get('quantity')),
        price: parseFloat(formData.get('price')),
        location: formData.get('location'),
        organic: formData.get('organic') === 'on',
        description: formData.get('description') || '',
        farmerId: 'current_farmer',
        farmerName: 'Demo Farmer',
        dateAdded: new Date().toISOString()
    };

    allProducts.push(product);
    saveToStorage();
    loadFarmerDashboard();
    closeModal('addProductModal');
    form.reset();

    showNotification('Product listed successfully!', 'success');
}

function editProduct(id) {
    // For demo, just show alert
    alert('Edit functionality - would open modal with product data');
}

function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        allProducts = allProducts.filter(p => p.id !== id);
        saveToStorage();
        loadFarmerDashboard();
        showNotification('Product deleted', 'success');
    }
}

function viewProductDetail(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;

    const modal = document.getElementById('productDetailModal');
    document.getElementById('productDetailName').textContent = product.name;

    const icons = {
        grains: '🌾',
        vegetables: '🥬',
        fruits: '🍎',
        pulses: '🫘',
        spices: '🌶️'
    };

    document.getElementById('productDetailContent').innerHTML = `
        <div style="text-align: center; font-size: 5rem; margin: 2rem 0;">
            ${icons[product.category] || '🌾'}
        </div>
        <div class="product-details" style="margin-bottom: 1.5rem;">
            <div class="detail-row">
                <span class="detail-label">Category:</span>
                <span class="detail-value">${capitalizeFirst(product.category)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Price:</span>
                <span class="detail-value" style="color: var(--accent-gold); font-weight: 700;">₹${product.price}/kg</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Available Quantity:</span>
                <span class="detail-value">${product.quantity} kg</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Location:</span>
                <span class="detail-value">${capitalizeFirst(product.location)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Organic Certified:</span>
                <span class="detail-value">${product.organic ? '✅ Yes' : '❌ No'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Farmer:</span>
                <span class="detail-value">${product.farmerName}</span>
            </div>
        </div>
        ${product.description ? `
            <div style="margin-bottom: 1.5rem;">
                <h4 style="color: var(--accent-gold); margin-bottom: 0.5rem;">Description</h4>
                <p style="color: var(--text-secondary);">${product.description}</p>
            </div>
        ` : ''}
        <button class="btn btn-primary" style="width: 100%;" onclick="closeModal('productDetailModal'); showOrderModal('${product.id}')">
            Place Order
        </button>
    `;

    modal.classList.add('show');
}

// ===== Order Management =====
let currentOrderProduct = null;

function showOrderModal(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    currentOrderProduct = product;
    const modal = document.getElementById('orderModal');

    document.getElementById('orderProductInfo').innerHTML = `
        <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
            <h3 style="margin-bottom: 0.5rem;">${product.name}</h3>
            <p style="color: var(--text-secondary);">Farmer: ${product.farmerName}</p>
            <p style="color: var(--accent-gold); font-weight: 600;">₹${product.price}/kg</p>
        </div>
    `;

    document.getElementById('availableQty').textContent = `Available: ${product.quantity} kg`;
    document.getElementById('orderPricePerKg').textContent = `₹${product.price}`;

    // Add event listener for quantity input
    const qtyInput = document.getElementById('orderQuantity');
    qtyInput.max = product.quantity;
    qtyInput.value = '';

    qtyInput.addEventListener('input', updateOrderTotal);

    modal.classList.add('show');
}

function updateOrderTotal() {
    const quantity = parseInt(document.getElementById('orderQuantity').value) || 0;
    const pricePerKg = currentOrderProduct.price;
    const total = quantity * pricePerKg;

    document.getElementById('orderQty').textContent = `${quantity} kg`;
    document.getElementById('orderTotal').textContent = `₹${total.toLocaleString()}`;
}

function placeOrder(event) {
    event.preventDefault();

    const quantity = parseInt(document.getElementById('orderQuantity').value);
    const address = document.getElementById('deliveryAddress').value;

    if (quantity > currentOrderProduct.quantity) {
        alert('Quantity exceeds available stock!');
        return;
    }

    const order = {
        id: generateId(),
        productId: currentOrderProduct.id,
        productName: currentOrderProduct.name,
        quantity: quantity,
        pricePerKg: currentOrderProduct.price,
        total: quantity * currentOrderProduct.price,
        buyerId: 'current_vendor',
        buyerName: 'Demo Vendor',
        farmerId: currentOrderProduct.farmerId,
        farmerName: currentOrderProduct.farmerName,
        address: address,
        status: 'pending',
        dateOrdered: new Date().toISOString()
    };

    allOrders.push(order);

    // Update product quantity
    currentOrderProduct.quantity -= quantity;
    if (currentOrderProduct.quantity === 0) {
        allProducts = allProducts.filter(p => p.id !== currentOrderProduct.id);
    }

    saveToStorage();
    loadDashboardData();
    closeModal('orderModal');

    showNotification('Order placed successfully! Farmer will confirm soon.', 'success');
}

function confirmOrder(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (order) {
        order.status = 'confirmed';
        saveToStorage();
        loadDashboardData();
        showNotification('Order confirmed!', 'success');
    }
}

function rejectOrder(orderId) {
    if (confirm('Are you sure you want to reject this order?')) {
        allOrders = allOrders.filter(o => o.id !== orderId);
        saveToStorage();
        loadDashboardData();
        showNotification('Order rejected', 'info');
    }
}

// ===== Filters and Search =====
function applyFilters() {
    displayAllProducts();
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('locationFilter').value = '';
    document.getElementById('organicFilter').checked = false;
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    displayAllProducts();
}

function sortProducts() {
    displayAllProducts();
}

// Add event listeners for real-time filtering
if (document.getElementById('searchInput')) {
    document.getElementById('searchInput').addEventListener('input', displayAllProducts);
}
if (document.getElementById('categoryFilter')) {
    document.getElementById('categoryFilter').addEventListener('change', displayAllProducts);
}
if (document.getElementById('locationFilter')) {
    document.getElementById('locationFilter').addEventListener('change', displayAllProducts);
}

// ===== Modal Management =====
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
}

// Close modal on background click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
    }
});

// ===== Data Management =====
function saveToStorage() {
    localStorage.setItem('marketplace_products', JSON.stringify(allProducts));
    localStorage.setItem('marketplace_orders', JSON.stringify(allOrders));
}

function loadFromStorage() {
    const products = localStorage.getItem('marketplace_products');
    const orders = localStorage.getItem('marketplace_orders');

    if (products) allProducts = JSON.parse(products);
    if (orders) allOrders = JSON.parse(orders);
}

// ===== Sample Data =====
function addSampleProducts() {
    const sampleProducts = [
        {
            id: generateId(),
            name: 'Organic Wheat',
            category: 'grains',
            quantity: 500,
            price: 28,
            location: 'punjab',
            organic: true,
            description: 'Premium quality organic wheat from Punjab farms. Freshly harvested.',
            farmerId: 'farmer_001',
            farmerName: 'Rajesh Kumar',
            dateAdded: new Date().toISOString()
        },
        {
            id: generateId(),
            name: 'Basmati Rice',
            category: 'grains',
            quantity: 300,
            price: 45,
            location: 'haryana',
            organic: false,
            description: 'Traditional Basmati rice with long grains and aromatic flavor.',
            farmerId: 'farmer_002',
            farmerName: 'Suresh Patel',
            dateAdded: new Date().toISOString()
        },
        {
            id: generateId(),
            name: 'Fresh Tomatoes',
            category: 'vegetables',
            quantity: 200,
            price: 20,
            location: 'maharashtra',
            organic: true,
            description: 'Farm-fresh organic tomatoes, perfect for cooking and salads.',
            farmerId: 'farmer_003',
            farmerName: 'Amit Sharma',
            dateAdded: new Date().toISOString()
        },
        {
            id: generateId(),
            name: 'Turmeric Powder',
            category: 'spices',
            quantity: 50,
            price: 180,
            location: 'karnataka',
            organic: true,
            description: 'Pure organic turmeric powder with high curcumin content.',
            farmerId: 'farmer_004',
            farmerName: 'Ramesh Reddy',
            dateAdded: new Date().toISOString()
        },
        {
            id: generateId(),
            name: 'Green Peas',
            category: 'vegetables',
            quantity: 150,
            price: 35,
            location: 'up',
            organic: false,
            description: 'Fresh green peas, harvested this season.',
            farmerId: 'farmer_005',
            farmerName: 'Vikas Singh',
            dateAdded: new Date().toISOString()
        },
        {
            id: generateId(),
            name: 'Mangoes (Alphonso)',
            category: 'fruits',
            quantity: 100,
            price: 120,
            location: 'maharashtra',
            organic: true,
            description: 'Premium Alphonso mangoes, organic certified.',
            farmerId: 'farmer_006',
            farmerName: 'Prakash Desai',
            dateAdded: new Date().toISOString()
        }
    ];

    allProducts = sampleProducts;
    saveToStorage();
}

// ===== Utility Functions =====
function generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--accent-gold)'};
        color: var(--dark-bg);
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: var(--shadow-lg);
        z-index: 10001;
        animation: slideInRight 0.3s ease;
        font-weight: 600;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Login button handler (switch user type)
if (document.getElementById('loginBtn')) {
    document.getElementById('loginBtn').addEventListener('click', () => {
        if (confirm('Switch user type? This will reset your view but keep all data.')) {
            localStorage.removeItem('userType');
            window.location.reload();
        }
    });
}
