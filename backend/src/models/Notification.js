const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  type: {
    type: String,
    enum: ['budget', 'goal', 'security', 'system', 'insight'],
    required: [true, 'Notification type is required']
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  actionUrl: String,
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
}, {
  timestamps: true
});

// Index for efficient querying
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to create budget alert notification
notificationSchema.statics.createBudgetAlert = function(userId, budget, alertType) {
  const messages = {
    warning: `Your ${budget.category} budget is 70% used.`,
    critical: `Your ${budget.category} budget is 90% used - almost at limit!`,
    exceeded: `Your ${budget.category} budget has been exceeded!`
  };

  return this.create({
    userId,
    type: 'budget',
    title: 'Budget Alert',
    message: messages[alertType] || 'Budget alert',
    data: {
      budgetId: budget._id,
      budgetName: budget.name,
      category: budget.category,
      spent: budget.spent,
      limit: budget.amount,
      alertType
    },
    priority: alertType === 'exceeded' ? 'high' : 'medium',
    actionUrl: '/budgets'
  });
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;