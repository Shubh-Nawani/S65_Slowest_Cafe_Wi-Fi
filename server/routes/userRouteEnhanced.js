const express = require('express');
const { 
    getUsers, 
    signup, 
    login, 
    verifyAdmin,
    validateUser
} = require('../controllers/userController');

const {
    getUserProfile,
    updateProfile,
    changePassword,
    getUserActivity,
    toggleFavorite,
    getFavorites,
    validateProfileUpdate,
    validatePasswordChange
} = require('../controllers/userEnhanced');

const { verifyToken, verifyAdmin: adminMiddleware, refreshToken } = require('../middleware/authEnhanced');

const router = express.Router();

// Public routes - authentication
router.post("/signup", validateUser, signup);
router.post("/login", validateUser, login);
router.post("/admin/verify", verifyAdmin);
router.post("/refresh-token", refreshToken);

// Protected routes - require user authentication
router.get("/profile", verifyToken, getUserProfile);
router.put("/profile", verifyToken, validateProfileUpdate, updateProfile);
router.put("/change-password", verifyToken, validatePasswordChange, changePassword);
router.get("/activity", verifyToken, getUserActivity);

// User favorites system
router.post("/favorites", verifyToken, toggleFavorite);
router.get("/favorites", verifyToken, getFavorites);

// Admin routes
router.get("/", adminMiddleware, getUsers);

module.exports = router;
