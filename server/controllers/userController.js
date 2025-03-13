const { check, validationResult } = require('express-validator');
const User = require('../models/userModel');
// const bcrypt = require('bcrypt');

// Get all users
const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        return res.status(200).send(users);
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

        // Check if user already exists
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: "User already exists!" });
        }

        // Hash password
        // const hash = bcrypt.hashSync(password, 10);

        // Create new user
        const newUser = new User({
            email,
            password
        });

        await newUser.save();
        return res.status(201).json({ message: "User created successfully!" });

    } catch (err) {
        return res.status(500).json({ error: err.message });
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

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ error: "User not found!" });
        }

        // Compare password
        // const isMatch = await bcrypt.compare(password, existingUser.password);
        // if (!isMatch) {
        //     return res.status(400).json({ error: "Invalid credentials!" });
        // }

        return res.status(200).json({ message: "Login successful!" });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Validation middleware for Signup & Login
const validateUser = [
    check('email').isEmail().withMessage('Invalid email format'),
    check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
];

module.exports = { getUsers, signup, login, validateUser };
