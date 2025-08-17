// src/App.jsx
import { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import CurrentCard from './components/CurrentCard';
import DailyForecast from './components/DailyForecast';
import HourlyStrip from './components/HourlyStrip';
import UnitToggle from './components/UnitToggle';
import WeatherDetails from './components/WeatherDetails';
import { useLocalStorage } from './hooks/useLocalStorage';
import { getWeatherForecast, getCurrentLocation } from './utils/api';
import { getWeatherInfo } from './utils/weatherCodes';


// Default city (Riga, Latvia)
const DEFAULT_CITY = {
  name: 'Rīga',
  latitude: 56.9496,
  longitude: 24.1052,
  country: 'Latvia',
  admin1: 'Rīga',
};

// Popular Latvian cities for quick access
const QUICK_PICKS = [
  { name: 'Rīga', latitude: 56.9496, longitude: 24.1052 },
  { name: 'Liepāja', latitude: 56.5053, longitude: 21.0107 },
  { name: 'Ventspils', latitude: 57.3894, longitude: 21.5644 },
  { name: 'Jelgava', latitude: 56.65, longitude: 23.7294 },
  { name: 'Jūrmala', latitude: 56.9681, longitude: 23.7794 },
];

// Optional bg mapping (if you have custom classes)
const WEATHER_BACKGROUNDS = {
  clear: 'bg-sunny',
  cloudy: 'bg-cloudy',
  overcast: 'bg-overcast',
  rain: 'bg-rainy',
  drizzle: 'bg-drizzle',
  snow: 'bg-snowy',
  thunderstorm: 'bg-stormy',
  fog: 'bg-fog',
};

function App() {
  const [weather, setWeather] = useState(null);
  const [currentCity, setCurrentCity] = useLocalStorage('weather-city', DEFAULT_CITY);
  const [unit, setUnit] = useLocalStorage('weather-unit', 'C');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backgroundClass, setBackgroundClass] = useState('bg-clear');

  const hasDaily = (w) => !!w?.daily && Array.isArray(w.daily.time) && w.daily.time.length > 0;
  const hasHourly = (w) => !!w?.hourly && Array.isArray(w.hourly.time) && w.hourly.time.length > 0;

  const loadWeatherData = async (city) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getWeatherForecast(city.latitude, city.longitude);
      setWeather(data);
      setCurrentCity(city);

      const current = data.current_weather ?? data.current ?? null;
      if (current) {
        const code = current.weathercode ?? current.weather_code;
        const group = getWeatherInfo(code).group;
        const hour = new Date().getHours();
        const isNight = hour < 6 || hour > 20;
        setBackgroundClass(isNight ? 'bg-night' : (WEATHER_BACKGROUNDS[group] || 'bg-clear'));
      } else {
        setBackgroundClass('bg-clear');
      }
    } catch (e) {
      setError(e?.message || 'Neizdevās ielādēt laika apstākļus');
      setBackgroundClass('bg-stormy');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const loc = await getCurrentLocation();
        const inLV =
          loc.latitude >= 55.5 && loc.latitude <= 58.1 &&
          loc.longitude >= 20.5 && loc.longitude <= 28.3;
        if (inLV) {
          await loadWeatherData({ name: 'Jūsu atrašanās vieta', latitude: loc.latitude, longitude: loc.longitude });
          return;
        }
      } catch {}
      await loadWeatherData(currentCity || DEFAULT_CITY);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCitySelect = (city) => loadWeatherData(city);
  const handleQuickPick = (city) => loadWeatherData(city);
  const handleRetry = () => loadWeatherData(currentCity || DEFAULT_CITY);

  // Tailwind gradient fallback (in case custom bg-* classes don't exist)
  const bgFallback = 'bg-gradient-to-br from-pink-400 via-fuchsia-400 to-purple-400';

  return (
    <div className={`min-h-[100svh] pb-[env(safe-area-inset-bottom)] transition-all duration-1000 ${bgFallback} ${backgroundClass || ''}`}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 text-shadow">🌦️ Latvijas Laika Prognoze</h1>
          <p className="text-white/80 text-shadow">Precīza laika prognoze visām Latvijas pilsētām</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <SearchBar onCitySelect={handleCitySelect} currentCity={currentCity} />
        </div>
        

        {/* Quick picks */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {QUICK_PICKS.map((city) => (
              <button
                key={city.name}
                onClick={() => handleQuickPick(city)}
                className={`glass-button px-4 py-2 text-white text-sm font-medium transition-all duration-300 ${
                  currentCity?.name === city.name ? 'city-button-active' : ''
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>

        {/* Units */}
        <div className="mb-8 flex justify-center">
          <UnitToggle unit={unit} onUnitChange={setUnit} />
        


</div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="glass-card p-8 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4" />
              <p className="text-white text-lg text-shadow">Ielādē laika apstākļus...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {!!error && !loading && (
          <div className="flex justify-center items-center py-20">
            <div className="glass-card p-8 text-center max-w-md">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-white text-xl font-bold mb-2 text-shadow">Kļūda</h3>
              <p className="text-white/80 mb-4 text-shadow">{error}</p>
              <button onClick={handleRetry} className="glass-button px-6 py-3 text-white font-medium hover:scale-105 transition-transform">
                Mēģināt vēlreiz
              </button>
            </div>
          </div>
        )}



        {/* Content */}
        {!!weather && !loading && !error && (
          <div className="space-y-8">
            {/* 2-column layout: LEFT = one big card (Current + Details), RIGHT = 7-day */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LEFT: combined card */}
              <div className="glass-card p-6 lg:p-8 space-y-6">
                {/* render CurrentCard WITHOUT its own container */}
                <CurrentCard
                  weather={weather.current_weather ?? weather.current ?? null}
                  city={currentCity}
                  unit={unit}
                  hourly={hasHourly(weather) ? weather.hourly : null}
                  containerless
                />
                <div className="border-t border-white/10" />
                {/* render WeatherDetails WITHOUT its own container */}
 <WeatherDetails
   weather={weather.current_weather ?? weather.current ?? {}}
   hourly={hasHourly(weather) ? weather.hourly : null}
   daily={hasDaily(weather) ? weather.daily : null}
   unit={unit}
   containerless
 />
              </div>

              {/* RIGHT: 7-day forecast */}
              <div>
                {hasDaily(weather) ? (
                  <DailyForecast daily={weather.daily} unit={unit} />
                ) : (
                  <div className="glass-card p-6 text-white/80">Nav pieejami dienas dati.</div>
                )}
              </div>
            </div>

            {/* Hourly full width (optional) */}
            {hasHourly(weather) ? (
               <HourlyStrip
   hourly={weather.hourly}
   unit={unit}
   nowIso={(weather.current_weather ?? weather.current)?.time}
 />
            ) : (
              <div className="glass-card p-6 text-center text-white/80">Nav pieejami stundas dati.</div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-white/60 text-sm">
          <p className="text-shadow">
            Dati no{' '}
            <a
              href="https://open-meteo.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 hover:text-white transition-colors underline"
            >
              Open-Meteo
            </a>{' '}
            • Izstrādāts ar ❤️ Latvijai
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
