const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      category,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      search
    } = req.query;

    // Build query
    let query = { userId: req.user.id };
    
    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = parseFloat(minAmount);
      if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
    }
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { merchant: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count for pagination
    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      pagination: {
        page: Number(page),
        pages: Math.ceil(total / limit)
      },
      data: {
        transactions
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
exports.getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        transaction
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create transaction
// @route   POST /api/transactions
// @access  Private
exports.createTransaction = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.userId = req.user.id;

    const transaction = await Transaction.create(req.body);

    // Update relevant budget if exists
    if (transaction.type === 'expense') {
      await updateBudgetSpent(transaction);
    }

    res.status(201).json({
      success: true,
      data: {
        transaction
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
exports.updateTransaction = async (req, res, next) => {
  try {
    let transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Store old amount and category for budget update
    const oldAmount = transaction.amount;
    const oldCategory = transaction.category;

    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    // Update budget if amount or category changed for expenses
    if (transaction.type === 'expense' && 
        (oldAmount !== transaction.amount || oldCategory !== transaction.category)) {
      await updateBudgetSpent(transaction, oldAmount, oldCategory);
    }

    res.status(200).json({
      success: true,
      data: {
        transaction
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
exports.deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Store amount and category for budget update
    const oldAmount = transaction.amount;
    const oldCategory = transaction.category;

    await Transaction.findByIdAndDelete(req.params.id);

    // Update budget if it was an expense
    if (transaction.type === 'expense') {
      await revertBudgetSpent(transaction, oldAmount, oldCategory);
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transaction statistics
// @route   GET /api/transactions/stats/summary
// @access  Private
exports.getTransactionStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchStage = {
      userId: req.user.id,
      isExcluded: { $ne: true }
    };

    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    const stats = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          average: { $avg: '$amount' }
        }
      }
    ]);

    // Format response
    const income = stats.find(s => s._id === 'income') || { total: 0, count: 0, average: 0 };
    const expense = stats.find(s => s._id === 'expense') || { total: 0, count: 0, average: 0 };
    
    const net = income.total - expense.total;

    res.status(200).json({
      success: true,
      data: {
        income: income.total,
        expense: expense.total,
        net,
        transactionCount: income.count + expense.count,
        averageIncome: income.average,
        averageExpense: expense.average
      }
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to update budget spent amount
async function updateBudgetSpent(transaction, oldAmount = 0, oldCategory = null) {
  try {
    const now = new Date();
    const budgetQuery = {
      userId: transaction.userId,
      category: transaction.category,
      startDate: { $lte: now },
      endDate: { $gte: now }
    };

    const budget = await Budget.findOne(budgetQuery);
    
    if (budget) {
      let updateAmount = transaction.amount;
      
      // If updating existing transaction, calculate the difference
      if (oldAmount > 0) {
        updateAmount = transaction.amount - oldAmount;
      }

      await Budget.findByIdAndUpdate(budget._id, {
        $inc: { spent: updateAmount }
      });
    }
  } catch (error) {
    console.error('Error updating budget:', error);
  }
}

// Helper function to revert budget spent amount
async function revertBudgetSpent(transaction, oldAmount, oldCategory) {
  try {
    const now = new Date();
    const budgetQuery = {
      userId: transaction.userId,
      category: transaction.category,
      startDate: { $lte: now },
      endDate: { $gte: now }
    };

    const budget = await Budget.findOne(budgetQuery);
    
    if (budget) {
      await Budget.findByIdAndUpdate(budget._id, {
        $inc: { spent: -oldAmount }
      });
    }
  } catch (error) {
    console.error('Error reverting budget:', error);
  }
}