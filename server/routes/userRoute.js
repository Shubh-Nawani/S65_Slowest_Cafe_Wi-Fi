const express = require('express');
const { 
    getUsers, 
    getUserProfile,
    signup, 
    login, 
    verifyAdmin,
    updateProfile,
    changePassword,
    deleteAccount,
    validateUser,
    validateProfileUpdate,
    validatePasswordChange
} = require('../controllers/userController');
const { verifyToken, verifyAdmin: adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post("/signup", validateUser, signup);
router.post("/login", validateUser, login);
router.post("/admin/verify", verifyAdmin);

// Protected routes (require authentication)
router.get("/profile", verifyToken, getUserProfile);
router.put("/profile", verifyToken, validateProfileUpdate, updateProfile);
router.put("/change-password", verifyToken, validatePasswordChange, changePassword);
router.delete("/account", verifyToken, deleteAccount);

// Admin routes
router.get("/", adminMiddleware, getUsers);

module.exports = router;