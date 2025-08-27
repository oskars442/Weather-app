import { getWeatherInfo } from '../utils/weatherCodes';
import { formatTemp } from '../utils/format';

const DailyForecast = ({ daily, unit }) => {
  // Add proper validation
  if (!daily || !daily.time || !Array.isArray(daily.time) || daily.time.length === 0) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-white text-lg font-semibold mb-4 text-shadow">
          📅 7 dienu prognoze
        </h3>
        <div className="text-white/70 text-center py-8">
          Nav pieejama nedēļas prognoze
        </div>
      </div>
    );
  }

  const formatDate = (dateString, index) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (index === 0) return 'Šodien';
      if (index === 1) return 'Rīt';
      
      return date.toLocaleDateString('lv-LV', { 
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  // Safely get the first 7 days
  const daysToShow = Math.min(daily.time.length, 7);
  
  return (
    <div className="glass-card p-6">
      <h3 className="text-white text-lg font-semibold mb-4 text-shadow">
        📅 7 dienu prognoze
      </h3>
      
      <div className="space-y-3">
        {Array.from({ length: daysToShow }, (_, index) => {
          // Safely access array elements
          const date = daily.time?.[index];
          const maxTemp = daily.temperature_2m_max?.[index];
          const minTemp = daily.temperature_2m_min?.[index];
          const weatherCode = daily.weathercode?.[index] || daily.weather_code?.[index] || 0;
          const precipitation = daily.precipitation_sum?.[index] || 0;
          
          if (!date) return null;
          
          const weatherInfo = getWeatherInfo(weatherCode);
          
          return (
            <div 
              key={index}
              className="flex items-center justify-between p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-300"
            >
              {/* Date */}
              <div className="flex-1">
                <div className="text-white font-medium">
                  {formatDate(date, index)}
                </div>
                {precipitation > 0 && (
                  <div className="text-white/60 text-xs">
                    💧 {precipitation.toFixed(1)}mm
                  </div>
                )}
              </div>
              
              {/* Weather Icon & Description */}
              <div className="flex-1 text-center">
                <div className="text-2xl mb-1">{weatherInfo.icon}</div>
                <div className="text-white/70 text-xs">
                  {weatherInfo.text}
                </div>
              </div>
              
              {/* Temperature */}
              <div className="flex-1 text-right">
                <div className="flex items-center justify-end space-x-2">
                  <span className="text-white font-semibold">
                    {maxTemp != null ? formatTemp(maxTemp, unit) : '--'}°
                  </span>
                  <span className="text-white/60">
                    {minTemp != null ? formatTemp(minTemp, unit) : '--'}°
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Additional info */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="text-white/60 text-xs text-center">
          Maksimālā un minimālā temperatūra dienā
        </div>
      </div>
    </div>
  );
};

export default DailyForecast;