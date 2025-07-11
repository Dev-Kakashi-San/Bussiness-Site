const express = require('express');
const Joi = require('joi');
const Property = require('../models/Property');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation schema for property creation/update
const propertySchema = Joi.object({
  title: Joi.string().min(5).max(100).required(),
  description: Joi.string().min(20).max(1000).required(),
  type: Joi.string().valid('apartment', 'villa', 'room', 'pg', 'hostel', 'house').required(),
  location: Joi.object({
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().default('Rajasthan'),
    pincode: Joi.string().pattern(/^\d{6}$/).required(),
    coordinates: Joi.object({
      latitude: Joi.number().optional(),
      longitude: Joi.number().optional()
    }).optional()
  }).required(),
  rent: Joi.object({
    amount: Joi.number().min(500).required(),
    deposit: Joi.number().min(0).required(),
    maintenance: Joi.number().min(0).default(0)
  }).required(),
  amenities: Joi.array().items(
    Joi.string().valid(
      'wifi', 'parking', 'ac', 'furnished', 'gym', 'swimming_pool',
      'security', 'elevator', 'balcony', 'garden', 'power_backup',
      'water_supply', 'cooking_allowed', 'pets_allowed'
    )
  ).default([]),
  specifications: Joi.object({
    bedrooms: Joi.number().min(0).required(),
    bathrooms: Joi.number().min(1).required(),
    area: Joi.object({
      value: Joi.number().min(1).required(),
      unit: Joi.string().valid('sqft', 'sqm').default('sqft')
    }).required(),
    floor: Joi.number().optional(),
    totalFloors: Joi.number().optional(),
    furnished: Joi.string().valid('fully', 'semi', 'unfurnished').default('unfurnished')
  }).required(),
  availability: Joi.object({
    isAvailable: Joi.boolean().default(true),
    availableFrom: Joi.date().default(Date.now),
    preferredTenant: Joi.string().valid('any', 'family', 'bachelor', 'student', 'working_professional').default('any')
  }).optional(),
  owner: Joi.object({
    name: Joi.string().optional(),
    phone: Joi.string().pattern(/^[6-9]\d{9}$/).optional(),
    email: Joi.string().email().optional()
  }).optional()
});

// Get all properties with filters and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      city,
      type,
      minRent,
      maxRent,
      bedrooms,
      furnished,
      amenities,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isActive: true, 'availability.isAvailable': true };

    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (type) filter.type = type;
    if (minRent || maxRent) {
      filter['rent.amount'] = {};
      if (minRent) filter['rent.amount'].$gte = parseInt(minRent);
      if (maxRent) filter['rent.amount'].$lte = parseInt(maxRent);
    }
    if (bedrooms) filter['specifications.bedrooms'] = parseInt(bedrooms);
    if (furnished) filter['specifications.furnished'] = furnished;
    if (amenities) {
      const amenityList = amenities.split(',');
      filter.amenities = { $in: amenityList };
    }

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [properties, total] = await Promise.all([
      Property.find(filter)
        .populate('createdBy', 'name email phone')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit)),
      Property.countDocuments(filter)
    ]);

    res.json({
      success: true,
      properties,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProperties: total,
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching properties'
    });
  }
});

// Get single property by ID
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('createdBy', 'name email phone');

    if (!property || !property.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Increment view count
    property.views += 1;
    await property.save();

    res.json({
      success: true,
      property
    });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching property'
    });
  }
});

// Create new property (Admin only)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    // Validate input
    const { error } = propertySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const property = new Property({
      ...req.body,
      createdBy: req.user._id
    });

    await property.save();

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      property
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating property'
    });
  }
});

// Update property (Admin only)
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    // Validate input
    const { error } = propertySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      message: 'Property updated successfully',
      property
    });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating property'
    });
  }
});

// Delete property (Admin only)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting property'
    });
  }
});

// Get featured properties
router.get('/featured/list', async (req, res) => {
  try {
    const properties = await Property.find({
      featured: true,
      isActive: true,
      'availability.isAvailable': true
    })
    .populate('createdBy', 'name email phone')
    .limit(6)
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      properties
    });
  } catch (error) {
    console.error('Get featured properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured properties'
    });
  }
});

// Toggle featured status (Admin only)
router.patch('/:id/featured', verifyToken, requireAdmin, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    property.featured = !property.featured;
    await property.save();

    res.json({
      success: true,
      message: `Property ${property.featured ? 'featured' : 'unfeatured'} successfully`,
      property
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating featured status'
    });
  }
});

module.exports = router;