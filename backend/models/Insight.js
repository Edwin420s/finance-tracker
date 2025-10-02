const mongoose = require('mongoose');

const insightSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  type: {
    type: String,
    enum: ['trend', 'anomaly', 'recommendation', 'forecast'],
    required: [true, 'Insight type is required'],
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  data: {
    type: Object,
    required: true,
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
  },
  isActionable: {
    type: Boolean,
    default: false,
  },
  actionTaken: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Index for efficient querying
insightSchema.index({ userId: 1, createdAt: -1 });

const Insight = mongoose.model('Insight', insightSchema);

module.exports = Insight;