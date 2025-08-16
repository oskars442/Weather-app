import { useState, useEffect, useRef } from 'react';
import { searchCities } from '../utils/api';

const SearchBar = ({ onCitySelect, currentCity }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.trim().length > 1) {
        setIsLoading(true);
        try {
          const results = await searchCities(query);
          setSuggestions(results);
          setIsOpen(true);
          setSelectedIndex(-1);
        } catch (error) {
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleCitySelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleCitySelect = (city) => {
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
    onCitySelect(city);
    inputRef.current?.blur();
  };

  const handleClickOutside = (e) => {
    if (!inputRef.current?.contains(e.target) && !listRef.current?.contains(e.target)) {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Meklēt pilsētu Latvijā..."
          className="w-full px-4 py-3 pl-10 glass-card text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200"
          aria-label="Meklēt pilsētu"
          aria-expanded={isOpen}
          aria-controls={isOpen ? 'city-suggestions' : undefined}
          aria-activedescendant={selectedIndex >= 0 ? `city-option-${selectedIndex}` : undefined}
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
          ) : (
            <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>

      {/* Suggestions dropdown */}
      {isOpen && (
        <div
          ref={listRef}
          id="city-suggestions"
          role="listbox"
          className="absolute z-50 w-full mt-2 glass-card max-h-64 overflow-y-auto animate-fade-in"
        >
          {suggestions.length > 0 ? (
            suggestions.map((city, index) => (
              <button
                key={`${city.latitude}-${city.longitude}`}
                id={`city-option-${index}`}
                role="option"
                aria-selected={index === selectedIndex}
                onClick={() => handleCitySelect(city)}
                className={`w-full text-left px-4 py-3 hover:bg-white/10 transition-colors duration-150 ${
                  index === selectedIndex ? 'bg-white/10' : ''
                } ${index === 0 ? 'rounded-t-2xl' : ''} ${
                  index === suggestions.length - 1 ? 'rounded-b-2xl' : 'border-b border-white/10'
                }`}
              >
                <div className="text-white font-medium">{city.name}</div>
                {city.admin1 && (
                  <div className="text-white/70 text-sm">{city.admin1}, Latvija</div>
                )}
              </button>
            ))
          ) : query.trim().length > 1 && !isLoading ? (
            <div className="px-4 py-3 text-white/70 text-center">
              Pilsēta nav atrasta
            </div>
          ) : null}
        </div>
      )}

     {/* Current city display */}
{currentCity && (
  <div className="mt-2 text-center text-white text-lg font-semibold">
    📍 {currentCity.name}
  </div>
)}
    </div>
  );
};

export default SearchBar;