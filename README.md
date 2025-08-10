# Weather-App

A responsive, modern **Weather Forecast Web App** built using **HTML, CSS, JavaScript, and Tailwind CSS**.  
It fetches **real-time weather data** from the [OpenWeatherMap API](https://openweathermap.org/api) and provides:

- Current location detection
- Current weather conditions
- Temperature unit switching (°C / °F)
- Recent city search history
- Automatic background theme based on time of day and weather
- 5-day forecast

## Tech Stack
```bash
$$ Technology - Purpose
$$ HTML5 + CSS3 - Markup & styling
$$ Tailwind CSS - Utility-first responsive design
$$ JavaScript - Logic, validation, and localStorage
$$ Openweathermap - API_KEY & URL

### Setup Instructions

1. Clone or download this repository (`git clone https://github.com/kushwaha1/Weather-App.git`).
2. Run command in vscode terminal `npm i` for installing tailwind css packages.
3. Open vscode terminal and run `npx @tailwindcss/cli -i ./input.css -o ./output.css --watch`.
4.OpenWeatherMap API Key
- Create a free account on OpenWeatherMap
- Go to your API keys section
- Copy existing key or generate new key
- Replace the WEATHER_API_KEY in index.js with your own key: [const WEATHER_API_KEY = `YOUR_API_KEY`];
5. Open `index.html` using `open with live server` in your browser.
6. Your default location show initially and on page-reload.


## Project Structure

```bash
weather-app/
    - assets/                   ## Asset Folder for store video and images
        * bg-video-day.mp4      ## Background video for day time
        * bg-video-night.mp4    ## Background video for night time
        * bg-video-rainy.mp4    ## Background video for rainy weather
    - index.html                ## Main html structure
    - input.css                 ## Import tailwind css and add custom css
    - output.css                ## Tailwind compiled css
    - index.js                  ## Javascript functionality
    - package.json              ## Keep installed packages
    - package-lock.json         ## Non changeable file for packages
    - gitignore                 ## Ignore node modules
    - README.md                 ## Write info for the project

## Features
```
- **Live Weather Data**: Uses OpenWeatherMap API to fetch real-time weather.
- **Location Detection**: Option to get weather using device's GPS.
- **Recent Searches**: Saves and displays last 5 searched cities.
- **Responsive UI**: Works on mobile, tablet, and desktop.
- **Temperature Units**: Switch between Celsius and Fahrenheit.
- **Dynamic Background**: Video changes for day, night, and rainy weather.
- **Forecast Weather**: 5 Days forecast data display of weather.

## How It Works
```bash
1. User Input
- Enter a city name and click "Search" OR click "Use Current Location" to get weather using GPS.

2. Fetching Weather Data
- The app sends a request to OpenWeatherMap’s Current Weather API for live weather details.
- Simultaneously, it sends another request to OpenWeatherMap’s 5-day Forecast API.

3. Processing Data
- The API returns weather conditions, temperature, humidity, wind speed, pressure, and sunrise/sunset times.
- The app converts temperatures from Kelvin to Celsius or Fahrenheit based on the selected unit.

4. Dynamic UI Update
- Weather details are displayed instantly.
- A background video changes based on: `Day|Night|Rain`

5. Recent searched cities are saved in localStorage and shown in the dropdown.

6. Alerts
- If temperature exceeds 40°C → ⚠️ Extreme Heat Alert
- If temperature drops below -10°C → ⚠️ Extreme Cold Alert