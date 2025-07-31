const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map();

// Advanced JWT token generation with additional claims
const generateToken = (userId, type = 'access', additionalClaims = {}) => {
    const payload = {
        userId,
        type,
        issued: Date.now(),
        ...additionalClaims
    };
    
    const options = {
        expiresIn: type === 'refresh' ? '30d' : '7d',
        issuer: 'slowest-cafe-wifi',
        audience: 'cafe-users'
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', options);
};

// Rate limiting function
const checkRateLimit = (identifier, maxRequests = 10, windowMs = 15 * 60 * 1000) => {
    const now = Date.now();
    const key = identifier;
    
    if (!rateLimitStore.has(key)) {
        rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
        return { allowed: true, remaining: maxRequests - 1 };
    }
    
    const limit = rateLimitStore.get(key);
    
    if (now > limit.resetTime) {
        rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
        return { allowed: true, remaining: maxRequests - 1 };
    }
    
    if (limit.count >= maxRequests) {
        return { 
            allowed: false, 
            remaining: 0, 
            resetTime: limit.resetTime 
        };
    }
    
    limit.count++;
    return { allowed: true, remaining: maxRequests - limit.count };
};

// Enhanced token verification with security checks
const verifyToken = async (req, res, next) => {
    try {
        // Rate limiting by IP
        const clientIP = req.ip || req.connection.remoteAddress;
        const rateLimit = checkRateLimit(`auth:${clientIP}`, 100, 15 * 60 * 1000);
        
        if (!rateLimit.allowed) {
            return res.status(429).json({ 
                error: 'Too many authentication attempts',
                retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
            });
        }
        
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                error: 'Access token required',
                hint: 'Include Bearer token in Authorization header'
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Verify token type
        if (decoded.type && decoded.type !== 'access') {
            return res.status(401).json({ error: 'Invalid token type' });
        }
        
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid token - user not found' });
        }
        
        if (!user.isActive) {
            return res.status(401).json({ error: 'Account is deactivated' });
        }
        
        // Update last activity
        user.lastLogin = new Date();
        await user.save();

        req.user = user;
        req.tokenPayload = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Token expired',
                code: 'TOKEN_EXPIRED',
                hint: 'Please log in again'
            });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                error: 'Invalid token',
                code: 'INVALID_TOKEN'
            });
        }
        return res.status(500).json({ error: 'Token verification failed' });
    }
};

// Enhanced admin verification with multiple security layers
const verifyAdmin = async (req, res, next) => {
    try {
        const adminKey = req.headers['x-admin-key'] || req.body.adminKey;
        const clientIP = req.ip || req.connection.remoteAddress;
        
        // Rate limiting for admin attempts
        const rateLimit = checkRateLimit(`admin:${clientIP}`, 5, 15 * 60 * 1000);
        
        if (!rateLimit.allowed) {
            return res.status(429).json({ 
                error: 'Too many admin authentication attempts',
                retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
            });
        }
        
        const validAdminKeys = [
            'admin123', 
            'super-admin-2024',
            process.env.ADMIN_KEY
        ].filter(Boolean);
        
        if (!adminKey || !validAdminKeys.includes(adminKey)) {
            return res.status(403).json({ 
                error: 'Invalid admin credentials',
                attempts: rateLimit.remaining 
            });
        }
        
        req.isAdmin = true;
        req.adminLevel = adminKey === 'super-admin-2024' ? 'super' : 'standard';
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
            if (user && user.isActive) {
                req.user = user;
                req.isAuthenticated = true;
            }
        }
        
        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};

// Refresh token functionality
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(401).json({ error: 'Refresh token required' });
        }
        
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'your-secret-key');
        
        if (decoded.type !== 'refresh') {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }
        
        const user = await User.findById(decoded.userId);
        if (!user || !user.isActive) {
            return res.status(401).json({ error: 'Invalid user' });
        }
        
        const newAccessToken = generateToken(user._id, 'access');
        const newRefreshToken = generateToken(user._id, 'refresh');
        
        res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            user: {
                id: user._id,
                email: user.email
            }
        });
    } catch (error) {
        res.status(401).json({ error: 'Invalid refresh token' });
    }
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
};

module.exports = {
    generateToken,
    verifyToken,
    verifyAdmin,
    optionalAuth,
    refreshToken,
    securityHeaders,
    checkRateLimit
};
