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
const { optionalAuth, verifyToken } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/cafes', optionalAuth, getCafe);
router.get('/cafes/stats', getCafeStats);
router.get('/cafes/:id', getCafeById);

// Protected routes (require authentication)
router.post('/cafes', verifyToken, validateCafe, addCafe);
router.put('/cafes', verifyToken, [...validateCafe, ...validateCafeId], updateCafe);
router.delete('/cafes', verifyToken, validateCafeId, deleteCafe);
router.delete('/cafes/bulk', verifyToken, validateBulkDelete, bulkDeleteCafes);

module.exports = router;
