// ===================== global.js =====================
// Global variables + common functions + page initialization entry

// Global variables
let allProducts = [];
let currentModalProductId = 0;

// Generate unique ID
function generateUniqueId() {
    return 100 + Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000);
}

// ===================== Toast Notification =====================
function showToast(message = 'Added to cart!') {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;
    const toastSpan = toast.querySelector('span');
    if (toastSpan) toastSpan.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// ===================== Shopping Cart Storage =====================
function loadCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}
function loadSavedForLater() {
    return JSON.parse(localStorage.getItem('savedForLater')) || [];
}
function saveSavedForLater(items) {
    localStorage.setItem('savedForLater', JSON.stringify(items));
}
function updateCartCount() {
    const cart = loadCart();
    const count = cart.reduce((s, i) => s + i.quantity, 0);
    const el = document.getElementById('cart-count');
    if (el) el.innerText = count;
}

// ===================== Product Detail Modal =====================
function openProductModal(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    currentModalProductId = productId;
    const imageSrc = product.image.startsWith('http') ? product.image : `/images/${product.image}`;
    if (document.getElementById('modalProductImg')) {
        document.getElementById('modalProductImg').src = imageSrc;
        document.getElementById('modalProductImg').alt = product.name;
    }
    if (document.getElementById('modalProductName')) document.getElementById('modalProductName').textContent = product.name;
    if (document.getElementById('modalProductCategory')) document.getElementById('modalProductCategory').textContent = product.category;
    if (document.getElementById('modalProductPrice')) document.getElementById('modalProductPrice').textContent = `$${product.price.toLocaleString()}`;
    const stockEl = document.getElementById('modalProductStock');
    if (stockEl) {
        stockEl.textContent = product.stock;
        stockEl.style.color = product.stock < 5 ? '#ef4444' : '#1e293b';
    }
    if (document.getElementById('modalProductDesc')) document.getElementById('modalProductDesc').textContent = product.description;
    if (document.getElementById('product-modal')) document.getElementById('product-modal').style.display = 'flex';
}
function closeProductModal() {
    const modal = document.getElementById('product-modal');
    if (modal) modal.style.display = 'none';
}
function openLightbox() {
    const imgSrc = document.getElementById('modalProductImg')?.src;
    const lightboxImg = document.getElementById('lightbox-img');
    const lightbox = document.getElementById('lightbox');
    if (imgSrc && lightboxImg && lightbox) {
        lightboxImg.src = imgSrc;
        lightbox.style.display = 'flex';
    }
}
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) lightbox.style.display = 'none';
}

// ===================== Close Modals On Outside Click =====================
window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('product-modal')) closeProductModal();
    if (e.target === document.getElementById('editModal')) {
        const closeFn = window.closeEditModal;
        if (closeFn) closeFn();
    }
    if (e.target === document.getElementById('lightbox')) closeLightbox();
});

// ===================== Page Initialization =====================
document.addEventListener('DOMContentLoaded', () => {
    if (typeof initProducts === 'function') initProducts();
    updateCartCount();
    if (typeof checkLoginStatus === 'function') checkLoginStatus();
    if (typeof initCarousel === 'function') initCarousel();
    if (typeof loadFeedback === 'function') loadFeedback();
    if (typeof loadSavedForLater === 'function') loadSavedForLater();
});