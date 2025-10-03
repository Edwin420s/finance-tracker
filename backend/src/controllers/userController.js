const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');

// @desc    Get user dashboard statistics
// @route   GET /api/users/dashboard
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get current month dates
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get monthly transactions
    const monthlyTransactions = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
          isExcluded: { $ne: true }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get active budgets
    const activeBudgets = await Budget.find({
      userId: userId,
      startDate: { $lte: now },
      endDate: { $gte: now }
    });

    // Get active goals
    const activeGoals = await Goal.find({
      userId: userId,
      isCompleted: false,
      deadline: { $gte: now }
    });

    // Calculate budget progress
    const budgetProgress = await Promise.all(
      activeBudgets.map(async (budget) => {
        const spent = await Transaction.aggregate([
          {
            $match: {
              userId: userId,
              type: 'expense',
              category: budget.category,
              date: { $gte: budget.startDate, $lte: budget.endDate },
              isExcluded: { $ne: true }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' }
            }
          }
        ]);

        const spentAmount = spent.length > 0 ? spent[0].total : 0;
        const percentage = (spentAmount / budget.amount) * 100;

        return {
          _id: budget._id,
          name: budget.name,
          category: budget.category,
          limit: budget.amount,
          spent: spentAmount,
          remaining: Math.max(0, budget.amount - spentAmount),
          percentage: percentage,
          status: percentage >= 100 ? 'exceeded' : percentage >= 90 ? 'critical' : percentage >= 70 ? 'warning' : 'good'
        };
      })
    );

    // Calculate recent transactions
    const recentTransactions = await Transaction.find({
      userId: userId,
      isExcluded: { $ne: true }
    })
    .sort({ date: -1 })
    .limit(5)
    .select('date amount type category description');

    // Calculate financial summary
    const income = monthlyTransactions.find(t => t._id === 'income')?.total || 0;
    const expenses = monthlyTransactions.find(t => t._id === 'expense')?.total || 0;
    const net = income - expenses;
    const savingsRate = income > 0 ? (net / income) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          income,
          expenses,
          net,
          savingsRate,
          transactionCount: monthlyTransactions.reduce((sum, t) => sum + t.count, 0)
        },
        budgets: {
          active: activeBudgets.length,
          progress: budgetProgress
        },
        goals: {
          active: activeGoals.length,
          completed: activeGoals.filter(g => g.isCompleted).length
        },
        recentTransactions
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
exports.updatePreferences = async (req, res, next) => {
  try {
    const { preferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: { preferences }
      },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          preferences: user.preferences
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
exports.deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Start a session for transaction
    const session = await User.startSession();
    session.startTransaction();

    try {
      // Delete user data in transaction
      await Promise.all([
        Transaction.deleteMany({ userId }).session(session),
        Budget.deleteMany({ userId }).session(session),
        Goal.deleteMany({ userId }).session(session),
        User.findByIdAndDelete(userId).session(session)
      ]);

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        success: true,
        message: 'Account and all associated data deleted successfully'
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, currency, timezone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        firstName,
        lastName,
        currency,
        timezone
      },
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};