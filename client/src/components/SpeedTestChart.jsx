import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, 
  Zap, 
  Clock, 
  Download, 
  Upload, 
  BarChart3, 
  Trophy,
  Play,
  RefreshCw,
  Gauge,
  ArrowLeft,
  Star,
  Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useNotification } from '../contexts/NotificationContext';
import { Button, Card, LoadingSpinner, Badge } from './ui';
import { animations } from '../utils/designSystem';

function SpeedTestChart() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedCafe, setSelectedCafe] = useState(null);
  const [cafes, setCafes] = useState([]);
  const [progress, setProgress] = useState(0);
  const [currentTest, setCurrentTest] = useState('idle'); // idle, download, upload, ping
  const navigate = useNavigate();
  const { success, error: showError, info } = useNotification();

  useEffect(() => {
    fetchCafes();
    fetchLeaderboard();
  }, []);

  const fetchCafes = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URI}/api/cafes`);
      setCafes(response.data || []);
    } catch (error) {
      console.error('Error fetching cafes:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URI}/api/speedtest/leaderboard?limit=5`);
      setLeaderboard(response.data?.leaderboard || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const runSpeedTest = async (cafeId) => {
    if (!cafeId) {
      showError('Please select a cafe first', 'Validation Error');
      return;
    }

    setIsRunning(true);
    setProgress(0);
    setResults(null);

    try {
      // Simulate progressive speed test for UI feedback
      const steps = ['download', 'upload', 'ping'];
      
      for (let i = 0; i < steps.length; i++) {
        setCurrentTest(steps[i]);
        
        // Animate progress
        for (let p = 0; p <= 100; p += 10) {
          setProgress((i * 100 + p) / steps.length);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Get actual results from server using the quick speed test endpoint
      const response = await axios.get(
        'http://localhost:4000/api/speedtest/quick',
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      setResults(response.data.results);
      setProgress(100);
      success('Speed test completed!', 'Success');
      fetchLeaderboard(); // Refresh leaderboard
      
    } catch (error) {
      console.error('Speed test error:', error);
      showError(
        error.response?.data?.error || 'Speed test failed. Please try again.',
        'Test Failed'
      );
    } finally {
      setIsRunning(false);
      setCurrentTest('idle');
    }
  };

  const getSpeedColor = (speed) => {
    if (speed >= 25) return 'text-green-600';
    if (speed >= 10) return 'text-yellow-600';
    if (speed >= 5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSpeedQuality = (speed) => {
    if (speed >= 25) return { label: 'Excellent', color: 'bg-green-500' };
    if (speed >= 10) return { label: 'Good', color: 'bg-yellow-500' };
    if (speed >= 5) return { label: 'Fair', color: 'bg-orange-500' };
    if (speed >= 1) return { label: 'Slow', color: 'bg-red-500' };
    return { label: 'Very Slow', color: 'bg-gray-500' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              onClick={() => navigate('/home')}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
            
            <div className="flex items-center gap-2">
              <Gauge className="w-6 h-6 text-blue-600" />
              <span className="font-semibold text-gray-900">WiFi Speed Test</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Speed Test Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={animations.slideUp}
          className="mb-8"
        >
          <Card className="p-8 text-center">
            <div className="mb-6">
              <motion.div
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4"
                whileHover={{ scale: 1.05 }}
                animate={isRunning ? { rotate: 360 } : {}}
                transition={{ duration: 2, repeat: isRunning ? Infinity : 0 }}
              >
                <Zap className="w-10 h-10 text-white" />
              </motion.div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                WiFi Speed Test
              </h1>
              <p className="text-gray-600">
                Test your internet speed at any of our café locations
              </p>
            </div>

            {/* Cafe Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select a Café
              </label>
              <select
                value={selectedCafe || ''}
                onChange={(e) => setSelectedCafe(e.target.value)}
                className="w-full max-w-md mx-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isRunning}
              >
                <option value="">Choose a café...</option>
                {cafes.map(cafe => (
                  <option key={cafe._id} value={cafe._id}>
                    {cafe.name} - {cafe.address}
                  </option>
                ))}
              </select>
            </div>

            {/* Progress Bar */}
            <AnimatePresence>
              {isRunning && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6"
                >
                  <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2 capitalize">
                    Testing {currentTest}... {Math.round(progress)}%
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Test Button */}
            <Button
              onClick={() => runSpeedTest(selectedCafe)}
              disabled={isRunning || !selectedCafe}
              variant="primary"
              size="lg"
              className="mb-6"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Start Speed Test
                </>
              )}
            </Button>

            {/* Results */}
            <AnimatePresence>
              {results && !isRunning && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto"
                >
                  <div className="bg-blue-50 rounded-lg p-4">
                    <Download className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Download</p>
                    <p className={`text-2xl font-bold ${getSpeedColor(results.download)}`}>
                      {results.download} Mbps
                    </p>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <Upload className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Upload</p>
                    <p className={`text-2xl font-bold ${getSpeedColor(results.upload)}`}>
                      {results.upload} Mbps
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4">
                    <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Ping</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {results.ping} ms
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quality Assessment */}
            {results && !isRunning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${getSpeedQuality(results.download).color}`} />
                  <span className="font-medium">
                    {getSpeedQuality(results.download).label} Connection
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {results.recommendation}
                </p>
              </motion.div>
            )}
          </Card>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={animations.slideUp}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl font-bold text-gray-900">
                Speed Leaderboard
              </h2>
            </div>

            <div className="space-y-4">
              {leaderboard.map((cafe, index) => (
                <motion.div
                  key={cafe.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{cafe.badge?.icon}</span>
                      <span className="font-bold text-lg text-gray-900">
                        #{cafe.rank}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900">{cafe.name}</h3>
                      <p className="text-sm text-gray-600">{cafe.address}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-blue-500" />
                      <span className={`font-bold ${getSpeedColor(cafe.speed?.download || 0)}`}>
                        {cafe.speed?.download || 0} Mbps
                      </span>
                    </div>
                    {cafe.rating > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-600">
                          {cafe.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {leaderboard.length === 0 && (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No speed test data available yet.</p>
                <p className="text-sm text-gray-500">Be the first to test and claim the top spot!</p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default SpeedTestChart;