// src/components/HourlyStrip.jsx
import { getWeatherInfo } from '../utils/weatherCodes';

const HourlyStrip = ({ hourly, unit, nowIso }) => {
  // Guard
  if (!hourly || !Array.isArray(hourly.time) || hourly.time.length === 0) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-white text-lg font-semibold mb-4 text-shadow">⏰ 24 stundu prognoze</h3>
        <div className="text-white/70 text-center py-8">Nav pieejama stundu prognoze</div>
      </div>
    );
  }

  // ---------- helpers ----------
  const toMs = (iso) => (iso ? new Date(iso).getTime() : NaN);

  // pick closest hourly timestamp to nowIso (hourly slots are HH:00)
  const findBestHourlyIndex = (times = [], targetIso) => {
    if (!times?.length) return 0;
    const t = toMs(targetIso || new Date().toISOString());
    let best = 0, bestDiff = Infinity;
    for (let i = 0; i < times.length; i++) {
      const d = Math.abs(toMs(times[i]) - t);
      if (d < bestDiff) { bestDiff = d; best = i; }
    }
    return best;
  };

  const labelFor = (iso, i) => {
    if (i === 0) return 'Tagad';
    const d = new Date(iso);
    const now = new Date();
    const isTomorrow =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate() + 1;
    const hhmm = d.toLocaleTimeString('lv-LV', { hour: '2-digit', minute: '2-digit', hour12: false });
    return isTomorrow ? `Rīt ${hhmm}` : hhmm;
  };

  const msToMph = (ms) => (typeof ms === 'number' ? ms * 2.237 : 0);
  const unitSymbol = unit === 'F' ? '°F' : '°C';
  const windUnit = unit === 'F' ? 'mph' : 'm/s';

  // ---------- build rotated next 24 hours ----------
  const startIdx = findBestHourlyIndex(hourly.time, nowIso);
  const N = Math.min(24, hourly.time.length);

  const items = Array.from({ length: N }, (_, i) => {
    const idx = (startIdx + i) % hourly.time.length;

    const timeISO  = hourly.time[idx];
    const temp     = hourly.temperature_2m?.[idx] ?? null;
    const wind     = hourly.wind_speed_10m?.[idx] ?? hourly.windspeed_10m?.[idx] ?? null;
    const humidity = hourly.relative_humidity_2m?.[idx] ?? null;
    const precip   = hourly.precipitation?.[idx] ?? null;
    const code     = hourly.weather_code?.[idx] ?? hourly.weathercode?.[idx] ?? 0;
    const info     = getWeatherInfo(code);

    return {
      key: `${timeISO}_${idx}`,
      label: labelFor(timeISO, i),
      icon: info.icon,
      text: info.text,
      temp, wind, humidity, precip
    };
  });

  return (
    <div className="glass-card p-6 overflow-hidden">
      <h3 className="text-white text-lg font-semibold mb-4 text-shadow">⏰ 24 stundu prognoze</h3>

      {/* iOS-friendly horizontal scroller */}
      <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="flex gap-4 pb-4 pr-1 snap-x snap-mandatory">
          {items.map((h, i) => (
            <div
              key={h.key}
              className={`snap-start shrink-0 bg-white/10 rounded-lg p-4 text-center
                          w-[120px] sm:w-[136px] transition-all duration-300
                          ${i === 0 ? 'bg-white/20 ring-2 ring-white/30' : 'hover:bg-white/15'}`}
            >
              {/* Time */}
              <div className="text-white/70 text-sm mb-2">{h.label}</div>

              {/* Icon */}
              <div className="text-3xl mb-2" role="img" aria-label={h.text} title={h.text}>
                {h.icon}
              </div>

              {/* Temperature */}
              <div className="text-white font-bold text-lg mb-2">
               {h.temp != null ? formatTemp(h.temp, unit) : '--'}
              </div>

              {/* Details */}
              <div className="text-white/60 text-xs space-y-1">
                {h.wind != null && (
                  <div>💨 {Math.round(unit === 'F' ? msToMph(h.wind) : h.wind)} {windUnit}</div>
                )}
                {h.humidity != null && (
                  <div>💧 {Math.round(h.humidity)}%</div>
                )}
                {h.precip != null && h.precip > 0 && (
                  <div>🌧️ {h.precip.toFixed(1)}mm</div>
                )}
              </div>

              <div className="text-white/50 text-xs mt-2">{h.text}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-white/40 text-xs text-center mt-2">
        ← Ritiniet, lai redzētu vairāk →
      </div>
    </div>
  );
};

export default HourlyStrip;
