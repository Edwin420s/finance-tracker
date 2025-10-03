const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Insight = require('../models/Insight');

class InsightService {
  constructor(userId) {
    this.userId = userId;
  }

  async generateAllInsights() {
    try {
      const insights = [];

      // Generate different types of insights
      insights.push(...await this.generateSpendingTrends());
      insights.push(...await this.generateBudgetInsights());
      insights.push(...await this.generateSavingsInsights());
      insights.push(...await this.generateCategoryInsights());
      insights.push(...await this.generateAnomalyInsights());

      // Save insights to database
      await Insight.insertMany(insights);

      return insights;
    } catch (error) {
      console.error('Error generating insights:', error);
      throw error;
    }
  }

  async generateSpendingTrends() {
    const insights = [];
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await Transaction.aggregate([
      {
        $match: {
          userId: this.userId,
          date: { $gte: sixMonthsAgo },
          type: 'expense'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    if (monthlyData.length >= 2) {
      const current = monthlyData[monthlyData.length - 1];
      const previous = monthlyData[monthlyData.length - 2];
      
      const change = ((current.total - previous.total) / previous.total) * 100;

      if (Math.abs(change) > 10) {
        insights.push({
          userId: this.userId,
          type: 'trend',
          title: 'Spending Trend',
          message: `Your spending ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change).toFixed(1)}% compared to last month.`,
          data: { change, current: current.total, previous: previous.total },
          confidence: 0.85,
          isActionable: Math.abs(change) > 20,
          impact: Math.abs(change) > 30 ? 'high' : 'medium'
        });
      }
    }

    return insights;
  }

  async generateBudgetInsights() {
    const insights = [];
    const budgets = await Budget.find({ userId: this.userId });

    for (const budget of budgets) {
      const percentageUsed = (budget.spent / budget.amount) * 100;

      if (percentageUsed > 90) {
        insights.push({
          userId: this.userId,
          type: 'recommendation',
          title: 'Budget Nearly Exhausted',
          message: `Your ${budget.category} budget is ${percentageUsed.toFixed(1)}% used. Consider adjusting your spending or budget.`,
          data: { budgetId: budget._id, category: budget.category, percentageUsed },
          confidence: 0.95,
          isActionable: true,
          impact: 'high',
          category: budget.category
        });
      }
    }

    return insights;
  }

  async generateSavingsInsights() {
    const insights = [];
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const financialData = await Transaction.aggregate([
      {
        $match: {
          userId: this.userId,
          date: { $gte: lastMonth }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    const income = financialData.find(d => d._id === 'income')?.total || 0;
    const expenses = financialData.find(d => d._id === 'expense')?.total || 0;
    
    if (income > 0) {
      const savingsRate = ((income - expenses) / income) * 100;

      if (savingsRate < 10) {
        insights.push({
          userId: this.userId,
          type: 'recommendation',
          title: 'Low Savings Rate',
          message: `Your savings rate is ${savingsRate.toFixed(1)}%. Aim for at least 20% to build financial security.`,
          data: { savingsRate, income, expenses },
          confidence: 0.9,
          isActionable: true,
          impact: 'high'
        });
      }

      if (savingsRate > 30) {
        insights.push({
          userId: this.userId,
          type: 'trend',
          title: 'Excellent Savings',
          message: `Great job! Your savings rate is ${savingsRate.toFixed(1)}%, well above the recommended 20%.`,
          data: { savingsRate },
          confidence: 0.95,
          isActionable: false,
          impact: 'low'
        });
      }
    }

    return insights;
  }

  async generateCategoryInsights() {
    const insights = [];
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const categoryData = await Transaction.aggregate([
      {
        $match: {
          userId: this.userId,
          date: { $gte: lastMonth },
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

    if (categoryData.length > 0) {
      const topCategory = categoryData[0];
      const totalExpenses = categoryData.reduce((sum, cat) => sum + cat.total, 0);
      const percentage = (topCategory.total / totalExpenses) * 100;

      if (percentage > 30) {
        insights.push({
          userId: this.userId,
          type: 'recommendation',
          title: 'High Spending Category',
          message: `Your ${topCategory._id} spending accounts for ${percentage.toFixed(1)}% of total expenses. Consider if this aligns with your priorities.`,
          data: { category: topCategory._id, percentage, amount: topCategory.total },
          confidence: 0.8,
          isActionable: true,
          impact: 'medium',
          category: topCategory._id
        });
      }
    }

    return insights;
  }

  async generateAnomalyInsights() {
    const insights = [];
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    // Find unusually large transactions
    const largeTransactions = await Transaction.aggregate([
      {
        $match: {
          userId: this.userId,
          date: { $gte: last30Days },
          type: 'expense'
        }
      },
      {
        $group: {
          _id: '$category',
          avgAmount: { $avg: '$amount' },
          stdDev: { $stdDevPop: '$amount' }
        }
      }
    ]);

    for (const stat of largeTransactions) {
      if (stat.stdDev) {
        const anomalies = await Transaction.find({
          userId: this.userId,
          date: { $gte: last30Days },
          category: stat._id,
          type: 'expense',
          amount: { $gt: stat.avgAmount + (2 * stat.stdDev) }
        });

        for (const transaction of anomalies) {
          insights.push({
            userId: this.userId,
            type: 'anomaly',
            title: 'Unusual Transaction',
            message: `Unusually large ${transaction.category} transaction: $${transaction.amount}. This is significantly higher than your average.`,
            data: {
              transactionId: transaction._id,
              amount: transaction.amount,
              category: transaction.category,
              date: transaction.date,
              zScore: (transaction.amount - stat.avgAmount) / stat.stdDev
            },
            confidence: 0.75,
            isActionable: true,
            impact: 'medium',
            category: transaction.category
          });
        }
      }
    }

    return insights;
  }
}

module.exports = InsightService;