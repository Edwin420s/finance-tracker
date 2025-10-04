const cron = require('node-cron');
const InsightService = require('../services/insightService');
const User = require('../models/User');

class InsightGenerationJob {
  constructor() {
    this.job = null;
  }

  start() {
    // Run every day at 2 AM
    this.job = cron.schedule('0 2 * * *', this.generateInsightsForAllUsers.bind(this), {
      scheduled: false,
      timezone: 'UTC'
    });

    this.job.start();
    console.log(' Insight generation job started');
  }

  stop() {
    if (this.job) {
      this.job.stop();
      console.log(' Insight generation job stopped');
    }
  }

  async generateInsightsForAllUsers() {
    try {
      console.log(' Starting insight generation for all users...');
      
      const users = await User.find({});
      let successCount = 0;
      let errorCount = 0;

      for (const user of users) {
        try {
          const insightService = new InsightService(user._id);
          await insightService.generateAllInsights();
          successCount++;
        } catch (error) {
          console.error(` Error generating insights for user ${user._id}:`, error);
          errorCount++;
        }
      }

      console.log(` Insight generation completed: ${successCount} successful, ${errorCount} errors`);
    } catch (error) {
      console.error(' Error in insight generation job:', error);
    }
  }
}

module.exports = InsightGenerationJob;
