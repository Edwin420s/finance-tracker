const cron = require('node-cron');
const User = require('../models/User');
const NotificationService = require('../services/notificationService');

class WeeklySummariesJob {
  constructor() {
    this.job = null;
  }

  start() {
    // Run every Monday at 9 AM
    this.job = cron.schedule('0 9 * * 1', this.sendWeeklySummaries.bind(this), {
      scheduled: false,
      timezone: 'UTC'
    });

    this.job.start();
    console.log('📊 Weekly summaries job started');
  }

  stop() {
    if (this.job) {
      this.job.stop();
      console.log('📊 Weekly summaries job stopped');
    }
  }

  async sendWeeklySummaries() {
    try {
      console.log('📊 Sending weekly summaries...');
      
      const users = await User.find({
        'preferences.notifications.insights': true
      });

      let successCount = 0;
      let errorCount = 0;

      for (const user of users) {
        try {
          await NotificationService.sendWeeklySummary(user._id);
          successCount++;
        } catch (error) {
          console.error(`❌ Error sending weekly summary for user ${user._id}:`, error);
          errorCount++;
        }
      }

      console.log(`📊 Weekly summaries sent: ${successCount} successful, ${errorCount} errors`);
    } catch (error) {
      console.error('❌ Error in weekly summaries job:', error);
    }
  }
}

module.exports = WeeklySummariesJob;