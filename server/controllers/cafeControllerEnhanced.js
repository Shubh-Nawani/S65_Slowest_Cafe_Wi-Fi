const { check, validationResult } = require('express-validator');
const Cafe = require('../models/cafeModel');

// Get all cafes with optional filtering and pagination
const getCafe = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 50, 
            search = '', 
            sortBy = 'createdAt', 
            sortOrder = 'desc' 
        } = req.query;
        
        // Build search query
        const searchQuery = search ? {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { address: { $regex: search, $options: 'i' } }
            ]
        } : {};
        
        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
        
        // Get cafes with pagination
        const cafes = await Cafe.find(searchQuery)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));
            
        // Get total count for pagination
        const totalCafes = await Cafe.countDocuments(searchQuery);
        const totalPages = Math.ceil(totalCafes / parseInt(limit));
        
        // For simple response when no pagination needed, return array directly
        if (!req.query.page && !req.query.limit) {
            return res.status(200).json(cafes);
        }
        
        return res.status(200).json({
            message: 'Cafes retrieved successfully',
            cafes,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalCafes,
                hasNextPage: parseInt(page) < totalPages,
                hasPrevPage: parseInt(page) > 1
            }
        });
    } catch (err) {
        console.error('Get cafes error:', err);
        return res.status(500).json({ error: err.message });
    }
};

// Get single cafe by ID
const getCafeById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const cafe = await Cafe.findById(id);
        if (!cafe) {
            return res.status(404).json({ error: 'Cafe not found' });
        }
        
        return res.status(200).json({
            message: 'Cafe retrieved successfully',
            cafe
        });
    } catch (err) {
        console.error('Get cafe error:', err);
        if (err.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid cafe ID format' });
        }
        return res.status(500).json({ error: err.message });
    }
};

// Get cafe statistics
const getCafeStats = async (req, res) => {
    try {
        const totalCafes = await Cafe.countDocuments();
        const recentCafes = await Cafe.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        });
        
        // Get cafes by location (group by first word of address)
        const locationStats = await Cafe.aggregate([
            {
                $group: {
                    _id: { $arrayElemAt: [{ $split: ["$address", " "] }, 0] },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);
        
        return res.status(200).json({
            message: 'Statistics retrieved successfully',
            stats: {
                totalCafes,
                recentCafes,
                topLocations: locationStats,
                averagePerDay: Math.round((totalCafes / 30) * 10) / 10
            }
        });
    } catch (err) {
        console.error('Get stats error:', err);
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

        // Check if cafe with same name and address already exists
        const existingCafe = await Cafe.findOne({ 
            name: { $regex: new RegExp(`^${name}$`, 'i') }, 
            address: { $regex: new RegExp(`^${address}$`, 'i') } 
        });
        
        if (existingCafe) {
            return res.status(409).json({ 
                error: "A cafe with this name and address already exists!" 
            });
        }

        const newCafe = new Cafe({
            name: name.trim(),
            address: address.trim(),
            contact: parseInt(contact)
        });

        await newCafe.save();
        return res.status(201).json(newCafe);

    } catch (err) {
        console.error('Add cafe error:', err);
        if (err.code === 11000) {
            return res.status(409).json({ 
                error: "A cafe with this name and address already exists!" 
            });
        }
        return res.status(500).json({ error: "Internal server error" });
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

        // Check if cafe exists
        const existingCafe = await Cafe.findById(_id);
        if (!existingCafe) {
            return res.status(404).json({ error: "Cafe not found!" });
        }

        // Check if another cafe with same name and address exists (excluding current cafe)
        const duplicateCafe = await Cafe.findOne({ 
            _id: { $ne: _id },
            name: { $regex: new RegExp(`^${name}$`, 'i') }, 
            address: { $regex: new RegExp(`^${address}$`, 'i') } 
        });
        
        if (duplicateCafe) {
            return res.status(409).json({ 
                error: "Another cafe with this name and address already exists!" 
            });
        }

        const updatedCafe = await Cafe.findByIdAndUpdate(
            _id, 
            { 
                name: name.trim(), 
                address: address.trim(), 
                contact: parseInt(contact) 
            }, 
            { new: true, runValidators: true }
        );

        return res.status(200).json(updatedCafe);

    } catch (err) {
        console.error('Update cafe error:', err);
        if (err.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid cafe ID format' });
        }
        if (err.code === 11000) {
            return res.status(409).json({ 
                error: "Another cafe with this name and address already exists!" 
            });
        }
        return res.status(500).json({ error: "Internal server error" });
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
            return res.status(404).json({ error: "Cafe not found!" });
        }

        return res.status(200).json({ 
            message: "Cafe deleted successfully!",
            deletedCafe
        });

    } catch (err) {
        console.error('Delete cafe error:', err);
        if (err.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid cafe ID format' });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
};

// Bulk operations for admin
const bulkDeleteCafes = async (req, res) => {
    try {
        const { ids } = req.body;
        
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'Array of cafe IDs required' });
        }
        
        const result = await Cafe.deleteMany({ _id: { $in: ids } });
        
        return res.status(200).json({
            message: `${result.deletedCount} cafes deleted successfully`,
            deletedCount: result.deletedCount
        });
        
    } catch (err) {
        console.error('Bulk delete error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Validation rules for cafe-related operations
const validateCafe = [
    check('name')
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 3, max: 100 })
        .withMessage('Name must be between 3-100 characters')
        .trim(),
    check('address')
        .notEmpty()
        .withMessage('Address is required')
        .isLength({ min: 10, max: 200 })
        .withMessage('Address must be between 10-200 characters')
        .trim(),
    check('contact')
        .isNumeric()
        .withMessage('Contact must be a number')
        .isLength({ min: 10, max: 10 })
        .withMessage('Contact must be exactly 10 digits')
];

const validateCafeId = [
    check('_id')
        .notEmpty()
        .withMessage('Cafe ID is required')
        .isMongoId()
        .withMessage('Invalid Cafe ID format')
];

const validateBulkDelete = [
    check('ids')
        .isArray({ min: 1 })
        .withMessage('Array of cafe IDs required')
        .custom((ids) => {
            if (ids.some(id => !id.match(/^[0-9a-fA-F]{24}$/))) {
                throw new Error('All IDs must be valid MongoDB ObjectIds');
            }
            return true;
        })
];

module.exports = { 
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
};
