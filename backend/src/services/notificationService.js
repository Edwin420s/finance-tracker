const Notification = require('../models/Notification');
const User = require('../models/User');

class NotificationService {
  static async sendBudgetAlert(userId, budget, alertType) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      // Check user preferences
      if (!user.preferences?.notifications?.budgetAlerts) {
        return;
      }

      await Notification.createBudgetAlert(userId, budget, alertType);

      // In a real application, you would also send email/push notifications here
      console.log(`Budget alert sent to user ${userId}: ${alertType} for ${budget.category}`);
    } catch (error) {
      console.error('Error sending budget alert:', error);
    }
  }

  static async sendGoalProgress(userId, goal, progress) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      if (!user.preferences?.notifications?.goalUpdates) {
        return;
      }

      let message, priority;
      
      if (progress >= 100) {
        message = `Congratulations! You've reached your goal: ${goal.title}`;
        priority = 'high';
      } else if (progress >= 75) {
        message = `You're ${progress.toFixed(1)}% towards your goal: ${goal.title}`;
        priority = 'medium';
      } else {
        return; // Only notify for significant progress
      }

      await Notification.create({
        userId,
        type: 'goal',
        title: 'Goal Progress',
        message,
        data: {
          goalId: goal._id,
          goalTitle: goal.title,
          progress,
          targetAmount: goal.targetAmount,
          currentAmount: goal.currentAmount
        },
        priority,
        actionUrl: '/goals'
      });

    } catch (error) {
      console.error('Error sending goal progress notification:', error);
    }
  }

  static async sendWeeklySummary(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      if (!user.preferences?.notifications?.insights) {
        return;
      }

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const Transaction = require('../models/Transaction');
      const weeklyData = await Transaction.aggregate([
        {
          $match: {
            userId,
            date: { $gte: oneWeekAgo }
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

      const income = weeklyData.find(d => d._id === 'income')?.total || 0;
      const expenses = weeklyData.find(d => d._id === 'expense')?.total || 0;
      const net = income - expenses;

      let message = `Last week: Income: $${income.toFixed(2)}, Expenses: $${expenses.toFixed(2)}. `;
      
      if (net > 0) {
        message += `You saved $${net.toFixed(2)}. Great job!`;
      } else {
        message += `You overspent by $${Math.abs(net).toFixed(2)}.`;
      }

      await Notification.create({
        userId,
        type: 'insight',
        title: 'Weekly Summary',
        message,
        data: { income, expenses, net, period: 'weekly' },
        priority: 'low',
        expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days
      });

    } catch (error) {
      console.error('Error sending weekly summary:', error);
    }
  }
}

module.exports = NotificationService;