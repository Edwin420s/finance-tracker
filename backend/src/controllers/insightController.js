const axios = require('axios');
const Transaction = require('../models/Transaction');

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
  } catch (error) {
    console.error('Error getting insights:', error);
    
    // If AI service is down, return basic insights
    const basicInsights = await generateBasicInsights(req.user.id);
    res.status(200).json({
      success: true,
      data: basicInsights
    });
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

    // Call AI service for forecasting
    const aiResponse = await axios.post(
      `${process.env.AI_SERVICE_URL}/api/forecast/spending`,
      {
        historical_data: historicalData,
        periods: 30 // Forecast next 30 days
      }
    );

    res.status(200).json({
      success: true,
      data: aiResponse.data
    });
  } catch (error) {
    console.error('Error getting forecast:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating forecast'
    });
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

  return {
    insights,
    trends: {},
    anomalies: [],
    recommendations: []
  };
}