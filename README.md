# Weather-App

A responsive, modern **Weather Forecast Web App** built using **HTML, CSS, JavaScript, and Tailwind CSS**.  
It fetches **real-time weather data** from the [OpenWeatherMap API](https://openweathermap.org/api) and provides:

- Current location detection
- Current weather conditions
- Temperature unit switching (°C / °F)
- Recent city search history

# Project Structure
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

