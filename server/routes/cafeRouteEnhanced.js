const express = require('express');
const { 
    getCafe, 
    getCafeById,
    getCafeStats,
    addCafe, 
    updateCafe, 
    deleteCafe,
    bulkDeleteCafes,
    validateCafe, 
    validateCafeId,
    validateBulkDelete
} = require('../controllers/cafeController');

const {
    getCafeAdvanced,
    rateCafe,
    getCafeReviews,
    submitSpeedTest
} = require('../controllers/advancedFeatures');

const { optionalAuth, verifyToken, verifyAdmin } = require('../middleware/authEnhanced');

const router = express.Router();

// Public routes - no authentication required
router.get('/cafes', optionalAuth, getCafe);
router.get('/cafes/advanced', optionalAuth, getCafeAdvanced); // Enhanced search
router.get('/cafes/stats', getCafeStats);
router.get('/cafes/:id', getCafeById);
router.get('/cafes/:cafeId/reviews', getCafeReviews);

// Protected routes - require user authentication
router.post('/cafes', verifyToken, validateCafe, addCafe);
router.put('/cafes', verifyToken, [...validateCafe, ...validateCafeId], updateCafe);
router.delete('/cafes', verifyToken, validateCafeId, deleteCafe);

// Advanced features - require authentication
router.post('/cafes/rate', verifyToken, rateCafe);
router.post('/cafes/speed-test', verifyToken, submitSpeedTest);

// Admin only routes
router.delete('/cafes/bulk', verifyAdmin, validateBulkDelete, bulkDeleteCafes);

module.exports = router;
