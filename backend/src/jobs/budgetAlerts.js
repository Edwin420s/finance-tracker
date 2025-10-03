const cron = require('node-cron');
const Budget = require('../models/Budget');
const NotificationService = require('../services/notificationService');

class BudgetAlertsJob {
  constructor() {
    this.job = null;
  }

  start() {
    // Run every hour
    this.job = cron.schedule('0 * * * *', this.checkBudgetAlerts.bind(this), {
      scheduled: false,
      timezone: 'UTC'
    });

    this.job.start();
    console.log('💰 Budget alerts job started');
  }

  stop() {
    if (this.job) {
      this.job.stop();
      console.log('💰 Budget alerts job stopped');
    }
  }

  async checkBudgetAlerts() {
    try {
      console.log('💰 Checking budget alerts...');
      
      const budgets = await Budget.find({}).populate('userId');
      let alertCount = 0;

      for (const budget of budgets) {
        if (!budget.userId) continue;

        const percentageUsed = (budget.spent / budget.amount) * 100;
        let alertType = null;

        if (percentageUsed >= 100) {
          alertType = 'exceeded';
        } else if (percentageUsed >= 90) {
          alertType = 'critical';
        } else if (percentageUsed >= 70) {
          alertType = 'warning';
        }

        if (alertType) {
          await NotificationService.sendBudgetAlert(budget.userId._id, budget, alertType);
          alertCount++;
        }
      }

      console.log(`💰 Budget alerts sent: ${alertCount} alerts`);
    } catch (error) {
      console.error('❌ Error in budget alerts job:', error);
    }
  }
}

module.exports = BudgetAlertsJob;