import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, MapPin, Star, Wifi, Users, Clock, Plus, Search, Filter, Heart, Target, Zap, TrendingUp, Award, Navigation } from 'lucide-react';
import { Button, Card, Badge, Input, LoadingSpinner, Modal } from './ui';
import { CafeCard, SearchFilter, StatsDisplay } from './ui';
import AddShop from './AddShop';
import LocationPicker from './advanced/LocationPicker';
import SpeedTestWidget from './advanced/SpeedTestWidget';
import { RatingModal, ReviewsSection } from './advanced/RatingSystem';
import { AuthContext } from '../contexts/AuthContext';

const EnhancedHomePage = () => {
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddShop, setShowAddShop] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    minRating: '',
    maxSpeed: '',
    sortBy: 'createdAt',
    radius: 10
  });
  const [userLocation, setUserLocation] = useState(null);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [speedTestModalOpen, setSpeedTestModalOpen] = useState(false);
  const [selectedCafe, setSelectedCafe] = useState(null);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [stats, setStats] = useState({});
  const [statsLoading, setStatsLoading] = useState(true);
  
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchCafes();
    fetchStats();
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  useEffect(() => {
    if (userLocation) {
      fetchNearbyCafes();
    }
  }, [userLocation, filters]);

  const fetchCafes = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      // Add search parameters
      if (searchTerm) queryParams.append('search', searchTerm);
      if (filters.minRating) queryParams.append('minRating', filters.minRating);
      if (filters.maxSpeed) queryParams.append('maxSpeed', filters.maxSpeed);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (userLocation) {
        queryParams.append('latitude', userLocation.latitude);
        queryParams.append('longitude', userLocation.longitude);
        queryParams.append('radius', filters.radius);
      }

      const endpoint = userLocation ? '/api/v2/cafes/search' : '/api/v2/cafes';
      const response = await fetch(`${endpoint}?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch cafes');
      }
      
      const data = await response.json();
      setCafes(data.cafes || []);
    } catch (error) {
      console.error('Error fetching cafes:', error);
      setError('Failed to load cafes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyCafes = async () => {
    if (!userLocation) return;
    
    try {
      const response = await fetch('/api/v2/cafes/nearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radius: filters.radius,
          ...filters
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setCafes(data.cafes || []);
      }
    } catch (error) {
      console.error('Error fetching nearby cafes:', error);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await fetch('/api/v2/stats/overview');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/v2/users/favorites', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites || []);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const handleAddCafe = (newCafe) => {
    setCafes(prev => [newCafe, ...prev]);
    setShowAddShop(false);
    fetchStats(); // Refresh stats
  };

  const handleDeleteCafe = async (cafeId, cafeName) => {
    if (!window.confirm(`Are you sure you want to delete "${cafeName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/v2/cafes/${cafeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete cafe');
      }

      setCafes(prev => prev.filter(cafe => cafe._id !== cafeId));
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error('Error deleting cafe:', error);
      alert('Failed to delete cafe. Please try again.');
    }
  };

  const handleFavorite = async (cafeId) => {
    if (!user) {
      alert('Please sign in to save favorites');
      return;
    }

    try {
      const isFavorite = favorites.includes(cafeId);
      const method = isFavorite ? 'DELETE' : 'POST';
      
      const response = await fetch(`/api/v2/users/favorites/${cafeId}`, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        if (isFavorite) {
          setFavorites(prev => prev.filter(id => id !== cafeId));
        } else {
          setFavorites(prev => [...prev, cafeId]);
        }
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  const handleRateCafe = (cafe) => {
    setSelectedCafe(cafe);
    setRatingModalOpen(true);
  };

  const handleSubmitRating = async (ratingData) => {
    try {
      const response = await fetch('/api/v2/cafes/rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(ratingData)
      });

      if (response.ok) {
        fetchCafes(); // Refresh cafes to get updated ratings
        setRatingModalOpen(false);
        setSelectedCafe(null);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const handleSpeedTestComplete = async (results) => {
    if (selectedCafe) {
      try {
        await fetch('/api/v2/cafes/speed-test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            cafeId: selectedCafe._id,
            ...results
          })
        });
        fetchCafes(); // Refresh to get updated speed data
      } catch (error) {
        console.error('Error saving speed test:', error);
      }
    }
  };

  const HeroSection = () => (
    <div className="relative bg-gradient-to-br from-coffee-900 via-coffee-800 to-orange-900 text-white py-20 mb-12 rounded-2xl overflow-hidden">
      <div className="absolute inset-0 bg-black/20" />
      
      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold mb-6">
            Find the Perfect
            <span className="block text-yellow-300">Slow WiFi Café</span>
          </h1>
          <p className="text-xl text-coffee-100 mb-8 max-w-2xl mx-auto">
            Discover cafés with beautifully slow internet, perfect for deep work, 
            meaningful conversations, and digital detox.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="secondary" 
              size="lg"
              onClick={() => setLocationModalOpen(true)}
              className="bg-white text-coffee-900 hover:bg-coffee-50"
            >
              <Target className="w-5 h-5 mr-2" />
              Find Nearby Cafés
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setShowAddShop(true)}
              className="border-white text-white hover:bg-white/10"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your Café
            </Button>
          </div>
        </motion.div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400/20 rounded-full blur-xl" />
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-orange-400/20 rounded-full blur-xl" />
    </div>
  );

  const QuickActions = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Card 
          className="p-6 cursor-pointer border-2 border-transparent hover:border-coffee-200 transition-all"
          onClick={() => setLocationModalOpen(true)}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Navigation className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Find Nearby</h3>
              <p className="text-sm text-gray-600">Discover cafés around you</p>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Card 
          className="p-6 cursor-pointer border-2 border-transparent hover:border-coffee-200 transition-all"
          onClick={() => setSpeedTestModalOpen(true)}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Speed Test</h3>
              <p className="text-sm text-gray-600">Test your WiFi speed</p>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Card 
          className="p-6 cursor-pointer border-2 border-transparent hover:border-coffee-200 transition-all"
          onClick={() => setShowAddShop(true)}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Plus className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Add Café</h3>
              <p className="text-sm text-gray-600">Share your favorite spot</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <HeroSection />
        <QuickActions />
        <StatsDisplay stats={stats} loading={statsLoading} />
        
        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <SearchFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filters={filters}
            onFilterChange={setFilters}
          />
          
          {userLocation && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg"
            >
              <div className="flex items-center gap-2 text-green-800">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Showing cafés near {userLocation.address}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUserLocation(null)}
                  className="ml-auto text-green-600"
                >
                  Clear
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Cafés Grid */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {userLocation ? 'Nearby Cafés' : 'Featured Cafés'} ({cafes.length})
            </h2>
            
            {user && (
              <Button
                onClick={() => setShowAddShop(true)}
                variant="coffee"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Café
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">{error}</div>
              <Button onClick={fetchCafes} variant="outline">
                Try Again
              </Button>
            </div>
          ) : cafes.length === 0 ? (
            <div className="text-center py-12">
              <Coffee className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No cafés found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? 'Try adjusting your search terms' : 'Be the first to add a café!'}
              </p>
              {user && (
                <Button onClick={() => setShowAddShop(true)} variant="coffee">
                  Add the First Café
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cafes.map((cafe) => (
                <CafeCard
                  key={cafe._id}
                  cafe={cafe}
                  onFavorite={handleFavorite}
                  onRate={handleRateCafe}
                  onEdit={(cafe) => {
                    setSelectedCafe(cafe);
                    setShowAddShop(true);
                  }}
                  onDelete={handleDeleteCafe}
                  isAdmin={user?.isAdmin}
                  isFavorite={favorites.includes(cafe._id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Location Picker Modal */}
      <Modal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        title="Find Cafés Near You"
        size="lg"
      >
        <LocationPicker
          onLocationSelect={(location) => {
            setUserLocation(location);
            setLocationModalOpen(false);
          }}
          currentLocation={userLocation}
        />
      </Modal>

      {/* Speed Test Modal */}
      <Modal
        isOpen={speedTestModalOpen}
        onClose={() => setSpeedTestModalOpen(false)}
        title="WiFi Speed Test"
        size="lg"
      >
        <SpeedTestWidget
          onTestComplete={handleSpeedTestComplete}
          cafeId={selectedCafe?._id}
        />
      </Modal>

      {/* Rating Modal */}
      {selectedCafe && (
        <RatingModal
          isOpen={ratingModalOpen}
          onClose={() => {
            setRatingModalOpen(false);
            setSelectedCafe(null);
          }}
          cafe={selectedCafe}
          onSubmit={handleSubmitRating}
        />
      )}

      {/* Add Shop Modal */}
      {showAddShop && (
        <AddShop 
          onClose={() => {
            setShowAddShop(false);
            setSelectedCafe(null);
          }}
          onSuccess={handleAddCafe}
          editCafe={selectedCafe}
        />
      )}
    </div>
  );
};

export default EnhancedHomePage;
