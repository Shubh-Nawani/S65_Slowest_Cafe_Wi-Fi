const { check, validationResult } = require('express-validator');
const Cafe = require('../models/cafeModel');

// Get all cafes
const getCafe = async (req, res) => {
    try {
        const cafes = await Cafe.find();
        return res.status(200).send(cafes);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Add a new cafe with validation
const addCafe = async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, address, contact } = req.body;

        const newCafe = new Cafe({
            name,
            address,
            contact
        });

        await newCafe.save();
        return res.status(201).json({ message: "Cafe added successfully!" });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Update cafe with validation
const updateCafe = async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { _id, name, address, contact } = req.body;

        const updatedCafe = await Cafe.findByIdAndUpdate(_id, { name, address, contact }, { new: true });

        if (!updatedCafe) {
            return res.status(400).json({ error: "Cafe not found or constraints violated!" });
        }

        return res.status(200).json({ message: "Cafe updated successfully!" });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Delete cafe with validation
const deleteCafe = async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { _id } = req.body;

        const deletedCafe = await Cafe.findByIdAndDelete(_id);

        if (!deletedCafe) {
            return res.status(400).json({ error: "Cafe ID not found!" });
        }

        return res.status(200).json({ message: "Cafe deleted successfully!" });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Validation rules for cafe-related operations
const validateCafe = [
    check('name').notEmpty().withMessage('Name is required').isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
    check('address').notEmpty().withMessage('Address is required'),
    check('contact').isNumeric().withMessage('Contact must be a number').isLength({ min: 10, max: 10 }).withMessage('Contact must be 10 digits')
];

const validateCafeId = [
    check('_id').notEmpty().withMessage('Cafe ID is required').isMongoId().withMessage('Invalid Cafe ID format')
];

module.exports = { getCafe, addCafe, updateCafe, deleteCafe, validateCafe, validateCafeId };
