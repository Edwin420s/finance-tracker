const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

// @desc    Generate financial report
// @route   GET /api/reports/summary
// @access  Private
exports.getFinancialSummary = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.query;

    // Set default date range (last 12 months)
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setFullYear(defaultStartDate.getFullYear() - 1);

    const dateFilter = {
      date: {
        $gte: startDate ? new Date(startDate) : defaultStartDate,
        $lte: endDate ? new Date(endDate) : defaultEndDate
      }
    };

    // Get transactions in the date range
    const transactions = await Transaction.find({
      userId: req.user.id,
      ...dateFilter
    });

    // Group transactions by time period and type
    const groupedData = groupTransactions(transactions, groupBy);

    // Calculate summary statistics
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netSavings = totalIncome - totalExpenses;

    // Get category breakdown
    const categoryBreakdown = getCategoryBreakdown(transactions);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalIncome,
          totalExpenses,
          netSavings,
          transactionCount: transactions.length
        },
        trends: groupedData,
        categoryBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export report as CSV
// @route   GET /api/reports/export
// @access  Private
exports.exportReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.date.$gte = new Date(startDate);
    if (endDate) dateFilter.date.$lte = new Date(endDate);

    const transactions = await Transaction.find({
      userId: req.user.id,
      ...dateFilter
    }).sort({ date: -1 });

    // Convert to CSV
    const csv = convertToCSV(transactions);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

// Helper function to group transactions by time period
function groupTransactions(transactions, groupBy) {
  const groups = {};

  transactions.forEach(transaction => {
    let key;
    const date = new Date(transaction.date);

    switch (groupBy) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'year':
        key = date.getFullYear().toString();
        break;
      default:
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    if (!groups[key]) {
      groups[key] = { income: 0, expense: 0 };
    }

    groups[key][transaction.type] += transaction.amount;
  });

  return groups;
}

// Helper function to get category breakdown
function getCategoryBreakdown(transactions) {
  const breakdown = {};

  transactions.forEach(transaction => {
    if (transaction.type === 'expense') {
      if (!breakdown[transaction.category]) {
        breakdown[transaction.category] = 0;
      }
      breakdown[transaction.category] += transaction.amount;
    }
  });

  return breakdown;
}

// Helper function to convert transactions to CSV
function convertToCSV(transactions) {
  const headers = ['Date', 'Type', 'Category', 'Amount', 'Description', 'Merchant'];
  const rows = transactions.map(t => [
    t.date.toISOString().split('T')[0],
    t.type,
    t.category,
    t.amount,
    t.description || '',
    t.merchant || ''
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
}