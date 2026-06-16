// ===================== auth.js =====================
// Login / Register / Logout / Customer List (Admin Only)

// Helper: Prevent XSS
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Load and display registered customer list(Invoked only after admin login)
function loadCustomerList() {
    const container = document.getElementById('customer-table-body');
    if (!container) return;
    const customers = JSON.parse(localStorage.getItem('customers')) || [];
    if (customers.length === 0) {
        container.innerHTML = '<tr><td colspan="4">No registered customers yet.</td></tr>';
        return;
    }
    container.innerHTML = customers.map(c => `
        <tr>
            <td>${escapeHtml(c.username)}</td>
            <td>${escapeHtml(c.fullName)}</td>
            <td>${escapeHtml(c.email)}</td>
            <td>${escapeHtml(c.phone)}</td>
        </tr>
    `).join('');
}

// Ensure registration form remains visible regardless of login status
function ensureRegisterFormVisible() {
    const regFormContainer = document.getElementById('register-section') || 
                             document.getElementById('customer-reg-section') ||
                             document.querySelector('.registration-container');
    if (regFormContainer) {
        regFormContainer.style.display = 'block';
    }
    const regForm = document.getElementById('registration-form');
    if (regForm && regForm.style.display === 'none') {
        regForm.style.display = 'block';
    }
}


// Admin / Customer Login
function tryLogin() {
    const username = document.getElementById('user').value.trim();
    const password = document.getElementById('pwd').value.trim();
    if (username === 'Ellison' && password === '123456') {
        setLoginCookie();
        checkLoginStatus();
        alert('Admin login successful!');
    } else {
        const customers = JSON.parse(localStorage.getItem('customers')) || [];
        const customer = customers.find(c => c.username === username && c.password === password);
        if (customer) {
            setCustomerLoginCookie(customer);
            alert('Customer login successful!');
            window.location.reload();
        } else {
            alert('Invalid username or password!');
        }
    }
}

function setLoginCookie() {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 2);
    document.cookie = `loggedIn=true; expires=${expiry.toUTCString()}; path=/; SameSite=Lax`;
}

function setCustomerLoginCookie(customer) {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 2);
    document.cookie = `customerLoggedIn=true; customerName=${customer.fullName || customer.username}; expires=${expiry.toUTCString()}; path=/; SameSite=Lax`;
}

function checkLoginStatus() {
    const isAdminLoggedIn = document.cookie.includes('loggedIn=true');
    const isCustomerLoggedIn = document.cookie.includes('customerLoggedIn=true');
    
    // Admin Buttons (Edit / Delete)
    document.querySelectorAll('.edit-btn, .del-btn').forEach(btn => {
        btn.style.display = isAdminLoggedIn ? 'inline-block' : 'none';
    });
    
    // Add product form area
    const addFormSection = document.getElementById('add-product-form-section');
    if (addFormSection) addFormSection.style.display = isAdminLoggedIn ? 'block' : 'none';
    
    // Admin Content Area (Product Management, Cart Management, etc.)
    const adminContent = document.getElementById('admin-content');
    if (adminContent) adminContent.style.display = isAdminLoggedIn ? 'block' : 'none';
    
    // Show customer list after login
    if (isAdminLoggedIn && typeof loadCustomerList === 'function') {
        loadCustomerList();
    }
    
    // Login/Logout Area Toggle
    const loginBox = document.getElementById('login-box');
    const logoutBox = document.getElementById('logout-box');
    const loginArea = document.querySelector('.login-area');
    if (loginBox && logoutBox) {
        loginBox.style.display = (isAdminLoggedIn || isCustomerLoggedIn) ? 'none' : 'flex';
        logoutBox.style.display = (isAdminLoggedIn || isCustomerLoggedIn) ? 'flex' : 'none';
    }
    
    // Update welcome message
    if (loginArea && (isAdminLoggedIn || isCustomerLoggedIn)) {
        let welcomeText = 'Welcome, ';
        if (isAdminLoggedIn) welcomeText += 'Admin';
        else {
            const nameMatch = document.cookie.match(/customerName=([^;]+)/);
            welcomeText += nameMatch ? nameMatch[1] : 'Customer';
        }
        loginArea.innerHTML = `<span>${welcomeText}</span><button class="logout-btn" onclick="logout()">Logout</button>`;
    }
    
    // Checkout Button: Enabled if either admin or customer is logged in
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        const canCheckout = isAdminLoggedIn || isCustomerLoggedIn;
        checkoutBtn.disabled = !canCheckout;
        checkoutBtn.title = canCheckout ? '' : 'Please login to checkout';
    }
    
    // Ensure registration form is always visible
    ensureRegisterFormVisible();
}

function logout() {
    document.cookie = 'loggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'customerLoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'customerName=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    checkLoginStatus();
    alert('Logged out successfully!');
    window.location.reload();
}

function registerCustomer(e) {
    e.preventDefault();
    const username = document.getElementById('cust-username')?.value.trim();
    const fullName = document.getElementById('cust-fullname')?.value.trim();
    const email = document.getElementById('cust-email')?.value.trim();
    const phone = document.getElementById('cust-phone')?.value.trim();
    const password = document.getElementById('cust-pwd')?.value.trim();
    
    // Compatible with legacy form IDs
    const altUsername = document.getElementById('reg-username')?.value.trim();
    const altFullName = document.getElementById('reg-fullname')?.value.trim();
    const altEmail = document.getElementById('reg-email')?.value.trim();
    const altPhone = document.getElementById('reg-phone')?.value.trim();
    const altPassword = document.getElementById('reg-password')?.value.trim();
    const confirmPassword = document.getElementById('reg-confirm-password')?.value.trim();
    
    const finalUsername = username || altUsername;
    const finalFullName = fullName || altFullName;
    const finalEmail = email || altEmail;
    const finalPhone = phone || altPhone;
    const finalPassword = password || altPassword;
    
    if (!finalUsername || !finalFullName || !finalEmail || !finalPhone || !finalPassword) {
        alert('All fields are required!');
        return;
    }
    
    if (confirmPassword && finalPassword !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    const customers = JSON.parse(localStorage.getItem('customers')) || [];
    if (customers.some(c => c.username === finalUsername)) {
        alert('Username already exists!');
        return;
    }
    
    const newCustomer = {
        id: generateUniqueId(),
        username: finalUsername,
        fullName: finalFullName,
        email: finalEmail,
        phone: finalPhone,
        password: finalPassword
    };
    customers.push(newCustomer);
    localStorage.setItem('customers', JSON.stringify(customers));
    localStorage.setItem('lastCreatedUser', JSON.stringify({ username: newCustomer.username, fullname: newCustomer.fullName, email: newCustomer.email }));
    
    alert(`🎉 Registration successful!\nUsername: ${finalUsername}\nYou can now log in with your account.`);
    
    // 清空表单
    const regForm = document.getElementById('registration-form');
    const custForm = document.getElementById('customer-reg-form');
    if (regForm) regForm.reset();
    if (custForm) custForm.reset();
    
    const isAdminLoggedIn = document.cookie.includes('loggedIn=true');
    if (isAdminLoggedIn && typeof loadCustomerList === 'function') {
        loadCustomerList();
    }
}

// Ensure registration form is visible after page load
document.addEventListener('DOMContentLoaded', () => {
    ensureRegisterFormVisible();
});