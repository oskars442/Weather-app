// src/utils/api.js

/** ─────────────────────────────────────────────────────────────────────────────
 * Geocoding (Latvia only)
 * ────────────────────────────────────────────────────────────────────────────*/
export const searchCities = async (cityName) => {
  if (!cityName?.trim()) return [];

  try {
    const url =
      `https://geocoding-api.open-meteo.com/v1/search` +
      `?name=${encodeURIComponent(cityName)}` +
      `&count=10&language=lv&format=json&country_code=LV`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Neizdevās meklēt pilsētas');

    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error('Geocoding error:', err);
    throw new Error('Neizdevās meklēt pilsētas');
  }
};

/** ─────────────────────────────────────────────────────────────────────────────
 * Forecast (current + hourly + daily)
 * Notes:
 * - We request hourly variables you need for the details card:
 *   visibility, surface_pressure, pressure_msl, wind_gusts_10m, uv_index, etc.
 * - We set windspeed_unit=ms so you already get m/s (no conversions in UI).
 * - Some deployments of the API might not return the "current" block yet.
 *   We still ask for it, but your UI should fall back to "hourly" at nowIdx.
 * ────────────────────────────────────────────────────────────────────────────*/
export const getWeatherForecast = async (latitude, longitude) => {
  try {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),

      // Hourly variables used in your UI (no "time" here)
      hourly: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'weather_code',
        'wind_speed_10m',
        'wind_direction_10m',
        'wind_gusts_10m',
        'precipitation_probability',
        'precipitation',
        'cloud_cover',
        'visibility',
        'uv_index',
        'surface_pressure',
        'pressure_msl'
      ].join(','),

      // Daily variables (no "time" here either)
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'apparent_temperature_max',
        'apparent_temperature_min',
        'sunrise',
        'sunset',
        'daylight_duration',
        'sunshine_duration',
        'uv_index_max',
        'precipitation_sum',
        'precipitation_hours',
        'precipitation_probability_max',
        'rain_sum',
        'showers_sum',
        'snowfall_sum',
        'wind_speed_10m_max',
        'wind_gusts_10m_max',
        'wind_direction_10m_dominant',
        'shortwave_radiation_sum',
        'et0_fao_evapotranspiration'
      ].join(','),

      // Units & formatting
      timezone: 'Europe/Riga',
      timeformat: 'iso8601',
      temperature_unit: 'celsius',
      windspeed_unit: 'ms',          // ← get m/s directly
      precipitation_unit: 'mm',

      forecast_days: '7',

      // Keep legacy current_weather summary (stable)
      current_weather: 'true'
    });

    const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) {
      let msg = `HTTP error! status: ${res.status}`;
      try { msg += ` - ${await res.text()}`; } catch {}
      throw new Error(msg);
    }

    const data = await res.json();

    const hasCurrent = !!data.current_weather || !!data.current;
    const hasHourly = !!data.hourly && Array.isArray(data.hourly.time) && data.hourly.time.length > 0;
    if (!hasCurrent && !hasHourly) {
      throw new Error('Neizdevās iegūt pašreizējos laika apstākļus');
    }

    console.debug('Open-Meteo payload OK', {
      hasCurrentWeather: !!data.current_weather,
      hourlyKeys: data.hourly ? Object.keys(data.hourly) : [],
      dailyKeys: data.daily ? Object.keys(data.daily) : []
    });

    return data;
  } catch (error) {
    console.error('Weather API error:', error);
    const msg = String(error?.message || '');
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
      throw new Error('Nav interneta savienojuma');
    }
    if (msg.includes('HTTP error')) {
      throw new Error('Laika serviss nav pieejams');
    }
    throw new Error('Neizdevās iegūt laika apstākļus');
  }
};

/** ─────────────────────────────────────────────────────────────────────────────
 * Geolocation (with sane defaults)
 * ────────────────────────────────────────────────────────────────────────────*/
export const getCurrentLocation = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Ģeolokācija nav atbalstīta šajā pārlūkprogrammā'));
      return;
    }

    const options = {
      timeout: 15000,
      enableHighAccuracy: true,
      maximumAge: 300000
    };

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp
        }),
      (err) => {
        let m = 'Neizdevās iegūt atrašanās vietu';
        switch (err.code) {
          case err.PERMISSION_DENIED: m = 'Atrašanās vietas piekļuve ir liegta'; break;
          case err.POSITION_UNAVAILABLE: m = 'Atrašanās vietas informācija nav pieejama'; break;
          case err.TIMEOUT: m = 'Atrašanās vietas pieprasījums ir novecojis'; break;
          default: m = 'Nezināma kļūda atrašanās vietas noteikšanā'; break;
        }
        reject(new Error(m));
      },
      options
    );
  });

/** ─────────────────────────────────────────────────────────────────────────────
 * Air quality (optional future use)
 * ────────────────────────────────────────────────────────────────────────────*/
export const getAirQuality = async (latitude, longitude) => {
  try {
    const url =
      `https://air-quality-api.open-meteo.com/v1/air-quality` +
      `?latitude=${latitude}&longitude=${longitude}` +
      `&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone` +
      `&timezone=Europe%2FRiga`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Neizdevās iegūt gaisa kvalitātes datus');

    return await res.json();
  } catch (err) {
    console.error('Air Quality API error:', err);
    throw new Error('Neizdevās iegūt gaisa kvalitātes datus');
  }
};

/** ─────────────────────────────────────────────────────────────────────────────
 * Small helpers
 * ────────────────────────────────────────────────────────────────────────────*/
export const validateCoordinates = (latitude, longitude) => {
  const lat = Number(latitude);
  const lon = Number(longitude);
  return Number.isFinite(lat) && Number.isFinite(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
};

export const formatApiError = (error) => {
  const msg = String(error?.message || '');
  if (msg.includes('fetch')) return 'Pārbaudi interneta savienojumu';
  if (msg.includes('404')) return 'Dati nav atrasti šai atrašanās vietai';
  if (msg.includes('500')) return 'Servera kļūda, mēģini vēlāk';
  return msg || 'Nezināma kļūda';
};
