const express = require('express');
const {
    runSpeedTest,
    getSpeedHistory,
    compareSpeedTest,
    getSpeedLeaderboard,
    validateCafeIds
} = require('../controllers/speedTestController');
const { optionalAuth, verifyToken } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/leaderboard', getSpeedLeaderboard);
router.get('/history/:cafeId', getSpeedHistory);

// Protected routes
router.post('/run/:cafeId', verifyToken, runSpeedTest);
router.post('/compare', optionalAuth, validateCafeIds, compareSpeedTest);

module.exports = router;
