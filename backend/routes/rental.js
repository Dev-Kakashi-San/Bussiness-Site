const express = require('express');
const Joi = require('joi');
const Rental = require('../models/Rental');
const Property = require('../models/Property');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get user's rentals
router.get('/my-rentals', verifyToken, async (req, res) => {
  try {
    const rentals = await Rental.find({ tenant: req.user._id })
      .populate('property', 'title location images type rent')
      .populate('landlord', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      rentals
    });
  } catch (error) {
    console.error('Get my rentals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching rentals'
    });
  }
});

// Get rental details by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate('property', 'title location images type rent specifications')
      .populate('tenant', 'name email phone address')
      .populate('landlord', 'name email phone');

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental not found'
      });
    }

    // Check if user has access to this rental
    if (req.user.role !== 'admin' && 
        rental.tenant._id.toString() !== req.user._id.toString() &&
        rental.landlord._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      rental
    });
  } catch (error) {
    console.error('Get rental error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching rental'
    });
  }
});

// Get pending rent payments for user
router.get('/payments/pending', verifyToken, async (req, res) => {
  try {
    const rentals = await Rental.find({ 
      tenant: req.user._id,
      status: 'active'
    })
    .populate('property', 'title location')
    .select('property payments totalDue agreement');

    const pendingPayments = [];
    
    rentals.forEach(rental => {
      const pending = rental.payments.filter(payment => 
        payment.status === 'pending' || payment.status === 'overdue'
      );
      
      pending.forEach(payment => {
        pendingPayments.push({
          rentalId: rental._id,
          property: rental.property,
          payment: payment,
          monthlyRent: rental.agreement.monthlyRent
        });
      });
    });

    // Sort by due date
    pendingPayments.sort((a, b) => new Date(a.payment.dueDate) - new Date(b.payment.dueDate));

    res.json({
      success: true,
      pendingPayments,
      totalDue: pendingPayments.reduce((sum, p) => sum + p.payment.amount + (p.payment.late_fee || 0), 0)
    });
  } catch (error) {
    console.error('Get pending payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching pending payments'
    });
  }
});

// Record rent payment (Admin only for now)
router.post('/:rentalId/payments/:paymentId/pay', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { rentalId, paymentId } = req.params;
    const { paymentMethod, transactionId, notes } = req.body;

    const rental = await Rental.findById(rentalId);
    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental not found'
      });
    }

    const payment = rental.payments.id(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment already recorded'
      });
    }

    // Update payment details
    payment.status = 'paid';
    payment.paidDate = new Date();
    payment.paymentMethod = paymentMethod;
    payment.transactionId = transactionId;
    payment.notes = notes;

    // Update rental's last payment date
    rental.lastPaymentDate = new Date();

    await rental.save();

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      rental
    });
  } catch (error) {
    console.error('Record payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while recording payment'
    });
  }
});

// Create new rental agreement (Admin only)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const {
      propertyId,
      tenantId,
      startDate,
      endDate,
      monthlyRent,
      securityDeposit,
      maintenanceCharges = 0
    } = req.body;

    // Validate required fields
    if (!propertyId || !tenantId || !startDate || !endDate || !monthlyRent || !securityDeposit) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Check if property exists and is available
    const property = await Property.findById(propertyId);
    if (!property || !property.availability.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Property not available for rent'
      });
    }

    // Create rental agreement
    const rental = new Rental({
      property: propertyId,
      tenant: tenantId,
      landlord: req.user._id,
      agreement: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        monthlyRent,
        securityDeposit,
        maintenanceCharges
      },
      status: 'active'
    });

    // Generate monthly payments
    const start = new Date(startDate);
    const end = new Date(endDate);
    const payments = [];

    let currentDate = new Date(start);
    while (currentDate < end) {
      const nextMonth = new Date(currentDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      const dueDate = new Date(currentDate);
      dueDate.setDate(5); // Rent due on 5th of each month
      
      payments.push({
        month: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`,
        amount: monthlyRent + maintenanceCharges,
        dueDate: dueDate,
        status: 'pending'
      });
      
      currentDate = nextMonth;
    }

    rental.payments = payments;
    await rental.save();

    // Mark property as unavailable
    property.availability.isAvailable = false;
    await property.save();

    res.status(201).json({
      success: true,
      message: 'Rental agreement created successfully',
      rental
    });
  } catch (error) {
    console.error('Create rental error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating rental agreement'
    });
  }
});

// Add maintenance request
router.post('/:id/maintenance', verifyToken, async (req, res) => {
  try {
    const { issue, description, images = [] } = req.body;

    if (!issue || !description) {
      return res.status(400).json({
        success: false,
        message: 'Issue and description are required'
      });
    }

    const rental = await Rental.findById(req.params.id);
    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental not found'
      });
    }

    // Check if user has access
    if (req.user.role !== 'admin' && rental.tenant.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    rental.maintenance.push({
      issue,
      description,
      images,
      reportedDate: new Date(),
      status: 'reported'
    });

    await rental.save();

    res.json({
      success: true,
      message: 'Maintenance request submitted successfully',
      rental
    });
  } catch (error) {
    console.error('Add maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting maintenance request'
    });
  }
});

// Get rental statistics (Admin only)
router.get('/stats/overview', verifyToken, requireAdmin, async (req, res) => {
  try {
    const [
      totalRentals,
      activeRentals,
      pendingRentals,
      totalDueAmount
    ] = await Promise.all([
      Rental.countDocuments(),
      Rental.countDocuments({ status: 'active' }),
      Rental.countDocuments({ status: 'pending' }),
      Rental.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: null, total: { $sum: '$totalDue' } } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        totalRentals,
        activeRentals,
        pendingRentals,
        totalDueAmount: totalDueAmount[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get rental stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching rental statistics'
    });
  }
});

module.exports = router;