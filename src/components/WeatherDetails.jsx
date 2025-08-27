// src/components/WeatherDetails.jsx
import { useState, useEffect } from 'react';
import { formatTime } from '../utils/dateHelpers';
import { formatTemp } from '../utils/format';

// ── small helpers ────────────────────────────────────────────────────────────
const clamp01 = (x) => (Number.isFinite(x) ? Math.max(0, Math.min(1, x)) : 0);
const toMs = (iso) => (iso ? new Date(iso).getTime() : NaN);
const isoDate = (iso) => (iso ? iso.split('T')[0] : null);

// ── Sun / Moon progress bar (animated) ──────────────────────────────────────
function SunPath({ daily, nowIso, animate = true, durationMs = 1200 }) {
  if (
    !daily ||
    !Array.isArray(daily.sunrise) ||
    !Array.isArray(daily.sunset) ||
    daily.sunrise.length < 2 ||
    daily.sunset.length < 2
  ) return null;

  // past_days=1 common: today is index 1; still try to map by date if available
  let todayIndex = 1;
  if (Array.isArray(daily.time)) {
    const idx = daily.time.findIndex((d) => d === isoDate(nowIso));
    if (idx !== -1) todayIndex = idx;
  }

  const y = Math.max(0, todayIndex - 1);
  const t = todayIndex;
  const n = Math.min(daily.sunrise.length - 1, todayIndex + 1);

  const sunriseToday = daily.sunrise[t];
  const sunsetToday  = daily.sunset[t];
  const sunriseNext  = daily.sunrise[n];
  const sunsetPrev   = daily.sunset[y];

  const now  = nowIso ? new Date(nowIso) : new Date();
  const nowT = now.getTime();

  const sRiseT = toMs(sunriseToday);
  const sSetT  = toMs(sunsetToday);
  const sRiseN = toMs(sunriseNext);
  const sSetP  = toMs(sunsetPrev);

  const isDay =
    Number.isFinite(sRiseT) &&
    Number.isFinite(sSetT) &&
    nowT >= sRiseT &&
    nowT <= sSetT;

  let start, end, leftLabel, leftTime, rightLabel, rightTime, emoji;
  if (isDay) {
    start = sRiseT; end = sSetT;
    leftLabel = 'Saullēkts'; leftTime = sunriseToday;
    rightLabel = 'Saulriets'; rightTime = sunsetToday;
    emoji = '🌞';
  } else {
    if (Number.isFinite(sSetT) && nowT > sSetT) {
      start = sSetT; end = sRiseN;  // tonight → next sunrise
      leftLabel = 'Saulriets'; leftTime = sunsetToday;
      rightLabel = 'Saullēkts'; rightTime = sunriseNext;
    } else {
      start = sSetP; end = sRiseT;  // last sunset → today sunrise
      leftLabel = 'Saulriets'; leftTime = sunsetPrev;
      rightLabel = 'Saullēkts'; rightTime = sunriseToday;
    }
    emoji = '🌙';
  }

  const target = clamp01((nowT - start) / ((end - start) || 1));

  // animate from 0 → target on mount/update
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!animate) { setProgress(target); return; }
    setProgress(0);
    const id = setTimeout(() => setProgress(target), 60);
    return () => clearTimeout(id);
  }, [target, animate]);

  // “Dienas garums” uses today’s sunrise/sunset
  const dayLen = sSetT - sRiseT;
  const lenH = Math.max(0, Math.floor(dayLen / 3_600_000));
  const lenM = Math.max(0, Math.floor((dayLen % 3_600_000) / 60_000));

  return (
    <div className="bg-white/10 rounded-lg p-4">
      <div className="grid grid-cols-3 items-center gap-4">
        {/* Left */}
        <div className="text-center">
          <div className="text-2xl mb-1">{leftLabel === 'Saullēkts' ? '🌅' : '🌇'}</div>
          <div className="text-white/70 text-xs">{leftLabel}</div>
          <div className="text-white font-semibold">{leftTime ? formatTime(leftTime) : '--:--'}</div>
        </div>

        {/* Center with progress */}
        <div className="flex flex-col items-center">
          <div className="text-white/70 text-xs mb-1">Dienas garums</div>
          <div className="text-white/90 text-sm mb-2">{`${lenH}h ${lenM}m`}</div>

          <div className="w-full max-w-xs relative">
            <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-2 bg-white/70 rounded-full transition-all ease-out"
                style={{ width: `${(progress * 100).toFixed(1)}%`, transitionDuration: '1200ms' }}
              />
            </div>
            <div
              className="absolute -top-3 -translate-x-1/2 transition-all ease-out"
              style={{ left: `${(progress * 100).toFixed(1)}%`, transitionDuration: '1200ms' }}
              title={`${Math.round(target * 100)}%`}
            >
              <div className="text-lg">{emoji}</div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="text-center">
          <div className="text-2xl mb-1">{rightLabel === 'Saullēkts' ? '🌅' : '🌇'}</div>
          <div className="text-white/70 text-xs">{rightLabel}</div>
          <div className="text-white font-semibold">{rightTime ? formatTime(rightTime) : '--:--'}</div>
        </div>
      </div>
    </div>
  );
}

// ── Details (3-line tiles) ───────────────────────────────────────────────────
const WeatherDetails = ({
  weather,
  daily,
  hourly,
  unit,
  containerless = false,
  hideTitle = true,              // hidden by default as requested
  title = '🌤️ Detalizēti dati',
}) => {
  if (!weather || !daily || !hourly) return null;

  // match current “now” to the closest hourly slot
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
    hourly.time?.[0] ||
    null;

  const nowIdx = findBestHourlyIndex(hourly.time, nowIso);
  const at = (k) => (hourly && nowIdx >= 0 && hourly[k] ? hourly[k][nowIdx] : undefined);

  const formatPressure   = (p) => (p == null ? '—' : `${Math.round(p)} hPa`);
  const formatVisibility = (v) => (v == null ? '—' : `${(v / 1000).toFixed(1)} km`);
  const toMph = (ms) => ms * 2.23693629;

  // values from hourly (fallbacks to current)
  const uvRaw      = at('uv_index') ?? weather.uv_index ?? null;
  const feelsLike  = at('apparent_temperature') ?? weather.apparent_temperature ?? null;
  const pressure   = at('surface_pressure') ?? at('pressure_msl') ?? weather.pressure_msl ?? null;
  const visibility = at('visibility') ?? weather.visibility ?? null;
  const gustsMs    = at('wind_gusts_10m'); // API returns in m/s because windspeed_unit=ms
  const gustsValue = gustsMs == null ? null : (unit === 'F' ? Math.round(toMph(gustsMs)) : Math.round(gustsMs));
  const gustsUnit  = unit === 'F' ? 'mph' : 'm/s';
  const rawCloud =
    at('cloud_cover') ??
    at('cloudcover') ??
    weather.cloud_cover ??
    weather.cloudcover ??
    null;
  const cloud = rawCloud == null ? null : (rawCloud <= 1 ? Math.round(rawCloud * 100) : Math.round(rawCloud));

  const getUVLevel = (u) => {
    const v = Number(u);
    if (!Number.isFinite(v) || v <= 2) return { level: 'Zems',        color: 'text-green-300'  };
    if (v <= 5)                         return { level: 'Vidējs',      color: 'text-yellow-300' };
    if (v <= 7)                         return { level: 'Augsts',      color: 'text-orange-300' };
    if (v <= 10)                        return { level: 'Ļoti augsts', color: 'text-red-300'    };
    return                                     { level: 'Ekstrēms',    color: 'text-purple-300' };
  };
  const uvInfo = getUVLevel(uvRaw);

  const Wrapper = ({ children }) =>
    containerless ? <>{children}</> : <div className="glass-card p-6 space-y-6">{children}</div>;

  const hasSunData =
    Array.isArray(daily.sunrise) &&
    Array.isArray(daily.sunset) &&
    daily.sunrise.length > 0 &&
    daily.sunset.length > 0;

  // 3-line, centered tile
  const Tile = ({ icon, label, value, accentClass = '' }) => (
    <div className="bg-white/10 rounded-xl p-4 text-center flex flex-col items-center justify-center gap-1 min-h-[96px]">
      <div className="text-2xl leading-none">{icon}</div>
      <div className="text-white/70 text-sm">{label}</div>
      <div className={`text-white font-semibold text-lg ${accentClass}`}>{value ?? '—'}</div>
    </div>
  );

  return (
    <Wrapper>
      {!hideTitle && <h3 className="text-white text-lg font-semibold text-shadow">{title}</h3>}

      {/* 3-line tiles (icon → label → value) */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Tile
          icon="☀️"
          label="UV indekss"
          value={uvRaw == null ? '—' : `${(Math.round(uvRaw * 10) / 10)} ${uvInfo.level}`}
          accentClass={uvInfo.color}
        />
        <Tile
          icon="🌡️"
          label="Sajūta"
           value={feelsLike == null ? '—' : formatTemp(feelsLike, unit)}
        />
        <Tile
          icon="🔽"
          label="Spiediens"
          value={formatPressure(pressure)}
        />
        <Tile
          icon="👁️"
          label="Redzamība"
          value={formatVisibility(visibility)}
        />
        <Tile
          icon="💨"
          label="Brāzmas"
          value={gustsValue == null ? '—' : `${gustsValue} ${gustsUnit}`}
        />
        <Tile
          icon="☁️"
          label="Mākoņi"
          value={cloud == null ? '—' : `${cloud}%`}
        />
      </div>

      {/* Sunrise / Sunset progress with animation */}
      {hasSunData && <SunPath daily={daily} nowIso={nowIso} />}
    </Wrapper>
  );
};

export default WeatherDetails;
