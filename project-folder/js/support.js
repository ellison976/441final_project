// ===================== support.js =====================
// Submit customer support request

function submitSupport(e) {
    e.preventDefault();
    const name = document.getElementById('support-name').value.trim();
    const email = document.getElementById('support-email').value.trim();
    const message = document.getElementById('support-message').value.trim();
    if (!name || !email || !message) { alert('All fields are required!'); return; }
    const supportMessages = JSON.parse(localStorage.getItem('supportMessages')) || [];
    supportMessages.push({ id: generateUniqueId(), name, email, message, date: new Date().toLocaleString() });
    localStorage.setItem('supportMessages', JSON.stringify(supportMessages));
    document.getElementById('support-form').reset();
    showToast('Support request submitted successfully! We will contact you soon.');
}