const { check, validationResult } = require('express-validator');
const User = require('../models/userModel');
const Cafe = require('../models/cafeModel');
const bcrypt = require('bcrypt');
const { generateToken } = require('../middleware/authEnhanced');

// Enhanced user profile with activity tracking
const getUserProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Get user with additional profile data
        const user = await User.findById(userId).select('-password').lean();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Get user's café contributions
        const userCafes = await Cafe.find({ addedBy: userId })
            .select('name address rating createdAt')
            .lean();
        
        // Get user's ratings
        const cafesWithUserRatings = await Cafe.find({ 
            'ratings.userId': userId 
        }).select('name ratings').lean();
        
        const userRatings = cafesWithUserRatings.map(cafe => {
            const rating = cafe.ratings.find(r => r.userId.toString() === userId.toString());
            return {
                cafeId: cafe._id,
                cafeName: cafe.name,
                rating: rating.rating,
                review: rating.review,
                createdAt: rating.createdAt
            };
        });
        
        // Calculate user statistics
        const stats = {
            cafesAdded: userCafes.length,
            ratingsGiven: userRatings.length,
            averageRatingGiven: userRatings.length > 0 
                ? Math.round((userRatings.reduce((sum, r) => sum + r.rating, 0) / userRatings.length) * 100) / 100
                : 0,
            joinedDaysAgo: Math.floor((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)),
            lastActiveAgo: Math.floor((Date.now() - new Date(user.lastLogin)) / (1000 * 60 * 60 * 24))
        };
        
        return res.status(200).json({
            message: 'Profile retrieved successfully',
            user: {
                ...user,
                stats,
                cafes: userCafes,
                ratings: userRatings
            }
        });
    } catch (err) {
        console.error('Profile retrieval error:', err);
        return res.status(500).json({ error: 'Failed to retrieve profile' });
    }
};

// Enhanced profile update with detailed validation
const updateProfile = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const { 
            email, 
            firstName, 
            lastName, 
            preferences,
            notifications,
            bio,
            location 
        } = req.body;
        const userId = req.user._id;
        
        // Check if email is already taken by another user
        if (email) {
            const existingUser = await User.findOne({ 
                email: email.toLowerCase(), 
                _id: { $ne: userId } 
            });
            
            if (existingUser) {
                return res.status(409).json({ 
                    error: 'Email already taken by another user' 
                });
            }
        }
        
        // Prepare update data
        const updateData = {};
        if (email) updateData.email = email.toLowerCase();
        if (firstName !== undefined) updateData.firstName = firstName?.trim();
        if (lastName !== undefined) updateData.lastName = lastName?.trim();
        if (bio !== undefined) updateData.bio = bio?.trim();
        if (location !== undefined) updateData.location = location?.trim();
        
        // Handle preferences update
        if (preferences) {
            updateData.preferences = {
                ...req.user.preferences,
                ...preferences
            };
        }
        
        // Handle notifications settings
        if (notifications) {
            updateData.notifications = {
                ...req.user.notifications,
                ...notifications
            };
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');
        
        return res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
        
    } catch (err) {
        console.error('Profile update error:', err);
        if (err.code === 11000) {
            return res.status(409).json({ error: 'Email already exists' });
        }
        return res.status(500).json({ error: 'Failed to update profile' });
    }
};

// Enhanced password change with security validation
const changePassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user._id;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }
        
        // Check if new password is different from current
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({ error: 'New password must be different from current password' });
        }
        
        // Hash new password
        const saltRounds = 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
        
        // Update password and security fields
        await User.findByIdAndUpdate(userId, {
            password: hashedNewPassword,
            passwordChangedAt: new Date(),
            // Optionally force re-login by incrementing a token version
            tokenVersion: (user.tokenVersion || 0) + 1
        });
        
        return res.status(200).json({
            message: 'Password changed successfully',
            hint: 'Please log in again with your new password'
        });
        
    } catch (err) {
        console.error('Password change error:', err);
        return res.status(500).json({ error: 'Failed to change password' });
    }
};

// User activity dashboard
const getUserActivity = async (req, res) => {
    try {
        const userId = req.user._id;
        const { timeRange = '30d' } = req.query;
        
        // Calculate date range
        const ranges = {
            '7d': 7 * 24 * 60 * 60 * 1000,
            '30d': 30 * 24 * 60 * 60 * 1000,
            '90d': 90 * 24 * 60 * 60 * 1000
        };
        
        const timeRangeMs = ranges[timeRange] || ranges['30d'];
        const startDate = new Date(Date.now() - timeRangeMs);
        
        // Get activity data
        const [
            recentCafes,
            recentRatings,
            speedTestContributions
        ] = await Promise.all([
            // Recent cafes added
            Cafe.find({ 
                addedBy: userId, 
                createdAt: { $gte: startDate } 
            }).select('name address createdAt').sort({ createdAt: -1 }),
            
            // Recent ratings given
            Cafe.find({ 
                'ratings.userId': userId,
                'ratings.createdAt': { $gte: startDate }
            }).select('name ratings').lean(),
            
            // Speed test contributions
            Cafe.find({
                'speedTests.userId': userId,
                'speedTests.timestamp': { $gte: startDate }
            }).select('name speedTests').lean()
        ]);
        
        // Process recent ratings
        const processedRatings = recentRatings.map(cafe => {
            const userRating = cafe.ratings.find(r => 
                r.userId.toString() === userId.toString() && 
                new Date(r.createdAt) >= startDate
            );
            return {
                cafeId: cafe._id,
                cafeName: cafe.name,
                rating: userRating.rating,
                review: userRating.review,
                createdAt: userRating.createdAt
            };
        });
        
        // Process speed test contributions
        const processedSpeedTests = speedTestContributions.map(cafe => {
            const userTests = cafe.speedTests.filter(test => 
                test.userId?.toString() === userId.toString() && 
                new Date(test.timestamp) >= startDate
            );
            return {
                cafeId: cafe._id,
                cafeName: cafe.name,
                tests: userTests
            };
        }).filter(cafe => cafe.tests.length > 0);
        
        return res.status(200).json({
            message: 'User activity retrieved successfully',
            timeRange,
            activity: {
                cafesAdded: recentCafes,
                ratingsGiven: processedRatings,
                speedTestsSubmitted: processedSpeedTests,
                summary: {
                    totalCafes: recentCafes.length,
                    totalRatings: processedRatings.length,
                    totalSpeedTests: processedSpeedTests.reduce((sum, cafe) => sum + cafe.tests.length, 0)
                }
            }
        });
    } catch (err) {
        console.error('Activity retrieval error:', err);
        return res.status(500).json({ error: 'Failed to retrieve activity' });
    }
};

// User favorites system
const toggleFavorite = async (req, res) => {
    try {
        const { cafeId } = req.body;
        const userId = req.user._id;
        
        if (!cafeId) {
            return res.status(400).json({ error: 'Cafe ID is required' });
        }
        
        const cafe = await Cafe.findById(cafeId);
        if (!cafe) {
            return res.status(404).json({ error: 'Cafe not found' });
        }
        
        const user = await User.findById(userId);
        
        // Initialize favorites array if it doesn't exist
        if (!user.favorites) user.favorites = [];
        
        const favoriteIndex = user.favorites.indexOf(cafeId);
        let action;
        
        if (favoriteIndex > -1) {
            // Remove from favorites
            user.favorites.splice(favoriteIndex, 1);
            action = 'removed';
        } else {
            // Add to favorites
            user.favorites.push(cafeId);
            action = 'added';
        }
        
        await user.save();
        
        return res.status(200).json({
            message: `Cafe ${action} ${action === 'added' ? 'to' : 'from'} favorites`,
            action,
            cafe: {
                id: cafe._id,
                name: cafe.name
            },
            totalFavorites: user.favorites.length
        });
    } catch (err) {
        console.error('Toggle favorite error:', err);
        return res.status(500).json({ error: 'Failed to update favorites' });
    }
};

// Get user's favorite cafes
const getFavorites = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const user = await User.findById(userId)
            .populate({
                path: 'favorites',
                select: 'name address rating wifiSpeed isActive',
                match: { isActive: true }
            });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        return res.status(200).json({
            message: 'Favorites retrieved successfully',
            favorites: user.favorites || [],
            count: (user.favorites || []).length
        });
    } catch (err) {
        console.error('Get favorites error:', err);
        return res.status(500).json({ error: 'Failed to retrieve favorites' });
    }
};

// Enhanced validation rules
const validateProfileUpdate = [
    check('email')
        .optional()
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail(),
    check('firstName')
        .optional()
        .isLength({ max: 50 })
        .withMessage('First name cannot exceed 50 characters'),
    check('lastName')
        .optional()
        .isLength({ max: 50 })
        .withMessage('Last name cannot exceed 50 characters'),
    check('bio')
        .optional()
        .isLength({ max: 200 })
        .withMessage('Bio cannot exceed 200 characters'),
    check('location')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Location cannot exceed 100 characters')
];

const validatePasswordChange = [
    check('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    check('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

module.exports = {
    getUserProfile,
    updateProfile,
    changePassword,
    getUserActivity,
    toggleFavorite,
    getFavorites,
    validateProfileUpdate,
    validatePasswordChange
};
