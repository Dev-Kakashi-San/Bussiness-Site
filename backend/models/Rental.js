const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agreement: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    monthlyRent: {
      type: Number,
      required: true
    },
    securityDeposit: {
      type: Number,
      required: true
    },
    maintenanceCharges: {
      type: Number,
      default: 0
    },
    terms: String,
    documentUrl: String
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'terminated', 'pending'],
    default: 'pending'
  },
  payments: [{
    month: {
      type: String,
      required: true // Format: "YYYY-MM"
    },
    amount: {
      type: Number,
      required: true
    },
    dueDate: {
      type: Date,
      required: true
    },
    paidDate: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue', 'partial'],
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'bank_transfer', 'cheque', 'online'],
      default: null
    },
    transactionId: String,
    late_fee: {
      type: Number,
      default: 0
    },
    notes: String
  }],
  totalDue: {
    type: Number,
    default: 0
  },
  lastPaymentDate: {
    type: Date,
    default: null
  },
  notices: [{
    type: {
      type: String,
      enum: ['rent_due', 'late_payment', 'maintenance', 'general', 'termination']
    },
    message: String,
    date: {
      type: Date,
      default: Date.now
    },
    acknowledged: {
      type: Boolean,
      default: false
    }
  }],
  maintenance: [{
    issue: String,
    description: String,
    reportedDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['reported', 'in_progress', 'completed', 'rejected'],
      default: 'reported'
    },
    assignedTo: String,
    completedDate: Date,
    cost: Number,
    images: [String]
  }]
}, {
  timestamps: true
});

// Index for efficient queries
rentalSchema.index({ tenant: 1, status: 1 });
rentalSchema.index({ property: 1 });
rentalSchema.index({ 'payments.status': 1 });
rentalSchema.index({ 'agreement.endDate': 1 });

// Calculate total due before saving
rentalSchema.pre('save', function(next) {
  const pendingPayments = this.payments.filter(payment => 
    payment.status === 'pending' || payment.status === 'overdue' || payment.status === 'partial'
  );
  
  this.totalDue = pendingPayments.reduce((total, payment) => {
    return total + payment.amount + (payment.late_fee || 0);
  }, 0);
  
  next();
});

module.exports = mongoose.model('Rental', rentalSchema);