// ===================== carousel.js =====================
// Homepage carousel

function initCarousel() {
    const carousel = document.querySelector('.carousel');
    if (!carousel) return;
    let currentSlide = 0;
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.carousel-indicator');
    const slideCount = slides.length;
    function showSlide(index) {
        if (index >= slideCount) currentSlide = 0;
        if (index < 0) currentSlide = slideCount - 1;
        const slideWrapper = document.querySelector('.carousel-slides');
        if (slideWrapper) slideWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
        indicators.forEach((ind, i) => ind.classList.toggle('active', i === currentSlide));
    }
    function autoSlide() { currentSlide++; showSlide(currentSlide); }
    let slideInterval = setInterval(autoSlide, 3000);
    carousel.addEventListener('mouseenter', () => clearInterval(slideInterval));
    carousel.addEventListener('mouseleave', () => slideInterval = setInterval(autoSlide, 3000));
    indicators.forEach((ind, i) => ind.addEventListener('click', () => { currentSlide = i; showSlide(currentSlide); }));
    showSlide(currentSlide);
}