const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Budget name is required'],
    trim: true,
    maxlength: [100, 'Budget name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Budget amount is required'],
    min: [0.01, 'Amount must be greater than 0'],
    set: v => parseFloat(v.toFixed(2))
  },
  period: {
    type: String,
    enum: ['weekly', 'monthly', 'yearly'],
    required: [true, 'Budget period is required']
  },
  rollover: {
    type: Boolean,
    default: false
  },
  alerts: {
    enabled: {
      type: Boolean,
      default: true
    },
    thresholds: {
      type: [Number],
      default: [70, 90, 100]
    }
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  spent: {
    type: Number,
    default: 0,
    set: v => parseFloat(v.toFixed(2))
  }
}, {
  timestamps: true
});

// Index for efficient querying
budgetSchema.index({ userId: 1, startDate: 1, endDate: 1 });

// Virtual for remaining amount
budgetSchema.virtual('remaining').get(function() {
  return Math.max(0, this.amount - this.spent);
});

// Virtual for percentage used
budgetSchema.virtual('percentageUsed').get(function() {
  return this.amount > 0 ? Math.min(100, (this.spent / this.amount) * 100) : 0;
});

// Virtual for progress status
budgetSchema.virtual('status').get(function() {
  const percentage = this.percentageUsed;
  if (percentage >= 100) return 'exceeded';
  if (percentage >= 90) return 'critical';
  if (percentage >= 70) return 'warning';
  return 'good';
});

// Method to check if budget is active
budgetSchema.methods.isActive = function() {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate;
};

// Static method to get active budgets for user
budgetSchema.statics.getActiveBudgets = function(userId) {
  const now = new Date();
  return this.find({
    userId,
    startDate: { $lte: now },
    endDate: { $gte: now }
  });
};

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;