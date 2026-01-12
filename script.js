// ===== Navigation Functionality =====
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

// Mobile menu toggle
navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Close menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        navbar.style.background = 'rgba(10, 14, 8, 0.98)';
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.background = 'rgba(10, 14, 8, 0.95)';
        navbar.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
    }

    lastScroll = currentScroll;
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ===== Weather API Integration =====
const API_KEY = 'YOUR_API_KEY_HERE'; // Users should replace with their OpenWeatherMap API key
const weatherWidget = document.getElementById('weatherData');
const locationInput = document.getElementById('locationInput');
const getWeatherBtn = document.getElementById('getWeatherBtn');
const cropRecommendations = document.getElementById('cropRecommendations');

// Weather data structure
let currentWeatherData = null;

// Get weather data
async function getWeather(city) {
    try {
        // Show loading state
        weatherWidget.innerHTML = '<div class="loading">Fetching weather data...</div>';

        // For demo purposes, if API key is not set, show demo data
        if (API_KEY === 'YOUR_API_KEY_HERE') {
            showDemoWeather(city);
            return;
        }

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );

        if (!response.ok) {
            throw new Error('City not found');
        }

        const data = await response.json();
        currentWeatherData = data;
        displayWeather(data);
        displayCropRecommendations(data);

    } catch (error) {
        weatherWidget.innerHTML = `
            <div class="loading" style="color: #ff4444;">
                Error: ${error.message}. Please check the city name or set up your API key.
            </div>
        `;
        console.error('Weather API Error:', error);
    }
}

// Display weather data
function displayWeather(data) {
    const weatherHTML = `
        <div class="weather-item">
            <div class="weather-item-icon">🌡️</div>
            <span class="weather-item-label">Temperature</span>
            <span class="weather-item-value">${Math.round(data.main.temp)}°C</span>
        </div>
        <div class="weather-item">
            <div class="weather-item-icon">💧</div>
            <span class="weather-item-label">Humidity</span>
            <span class="weather-item-value">${data.main.humidity}%</span>
        </div>
        <div class="weather-item">
            <div class="weather-item-icon">🌤️</div>
            <span class="weather-item-label">Conditions</span>
            <span class="weather-item-value">${data.weather[0].main}</span>
        </div>
        <div class="weather-item">
            <div class="weather-item-icon">💨</div>
            <span class="weather-item-label">Wind Speed</span>
            <span class="weather-item-value">${data.wind.speed} m/s</span>
        </div>
        <div class="weather-item">
            <div class="weather-item-icon">🌡️</div>
            <span class="weather-item-label">Feels Like</span>
            <span class="weather-item-value">${Math.round(data.main.feels_like)}°C</span>
        </div>
        <div class="weather-item">
            <div class="weather-item-icon">🔽</div>
            <span class="weather-item-label">Pressure</span>
            <span class="weather-item-value">${data.main.pressure} hPa</span>
        </div>
    `;

    weatherWidget.innerHTML = weatherHTML;
}

// Show demo weather data when API key is not configured
function showDemoWeather(city) {
    const demoData = {
        temp: 28,
        humidity: 65,
        condition: 'Partly Cloudy',
        wind: 3.5,
        feelsLike: 30,
        pressure: 1013
    };

    const weatherHTML = `
        <div class="weather-item">
            <div class="weather-item-icon">🌡️</div>
            <span class="weather-item-label">Temperature</span>
            <span class="weather-item-value">${demoData.temp}°C</span>
        </div>
        <div class="weather-item">
            <div class="weather-item-icon">💧</div>
            <span class="weather-item-label">Humidity</span>
            <span class="weather-item-value">${demoData.humidity}%</span>
        </div>
        <div class="weather-item">
            <div class="weather-item-icon">🌤️</div>
            <span class="weather-item-label">Conditions</span>
            <span class="weather-item-value">${demoData.condition}</span>
        </div>
        <div class="weather-item">
            <div class="weather-item-icon">💨</div>
            <span class="weather-item-label">Wind Speed</span>
            <span class="weather-item-value">${demoData.wind} m/s</span>
        </div>
        <div class="weather-item">
            <div class="weather-item-icon">🌡️</div>
            <span class="weather-item-label">Feels Like</span>
            <span class="weather-item-value">${demoData.feelsLike}°C</span>
        </div>
        <div class="weather-item">
            <div class="weather-item-icon">🔽</div>
            <span class="weather-item-label">Pressure</span>
            <span class="weather-item-value">${demoData.pressure} hPa</span>
        </div>
    `;

    weatherWidget.innerHTML = weatherHTML +
        '<div class="loading" style="margin-top: 1rem; font-size: 0.9rem;">Demo data shown. Get your free API key from <a href="https://openweathermap.org/api" target="_blank" style="color: #f4c430;">OpenWeatherMap</a> and replace YOUR_API_KEY_HERE in script.js</div>';

    // Show demo crop recommendations
    showDemoCropRecommendations();
}

// Display crop recommendations based on weather
function displayCropRecommendations(data) {
    const temp = data.main.temp;
    const humidity = data.main.humidity;

    let crops = [];

    // Recommend crops based on temperature and humidity
    if (temp >= 25 && temp <= 35 && humidity >= 50 && humidity <= 80) {
        crops = [
            { name: 'Rice', reason: 'Perfect temperature and humidity for paddy cultivation' },
            { name: 'Cotton', reason: 'Ideal warm and humid conditions' },
            { name: 'Sugarcane', reason: 'Excellent climate for sugarcane growth' }
        ];
    } else if (temp >= 20 && temp <= 30 && humidity >= 40 && humidity <= 70) {
        crops = [
            { name: 'Wheat', reason: 'Moderate temperature suitable for wheat' },
            { name: 'Maize', reason: 'Good conditions for corn cultivation' },
            { name: 'Vegetables', reason: 'Suitable for various vegetables' }
        ];
    } else if (temp >= 15 && temp <= 25) {
        crops = [
            { name: 'Barley', reason: 'Cool weather ideal for barley' },
            { name: 'Potato', reason: 'Perfect temperature for tuber crops' },
            { name: 'Peas', reason: 'Excellent for legume cultivation' }
        ];
    } else {
        crops = [
            { name: 'Millets', reason: 'Hardy crops for varying conditions' },
            { name: 'Pulses', reason: 'Adaptable to different climates' },
            { name: 'Groundnut', reason: 'Versatile crop for different conditions' }
        ];
    }

    const cropsHTML = crops.map(crop => `
        <div class="crop-item">
            <h4>${crop.name}</h4>
            <p>${crop.reason}</p>
        </div>
    `).join('');

    cropRecommendations.innerHTML = cropsHTML;
}

// Show demo crop recommendations
function showDemoCropRecommendations() {
    const demoCrops = [
        { name: 'Rice', reason: 'Perfect temperature and humidity for paddy cultivation' },
        { name: 'Cotton', reason: 'Ideal warm and humid conditions' },
        { name: 'Sugarcane', reason: 'Excellent climate for sugarcane growth' },
        { name: 'Vegetables', reason: 'Suitable for various vegetable crops' }
    ];

    const cropsHTML = demoCrops.map(crop => `
        <div class="crop-item">
            <h4>${crop.name}</h4>
            <p>${crop.reason}</p>
        </div>
    `).join('');

    cropRecommendations.innerHTML = cropsHTML;
}

// Event listener for weather button
getWeatherBtn.addEventListener('click', () => {
    const city = locationInput.value.trim();
    if (city) {
        getWeather(city);
    } else {
        alert('Please enter a city name');
    }
});

// Enter key support for location input
locationInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getWeatherBtn.click();
    }
});

// Load initial weather data for default city
window.addEventListener('load', () => {
    getWeather(locationInput.value);
});

// ===== Intersection Observer for Animations =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards and sections
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.card, .gov-card, .feature-card, .marketplace-card, .export-card, .health-card');

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// ===== Community Join Buttons =====
const joinButtons = document.querySelectorAll('.join-btn');

joinButtons.forEach(btn => {
    btn.addEventListener('click', function () {
        const groupName = this.closest('.group-item').querySelector('h4').textContent;
        alert(`Great! In a real application, you would be redirected to join "${groupName}". This is a demo feature.`);

        // Visual feedback
        this.textContent = 'Requested';
        this.style.background = 'var(--accent-gold)';
        this.style.color = 'var(--dark-bg)';
        this.disabled = true;

        setTimeout(() => {
            this.textContent = 'Join';
            this.style.background = 'transparent';
            this.style.color = 'var(--accent-gold)';
            this.disabled = false;
        }, 3000);
    });
});

// ===== Dynamic Copyright Year =====
const currentYear = new Date().getFullYear();
const footerBottom = document.querySelector('.footer-bottom p');
if (footerBottom) {
    footerBottom.innerHTML = `&copy; ${currentYear} AgriConnect. Built with ❤️ for farmers. All rights reserved.`;
}

// ===== Scroll Progress Indicator =====
function updateScrollProgress() {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;

    // Create progress bar if it doesn't exist
    let progressBar = document.querySelector('.scroll-progress');
    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            height: 4px;
            background: linear-gradient(90deg, #f4c430 0%, #4a7c2f 100%);
            z-index: 10000;
            transition: width 0.1s ease;
        `;
        document.body.appendChild(progressBar);
    }

    progressBar.style.width = scrolled + '%';
}

window.addEventListener('scroll', updateScrollProgress);

// ===== Local Storage for User Preferences =====
function savePreferences() {
    const lastCity = locationInput.value;
    localStorage.setItem('lastCity', lastCity);
}

function loadPreferences() {
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
        locationInput.value = lastCity;
    }
}

// Save city when weather is fetched
getWeatherBtn.addEventListener('click', savePreferences);

// Load preferences on page load
window.addEventListener('load', loadPreferences);

// ===== Print/Export Functionality =====
// Add keyboard shortcut Ctrl+P for printing
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        window.print();
    }
});

// ===== Accessibility Enhancements =====
// Focus trap for mobile menu
navToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        navToggle.click();
    }
});

// Skip to main content
const skipLink = document.createElement('a');
skipLink.href = '#home';
skipLink.textContent = 'Skip to main content';
skipLink.className = 'skip-link';
skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--accent-gold);
    color: var(--dark-bg);
    padding: 8px;
    text-decoration: none;
    z-index: 10001;
`;
skipLink.addEventListener('focus', function () {
    this.style.top = '0';
});
skipLink.addEventListener('blur', function () {
    this.style.top = '-40px';
});
document.body.insertBefore(skipLink, document.body.firstChild);

// ===== Performance Optimization =====
// Lazy load images (if any are added in the future)
if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.dataset.src;
    });
} else {
    // Fallback for browsers that don't support lazy loading
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
}

// ===== Console Welcome Message =====

console.log('%cEmpowering farmers for a sustainable future', 'color: #4a7c2f; font-size: 16px;');
console.log('%cFor support, contact: 1800-180-1551', 'color: #ffffff; font-size: 14px;');

// ===== Error Handling =====
window.addEventListener('error', (e) => {
    console.error('Application error:', e.message);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});
