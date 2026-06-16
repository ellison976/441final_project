// ===================== api.js =====================
// Weather API integration

// Cache configuration
const CACHE_KEY = 'bhp_melbourne_weather';
const CACHE_DURATION = 10 * 60 * 1000; 

// Melbourne coordinates
const MELBOURNE_LAT = -37.8136;
const MELBOURNE_LON = 144.9631;

// Container ID for weather UI rendering
const WEATHER_CONTAINER_ID = 'weather-widget';

// Check if API Key is configured
if (typeof WEATHER_API_KEY === 'undefined' || WEATHER_API_KEY === 'your_actual_api_key_here' || WEATHER_API_KEY === '8299ac4671243225c72aaa59dc2ccf33' && WEATHER_API_KEY.length < 30) {
    console.warn('Weather API key may be placeholder or invalid. Please ensure config.js has a valid key.');
}

// Fetch weather data (cache first priority)
async function fetchWeather() {
    // Check cache
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
        const { timestamp, data } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
            console.log('Use cached weather data');
            renderWeather(data);
            return;
        } else {
            localStorage.removeItem(CACHE_KEY);
        }
    }

    // Show loading state
    showLoading();

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${MELBOURNE_LAT}&lon=${MELBOURNE_LON}&appid=${WEATHER_API_KEY}&units=metric&lang=en`;
        console.log('Fetching weather from:', url.replace(WEATHER_API_KEY, 'HIDDEN')); 
        
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Invalid API key. Please check your weather API key.');
            } else if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again later.');
            } else {
                throw new Error(`Weather API error: ${response.status}`);
            }
        }
        
        const data = await response.json();
        console.log('Weather data received:', data);
        
        // Cache data
        const cacheData = {
            timestamp: Date.now(),
            data: data
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        
        renderWeather(data);
    } catch (error) {
        console.error('Weather API 错误:', error);
        showError(error.message);
    }
}

// Show loading indicator
function showLoading() {
    const container = document.getElementById(WEATHER_CONTAINER_ID);
    if (container) {
        container.innerHTML = `
            <div class="weather-loading">
                <i class="fas fa-spinner fa-spin"></i> Loading weather...
            </div>
        `;
    }
}

// Show error message
function showError(message) {
    const container = document.getElementById(WEATHER_CONTAINER_ID);
    if (container) {
        container.innerHTML = `
            <div class="weather-error">
                <i class="fas fa-exclamation-triangle"></i> 
                Unable to load weather: ${message}
            </div>
        `;
    }
}

// Render weather data to page
function renderWeather(data) {
    const container = document.getElementById(WEATHER_CONTAINER_ID);
    if (!container) return;
    
    const { name, main, weather, wind } = data;
    const temp = Math.round(main.temp);
    const feelsLike = Math.round(main.feels_like);
    const description = weather[0].description;
    const iconCode = weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    const humidity = main.humidity;
    const windSpeed = wind.speed;
    
    container.innerHTML = `
        <div class="weather-card">
            <div class="weather-header">
                <i class="fas fa-map-marker-alt"></i> BHP Headquarters · ${name}
            </div>
            <div class="weather-main">
                <img src="${iconUrl}" alt="${description}" class="weather-icon">
                <div class="weather-temp">${temp}°C</div>
                <div class="weather-desc">${description}</div>
            </div>
            <div class="weather-details">
                <div>Feels like: ${feelsLike}°C</div>
                <div>Humidity: ${humidity}%</div>
                <div>Wind: ${windSpeed} m/s</div>
            </div>
            <div class="weather-updated">
                <i class="fas fa-sync-alt"></i> Updated just now
            </div>
        </div>
    `;
}

// Initialize weather module
function initWeatherWidget() {
    console.log('initWeatherWidget called');
    const container = document.getElementById(WEATHER_CONTAINER_ID);
    if (container) {
        fetchWeather();
    } else {
        let attempts = 0;
        const interval = setInterval(() => {
            attempts++;
            if (document.getElementById(WEATHER_CONTAINER_ID)) {
                clearInterval(interval);
                fetchWeather();
            } else if (attempts > 30) { 
                clearInterval(interval);
                console.warn('Weather container not found after 3 seconds');
                showError('Weather widget container missing');
            }
        }, 100);
    }
}

// Auto initialize after page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded fired, initializing weather widget');
    initWeatherWidget();
});