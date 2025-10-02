const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// @desc    Get all budgets for a user
// @route   GET /api/budgets
// @access  Private
exports.getBudgets = async (req, res, next) => {
  try {
    const budgets = await Budget.find({ userId: req.user.id }).sort({ createdAt: -1 });

    // Calculate current spending for each budget
    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const now = new Date();
        const startOfPeriod = getStartOfPeriod(budget.period, now);
        const endOfPeriod = getEndOfPeriod(budget.period, now);

        const spending = await Transaction.aggregate([
          {
            $match: {
              userId: req.user.id,
              type: 'expense',
              category: budget.category,
              date: { $gte: startOfPeriod, $lte: endOfPeriod },
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

        const spent = spending.length > 0 ? spending[0].total : 0;
        budget.spent = spent;

        return budget;
      })
    );

    res.status(200).json({
      success: true,
      count: budgetsWithSpending.length,
      data: {
        budgets: budgetsWithSpending
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single budget
// @route   GET /api/budgets/:id
// @access  Private
exports.getBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Calculate current spending for the budget
    const now = new Date();
    const startOfPeriod = getStartOfPeriod(budget.period, now);
    const endOfPeriod = getEndOfPeriod(budget.period, now);

    const spending = await Transaction.aggregate([
      {
        $match: {
          userId: req.user.id,
          type: 'expense',
          category: budget.category,
          date: { $gte: startOfPeriod, $lte: endOfPeriod },
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

    const spent = spending.length > 0 ? spending[0].total : 0;
    budget.spent = spent;

    res.status(200).json({
      success: true,
      data: {
        budget
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create budget
// @route   POST /api/budgets
// @access  Private
exports.createBudget = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.userId = req.user.id;

    // Set start and end dates based on period
    const { period } = req.body;
    const now = new Date();
    req.body.startDate = getStartOfPeriod(period, now);
    req.body.endDate = getEndOfPeriod(period, now);

    const budget = await Budget.create(req.body);

    res.status(201).json({
      success: true,
      data: {
        budget
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
exports.updateBudget = async (req, res, next) => {
  try {
    let budget = await Budget.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // If period is being updated, adjust start and end dates
    if (req.body.period && req.body.period !== budget.period) {
      const now = new Date();
      req.body.startDate = getStartOfPeriod(req.body.period, now);
      req.body.endDate = getEndOfPeriod(req.body.period, now);
    }

    budget = await Budget.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: {
        budget
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
exports.deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    await Budget.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// Helper functions to calculate period start and end dates
function getStartOfPeriod(period, date) {
  const start = new Date(date);
  switch (period) {
    case 'weekly':
      start.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      break;
    case 'monthly':
      start.setDate(1); // Start of month
      break;
    case 'yearly':
      start.setMonth(0, 1); // Start of year
      break;
    default:
      throw new Error('Invalid period');
  }
  start.setHours(0, 0, 0, 0);
  return start;
}

function getEndOfPeriod(period, date) {
  const end = new Date(date);
  switch (period) {
    case 'weekly':
      end.setDate(date.getDate() + (6 - date.getDay())); // End of week (Saturday)
      break;
    case 'monthly':
      end.setMonth(date.getMonth() + 1, 0); // Last day of the month
      break;
    case 'yearly':
      end.setMonth(11, 31); // Last day of the year
      break;
    default:
      throw new Error('Invalid period');
  }
  end.setHours(23, 59, 59, 999);
  return end;
}