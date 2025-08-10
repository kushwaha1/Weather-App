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

let popupTimeout;
function showLoading(show = true) { els.loadingWrap.classList.toggle('hidden', !show); }
function hidePopup() { els.customPopup.classList.add('hidden'); }
function showPopup(text) {
    console.log('Showing popup:', text);
    els.popupMessage.textContent = text;
    els.customPopup.classList.remove('hidden');
    clearTimeout(popupTimeout);
    popupTimeout = setTimeout(hidePopup, 3000);
}

els.popupClose.addEventListener('click', hidePopup);

function kelvinToC(k) { return k - 273.15; }
function formatTempFromKelvin(k) {
    if (k === undefined || k === null) return '--';
    const c = kelvinToC(k);
    return `${Math.round(c)}°C`;
}

function formatLocalTime(timezoneSec) {
    const nowUTC = Date.now() + (new Date().getTimezoneOffset() * 60 * 1000);
    const nowLocal = new Date(nowUTC + (timezoneSec * 1000));
    return nowLocal.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function renderCurrent(data) {
    if (!data) return;

    els.cityName.textContent = `${data.name}, ${data.sys?.country || ''}`;
    els.weatherCondition.textContent = data.weather?.[0]?.description || '';
    els.temperature.textContent = formatTempFromKelvin(data.main?.temp);
    els.humidity.textContent = data.main?.humidity ?? '--';
    els.wind.textContent = data.wind?.speed ?? '--';
    els.pressure.textContent = data.main?.pressure ?? '--';

    if (data.timezone) {
        els.localTime.textContent = `Local time: ${formatLocalTime(data.timezone)}`;
    } else {
        els.localTime.textContent = 'Local time: --:--';
    }

    const iconCode = data.weather?.[0]?.icon || '01d';
    els.weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    els.weatherDisplay.classList.remove('hidden');
}

async function fetchWeatherByCoords(lat, lon) {
    hidePopup();
    showLoading(true);
    try {
        const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`);
        if (!weatherRes.ok) throw new Error(`Location not found: ${weatherRes.status}`);
        const weatherData = await weatherRes.json();
        renderCurrent(weatherData);
    } catch (err) {
        showPopup('Failed to fetch location or weather data. Using default city.');
        console.error('fetchWeatherByCoords error:', err);
        fetchWeatherByCity('Delhi');
    } finally {
        showLoading(false);
    }
}

async function fetchWeatherByCity(city) {
    if (!city || !city.trim()) { showPopup('Please enter a valid city name.'); return; }
    hidePopup();
    showLoading(true);
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}`);
        if (!res.ok) throw new Error(`City not found: ${res.status}`);
        const data = await res.json();
        renderCurrent(data);
    } catch (err) {
        showPopup('City not found or network error.');
        console.error('fetchWeatherByCity error:', err);
    } finally {
        showLoading(false);
    }
}

function useCurrentLocation() {
    hidePopup();
    if (!navigator.geolocation) {
        showPopup('Geolocation not supported. Using default city.');
        fetchWeatherByCity('Delhi');
        return;
    }
    showLoading(true);
    navigator.geolocation.getCurrentPosition(
        pos => {
            console.log('Current position:', pos);
            const { latitude, longitude } = pos.coords;
            fetchWeatherByCoords(latitude, longitude);
        },
        err => {
            console.error('Geolocation error:', err);
            if (err.code === 1) showPopup('Location access denied. Using default city.');
            else showPopup('Unable to get location. Using default city.');
            fetchWeatherByCity('Delhi');
            showLoading(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
    );
}

(function init() {
    els.currentBtn.addEventListener('click', useCurrentLocation);
    fetchWeatherByCity('Delhi');
})();