const axios = require('axios');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

// @desc    Get AI insights
// @route   GET /api/insights
// @access  Private
exports.getInsights = async (req, res, next) => {
  try {
    // Get recent transactions (last 90 days)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);

    const transactions = await Transaction.find({
      userId: req.user.id,
      date: { $gte: startDate }
    }).sort({ date: -1 });

    if (transactions.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          insights: [],
          trends: {},
          anomalies: [],
          recommendations: []
        }
      });
    }

    // Prepare data for AI service
    const transactionData = transactions.map(t => ({
      id: t._id.toString(),
      amount: t.amount,
      type: t.type,
      category: t.category,
      date: t.date.toISOString(),
      description: t.description
    }));

    try {
      // Call AI service
      const aiResponse = await axios.post(
        `${process.env.AI_SERVICE_URL}/api/insights/generate`,
        {
          transactions: transactionData,
          user_id: req.user.id,
          timeframe: '90d'
        }
      );

      res.status(200).json({
        success: true,
        data: aiResponse.data
      });
    } catch (aiError) {
      console.error('AI service error:', aiError);
      // Fallback to basic insights if AI service is down
      const basicInsights = await generateBasicInsights(req.user.id);
      res.status(200).json({
        success: true,
        data: basicInsights
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get spending forecast
// @route   GET /api/insights/forecast
// @access  Private
exports.getForecast = async (req, res, next) => {
  try {
    // Get historical data (last 6 months)
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);

    const transactions = await Transaction.find({
      userId: req.user.id,
      date: { $gte: startDate },
      type: 'expense'
    }).sort({ date: 1 });

    if (transactions.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient data for forecasting'
      });
    }

    const historicalData = transactions.map(t => ({
      date: t.date.toISOString(),
      amount: t.amount,
      category: t.category
    }));

    try {
      // Call AI service for forecasting
      const aiResponse = await axios.post(
        `${process.env.AI_SERVICE_URL}/api/forecast/spending`,
        {
          historical_data: historicalData,
          periods: 30
        }
      );

      res.status(200).json({
        success: true,
        data: aiResponse.data
      });
    } catch (aiError) {
      console.error('AI service error:', aiError);
      res.status(500).json({
        success: false,
        message: 'Forecasting service temporarily unavailable'
      });
    }
  } catch (error) {
    next(error);
  }
};

// Helper function to generate basic insights when AI service is unavailable
async function generateBasicInsights(userId) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  // Get transactions from the last 30 days
  const transactions = await Transaction.find({
    userId,
    date: { $gte: startDate }
  });

  const expenses = transactions.filter(t => t.type === 'expense');
  const income = transactions.filter(t => t.type === 'income');

  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);

  // Group expenses by category
  const categorySpending = {};
  expenses.forEach(t => {
    categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
  });

  const topCategory = Object.keys(categorySpending).reduce((a, b) => 
    categorySpending[a] > categorySpending[b] ? a : b, null);

  const insights = [];

  if (totalIncome > 0) {
    const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;
    insights.push({
      type: 'savings_rate',
      title: 'Savings Rate',
      message: `Your savings rate is ${savingsRate.toFixed(1)}% this month.`,
      confidence: 0.8,
      data: { savingsRate }
    });
  }

  if (topCategory) {
    insights.push({
      type: 'top_category',
      title: 'Top Spending Category',
      message: `Your highest spending is in ${topCategory}.`,
      confidence: 0.9,
      data: { category: topCategory, amount: categorySpending[topCategory] }
    });
  }

  // Compare with previous month
  const prevStartDate = new Date(startDate);
  prevStartDate.setMonth(prevStartDate.getMonth() - 1);
  const prevTransactions = await Transaction.find({
    userId,
    date: { $gte: prevStartDate, $lt: startDate }
  });

  const prevExpenses = prevTransactions.filter(t => t.type === 'expense');
  const prevTotalExpenses = prevExpenses.reduce((sum, t) => sum + t.amount, 0);

  if (prevTotalExpenses > 0) {
    const change = ((totalExpenses - prevTotalExpenses) / prevTotalExpenses) * 100;
    insights.push({
      type: 'spending_trend',
      title: 'Spending Trend',
      message: `Your spending is ${change >= 0 ? 'up' : 'down'} ${Math.abs(change).toFixed(1)}% from last month.`,
      confidence: 0.7,
      data: { change }
    });
  }

  return {
    insights,
    trends: {},
    anomalies: [],
    recommendations: []
  };
}