const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

// @desc    Get financial reports
// @route   GET /api/reports
// @access  Private
exports.getReports = async (req, res, next) => {
  try {
    const { startDate, endDate, reportType = 'monthly' } = req.query;

    // Set default date range if not provided
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();

    const matchStage = {
      userId: req.user.id,
      date: { $gte: start, $lte: end },
      isExcluded: { $ne: true }
    };

    // Get basic financial summary
    const summary = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const income = summary.find(s => s._id === 'income') || { total: 0, count: 0 };
    const expenses = summary.find(s => s._id === 'expense') || { total: 0, count: 0 };
    const netSavings = income.total - expenses.total;

    // Get category breakdown
    const categoryBreakdown = await Transaction.aggregate([
      { 
        $match: { 
          ...matchStage,
          type: 'expense'
        } 
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Calculate percentages
    const totalExpenses = expenses.total;
    const categoryBreakdownWithPercentages = categoryBreakdown.map(cat => ({
      name: cat._id,
      amount: cat.total,
      percentage: totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0
    }));

    // Get monthly trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrends = await Transaction.aggregate([
      {
        $match: {
          userId: req.user.id,
          date: { $gte: sixMonthsAgo, $lte: new Date() },
          isExcluded: { $ne: true }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $group: {
          _id: {
            year: '$_id.year',
            month: '$_id.month'
          },
          income: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'income'] }, '$total', 0]
            }
          },
          expenses: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'expense'] }, '$total', 0]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          month: {
            $dateToString: {
              format: '%Y-%m',
              date: {
                $dateFromParts: {
                  year: '$_id.year',
                  month: '$_id.month',
                  day: 1
                }
              }
            }
          },
          income: 1,
          expenses: 1,
          savings: { $subtract: ['$income', '$expenses'] },
          savingsRate: {
            $cond: [
              { $gt: ['$income', 0] },
              { $multiply: [{ $divide: [{ $subtract: ['$income', '$expenses'] }, '$income'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { month: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalIncome: income.total,
        totalExpenses: expenses.total,
        netSavings,
        transactionCount: income.count + expenses.count,
        categoryBreakdown: categoryBreakdownWithPercentages,
        monthlyTrends
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export reports
// @route   POST /api/reports/export
// @access  Private
exports.exportReports = async (req, res, next) => {
  try {
    const { format = 'csv', startDate, endDate } = req.body;

    // Set default date range if not provided
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();

    const transactions = await Transaction.find({
      userId: req.user.id,
      date: { $gte: start, $lte: end },
      isExcluded: { $ne: true }
    }).sort({ date: -1 });

    if (format === 'csv') {
      // Generate CSV
      const headers = 'Date,Description,Category,Type,Amount,Currency\n';
      const csvData = transactions.map(t => 
        `"${t.date.toISOString().split('T')[0]}","${t.description || ''}","${t.category}","${t.type}","${t.amount}","${t.currency}"`
      ).join('\n');
      
      const csv = headers + csvData;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=transactions-${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csv);
    } else if (format === 'pdf') {
      // For PDF, we would use a PDF generation library like pdfkit
      // This is a simplified version
      res.status(200).json({
        success: true,
        message: 'PDF export feature coming soon',
        data: { transactions }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Unsupported export format'
      });
    }
  } catch (error) {
    next(error);
  }
};