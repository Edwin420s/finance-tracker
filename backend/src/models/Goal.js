const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Goal title is required'],
    trim: true,
    maxlength: [100, 'Goal title cannot exceed 100 characters']
  },
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: [0.01, 'Target amount must be greater than 0'],
    set: v => parseFloat(v.toFixed(2))
  },
  currentAmount: {
    type: Number,
    default: 0,
    set: v => parseFloat(v.toFixed(2))
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  color: {
    type: String,
    default: '#3b82f6'
  },
  icon: {
    type: String,
    default: 'target'
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: Date
}, {
  timestamps: true
});

// Index for efficient querying
goalSchema.index({ userId: 1, deadline: 1 });

// Virtual for progress percentage
goalSchema.virtual('progress').get(function() {
  return this.targetAmount > 0 ? (this.currentAmount / this.targetAmount) * 100 : 0;
});

// Virtual for days remaining
goalSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const deadline = new Date(this.deadline);
  const diffTime = deadline - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to check if goal is overdue
goalSchema.methods.isOverdue = function() {
  return !this.isCompleted && new Date() > this.deadline;
};

const Goal = mongoose.model('Goal', goalSchema);

module.exports = Goal;