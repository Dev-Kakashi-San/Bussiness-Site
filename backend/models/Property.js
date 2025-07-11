const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Property title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Property description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  type: {
    type: String,
    required: [true, 'Property type is required'],
    enum: ['apartment', 'villa', 'room', 'pg', 'hostel', 'house']
  },
  location: {
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      default: 'Rajasthan'
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      match: [/^\d{6}$/, 'Please provide a valid pincode']
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  rent: {
    amount: {
      type: Number,
      required: [true, 'Rent amount is required'],
      min: [500, 'Rent must be at least ₹500']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    deposit: {
      type: Number,
      required: [true, 'Security deposit is required']
    },
    maintenance: {
      type: Number,
      default: 0
    }
  },
  amenities: [{
    type: String,
    enum: [
      'wifi', 'parking', 'ac', 'furnished', 'gym', 'swimming_pool',
      'security', 'elevator', 'balcony', 'garden', 'power_backup',
      'water_supply', 'cooking_allowed', 'pets_allowed'
    ]
  }],
  specifications: {
    bedrooms: {
      type: Number,
      required: true,
      min: [0, 'Bedrooms cannot be negative']
    },
    bathrooms: {
      type: Number,
      required: true,
      min: [1, 'At least 1 bathroom is required']
    },
    area: {
      value: {
        type: Number,
        required: true
      },
      unit: {
        type: String,
        enum: ['sqft', 'sqm'],
        default: 'sqft'
      }
    },
    floor: Number,
    totalFloors: Number,
    furnished: {
      type: String,
      enum: ['fully', 'semi', 'unfurnished'],
      default: 'unfurnished'
    }
  },
  images: [{
    url: String,
    caption: String,
    isPrimary: { type: Boolean, default: false }
  }],
  availability: {
    isAvailable: {
      type: Boolean,
      default: true
    },
    availableFrom: {
      type: Date,
      default: Date.now
    },
    preferredTenant: {
      type: String,
      enum: ['any', 'family', 'bachelor', 'student', 'working_professional'],
      default: 'any'
    }
  },
  owner: {
    name: String,
    phone: String,
    email: String,
    isVerified: { type: Boolean, default: false }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for location-based searches
propertySchema.index({ 'location.city': 1, 'location.state': 1 });
propertySchema.index({ 'rent.amount': 1 });
propertySchema.index({ type: 1 });
propertySchema.index({ 'availability.isAvailable': 1 });

module.exports = mongoose.model('Property', propertySchema);