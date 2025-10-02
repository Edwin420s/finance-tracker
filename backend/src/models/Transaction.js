const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: [true, 'Transaction type is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0'],
    set: v => parseFloat(v.toFixed(2))
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters'],
    index: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    index: true
  },
  merchant: {
    type: String,
    trim: true,
    maxlength: [100, 'Merchant cannot exceed 100 characters']
  },
  paymentMethod: {
    type: String,
    trim: true,
    maxlength: [50, 'Payment method cannot exceed 50 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  recurring: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['weekly', 'monthly', 'yearly']
    },
    nextDate: Date
  },
  location: {
    latitude: Number,
    longitude: Number
  },
  receipt: String,
  isExcluded: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ userId: 1, amount: -1 });

// Virtual for formatted date
transactionSchema.virtual('formattedDate').get(function() {
  return this.date.toISOString().split('T')[0];
});

// Instance method to check if transaction is recent
transactionSchema.methods.isRecent = function(days = 7) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return this.date > cutoff;
};

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;