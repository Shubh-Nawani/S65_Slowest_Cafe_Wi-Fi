const { check, validationResult } = require('express-validator');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const { generateToken } = require('../middleware/auth');

// Get all users (admin only)
const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        return res.status(200).json({
            message: 'Users retrieved successfully',
            count: users.length,
            users
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Get current user profile
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        return res.status(200).json({
            message: 'Profile retrieved successfully',
            user
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// User Signup with Validation
const signup = async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, password } = req.body;

        // Validate input exists
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required!" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: "User already exists!" });
        }

        // Hash password
        const saltRounds = 12;
        const hash = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = new User({
            email,
            password: hash
        });

        await newUser.save();
        
        // Generate JWT token
        const token = generateToken(newUser._id);
        
        return res.status(201).json({ 
            message: "User created successfully!",
            token,
            user: {
                id: newUser._id,
                email: newUser.email,
                createdAt: newUser.createdAt
            }
        });

    } catch (err) {
        console.error('Signup error:', err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// User Login with Validation
const login = async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, password } = req.body;

        // Validate input exists
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required!" });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(401).json({ error: "Invalid credentials!" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials!" });
        }

        // Generate JWT token
        const token = generateToken(existingUser._id);
        
        return res.status(200).json({ 
            message: "Login successful!",
            token,
            user: {
                id: existingUser._id,
                email: existingUser.email,
                lastLogin: new Date()
            }
        });

    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// Admin verification endpoint
const verifyAdmin = async (req, res) => {
    try {
        const { adminKey } = req.body;
        const validAdminKeys = ['admin123', 'super-admin-2024'];
        
        if (!adminKey || !validAdminKeys.includes(adminKey)) {
            return res.status(401).json({ 
                error: 'Invalid admin key',
                isAdmin: false 
            });
        }
        
        // Generate admin token
        const adminToken = generateToken('admin-user');
        
        return res.status(200).json({
            message: 'Admin verification successful',
            isAdmin: true,
            adminName: adminKey === 'admin123' ? 'Demo Admin' : 'Super Admin',
            token: adminToken
        });
        
    } catch (err) {
        console.error('Admin verification error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const { email } = req.body;
        const userId = req.user._id;
        
        // Check if email is already taken by another user
        if (email) {
            const existingUser = await User.findOne({ 
                email, 
                _id: { $ne: userId } 
            });
            
            if (existingUser) {
                return res.status(409).json({ error: 'Email already taken' });
            }
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { email },
            { new: true, runValidators: true }
        ).select('-password');
        
        return res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
        
    } catch (err) {
        console.error('Profile update error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Change password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user._id;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                error: 'Current password and new password are required' 
            });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }
        
        // Hash new password
        const saltRounds = 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
        
        // Update password
        user.password = hashedNewPassword;
        await user.save();
        
        return res.status(200).json({
            message: 'Password changed successfully'
        });
        
    } catch (err) {
        console.error('Password change error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete user account
const deleteAccount = async (req, res) => {
    try {
        const userId = req.user._id;
        const { password } = req.body;
        
        if (!password) {
            return res.status(400).json({ 
                error: 'Password confirmation required' 
            });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Incorrect password' });
        }
        
        await User.findByIdAndDelete(userId);
        
        return res.status(200).json({
            message: 'Account deleted successfully'
        });
        
    } catch (err) {
        console.error('Account deletion error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Validation middleware for Signup & Login
const validateUser = [
    check('email')
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail(),
    check('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Validation for profile update
const validateProfileUpdate = [
    check('email')
        .optional()
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail()
];

// Validation for password change
const validatePasswordChange = [
    check('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

module.exports = { 
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
};
