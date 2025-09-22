/* ---------------- CONFIG ---------------- */
const apiKey = "c2abf73b4cfea839b816c36a8bd26725"; // <-- replace with your actual key

/* ---------------- DOM ---------------- */
const searchBtn = document.getElementById("searchBtn");
const geoBtn = document.getElementById("geoBtn");
const cityInput = document.getElementById("cityInput");
const message = document.getElementById("message");
const weatherBox = document.getElementById("weather");

const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const icon = document.getElementById("icon");
const forecastEl = document.getElementById("forecast");

const unitToggleBtn = document.getElementById("unitToggle"); // toggle button

/* ---------------- STATE ---------------- */
let currentUnit = "metric"; // default Celsius
let unitSymbol = "°C";

/* ---------------- Events ---------------- */
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) return showMessage("Please enter a city name.");
  fetchWeather(city);
});

cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchBtn.click();
});

geoBtn.addEventListener("click", () => {
  if (!navigator.geolocation) return showMessage("Geolocation not supported.");
  showMessage("Getting your location...");
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      fetchWeatherByCoords(lat, lon);
    },
    (err) => {
      showMessage("Could not get location. Allow location access.");
    }
  );
});

// Toggle Celsius <-> Fahrenheit
unitToggleBtn.addEventListener("click", () => {
  if (currentUnit === "metric") {
    currentUnit = "imperial";
    unitSymbol = "°F";
    unitToggleBtn.textContent = "°F";
  } else {
    currentUnit = "metric";
    unitSymbol = "°C";
    unitToggleBtn.textContent = "°C";
  }

  // Re-fetch weather for current city
  if (cityName.textContent) {
    fetchWeather(cityName.textContent);
  }
});

/* ---------------- Helpers ---------------- */
function showMessage(txt) {
  message.textContent = txt || "";
}

function buildIconUrl(icon) {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

// Fetch weather by city name
async function fetchWeather(city) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=${currentUnit}&appid=${apiKey}`
    );
    if (!res.ok) throw new Error("City not found");
    const data = await res.json();
    displayWeather(data);
    fetchForecast(data.coord.lat, data.coord.lon);
  } catch (err) {
    showMessage(err.message);
  }
}

// Fetch weather by coordinates
async function fetchWeatherByCoords(lat, lon) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${currentUnit}&appid=${apiKey}`
    );
    if (!res.ok) throw new Error("Location not found");
    const data = await res.json();
    displayWeather(data);
    fetchForecast(lat, lon);
  } catch (err) {
    showMessage(err.message);
  }
}

// Display current weather
function displayWeather(data) {
  cityName.textContent = `${data.name}, ${data.sys.country}`;
  temperature.textContent = `${Math.round(data.main.temp)}${unitSymbol}`;
  description.textContent = data.weather[0].description;

  // ✅ Weather icon fix
  icon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  icon.alt = data.weather[0].description;
}

/* ---------------- Forecast: fetch + render ---------------- */
async function fetchForecast(lat, lon) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${currentUnit}`
    );
    if (!res.ok) {
      if (res.status === 401) throw new Error("Invalid API key.");
      throw new Error("Could not load forecast.");
    }
    const data = await res.json();
    const daily = extractDailyFromForecastList(data.list);
    renderForecast(daily);
  } catch (err) {
    console.error("Forecast error:", err);
    forecastEl.innerHTML = "";
    forecastEl.classList.add("hidden");
  }
}

function extractDailyFromForecastList(list) {
  const days = {};
  list.forEach((item) => {
    const [date, time] = item.dt_txt.split(" ");
    if (!days[date]) days[date] = item;
    if (time === "12:00:00") days[date] = item;
  });
  return Object.keys(days)
    .map((d) => ({ date: d, item: days[d] }))
    .slice(0, 5);
}

function renderForecast(dailyArr) {
  forecastEl.innerHTML = "";
  if (!dailyArr || dailyArr.length === 0) {
    forecastEl.classList.add("hidden");
    return;
  }

  dailyArr.forEach((d) => {
    const item = d.item;
    const dt = new Date(item.dt * 1000);
    const dayName = dt.toLocaleDateString(undefined, { weekday: "short" });
    const dateShort = dt.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    const iconCode = item.weather[0].icon;
    const temp = Math.round(item.main.temp);
    const desc = capitalize(item.weather[0].description);

    const card = document.createElement("div");
    card.className = "day";
    card.innerHTML = `
      <div class="day-name">${dayName}</div>
      <div class="small">${dateShort}</div>
      <img src="${buildIconUrl(iconCode)}" alt="${desc}" />
      <div class="temp">${temp}${unitSymbol}</div>
      <div class="small">${desc}</div>
    `;
    forecastEl.appendChild(card);
  });

  forecastEl.classList.remove("hidden");
}
