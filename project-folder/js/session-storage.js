// ===================== session-storage.js =====================


// ----- 1. Form Drafts (auto-save & restore) -----
function saveFormDraft(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    const formData = new FormData(form);
    const draft = {};
    for (let [key, value] of formData.entries()) {
        if (key.toLowerCase().includes('pwd') || key.toLowerCase().includes('password')) continue;
        draft[key] = value;
    }
    if (Object.keys(draft).length) {
        sessionStorage.setItem(`draft_${formId}`, JSON.stringify(draft));
    }
}

function loadFormDraft(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    const raw = sessionStorage.getItem(`draft_${formId}`);
    if (!raw) return;
    try {
        const draft = JSON.parse(raw);
        for (const [name, value] of Object.entries(draft)) {
            const field = form.elements[name];
            if (!field) continue;
            if (field.type === 'checkbox' || field.type === 'radio') {
                const radio = form.querySelector(`input[name="${name}"][value="${value}"]`);
                if (radio) radio.checked = true;
            } else {
                field.value = value;
            }
        }
    } catch (e) {
        console.warn('Failed to load form draft', e);
    }
}

function clearFormDraft(formId) {
    sessionStorage.removeItem(`draft_${formId}`);
}

function enableAutoSaveDraft(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    const saveHandler = () => saveFormDraft(formId);
    form.addEventListener('input', saveHandler);
    form.addEventListener('change', saveHandler);
    form.addEventListener('submit', () => clearFormDraft(formId));
}

function initFormDrafts() {
    const formIds = ['add-product-form', 'customer-reg-form', 'support-form', 'feedback-form'];
    formIds.forEach(id => {
        if (document.getElementById(id)) {
            loadFormDraft(id);
            enableAutoSaveDraft(id);
        }
    });
}

// ----- 2. Product Filter State Persistence (wraps original filterByCategory) -----
const _originalFilterByCategory = window.filterByCategory;

if (typeof _originalFilterByCategory === 'function') {
    window.filterByCategory = function(category, event) {
        sessionStorage.setItem('product_category_filter', category);
        return _originalFilterByCategory(category, event);
    };
} else {
    // Fallback in case original doesn't exist
    window.filterByCategory = function(category, event) {
        sessionStorage.setItem('product_category_filter', category);
        if (event && event.target) {
            document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
        }
        if (typeof allProducts !== 'undefined') {
            const filtered = category === 'all' ? allProducts : allProducts.filter(p => p.category === category);
            if (typeof renderProductsFiltered === 'function') renderProductsFiltered(filtered);
        }
    };
}

function restoreProductFilter() {
    const savedCategory = sessionStorage.getItem('product_category_filter');
    if (!savedCategory || savedCategory === 'all') return;
    let attempts = 0;
    const interval = setInterval(() => {
        attempts++;
        if (typeof allProducts !== 'undefined' && allProducts.length > 0) {
            clearInterval(interval);
            if (typeof filterByCategory === 'function') {
                filterByCategory(savedCategory);
                // Highlight the active button (since original relies on event object)
                const btns = document.querySelectorAll('.category-btn');
                for (let btn of btns) {
                    const btnText = btn.innerText.trim();
                    if (btnText === savedCategory || btn.getAttribute('data-category') === savedCategory) {
                        btns.forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        break;
                    }
                }
            }
        } else if (attempts > 50) {
            clearInterval(interval);
        }
    }, 100);
}

// ----- 3. Temporary Error Messages (cross-page) -----
function setTemporaryError(message) {
    sessionStorage.setItem('temp_error', message);
}

function getAndClearTemporaryError() {
    const msg = sessionStorage.getItem('temp_error');
    if (msg) sessionStorage.removeItem('temp_error');
    return msg;
}

function displayStoredError(containerId = null) {
    const errorMsg = getAndClearTemporaryError();
    if (!errorMsg) return;
    if (containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'temp-error-message';
            errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${errorMsg}`;
            container.prepend(errorDiv);
            setTimeout(() => errorDiv.remove(), 5000);
            return;
        }
    }
    alert(errorMsg);
}

function initTemporaryErrorDisplay() {
    displayStoredError();
}

// ----- 4. Main Initialization -----
function initSessionStorage() {
    initFormDrafts();
    restoreProductFilter();
    initTemporaryErrorDisplay();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSessionStorage);
} else {
    initSessionStorage();
}