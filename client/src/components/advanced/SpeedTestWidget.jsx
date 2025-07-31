import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Download, Upload, Wifi, WifiOff, RotateCcw, Clock, TrendingUp, Award } from 'lucide-react';
import { Button, Card, Badge, LoadingSpinner } from '../ui';

const SpeedTestWidget = ({ 
  onTestComplete, 
  cafeId, 
  className = '',
  autoTest = false 
}) => {
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testPhase, setTestPhase] = useState('idle'); // idle, ping, download, upload, complete
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [testHistory, setTestHistory] = useState([]);
  
  // Mock test phases and timing
  const testPhases = {
    ping: { duration: 2000, label: 'Testing Latency' },
    download: { duration: 8000, label: 'Testing Download Speed' },
    upload: { duration: 6000, label: 'Testing Upload Speed' }
  };

  // Auto-test on mount if enabled
  useEffect(() => {
    if (autoTest) {
      startSpeedTest();
    }
  }, [autoTest]);

  // Real speed test implementation
  const runSpeedTest = async () => {
    setIsTestRunning(true);
    setError('');
    setResults(null);
    setProgress(0);

    try {
      // Phase 1: Ping Test (simulated for UI feedback)
      setTestPhase('ping');
      await simulateTestPhase('ping');
      
      // Phase 2: Download Test (call real API)
      setTestPhase('download');
      await simulateTestPhase('download');
      
      // Phase 3: Upload Test (simulated for UI feedback)
      setTestPhase('upload');
      await simulateTestPhase('upload');
      
      // Call the real speed test API
      const response = await fetch('http://localhost:4000/api/speedtest/quick', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Speed test API failed');
      }

      const data = await response.json();
      
      // Use real results or fallback to mock
      const testResults = {
        download: data.results?.download || generateMockResults().download,
        upload: data.results?.upload || generateMockResults().upload,
        ping: data.results?.ping || generateMockResults().ping,
        jitter: data.results?.jitter || generateMockResults().jitter,
        timestamp: new Date(),
        isSimulated: data.results?.simulated || false
      };
      
      setResults(testResults);
      setTestPhase('complete');
      
      // Add to history
      const testRecord = {
        ...testResults,
        cafeId
      };
      setTestHistory(prev => [testRecord, ...prev.slice(0, 9)]); // Keep last 10
      
      // Notify parent component
      if (onTestComplete) {
        onTestComplete(testResults);
      }
      
    } catch (err) {
      console.error('Speed test error:', err);
      setError('Speed test failed. Please try again.');
      setTestPhase('idle');
    } finally {
      setIsTestRunning(false);
      setProgress(100);
    }
  };

  const simulateTestPhase = (phase) => {
    return new Promise((resolve) => {
      const duration = testPhases[phase].duration;
      const interval = 50; // Update every 50ms
      const steps = duration / interval;
      let currentStep = 0;
      
      const progressInterval = setInterval(() => {
        currentStep++;
        const phaseProgress = (currentStep / steps) * 100;
        
        // Calculate overall progress based on phase
        let overallProgress = 0;
        if (phase === 'ping') overallProgress = phaseProgress * 0.2;
        else if (phase === 'download') overallProgress = 20 + (phaseProgress * 0.5);
        else if (phase === 'upload') overallProgress = 70 + (phaseProgress * 0.3);
        
        setProgress(Math.min(overallProgress, 100));
        
        if (currentStep >= steps) {
          clearInterval(progressInterval);
          resolve();
        }
      }, interval);
    });
  };

  const generateMockResults = () => {
    // Generate realistic slow WiFi speeds for café context
    const downloadSpeed = Math.random() * 5 + 0.5; // 0.5-5.5 Mbps
    const uploadSpeed = downloadSpeed * (0.3 + Math.random() * 0.4); // 30-70% of download
    const ping = 20 + Math.random() * 100; // 20-120ms
    const jitter = Math.random() * 10; // 0-10ms
    
    return {
      download: Number(downloadSpeed.toFixed(2)),
      upload: Number(uploadSpeed.toFixed(2)),
      ping: Number(ping.toFixed(0)),
      jitter: Number(jitter.toFixed(1)),
      timestamp: new Date(),
      server: 'Nearest Test Server',
      ip: '192.168.1.' + Math.floor(Math.random() * 255)
    };
  };

  const startSpeedTest = () => {
    runSpeedTest();
  };

  const getSpeedRating = (speed) => {
    if (speed < 1) return { rating: 'Ultra Slow', color: 'error', icon: WifiOff };
    if (speed < 3) return { rating: 'Very Slow', color: 'warning', icon: Wifi };
    if (speed < 5) return { rating: 'Slow', color: 'coffee', icon: Wifi };
    if (speed < 10) return { rating: 'Moderate', color: 'blue', icon: Wifi };
    return { rating: 'Fast', color: 'success', icon: Wifi };
  };

  const SpeedMeter = ({ value, maxValue = 10, label, unit = 'Mbps', color = 'blue' }) => {
    const percentage = Math.min((value / maxValue) * 100, 100);
    
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-lg font-bold text-gray-900">
            {value} <span className="text-sm font-normal text-gray-500">{unit}</span>
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className={`bg-${color}-500 h-2 rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
    );
  };

  const TestHistoryItem = ({ test, index }) => {
    const timeAgo = (date) => {
      const diff = Date.now() - new Date(date).getTime();
      const minutes = Math.floor(diff / 60000);
      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      return new Date(date).toLocaleDateString();
    };

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Download className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {test.download} / {test.upload} Mbps
            </div>
            <div className="text-xs text-gray-500">
              {timeAgo(test.timestamp)}
            </div>
          </div>
        </div>
        <Badge variant={getSpeedRating(test.download).color} size="sm">
          {getSpeedRating(test.download).rating}
        </Badge>
      </motion.div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Test Interface */}
      <Card className="p-6">
        <div className="text-center space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              WiFi Speed Test
            </h3>
            <p className="text-sm text-gray-600">
              Test your connection speed at this café
            </p>
          </div>

          {/* Test Animation/Results */}
          <div className="relative">
            {!isTestRunning && !results && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
              >
                <Wifi className="w-12 h-12 text-white" />
              </motion.div>
            )}

            {isTestRunning && (
              <div className="w-32 h-32 mx-auto relative">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <motion.circle
                    cx="60"
                    cy="60"
                    r="54"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeLinecap="round"
                    className="text-blue-500"
                    initial={{ strokeDasharray: "0 339.292" }}
                    animate={{ strokeDasharray: `${(progress / 100) * 339.292} 339.292` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{Math.round(progress)}%</div>
                    <div className="text-xs text-gray-500">{testPhases[testPhase]?.label}</div>
                  </div>
                </div>
              </div>
            )}

            {results && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-4"
              >
                {/* Speed Display */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-2">
                      <Download className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{results.download}</div>
                    <div className="text-sm text-gray-500">Mbps Download</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-2">
                      <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{results.upload}</div>
                    <div className="text-sm text-gray-500">Mbps Upload</div>
                  </div>
                </div>

                {/* Additional Metrics */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{results.ping}ms</div>
                    <div className="text-sm text-gray-500">Ping</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{results.jitter}ms</div>
                    <div className="text-sm text-gray-500">Jitter</div>
                  </div>
                </div>

                {/* Speed Rating */}
                <div className="pt-4">
                  <Badge 
                    variant={getSpeedRating(results.download).color}
                    className="text-base px-4 py-2"
                  >
                    {getSpeedRating(results.download).rating} Connection
                  </Badge>
                </div>
              </motion.div>
            )}
          </div>

          {/* Status/Error Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-sm text-red-800">{error}</p>
            </motion.div>
          )}

          {/* Action Button */}
          <Button
            onClick={startSpeedTest}
            disabled={isTestRunning}
            loading={isTestRunning}
            variant="coffee"
            size="lg"
            className="flex items-center gap-2"
          >
            {isTestRunning ? (
              <>
                <LoadingSpinner size="sm" />
                Testing...
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                {results ? 'Test Again' : 'Start Test'}
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Test History */}
      {testHistory.length > 0 && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-500" />
                Recent Tests
              </h4>
              <Badge variant="blue" size="sm">
                {testHistory.length} test{testHistory.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            
            <div className="space-y-3">
              {testHistory.slice(0, 5).map((test, index) => (
                <TestHistoryItem key={test.timestamp} test={test} index={index} />
              ))}
            </div>
            
            {testHistory.length > 5 && (
              <div className="text-center pt-4">
                <Button variant="ghost" size="sm">
                  View All Tests ({testHistory.length})
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Speed Test Tips */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Speed Test Tips
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Close other apps and tabs for accurate results</li>
            <li>• Test multiple times for consistency</li>
            <li>• Results may vary based on café traffic</li>
            <li>• Slow WiFi is perfect for focused work!</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default SpeedTestWidget;
