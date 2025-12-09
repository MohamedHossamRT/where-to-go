import React, { useState, useEffect } from 'react';
import { MapPin, DollarSign, Search, Loader2, SlidersHorizontal, X } from 'lucide-react';
interface FilterComponentProps {
  onSearch: (filters: {
    city: string;
    priceLevel: string;
    sortBy: string;
  }) => void;
  showSearchButton?: boolean;
  initialCity?: string;
  initialPrice?: string;
  initialSort?: string;
  variant?: 'home' | 'listings';
  apiBaseUrl: string;
}

export const FilterComponent: React.FC<FilterComponentProps> = ({
  onSearch,
  showSearchButton = false,
  initialCity = '',
  initialPrice = '',
  initialSort = 'default',
  variant = 'home',
  apiBaseUrl
}) => {
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [selectedPrice, setSelectedPrice] = useState(initialPrice);
  const [selectedSort, setSelectedSort] = useState(initialSort);

  // Sync with external changes
  useEffect(() => {
    setSelectedCity(initialCity);
    setSelectedPrice(initialPrice);
    setSelectedSort(initialSort);
  }, [initialCity, initialPrice, initialSort]);
  const [cities, setCities] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoadingCities(true);
        setError('');

        const response = await fetch(`${apiBaseUrl}/api/places`);
        if (!response.ok) throw new Error('Failed to fetch cities');
        
        const data = await response.json();
        
        let places = [];
        if (data.data?.places && Array.isArray(data.data.places)) {
          places = data.data.places;
        } else if (Array.isArray(data.data)) {
          places = data.data;
        } else if (Array.isArray(data)) {
          places = data;
        } else if (data.places && Array.isArray(data.places)) {
          places = data.places;
        }

        const citySet = new Set<string>();
        places.forEach((place: any) => {
          if (place?.city && typeof place.city === 'string' && place.city.trim() !== '') {
            citySet.add(place.city.trim());
          }
        });

        const uniqueCities = Array.from(citySet).sort();
        setCities(uniqueCities);
      } catch (err: any) {
        console.error('Error fetching cities:', err);
        setError(err.message || 'Failed to load cities');
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, [retryCount, apiBaseUrl]);



  const handleApplyFilters = () => {
    onSearch({
      city: selectedCity,
      priceLevel: selectedPrice,
      sortBy: selectedSort
    });
  };

  const handleClearFilters = () => {
    setSelectedCity('');
    setSelectedPrice('');
    setSelectedSort('default');
    onSearch({
      city: '',
      priceLevel: '',
      sortBy: 'default'
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && showSearchButton) {
      handleApplyFilters();
    }
  };

  const hasActiveFilters = selectedCity || selectedPrice || selectedSort !== 'default';

  const isHomeVariant = variant === 'home';

  return (
    <div className={`${isHomeVariant ? 'bg-white dark:bg-[#0f1729] rounded-2xl shadow-2xl p-6 max-w-4xl mx-auto' : 'bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6'}`}>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700 text-sm font-medium">{error}</span>
            </div>
            <button
              onClick={() => setRetryCount(prev => prev + 1)}
              className="text-red-600 hover:text-red-800 text-sm font-semibold underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <div className={`grid ${isHomeVariant ? 'md:grid-cols-4' : 'md:grid-cols-5'} gap-4`}>
        {/* City Dropdown */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-2 text-left">
            City
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                if (!showSearchButton) {
                  onSearch({ city: e.target.value, priceLevel: selectedPrice, sortBy: selectedSort });
                }
              }}
              onKeyPress={handleKeyPress}
              disabled={loadingCities}
              className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed cursor-pointer transition-colors dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="">All Cities</option>
              {loadingCities && <option disabled>Loading...</option>}
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {loadingCities ? (
                <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
              ) : (
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Price Level Dropdown */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-2 text-left">
            Price Level
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <select
              value={selectedPrice}
              onChange={(e) => {
                setSelectedPrice(e.target.value);
                if (!showSearchButton) {
                  onSearch({ city: selectedCity, priceLevel: e.target.value, sortBy: selectedSort });
                }
              }}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none appearance-none bg-white cursor-pointer transition-colors dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="">All Prices</option>
              <option value="1">$ - Budget</option>
              <option value="2">$$ - Moderate</option>
              <option value="3">$$$ - Expensive</option>
              <option value="4">$$$$ - Luxury</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-2 text-left">
            Sort By
          </label>
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <select
              value={selectedSort}
              onChange={(e) => {
                setSelectedSort(e.target.value);
                if (!showSearchButton) {
                  onSearch({ city: selectedCity, priceLevel: selectedPrice, sortBy: e.target.value });
                }
              }}
              onKeyPress={handleKeyPress}
              disabled={loadingCities}
              className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none appearance-none bg-white cursor-pointer transition-colors dark:bg-gray-700 dark:text-white dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="default">Default</option>
              <option value="nearest">Nearest</option>
              <option value="highRating">Highest Rating</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`flex items-end gap-2 ${isHomeVariant ? '' : 'md:col-span-2'}`}>
          {showSearchButton ? (
            <button
              onClick={handleApplyFilters}
              disabled={loadingCities}
              className="flex-1 bg-[#ef4343] hover:bg-[#ffe1e1] hover:text-[#ef4343] disabled:bg-[#ef4343] disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95 transform"
            >
              <Search className="w-5 h-5" />
              Search
            </button>
          ) : (
            hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )
          )}
        </div>
      </div>

      {/* Filter Summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Searching for places
            {selectedCity && (
              <span className="font-semibold text-blue-600 dark:text-blue-400"> in {selectedCity}</span>
            )}
            {selectedCity && selectedPrice && ' with'}
            {selectedPrice && (
              <span className="font-semibold text-green-600 dark:text-green-400"> {'$'.repeat(parseInt(selectedPrice))} price level</span>
            )}
            {(selectedCity || selectedPrice) && selectedSort !== 'default' && ', '}
            {selectedSort !== 'default' && (
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                sorted by {selectedSort === 'nearest' ? 'nearest location' : 'highest rating'}
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};