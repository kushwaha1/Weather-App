// Defining the API key for OpenWeatherMap
const WEATHER_API_KEY = "d51ad29ad9fe76f76b4358982339d9f7";

const els = {
    currentBtn: document.getElementById("currentBtn"),
    loadingWrap: document.getElementById('loadingWrap'),
    weatherDisplay: document.getElementById("weatherDisplay"),
    cityName: document.getElementById("cityName"),
    localTime: document.getElementById("localTime"),
    weatherCondition: document.getElementById("weatherCondition"),
    weatherIcon: document.getElementById("weatherIcon"),
    temperature: document.getElementById("temperature"),
    humidity: document.getElementById("humidity"),
    wind: document.getElementById("wind"),
    pressure: document.getElementById("pressure"),
    customPopup: document.getElementById("customPopup"),
    popupMessage: document.getElementById("popupMessage"),
    popupClose: document.getElementById("popupClose"),
}

// Declaring variable to manage popup timeout
let popupTimeout;

// Toggling loading indicator visibility
function showLoading(show = true) {
    els.loadingWrap.classList.toggle('hidden', !show);
}

// Hiding the custom popup
function hidePopup() {
    els.customPopup.classList.add('hidden');
}

// Displaying and auto-hiding popup with a message
function showPopup(text) {
    console.log('Showing popup:', text);
    els.popupMessage.textContent = text;
    els.customPopup.classList.remove('hidden');
    clearTimeout(popupTimeout); // Clearing any existing timeout
    popupTimeout = setTimeout(hidePopup, 3000); // Setting new timeout to hide after 3 seconds
}

// Adding click event listener to close popup button
els.popupClose.addEventListener('click', hidePopup);

// Converting Kelvin to Celsius
function kelvinToC(k) {
    return k - 273.15;
}

// Formatting temperature from Kelvin based on unit preference
function formatTempFromKelvin(k) {
    if (k === undefined || k === null) return '--';
    const c = kelvinToC(k);
    return `${Math.round(c)}°C`;
}

// Formatting local time based on timezone offset
function formatLocalTime(timezoneSec) {
    const nowUTC = Date.now() + (new Date().getTimezoneOffset() * 60 * 1000); // Converting to UTC
    const nowLocal = new Date(nowUTC + (timezoneSec * 1000));  // Adjusting for local timezone
    return nowLocal.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

// Rendering current weather data to the UI
function renderCurrent(data) {
    if (!data) return;

    els.cityName.textContent = `${data.name}, ${data.sys?.country || ''}`; // Setting city and country
    els.weatherCondition.textContent = data.weather?.[0]?.description || ''; // Setting weather condition
    els.temperature.textContent = formatTempFromKelvin(data.main?.temp); // Setting temperature
    els.humidity.textContent = data.main?.humidity ?? '--'; // Setting humidity with fallback
    els.wind.textContent = data.wind?.speed ?? '--'; // Setting wind speed with fallback
    els.pressure.textContent = data.main?.pressure ?? '--'; // Setting pressure with fallback

    if (data.timezone) {
        els.localTime.textContent = `Local time: ${formatLocalTime(data.timezone)}`; // Setting local time
    } else {
        els.localTime.textContent = 'Local time: --:--'; // Fallback for missing timezone
    }

    // Setting weather icon from OpenWeatherMap
    const iconCode = data.weather?.[0]?.icon || '01d';
    els.weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    els.weatherDisplay.classList.remove('hidden'); // Showing weather display
}

// Fetching weather data by geographic coordinates
async function fetchWeatherByCoords(lat, lon) {
    hidePopup();
    showLoading(true);
    try {
        const weatherRes = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`
        ); // Fetching weather data using coordinates
        if (!weatherRes.ok) throw new Error(`Location not found: ${weatherRes.status}`);
        const weatherData = await weatherRes.json(); // Parsing JSON response
        renderCurrent(weatherData); // Rendering the fetched data
    } catch (err) {
        showPopup('Failed to fetch location or weather data. Using default city.');
        console.error('fetchWeatherByCoords error:', err);
        fetchWeatherByCity('Delhi');  // Falling back to default city
    } finally {
        showLoading(false);
    }
}

// Fetching weather data by city name
async function fetchWeatherByCity(city) {
    if (!city || !city.trim()) { showPopup('Please enter a valid city name.'); return; }
    hidePopup();
    showLoading(true);
    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}`
        ); // Fetching weather data using city name
        if (!res.ok) throw new Error(`City not found: ${res.status}`);
        const data = await res.json(); // Parsing JSON response
        renderCurrent(data); // Rendering the fetched data
    } catch (err) {
        showPopup('City not found or network error.');
        console.error('fetchWeatherByCity error:', err);
    } finally {
        showLoading(false);
    }
}

// Handling current location button click to fetch weather based on geolocation
function useCurrentLocation() {
    hidePopup();
    if (!navigator.geolocation) {
        showPopup('Geolocation not supported. Using default city.');
        // If geolocation unsupported
        fetchWeatherByCity('Delhi'); // Falling back to default city
        return;
    }
    showLoading(true);
    navigator.geolocation.getCurrentPosition(
        pos => {
            console.log('Current position:', pos);
            const { latitude, longitude } = pos.coords;
            fetchWeatherByCoords(latitude, longitude); // Fetching weather for coordinates
        },
        err => {
            console.error('Geolocation error:', err);
            if (err.code === 1) showPopup('Location access denied. Using default city.');
            else showPopup('Unable to get location. Using default city.');
            fetchWeatherByCity('Delhi');
            showLoading(false);
        },
        { enableHighAccuracy: true, timeout: 8000 } // Geolocation options
    );
}

// Initializing the application
(function init() {
    els.currentBtn.addEventListener('click', useCurrentLocation); // Adding click event to current location button
    fetchWeatherByCity('Delhi'); // Fetching default city weather on load
})();