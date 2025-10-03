const mongoose = require('mongoose');

const insightSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  type: {
    type: String,
    enum: ['trend', 'anomaly', 'recommendation', 'forecast', 'summary'],
    required: [true, 'Insight type is required']
  },
  title: {
    type: String,
    required: [true, 'Insight title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Insight message is required'],
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.8
  },
  isActionable: {
    type: Boolean,
    default: false
  },
  actionTaken: {
    type: Boolean,
    default: false
  },
  category: String,
  impact: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  }
}, {
  timestamps: true
});

// Index for efficient querying
insightSchema.index({ userId: 1, createdAt: -1 });
insightSchema.index({ userId: 1, type: 1 });
insightSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to mark insight as action taken
insightSchema.methods.markActionTaken = function() {
  this.actionTaken = true;
  return this.save();
};

// Static method to get actionable insights
insightSchema.statics.getActionableInsights = function(userId) {
  return this.find({
    userId,
    isActionable: true,
    actionTaken: false,
    expiresAt: { $gt: new Date() }
  }).sort({ impact: -1, confidence: -1 });
};

const Insight = mongoose.model('Insight', insightSchema);

module.exports = Insight;