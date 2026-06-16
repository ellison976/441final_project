// ===================== products.js =====================
// Product loading / display / filter / CRUD / featured products / image preview

function saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
}

async function initProducts() {
    const localProducts = JSON.parse(localStorage.getItem('products')) || [];
    if (localProducts.length > 0) {
        allProducts = localProducts;
    } else {
        try {
            const response = await fetch('/data/products.json');
            const initialProducts = await response.json();
            allProducts = initialProducts;
            saveProducts(allProducts);
        } catch (error) {
            console.error('Failed to load initial products:', error);
            allProducts = [];
        }
    }
    if (document.getElementById('product-grid')) renderProductsFiltered(allProducts);
    if (document.getElementById('featured-products')) loadFeatured();
    if (document.getElementById('cart-items')) {
        if (typeof renderCart === 'function') renderCart();
        if (typeof calculateTotals === 'function') calculateTotals();
    }
}

function renderProductsFiltered(filteredList) {
    const container = document.getElementById('product-grid');
    if (!container) return;
    container.innerHTML = '';
    filteredList.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.id = p.id;
        card.onclick = () => openProductModal(p.id);
        const imageSrc = p.image.startsWith('http') ? p.image : `/images/${p.image}`;
        const stockClass = p.stock < 5 ? 'low-stock' : '';
        card.innerHTML = `
            <img src="${imageSrc}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/300x300?text=${p.name}'">
            <h3>${p.name}</h3>
            <p>Category: ${p.category}</p>
            <p>Price: $${p.price.toLocaleString()}</p>
            <p class="${stockClass}">Stock: ${p.stock} ${p.stock < 5 ? '(Low Stock)' : ''}</p>
            <p>${p.description.substring(0, 100)}${p.description.length > 100 ? '...' : ''}</p>
            <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart(${p.id})">Add to Cart</button>
            <button class="btn btn-primary edit-btn" onclick="event.stopPropagation(); openEditModal(${p.id})">Edit</button>
            <button class="btn btn-danger del-btn" onclick="event.stopPropagation(); deleteProduct(${p.id})">Delete</button>
        `;
        container.appendChild(card);
    });
    checkLoginStatus();
}

function filterByCategory(category) {
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    if (event) event.target.classList.add('active');
    const filtered = category === 'all' ? allProducts : allProducts.filter(p => p.category === category);
    renderProductsFiltered(filtered);
}

function addProduct(e) {
    e.preventDefault();
    if (!document.cookie.includes('loggedIn=true')) {
        alert('Please login first to add products!');
        return;
    }
    const name = document.getElementById('name').value.trim();
    const price = +document.getElementById('price').value;
    const category = document.getElementById('category').value.trim();
    const description = document.getElementById('desc').value.trim();
    const stock = +document.getElementById('stock').value;
    let image = document.getElementById('image').value.trim();
    if (isNaN(price) || price < 0) { alert('Price must be a positive number!'); return; }
    if (isNaN(stock) || stock < 0) { alert('Stock must be a non-negative number!'); return; }
    if (!name || !category || !description || !image) { alert('All fields are required!'); return; }

    if (!image.startsWith('http') && !image.startsWith('/images/')) {

    }
    const newProduct = { id: generateUniqueId(), name, price, category, description, stock, image };
    allProducts.push(newProduct);
    saveProducts(allProducts);
    renderProductsFiltered(allProducts);
    document.getElementById('add-product-form').reset();
    const preview = document.getElementById('imagePreview') || document.getElementById('product-preview');
    if (preview) preview.src = 'https://via.placeholder.com/150';
    alert('✅ Product added successfully! (Saved permanently)');
}

function openEditModal(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;
    document.getElementById('edit-id').value = product.id;
    document.getElementById('edit-name').value = product.name;
    document.getElementById('edit-price').value = product.price;
    document.getElementById('edit-category').value = product.category;
    document.getElementById('edit-desc').value = product.description;
    document.getElementById('edit-stock').value = product.stock;
    document.getElementById('edit-image').value = product.image;
    document.getElementById('editModal').style.display = 'flex';
}
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    const editForm = document.getElementById('edit-form');
    if (editForm) editForm.reset();
}
function updateProduct(e) {
    e.preventDefault();
    const id = +document.getElementById('edit-id').value;
    const name = document.getElementById('edit-name').value.trim();
    const price = +document.getElementById('edit-price').value;
    const category = document.getElementById('edit-category').value.trim();
    const description = document.getElementById('edit-desc').value.trim();
    const stock = +document.getElementById('edit-stock').value;
    const image = document.getElementById('edit-image').value.trim();
    if (isNaN(price) || price < 0) { alert('Price must be a positive number!'); return; }
    if (isNaN(stock) || stock < 0) { alert('Stock must be a non-negative number!'); return; }
    if (!name || !category || !description || !image) { alert('All fields are required!'); return; }
    const index = allProducts.findIndex(p => p.id === id);
    if (index === -1) return;
    allProducts[index] = { id, name, price, category, description, stock, image };
    saveProducts(allProducts);
    renderProductsFiltered(allProducts);
    closeEditModal();
    alert('Product updated successfully!');
}
function deleteProduct(id) {
    if (!confirm('Confirm delete this product?')) return;
    allProducts = allProducts.filter(p => p.id !== id);
    saveProducts(allProducts);
    renderProductsFiltered(allProducts);
    let cart = loadCart();
    cart = cart.filter(i => i.id !== id);
    saveCart(cart);
    let saved = loadSavedForLater();
    saved = saved.filter(i => i.id !== id);
    saveSavedForLater(saved);
    updateCartCount();
    if (typeof renderCart === 'function') renderCart();
    if (typeof renderSavedForLater === 'function') renderSavedForLater();
    if (typeof calculateTotals === 'function') calculateTotals();
}

function loadFeatured() {
    const container = document.getElementById('featured-products');
    if (!container) return;
    const featured = allProducts.slice(0, 4);
    container.innerHTML = featured.map(p => {
        const imageSrc = p.image.startsWith('http') ? p.image : `/images/${p.image}`;
        return `<div class="featured-card" onclick="openProductModal(${p.id})">
            <img src="${imageSrc}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/320x240?text=${p.name}'">
            <h3>${p.name}</h3>
            <p>$${p.price.toLocaleString()}</p>
        </div>`;
    }).join('');
}

function previewImage(input) {
    const preview = document.getElementById('product-preview');
    if (!preview || !input.files || !input.files[0]) {
        if (preview) preview.src = 'https://via.placeholder.com/150x150';
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) { preview.src = e.target.result; }
    reader.readAsDataURL(input.files[0]);
}
function updatePreview() {
    let src = document.getElementById('image').value;
    let preview = document.getElementById('imagePreview');
    if (preview) preview.src = src || 'https://via.placeholder.com/150';
}