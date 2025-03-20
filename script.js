document.addEventListener("DOMContentLoaded", function () {
    getWeather(); // Initial load
    setInterval(getWeather, 900000); // Refresh every 15 minutes
});

document.getElementById('city').addEventListener('input', function () {
    const city = this.value;
    getWeather(city);
});

async function getWeather() {
    try {
        const city = document.getElementById('city').value;
        console.log('City name:', city);

        // Fetch weather data using OpenWeatherMap API
        const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
            params: {
                q: city,
                appid: '54a57bc234ad752a4f59e59cd372201d',
                units: 'metric'
            },
        });

        // Extract the current temperature
        const currentTemperature = response.data.list[0].main.temp;
        document.querySelector('.weather-temp').textContent = Math.round(currentTemperature) + 'ºC';

        // Process forecast data
        const forecastData = response.data.list;
        const dailyForecast = {};

        forecastData.forEach((data) => {
            const day = new Date(data.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' });
            if (!dailyForecast[day]) {
                dailyForecast[day] = {
                    minTemp: data.main.temp_min,
                    maxTemp: data.main.temp_max,
                    description: data.weather[0].description,
                    humidity: data.main.humidity,
                    windSpeed: data.wind.speed,
                    icon: data.weather[0].icon,
                };
            } else {
                dailyForecast[day].minTemp = Math.min(dailyForecast[day].minTemp, data.main.temp_min);
                dailyForecast[day].maxTemp = Math.max(dailyForecast[day].maxTemp, data.main.temp_max);
            }
        });

        // Dynamically update the current day and date
        const currentDate = new Date();
        document.querySelector('.date-dayname').textContent = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
        document.querySelector('.date-day').textContent = currentDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

        // Update the location
        document.querySelector('.location').textContent = response.data.city.name;

        const todayForecast = dailyForecast[currentDate.toLocaleDateString('en-US', { weekday: 'long' })];
        document.querySelector('.weather-desc').textContent = capitalizeWords(todayForecast.description);
        document.querySelector('.humidity .value').textContent = todayForecast.humidity + ' %';
        document.querySelector('.wind .value').textContent = todayForecast.windSpeed + ' m/s';

        const weatherIconElement = document.querySelector('.weather-icon');
        weatherIconElement.innerHTML = getWeatherIcon(todayForecast.icon);

        // Dynamically calculate the next 4 days from the current day
        const nextDays = getNextDays(4);
        const dayElements = document.querySelectorAll('.day-name');
        const tempElements = document.querySelectorAll('.day-temp');
        const iconElements = document.querySelectorAll('.day-icon');

        nextDays.forEach((day, index) => {
            const data = dailyForecast[day];
            if (data) {
                dayElements[index].textContent = day;
                tempElements[index].textContent = `${Math.round(data.minTemp)}º / ${Math.round(data.maxTemp)}º`;
                iconElements[index].innerHTML = getWeatherIcon(data.icon);
            }
        });

    } catch (error) {
        console.error('An error occurred while fetching data:', error.message);
    }
}

function getWeatherIcon(iconCode) {
    const iconBaseUrl = 'https://openweathermap.org/img/wn/';
    const iconSize = '@2x.png';
    return `<img src="${iconBaseUrl}${iconCode}${iconSize}" alt="Weather Icon">`;
}

function capitalizeWords(sentence) {
    return sentence.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Function to calculate the next n days from the current day
function getNextDays(n) {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayIndex = new Date().getDay();  // Get current day index (0-6)
    const nextDays = [];

    for (let i = 1; i <= n; i++) {
        nextDays.push(daysOfWeek[(currentDayIndex + i) % 7]);
    }

    return nextDays;
}
