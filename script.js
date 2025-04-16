// Toggle menu mobile
document.querySelector('.menu-toggle').addEventListener('click', function() {
    document.querySelector('nav ul').classList.toggle('active');
});

// Animasi progress circle
const progressCircle = document.querySelector('.circle-progress');
const progressValue = progressCircle.getAttribute('data-progress');

// Simulasi loading progress
let currentProgress = 0;
const progressInterval = setInterval(() => {
    if (currentProgress >= progressValue) {
        clearInterval(progressInterval);
    } else {
        currentProgress++;
        progressCircle.style.background = `conic-gradient(var(--primary-green) ${currentProgress}%, var(--medium-gray) 0)`;
        progressCircle.querySelector('span').textContent = `${currentProgress}%`;
    }
}, 20);

// Smooth scrolling untuk navigasi
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
        
        // Tutup menu mobile jika terbuka
        if (document.querySelector('nav ul').classList.contains('active')) {
            document.querySelector('nav ul').classList.remove('active');
        }
    });
});

// Animasi saat scroll
window.addEventListener('scroll', function() {
    const scrollPosition = window.scrollY;
    
    // Efek parallax sederhana untuk hero image
    const heroImage = document.querySelector('.hero-image');
    if (heroImage) {
        heroImage.style.transform = `translateY(${scrollPosition * 0.2}px)`;
    }
    
    // Animasi untuk elemen saat masuk viewport
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.feature-card, .category-card, .progress-chart');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };
    
    // Set initial styles
    document.querySelectorAll('.feature-card, .category-card').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    
    animateOnScroll();
});

// Inisialisasi saat halaman dimuat
window.addEventListener('load', function() {
    // Tambahkan kelas loaded untuk transisi halus
    document.body.classList.add('loaded');
    
    // Set opacity 1 untuk elemen yang sudah di-viewport saat load
    const elements = document.querySelectorAll('.feature-card, .category-card');
    const windowHeight = window.innerHeight;
    
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        
        if (elementPosition < windowHeight - 100) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
});