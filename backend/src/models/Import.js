const mongoose = require('mongoose');

const importSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  filename: {
    type: String,
    required: [true, 'Filename is required'],
    trim: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  mapping: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  results: {
    imported: {
      type: Number,
      default: 0
    },
    skipped: {
      type: Number,
      default: 0
    },
    errors: [{
      row: Number,
      error: String,
      data: mongoose.Schema.Types.Mixed
    }],
    duplicates: {
      type: Number,
      default: 0
    }
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  error: String
}, {
  timestamps: true
});

// Index for efficient querying
importSchema.index({ userId: 1, createdAt: -1 });
importSchema.index({ status: 1 });

// Method to mark import as completed
importSchema.methods.markCompleted = function(results) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.results = results;
  return this.save();
};

// Method to mark import as failed
importSchema.methods.markFailed = function(error) {
  this.status = 'failed';
  this.completedAt = new Date();
  this.error = error;
  return this.save();
};

// Static method to get user's import history
importSchema.statics.getUserImports = function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

const Import = mongoose.model('Import', importSchema);

module.exports = Import;