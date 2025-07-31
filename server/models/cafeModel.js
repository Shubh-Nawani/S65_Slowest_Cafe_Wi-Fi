const mongoose = require('mongoose');

const cafeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Cafe name is required'],
        trim: true,
        minlength: [3, 'Cafe name must be at least 3 characters long'],
        maxlength: [100, 'Cafe name cannot exceed 100 characters']
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
        minlength: [10, 'Address must be at least 10 characters long'],
        maxlength: [200, 'Address cannot exceed 200 characters']
    },
    contact: {
        type: Number,
        required: [true, 'Contact number is required'],
        min: [1000000000, 'Contact number must be 10 digits'],
        max: [9999999999, 'Contact number must be 10 digits']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    wifiSpeed: {
        download: {
            type: Number,
            min: [0, 'Download speed cannot be negative'],
            max: [1000, 'Download speed seems too high']
        },
        upload: {
            type: Number,
            min: [0, 'Upload speed cannot be negative'], 
            max: [1000, 'Upload speed seems too high']
        },
        ping: {
            type: Number,
            min: [0, 'Ping cannot be negative'],
            max: [1000, 'Ping seems too high']
        },
        lastTested: {
            type: Date,
            default: Date.now
        }
    },
    amenities: [{
        type: String,
        enum: ['wifi', 'power-outlets', 'quiet', 'outdoor-seating', 'parking', 'food', 'beverages', 'restroom']
    }],
    hours: {
        monday: { open: String, close: String },
        tuesday: { open: String, close: String },
        wednesday: { open: String, close: String },
        thursday: { open: String, close: String },
        friday: { open: String, close: String },
        saturday: { open: String, close: String },
        sunday: { open: String, close: String }
    },
    rating: {
        average: {
            type: Number,
            min: [0, 'Rating cannot be negative'],
            max: [5, 'Rating cannot exceed 5'],
            default: 0
        },
        count: {
            type: Number,
            default: 0
        }
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            index: '2dsphere'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Create compound index to prevent duplicate cafes with same name and address
cafeSchema.index({ name: 1, address: 1 }, { unique: true });

// Geospatial index for location-based queries
cafeSchema.index({ location: '2dsphere' });

// Text index for search functionality
cafeSchema.index({ 
    name: 'text', 
    address: 'text', 
    description: 'text' 
}, {
    weights: {
        name: 10,
        address: 5,
        description: 1
    }
});

// Virtual for formatted address
cafeSchema.virtual('shortAddress').get(function() {
    if (this.address) {
        const parts = this.address.split(',');
        return parts.length > 2 ? `${parts[0]}, ${parts[parts.length - 1]}` : this.address;
    }
    return '';
});

// Method to calculate distance from a point
cafeSchema.methods.getDistanceFrom = function(longitude, latitude) {
    if (!this.location || !this.location.coordinates) {
        return null;
    }
    
    const [cafeLng, cafeLat] = this.location.coordinates;
    const R = 6371; // Earth's radius in kilometers
    
    const dLat = (cafeLat - latitude) * Math.PI / 180;
    const dLng = (cafeLng - longitude) * Math.PI / 180;
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(latitude * Math.PI / 180) * Math.cos(cafeLat * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

module.exports = mongoose.model("Cafe", cafeSchema);