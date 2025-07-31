const { check, validationResult } = require('express-validator');
const Cafe = require('../models/cafeModel');

// Advanced café search with geolocation, filtering, and sorting
const getCafeAdvanced = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 50, 
            search = '', 
            sortBy = 'createdAt', 
            sortOrder = 'desc',
            latitude,
            longitude,
            radius = 10, // kilometers
            minRating = 0,
            maxRating = 5,
            isActive = true,
            wifiSpeedMin,
            wifiSpeedMax
        } = req.query;
        
        // Build comprehensive search query
        let searchQuery = {};
        
        // Text search
        if (search) {
            searchQuery.$or = [
                { name: { $regex: search, $options: 'i' } },
                { address: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Geolocation search
        if (latitude && longitude) {
            searchQuery.location = {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: radius * 1000 // Convert km to meters
                }
            };
        }
        
        // Rating filter
        if (minRating || maxRating) {
            searchQuery['rating.average'] = {};
            if (minRating) searchQuery['rating.average'].$gte = parseFloat(minRating);
            if (maxRating) searchQuery['rating.average'].$lte = parseFloat(maxRating);
        }
        
        // WiFi speed filter
        if (wifiSpeedMin || wifiSpeedMax) {
            searchQuery['wifiSpeed.download'] = {};
            if (wifiSpeedMin) searchQuery['wifiSpeed.download'].$gte = parseFloat(wifiSpeedMin);
            if (wifiSpeedMax) searchQuery['wifiSpeed.download'].$lte = parseFloat(wifiSpeedMax);
        }
        
        // Active status filter
        if (isActive !== undefined) {
            searchQuery.isActive = isActive === 'true';
        }
        
        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
        
        // Execute query with population of related data
        const cafes = await Cafe.find(searchQuery)
            .populate('addedBy', 'email')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit))
            .lean();
        
        // Add calculated fields
        const enrichedCafes = cafes.map(cafe => ({
            ...cafe,
            averageWifiSpeed: (cafe.wifiSpeed?.download + cafe.wifiSpeed?.upload) / 2 || 0,
            isSlowWifi: (cafe.wifiSpeed?.download || 0) < 5, // Less than 5 Mbps
            distanceFromUser: latitude && longitude && cafe.location?.coordinates 
                ? calculateDistance(
                    latitude, longitude, 
                    cafe.location.coordinates[1], cafe.location.coordinates[0]
                  )
                : null
        }));
        
        // Get total count for pagination
        const totalCafes = await Cafe.countDocuments(searchQuery);
        const totalPages = Math.ceil(totalCafes / parseInt(limit));
        
        // Analytics data
        const analytics = await generateCafeAnalytics(searchQuery);
        
        return res.status(200).json({
            message: 'Cafes retrieved successfully',
            cafes: enrichedCafes,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalCafes,
                hasNextPage: parseInt(page) < totalPages,
                hasPrevPage: parseInt(page) > 1,
                limit: parseInt(limit)
            },
            analytics,
            filters: {
                search,
                location: latitude && longitude ? { latitude, longitude, radius } : null,
                rating: { min: minRating, max: maxRating },
                wifiSpeed: { min: wifiSpeedMin, max: wifiSpeedMax }
            }
        });
    } catch (err) {
        console.error('Get cafes error:', err);
        return res.status(500).json({ 
            error: 'Failed to retrieve cafes',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round((R * c) * 100) / 100; // Distance in km, rounded to 2 decimal places
};

// Generate analytics data
const generateCafeAnalytics = async (baseQuery = {}) => {
    try {
        const [
            totalCafes,
            activeCafes,
            avgRating,
            avgWifiSpeed,
            topRatedCafes,
            recentCafes,
            locationDistribution
        ] = await Promise.all([
            Cafe.countDocuments(baseQuery),
            Cafe.countDocuments({ ...baseQuery, isActive: true }),
            Cafe.aggregate([
                { $match: baseQuery },
                { $group: { _id: null, avgRating: { $avg: '$rating.average' } } }
            ]),
            Cafe.aggregate([
                { $match: baseQuery },
                { $group: { _id: null, avgDownload: { $avg: '$wifiSpeed.download' } } }
            ]),
            Cafe.find({ ...baseQuery, 'rating.average': { $gte: 4 } })
                .sort({ 'rating.average': -1 })
                .limit(5)
                .select('name rating'),
            Cafe.countDocuments({
                ...baseQuery,
                createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            }),
            Cafe.aggregate([
                { $match: baseQuery },
                {
                    $group: {
                        _id: { $arrayElemAt: [{ $split: ["$address", ","] }, -1] },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ])
        ]);
        
        return {
            summary: {
                totalCafes,
                activeCafes,
                inactiveCafes: totalCafes - activeCafes,
                averageRating: avgRating[0]?.avgRating ? Math.round(avgRating[0].avgRating * 100) / 100 : 0,
                averageWifiSpeed: avgWifiSpeed[0]?.avgDownload ? Math.round(avgWifiSpeed[0].avgDownload * 100) / 100 : 0,
                recentAdditions: recentCafes
            },
            topRated: topRatedCafes,
            locationDistribution: locationDistribution.map(loc => ({
                area: loc._id?.trim() || 'Unknown',
                count: loc.count
            }))
        };
    } catch (err) {
        console.error('Analytics generation error:', err);
        return { error: 'Failed to generate analytics' };
    }
};

// Rating system for cafes
const rateCafe = async (req, res) => {
    try {
        const { cafeId, rating, review } = req.body;
        const userId = req.user._id;
        
        if (!cafeId || !rating) {
            return res.status(400).json({ error: 'Cafe ID and rating are required' });
        }
        
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }
        
        const cafe = await Cafe.findById(cafeId);
        if (!cafe) {
            return res.status(404).json({ error: 'Cafe not found' });
        }
        
        // Check if user already rated this cafe
        const existingRatingIndex = cafe.ratings?.findIndex(r => r.userId.toString() === userId.toString());
        
        if (existingRatingIndex !== -1) {
            // Update existing rating
            cafe.ratings[existingRatingIndex] = {
                userId,
                rating,
                review: review?.trim(),
                createdAt: new Date()
            };
        } else {
            // Add new rating
            if (!cafe.ratings) cafe.ratings = [];
            cafe.ratings.push({
                userId,
                rating,
                review: review?.trim(),
                createdAt: new Date()
            });
        }
        
        // Recalculate average rating
        const totalRatings = cafe.ratings.length;
        const sumRatings = cafe.ratings.reduce((sum, r) => sum + r.rating, 0);
        cafe.rating = {
            average: sumRatings / totalRatings,
            count: totalRatings
        };
        
        await cafe.save();
        
        return res.status(200).json({
            message: 'Rating submitted successfully',
            cafe: {
                id: cafe._id,
                name: cafe.name,
                rating: cafe.rating
            }
        });
    } catch (err) {
        console.error('Rating error:', err);
        return res.status(500).json({ error: 'Failed to submit rating' });
    }
};

// Get cafe reviews
const getCafeReviews = async (req, res) => {
    try {
        const { cafeId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        
        const cafe = await Cafe.findById(cafeId)
            .populate('ratings.userId', 'email firstName lastName')
            .lean();
        
        if (!cafe) {
            return res.status(404).json({ error: 'Cafe not found' });
        }
        
        const reviews = cafe.ratings || [];
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const paginatedReviews = reviews
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(skip, skip + parseInt(limit));
        
        return res.status(200).json({
            cafe: {
                id: cafe._id,
                name: cafe.name,
                rating: cafe.rating
            },
            reviews: paginatedReviews,
            pagination: {
                currentPage: parseInt(page),
                totalReviews: reviews.length,
                totalPages: Math.ceil(reviews.length / parseInt(limit))
            }
        });
    } catch (err) {
        console.error('Get reviews error:', err);
        return res.status(500).json({ error: 'Failed to retrieve reviews' });
    }
};

// WiFi speed test result submission
const submitSpeedTest = async (req, res) => {
    try {
        const { cafeId, download, upload, ping, deviceType, timestamp } = req.body;
        
        if (!cafeId || !download) {
            return res.status(400).json({ error: 'Cafe ID and download speed are required' });
        }
        
        const cafe = await Cafe.findById(cafeId);
        if (!cafe) {
            return res.status(404).json({ error: 'Cafe not found' });
        }
        
        // Initialize speed tests array if it doesn't exist
        if (!cafe.speedTests) cafe.speedTests = [];
        
        // Add new speed test result
        cafe.speedTests.push({
            userId: req.user?._id,
            download: parseFloat(download),
            upload: parseFloat(upload) || 0,
            ping: parseFloat(ping) || 0,
            deviceType: deviceType || 'unknown',
            timestamp: timestamp ? new Date(timestamp) : new Date()
        });
        
        // Keep only the last 50 speed tests
        if (cafe.speedTests.length > 50) {
            cafe.speedTests = cafe.speedTests.slice(-50);
        }
        
        // Update average WiFi speeds
        const recentTests = cafe.speedTests.slice(-10); // Last 10 tests
        const avgDownload = recentTests.reduce((sum, test) => sum + test.download, 0) / recentTests.length;
        const avgUpload = recentTests.reduce((sum, test) => sum + test.upload, 0) / recentTests.length;
        const avgPing = recentTests.reduce((sum, test) => sum + test.ping, 0) / recentTests.length;
        
        cafe.wifiSpeed = {
            download: Math.round(avgDownload * 100) / 100,
            upload: Math.round(avgUpload * 100) / 100,
            ping: Math.round(avgPing * 100) / 100,
            lastTested: new Date()
        };
        
        await cafe.save();
        
        return res.status(200).json({
            message: 'Speed test result submitted successfully',
            cafe: {
                id: cafe._id,
                name: cafe.name,
                wifiSpeed: cafe.wifiSpeed
            },
            isSlowWifi: avgDownload < 5
        });
    } catch (err) {
        console.error('Speed test submission error:', err);
        return res.status(500).json({ error: 'Failed to submit speed test' });
    }
};

module.exports = { 
    getCafeAdvanced,
    generateCafeAnalytics,
    calculateDistance,
    rateCafe,
    getCafeReviews,
    submitSpeedTest
};
