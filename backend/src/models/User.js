const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  avatar: {
    type: String,
    default: ''
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  preferences: {
    darkMode: {
      type: Boolean,
      default: false
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      budgetAlerts: {
        type: Boolean,
        default: true
      }
    }
  },
  security: {
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    lastLogin: Date,
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: Date
  }
}, {
  timestamps: true
});

// Index for efficient querying
userSchema.index({ email: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Check if account is locked
userSchema.methods.isLocked = function() {
  return !!(this.security.lockUntil && this.security.lockUntil > Date.now());
};

// Increment login attempts
userSchema.methods.incrementLoginAttempts = async function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.security.lockUntil && this.security.lockUntil < Date.now()) {
    return await this.updateOne({
      'security.loginAttempts': 1,
      'security.lockUntil': undefined
    });
  }
  
  // Otherwise increment
  const updates = { $inc: { 'security.loginAttempts': 1 } };
  
  // Lock the account if we've reached max attempts and it's not locked already
  if (this.security.loginAttempts + 1 >= 5 && !this.security.lockUntil) {
    updates.$set = { 'security.lockUntil': Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return await this.updateOne(updates);
};

const User = mongoose.model('User', userSchema);

module.exports = User;