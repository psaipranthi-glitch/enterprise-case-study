const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const statusEl = document.getElementById("status");

function weatherDescription(code) {
    const descriptions = {
        0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
        45: "Foggy", 48: "Rime fog", 51: "Light drizzle", 53: "Drizzle",
        55: "Heavy drizzle", 61: "Light rain", 63: "Rain", 65: "Heavy rain",
        71: "Light snow", 73: "Snow", 75: "Heavy snow", 80: "Rain showers",
        81: "Rain showers", 82: "Heavy showers", 95: "Thunderstorm"
    };
    return descriptions[code] || "Variable weather";
}

async function getWeather() {
    const city = cityInput.value.trim();

    if (!city) {
        statusEl.textContent = "Please enter a city name.";
        return;
    }

    searchBtn.disabled = true;
    statusEl.textContent = "Loading weather...";

    try {
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );

        if (!geoResponse.ok) throw new Error("Unable to access the location service.");

        const geoData = await geoResponse.json();

        if (!geoData.results?.length) {
            throw new Error("City not found. Try another city.");
        }

        const place = geoData.results[0];

        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=5`
        );

        if (!weatherResponse.ok) throw new Error("Unable to retrieve weather data.");

        const data = await weatherResponse.json();

        document.getElementById("city").textContent =
            `${place.name}${place.country ? ", " + place.country : ""}`;
        document.getElementById("temperature").textContent =
            `${Math.round(data.current.temperature_2m)}°C`;
        document.getElementById("wind").textContent =
            `Wind: ${Math.round(data.current.wind_speed_10m)} km/h`;

        const forecast = document.getElementById("forecast");
        forecast.innerHTML = "";

        data.daily.time.forEach((date, i) => {
            const day = document.createElement("div");
            day.className = "day";
            day.innerHTML = `
                <b>${new Date(date + "T12:00:00").toLocaleDateString("en-IN", { weekday: "short" })}</b>
                <p>${Math.round(data.daily.temperature_2m_max[i])}° / ${Math.round(data.daily.temperature_2m_min[i])}°</p>
                <small>${weatherDescription(data.daily.weather_code[i])}</small>
            `;
            forecast.appendChild(day);
        });

        statusEl.textContent = "Weather updated successfully.";
    } catch (error) {
        statusEl.textContent = error.message || "Something went wrong.";
    } finally {
        searchBtn.disabled = false;
    }
}

searchBtn.addEventListener("click", getWeather);
cityInput.addEventListener("keydown", event => {
    if (event.key === "Enter") getWeather();
});
getWeather();
