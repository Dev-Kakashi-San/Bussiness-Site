const express = require('express');
const User = require('../models/User');
const Property = require('../models/Property');
const Rental = require('../models/Rental');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply admin middleware to all routes
router.use(verifyToken, requireAdmin);

// Dashboard overview
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsers,
      totalProperties,
      totalRentals,
      activeRentals,
      pendingPayments,
      recentProperties,
      recentUsers
    ] = await Promise.all([
      User.countDocuments({ role: 'tenant' }),
      Property.countDocuments({ isActive: true }),
      Rental.countDocuments(),
      Rental.countDocuments({ status: 'active' }),
      Rental.aggregate([
        { $unwind: '$payments' },
        { $match: { 'payments.status': { $in: ['pending', 'overdue'] } } },
        { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$payments.amount' } } }
      ]),
      Property.find({ isActive: true })
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(5),
      User.find({ role: 'tenant' })
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    const pendingPaymentData = pendingPayments[0] || { count: 0, total: 0 };

    res.json({
      success: true,
      dashboard: {
        stats: {
          totalUsers,
          totalProperties,
          totalRentals,
          activeRentals,
          pendingPaymentsCount: pendingPaymentData.count,
          pendingPaymentsAmount: pendingPaymentData.total
        },
        recentProperties,
        recentUsers
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data'
    });
  }
});

// Get all users with pagination
router.get('/users', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      role = 'all',
      status = 'all'
    } = req.query;

    // Build filter
    const filter = {};
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') }
      ];
    }
    if (role !== 'all') filter.role = role;
    if (status !== 'all') filter.isActive = status === 'active';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter)
    ]);

    res.json({
      success: true,
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalUsers: total,
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
});

// Get user details
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's rental history
    const rentals = await Rental.find({ tenant: user._id })
      .populate('property', 'title location type rent')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      user,
      rentals
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user details'
    });
  }
});

// Toggle user status
router.patch('/users/:id/toggle-status', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: { ...user.toJSON(), password: undefined }
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user status'
    });
  }
});

// Get all properties for admin
router.get('/properties', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      type = 'all',
      status = 'all',
      city = ''
    } = req.query;

    // Build filter
    const filter = {};
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }
    if (type !== 'all') filter.type = type;
    if (status !== 'all') {
      if (status === 'available') filter['availability.isAvailable'] = true;
      if (status === 'rented') filter['availability.isAvailable'] = false;
      if (status === 'inactive') filter.isActive = false;
    }
    if (city) filter['location.city'] = new RegExp(city, 'i');

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [properties, total] = await Promise.all([
      Property.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
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
    console.error('Get admin properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching properties'
    });
  }
});

// Get all rentals for admin
router.get('/rentals', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'all',
      search = ''
    } = req.query;

    // Build filter
    const filter = {};
    if (status !== 'all') filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = Rental.find(filter)
      .populate('property', 'title location type rent')
      .populate('tenant', 'name email phone')
      .populate('landlord', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Apply search filter after population
    if (search) {
      query = Rental.find(filter)
        .populate('property', 'title location type rent')
        .populate('tenant', 'name email phone')
        .populate('landlord', 'name email phone')
        .sort({ createdAt: -1 });
    }

    const [rentals, total] = await Promise.all([
      query,
      Rental.countDocuments(filter)
    ]);

    // Filter by search after population if needed
    let filteredRentals = rentals;
    if (search) {
      filteredRentals = rentals.filter(rental => 
        rental.property.title.toLowerCase().includes(search.toLowerCase()) ||
        rental.tenant.name.toLowerCase().includes(search.toLowerCase()) ||
        rental.tenant.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json({
      success: true,
      rentals: search ? filteredRentals.slice(skip, skip + parseInt(limit)) : filteredRentals,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRentals: total,
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get admin rentals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching rentals'
    });
  }
});

// Get payment overview
router.get('/payments/overview', async (req, res) => {
  try {
    const [
      totalCollected,
      pendingPayments,
      overduePayments,
      monthlyStats
    ] = await Promise.all([
      Rental.aggregate([
        { $unwind: '$payments' },
        { $match: { 'payments.status': 'paid' } },
        { $group: { _id: null, total: { $sum: '$payments.amount' } } }
      ]),
      Rental.aggregate([
        { $unwind: '$payments' },
        { $match: { 'payments.status': 'pending' } },
        { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$payments.amount' } } }
      ]),
      Rental.aggregate([
        { $unwind: '$payments' },
        { $match: { 'payments.status': 'overdue' } },
        { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$payments.amount' } } }
      ]),
      Rental.aggregate([
        { $unwind: '$payments' },
        { $match: { 'payments.status': 'paid' } },
        {
          $group: {
            _id: '$payments.month',
            amount: { $sum: '$payments.amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: -1 } },
        { $limit: 12 }
      ])
    ]);

    res.json({
      success: true,
      overview: {
        totalCollected: totalCollected[0]?.total || 0,
        pendingPayments: pendingPayments[0] || { count: 0, total: 0 },
        overduePayments: overduePayments[0] || { count: 0, total: 0 },
        monthlyStats: monthlyStats.reverse()
      }
    });
  } catch (error) {
    console.error('Get payment overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payment overview'
    });
  }
});

// Get system statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      userStats,
      propertyStats,
      rentalStats,
      cityStats
    ] = await Promise.all([
      User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]),
      Property.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            avgRent: { $avg: '$rent.amount' }
          }
        }
      ]),
      Rental.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      Property.aggregate([
        {
          $group: {
            _id: '$location.city',
            count: { $sum: 1 },
            avgRent: { $avg: '$rent.amount' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        userStats,
        propertyStats,
        rentalStats,
        cityStats
      }
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching system statistics'
    });
  }
});

module.exports = router;