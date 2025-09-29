const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'success', 'error', 'promotional', 'system'],
    default: 'info'
  },
  targetUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  targetType: {
    type: String,
    enum: ['all', 'specific', 'role_based'],
    default: 'all'
  },
  userRoles: [{
    type: String,
    enum: ['user', 'agent', 'admin', 'super_admin']
  }],
  isRead: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  scheduledFor: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sent', 'cancelled'],
    default: 'sent'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  actionUrl: {
    type: String,
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Index for better query performance
notificationSchema.index({ targetType: 1, status: 1, scheduledFor: 1 });
notificationSchema.index({ 'isRead.userId': 1 });

// Static method to get notifications for a user
notificationSchema.statics.getUserNotifications = async function(userId, role, options = {}) {
  const { limit = 20, page = 1, unreadOnly = false } = options;
  const skip = (page - 1) * limit;

  const query = {
    $or: [
      { targetType: 'all' },
      { targetType: 'specific', targetUsers: userId },
      { targetType: 'role_based', userRoles: role }
    ],
    status: 'sent',
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ],
    scheduledFor: { $lte: new Date() }
  };

  if (unreadOnly) {
    query['isRead.userId'] = { $ne: userId };
  }

  const notifications = await this.find(query)
    .sort({ createdAt: -1, priority: -1 })
    .skip(skip)
    .limit(limit)
    .select('-targetUsers -userRoles')
    .populate('createdBy', 'username');

  const total = await this.countDocuments(query);

  return {
    notifications,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page
  };
};

// Method to mark notification as read
notificationSchema.methods.markAsRead = function(userId) {
  const alreadyRead = this.isRead.some(read => read.userId.toString() === userId.toString());
  
  if (!alreadyRead) {
    this.isRead.push({
      userId: userId,
      readAt: new Date()
    });
  }
  
  return this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);