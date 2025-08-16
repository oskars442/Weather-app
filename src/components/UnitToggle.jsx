const UnitToggle = ({ unit, onUnitChange }) => {
  return (
    <div className="flex items-center justify-center">
      <div className="glass-card p-1 flex rounded-full">
        <button
          onClick={() => onUnitChange('C')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
            unit === 'C'
              ? 'bg-white/30 text-white shadow-lg'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
          aria-label="Celsija grādi"
        >
          °C
        </button>
        <button
          onClick={() => onUnitChange('F')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
            unit === 'F'
              ? 'bg-white/30 text-white shadow-lg'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
          aria-label="Fārenheita grādi"
        >
          °F
        </button>
      </div>
    </div>
  );
};

export default UnitToggle;