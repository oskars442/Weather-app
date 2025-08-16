import { getWeatherInfo } from '../utils/weatherCodes';

const HourlyStrip = ({ hourly, unit }) => {
  // Add proper validation
  if (!hourly || !hourly.time || !Array.isArray(hourly.time) || hourly.time.length === 0) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-white text-lg font-semibold mb-4 text-shadow">
          ⏰ 24 stundu prognoze
        </h3>
        <div className="text-white/70 text-center py-8">
          Nav pieejama stundu prognoze
        </div>
      </div>
    );
  }

  const formatHour = (timeString) => {
    if (!timeString) return '';
    
    try {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) return '';
      
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
      
      const timeStr = date.toLocaleTimeString('lv-LV', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      
      if (isToday && date.getHours() === now.getHours()) {
        return 'Tagad';
      } else if (isToday) {
        return timeStr;
      } else if (isTomorrow) {
        return `Rīt ${timeStr}`;
      } else {
        return `${date.toLocaleDateString('lv-LV', { weekday: 'short' })} ${timeStr}`;
      }
    } catch (error) {
      console.error('Time formatting error:', error);
      return '';
    }
  };

  const getWindSpeed = (speed) => {
    if (!speed) return 0;
    return unit === 'C' ? speed : Math.round(speed * 2.237); // Convert m/s to mph for imperial
  };

  const getWindUnit = () => {
    return unit === 'C' ? 'm/s' : 'mph';
  };

  // Get next 24 hours
  const hoursToShow = Math.min(hourly.time.length, 24);
  
  return (
    <div className="glass-card p-6">
      <h3 className="text-white text-lg font-semibold mb-4 text-shadow">
        ⏰ 24 stundu prognoze
      </h3>
      
      <div className="overflow-x-auto">
        <div className="flex space-x-4 pb-4" style={{ minWidth: `${hoursToShow * 120}px` }}>
          {Array.from({ length: hoursToShow }, (_, index) => {
            // Safely access array elements
            const time = hourly.time?.[index];
            const temp = hourly.temperature_2m?.[index];
            const weatherCode = hourly.weathercode?.[index] || hourly.weather_code?.[index] || 0;
            const windSpeed = hourly.windspeed_10m?.[index] || hourly.wind_speed_10m?.[index] || 0;
            const precipitation = hourly.precipitation?.[index] || 0;
            const humidity = hourly.relativehumidity_2m?.[index] || hourly.relative_humidity_2m?.[index];
            
            if (!time) return null;
            
            const weatherInfo = getWeatherInfo(weatherCode);
            const currentHour = new Date().getHours();
            const itemHour = new Date(time).getHours();
            const isCurrentHour = index === 0 || itemHour === currentHour;
            
            return (
              <div 
                key={index}
                className={`flex-shrink-0 bg-white/10 rounded-lg p-4 text-center min-w-[110px] transition-all duration-300 hover:bg-white/20 ${
                  isCurrentHour ? 'bg-white/20 ring-2 ring-white/30' : ''
                }`}
              >
                {/* Time */}
                <div className="text-white/70 text-sm mb-2">
                  {formatHour(time)}
                </div>
                
                {/* Weather Icon */}
                <div className="text-3xl mb-2">
                  {weatherInfo.icon}
                </div>
                
                {/* Temperature */}
                <div className="text-white font-bold text-lg mb-2">
                  {temp ? Math.round(temp) : '--'}°{unit}
                </div>
                
                {/* Precipitation */}
                {precipitation > 0 && (
                  <div className="text-blue-300 text-xs mb-1">
                    💧 {precipitation.toFixed(1)}mm
                  </div>
                )}
                
                {/* Wind */}
                {windSpeed > 0 && (
                  <div className="text-white/60 text-xs mb-1">
                    💨 {Math.round(getWindSpeed(windSpeed))} {getWindUnit()}
                  </div>
                )}
                
                {/* Humidity */}
                {humidity && (
                  <div className="text-white/60 text-xs">
                    💧 {Math.round(humidity)}%
                  </div>
                )}
                
                {/* Weather description */}
                <div className="text-white/50 text-xs mt-2">
                  {weatherInfo.text}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Scroll hint */}
      <div className="text-white/40 text-xs text-center mt-2">
        ← Ritiniet, lai redzētu vairāk →
      </div>
    </div>
  );
};

export default HourlyStrip;