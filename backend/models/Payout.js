const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  // Affiliate reference
  affiliate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Affiliate',
    required: true,
    index: true
  },
  
  // Payout basic information
  payoutId: {
    type: String,
    unique: true,
    uppercase: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  super_affiliate:{
    type: String,
  },
  withdraw_type:{
      type: String,
  },
  currency: {
    type: String,
    default: 'BDT',
    enum: ['BDT', 'USD', 'EUR', 'INR', 'USDT'],
    uppercase: true
  },
  
  // Payout status and type
  status: {
    type: String,
    default: 'pending',
    index: true
  },
  payoutType: {
    type: String,
    default: 'regular'
  },
  
  // Payment method details
  paymentMethod: {
    type: String,
    enum: ['bkash', 'nagad', 'rocket', 'binance', 'bank_transfer', 'crypto', 'other'],
    required: true
  },
  paymentDetails: {
    // For mobile financial services
    bkash: {
      phoneNumber: String,
      transactionId: String,
      accountType: {
        type: String,
        enum: ['personal', 'merchant'],
        default: 'personal'
      }
    },
    nagad: {
      phoneNumber: String,
      transactionId: String,
      accountType: {
        type: String,
        enum: ['personal', 'merchant'],
        default: 'personal'
      }
    },
    rocket: {
      phoneNumber: String,
      transactionId: String,
      accountType: {
        type: String,
        enum: ['personal', 'merchant'],
        default: 'personal'
      }
    },
    
    // For cryptocurrency
    binance: {
      email: String,
      binanceId: String,
      walletAddress: String,
      transactionHash: String
    },
    crypto: {
      walletAddress: String,
      transactionHash: String,
      network: String,
      coin: String
    },
    
    // For bank transfer
    bank_transfer: {
      bankName: String,
      accountName: String,
      accountNumber: String,
      branchName: String,
      routingNumber: String,
      swiftCode: String,
      referenceNumber: String
    },
    
    // Generic payment details
    other: {
      provider: String,
      accountInfo: String,
      transactionId: String,
      notes: String
    }
  },
  
  // Earnings included in this payout
  includedEarnings: [{
    earningId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    type: {
      type: String,
    },
    description: String,
    earnedAt: Date
  }],
  
  // Commission breakdown
  commissionBreakdown: {
    depositCommission: {
      type: Number,
      default: 0,
      min: 0
    },
    betCommission: {
      type: Number,
      default: 0,
      min: 0
    },
    withdrawalCommission: {
      type: Number,
      default: 0,
      min: 0
    },
    registrationBonus: {
      type: Number,
      default: 0,
      min: 0
    },
    cpaCommission: {
      type: Number,
      default: 0,
      min: 0
    },
    otherCommission: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  
  // Fees and deductions
  fees: {
    processingFee: {
      type: Number,
      default: 0,
      min: 0
    },
    transactionFee: {
      type: Number,
      default: 0,
      min: 0
    },
    tax: {
      type: Number,
      default: 0,
      min: 0
    },
    otherDeductions: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  netAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Timeline
  requestedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  estimatedCompletionDate: {
    type: Date,
    default: null
  },
  
  // Processing information
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  processorNotes: String,
  
  // Failure information
  failureReason: {
    type: String,
    enum: [
      'insufficient_balance',
      'invalid_account',
      'network_error',
      'bank_rejection',
      'manual_review',
      'suspected_fraud',
      'other'
    ],
    default: null
  },
  failureDetails: String,
  retryAttempt: {
    type: Number,
    default: 0,
    min: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  
  // Security and verification
  verification: {
    required: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    verifiedAt: {
      type: Date,
      default: null
    },
    verificationNotes: String
  },
  
  // Notifications
  notifications: {
    affiliateNotified: {
      type: Boolean,
      default: false
    },
    notifiedAt: {
      type: Date,
      default: null
    },
    adminNotified: {
      type: Boolean,
      default: false
    }
  },
  
  // Metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceInfo: String,
    apiVersion: String
  },
  
  // Administrative
  tags: [String],
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  internalNotes: String,
  attachments: [{
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
payoutSchema.index({ affiliate: 1, createdAt: -1 });
payoutSchema.index({ payoutId: 1 });
payoutSchema.index({ status: 1, createdAt: 1 });
payoutSchema.index({ paymentMethod: 1 });
payoutSchema.index({ 'paymentDetails.bkash.phoneNumber': 1 });
payoutSchema.index({ 'paymentDetails.nagad.phoneNumber': 1 });
payoutSchema.index({ 'paymentDetails.rocket.phoneNumber': 1 });
payoutSchema.index({ requestedAt: -1 });
payoutSchema.index({ amount: -1 });
payoutSchema.index({ currency: 1 });
payoutSchema.index({ processedBy: 1 });
payoutSchema.index({ 'includedEarnings.earningId': 1 });

// Virtuals
payoutSchema.virtual('isProcessable').get(function() {
  return this.status === 'pending' && this.amount > 0;
});

payoutSchema.virtual('isOverdue').get(function() {
  if (this.status !== 'processing' || !this.estimatedCompletionDate) {
    return false;
  }
  return new Date() > this.estimatedCompletionDate;
});

payoutSchema.virtual('processingTime').get(function() {
  if (!this.processedAt || !this.requestedAt) {
    return null;
  }
  return this.processedAt - this.requestedAt;
});

payoutSchema.virtual('totalFees').get(function() {
  return this.fees.processingFee + this.fees.transactionFee + this.fees.tax + this.fees.otherDeductions;
});

payoutSchema.virtual('formattedStatus').get(function() {
  const statusMap = {
    pending: 'Pending Review',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
    cancelled: 'Cancelled',
    on_hold: 'On Hold'
  };
  return statusMap[this.status] || this.status;
});

payoutSchema.virtual('formattedPaymentMethod').get(function() {
  const methodMap = {
    bkash: 'bKash',
    nagad: 'Nagad',
    rocket: 'Rocket',
    binance: 'Binance',
    bank_transfer: 'Bank Transfer',
    crypto: 'Cryptocurrency',
    other: 'Other'
  };
  return methodMap[this.paymentMethod] || this.paymentMethod;
});

// Pre-save middleware
payoutSchema.pre('save', async function(next) {
  // Generate payout ID if not present
  if (this.isNew && !this.payoutId) {
    this.payoutId = await this.constructor.generatePayoutId();
  }
  
  // Calculate net amount
  if (this.isModified('amount') || this.isModified('fees')) {
    this.netAmount = this.amount - this.totalFees;
    
    // Ensure net amount is not negative
    if (this.netAmount < 0) {
      return next(new Error('Net amount cannot be negative'));
    }
  }
  
  // Set estimated completion date for processing payouts
  if (this.isModified('status') && this.status === 'processing' && !this.estimatedCompletionDate) {
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + 3); // 3 days for processing
    this.estimatedCompletionDate = completionDate;
  }
  
  // Set processed timestamp when status changes to processing
  if (this.isModified('status') && this.status === 'processing' && !this.processedAt) {
    this.processedAt = new Date();
  }
  
  // Set completed timestamp when status changes to completed
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  next();
});

// Instance Methods
payoutSchema.methods.updateStatus = async function(newStatus, notes = '', processedBy = null) {
  const oldStatus = this.status;
  this.status = newStatus;
  
  if (processedBy) {
    this.processedBy = processedBy;
  }
  
  if (notes) {
    this.processorNotes = this.processorNotes ? `${this.processorNotes}\n${notes}` : notes;
  }
  
  // Add status change to internal notes
  const statusChangeNote = `Status changed from ${oldStatus} to ${newStatus} at ${new Date().toISOString()}`;
  this.internalNotes = this.internalNotes ? `${this.internalNotes}\n${statusChangeNote}` : statusChangeNote;
  
  return await this.save();
};

payoutSchema.methods.addEarning = function(earningId, amount, type, description = '', earnedAt = null) {
  this.includedEarnings.push({
    earningId: earningId,
    amount: amount,
    type: type,
    description: description,
    earnedAt: earnedAt || new Date()
  });
  
  // Update commission breakdown
  const breakdownField = this.getBreakdownField(type);
  if (breakdownField) {
    this.commissionBreakdown[breakdownField] += amount;
  }
  
  return this;
};

payoutSchema.methods.getBreakdownField = function(earningType) {
  const mapping = {
    'deposit_commission': 'depositCommission',
    'bet_commission': 'betCommission',
    'withdrawal_commission': 'withdrawalCommission',
    'registration_bonus': 'registrationBonus',
    'cpa': 'cpaCommission',
    'other': 'otherCommission'
  };
  
  return mapping[earningType] || 'otherCommission';
};

payoutSchema.methods.calculateFees = function() {
  // Calculate fees based on payment method and amount
  let processingFee = 0;
  let transactionFee = 0;
  
  switch (this.paymentMethod) {
    case 'bkash':
    case 'nagad':
    case 'rocket':
      processingFee = Math.min(this.amount * 0.015, 25); // 1.5% or max 25 BDT
      break;
    case 'binance':
    case 'crypto':
      transactionFee = this.amount * 0.01; // 1% for crypto
      break;
    case 'bank_transfer':
      processingFee = 50; // Fixed 50 BDT for bank transfer
      break;
    default:
      processingFee = this.amount * 0.02; // 2% for other methods
  }
  
  this.fees.processingFee = processingFee;
  this.fees.transactionFee = transactionFee;
  
  // Recalculate net amount
  this.netAmount = this.amount - this.totalFees;
};

payoutSchema.methods.markAsNotified = async function(recipient = 'affiliate') {
  if (recipient === 'affiliate') {
    this.notifications.affiliateNotified = true;
    this.notifications.notifiedAt = new Date();
  } else if (recipient === 'admin') {
    this.notifications.adminNotified = true;
  }
  
  return await this.save();
};

payoutSchema.methods.canRetry = function() {
  return this.status === 'failed' && this.retryAttempt < this.maxRetries;
};

payoutSchema.methods.retry = async function(notes = '') {
  if (!this.canRetry()) {
    throw new Error('Payout cannot be retried');
  }
  
  this.status = 'pending';
  this.retryAttempt += 1;
  this.failureReason = null;
  this.failureDetails = null;
  
  if (notes) {
    this.processorNotes = this.processorNotes ? `${this.processorNotes}\nRetry: ${notes}` : `Retry: ${notes}`;
  }
  
  return await this.save();
};

// Static Methods
payoutSchema.statics.generatePayoutId = async function() {
  const generateId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `PO${timestamp}${random}`;
  };

  let payoutId = generateId();
  let attempts = 0;

  while (attempts < 5) {
    const existingPayout = await this.findOne({ payoutId });
    if (!existingPayout) {
      return payoutId;
    }
    payoutId = generateId();
    attempts++;
  }

  throw new Error('Could not generate unique payout ID');
};

payoutSchema.statics.findByAffiliate = function(affiliateId, filters = {}) {
  const query = { affiliate: affiliateId };
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.startDate) {
    query.createdAt = { $gte: new Date(filters.startDate) };
  }
  
  if (filters.endDate) {
    query.createdAt = query.createdAt || {};
    query.createdAt.$lte = new Date(filters.endDate);
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .populate('affiliate', 'firstName lastName email affiliateCode')
    .populate('processedBy', 'firstName lastName email');
};

payoutSchema.statics.getStats = async function(period = 'month') {
  const now = new Date();
  let startDate;
  
  switch (period) {
    case 'day':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  
  const stats = await this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalNetAmount: { $sum: '$netAmount' },
        averageAmount: { $avg: '$amount' }
      }
    }
  ]);
  
  const totalStats = await this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalPayouts: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalFees: { $sum: { $add: ['$fees.processingFee', '$fees.transactionFee', '$fees.tax', '$fees.otherDeductions'] } },
        completedPayouts: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        }
      }
    }
  ]);
  
  return {
    byStatus: stats,
    totals: totalStats[0] || {
      totalPayouts: 0,
      totalAmount: 0,
      totalFees: 0,
      completedPayouts: 0
    },
    period: {
      start: startDate,
      end: new Date()
    }
  };
};

payoutSchema.statics.getPendingPayouts = function() {
  return this.find({ status: 'pending' })
    .populate('affiliate', 'firstName lastName email paymentMethod formattedPaymentDetails')
    .sort({ createdAt: 1 });
};

payoutSchema.statics.getOverduePayouts = function() {
  const now = new Date();
  return this.find({
    status: 'processing',
    estimatedCompletionDate: { $lt: now }
  })
    .populate('affiliate', 'firstName lastName email')
    .populate('processedBy', 'firstName lastName')
    .sort({ estimatedCompletionDate: 1 });
};

// JSON transform to clean up output
payoutSchema.methods.toJSON = function() {
  const payout = this.toObject();
  
  // Remove internal fields if needed
  if (payout.internalNotes) {
    delete payout.internalNotes;
  }
  
  return payout;
};

module.exports = mongoose.model('Payout', payoutSchema);