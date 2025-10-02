const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  name: {
    type: String,
    required: [true, 'Budget name is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: 0,
  },
  period: {
    type: String,
    enum: ['weekly', 'monthly', 'yearly'],
    required: [true, 'Period is required'],
  },
  rollover: {
    type: Boolean,
    default: false,
  },
  alerts: {
    enabled: {
      type: Boolean,
      default: true,
    },
    thresholds: {
      type: [Number],
      default: [70, 90, 100],
    },
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  spent: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Index for efficient querying
budgetSchema.index({ userId: 1, startDate: 1, endDate: 1 });

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;