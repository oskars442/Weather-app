// WMO Weather interpretation codes to Latvian text and icons
export const weatherCodes = {
  0: { text: 'Skaidrs', icon: '☀️', group: 'clear' },
  1: { text: 'Gandrīz skaidrs', icon: '🌤️', group: 'clear' },
  2: { text: 'Daļēji mākoņains', icon: '⛅', group: 'clouds' },
  3: { text: 'Mākoņains', icon: '☁️', group: 'clouds' },
  45: { text: 'Migla', icon: '🌫️', group: 'clouds' },
  48: { text: 'Sarmas migla', icon: '🌫️', group: 'clouds' },
  51: { text: 'Viegls smalks lietus', icon: '🌦️', group: 'rain' },
  53: { text: 'Mērens smalks lietus', icon: '🌦️', group: 'rain' },
  55: { text: 'Stiprs smalks lietus', icon: '🌧️', group: 'rain' },
  56: { text: 'Viegls ledus lietus', icon: '🌨️', group: 'rain' },
  57: { text: 'Stiprs ledus lietus', icon: '🌨️', group: 'rain' },
  61: { text: 'Neliels lietus', icon: '🌦️', group: 'rain' },
  63: { text: 'Mērens lietus', icon: '🌧️', group: 'rain' },
  65: { text: 'Stiprs lietus', icon: '🌧️', group: 'rain' },
  66: { text: 'Viegls ledus lietus', icon: '🌨️', group: 'rain' },
  67: { text: 'Stiprs ledus lietus', icon: '🌨️', group: 'rain' },
  71: { text: 'Neliels sniegs', icon: '🌨️', group: 'snow' },
  73: { text: 'Mērens sniegs', icon: '❄️', group: 'snow' },
  75: { text: 'Stiprs sniegs', icon: '❄️', group: 'snow' },
  77: { text: 'Sniega grauds', icon: '🌨️', group: 'snow' },
  80: { text: 'Nelielas lietusgāzes', icon: '🌦️', group: 'rain' },
  81: { text: 'Mērenas lietusgāzes', icon: '🌧️', group: 'rain' },
  82: { text: 'Stipras lietusgāzes', icon: '⛈️', group: 'rain' },
  85: { text: 'Nelielas sniega gāzes', icon: '🌨️', group: 'snow' },
  86: { text: 'Stipras sniega gāzes', icon: '❄️', group: 'snow' },
  95: { text: 'Pērkona negaiss', icon: '⛈️', group: 'rain' },
  96: { text: 'Pērkona negaiss ar krusu', icon: '⛈️', group: 'rain' },
  99: { text: 'Stiprs pērkona negaiss ar krusu', icon: '⛈️', group: 'rain' },
};

export const getWeatherInfo = (code) => {
  return weatherCodes[code] || { text: 'Nav zināms', icon: '❓', group: 'clouds' };
};