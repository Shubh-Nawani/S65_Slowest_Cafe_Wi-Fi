const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
    );
};

// Verify JWT token middleware
const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid token - user not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        return res.status(500).json({ error: 'Token verification failed' });
    }
};

// Admin verification middleware
const verifyAdmin = async (req, res, next) => {
    try {
        // For demo purposes, we'll use a simple admin key check
        const adminKey = req.headers['x-admin-key'] || req.body.adminKey;
        const validAdminKeys = ['admin123', 'super-admin-2024'];
        
        if (!adminKey || !validAdminKeys.includes(adminKey)) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        req.isAdmin = true;
        next();
    } catch (error) {
        return res.status(500).json({ error: 'Admin verification failed' });
    }
};

// Optional authentication - proceeds even if no token
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            const user = await User.findById(decoded.userId).select('-password');
            req.user = user;
        }
        
        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};

module.exports = {
    generateToken,
    verifyToken,
    verifyAdmin,
    optionalAuth
};
