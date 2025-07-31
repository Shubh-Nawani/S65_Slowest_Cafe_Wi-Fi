import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Target, Search, Navigation } from 'lucide-react';
import { Button, Input, Card, Badge } from '../ui';

const LocationPicker = ({ 
  onLocationSelect, 
  currentLocation, 
  className = '',
  showMap = true 
}) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(currentLocation);
  const [error, setError] = useState('');
  const searchTimeoutRef = useRef(null);

  // Get user's current location
  const getCurrentLocation = async () => {
    setIsDetecting(true);
    setError('');
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setIsDetecting(false);
      return;
    }

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        address: 'Current Location'
      };

      // Reverse geocode to get address
      try {
        const address = await reverseGeocode(location.latitude, location.longitude);
        location.address = address;
      } catch (geocodeError) {
        console.warn('Reverse geocoding failed:', geocodeError);
      }

      setSelectedLocation(location);
      onLocationSelect(location);
    } catch (error) {
      let errorMessage = 'Unable to get your location';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access denied. Please enable location permissions.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable.';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out.';
          break;
        default:
          errorMessage = 'An unknown error occurred while getting location.';
      }
      
      setError(errorMessage);
    } finally {
      setIsDetecting(false);
    }
  };

  // Reverse geocoding function (using a free service)
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=YOUR_API_KEY&limit=1`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        return data.results[0].formatted;
      }
      
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      // Fallback to coordinates
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  // Search for locations (using a mock API for demo)
  const searchLocations = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      // Mock search results - in production, use a real geocoding service
      const mockResults = [
        {
          id: 1,
          address: `${query} Street, Downtown`,
          latitude: 40.7128 + Math.random() * 0.01,
          longitude: -74.0060 + Math.random() * 0.01,
          type: 'street'
        },
        {
          id: 2,
          address: `${query} Avenue, Midtown`,
          latitude: 40.7589 + Math.random() * 0.01,
          longitude: -73.9851 + Math.random() * 0.01,
          type: 'avenue'
        },
        {
          id: 3,
          address: `${query} Plaza, Uptown`,
          latitude: 40.7831 + Math.random() * 0.01,
          longitude: -73.9712 + Math.random() * 0.01,
          type: 'plaza'
        }
      ];

      setSuggestions(mockResults);
    } catch (error) {
      console.error('Location search failed:', error);
    }
  };

  // Handle search input changes
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchLocations(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setSearchQuery(location.address);
    setSuggestions([]);
    onLocationSelect(location);
  };

  const LocationSuggestion = ({ location, onClick }) => (
    <motion.div
      className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
      onClick={() => onClick(location)}
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <MapPin className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-900">{location.address}</div>
          <div className="text-sm text-gray-500 capitalize">{location.type}</div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Location Display */}
      {selectedLocation && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-green-900">Selected Location</div>
                <div className="text-sm text-green-700">{selectedLocation.address}</div>
                {selectedLocation.accuracy && (
                  <Badge variant="success" size="sm" className="mt-1">
                    Accuracy: {Math.round(selectedLocation.accuracy)}m
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Location Controls */}
      <div className="space-y-3">
        {/* Current Location Button */}
        <Button
          onClick={getCurrentLocation}
          disabled={isDetecting}
          loading={isDetecting}
          variant="outline"
          className="w-full flex items-center gap-2"
        >
          <Target className="w-4 h-4" />
          {isDetecting ? 'Detecting Location...' : 'Use Current Location'}
        </Button>

        {/* Search Input */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Search for a location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
            className="w-full"
          />

          {/* Search Suggestions */}
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 z-50 mt-1"
              >
                <Card className="overflow-hidden shadow-lg">
                  {suggestions.map((location) => (
                    <LocationSuggestion
                      key={location.id}
                      location={location}
                      onClick={handleLocationSelect}
                    />
                  ))}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Manual Coordinates Input */}
        <details className="group">
          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2">
            <Navigation className="w-4 h-4" />
            Enter coordinates manually
          </summary>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 grid grid-cols-2 gap-3"
          >
            <Input
              type="number"
              placeholder="Latitude"
              step="any"
              className="text-sm"
            />
            <Input
              type="number"
              placeholder="Longitude"
              step="any"
              className="text-sm"
            />
          </motion.div>
        </details>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="text-sm text-red-800">{error}</div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError('')}
            className="mt-2 text-red-600 hover:text-red-800"
          >
            Dismiss
          </Button>
        </motion.div>
      )}

      {/* Simple Map Preview (placeholder) */}
      {showMap && selectedLocation && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="h-48 bg-gray-100 rounded-lg flex items-center justify-center"
        >
          <div className="text-center text-gray-500">
            <MapPin className="w-8 h-8 mx-auto mb-2" />
            <div className="text-sm">Map Preview</div>
            <div className="text-xs">
              {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LocationPicker;
