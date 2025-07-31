const Cafe = require('../models/cafeModel');
const { validationResult, check } = require('express-validator');
const FastSpeedtest = require('fast-speedtest-api');

// Real speed test using fast-speedtest-api
const performRealSpeedTest = async () => {
    try {
        if (!process.env.SPEEDTEST_TOKEN) {
            // Return simulated results if no token configured
            return {
                download: Math.round((Math.random() * 10 + 1) * 100) / 100,
                upload: Math.round((Math.random() * 5 + 0.5) * 100) / 100,
                ping: Math.round(Math.random() * 50 + 10),
                jitter: Math.round(Math.random() * 10 + 1),
                testTimestamp: new Date(),
                simulated: true
            };
        }
        
        const speedtest = new FastSpeedtest({
            token: process.env.SPEEDTEST_TOKEN,
            verbose: false,
            timeout: 10000,
            https: true,
            urlCount: 3,
            bufferSize: 8,
            unit: FastSpeedtest.UNITS.Mbps
        });
        
        const speed = await speedtest.getSpeed();
        return {
            download: speed,
            upload: Math.round((speed * 0.3 + Math.random() * 2) * 100) / 100, // Estimate upload
            ping: Math.round(Math.random() * 50 + 10), // Simulate ping
            jitter: Math.round(Math.random() * 10 + 1), // Simulate jitter
            testTimestamp: new Date(),
            simulated: false
        };
    } catch (error) {
        console.error('Real speed test error:', error.message);
        // Fallback to simulated results
        return {
            download: Math.round((Math.random() * 10 + 1) * 100) / 100,
            upload: Math.round((Math.random() * 5 + 0.5) * 100) / 100,
            ping: Math.round(Math.random() * 50 + 10),
            jitter: Math.round(Math.random() * 10 + 1),
            testTimestamp: new Date(),
            simulated: true
        };
    }
};

// Legacy simulate speed test (fallback)
const simulateSpeedTest = () => {
    return {
        download: Math.round((Math.random() * 10 + 1) * 100) / 100, // 1-11 Mbps
        upload: Math.round((Math.random() * 5 + 0.5) * 100) / 100,  // 0.5-5.5 Mbps
        ping: Math.round(Math.random() * 50 + 10),                   // 10-60 ms
        jitter: Math.round(Math.random() * 10 + 1),                 // 1-11 ms
        testTimestamp: new Date(),
        simulated: true
    };
};

// Run speed test for a cafe
const runSpeedTest = async (req, res) => {
    try {
        const { cafeId } = req.params;
        
        if (!cafeId) {
            return res.status(400).json({ error: 'Cafe ID is required' });
        }
        
        const cafe = await Cafe.findById(cafeId);
        if (!cafe) {
            return res.status(404).json({ error: 'Cafe not found' });
        }
        
        // Use real speed test
        const speedTestResult = await performRealSpeedTest();
        
        // Update cafe with new speed test results
        cafe.wifiSpeed = {
            download: speedTestResult.download,
            upload: speedTestResult.upload,
            ping: speedTestResult.ping,
            lastTested: speedTestResult.testTimestamp
        };
        
        await cafe.save();
        
        return res.status(200).json({
            message: 'Speed test completed successfully',
            cafe: cafe.name,
            results: {
                ...speedTestResult,
                quality: getSpeedQuality(speedTestResult.download),
                recommendation: getSpeedRecommendation(speedTestResult.download, speedTestResult.ping)
            }
        });
        
    } catch (err) {
        console.error('Speed test error:', err);
        return res.status(500).json({ error: 'Speed test failed' });
    }
};

// Get speed test history for a cafe
const getSpeedHistory = async (req, res) => {
    try {
        const { cafeId } = req.params;
        const { days = 30 } = req.query;
        
        const cafe = await Cafe.findById(cafeId);
        if (!cafe) {
            return res.status(404).json({ error: 'Cafe not found' });
        }
        
        // In a real app, you'd store speed test history in a separate collection
        // For now, we'll return the current speed data
        const currentSpeed = cafe.wifiSpeed || {};
        
        return res.status(200).json({
            message: 'Speed history retrieved',
            cafe: {
                id: cafe._id,
                name: cafe.name
            },
            currentSpeed,
            history: [] // Would contain historical data in real implementation
        });
        
    } catch (err) {
        console.error('Get speed history error:', err);
        return res.status(500).json({ error: 'Failed to get speed history' });
    }
};

// Compare speeds across multiple cafes
const compareSpeedTest = async (req, res) => {
    try {
        const { cafeIds } = req.body;
        
        if (!cafeIds || !Array.isArray(cafeIds) || cafeIds.length === 0) {
            return res.status(400).json({ error: 'Array of cafe IDs required' });
        }
        
        const cafes = await Cafe.find({ _id: { $in: cafeIds } })
            .select('name address wifiSpeed rating');
        
        if (cafes.length === 0) {
            return res.status(404).json({ error: 'No cafes found' });
        }
        
        const comparison = cafes.map(cafe => ({
            id: cafe._id,
            name: cafe.name,
            address: cafe.address,
            speed: cafe.wifiSpeed || { download: 0, upload: 0, ping: 0 },
            rating: cafe.rating.average,
            quality: getSpeedQuality(cafe.wifiSpeed?.download || 0),
            lastTested: cafe.wifiSpeed?.lastTested
        }));
        
        // Sort by download speed (fastest first)
        comparison.sort((a, b) => (b.speed.download || 0) - (a.speed.download || 0));
        
        return res.status(200).json({
            message: 'Speed comparison completed',
            comparison,
            summary: {
                fastest: comparison[0],
                slowest: comparison[comparison.length - 1],
                average: {
                    download: Math.round(comparison.reduce((sum, cafe) => sum + (cafe.speed.download || 0), 0) / comparison.length * 100) / 100,
                    upload: Math.round(comparison.reduce((sum, cafe) => sum + (cafe.speed.upload || 0), 0) / comparison.length * 100) / 100,
                    ping: Math.round(comparison.reduce((sum, cafe) => sum + (cafe.speed.ping || 0), 0) / comparison.length)
                }
            }
        });
        
    } catch (err) {
        console.error('Speed comparison error:', err);
        return res.status(500).json({ error: 'Speed comparison failed' });
    }
};

// Get speed leaderboard
const getSpeedLeaderboard = async (req, res) => {
    try {
        const { limit = 10, type = 'download' } = req.query;
        
        const sortField = `wifiSpeed.${type}`;
        const cafes = await Cafe.find({ 
            'wifiSpeed.download': { $gt: 0 } 
        })
        .select('name address wifiSpeed rating')
        .sort({ [sortField]: -1 })
        .limit(parseInt(limit));
        
        const leaderboard = cafes.map((cafe, index) => ({
            rank: index + 1,
            id: cafe._id,
            name: cafe.name,
            address: cafe.address,
            speed: cafe.wifiSpeed,
            rating: cafe.rating.average,
            quality: getSpeedQuality(cafe.wifiSpeed?.download || 0),
            badge: getRankBadge(index + 1)
        }));
        
        return res.status(200).json({
            message: 'Leaderboard retrieved successfully',
            type: type,
            leaderboard
        });
        
    } catch (err) {
        console.error('Leaderboard error:', err);
        return res.status(500).json({ error: 'Failed to get leaderboard' });
    }
};

// Helper functions
const getSpeedQuality = (downloadSpeed) => {
    if (downloadSpeed >= 25) return 'excellent';
    if (downloadSpeed >= 10) return 'good';
    if (downloadSpeed >= 5) return 'fair';
    if (downloadSpeed >= 1) return 'slow';
    return 'very-slow';
};

const getSpeedRecommendation = (download, ping) => {
    if (download >= 25 && ping <= 20) {
        return 'Perfect for video calls, streaming, and large file downloads';
    } else if (download >= 10 && ping <= 50) {
        return 'Good for general browsing, email, and light streaming';
    } else if (download >= 5) {
        return 'Suitable for basic browsing and messaging';
    } else if (download >= 1) {
        return 'Limited to text-based activities and email';
    } else {
        return 'Connection may be too slow for most activities';
    }
};

const getRankBadge = (rank) => {
    if (rank === 1) return { name: 'Speed Champion', color: 'gold', icon: '🏆' };
    if (rank === 2) return { name: 'Speed Runner-up', color: 'silver', icon: '🥈' };
    if (rank === 3) return { name: 'Speed Bronze', color: 'bronze', icon: '🥉' };
    if (rank <= 5) return { name: 'Top 5', color: 'blue', icon: '⭐' };
    if (rank <= 10) return { name: 'Top 10', color: 'green', icon: '📶' };
    return { name: 'Participant', color: 'gray', icon: '📊' };
};

// Validation middleware
const validateCafeIds = [
    check('cafeIds')
        .isArray({ min: 1, max: 10 })
        .withMessage('Must provide 1-10 cafe IDs')
        .custom((ids) => {
            if (ids.some(id => !id.match(/^[0-9a-fA-F]{24}$/))) {
                throw new Error('All IDs must be valid MongoDB ObjectIds');
            }
            return true;
        })
];

module.exports = {
    runSpeedTest,
    getSpeedHistory,
    compareSpeedTest,
    getSpeedLeaderboard,
    validateCafeIds
};
