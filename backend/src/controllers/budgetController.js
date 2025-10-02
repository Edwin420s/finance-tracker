const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// @desc    Get all budgets for user
// @route   GET /api/budgets
// @access  Private
exports.getBudgets = async (req, res, next) => {
  try {
    const budgets = await Budget.find({ userId: req.user.id }).sort({ createdAt: -1 });

    // Calculate current spending for each budget
    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const startDate = getPeriodStartDate(budget.period);
        const endDate = getPeriodEndDate(budget.period);

        const spending = await Transaction.aggregate([
          {
            $match: {
              userId: req.user.id,
              type: 'expense',
              category: budget.category,
              date: { $gte: startDate, $lte: endDate },
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
        const updatedBudget = await Budget.findByIdAndUpdate(
          budget._id,
          { spent },
          { new: true }
        );

        return updatedBudget;
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
    req.body.startDate = getPeriodStartDate(period);
    req.body.endDate = getPeriodEndDate(period);

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

    // If period is changed, update dates
    if (req.body.period && req.body.period !== budget.period) {
      req.body.startDate = getPeriodStartDate(req.body.period);
      req.body.endDate = getPeriodEndDate(req.body.period);
    }

    budget = await Budget.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

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

// @desc    Get budget alerts
// @route   GET /api/budgets/alerts
// @access  Private
exports.getBudgetAlerts = async (req, res, next) => {
  try {
    const budgets = await Budget.find({ userId: req.user.id });
    const alerts = [];

    for (const budget of budgets) {
      const percentageUsed = (budget.spent / budget.amount) * 100;
      
      if (percentageUsed >= 100) {
        alerts.push({
          type: 'exceeded',
          budgetId: budget._id,
          budgetName: budget.name,
          category: budget.category,
          spent: budget.spent,
          limit: budget.amount,
          message: `Budget exceeded for ${budget.category}. Spent $${budget.spent} of $${budget.amount}`
        });
      } else if (percentageUsed >= 90) {
        alerts.push({
          type: 'critical',
          budgetId: budget._id,
          budgetName: budget.name,
          category: budget.category,
          spent: budget.spent,
          limit: budget.amount,
          percentage: percentageUsed,
          message: `Budget critical for ${budget.category}. ${percentageUsed.toFixed(1)}% used`
        });
      } else if (percentageUsed >= 70) {
        alerts.push({
          type: 'warning',
          budgetId: budget._id,
          budgetName: budget.name,
          category: budget.category,
          spent: budget.spent,
          limit: budget.amount,
          percentage: percentageUsed,
          message: `Budget warning for ${budget.category}. ${percentageUsed.toFixed(1)}% used`
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        alerts
      }
    });
  } catch (error) {
    next(error);
  }
};

// Helper functions for period calculations
function getPeriodStartDate(period) {
  const now = new Date();
  
  switch (period) {
    case 'weekly':
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      return startOfWeek;
      
    case 'monthly':
      return new Date(now.getFullYear(), now.getMonth(), 1);
      
    case 'yearly':
      return new Date(now.getFullYear(), 0, 1);
      
    default:
      return new Date(now.getFullYear(), now.getMonth(), 1);
  }
}

function getPeriodEndDate(period) {
  const now = new Date();
  
  switch (period) {
    case 'weekly':
      const endOfWeek = new Date(now);
      endOfWeek.setDate(now.getDate() + (6 - now.getDay()));
      endOfWeek.setHours(23, 59, 59, 999);
      return endOfWeek;
      
    case 'monthly':
      return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      
    case 'yearly':
      return new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      
    default:
      return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }
}