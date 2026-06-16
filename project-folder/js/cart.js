// ===================== cart.js =====================
// All operations for shopping cart & save-for-later list

function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    let cart = loadCart();
    const existing = cart.find(i => i.id === productId);
    if (existing) {
        if (existing.quantity >= product.stock) { alert('Maximum stock reached!'); return; }
        existing.quantity++;
    } else {
        cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1, image: product.image });
    }
    saveCart(cart);
    updateCartCount();
    if (typeof renderCart === 'function') renderCart();
    if (typeof calculateTotals === 'function') calculateTotals();
    showToast('Added to cart!');
}
function updateQuantity(productId, change) {
    let cart = loadCart();
    const product = allProducts.find(p => p.id === productId);
    const item = cart.find(i => i.id === productId);
    if (!item || !product) return;
    const newQty = item.quantity + change;
    if (newQty <= 0) {
        if (confirm('Remove this item from cart?')) {
            cart = cart.filter(i => i.id !== productId);
            saveCart(cart);
        }
    } else if (newQty > product.stock) { alert(`Cannot exceed stock limit (max: ${product.stock})`); }
    else { item.quantity = newQty; saveCart(cart); }
    updateCartCount();
    if (typeof renderCart === 'function') renderCart();
    if (typeof calculateTotals === 'function') calculateTotals();
}
function setQuantity(productId, newQty) {
    let cart = loadCart();
    const product = allProducts.find(p => p.id === productId);
    const item = cart.find(i => i.id === productId);
    if (!item || !product) return;
    newQty = parseInt(newQty);
    if (isNaN(newQty) || newQty < 1) newQty = 1;
    if (newQty > product.stock) newQty = product.stock;
    item.quantity = newQty;
    saveCart(cart);
    updateCartCount();
    if (typeof renderCart === 'function') renderCart();
    if (typeof calculateTotals === 'function') calculateTotals();
}
function removeFromCart(productId) {
    if (!confirm('Remove this item from cart?')) return;
    let cart = loadCart();
    cart = cart.filter(i => i.id !== productId);
    saveCart(cart);
    updateCartCount();
    if (typeof renderCart === 'function') renderCart();
    if (typeof calculateTotals === 'function') calculateTotals();
}
function clearCart() {
    if (!confirm('Clear entire cart?')) return;
    localStorage.removeItem('cart');
    updateCartCount();
    if (typeof renderCart === 'function') renderCart();
    if (typeof calculateTotals === 'function') calculateTotals();
}
function calculateTotals() {
    const cart = loadCart();
    const subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const gst = subtotal * 0.1;
    const shipping = subtotal > 0 ? 25 : 0;
    let discount = 0;
    const couponCode = document.getElementById('coupon')?.value.trim().toUpperCase();
    if (couponCode === 'BHP10') discount = subtotal * 0.1;
    else if (couponCode === 'BHP20') discount = subtotal * 0.2;
    const total = subtotal + gst + shipping - discount;
    if (document.getElementById('subtotal')) document.getElementById('subtotal').innerText = '$' + subtotal.toFixed(2);
    if (document.getElementById('gst')) document.getElementById('gst').innerText = '$' + gst.toFixed(2);
    if (document.getElementById('shipping')) document.getElementById('shipping').innerText = '$' + shipping.toFixed(2);
    if (document.getElementById('discount')) document.getElementById('discount').innerText = '-$' + discount.toFixed(2);
    if (document.getElementById('total')) document.getElementById('total').innerText = '$' + total.toFixed(2);
}
function applyCoupon() {
    calculateTotals();
    const couponCode = document.getElementById('coupon')?.value.trim().toUpperCase();
    if (couponCode === 'BHP10' || couponCode === 'BHP20') showToast(`Coupon ${couponCode} applied successfully!`);
    else if (couponCode) alert('Invalid coupon code');
}
function renderCart() {
    const container = document.getElementById('cart-items');
    if (!container) return;
    const cart = loadCart();
    if (cart.length === 0) {
        container.innerHTML = `<p class="empty-cart">Your cart is empty</p><a href="/html/products.html" class="btn btn-primary" style="display: block; text-align: center; margin-top: 20px;">Continue Shopping</a>`;
        calculateTotals();
        return;
    }
    container.innerHTML = cart.map(item => {
        const imageSrc = item.image.startsWith('http') ? item.image : `/images/${item.image}`;
        return `<div class="cart-item">
            <img src="${imageSrc}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/80x80?text=Img'">
            <div><h4>${item.name}</h4><p>$${item.price.toLocaleString()} each</p><p>Subtotal: $${(item.price * item.quantity).toLocaleString()}</p></div>
            <div class="cart-controls">
                <button onclick="updateQuantity(${item.id}, -1)">−</button>
                <input type="number" class="cart-qty-input" value="${item.quantity}" min="1" onchange="setQuantity(${item.id}, this.value)">
                <button onclick="updateQuantity(${item.id}, 1)">+</button>
                <button class="cart-remove" onclick="removeFromCart(${item.id})">Remove</button>
                <button class="cart-save-later" onclick="saveForLater(${item.id})">Save for Later</button>
            </div>
        </div>`;
    }).join('');
    calculateTotals();
}
function saveForLater(productId) {
    let cart = loadCart();
    let saved = loadSavedForLater();
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    cart = cart.filter(i => i.id !== productId);
    saveCart(cart);
    saved.push(item);
    saveSavedForLater(saved);
    updateCartCount();
    renderCart();
    if (typeof renderSavedForLater === 'function') renderSavedForLater();
    calculateTotals();
    showToast('Item saved for later!');
}
function moveToCart(productId) {
    let cart = loadCart();
    let saved = loadSavedForLater();
    const item = saved.find(i => i.id === productId);
    if (!item) return;
    const product = allProducts.find(p => p.id === productId);
    if (item.quantity > product.stock) { alert(`Cannot move to cart: only ${product.stock} in stock`); return; }
    saved = saved.filter(i => i.id !== productId);
    saveSavedForLater(saved);
    cart.push(item);
    saveCart(cart);
    updateCartCount();
    renderCart();
    renderSavedForLater();
    calculateTotals();
    showToast('Item moved to cart!');
}
function removeFromSaved(productId) {
    if (!confirm('Remove this item from saved list?')) return;
    let saved = loadSavedForLater();
    saved = saved.filter(i => i.id !== productId);
    saveSavedForLater(saved);
    renderSavedForLater();
}
function renderSavedForLater() {
    const container = document.getElementById('saved-later');
    if (!container) return;
    const saved = loadSavedForLater();
    if (saved.length === 0) { container.innerHTML = ''; return; }
    container.innerHTML = `<h3>Saved for Later (${saved.length})</h3>` + saved.map(item => {
        const imageSrc = item.image.startsWith('http') ? item.image : `/images/${item.image}`;
        return `<div class="cart-item">
            <img src="${imageSrc}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/80x80?text=Img'">
            <div><h4>${item.name}</h4><p>$${item.price.toLocaleString()} each</p></div>
            <div class="cart-controls">
                <button class="btn btn-success" onclick="moveToCart(${item.id})">Move to Cart</button>
                <button class="cart-remove" onclick="removeFromSaved(${item.id})">Remove</button>
            </div>
        </div>`;
    }).join('');
}


function checkout() {
    const isAdminLoggedIn = document.cookie.includes('loggedIn=true');
    const isCustomerLoggedIn = document.cookie.includes('customerLoggedIn=true');
    if (!isAdminLoggedIn && !isCustomerLoggedIn) {
        alert('Please login as either admin or customer to checkout!');
        return;
    }
    const cart = loadCart();
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    alert('Order placed successfully! Thank you for your purchase.');
    clearCart();
}

function viewAdminCart() {
    let cart = loadCart();
    let div = document.getElementById('admin-cart-preview');
    if (!div) return;
    if (cart.length === 0) div.innerHTML = '<p>Cart empty</p>';
    else div.innerHTML = cart.map(i => `<p>${i.name} × ${i.quantity}</p>`).join('');
}