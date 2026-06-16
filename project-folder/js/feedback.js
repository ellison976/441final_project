// ===================== feedback.js =====================
// Submit & display user feedback

function submitFeedback(e) {
    e.preventDefault();
    const name = document.getElementById('feedback-name').value.trim();
    const email = document.getElementById('feedback-email').value.trim();
    const rating = document.querySelector('input[name="rating"]:checked')?.value || 0;
    const comment = document.getElementById('feedback-comment').value.trim();
    if (!name || !email || !rating || !comment) { alert('All fields are required!'); return; }
    const feedback = JSON.parse(localStorage.getItem('feedback')) || [];
    feedback.push({ id: generateUniqueId(), name, email, rating: parseInt(rating), comment, date: new Date().toLocaleString() });
    localStorage.setItem('feedback', JSON.stringify(feedback));
    document.getElementById('feedback-form').reset();
    loadFeedback();
    showToast('Thank you for your feedback!');
}
function loadFeedback() {
    const container = document.getElementById('feedback-list');
    if (!container) return;
    const feedback = JSON.parse(localStorage.getItem('feedback')) || [];
    if (feedback.length === 0) { container.innerHTML = '<p>No feedback yet. Be the first to share your experience!</p>'; return; }
    container.innerHTML = feedback.map(f => {
        const stars = '★'.repeat(f.rating) + '☆'.repeat(5 - f.rating);
        return `<div class="feedback-item"><div class="feedback-header"><strong>${f.name}</strong><span class="feedback-stars">${stars}</span></div><p>${f.comment}</p><small>${f.date}</small></div>`;
    }).join('');
}