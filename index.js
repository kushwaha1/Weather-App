// Defining the API key for OpenWeatherMap
const WEATHER_API_KEY = "d51ad29ad9fe76f76b4358982339d9f7";

let isCelsius = true;
let currentWeatherData = null;
let forecastData = null;

const els = {
    bgVideo: document.getElementById("bgVideo"),
    bgSource: document.getElementById("bgSource"),
    cityInput: document.getElementById("cityInput"),
    searchBtn: document.getElementById("searchBtn"),
    currentBtn: document.getElementById("currentBtn"),
    recentCities: document.getElementById("recentCities"),
    unitSelector: document.getElementById("unitSelector"),
    weatherDisplay: document.getElementById("weatherDisplay"),
    cityName: document.getElementById("cityName"),
    localTime: document.getElementById("localTime"),
    weatherCondition: document.getElementById("weatherCondition"),
    weatherIcon: document.getElementById("weatherIcon"),
    temperature: document.getElementById("temperature"),
    humidity: document.getElementById("humidity"),
    wind: document.getElementById("wind"),
    pressure: document.getElementById("pressure"),
    forecastContainer: document.getElementById("forecastContainer"),
    customPopup: document.getElementById("customPopup"),
    popupMessage: document.getElementById("popupMessage"),
    popupClose: document.getElementById("popupClose"),
}

// Declaring variable to manage popup timeout
let popupTimeout;

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
    return isCelsius ? `${Math.round(c)}°C` : `${Math.round((c * 9 / 5) + 32)}°F`;
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
    currentWeatherData = data; // Storing current weather data for later use

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

    updateBackgroundFromData(data);

    const tempC = data.main?.temp ? Math.round(kelvinToC(data.main.temp)) : null;
    if (tempC !== null && tempC > 40) showPopup('⚠️ Extreme Heat Alert! Stay hydrated.');
    else if (tempC !== null && tempC < -10) showPopup('⚠️ Extreme Cold Alert! Stay warm.');
    else hidePopup();

    els.weatherDisplay.classList.remove('hidden'); // Showing weather display
}

// Fetching weather data by geographic coordinates
async function fetchWeatherByCoords(lat, lon) {
    hidePopup();
    try {
        const weatherRes = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`
        ); // Fetching weather data using coordinates
        if (!weatherRes.ok) throw new Error(`Location not found: ${weatherRes.status}`);
        const weatherData = await weatherRes.json(); // Parsing JSON response
        currentWeatherData = weatherData;
        renderCurrent(weatherData); // Rendering the fetched data
        saveRecent(weatherData.name); // Saving recent city
        await fetchForecast(lat, lon);
    } catch (err) {
        showPopup('Failed to fetch location or weather data. Using default city.');
        console.error('fetchWeatherByCoords error:', err);
        fetchWeatherByCity('Delhi');  // Falling back to default city
    }
}

// Fetching weather data by city name
async function fetchWeatherByCity(city) {
    if (!city || !city.trim()) { showPopup('Please enter a valid city name.'); return; }
    hidePopup();
    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}`
        ); // Fetching weather data using city name
        if (!res.ok) throw new Error(`City not found: ${res.status}`);
        const data = await res.json(); // Parsing JSON response
        currentWeatherData = data;
        renderCurrent(data); // Rendering the fetched data
        saveRecent(data.name); // Saving recent city
        await fetchForecast(data.coord.lat, data.coord.lon);
    } catch (err) {
        showPopup('City not found or network error.');
        console.error('fetchWeatherByCity error:', err);
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
        },
        { enableHighAccuracy: true, timeout: 8000 } // Geolocation options
    );
}
// Saving recent cities to localStorage (up to 5 cities if length exceeds than 5 then remove the last one)
function saveRecent(city) {
    const key = 'recentCities_v1';
    const arr = JSON.parse(localStorage.getItem(key) || '[]'); // Retrieving recent cities from localStorage
    const idx = arr.indexOf(city);
    if (idx !== -1) arr.splice(idx, 1);
    arr.unshift(city);
    if (arr.length > 5) arr.pop(); // Keeping only the latest 5 cities
    localStorage.setItem(key, JSON.stringify(arr));
    renderRecent(arr);
}

// Rendering recent cities in the dropdown
function renderRecent(arr) {
    const el = els.recentCities;
    if (!arr || arr.length === 0) { el.classList.add('hidden'); return; }
    el.classList.remove('hidden');
    el.innerHTML = arr.map(c => `<option value="${c}">${c}</option>`).join(''); // Generating options for recent cities
}

// Fetching and updating background video based on weather data
function updateBackgroundFromData(data) {
    console.log('Updating background with data:', data);
    if (!data || !data.sys || !data.sys.sunrise || !data.sys.sunset || typeof data.timezone !== 'number') {
        els.bgSource.src = 'assets/bg-video-day.mp4';
        els.bgVideo.load();
        return null;
    }
    const timezoneOffset = data.timezone; // seconds
    const nowUTC = Date.now();
    const nowLocal = new Date(nowUTC + timezoneOffset * 1000);

    const sunriseUTC = data.sys.sunrise * 1000;
    const sunsetUTC = data.sys.sunset * 1000;
    const sunriseLocal = new Date(sunriseUTC + timezoneOffset * 1000);
    const sunsetLocal = new Date(sunsetUTC + timezoneOffset * 1000);

    const weatherMain = data.weather[0].main.toLowerCase();
    const marginMs = 2 * 60 * 1000; // 2 minutes margin

    let src;
    if (weatherMain.includes('rain')) {
        src = `assets/bg-video-rainy.mp4?t=${Date.now()}`;
    } else if (nowLocal.getTime() >= (sunsetLocal.getTime() - marginMs) ||
        nowLocal.getTime() < sunriseLocal.getTime()) {
        src = `assets/bg-video-night.mp4?t=${Date.now()}`;
    } else {
        src = `assets/bg-video-day.mp4?t=${Date.now()}`;
    }

    if (els.bgSource && !els.bgSource.src.endsWith(src.split('?')[0])) {
        els.bgSource.src = src;
        els.bgVideo.load();
        els.bgVideo.onerror = () => {
            els.bgSource.src = `${src.split('?')[0]}?t=${Date.now()}`;
            els.bgVideo.load();
        };
    }
}

// Fetching 5-day forecast data based on coordinates
async function fetchForecast(lat, lon) {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`);
        if (!res.ok) throw new Error(`Forecast fetch failed: ${res.status}`);
        const data = await res.json();
        forecastData = data.list.filter((_, i) => i % 8 === 0).slice(0, 5);
        renderForecast();
    } catch (err) {
        showPopup('Failed to load forecast. Please try again.');
        console.error('fetchForecast error:', err);
        forecastData = [];
        renderForecast();
    }
}

// Fetching and rendering weather data for current location
function renderForecast() {
    if (!forecastData || forecastData.length === 0) {
        els.forecastContainer.innerHTML = '<p class="text-sm opacity-80">No forecast data available.</p>';
        return;
    }
    els.forecastContainer.innerHTML = forecastData.map(d => {
        const date = new Date(d.dt_txt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
        const iconCode = d.weather?.[0]?.icon || '01d';
        return `<div class="glass text-white p-4 rounded-lg shadow">
          <p class="font-semibold">${date}</p>
            <!-- MOBILE: Temp left, Humidity/Wind right -->
            <div class="flex items-center justify-between sm:hidden mt-2">
            <div class="flex items-center gap-2">
                <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" 
                    alt="Weather icon" class="w-12 h-12">
                <span class="text-lg font-bold">${formatTempFromKelvin(d.main.temp)}</span>
            </div>
            <div class="flex flex-col items-end text-sm">
                <span>💧 ${d.main.humidity}%</span>
                <span>🌬️ ${d.wind.speed} m/s</span>
            </div>
            </div>

            <!-- DESKTOP/TABLET: Vertical stack -->
            <div class="hidden sm:flex flex-col mt-2">
            <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" 
                alt="Weather icon" class="w-12 h-12">
            <p class="mt-2">${formatTempFromKelvin(d.main.temp)}</p>
            <p class="text-sm mt-1">💧 ${d.main.humidity}%</p>
            <p class="text-sm">🌬️ ${d.wind.speed} m/s</p>
            </div>
        </div>`;
    }).join('');
}


// Adding event listeners for search and current location buttons
els.searchBtn.addEventListener('click', () => { fetchWeatherByCity(els.cityInput.value); }); // Handling search button click to fetch weather by city
els.cityInput.addEventListener('keydown', e => { if (e.key === 'Enter') fetchWeatherByCity(els.cityInput.value); }); // Handling Enter key press to fetch weather by city
els.currentBtn.addEventListener('click', useCurrentLocation); // Handling current location button click to fetch weather based on geolocation
els.recentCities.addEventListener('change', e => { fetchWeatherByCity(e.target.value); }); // Handling recent city selection from dropdown
els.unitSelector.addEventListener('change', () => {
    isCelsius = els.unitSelector.value === 'C';
    if (currentWeatherData) renderCurrent(currentWeatherData);
    if (forecastData) renderForecast();
}); // Handling unit change for temperature display

// Initializing the application
(function init() {
    const saved = JSON.parse(localStorage.getItem('recentCities_v1') || '[]');
    renderRecent(saved);
    useCurrentLocation();
})();