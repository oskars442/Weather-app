// src/components/WeatherDetails.jsx
import { formatTime } from '../utils/dateHelpers';

const WeatherDetails = ({
  weather,
  daily,
  hourly,
  unit,
  containerless = false,
  hideTitle = false,                 // ← allows removing the heading
  title = '🌤️ Detalizēti dati',      // ← customizable title text
}) => {
  if (!weather || !daily || !hourly) return null;

  const todayIndex = 0;

  // --- robust "now" matching: choose the closest hourly slot to current time ---
  const toMs = (iso) => (iso ? new Date(iso).getTime() : NaN);
  const findBestHourlyIndex = (times = [], targetIso) => {
    if (!times?.length || !targetIso) return -1;
    const t = toMs(targetIso);
    let best = 0, bestDiff = Infinity;
    for (let i = 0; i < times.length; i++) {
      const d = Math.abs(toMs(times[i]) - t);
      if (d < bestDiff) { bestDiff = d; best = i; }
    }
    return best;
  };

  const nowIso =
    weather.time ||
    weather.timestamp ||
    hourly.time?.[0] || // very defensive fallback
    null;

  const nowIdx = findBestHourlyIndex(hourly.time, nowIso);

  const at = (key) =>
    hourly && nowIdx >= 0 && hourly[key]
      ? hourly[key][nowIdx]
      : undefined;

  const formatPressure = (pressure) => {
    if (pressure == null) return '-- hPa';
    return `${Math.round(pressure)} hPa`;
  };

  const formatVisibility = (visibility) => {
    if (visibility == null) return '-- km';
    return `${(visibility / 1000).toFixed(1)} km`;
  };

  const getUVLevel = (uvIndex) => {
    const v = Number(uvIndex);
    if (!Number.isFinite(v) || v <= 2) return { level: 'Zems', color: 'text-green-300' };
    if (v <= 5) return { level: 'Vidējs', color: 'text-yellow-300' };
    if (v <= 7) return { level: 'Augsts', color: 'text-orange-300' };
    if (v <= 10) return { level: 'Ļoti augsts', color: 'text-red-300' };
    return { level: 'Ekstrēms', color: 'text-purple-300' };
  };

  // values from hourly arrays (fall back to any present current fields)
  const uvValue     = at('uv_index') ?? weather.uv_index ?? 0;
  const feelsLike   = at('apparent_temperature') ?? weather.apparent_temperature ?? null;
  const pressure    = at('surface_pressure') ?? at('pressure_msl') ?? null;
  const visibility  = at('visibility') ?? null;
  const windGusts   = at('wind_gusts_10m');
  const rawCloud =
   at('cloud_cover') ??
   at('cloudcover') ??
   weather.cloud_cover ??
   weather.cloudcover ??
   null;
 const cloudCover = (rawCloud == null)
   ? null
   : (rawCloud <= 1 ? Math.round(rawCloud * 100) : Math.round(rawCloud));

  const uvInfo = getUVLevel(uvValue);

  const Wrapper = ({ children }) =>
    containerless ? <>{children}</> : <div className="glass-card p-6 space-y-6">{children}</div>;

  const hasSunData =
    Array.isArray(daily.sunrise) &&
    Array.isArray(daily.sunset) &&
    daily.sunrise.length > 0 &&
    daily.sunset.length > 0;

  return (
    <Wrapper>
      {!hideTitle && (
        <h3 className="text-white text-lg font-semibold text-shadow">{title}</h3>
      )}

      {/* Main Weather Details Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* UV Index */}
        <div className="bg-white/10 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">☀️ UV indekss</span>
            <div className="text-right">
              <div className="text-white font-semibold">{uvValue ?? '--'}</div>
              <div className={`text-xs ${uvInfo.color}`}>{uvInfo.level}</div>
            </div>
          </div>
        </div>

        {/* Feels Like */}
        <div className="bg-white/10 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">🌡️ Sajūta</span>
            <span className="text-white font-semibold">
              {feelsLike != null ? `${Math.round(feelsLike)}°${unit}` : '—'}
            </span>
          </div>
        </div>

        {/* Pressure */}
        <div className="bg-white/10 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">🔽 Spiediens</span>
            <span className="text-white font-semibold">
              {formatPressure(pressure)}
            </span>
          </div>
        </div>

        {/* Visibility */}
        <div className="bg-white/10 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">👁️ Redzamība</span>
            <span className="text-white font-semibold">
              {formatVisibility(visibility)}
            </span>
          </div>
        </div>

        {/* Wind Gusts */}
        <div className="bg-white/10 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">💨 Brāzmas</span>
            <span className="text-white font-semibold">
              {windGusts != null ? `${Math.round(windGusts)} m/s` : '—'}
            </span>
          </div>
        </div>

        {/* Cloud Cover */}
        <div className="bg-white/10 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">☁️ Mākoņi</span>
            <span className="text-white font-semibold">{cloudCover == null ? '—' : `${cloudCover}%`}</span>
          </div>
        </div>
      </div>

      {/* Sunrise / Sunset */}
      {hasSunData && (
        <div className="bg-white/10 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <div className="text-3xl mb-2">🌅</div>
              <div className="text-white/70 text-sm mb-1">Saullēkts</div>
              <div className="text-white font-semibold text-lg">
                {formatTime(daily.sunrise[todayIndex])}
              </div>
            </div>

            <div className="flex-1 text-center">
              <div className="text-white/40 text-xs mb-2">Dienas garums</div>
              <div className="text-white/60 text-sm">
                {(() => {
                  try {
                    const sunrise = new Date(daily.sunrise[todayIndex]);
                    const sunset = new Date(daily.sunset[todayIndex]);
                    const diff = sunset - sunrise;
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    return `${hours}h ${minutes}m`;
                  } catch {
                    return '--';
                  }
                })()}
              </div>
            </div>

            <div className="text-center flex-1">
              <div className="text-3xl mb-2">🌇</div>
              <div className="text-white/70 text-sm mb-1">Saulriets</div>
              <div className="text-white font-semibold text-lg">
                {formatTime(daily.sunset[todayIndex])}
              </div>
            </div>
          </div>
        </div>
      )}
    </Wrapper>
  );
};

export default WeatherDetails;
